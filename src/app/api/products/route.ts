import { NextRequest, NextResponse } from "next/server";
import { getCachedEsimProducts } from "@/lib/products-cache";
import { checkRateLimit, getClientIP } from "@/lib/security";

// Performance optimization: This route is dynamic (uses request headers for rate limiting)
// Response caching is handled via Cache-Control headers in the response
export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Returns available eSIM products from the provider API (eSIM Access)
 * 
 * Performance: This endpoint is cached for 5 minutes to reduce API calls
 * and improve response times. The cache is shared across all requests.
 */
export async function GET(req: NextRequest) {
  try {
    // Rate limiting - more lenient for product listing
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`products:${clientIP}`, 30, 60000); // 30 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString()
          }
        }
      );
    }

    // Only Saudi Arabia eSIMs (cached for performance)
    const data = await getCachedEsimProducts("SA");
    return NextResponse.json(data, {
      headers: {
        // Rate limiting headers
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
        // Performance: Cache API response for 5 minutes (matches server cache)
        // stale-while-revalidate allows serving stale content while revalidating
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        // CORS headers for API access
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    });
  } catch (err: any) {
    console.error("Error fetching products:", err);
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to fetch products. Please try again later." },
      { status: 500 }
    );
  }
}
