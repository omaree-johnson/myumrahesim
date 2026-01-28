/**
 * Hijri Calendar Utilities
 * Handles conversion between Hijri (Islamic) and Gregorian calendars
 * for time-bound promotional discounts
 */

// Import hijri-date to extend Date prototype
import 'hijri-date';
import HijriDate from 'hijri-date';

/**
 * Check if the current date falls within the Ramadan promotional period
 * Promo period: From 15 Sha'ban until the end of Ramadan (inclusive)
 * 
 * @returns true if promo is active, false otherwise
 */
export function isRamadanPromoActive(): boolean {
  try {
    const today = new Date();
    const hijriToday = (today as any).toHijri();
    
    // Get current Hijri year, month, and day
    const currentYear = hijriToday.getFullYear();
    const currentMonth = hijriToday.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    const currentDay = hijriToday.getDate();
    
    // Promo starts: 15 Sha'ban (month 8)
    const promoStartMonth = 8; // Sha'ban
    const promoStartDay = 15;
    
    // Promo ends: Last day of Ramadan (month 9)
    const promoEndMonth = 9; // Ramadan
    
    // Check if we're in the promo period
    // Case 1: After 15 Sha'ban but before Ramadan
    if (currentMonth === promoStartMonth && currentDay >= promoStartDay) {
      return true;
    }
    
    // Case 2: During Ramadan (entire month)
    if (currentMonth === promoEndMonth) {
      return true;
    }
    
    // Case 3: Between Sha'ban and Ramadan (shouldn't happen, but handle edge case)
    if (currentMonth > promoStartMonth && currentMonth < promoEndMonth) {
      return true;
    }
    
    return false;
  } catch (error) {
    // If conversion fails, default to false (promo inactive)
    // This ensures we don't accidentally apply discounts
    return false;
  }
}

/**
 * Get the promo start date (15 Sha'ban) in Gregorian calendar for the current Hijri year
 * @returns Date object or null if conversion fails
 */
export function getRamadanPromoStartDate(): Date | null {
  try {
    const today = new Date();
    const hijriToday = (today as any).toHijri();
    const currentHijriYear = hijriToday.getFullYear();
    
    // 15 Sha'ban of current Hijri year
    const hijriStartDate = new HijriDate(currentHijriYear, 8, 15);
    const gregorianStartDate = hijriStartDate.toGregorian();
    return gregorianStartDate;
  } catch (error) {
    return null;
  }
}

/**
 * Get the promo end date (last day of Ramadan) in Gregorian calendar for the current Hijri year
 * @returns Date object or null if conversion fails
 */
export function getRamadanPromoEndDate(): Date | null {
  try {
    const today = new Date();
    const hijriToday = (today as any).toHijri();
    const currentHijriYear = hijriToday.getFullYear();
    
    // Last day of Ramadan (month 9) - Ramadan has 30 days
    const hijriEndDate = new HijriDate(currentHijriYear, 9, 30);
    const gregorianEndDate = hijriEndDate.toGregorian();
    return gregorianEndDate;
  } catch (error) {
    return null;
  }
}
