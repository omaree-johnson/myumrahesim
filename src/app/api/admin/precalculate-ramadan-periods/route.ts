/**
 * Admin API: Pre-calculate Ramadan Promo Periods
 * 
 * POST /api/admin/precalculate-ramadan-periods
 * 
 * Body: { years?: number, startHijriYear?: number }
 * 
 * Pre-calculates and stores Gregorian date ranges for Ramadan promo periods.
 * This should be run annually or when setting up the system.
 * 
 * Security: In production, add authentication/authorization checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { precalculateRamadanPeriods } from '@/lib/ramadan-promo';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // TODO: Add authentication/authorization check in production
    // const { requireAdmin } = await import('@/lib/authorization');
    // await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const years = typeof body.years === 'number' ? Math.min(50, Math.max(1, body.years)) : 10;
    const startHijriYear = typeof body.startHijriYear === 'number' ? body.startHijriYear : undefined;

    const result = await precalculateRamadanPeriods(years, startHijriYear);

    return NextResponse.json({
      success: true,
      calculated: result.success,
      failed: result.failed,
      total: years,
    });
  } catch (error) {
    console.error('[Admin] Error pre-calculating Ramadan periods:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
