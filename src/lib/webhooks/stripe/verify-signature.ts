import Stripe from "stripe";
import { getStripe } from "@/lib/stripe-server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export function verifyStripeSignature(body: string, signature: string | null): Stripe.Event {
  if (!signature) {
    throw new Error("NO_SIGNATURE");
  }

  try {
    return getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    throw new Error("INVALID_SIGNATURE");
  }
}
