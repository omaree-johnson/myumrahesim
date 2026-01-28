/**
 * Server-Side Cart Pricing API
 * 
 * Calculates pricing for multiple eSIM products (cart) with promotions.
 * All pricing logic is server-side only.
 * 
 * POST /api/pricing/cart
 * Body: { items: [{ offerId: string, quantity: number }], promoCode?: string }
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
import { calculateCartPricing } from '@/lib/pricing-calculator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, promoCode } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'items array is required' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.offerId || typeof item.offerId !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Each item must have a valid offerId' },
          { status: 400 }
        );
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        return NextResponse.json(
          { success: false, error: 'Each item must have a valid quantity (>= 1)' },
          { status: 400 }
        );
      }
    }

    // Calculate pricing (server-side only)
    const result = await calculateCartPricing(items, promoCode);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to calculate cart pricing',
      },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({
    message: 'Cart Pricing API - Use POST method with { items: [{ offerId, quantity }], promoCode? }',
  });
}
