import Stripe from "stripe";

const STRIPE_API_VERSION = "2025-12-15.clover";

let stripeInstance: Stripe | null = null;

/**
 * Lazy-initialized Stripe client for server-side use.
 * Avoids requiring STRIPE_SECRET_KEY at build time (Next.js collects page data then).
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
  }
  return stripeInstance;
}
