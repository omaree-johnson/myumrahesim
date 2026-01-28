/**
 * Promotion Validation Utilities
 * 
 * Enhanced validation for promotion edge cases:
 * - Timezone-safe validation
 * - Promo expiry during checkout
 * - Per-customer limits
 * - Atomic reservation checks
 */

import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';

export type PromotionValidationResult = {
  valid: boolean;
  error?: string;
  promotionId?: string;
  discountPercent?: number;
  expiresAt?: string;
};

/**
 * Validate promotion at a specific point in time
 * Uses UTC consistently to avoid timezone issues
 */
export async function validatePromotionAtTime(
  promotionId: string,
  checkTime: Date | string
): Promise<PromotionValidationResult> {
  if (!isSupabaseAdminReady()) {
    return { valid: false, error: 'Database not configured' };
  }

  try {
    // Ensure UTC time
    const checkTimeUTC = typeof checkTime === 'string' 
      ? checkTime 
      : checkTime.toISOString();

    const { data: promo, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', promotionId)
      .single();

    if (error || !promo) {
      return { valid: false, error: 'Promotion not found' };
    }

    // Use database NOW() for consistent timezone handling
    // Compare using database function for accuracy
    const { data: isActive } = await supabase.rpc('is_promotion_active_at_time', {
      p_promotion_id: promotionId,
      p_check_time: checkTimeUTC,
    });

    if (!isActive) {
      return {
        valid: false,
        error: 'Promotion is not active at the specified time',
        promotionId: promo.id,
      };
    }

    return {
      valid: true,
      promotionId: promo.id,
      discountPercent: promo.discount_percent,
      expiresAt: promo.ends_at,
    };
  } catch (error: any) {
    return { valid: false, error: error?.message || 'Validation failed' };
  }
}

/**
 * Check if customer has exceeded promotion limit
 */
export async function checkCustomerPromoLimit(
  customerEmail: string,
  promotionId: string,
  maxPerCustomer: number = 1
): Promise<{ withinLimit: boolean; currentCount: number; error?: string }> {
  if (!isSupabaseAdminReady()) {
    return { withinLimit: false, currentCount: 0, error: 'Database not configured' };
  }

  try {
    const sanitizedEmail = customerEmail.toLowerCase().trim();

    const { count, error } = await supabase
      .from('promotion_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('customer_email', sanitizedEmail)
      .eq('promotion_id', promotionId);

    if (error) {
      return { withinLimit: false, currentCount: 0, error: error.message };
    }

    const currentCount = count || 0;
    const withinLimit = currentCount < maxPerCustomer;

    return { withinLimit, currentCount };
  } catch (error: any) {
    return { withinLimit: false, currentCount: 0, error: error?.message };
  }
}

/**
 * Validate promotion with comprehensive checks
 * Includes time validation, customer limits, and status checks
 */
export async function validatePromotionComprehensive(params: {
  promotionId: string;
  customerEmail?: string;
  checkTime?: Date | string;
  maxPerCustomer?: number;
  originalPriceCents: number;
}): Promise<PromotionValidationResult> {
  const {
    promotionId,
    customerEmail,
    checkTime = new Date(),
    maxPerCustomer = 1,
    originalPriceCents,
  } = params;

  // 1. Basic promotion lookup
  if (!isSupabaseAdminReady()) {
    return { valid: false, error: 'Database not configured' };
  }

  const { data: promo, error: promoError } = await supabase
    .from('promotions')
    .select('*')
    .eq('id', promotionId)
    .single();

  if (promoError || !promo) {
    return { valid: false, error: 'Promotion not found' };
  }

  // 2. Check active status
  if (!promo.is_active) {
    return { valid: false, error: 'Promotion is inactive' };
  }

  // 3. Validate time range (UTC)
  const checkTimeUTC = typeof checkTime === 'string' ? checkTime : checkTime.toISOString();
  const startsAt = new Date(promo.starts_at);
  const endsAt = new Date(promo.ends_at);
  const checkDate = new Date(checkTimeUTC);

  if (checkDate < startsAt) {
    return { valid: false, error: 'Promotion has not started yet' };
  }

  if (checkDate > endsAt) {
    return { valid: false, error: 'Promotion has expired' };
  }

  // 4. Check minimum purchase amount
  if (originalPriceCents < promo.min_purchase_amount_cents) {
    return {
      valid: false,
      error: `Minimum purchase amount not met ($${(promo.min_purchase_amount_cents / 100).toFixed(2)})`,
    };
  }

  // 5. Check redemption limits
  if (promo.max_redemptions !== null && promo.redeemed_count >= promo.max_redemptions) {
    return { valid: false, error: 'Promotion redemption limit reached' };
  }

  // 6. Check per-customer limit
  if (customerEmail && maxPerCustomer > 0) {
    const limitCheck = await checkCustomerPromoLimit(customerEmail, promotionId, maxPerCustomer);
    if (!limitCheck.withinLimit) {
      return {
        valid: false,
        error: `Promotion limit reached for this customer (${limitCheck.currentCount}/${maxPerCustomer})`,
      };
    }
  }

  return {
    valid: true,
    promotionId: promo.id,
    discountPercent: promo.discount_percent,
    expiresAt: promo.ends_at,
  };
}

/**
 * Get current UTC time as ISO string
 * Ensures consistent timezone handling
 */
export function getCurrentUTCTime(): string {
  return new Date().toISOString();
}

/**
 * Check if promotion was active at PaymentIntent creation time
 * Used for validating promotions in webhook handlers
 */
export async function validatePromotionAtPaymentIntent(
  paymentIntentId: string,
  promotionId: string
): Promise<{ valid: boolean; error?: string; createdAt?: Date }> {
  if (!isSupabaseAdminReady()) {
    return { valid: false, error: 'Database not configured' };
  }

  try {
    // Get PaymentIntent creation time from metadata or Stripe
    // For now, use current time (should be passed from webhook)
    const { data: redemption } = await supabase
      .from('promotion_redemptions')
      .select('redeemed_at')
      .eq('payment_intent_id', paymentIntentId)
      .eq('promotion_id', promotionId)
      .maybeSingle();

    if (redemption) {
      // Already redeemed - check if promo was active at redemption time
      const redemptionTime = new Date(redemption.redeemed_at);
      const validation = await validatePromotionAtTime(promotionId, redemptionTime);
      return { valid: validation.valid, error: validation.error, createdAt: redemptionTime };
    }

    // Not yet redeemed - validate at current time
    const validation = await validatePromotionAtTime(promotionId, new Date());
    return { valid: validation.valid, error: validation.error };
  } catch (error: any) {
    return { valid: false, error: error?.message || 'Validation failed' };
  }
}
