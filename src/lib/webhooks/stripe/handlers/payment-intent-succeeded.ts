import Stripe from "stripe";
import { NextResponse } from "next/server";
import { processPaymentAndFulfill } from "@/lib/webhooks/stripe/orchestrators/fulfillment";
import { findExistingPurchaseByPaymentIntent } from "@/lib/webhooks/stripe/services/idempotency";
import { logStripePaymentAction, markStripeWebhookProcessed } from "@/lib/webhooks/stripe/services/persistence";

export async function handlePaymentIntentSucceeded(event: Stripe.Event): Promise<NextResponse> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const existingPurchase = await findExistingPurchaseByPaymentIntent(paymentIntent.id);

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

  try {
    const result = await processPaymentAndFulfill(paymentIntent);
    await Promise.all([
      logStripePaymentAction({
        transactionId: result.transactionId,
        paymentIntentId: paymentIntent.id,
        actionType: "succeeded",
        actionStatus: "succeeded",
        amount: paymentIntent.amount,
        currency: paymentIntent.currency?.toUpperCase(),
        metadata: paymentIntent.metadata,
      }),
      markStripeWebhookProcessed(event.id, true),
    ]);

    return NextResponse.json({
      received: true,
      success: true,
      transactionId: result.transactionId,
      orderNo: result.orderNo,
      status: result.status,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await Promise.all([
      logStripePaymentAction({
        transactionId: paymentIntent.metadata?.transactionId || `pending_${paymentIntent.id}`,
        paymentIntentId: paymentIntent.id,
        actionType: "failed",
        actionStatus: "failed",
        amount: paymentIntent.amount,
        currency: paymentIntent.currency?.toUpperCase(),
        metadata: paymentIntent.metadata,
        errorMessage,
      }),
      markStripeWebhookProcessed(event.id, false, errorMessage),
    ]);

    const isCriticalError =
      errorMessage.includes("Missing required") ||
      errorMessage.includes("Package not found") ||
      errorMessage.includes("Insufficient");

    return NextResponse.json(
      {
        received: true,
        error: isCriticalError ? "Failed to process payment" : "Payment processed with warnings",
        message: errorMessage,
      },
      { status: isCriticalError ? 500 : 200 }
    );
  }
}
