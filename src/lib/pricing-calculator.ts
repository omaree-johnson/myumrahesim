/**
 * Server-Side Pricing Calculator
 * 
 * Calculates final pricing for Umrah eSIM purchases with promotions.
 * All pricing logic is server-side only - base prices are never modified on the client.
 */

import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';
import { getCachedEsimProducts } from './products-cache';
import { applyPercentDiscountWithFloor, normalizeDiscountCode } from './discounts';
import { getMinProfitCents } from './pricing-config';

export type PricingResult = {
  success: true;
  originalPriceCents: number;
  discountPercent: number;
  discountAmountCents: number;
  finalPriceCents: number;
  currency: string;
  promotionId?: string;
  promotionName?: string;
  promoCode?: string;
  appliedPromotion?: {
    id: string;
    name: string;
    code: string | null;
    discountPercent: number;
  };
  volumeDiscount?: {
    percent: number;
    thresholdCents: number;
  };
} | {
  success: false;
  error: string;
};

export type PromotionRow = {
  id: string;
  name: string;
  promo_code: string | null;
  discount_percent: number;
  min_purchase_amount_cents: number;
  max_discount_amount_cents: number | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  applies_to: string;
  priority: number;
};

/**
 * Get active promotion from promotions table
 * Checks for both auto-applied and code-based promotions
 */
async function getActivePromotion(
  appliesTo: 'esim' | 'cart' | 'topup' | 'any' = 'esim',
  promoCode?: string | null
): Promise<PromotionRow | null> {
  if (!isSupabaseAdminReady()) {
    return null;
  }

  try {
    // Use the database function for fast lookup
    const { data, error } = await supabase
      .rpc('get_active_promotion', {
        p_applies_to: appliesTo,
        p_promo_code: promoCode || null,
        p_check_time: new Date().toISOString(),
      })
      .maybeSingle();

    if (error) {
      // Fallback to direct query if function not available
      const now = new Date().toISOString();
      const query = supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .or(`applies_to.eq.any,applies_to.eq.${appliesTo}`)
        .order('priority', { ascending: false })
        .limit(1);

      if (promoCode) {
        query.eq('promo_code', promoCode);
      } else {
        query.is('promo_code', null);
      }

      const { data: fallbackData, error: fallbackError } = await query.maybeSingle();

      if (fallbackError || !fallbackData) {
        return null;
      }

      return fallbackData as PromotionRow;
    }

    if (!data || typeof data !== 'object' || !('id' in data) || typeof (data as any).id !== 'string') {
      return null;
    }

    // Fetch full promotion details
    const promotionId = (data as any).id;
    const { data: fullPromo } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', promotionId)
      .single();

    return fullPromo as PromotionRow | null;
  } catch (error) {
    return null;
  }
}

/**
 * Calculate volume discount based on order total
 * - Orders over $70: 10% discount
 * - Orders over $30: 5% discount
 * Returns the discount percent (0 if no discount applies)
 */
function calculateVolumeDiscount(totalCents: number): {
  percent: number;
  thresholdCents: number;
} | undefined {
  const THRESHOLD_10_PERCENT = 7000; // $70.00 in cents
  const THRESHOLD_5_PERCENT = 3000; // $30.00 in cents

  if (totalCents >= THRESHOLD_10_PERCENT) {
    return { percent: 10, thresholdCents: THRESHOLD_10_PERCENT };
  } else if (totalCents >= THRESHOLD_5_PERCENT) {
    return { percent: 5, thresholdCents: THRESHOLD_5_PERCENT };
  }

  return undefined;
}

/**
 * Validate promotion is still active and applicable
 */
function validatePromotion(promotion: PromotionRow, originalPriceCents: number): {
  valid: boolean;
  error?: string;
} {
  const now = new Date();
  const startsAt = new Date(promotion.starts_at);
  const endsAt = new Date(promotion.ends_at);

  // Check time range
  if (now < startsAt || now > endsAt) {
    return { valid: false, error: 'Promotion is not currently active' };
  }

  // Check active status
  if (!promotion.is_active) {
    return { valid: false, error: 'Promotion is inactive' };
  }

  // Check minimum purchase amount
  if (originalPriceCents < promotion.min_purchase_amount_cents) {
    return {
      valid: false,
      error: `Minimum purchase amount not met ($${(promotion.min_purchase_amount_cents / 100).toFixed(2)})`,
    };
  }

  return { valid: true };
}

/**
 * Calculate pricing for a single eSIM product
 * 
 * @param offerId - Product offer ID (packageCode/slug)
 * @param promoCode - Optional promo code (if provided, will use this instead of auto-applied)
 * @returns Pricing calculation result
 */
export async function calculatePricing(
  offerId: string,
  promoCode?: string | null
): Promise<PricingResult> {
  try {
    // 1. Fetch product from cache (server-side only)
    const products = await getCachedEsimProducts('SA');
    const product = products.find(
      (p: any) =>
        p.offerId === offerId ||
        p.packageCode === offerId ||
        p.slug === offerId
    );

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    if (!product.enabled) {
      return {
        success: false,
        error: 'Product is not available',
      };
    }

    // 2. Get base price (never modified on client)
    // price.fixed is already in cents, currencyDivisor is for display only
    const priceDivisor = product.price.currencyDivisor || 100;
    const priceAmount = product.price.fixed / priceDivisor;
    const originalPriceCents = Math.round(priceAmount * 100);
    const currency = product.price.currency || 'USD';

    // 3. Get minimum sell price (cost + minimum profit floor)
    const costCents =
      typeof product.costPrice?.fixed === 'number'
        ? Math.round((product.costPrice.fixed / priceDivisor) * 100)
        : null;
    const minSellCents = costCents !== null ? costCents + getMinProfitCents() : 0;

    // 4. Get active promotion
    const normalizedPromoCode = promoCode ? normalizeDiscountCode(promoCode) : null;
    const promotion = await getActivePromotion('esim', normalizedPromoCode);

    // 5. If no promotion found and no code provided, try auto-applied promotion
    let activePromotion = promotion;
    if (!activePromotion && !normalizedPromoCode) {
      activePromotion = await getActivePromotion('esim', null);
    }

    // 6. Calculate volume discount (applied before promotions)
    const volumeDiscount = calculateVolumeDiscount(originalPriceCents);
    let priceAfterVolumeDiscount = originalPriceCents;
    let volumeDiscountAmountCents = 0;

    if (volumeDiscount) {
      const volumeDiscountCalc = applyPercentDiscountWithFloor({
        totalCents: originalPriceCents,
        percentOff: volumeDiscount.percent,
        minTotalCents: minSellCents,
      });
      priceAfterVolumeDiscount = volumeDiscountCalc.discountedTotalCents;
      volumeDiscountAmountCents = volumeDiscountCalc.discountAmountCents;
    }

    // 7. Validate and apply promotion (on price after volume discount)
    let discountPercent = volumeDiscount?.percent || 0;
    let discountAmountCents = volumeDiscountAmountCents;
    let finalPriceCents = priceAfterVolumeDiscount;
    let appliedPromotion = undefined;

    if (activePromotion) {
      const validation = validatePromotion(activePromotion, originalPriceCents);
      if (!validation.valid) {
        if (normalizedPromoCode) {
          // If user provided a code, return error
          return {
            success: false,
            error: validation.error || 'Promotion is not valid',
          };
        }
        // If auto-applied, just continue without promotion discount
      } else {
        // Apply promotion discount on the price after volume discount
        const promotionDiscountCalc = applyPercentDiscountWithFloor({
          totalCents: priceAfterVolumeDiscount,
          percentOff: activePromotion.discount_percent,
          minTotalCents: minSellCents,
        });

        const promotionDiscountAmount = promotionDiscountCalc.discountAmountCents;
        finalPriceCents = promotionDiscountCalc.discountedTotalCents;

        // Apply maximum discount cap if set
        if (activePromotion.max_discount_amount_cents !== null) {
          const maxDiscount = activePromotion.max_discount_amount_cents;
          if (promotionDiscountAmount > maxDiscount) {
            finalPriceCents = priceAfterVolumeDiscount - maxDiscount;
          }
        }

        // Total discount is volume + promotion
        discountAmountCents = volumeDiscountAmountCents + (priceAfterVolumeDiscount - finalPriceCents);
        discountPercent = originalPriceCents > 0
          ? Math.round((discountAmountCents / originalPriceCents) * 100)
          : (volumeDiscount?.percent || 0);

        appliedPromotion = {
          id: activePromotion.id,
          name: activePromotion.name,
          code: activePromotion.promo_code,
          discountPercent: activePromotion.discount_percent,
        };
      }
    }

    // 8. Ensure final price meets minimum
    if (finalPriceCents < minSellCents) {
      finalPriceCents = minSellCents;
      discountAmountCents = originalPriceCents - finalPriceCents;
      discountPercent = originalPriceCents > 0
        ? Math.round((discountAmountCents / originalPriceCents) * 100)
        : 0;
    }

    return {
      success: true,
      originalPriceCents,
      discountPercent,
      discountAmountCents,
      finalPriceCents,
      currency,
      promotionId: appliedPromotion?.id,
      promotionName: appliedPromotion?.name,
      promoCode: appliedPromotion?.code || undefined,
      appliedPromotion,
      volumeDiscount,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to calculate pricing',
    };
  }
}

/**
 * Calculate pricing for multiple products (cart)
 * 
 * @param items - Array of { offerId, quantity }
 * @param promoCode - Optional promo code
 * @returns Pricing calculation result
 */
export async function calculateCartPricing(
  items: Array<{ offerId: string; quantity: number }>,
  promoCode?: string | null
): Promise<PricingResult> {
  try {
    if (!items || items.length === 0) {
      return {
        success: false,
        error: 'No items provided',
      };
    }

    // Fetch all products
    const products = await getCachedEsimProducts('SA');
    let totalOriginalCents = 0;
    let currency = 'USD';

    for (const item of items) {
      const product = products.find(
        (p: any) =>
          p.offerId === item.offerId ||
          p.packageCode === item.offerId ||
          p.slug === item.offerId
      );

      if (!product || !product.enabled) {
        return {
          success: false,
          error: `Product not found: ${item.offerId}`,
        };
      }

      const priceDivisor = product.price.currencyDivisor || 100;
      const priceCents = Math.round((product.price.fixed / priceDivisor) * 100);
      totalOriginalCents += priceCents * item.quantity;
      currency = product.price.currency || currency;
    }

    // Get minimum sell price
    // For cart, we calculate based on total cost
    const minSellCents = getMinProfitCents(); // Simplified for cart

    // Get active promotion
    const normalizedPromoCode = promoCode ? normalizeDiscountCode(promoCode) : null;
    const promotion = await getActivePromotion('cart', normalizedPromoCode);

    // If no promotion found and no code provided, try auto-applied
    let activePromotion = promotion;
    if (!activePromotion && !normalizedPromoCode) {
      activePromotion = await getActivePromotion('cart', null);
    }

    // Calculate volume discount (applied before promotions)
    const volumeDiscount = calculateVolumeDiscount(totalOriginalCents);
    let priceAfterVolumeDiscount = totalOriginalCents;
    let volumeDiscountAmountCents = 0;

    if (volumeDiscount) {
      const volumeDiscountCalc = applyPercentDiscountWithFloor({
        totalCents: totalOriginalCents,
        percentOff: volumeDiscount.percent,
        minTotalCents: minSellCents,
      });
      priceAfterVolumeDiscount = volumeDiscountCalc.discountedTotalCents;
      volumeDiscountAmountCents = volumeDiscountCalc.discountAmountCents;
    }

    // Apply promotion (on price after volume discount)
    let discountPercent = volumeDiscount?.percent || 0;
    let discountAmountCents = volumeDiscountAmountCents;
    let finalPriceCents = priceAfterVolumeDiscount;
    let appliedPromotion = undefined;

    if (activePromotion) {
      const validation = validatePromotion(activePromotion, totalOriginalCents);
      if (!validation.valid) {
        if (normalizedPromoCode) {
          return {
            success: false,
            error: validation.error || 'Promotion is not valid',
          };
        }
      } else {
        // Apply promotion discount on the price after volume discount
        const promotionDiscountCalc = applyPercentDiscountWithFloor({
          totalCents: priceAfterVolumeDiscount,
          percentOff: activePromotion.discount_percent,
          minTotalCents: minSellCents,
        });

        const promotionDiscountAmount = promotionDiscountCalc.discountAmountCents;
        finalPriceCents = promotionDiscountCalc.discountedTotalCents;

        if (activePromotion.max_discount_amount_cents !== null) {
          const maxDiscount = activePromotion.max_discount_amount_cents;
          if (promotionDiscountAmount > maxDiscount) {
            finalPriceCents = priceAfterVolumeDiscount - maxDiscount;
          }
        }

        // Total discount is volume + promotion
        discountAmountCents = volumeDiscountAmountCents + (priceAfterVolumeDiscount - finalPriceCents);
        discountPercent = totalOriginalCents > 0
          ? Math.round((discountAmountCents / totalOriginalCents) * 100)
          : (volumeDiscount?.percent || 0);

        appliedPromotion = {
          id: activePromotion.id,
          name: activePromotion.name,
          code: activePromotion.promo_code,
          discountPercent: activePromotion.discount_percent,
        };
      }
    }

    // Ensure minimum
    if (finalPriceCents < minSellCents) {
      finalPriceCents = minSellCents;
      discountAmountCents = totalOriginalCents - finalPriceCents;
      discountPercent = totalOriginalCents > 0
        ? Math.round((discountAmountCents / totalOriginalCents) * 100)
        : 0;
    }

    return {
      success: true,
      originalPriceCents: totalOriginalCents,
      discountPercent,
      discountAmountCents,
      finalPriceCents,
      currency,
      promotionId: appliedPromotion?.id,
      promotionName: appliedPromotion?.name,
      promoCode: appliedPromotion?.code || undefined,
      appliedPromotion,
      volumeDiscount,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to calculate cart pricing',
    };
  }
}
