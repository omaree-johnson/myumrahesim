import { NextResponse } from "next/server";
import { getEsimProducts } from "@/lib/zendit";

/**
 * GET /api/products
 * Returns available eSIM products from Zendit
 */
export async function GET() {
  try {
    const data = await getEsimProducts();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
