/**
 * Payment Verification Utilities
 * Verifies payment amounts, prevents fraud, and ensures price integrity
 */

import { Stripe } from 'stripe';
import { getEsimPackage } from './esimaccess';
import { getProfitMargin, getMinProfitCents } from './pricing-config';
import { applyPercentDiscountWithFloor, validateDiscountForContext } from './discounts';
import { secureLog } from './secure-logging';

/**
 * Verify payment amount matches expected product price
 */
export async function verifyPaymentAmount(
  paymentIntent: Stripe.PaymentIntent,
  offerId: string,
  discountCode?: string | null,
  toleranceCents: number = 1 // Allow 1 cent tolerance for rounding
): Promise<{
  valid: boolean;
  error?: string;
  expectedPrice?: number;
  paidPrice?: number;
  difference?: number;
  details?: any;
}> {
  const paidAmount = paymentIntent.amount;

  // 1. Try to get expected price from metadata first
  const expectedPriceFromMetadata = paymentIntent.metadata?.expectedPriceCents;
  
  if (expectedPriceFromMetadata) {
    const expectedPrice = parseInt(expectedPriceFromMetadata, 10);
    const difference = Math.abs(paidAmount - expectedPrice);

    if (difference > toleranceCents) {
      const details = {
        offerId,
        paidAmount,
        expectedPrice,
        difference,
        source: 'metadata',
      };

      secureLog('error', 'Price mismatch detected (from metadata)', details);

      const { logSecurityEvent } = await import('./secure-logging');
      await logSecurityEvent('fraud_price_mismatch', {
        paymentIntentId: paymentIntent.id,
        offerId,
        paidAmount,
        expectedPrice,
        difference,
        source: 'metadata',
      });

      return {
        valid: false,
        error: `Price mismatch: paid ${paidAmount} cents, expected ${expectedPrice} cents (difference: ${difference} cents)`,
        expectedPrice,
        paidPrice: paidAmount,
        difference,
        details,
      };
    }

    return {
      valid: true,
      expectedPrice,
      paidPrice: paidAmount,
    };
  }

  // 2. Fallback: Calculate expected price from product
  try {
    const packageData = await getEsimPackage(offerId);
    if (!packageData) {
      return {
        valid: false,
        error: `Product not found: ${offerId}`,
      };
    }

    // Calculate expected price
    const costPriceData = packageData.costPrice || packageData.price;
    const divisor = costPriceData.currencyDivisor || 100;
    const providerCostInCents = Math.round((costPriceData.fixed / divisor) * 100);

    // Apply profit margin
    const profitMargin = getProfitMargin();
    const minProfitCents = getMinProfitCents();
    const priceWithMargin = Math.round(providerCostInCents * profitMargin);
    const priceWithMinProfit = providerCostInCents + minProfitCents;
    const calculatedPrice = Math.max(priceWithMargin, priceWithMinProfit);

    // Apply discount if present
    let finalExpectedPrice = calculatedPrice;
    if (discountCode) {
      const discountValidation = await validateDiscountForContext({
        codeRaw: discountCode,
        customerEmail: paymentIntent.metadata?.recipientEmail || null,
        transactionId: paymentIntent.metadata?.transactionId || null,
        appliesTo: 'esim',
      });

      if (discountValidation.ok) {
        const discountCalc = applyPercentDiscountWithFloor({
          totalCents: calculatedPrice,
          percentOff: discountValidation.codeRow.percent_off,
          minTotalCents: providerCostInCents + minProfitCents,
        });
        finalExpectedPrice = discountCalc.discountedTotalCents;
      }
    }

    // Verify
    const difference = Math.abs(paidAmount - finalExpectedPrice);

    if (difference > toleranceCents) {
      const details = {
        offerId,
        paidAmount,
        expectedPrice: finalExpectedPrice,
        difference,
        providerCostInCents,
        calculatedPrice,
        source: 'calculated',
      };

      secureLog('error', 'Price mismatch detected (calculated)', details);

      const { logSecurityEvent } = await import('./secure-logging');
      await logSecurityEvent('fraud_price_mismatch', {
        paymentIntentId: paymentIntent.id,
        offerId,
        paidAmount,
        expectedPrice: finalExpectedPrice,
        difference,
        providerCostInCents,
        source: 'calculated',
      });

      return {
        valid: false,
        error: `Price mismatch: paid ${paidAmount} cents, expected ${finalExpectedPrice} cents (difference: ${difference} cents)`,
        expectedPrice: finalExpectedPrice,
        paidPrice: paidAmount,
        difference,
        details,
      };
    }

    secureLog('info', 'Price verification passed', {
      paymentIntentId: paymentIntent.id,
      offerId,
      paidAmount,
      expectedPrice: finalExpectedPrice,
    });

    return {
      valid: true,
      expectedPrice: finalExpectedPrice,
      paidPrice: paidAmount,
    };
  } catch (error) {
    secureLog('error', 'Price verification error', {
      paymentIntentId: paymentIntent.id,
      offerId,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      valid: false,
      error: `Price verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verify cart payment amount
 */
export async function verifyCartPaymentAmount(
  paymentIntent: Stripe.PaymentIntent,
  cartItems: Array<{ offerId: string; quantity: number }>,
  discountCode?: string | null
): Promise<{
  valid: boolean;
  error?: string;
  expectedPrice?: number;
  paidPrice?: number;
  details?: any;
}> {
  const paidAmount = paymentIntent.amount;

  // Get expected price from metadata
  const expectedPriceFromMetadata = paymentIntent.metadata?.expectedPriceCents;
  
  if (expectedPriceFromMetadata) {
    const expectedPrice = parseInt(expectedPriceFromMetadata, 10);
    const difference = Math.abs(paidAmount - expectedPrice);
    const tolerance = 1;

    if (difference > tolerance) {
      const { logSecurityEvent } = await import('./secure-logging');
      await logSecurityEvent('fraud_cart_price_mismatch', {
        paymentIntentId: paymentIntent.id,
        paidAmount,
        expectedPrice,
        difference,
        cartItems: cartItems.length,
      });

      return {
        valid: false,
        error: `Cart price mismatch: paid ${paidAmount}, expected ${expectedPrice}`,
        expectedPrice,
        paidPrice: paidAmount,
      };
    }

    return {
      valid: true,
      expectedPrice,
      paidPrice: paidAmount,
    };
  }

  // Fallback: Calculate from cart items
  try {
    let totalExpected = 0;
    const items = [];

    for (const item of cartItems) {
      const packageData = await getEsimPackage(item.offerId);
      if (!packageData) {
        return {
          valid: false,
          error: `Product not found: ${item.offerId}`,
        };
      }

      const costPriceData = packageData.costPrice || packageData.price;
      const divisor = costPriceData.currencyDivisor || 100;
      const providerCostInCents = Math.round((costPriceData.fixed / divisor) * 100);

      const profitMargin = getProfitMargin();
      const minProfitCents = getMinProfitCents();
      const priceWithMargin = Math.round(providerCostInCents * profitMargin);
      const priceWithMinProfit = providerCostInCents + minProfitCents;
      const unitPrice = Math.max(priceWithMargin, priceWithMinProfit);

      const itemTotal = unitPrice * item.quantity;
      totalExpected += itemTotal;

      items.push({
        offerId: item.offerId,
        quantity: item.quantity,
        unitPrice,
        itemTotal,
      });
    }

    // Apply discount if present
    let finalExpectedPrice = totalExpected;
    if (discountCode) {
      const discountValidation = await validateDiscountForContext({
        codeRaw: discountCode,
        customerEmail: paymentIntent.metadata?.recipientEmail || null,
        transactionId: paymentIntent.metadata?.transactionId || null,
        appliesTo: 'cart',
      });

      if (discountValidation.ok) {
        const minTotalCents = await items.reduce(async (sumPromise, item) => {
          const sum = await sumPromise;
          const packageData = await getEsimPackage(item.offerId);
          if (!packageData) return sum;
          const costPriceData = packageData.costPrice || packageData.price;
          const divisor = costPriceData.currencyDivisor || 100;
          const providerCost = Math.round((costPriceData.fixed / divisor) * 100);
          return sum + (providerCost + getMinProfitCents()) * item.quantity;
        }, Promise.resolve(0));

        const discountCalc = applyPercentDiscountWithFloor({
          totalCents: totalExpected,
          percentOff: discountValidation.codeRow.percent_off,
          minTotalCents,
        });
        finalExpectedPrice = discountCalc.discountedTotalCents;
      }
    }

    const difference = Math.abs(paidAmount - finalExpectedPrice);
    const tolerance = 1;

    if (difference > tolerance) {
      const { logSecurityEvent } = await import('./secure-logging');
      await logSecurityEvent('fraud_cart_price_mismatch', {
        paymentIntentId: paymentIntent.id,
        paidAmount,
        expectedPrice: finalExpectedPrice,
        difference,
        items: items.length,
      });

      return {
        valid: false,
        error: `Cart price mismatch: paid ${paidAmount}, expected ${finalExpectedPrice}`,
        expectedPrice: finalExpectedPrice,
        paidPrice: paidAmount,
      };
    }

    return {
      valid: true,
      expectedPrice: finalExpectedPrice,
      paidPrice: paidAmount,
    };
  } catch (error) {
    secureLog('error', 'Cart price verification error', {
      paymentIntentId: paymentIntent.id,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      valid: false,
      error: `Cart price verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Validate webhook event timestamp
 * Reject events older than 5 minutes
 */
export function validateWebhookTimestamp(event: Stripe.Event): {
  valid: boolean;
  error?: string;
  ageSeconds?: number;
} {
  const eventAge = Date.now() / 1000 - event.created;
  const maxAge = 5 * 60; // 5 minutes

  if (eventAge > maxAge) {
    return {
      valid: false,
      error: `Event too old: ${Math.round(eventAge / 60)} minutes (max: ${maxAge / 60} minutes)`,
      ageSeconds: eventAge,
    };
  }

  if (eventAge < 0) {
    return {
      valid: false,
      error: 'Event timestamp is in the future',
      ageSeconds: eventAge,
    };
  }

  return {
    valid: true,
    ageSeconds: eventAge,
  };
}

/**
 * Check if webhook event was already processed
 */
export async function isEventProcessed(
  eventId: string,
  source: 'stripe' | 'esimaccess' = 'stripe'
): Promise<boolean> {
  const { isSupabaseAdminReady, supabaseAdmin } = await import('./supabase');
  
  if (!isSupabaseAdminReady()) {
    return false;
  }

  const { data } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .eq('source', source)
    .eq('processed', true)
    .maybeSingle();

  return !!data;
}

/**
 * Atomically check and mark payment intent as processed
 * Uses database function to prevent race conditions
 */
export async function markPaymentIntentProcessedAtomically(
  paymentIntentId: string,
  transactionId: string
): Promise<{ alreadyProcessed: boolean; success: boolean }> {
  const { isSupabaseAdminReady, supabaseAdmin } = await import('./supabase');
  
  if (!isSupabaseAdminReady()) {
    return { alreadyProcessed: false, success: false };
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('mark_payment_intent_processed', {
      p_payment_intent_id: paymentIntentId,
      p_transaction_id: transactionId,
    });

    if (error) {
      // Check if it's a duplicate (already processed)
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        return { alreadyProcessed: true, success: false };
      }
      throw error;
    }

    // Function returns true if inserted, false if already exists
    return { 
      alreadyProcessed: !data, 
      success: !!data 
    };
  } catch (error) {
    secureLog('error', 'Failed to mark payment intent processed', {
      paymentIntentId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { alreadyProcessed: false, success: false };
  }
}
