import Stripe from "stripe";
import { NextResponse } from "next/server";
import { handlePaymentIntentSucceeded } from "@/lib/webhooks/stripe/handlers/payment-intent-succeeded";
import { handleCheckoutSessionCompleted } from "@/lib/webhooks/stripe/handlers/checkout-session-completed";
import { handlePaymentFailedOrCanceled } from "@/lib/webhooks/stripe/handlers/payment-failed";

export async function routeStripeWebhookEvent(event: Stripe.Event): Promise<NextResponse> {
  if (event.type === "payment_intent.succeeded") {
    return handlePaymentIntentSucceeded(event);
  }

  if (event.type === "payment_intent.canceled" || event.type === "payment_intent.payment_failed") {
    return handlePaymentFailedOrCanceled(event);
  }

  if (event.type === "checkout.session.completed") {
    return handleCheckoutSessionCompleted(event);
  }

  return NextResponse.json({ received: true });
}
