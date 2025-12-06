import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { 
  createEsimOrder, 
  getEsimPackage, 
  getBalance,
  queryEsimProfiles,
  parseProviderPrice
} from "@/lib/esimaccess";
import { supabaseAdmin as supabase, isSupabaseReady } from "@/lib/supabase";
import { sendOrderConfirmation, sendActivationEmail, sendAdminManualIssuanceNotification } from "@/lib/email";
import { retryWithBackoff } from "@/lib/retry";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function fetchActivationWithRetry(orderNo?: string, esimTranNo?: string) {
  if (!orderNo && !esimTranNo) {
    console.log('[Stripe Webhook] ⚠️ Cannot fetch activation - missing orderNo and esimTranNo');
    return null;
  }
  
  console.log('[Stripe Webhook] 🔍 Fetching activation details...', {
    orderNo,
    esimTranNo,
  });
  
  // Try up to 5 times with increasing delays (activation may take time to be ready)
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`[Stripe Webhook] Activation fetch attempt ${attempt + 1}/${maxAttempts}...`);
      const result = await queryEsimProfiles(orderNo, esimTranNo);
      
      if (result && (result.activationCode || result.qrCode || result.smdpAddress)) {
        console.log('[Stripe Webhook] ✅ Activation details retrieved successfully:', {
          hasActivationCode: !!result.activationCode,
          hasQrCode: !!result.qrCode,
          hasSmdpAddress: !!result.smdpAddress,
          hasIccid: !!result.iccid,
        });
        
        return {
          activationCode: result.activationCode,
          qrCode: result.qrCode,
          smdpAddress: result.smdpAddress,
          iccid: result.iccid,
          universalLink: (result as any).universalLink || (result as any).raw?.universalLink || undefined,
        };
      } else {
        console.log(`[Stripe Webhook] Activation not ready yet (attempt ${attempt + 1}/${maxAttempts})`);
      }
    } catch (error) {
      console.error(`[Stripe Webhook] Activation fetch attempt ${attempt + 1} failed:`, error);
    }
    
    // Wait before next attempt (exponential backoff: 2s, 4s, 8s, 16s, 32s)
    if (attempt < maxAttempts - 1) {
      const delayMs = Math.min(2000 * Math.pow(2, attempt), 10000); // Max 10 seconds
      console.log(`[Stripe Webhook] Waiting ${delayMs}ms before next activation fetch attempt...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  
  console.log('[Stripe Webhook] ⏳ Activation details not yet available after all attempts - will be sent via webhook when ready');
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

  // CRITICAL: Retrieve fresh payment intent to get latest metadata (email might have been updated)
  let fullPaymentIntent = paymentIntent;
  try {
    // Always retrieve fresh to get latest metadata updates
    fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id, {
      expand: ['charges.data.billing_details'],
    });
    console.log('[Stripe Webhook] Retrieved fresh payment intent with latest metadata');
  } catch (retrieveError) {
    console.warn('[Stripe Webhook] Failed to retrieve full payment intent, using provided:', retrieveError);
  }

  // Type assertion for expanded charges - Stripe types don't reflect expanded properties
  const expandedPaymentIntent = fullPaymentIntent as Stripe.PaymentIntent & {
    charges?: Stripe.ApiList<Stripe.Charge>;
  };
  const chargesData = expandedPaymentIntent.charges?.data?.[0];
  
  // Try multiple sources for email - check payment intent metadata FIRST (most reliable after update)
  const recipientEmail =
    fullPaymentIntent.metadata?.recipientEmail ||  // Check payment intent metadata first
    mergedMetadata.recipientEmail ||
    fullPaymentIntent.receipt_email ||
    chargesData?.billing_details?.email ||
    chargesData?.receipt_email;

  console.log('[Stripe Webhook] Email extraction attempt:', {
    fromPaymentIntentMetadata: fullPaymentIntent.metadata?.recipientEmail,
    fromMergedMetadata: mergedMetadata.recipientEmail,
    fromReceiptEmail: fullPaymentIntent.receipt_email,
    fromBillingDetails: chargesData?.billing_details?.email,
    fromChargeReceipt: chargesData?.receipt_email,
    finalEmail: recipientEmail,
    hasCharges: !!chargesData,
    metadataKeys: Object.keys(mergedMetadata),
    paymentIntentMetadata: Object.keys(fullPaymentIntent.metadata || {}),
    fullPaymentIntentMetadata: fullPaymentIntent.metadata,
  });

  if (!recipientEmail) {
    console.error('[Stripe Webhook] ❌ MISSING EMAIL - All sources checked:', {
      paymentIntentMetadata: fullPaymentIntent.metadata,
      mergedMetadata: mergedMetadata,
      receipt_email: fullPaymentIntent.receipt_email,
      charges: chargesData ? {
        billing_details: chargesData.billing_details,
        receipt_email: chargesData.receipt_email,
      } : 'No charges',
      paymentIntentId: fullPaymentIntent.id,
    });
    throw new Error("Missing customer email from Stripe payment details. Email must be entered in checkout form before payment.");
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

  // ============================================================================
  // STEP 1: SEND CONFIRMATION EMAIL IMMEDIATELY - BEFORE ANY eSIM PROCESSING
  // ============================================================================
  // This happens FIRST, regardless of eSIM Access processing success/failure
  // Email is sent immediately after payment succeeds, independent of eSIM fulfillment
  console.log('[Stripe Webhook] 📧 STEP 1: Sending order confirmation email IMMEDIATELY...');
  console.log('[Stripe Webhook] Email details:', {
    to: recipientEmail,
    customerName: fullName,
    transactionId,
    productName,
    price: `${currencyCode} ${(priceInCents / 100).toFixed(2)}`,
    hasResendKey: !!process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    resendKeyPreview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING - CHECK ENV!',
  });

  // CRITICAL: Validate email before sending
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.error('[Stripe Webhook] ❌❌❌ INVALID EMAIL - Cannot send confirmation:', {
      recipientEmail,
      paymentIntentId: fullPaymentIntent.id,
      allMetadata: fullPaymentIntent.metadata,
    });
    // Don't throw - continue with eSIM processing, but log the error
  } else {
    const priceAmount = priceInCents / 100;
    
    try {
      console.log('[Stripe Webhook] 📧 Calling Resend API to send email...');
      const emailResult = await sendOrderConfirmation({
        to: recipientEmail,
        customerName: fullName,
        transactionId,
        productName,
        price: `${currencyCode} ${priceAmount.toFixed(2)}`,
      });
      console.log('[Stripe Webhook] ✅✅✅✅✅ ORDER CONFIRMATION EMAIL SENT SUCCESSFULLY:', {
        emailId: emailResult?.id,
        to: recipientEmail,
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        timestamp: new Date().toISOString(),
      });
    } catch (emailError) {
      console.error('[Stripe Webhook] ❌❌❌❌❌ CRITICAL EMAIL FAILURE:', {
        error: emailError instanceof Error ? emailError.message : String(emailError),
        errorName: emailError instanceof Error ? emailError.name : undefined,
        stack: emailError instanceof Error ? emailError.stack : undefined,
        to: recipientEmail,
        hasResendKey: !!process.env.RESEND_API_KEY,
        resendKeyPreview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'MISSING - CHECK ENV!',
        emailFrom: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        paymentIntentId: fullPaymentIntent.id,
        timestamp: new Date().toISOString(),
      });
      // Log but don't throw - continue with eSIM processing
      // Email failure should not block eSIM fulfillment
    }
  }

  // ============================================================================
  // STEP 2: Process eSIM purchase (happens AFTER email is sent)
  // ============================================================================
  console.log('[Stripe Webhook] 📦 STEP 2: Processing eSIM purchase from provider...');
  
  // Step 2.1: Get package details to determine provider cost
  console.log('[Stripe Webhook] Fetching package details from provider...');
  const packageData = await getEsimPackage(offerId);
  
  if (!packageData) {
    throw new Error(`Package not found: ${offerId}`);
  }
  
  // Use costPrice if available (original provider cost), otherwise fall back to price
  const costPriceData = packageData.costPrice || packageData.price;
  const divisor = costPriceData.currencyDivisor || 100;
  const providerCostInCents = Math.round((costPriceData.fixed / divisor) * 100);
  const providerCurrency = (costPriceData.currency || currencyCode).toUpperCase();
  const packageCode = packageData.packageCode || packageData.slug || offerId;
  
  // Calculate profit margin
  const profitMargin = packageData.profitMargin || 1.0;
  const profitInCents = priceInCents - providerCostInCents;
  const profitPercentage = providerCostInCents > 0 ? ((profitInCents / providerCostInCents) * 100).toFixed(2) : '0.00';

  console.log('[Stripe Webhook] Package cost and profit:', {
    providerCostInCents,
    providerCurrency,
    sellingPrice: priceInCents,
    profitInCents,
    profitPercentage: `${profitPercentage}%`,
    profitMargin: `${((profitMargin - 1) * 100).toFixed(2)}%`,
    packageCode
  });

  // Step 2: Save purchase record to esim_purchases table
  // IMPORTANT: Store customer email and name for activation email later
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
        customer_email: recipientEmail, // Store for activation email
        customer_name: fullName, // Store for activation email
      });

    if (dbError) {
      console.error("[Stripe Webhook] Database error:", dbError);
      // Continue processing even if DB insert fails
    } else {
      console.log('[Stripe Webhook] ✅ Customer details stored for activation email');
    }
  }

  // Step 3: Check account balance (if applicable)
  try {
    console.log('[Stripe Webhook] Checking eSIM Access account balance...');
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
      console.warn('[Stripe Webhook] ⚠️ Insufficient account balance - Payment will proceed, admin will be notified');
      
      // Update DB with status (but don't fail the payment)
      if (isSupabaseReady()) {
        await supabase
          .from('esim_purchases')
          .update({ 
            esim_provider_status: 'insufficient_balance',
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
      }

      // Send admin notification email (non-blocking)
      try {
        await sendAdminManualIssuanceNotification({
          transactionId,
          customerEmail: recipientEmail,
          customerName: fullName,
          productName,
          price: `${currencyCode} ${(priceInCents / 100).toFixed(2)}`,
          reason: 'insufficient_balance',
          orderNo: null,
          esimTranNo: null,
          errorCode: '200007',
          errorDetails: `Account balance: ${balanceCurrency} ${(balanceInCents / 100).toFixed(2)}, Required: ${providerCurrency} ${(providerCostInCents / 100).toFixed(2)}`,
        });
        console.log('[Stripe Webhook] ✅ Admin notification sent for insufficient balance');
      } catch (emailError) {
        console.error('[Stripe Webhook] ❌ Failed to send admin notification:', emailError);
        // Don't throw - payment should still proceed
      }

      // Don't throw error - allow payment to proceed
      // Admin will handle manual issuance
      console.log('[Stripe Webhook] Payment will proceed despite insufficient balance - manual issuance required');
    }
  } catch (balanceError) {
    console.error('[Stripe Webhook] Balance check failed:', balanceError);
    // If balance check fails, we'll still attempt purchase (it will fail if insufficient)
    // but log the error
  }

  // Step 4: Purchase eSIM from provider
  // CRITICAL: This MUST succeed for automatic eSIM issuance
  console.log('[Stripe Webhook] 📦 Purchasing eSIM from provider (AUTOMATIC ISSUANCE)...');
  console.log('[Stripe Webhook] Order parameters:', {
    packageCode,
    transactionId,
    travelerName: fullName,
    travelerEmail: recipientEmail,
    offerId,
    packageDataId: packageData.id,
    packageDataPackageCode: packageData.packageCode,
    packageDataSlug: packageData.slug,
  });
  
  let purchaseResult;
  let purchaseAttempts = 0;
  const maxPurchaseAttempts = 5; // Increased retries for reliability
  
  // Retry order creation with exponential backoff
  while (purchaseAttempts < maxPurchaseAttempts) {
    try {
      purchaseAttempts++;
      console.log(`[Stripe Webhook] Attempt ${purchaseAttempts}/${maxPurchaseAttempts} to create eSIM order...`);
      
      purchaseResult = await retryWithBackoff(
        () =>
          createEsimOrder({
            packageCode,
            transactionId,
            amountInCents: providerCostInCents, // Pass provider cost in cents for price validation
            travelerName: fullName,
            travelerEmail: recipientEmail,
          }),
        3, // 3 retries per attempt
        1000 // Start with 1 second delay
      );
      
      // Success! Break out of retry loop
      console.log('[Stripe Webhook] ✅✅✅ eSIM order created successfully:', {
        orderNo: purchaseResult.orderNo,
        esimTranNo: purchaseResult.esimTranNo,
        iccid: purchaseResult.iccid,
        attempts: purchaseAttempts,
      });
      break; // Exit retry loop on success
      
    } catch (purchaseError) {
      // Extract error code and details for better debugging
      const errorMessage = purchaseError instanceof Error ? purchaseError.message : String(purchaseError);
      const errorCode = (purchaseError as any)?.errorCode || null;
      
      // Map error codes to specific reasons
      let failureReason: 'insufficient_balance' | 'purchase_failed' = 'purchase_failed';
      let errorDetails = errorMessage;
      
      if (errorCode === '200007') {
        failureReason = 'insufficient_balance';
        errorDetails = 'Insufficient account balance (Error 200007)';
      } else if (errorCode === '200005') {
        errorDetails = `Package price error (Error 200005): ${errorMessage}`;
      } else if (errorCode === '310241' || errorCode === '310243') {
        errorDetails = `Package not found (Error ${errorCode}): ${errorMessage}. PackageCode: ${packageCode}`;
      } else if (errorCode === '200011') {
        errorDetails = `Insufficient available profiles (Error 200011): ${errorMessage}`;
      } else if (errorCode) {
        errorDetails = `eSIM Access API Error ${errorCode}: ${errorMessage}`;
      }
      
      console.error(`[Stripe Webhook] ⚠️ eSIM purchase attempt ${purchaseAttempts} failed:`, {
        errorCode,
        errorMessage,
        errorDetails,
        packageCode,
        transactionId,
        attempt: purchaseAttempts,
        maxAttempts: maxPurchaseAttempts,
      });

      // If this was the last attempt, handle the failure
      if (purchaseAttempts >= maxPurchaseAttempts) {
        console.error('[Stripe Webhook] ❌❌❌ ALL ATTEMPTS FAILED - eSIM order could not be created automatically');
        
        // Update database with failed status
        if (isSupabaseReady()) {
          await supabase
            .from('esim_purchases')
            .update({
              esim_provider_status: failureReason === 'insufficient_balance' ? 'insufficient_balance' : 'purchase_failed',
              esim_provider_error_code: errorCode,
              esim_provider_error_message: errorDetails,
              updated_at: new Date().toISOString(),
            })
            .eq('transaction_id', transactionId);
        }

        // Send admin notification email (non-blocking)
        try {
          await sendAdminManualIssuanceNotification({
            transactionId,
            customerEmail: recipientEmail,
            customerName: fullName,
            productName,
            price: `${currencyCode} ${(priceInCents / 100).toFixed(2)}`,
            reason: failureReason,
            orderNo: null,
            esimTranNo: null,
            errorCode: errorCode || null,
            errorDetails: errorDetails || null,
          });
          console.log('[Stripe Webhook] ✅ Admin notification sent for purchase failure');
        } catch (emailError) {
          console.error('[Stripe Webhook] ❌ Failed to send admin notification:', emailError);
        }

        // CRITICAL: Even though order creation failed, we should still return success
        // to Stripe to prevent webhook retries. The admin will handle manual issuance.
        // However, we log this as a critical failure that needs attention.
        console.error('[Stripe Webhook] ⚠️⚠️⚠️ CRITICAL: Payment succeeded but eSIM order failed - MANUAL ISSUANCE REQUIRED');
        
        return {
          transactionId,
          orderNo: null,
          status: failureReason === 'insufficient_balance' ? 'insufficient_balance' : 'purchase_failed',
          activation: null,
        };
      }
      
      // Wait before next attempt (exponential backoff)
      const delayMs = Math.min(5000 * Math.pow(2, purchaseAttempts - 1), 30000); // Max 30 seconds
      console.log(`[Stripe Webhook] Waiting ${delayMs}ms before retry attempt ${purchaseAttempts + 1}...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // If we get here without purchaseResult, something went wrong
  if (!purchaseResult) {
    console.error('[Stripe Webhook] ❌ CRITICAL: purchaseResult is null after all attempts');
    return {
      transactionId,
      orderNo: null,
      status: 'purchase_failed',
      activation: null,
    };
  }

  const orderNo = purchaseResult.orderNo || purchaseResult.orderId || null;
  const esimTranNo = purchaseResult.esimTranNo || null;
  
  // CRITICAL: Update database with order info immediately
  if (isSupabaseReady()) {
    await supabase
      .from('esim_purchases')
      .update({
        order_no: orderNo,
        esim_provider_status: 'PROCESSING', // Will be updated when activation is ready
        esim_provider_response: purchaseResult.raw,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transactionId);
    
    console.log('[Stripe Webhook] ✅ Database updated with order info:', {
      orderNo,
      esimTranNo,
      transactionId,
    });
  }
  
  // Try to fetch activation details immediately (may not be ready yet)
  console.log('[Stripe Webhook] 🔍 Attempting to fetch activation details...');
  let activation = await fetchActivationWithRetry(orderNo, esimTranNo);

  const providerStatus = activation ? 'GOT_RESOURCE' : 'PROCESSING';

  // Update database with activation status
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

  // Store activation details if available
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
    
    console.log('[Stripe Webhook] ✅ Activation details stored in database');
  }

  // Send activation email with QR code if activation details are available IMMEDIATELY
  if (activation) {
    console.log('[Stripe Webhook] ✅✅✅ Activation details available IMMEDIATELY - sending activation email with QR code');
    try {
      await sendActivationEmail({
        to: recipientEmail,
        customerName: fullName,
        transactionId,
        smdpAddress: activation.smdpAddress,
        activationCode: activation.activationCode || activation.universalLink,
        iccid: activation.iccid,
      });
      console.log('[Stripe Webhook] ✅✅✅ ACTIVATION EMAIL SENT SUCCESSFULLY with QR code');
    } catch (emailError) {
      console.error('[Stripe Webhook] ❌ Failed to send activation email:', emailError);
      // Don't fail the webhook if activation email fails - it will be sent via eSIM Access webhook
    }
  } else {
    console.log('[Stripe Webhook] ⏳ Activation details not yet available - eSIM is being provisioned');
    console.log('[Stripe Webhook] 📧 Activation email will be sent automatically via eSIM Access webhook when ready');
    console.log('[Stripe Webhook] 📋 Webhook URL should be configured at: /api/webhooks/esimaccess');
    console.log('[Stripe Webhook] 📋 Order info for webhook:', {
      orderNo,
      esimTranNo,
      transactionId,
    });
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
  // Log immediately when webhook is called
  console.log('[Stripe Webhook] ============================================');
  console.log('[Stripe Webhook] 🔔 WEBHOOK CALLED - Starting processing...');
  console.log('[Stripe Webhook] Timestamp:', new Date().toISOString());
  
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  console.log('[Stripe Webhook] Request details:', {
    hasBody: !!body,
    bodyLength: body.length,
    hasSignature: !!signature,
    signaturePreview: signature ? `${signature.substring(0, 20)}...` : 'MISSING',
    webhookSecretSet: !!webhookSecret,
  });

  if (!signature) {
    console.error("[Stripe Webhook] ❌ No signature found - webhook rejected");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('[Stripe Webhook] ✅ Signature verified successfully');
  } catch (err) {
    console.error("[Stripe Webhook] ❌ Signature verification failed:", err);
    return NextResponse.json(
      { error: `Webhook signature verification failed` },
      { status: 400 }
    );
  }

  console.log('[Stripe Webhook] ✅ Event parsed successfully:', {
    type: event.type,
    id: event.id,
    created: event.created,
  });

  // Handle the payment_intent.succeeded event (for embedded checkout)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log('[Stripe Webhook] ✅ Payment intent succeeded:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });

    try {
      const result = await processPaymentAndFulfill(paymentIntent);

      console.log('[Stripe Webhook] ✅ Payment processing completed:', {
        transactionId: result.transactionId,
        orderNo: result.orderNo,
        status: result.status,
      });

      // Always return 200 to Stripe - emails are sent asynchronously
      // This prevents webhook failures even if email sending has issues
      return NextResponse.json({
        received: true,
        success: true,
        transactionId: result.transactionId,
        orderNo: result.orderNo,
        status: result.status,
      });
    } catch (error) {
      console.error("[Stripe Webhook] ❌ Error processing payment:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        paymentIntentId: paymentIntent.id,
      });
      
      // Only return 500 for critical errors that need retry
      // Non-critical errors (like email failures) should return 200
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isCriticalError = errorMessage.includes("Missing required") || 
                             errorMessage.includes("Package not found") ||
                             errorMessage.includes("Insufficient");
      
      return NextResponse.json(
        { 
          received: true,
          error: isCriticalError ? "Failed to process payment" : "Payment processed with warnings",
          message: errorMessage
        },
        { status: isCriticalError ? 500 : 200 }
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
      // Log detailed error server-side only
      console.error("[Stripe Webhook] Detailed error:", error);
      
      return NextResponse.json(
        { 
          error: "Failed to process payment"
        },
        { status: 500 }
      );
    }
  }

  // Return a 200 response for other event types
  return NextResponse.json({ received: true });
}
