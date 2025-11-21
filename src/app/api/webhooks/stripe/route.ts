import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { 
  createEsimPurchase, 
  getEsimPackage, 
  getBalance,
  queryEsimProfiles,
  parseProviderPrice
} from "@/lib/esimcard";
import { supabaseAdmin as supabase, isSupabaseReady } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";
import { retryWithBackoff } from "@/lib/retry";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function fetchActivationWithRetry(simId?: string) {
  if (!simId) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await queryEsimProfiles(simId);
      if (result?.activation) {
        return result.activation;
      }
    } catch (error) {
      console.error('[Stripe Webhook] Activation fetch failed:', error);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return null;
}

/**
 * Process payment and fulfill eSIM purchase
 */
async function processPaymentAndFulfill(
  paymentIntent: Stripe.PaymentIntent,
  overrideMetadata: Record<string, string> = {}
) {
  const mergedMetadata = {
    ...(paymentIntent.metadata || {}),
    ...overrideMetadata,
  };

  const offerId = mergedMetadata.offerId;
  if (!offerId) {
    throw new Error("Missing required metadata: offerId");
  }

  const chargesData = paymentIntent.charges?.data?.[0];
  const recipientEmail =
    mergedMetadata.recipientEmail ||
    paymentIntent.receipt_email ||
    chargesData?.billing_details?.email;

  if (!recipientEmail) {
    throw new Error("Missing customer email from Stripe payment details");
  }

  const fullName =
    mergedMetadata.fullName ||
    chargesData?.billing_details?.name ||
    "Valued Traveler";

  const productName = mergedMetadata.productName || 'eSIM Plan';

  // Use provided transactionId or generate one
  const providedTransactionId = mergedMetadata.transactionId;
  const transactionId = providedTransactionId || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const priceInCents = paymentIntent.amount;
  const currencyCode = (paymentIntent.currency || 'usd').toUpperCase();
  const userId = mergedMetadata.userId;
  const paymentIntentId = paymentIntent.id;

  console.log('[Stripe Webhook] Processing payment fulfillment:', {
    transactionId,
    offerId,
    paymentIntentId,
    amount: priceInCents,
    currency: currencyCode
  });

  // Step 1: Get package details to determine provider cost
  console.log('[Stripe Webhook] Fetching package details from provider...');
  const packageData = await getEsimPackage(offerId);
  
  if (!packageData) {
    throw new Error(`Package not found: ${offerId}`);
  }
  
  const divisor = packageData.price.currencyDivisor || 100;
  const providerCostInCents = Math.round((packageData.price.fixed / divisor) * 100);
  const providerCurrency = (packageData.price.currency || currencyCode).toUpperCase();
  const packageCode = packageData.packageCode || packageData.slug || offerId;

  console.log('[Stripe Webhook] Package cost:', {
    providerCostInCents,
    providerCurrency,
    sellingPrice: priceInCents,
    profit: priceInCents - providerCostInCents,
    packageCode
  });

  // Step 2: Save purchase record to esim_purchases table
  if (isSupabaseReady()) {
    const { error: dbError } = await supabase
      .from('esim_purchases')
      .insert({
        user_id: userId || 'anonymous',
        offer_id: offerId,
        price: priceInCents,
        currency: currencyCode,
        esim_provider_cost: providerCostInCents,
        transaction_id: transactionId,
        stripe_payment_intent_id: paymentIntentId,
        stripe_payment_status: 'succeeded',
        esim_provider_status: 'pending',
        order_no: null, // Will be set after order creation
      });

    if (dbError) {
      console.error("[Stripe Webhook] Database error:", dbError);
      // Continue processing even if DB insert fails
    }
  }

  // Step 3: Check account balance (if applicable)
  try {
    console.log('[Stripe Webhook] Checking eSIMCard account balance...');
    const balance = await getBalance();
    const currentBalance = balance.balance || 0;
    const balanceCurrency = (balance.currency || providerCurrency).toUpperCase();
    
    const balanceInCents = Math.round(parseProviderPrice(currentBalance) * 100);

    console.log('[Stripe Webhook] Account balance:', {
      currentBalance: balanceInCents,
      balanceCurrency,
      required: providerCostInCents,
      sufficient: balanceInCents >= providerCostInCents
    });

    if (balanceInCents < providerCostInCents) {
      console.error('[Stripe Webhook] Insufficient account balance');
      
      // Update DB with failure
      if (isSupabaseReady()) {
        await supabase
          .from('esim_purchases')
          .update({ 
            esim_provider_status: 'insufficient_balance',
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
      }

      // Initiate refund
      try {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'requested_by_customer',
          metadata: {
            reason: 'esimcard_insufficient_balance',
            transactionId
          }
        });
        console.log('[Stripe Webhook] Refund initiated due to insufficient balance');
      } catch (refundError) {
        console.error('[Stripe Webhook] Failed to initiate refund:', refundError);
      }

      throw new Error(`Insufficient eSIMCard account balance. Required: ${providerCostInCents} ${balanceCurrency}, Available: ${balanceInCents} ${balanceCurrency}`);
    }
  } catch (balanceError) {
    console.error('[Stripe Webhook] Balance check failed:', balanceError);
    // If balance check fails, we'll still attempt purchase (it will fail if insufficient)
    // but log the error
  }

  // Step 4: Purchase eSIM from provider
  console.log('[Stripe Webhook] Purchasing eSIM from provider...');
  let purchaseResult;
  try {
    purchaseResult = await retryWithBackoff(
      () =>
        createEsimPurchase({
          packageCode,
          transactionId,
          travelerName: fullName,
          travelerEmail: recipientEmail,
        }),
      3,
      1000
    );
  } catch (purchaseError) {
    console.error('[Stripe Webhook] eSIM purchase failed:', purchaseError);

    if (isSupabaseReady()) {
      await supabase
        .from('esim_purchases')
        .update({
          esim_provider_status: 'purchase_failed',
          updated_at: new Date().toISOString(),
        })
        .eq('transaction_id', transactionId);
    }

    try {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
        metadata: {
          reason: 'esimcard_purchase_failed',
          transactionId,
        },
      });
      console.log('[Stripe Webhook] Refund initiated due to purchase failure');
    } catch (refundError) {
      console.error('[Stripe Webhook] Failed to initiate refund:', refundError);
    }

    throw purchaseError;
  }

  const orderNo = purchaseResult.orderId || null;
  let activation = purchaseResult.activation;
  if (!activation && purchaseResult.simId) {
    activation = await fetchActivationWithRetry(purchaseResult.simId);
  }

  const providerStatus = activation ? 'GOT_RESOURCE' : 'PROCESSING';

  if (isSupabaseReady()) {
    await supabase
      .from('esim_purchases')
      .update({
        order_no: orderNo,
        esim_provider_status: providerStatus,
        esim_provider_response: purchaseResult.raw,
        confirmation: activation,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transactionId);
  }

  if (activation && isSupabaseReady()) {
    await supabase
      .from('activation_details')
      .upsert(
        {
          transaction_id: transactionId,
          smdp_address: activation.smdpAddress || null,
          activation_code: activation.activationCode || activation.universalLink || null,
          iccid: activation.iccid || null,
          confirmation_data: activation,
        },
        { onConflict: 'transaction_id' }
      );
  }

  try {
    const priceAmount = priceInCents / 100;
    await sendOrderConfirmation({
      to: recipientEmail,
      customerName: fullName,
      transactionId,
      productName,
      price: `${currencyCode} ${priceAmount.toFixed(2)}`,
    });
    console.log('[Stripe Webhook] Order confirmation email sent');
  } catch (emailError) {
    console.error('[Stripe Webhook] Failed to send email:', emailError);
  }

  return {
    transactionId,
    orderNo,
    status: providerStatus,
    activation,
  };
}

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events (payment success, etc.)
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("[Stripe Webhook] No signature found");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: `Webhook signature verification failed` },
      { status: 400 }
    );
  }

  console.log('[Stripe Webhook] Received event:', event.type);

  // Handle the payment_intent.succeeded event (for embedded checkout)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log('[Stripe Webhook] Payment intent succeeded:', paymentIntent.id);

    try {
      const result = await processPaymentAndFulfill(paymentIntent);

      return NextResponse.json({
        received: true,
        ...result
      });
    } catch (error) {
      console.error("[Stripe Webhook] Error processing payment:", error);
      return NextResponse.json(
        { 
          error: "Failed to process payment",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }

  // Handle the checkout.session.completed event (for Stripe Checkout redirect)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('[Stripe Webhook] Payment successful for session:', session.id);

    try {
      // Retrieve payment intent to get full details
      const paymentIntentId = session.payment_intent as string;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const result = await processPaymentAndFulfill(paymentIntent, {
        ...(session.metadata || {}),
        ...(session.customer_details?.email && { recipientEmail: session.customer_details.email }),
        ...(session.customer_details?.name && { fullName: session.customer_details.name || '' }),
      });

      return NextResponse.json({
        received: true,
        ...result
      });
    } catch (error) {
      console.error("[Stripe Webhook] Error processing payment:", error);
      return NextResponse.json(
        { 
          error: "Failed to process payment",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }

  // Return a 200 response for other event types
  return NextResponse.json({ received: true });
}
