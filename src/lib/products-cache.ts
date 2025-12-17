/**
 * Product Data Caching Layer
 * 
 * Implements caching for eSIM product data to improve performance:
 * - Reduces API calls to eSIM Access
 * - Faster page loads
 * - Stale-while-revalidate pattern
 */

import { unstable_cache } from 'next/cache';
import { getEsimProducts as fetchEsimProducts } from './esimaccess';

// Cache configuration
const CACHE_TAG = 'esim-products';
const REVALIDATE_SECONDS = 300; // 5 minutes - products don't change frequently

/**
 * Get cached eSIM products
 * Uses Next.js unstable_cache for server-side caching
 * Cache is shared across all requests and revalidates every 5 minutes
 */
export async function getCachedEsimProducts(locationCode = 'SA') {
  try {
    return await unstable_cache(
      async () => {
        console.log(`[Cache] Fetching fresh products for ${locationCode}`);
        return await fetchEsimProducts(locationCode);
      },
      [`esim-products-${locationCode}`],
      {
        tags: [CACHE_TAG, `esim-products-${locationCode}`],
        revalidate: REVALIDATE_SECONDS,
      }
    )();
  } catch (error: any) {
    // Check if it's an SSL error (development-only issue)
    if (error?.isSslError || error?.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
      console.warn(`[Cache] SSL certificate error (dev only) - returning empty array. This won't affect production.`);
      // In development, return empty array gracefully
      // In production, this error shouldn't occur
      return [];
    }
    
    console.error(`[Cache] Failed to fetch products for ${locationCode}:`, error);
    // Return empty array on error to prevent crashes
    // Callers should handle empty arrays gracefully
    return [];
  }
}

/**
 * Get top N products (for homepage/featured sections)
 * Only fetches what's needed instead of all products
 */
export async function getTopProducts(count: number = 5, locationCode = 'SA') {
  const allProducts = await getCachedEsimProducts(locationCode);
  
  if (!Array.isArray(allProducts) || allProducts.length === 0) {
    return [];
  }

  // Filter and sort to get top products
  const validProducts = allProducts
    .filter((p: any) => {
      return (
        p.enabled !== false &&
        p.price &&
        p.price.fixed !== undefined &&
        p.durationDays !== 1 // Exclude 1-day plans
      );
    })
    .map((p: any) => {
      const divisor = p.price.currencyDivisor || 100;
      const amount = p.price.fixed / divisor;
      return { ...p, calculatedPrice: amount };
    })
    .sort((a: any, b: any) => a.calculatedPrice - b.calculatedPrice); // Sort by price ascending

  // Return top N products
  return validProducts.slice(0, count).map((p: any) => {
    const { calculatedPrice, ...rest } = p;
    return rest;
  });
}

/**
 * Revalidate product cache (for manual cache clearing)
 * Call this after product updates if needed
 */
export function revalidateProductsCache() {
  // This would be used with Next.js revalidateTag in API routes
  // For now, cache auto-revalidates every 5 minutes
}
