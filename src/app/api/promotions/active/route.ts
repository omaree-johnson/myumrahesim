/**
 * Active Promotions API
 * 
 * Lightweight endpoint to check if any promotions are currently active.
 * Used by promotional banner component for fast status checks.
 * 
 * GET /api/promotions/active
 * 
 * Returns:
 * {
 *   active: boolean,
 *   name?: string,
 *   discountPercent?: number,
 *   endsAt?: string (ISO timestamp)
 * }
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!isSupabaseAdminReady()) {
      return NextResponse.json({
        active: false,
      });
    }

    // Check for active promotions using database function
    const { data, error } = await supabase
      .rpc('get_active_promotion', {
        p_applies_to: 'esim',
        p_promo_code: null, // Check for auto-applied promotions
        p_check_time: new Date().toISOString(),
      })
      .maybeSingle();

    if (error) {
      // Fallback to direct query
      const now = new Date().toISOString();
      const { data: fallbackData } = await supabase
        .from('promotions')
        .select('name, discount_percent, ends_at')
        .eq('is_active', true)
        .is('promo_code', null) // Auto-applied only
        .lte('starts_at', now)
        .gte('ends_at', now)
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fallbackData) {
        return NextResponse.json({
          active: true,
          name: fallbackData.name,
          discountPercent: fallbackData.discount_percent,
          endsAt: fallbackData.ends_at,
        });
      }

      return NextResponse.json({
        active: false,
      });
    }

    if (!data || typeof data !== 'object' || !('id' in data) || typeof (data as any).id !== 'string') {
      return NextResponse.json({
        active: false,
      });
    }

    // Fetch full promotion details
    const promotionId = (data as any).id;
    const { data: fullPromo } = await supabase
      .from('promotions')
      .select('name, discount_percent, ends_at')
      .eq('id', promotionId)
      .single();

    if (!fullPromo) {
      return NextResponse.json({
        active: false,
      });
    }

    return NextResponse.json({
      active: true,
      name: fullPromo.name,
      discountPercent: fullPromo.discount_percent,
      endsAt: fullPromo.ends_at,
    });
  } catch (error) {
    return NextResponse.json({
      active: false,
    });
  }
}
