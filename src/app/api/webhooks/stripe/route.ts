import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { 
  createEsimPurchase, 
  getEsimOffer, 
  getWalletBalance, 
  topUpWallet,
  getEsimQRCode 
} from "@/lib/zendit";
import { supabaseAdmin as supabase, isSupabaseReady } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";
import { 
  createVirtualCardForTopUp, 
  isStripeIssuingAvailable 
} from "@/lib/stripe-issuing";
import { retryWithBackoff } from "@/lib/retry";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Process payment and fulfill eSIM purchase with wallet top-up flow
 */
async function processPaymentAndFulfill(
  paymentIntentId: string,
  metadata: Record<string, string>,
  amount: number,
  currency: string,
  userId?: string
) {
  const { offerId, recipientEmail, fullName, productName, transactionId: providedTransactionId } = metadata;

  if (!offerId || !recipientEmail || !fullName) {
    throw new Error("Missing required metadata: offerId, recipientEmail, fullName");
  }

  // Use provided transactionId or generate one
  const transactionId = providedTransactionId || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const priceInCents = amount;
  const currencyCode = currency.toUpperCase();

  console.log('[Stripe Webhook] Processing payment fulfillment:', {
    transactionId,
    offerId,
    paymentIntentId,
    amount: priceInCents,
    currency: currencyCode
  });

  // Step 1: Get offer details to determine Zendit cost
  console.log('[Stripe Webhook] Fetching offer details from Zendit...');
  const offer = await getEsimOffer(offerId);
  
  // Calculate Zendit cost in cents
  // Zendit cost structure: offer.cost.fixed / offer.cost.currencyDivisor
  const zenditCostFixed = offer.cost?.fixed || 0;
  const zenditCostDivisor = offer.cost?.currencyDivisor || 100;
  const zenditCostInCents = Math.round((zenditCostFixed / zenditCostDivisor) * 100);
  const zenditCurrency = (offer.cost?.currency || currencyCode).toUpperCase();

  console.log('[Stripe Webhook] Offer cost:', {
    zenditCostInCents,
    zenditCurrency,
    sellingPrice: priceInCents,
    profit: priceInCents - zenditCostInCents
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
        zendit_cost: zenditCostInCents,
        transaction_id: transactionId,
        stripe_payment_intent_id: paymentIntentId,
        stripe_payment_status: 'succeeded',
        zendit_status: 'pending',
      });

    if (dbError) {
      console.error("[Stripe Webhook] Database error:", dbError);
      // Continue processing even if DB insert fails
    }
  }

  // Step 3: Check Zendit wallet balance and top up if needed
  // NOTE: Zendit wallet API endpoints (/wallet/balance, /wallet/topup) do not exist
  // Wallet must be pre-funded manually via Zendit dashboard
  // Stripe Issuing wallet top-up flow is disabled until Zendit adds wallet API
  
  let issuingCardId: string | null = null;
  const enableWalletTopUp = process.env.ENABLE_ZENDIT_WALLET_TOPUP === "true";
  
  if (enableWalletTopUp && isStripeIssuingAvailable()) {
    try {
      console.log('[Stripe Webhook] Checking Zendit wallet balance...');
      const walletBalance = await getWalletBalance();
      const currentBalance = walletBalance.balance || 0;
      const balanceCurrency = (walletBalance.currency || zenditCurrency).toUpperCase();

      console.log('[Stripe Webhook] Wallet balance:', {
        currentBalance,
        balanceCurrency,
        required: zenditCostInCents,
        needsTopUp: currentBalance < zenditCostInCents
      });

      if (currentBalance < zenditCostInCents) {
        const topUpAmount = zenditCostInCents;
        console.log('[Stripe Webhook] Wallet balance insufficient, creating virtual card for top-up...');

        // Create virtual card and get details
        const { cardId, cardDetails } = await createVirtualCardForTopUp(zenditCurrency);
        issuingCardId = cardId;

        // Update DB with issuing card ID
        if (isSupabaseReady()) {
          await supabase
            .from('esim_purchases')
            .update({ stripe_issuing_card_id: cardId })
            .eq('transaction_id', transactionId);
        }

        // Top up wallet with retry logic
        console.log('[Stripe Webhook] Topping up Zendit wallet...');
        const topUpResult = await retryWithBackoff(
          () => topUpWallet({
            amountCents: topUpAmount,
            currency: zenditCurrency,
            cardDetails,
            reference: `topup-${transactionId}`
          }),
          3, // max retries
          1000 // initial delay
        );

        console.log('[Stripe Webhook] Wallet top-up successful:', topUpResult);

        // Verify balance after top-up
        const newBalance = await getWalletBalance();
        console.log('[Stripe Webhook] New wallet balance:', newBalance);
      } else {
        console.log('[Stripe Webhook] Wallet has sufficient balance, skipping top-up');
      }
    } catch (topUpError) {
      console.error('[Stripe Webhook] Wallet top-up failed:', topUpError);
      
      // Update DB with failure
      if (isSupabaseReady()) {
        await supabase
          .from('esim_purchases')
          .update({ 
            zendit_status: 'topup_failed',
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
            reason: 'zendit_topup_failed',
            transactionId
          }
        });
        console.log('[Stripe Webhook] Refund initiated due to top-up failure');
      } catch (refundError) {
        console.error('[Stripe Webhook] Failed to initiate refund:', refundError);
      }

      throw new Error(`Wallet top-up failed: ${topUpError instanceof Error ? topUpError.message : 'Unknown error'}`);
    }
  } else {
    if (!enableWalletTopUp) {
      console.log('[Stripe Webhook] Wallet top-up disabled (Zendit wallet API not available). Proceeding directly to purchase.');
      console.log('[Stripe Webhook] Ensure Zendit wallet is pre-funded via dashboard.');
    } else {
      console.log('[Stripe Webhook] Stripe Issuing not available, skipping wallet top-up check');
    }
  }

  // Step 4: Purchase eSIM from Zendit
  console.log('[Stripe Webhook] Purchasing eSIM from Zendit...');
  let purchase;
  try {
    purchase = await retryWithBackoff(
      () => createEsimPurchase({
        offerId,
        transactionId,
      }),
      3, // max retries
      1000 // initial delay
    );
    console.log('[Stripe Webhook] eSIM purchase successful:', purchase.status);
  } catch (purchaseError) {
    console.error('[Stripe Webhook] eSIM purchase failed:', purchaseError);
    
    // Update DB with failure
    if (isSupabaseReady()) {
      await supabase
        .from('esim_purchases')
        .update({ 
          zendit_status: 'purchase_failed',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId);
    }

    // Consider refund if purchase fails after top-up
    // (Zendit may release authorization, but we should verify)
    throw purchaseError;
  }

  // Step 5: Update database with purchase result
  const zenditTransactionId = purchase.transactionId || purchase.transaction_id || null;
  const zenditStatus = purchase.status || 'pending';
  
  if (isSupabaseReady()) {
    await supabase
      .from('esim_purchases')
      .update({
        zendit_transaction_id: zenditTransactionId,
        zendit_status: zenditStatus,
        confirmation: purchase.confirmation || null,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId);
  }

  // Step 6: If purchase is DONE, fetch QR code
  let qrCodeUrl: string | null = null;
  if (zenditStatus === 'DONE' && zenditTransactionId) {
    try {
      console.log('[Stripe Webhook] Fetching QR code...');
      const qrCodeBlob = await getEsimQRCode(zenditTransactionId);
      
      // Upload QR code to storage (Supabase Storage or S3)
      // For now, we'll store a reference - implement actual upload based on your storage setup
      // Example: upload to Supabase Storage
      if (isSupabaseReady()) {
        const fileName = `qrcodes/${transactionId}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('esim-qrcodes') // Create this bucket in Supabase
          .upload(fileName, qrCodeBlob, {
            contentType: 'image/png',
            upsert: true
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('esim-qrcodes')
            .getPublicUrl(fileName);
          
          qrCodeUrl = urlData?.publicUrl || null;
          
          // Update DB with QR code URL
          await supabase
            .from('esim_purchases')
            .update({ qr_code_url: qrCodeUrl })
            .eq('transaction_id', transactionId);
        }
      }
    } catch (qrError) {
      console.error('[Stripe Webhook] Failed to fetch QR code:', qrError);
      // Don't fail the entire flow if QR code fetch fails
    }
  }

  // Step 7: Send confirmation email
  try {
    const priceAmount = priceInCents / 100;
    await sendOrderConfirmation({
      to: recipientEmail,
      customerName: fullName,
      transactionId,
      productName: productName || 'eSIM Plan',
      price: `${currencyCode} ${priceAmount.toFixed(2)}`
    });
    console.log('[Stripe Webhook] Order confirmation email sent');
  } catch (emailError) {
    console.error('[Stripe Webhook] Failed to send email:', emailError);
    // Don't fail the flow if email fails
  }

  return {
    transactionId,
    zenditStatus,
    zenditTransactionId,
    qrCodeUrl
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
      const result = await processPaymentAndFulfill(
        paymentIntent.id,
        paymentIntent.metadata || {},
        paymentIntent.amount,
        paymentIntent.currency || 'USD',
        paymentIntent.metadata?.userId
      );

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

      const result = await processPaymentAndFulfill(
        paymentIntentId,
        session.metadata || {},
        session.amount_total || 0,
        session.currency || 'USD',
        session.metadata?.userId
      );

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
