/**
 * Active Promotions API
 * 
 * Lightweight endpoint to check if any promotions are currently active.
 * Used by promotional banner component for fast status checks.
 * Falls back to Ramadan promo (Hijri-based) when no DB promotion is active.
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
import { isRamadanPromoActive } from '@/lib/ramadan-promo';
import { getRamadanPromoEndDate } from '@/lib/hijri-calendar';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    if (isSupabaseAdminReady()) {
      // Check for active promotions using database function
      const { data, error } = await supabase
        .rpc('get_active_promotion', {
          p_applies_to: 'esim',
          p_promo_code: null,
          p_check_time: new Date().toISOString(),
        })
        .maybeSingle();

      if (!error && data && typeof data === 'object' && 'id' in data && typeof (data as any).id === 'string') {
        const promotionId = (data as any).id;
        const { data: fullPromo } = await supabase
          .from('promotions')
          .select('name, discount_percent, ends_at')
          .eq('id', promotionId)
          .single();

        if (fullPromo) {
          return NextResponse.json({
            active: true,
            name: fullPromo.name,
            discountPercent: fullPromo.discount_percent,
            endsAt: fullPromo.ends_at,
          });
        }
      }

      if (error) {
        const now = new Date().toISOString();
        const { data: fallbackData } = await supabase
          .from('promotions')
          .select('name, discount_percent, ends_at')
          .eq('is_active', true)
          .is('promo_code', null)
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
      }
    }

    // Ramadan fallback: show banner and countdown when in Ramadan promo period (15 Sha'ban → end Ramadan)
    const ramadanActive = await isRamadanPromoActive();
    if (ramadanActive) {
      const endDate = getRamadanPromoEndDate();
      const endsAt = endDate
        ? (() => {
            const eod = new Date(endDate);
            eod.setHours(23, 59, 59, 999);
            return eod.toISOString();
          })()
        : undefined;
      return NextResponse.json({
        active: true,
        name: 'Ramadan Blessing',
        discountPercent: 10,
        endsAt,
      });
    }

    return NextResponse.json({
      active: false,
    });
  } catch (error) {
    return NextResponse.json({
      active: false,
    });
  }
}
