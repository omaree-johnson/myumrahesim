import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * POST /api/revalidate-products
 * Manually revalidate the product cache
 * Useful when profit margins or product data changes
 * 
 * Security: In production, you may want to add authentication
 */
export async function POST(req: NextRequest) {
  try {
    // Revalidate the product cache tags
    revalidateTag('esim-products', 'max');
    revalidateTag('esim-products-SA', 'max');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product cache revalidated. New prices will appear on next request.' 
    });
  } catch (error) {
    console.error('[Cache] Error revalidating cache:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revalidate-products
 * Same as POST, but for convenience
 */
export async function GET(req: NextRequest) {
  return POST(req);
}
