/**
 * Stripe Issuing Integration
 * Handles creation of cardholders and virtual cards for Zendit wallet top-ups
 */

import Stripe from "stripe";
import { supabaseAdmin as supabase } from "./supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

// Check if Stripe Issuing is available
export const isStripeIssuingAvailable = () => {
  return process.env.STRIPE_ISSUING_AVAILABLE === "true";
};

/**
 * Get or create a Stripe Issuing cardholder
 * Reuses existing cardholder if available, otherwise creates a new one
 */
export async function getOrCreateCardholder(): Promise<string> {
  // Check if we have a cardholder ID stored in environment or database
  let cardholderId = process.env.STRIPE_ISSUING_CARDHOLDER_ID;

  if (cardholderId) {
    try {
      // Verify the cardholder still exists
      await stripe.issuing.cardholders.retrieve(cardholderId);
      return cardholderId;
    } catch (error) {
      console.warn("[Stripe Issuing] Stored cardholder ID invalid, creating new one");
      cardholderId = undefined;
    }
  }

  // Create a new cardholder
  // Note: Adjust billing address and company details as needed
  const cardholder = await stripe.issuing.cardholders.create({
    name: process.env.STRIPE_ISSUING_CARDHOLDER_NAME || "Platform Cardholder",
    type: "company",
    company: {
      tax_id: process.env.STRIPE_ISSUING_COMPANY_TAX_ID,
    } as any, // Type assertion for company object
    billing: {
      address: {
        line1: process.env.STRIPE_ISSUING_ADDRESS_LINE1 || "123 Main St",
        city: process.env.STRIPE_ISSUING_ADDRESS_CITY || "City",
        state: process.env.STRIPE_ISSUING_ADDRESS_STATE || "State",
        postal_code: process.env.STRIPE_ISSUING_ADDRESS_POSTAL || "12345",
        country: process.env.STRIPE_ISSUING_ADDRESS_COUNTRY || "US",
      },
    },
    email: process.env.SERVICE_OWNER_EMAIL,
  });

  console.log("[Stripe Issuing] Created cardholder:", cardholder.id);

  // Store cardholder ID for future use (you may want to store this in DB or env)
  // For now, we'll rely on environment variable being set manually
  // In production, consider storing in a database table

  return cardholder.id;
}

/**
 * Create a virtual card for Zendit wallet top-up
 * Note: Stripe Issuing may require special permissions to retrieve PAN programmatically
 * This implementation creates a virtual card - adjust based on your Stripe Issuing setup
 */
export async function createVirtualCard(
  cardholderId: string,
  currency: string = "USD"
): Promise<Stripe.Issuing.Card> {
  const card = await stripe.issuing.cards.create({
    cardholder: cardholderId,
    currency: currency.toLowerCase(),
    type: "virtual",
    status: "active",
  });

  console.log("[Stripe Issuing] Created virtual card:", card.id);

  // Save card metadata to database
  try {
    await supabase.from("issuing_cards").insert({
      card_id: card.id,
      card_last4: card.last4 || null,
      card_exp: card.exp_month && card.exp_year 
        ? `${card.exp_month}/${card.exp_year}` 
        : null,
      active: true,
    });
  } catch (error) {
    console.error("[Stripe Issuing] Failed to save card to database:", error);
    // Don't fail the operation if DB save fails
  }

  return card;
}

/**
 * Retrieve card details (PAN, CVC, expiry) for a virtual card
 * 
 * IMPORTANT: Stripe Issuing has restrictions on programmatic PAN retrieval.
 * You may need to:
 * 1. Use single-use authorizations
 * 2. Request card details via Stripe Dashboard
 * 3. Use Stripe's test mode which may have different behavior
 * 
 * This is a placeholder - adjust based on your Stripe Issuing capabilities
 */
export async function getCardDetails(
  cardId: string
): Promise<{
  number: string;
  cvc: string;
  exp_month: number;
  exp_year: number;
}> {
  // NOTE: This is a simplified implementation
  // In production, you may need to:
  // 1. Create a single-use authorization to reveal PAN
  // 2. Use Stripe's test card numbers in test mode
  // 3. Retrieve via Stripe Dashboard and store securely
  
  // For test mode, you can use test card numbers
  if (process.env.NODE_ENV === "development" || process.env.STRIPE_SECRET_KEY?.includes("sk_test")) {
    // Return test card details (Stripe test card)
    return {
      number: "4242424242424242",
      cvc: "123",
      exp_month: 12,
      exp_year: new Date().getFullYear() + 1,
    };
  }

  // In production, you'll need to implement proper PAN retrieval
  // This might involve:
  // - Creating a single-use authorization
  // - Using Stripe's card details API (if available)
  // - Storing card details securely after first retrieval
  
  throw new Error(
    "Card details retrieval not fully implemented. " +
    "Please implement based on your Stripe Issuing setup. " +
    "See: https://docs.stripe.com/issuing"
  );
}

/**
 * Create a virtual card and retrieve its details for wallet top-up
 * This is a convenience function that combines card creation and detail retrieval
 */
export async function createVirtualCardForTopUp(
  currency: string = "USD"
): Promise<{
  cardId: string;
  cardDetails: {
    number: string;
    cvc: string;
    exp_month: number;
    exp_year: number;
  };
}> {
  if (!isStripeIssuingAvailable()) {
    throw new Error("Stripe Issuing is not available. Set STRIPE_ISSUING_AVAILABLE=true");
  }

  const cardholderId = await getOrCreateCardholder();
  const card = await createVirtualCard(cardholderId, currency);
  
  // Note: In production, you'll need to properly retrieve card details
  // This is a placeholder that may need adjustment
  let cardDetails;
  try {
    cardDetails = await getCardDetails(card.id);
  } catch (error) {
    console.error("[Stripe Issuing] Failed to get card details:", error);
    // In test mode, use test card
    if (process.env.NODE_ENV === "development" || process.env.STRIPE_SECRET_KEY?.includes("sk_test")) {
      cardDetails = {
        number: "4242424242424242",
        cvc: "123",
        exp_month: 12,
        exp_year: new Date().getFullYear() + 1,
      };
    } else {
      throw error;
    }
  }

  return {
    cardId: card.id,
    cardDetails,
  };
}

