import Stripe from "stripe";
import { NextResponse } from "next/server";
import { releaseDiscountReservationForPaymentIntent } from "@/lib/discounts";
import { logStripePaymentAction, markStripeWebhookProcessed } from "@/lib/webhooks/stripe/services/persistence";

export async function handlePaymentFailedOrCanceled(event: Stripe.Event): Promise<NextResponse> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  try {
    await releaseDiscountReservationForPaymentIntent(paymentIntent.id);
    await Promise.all([
      logStripePaymentAction({
        transactionId: paymentIntent.metadata?.transactionId || `pending_${paymentIntent.id}`,
        paymentIntentId: paymentIntent.id,
        actionType: "failed",
        actionStatus: "failed",
        amount: paymentIntent.amount,
        currency: paymentIntent.currency?.toUpperCase(),
        metadata: paymentIntent.metadata,
        errorMessage: event.type === "payment_intent.canceled" ? "Payment canceled" : "Payment failed",
      }),
      markStripeWebhookProcessed(event.id, true),
    ]);
  } catch {}

  return NextResponse.json({ received: true });
}
