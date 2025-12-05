import { NextRequest, NextResponse } from "next/server";
import { getEsimProducts } from "@/lib/esimaccess";
import { checkRateLimit, getClientIP } from "@/lib/security";

/**
 * GET /api/products
 * Returns available eSIM products from the provider API (eSIM Access)
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

    // Only Saudi Arabia eSIMs
    const data = await getEsimProducts("SA");
    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString()
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
