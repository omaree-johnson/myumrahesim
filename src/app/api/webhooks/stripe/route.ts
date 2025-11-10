import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createEsimPurchase } from "@/lib/zendit";
import { supabase, isSupabaseReady } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
      // Extract metadata
      const { offerId, recipientEmail, fullName, productName } = paymentIntent.metadata || {};

      if (!offerId || !recipientEmail || !fullName) {
        console.error("[Stripe Webhook] Missing metadata:", paymentIntent.metadata);
        return NextResponse.json(
          { error: "Missing required metadata" },
          { status: 400 }
        );
      }

      // Generate unique transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Save to database first (as PENDING) if Supabase is configured
      if (isSupabaseReady()) {
        const priceAmount = paymentIntent.amount ? paymentIntent.amount / 100 : 0;
        const priceCurrency = paymentIntent.currency?.toUpperCase() || 'USD';

        const { error: dbError } = await supabase
          .from('purchases')
          .insert({
            transaction_id: transactionId,
            offer_id: offerId,
            customer_email: recipientEmail,
            customer_name: fullName,
            status: 'PENDING',
            price_amount: priceAmount,
            price_currency: priceCurrency,
            stripe_payment_intent: paymentIntent.id,
            zendit_response: {}
          })
          .select()
          .single();

        if (dbError) {
          console.error("[Stripe Webhook] Database error:", dbError);
        }
      }

      // Purchase eSIM from Zendit
      console.log('[Stripe Webhook] Purchasing eSIM from Zendit...');
      const purchase = await createEsimPurchase({
        offerId,
        transactionId,
      });

      console.log('[Stripe Webhook] eSIM purchased successfully:', purchase.status);

      // Update database with success
      if (isSupabaseReady()) {
        await supabase
          .from('purchases')
          .update({
            status: purchase.status || 'DONE',
            zendit_response: purchase,
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
      }

      // Send order confirmation email
      try {
        const priceAmount = paymentIntent.amount ? paymentIntent.amount / 100 : 0;
        const priceCurrency = paymentIntent.currency?.toUpperCase() || 'USD';
        
        console.log('[Stripe Webhook] Sending order confirmation to:', recipientEmail);
        const emailResult = await sendOrderConfirmation({
          to: recipientEmail,
          customerName: fullName,
          transactionId,
          productName: productName || 'eSIM Plan',
          price: `${priceCurrency} ${priceAmount.toFixed(2)}`
        });
        console.log('[Stripe Webhook] Order confirmation email sent successfully:', emailResult);
      } catch (emailError) {
        console.error('[Stripe Webhook] Failed to send order confirmation email:', emailError);
        console.error('[Stripe Webhook] Email error details:', emailError instanceof Error ? emailError.message : emailError);
      }

      return NextResponse.json({
        received: true,
        transactionId,
        status: purchase.status
      });

    } catch (error) {
      console.error("[Stripe Webhook] Error processing payment:", error);
      
      // Update database with failure
      if (isSupabaseReady()) {
        await supabase
          .from('purchases')
          .update({
            status: 'FAILED',
            zendit_response: { error: error instanceof Error ? error.message : 'Unknown error' },
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payment_intent', paymentIntent.id);
      }

      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  }

  // Handle the checkout.session.completed event (for Stripe Checkout redirect)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('[Stripe Webhook] Payment successful for session:', session.id);

    try {
      // Extract metadata
      const { offerId, recipientEmail, fullName, productName } = session.metadata || {};

      if (!offerId || !recipientEmail || !fullName) {
        console.error("[Stripe Webhook] Missing metadata:", session.metadata);
        return NextResponse.json(
          { error: "Missing required metadata" },
          { status: 400 }
        );
      }

      // Generate unique transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Save to database first (as PENDING) if Supabase is configured
      let dbPurchaseId = null;
      if (isSupabaseReady()) {
        const priceAmount = session.amount_total ? session.amount_total / 100 : 0;
        const priceCurrency = session.currency?.toUpperCase() || 'USD';

        const { data: dbPurchase, error: dbError } = await supabase
          .from('purchases')
          .insert({
            transaction_id: transactionId,
            offer_id: offerId,
            customer_email: recipientEmail,
            customer_name: fullName,
            status: 'PENDING',
            price_amount: priceAmount,
            price_currency: priceCurrency,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
            zendit_response: {}
          })
          .select()
          .single();

        if (dbError) {
          console.error("[Stripe Webhook] Database error:", dbError);
        } else if (dbPurchase) {
          dbPurchaseId = dbPurchase.id;
        }
      }

      // Purchase eSIM from Zendit
      console.log('[Stripe Webhook] Purchasing eSIM from Zendit...');
      const purchase = await createEsimPurchase({
        offerId,
        transactionId,
      });

      console.log('[Stripe Webhook] eSIM purchased successfully:', purchase.status);

      // Update database with success
      if (isSupabaseReady()) {
        await supabase
          .from('purchases')
          .update({
            status: purchase.status || 'DONE',
            zendit_response: purchase,
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
      }

      // Send order confirmation email
      try {
        const priceAmount = session.amount_total ? session.amount_total / 100 : 0;
        const priceCurrency = session.currency?.toUpperCase() || 'USD';
        
        await sendOrderConfirmation({
          to: recipientEmail,
          customerName: fullName,
          transactionId,
          productName: productName || 'eSIM Plan',
          price: `${priceCurrency} ${priceAmount.toFixed(2)}`
        });
        console.log('[Stripe Webhook] Order confirmation email sent');
      } catch (emailError) {
        console.error('[Stripe Webhook] Failed to send email:', emailError);
      }

      return NextResponse.json({
        received: true,
        transactionId,
        status: purchase.status
      });

    } catch (error) {
      console.error("[Stripe Webhook] Error processing payment:", error);
      
      // Update database with failure
      if (isSupabaseReady()) {
        await supabase
          .from('purchases')
          .update({
            status: 'FAILED',
            zendit_response: { error: error instanceof Error ? error.message : 'Unknown error' },
            updated_at: new Date().toISOString()
          })
          .eq('stripe_session_id', session.id);
      }

      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  }

  // Return a 200 response for other event types
  return NextResponse.json({ received: true });
}
