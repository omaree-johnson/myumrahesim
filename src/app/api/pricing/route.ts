/**
 * Server-Side Pricing API
 * 
 * Calculates pricing for Umrah eSIM purchases with promotions.
 * All pricing logic is server-side only - base prices are never modified on the client.
 * 
 * POST /api/pricing
 * Body: { offerId: string, promoCode?: string }
 * 
 * Returns:
 * {
 *   success: true,
 *   originalPriceCents: number,
 *   discountPercent: number,
 *   discountAmountCents: number,
 *   finalPriceCents: number,
 *   currency: string,
 *   promotionId?: string,
 *   promotionName?: string,
 *   promoCode?: string,
 *   appliedPromotion?: { ... }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePricing } from '@/lib/pricing-calculator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { offerId, promoCode } = body;

    // Validate input
    if (!offerId || typeof offerId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'offerId is required' },
        { status: 400 }
      );
    }

    // Calculate pricing (server-side only)
    const result = await calculatePricing(offerId, promoCode);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to calculate pricing',
      },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({
    message: 'Pricing API - Use POST method with { offerId, promoCode? }',
  });
}
