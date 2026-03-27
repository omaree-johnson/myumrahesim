import Stripe from "stripe";

export async function logStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  const { logWebhookEvent } = await import("@/lib/supabase-logging");
  await logWebhookEvent({
    eventId: event.id,
    eventType: event.type,
    source: "stripe",
    payload: event.data.object,
  });
}

export async function markStripeWebhookProcessed(
  eventId: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const { markWebhookEventProcessed } = await import("@/lib/supabase-logging");
  await markWebhookEventProcessed(eventId, success, errorMessage);
}

export async function logStripePaymentAction(params: {
  transactionId: string;
  paymentIntentId: string;
  actionType: "succeeded" | "failed";
  actionStatus: "succeeded" | "failed";
  amount: number;
  currency?: string;
  metadata?: Stripe.Metadata;
  errorMessage?: string;
}): Promise<void> {
  const { logPaymentAction } = await import("@/lib/supabase-logging");
  await logPaymentAction(params);
}
