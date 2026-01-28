/**
 * Ramadan Promotional Discount - Robust Date Determination
 * 
 * Hybrid approach: Pre-calculated DB ranges (primary) + Runtime conversion (fallback)
 * 
 * This ensures:
 * - Fast lookups (database primary)
 * - Automatic fallback if DB missing
 * - Self-healing (auto-calculates missing ranges)
 * - Production-safe (fail-safe defaults)
 */

import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';
import { isRamadanPromoActive as isRamadanPromoActiveRuntime, getRamadanPromoStartDate, getRamadanPromoEndDate } from './hijri-calendar';
import HijriDate from 'hijri-date';

/**
 * Check if Ramadan promo is active using database ranges (fast path)
 * Returns null if no range found in DB
 */
async function isRamadanPromoActiveFromDB(): Promise<boolean | null> {
  if (!isSupabaseAdminReady()) {
    return null;
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Use SQL function for fast lookup (if available)
    const { data: sqlResult, error: sqlError } = await supabase
      .rpc('is_ramadan_promo_active')
      .maybeSingle();

    if (!sqlError && sqlResult !== null && typeof sqlResult === 'boolean') {
      return sqlResult;
    }

    // Fallback to direct query if SQL function not available
    // Find period where: start_date <= today <= end_date
    // Using Supabase query: both conditions must be true (AND)
    const { data, error } = await supabase
      .from('ramadan_promo_periods')
      .select('start_date, end_date')
      .lte('start_date', today)  // start_date <= today (promo has started)
      .gte('end_date', today)    // end_date >= today (promo hasn't ended)
      .order('hijri_year', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return null;
    }

    if (data) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const now = new Date();
      
      // Ensure we're comparing dates only (ignore time)
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      return todayDate >= startDateOnly && todayDate <= endDateOnly;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Calculate and store Ramadan promo period for a given Hijri year
 */
async function calculateAndStoreRamadanPeriod(hijriYear: number): Promise<boolean> {
  if (!isSupabaseAdminReady()) {
    return false;
  }

  try {
    // Calculate 15 Sha'ban
    const hijriStartDate = new HijriDate(hijriYear, 8, 15);
    const gregorianStart = hijriStartDate.toGregorian();
    
    // Calculate last day of Ramadan (30th day)
    const hijriEndDate = new HijriDate(hijriYear, 9, 30);
    const gregorianEnd = hijriEndDate.toGregorian();

    const startDateStr = gregorianStart.toISOString().split('T')[0];
    const endDateStr = gregorianEnd.toISOString().split('T')[0];

    const { error } = await supabase
      .from('ramadan_promo_periods')
      .upsert({
        hijri_year: hijriYear,
        start_date: startDateStr,
        end_date: endDateStr,
        calculated_by: 'system-auto',
        verified: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'hijri_year',
      });

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Main function: Check if Ramadan promo is active
 * 
 * Strategy:
 * 1. Try database lookup first (fast)
 * 2. If not found, use runtime conversion (fallback)
 * 3. Auto-calculate and store missing range for next time
 * 
 * @returns true if promo is active, false otherwise
 */
export async function isRamadanPromoActive(): Promise<boolean> {
  // Try database first (fast path)
  const dbResult = await isRamadanPromoActiveFromDB();
  
  if (dbResult !== null) {
    // Database lookup succeeded
    return dbResult;
  }

  // Fallback to runtime conversion
  const runtimeResult = isRamadanPromoActiveRuntime();
  
  // If promo is active but DB entry missing, calculate and store it
  if (runtimeResult) {
    try {
      const today = new Date();
      const hijriToday = (today as any).toHijri();
      const currentHijriYear = hijriToday.getFullYear();
      
      // Auto-calculate and store for this year
      await calculateAndStoreRamadanPeriod(currentHijriYear);
    } catch (error) {
      // If calculation fails, still return runtime result
      // This ensures promo works even if DB storage fails
    }
  }

  return runtimeResult;
}

/**
 * Pre-calculate Ramadan promo periods for multiple years
 * Useful for annual maintenance or initial setup
 * 
 * @param years - Number of years to pre-calculate (default: 10)
 * @param startHijriYear - Starting Hijri year (default: current year)
 */
export async function precalculateRamadanPeriods(
  years: number = 10,
  startHijriYear?: number
): Promise<{ success: number; failed: number }> {
  if (!isSupabaseAdminReady()) {
    throw new Error('Database not configured');
  }

  let currentHijriYear: number;
  if (startHijriYear) {
    currentHijriYear = startHijriYear;
  } else {
    const today = new Date();
    const hijriToday = (today as any).toHijri();
    currentHijriYear = hijriToday.getFullYear();
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < years; i++) {
    const hijriYear = currentHijriYear + i;
    const stored = await calculateAndStoreRamadanPeriod(hijriYear);
    
    if (stored) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Get the active promo period details (if any)
 */
export async function getActiveRamadanPromoPeriod(): Promise<{
  hijriYear: number;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
} | null> {
  if (!isSupabaseAdminReady()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .rpc('get_active_ramadan_promo_period')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      hijriYear: (data as any).hijri_year,
      startDate: new Date((data as any).start_date),
      endDate: new Date((data as any).end_date),
      daysRemaining: (data as any).days_remaining,
    };
  } catch (error) {
    return null;
  }
}
