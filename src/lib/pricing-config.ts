/**
 * Pricing Configuration
 * Centralized pricing logic that reads profit margin dynamically
 * This ensures price changes are reflected immediately
 */

/**
 * Get profit margin from environment variable
 * Reads dynamically on each call - no caching
 */
export function getProfitMargin(): number {
  // Default to 45% profit margin (1.45) if not set
  const marginStr = process.env.ESIMACCESS_PROFIT_MARGIN || "1.45";
  const margin = parseFloat(marginStr);
  
  if (isNaN(margin) || margin <= 0) {
    return 1.45;
  }
  
  return margin;
}

/**
 * Get minimum profit floor from environment variable
 * Reads dynamically on each call
 */
export function getMinProfitCents(): number {
  const minProfitStr = process.env.ESIMACCESS_MIN_PROFIT_CENTS || "0";
  const minProfit = parseInt(minProfitStr, 10);
  
  if (isNaN(minProfit) || minProfit < 0) {
    return 0;
  }
  
  return minProfit;
}

/**
 * Apply pricing rules to a base price
 * @param basePrice - Base price in currency units (e.g., $10.00)
 * @returns Pricing calculation result
 */
export function calculatePrice(basePrice: number) {
  const profitMargin = getProfitMargin();
  const minProfitCents = getMinProfitCents();
  
  // Convert to cents for precise calculation
  const costCents = Math.round(basePrice * 100);
  
  // Calculate price with margin
  const priceWithMarginCents = Math.round(costCents * profitMargin);
  
  // Calculate price with minimum profit floor
  const priceWithMinProfitCents = costCents + minProfitCents;
  
  // Use whichever is higher (margin-based or minimum profit)
  const finalPriceCents = Math.max(priceWithMarginCents, priceWithMinProfitCents);
  
  // Calculate effective margin
  const effectiveProfitMargin = costCents > 0 ? finalPriceCents / costCents : profitMargin;
  const appliedMinProfit = minProfitCents > 0 && finalPriceCents === priceWithMinProfitCents;
  
  return {
    costCents,
    finalPriceCents,
    effectiveProfitMargin,
    appliedMinProfit,
  };
}
