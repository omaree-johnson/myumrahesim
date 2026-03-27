import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe-server";
import { processPaymentAndFulfill } from "@/lib/webhooks/stripe/orchestrators/fulfillment";
import { findExistingPurchaseByPaymentIntent } from "@/lib/webhooks/stripe/services/idempotency";

export async function handleCheckoutSessionCompleted(event: Stripe.Event): Promise<NextResponse> {
  const session = event.data.object as Stripe.Checkout.Session;

  try {
    const paymentIntentId = session.payment_intent as string;
    const existingPurchase = paymentIntentId
      ? await findExistingPurchaseByPaymentIntent(paymentIntentId)
      : null;

    if (existingPurchase) {
      return NextResponse.json({
        received: true,
        success: true,
        duplicate: true,
        message: "Payment intent already processed",
        transactionId: existingPurchase.transaction_id,
        orderNo: existingPurchase.order_no,
        status: existingPurchase.esim_provider_status,
      });
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    const result = await processPaymentAndFulfill(paymentIntent, {
      ...(session.metadata || {}),
      ...(session.customer_details?.email && { recipientEmail: session.customer_details.email }),
      ...(session.customer_details?.name && { fullName: session.customer_details.name || "" }),
    });

    return NextResponse.json({ received: true, ...result });
  } catch {
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
