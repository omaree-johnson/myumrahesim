import { NextRequest, NextResponse } from "next/server";
import { getProfitMargin, calculatePrice } from "@/lib/pricing-config";
import { getCachedEsimProducts } from "@/lib/products-cache";

/**
 * GET /api/test-pricing
 * Test endpoint to verify pricing is working correctly
 * Shows current profit margin and sample price calculations
 */
export async function GET(req: NextRequest) {
  try {
    const profitMargin = getProfitMargin();
    const testBasePrice = 10.0; // $10.00
    const pricing = calculatePrice(testBasePrice);
    
    // Get a sample product to show actual pricing
    const products = await getCachedEsimProducts("SA");
    const sampleProduct = products[0];
    
    return NextResponse.json({
      success: true,
      configuration: {
        profitMargin,
        profitMarginPercent: `${((profitMargin - 1) * 100).toFixed(0)}%`,
        minProfitCents: process.env.ESIMACCESS_MIN_PROFIT_CENTS || "0",
        envVar: process.env.ESIMACCESS_PROFIT_MARGIN || "not set (using default 1.35)",
      },
      testCalculation: {
        basePrice: `$${testBasePrice.toFixed(2)}`,
        costCents: pricing.costCents,
        finalPriceCents: pricing.finalPriceCents,
        finalPrice: `$${(pricing.finalPriceCents / 100).toFixed(2)}`,
        profit: `$${((pricing.finalPriceCents - pricing.costCents) / 100).toFixed(2)}`,
        effectiveMargin: `${((pricing.effectiveProfitMargin - 1) * 100).toFixed(2)}%`,
        appliedMinProfit: pricing.appliedMinProfit,
      },
      sampleProduct: sampleProduct ? {
        name: sampleProduct.shortNotes || sampleProduct.name,
        costPrice: sampleProduct.costPrice ? `$${(sampleProduct.costPrice.fixed / 100).toFixed(2)}` : "N/A",
        sellingPrice: `$${(sampleProduct.price.fixed / 100).toFixed(2)}`,
        profitMargin: sampleProduct.profitMargin ? `${((sampleProduct.profitMargin - 1) * 100).toFixed(2)}%` : "N/A",
      } : null,
      cacheInfo: {
        nodeEnv: process.env.NODE_ENV,
        cacheDisabled: process.env.NODE_ENV !== 'production',
      },
    });
  } catch (error) {
    console.error('[Test Pricing] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
