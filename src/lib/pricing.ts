import { getEsimProducts } from "@/lib/esimaccess";

/**
 * Get the lowest price from available eSIM products
 * Returns the price in the original currency with proper formatting
 */
export async function getLowestPrice(): Promise<{
  amount: number;
  currency: string;
  formatted: string;
} | null> {
  try {
    const products = await getEsimProducts("SA");
    
    if (!Array.isArray(products) || products.length === 0) {
      return null;
    }

    // Filter for enabled products with valid prices
    const validProducts = products.filter((p: any) => {
      return (
        p.enabled !== false &&
        p.price &&
        p.price.fixed !== undefined &&
        p.durationDays !== 1 // Exclude 1-day plans
      );
    });

    if (validProducts.length === 0) {
      return null;
    }

    // Calculate actual prices and find the lowest
    const prices = validProducts.map((p: any) => {
      const divisor = p.price.currencyDivisor || 100;
      const amount = p.price.fixed / divisor;
      return {
        amount,
        currency: p.price.currency || "USD",
        product: p,
      };
    });

    // Sort by price and get the lowest
    prices.sort((a, b) => a.amount - b.amount);
    const lowest = prices[0];

    // Format the price based on currency
    const formatted = formatPrice(lowest.amount, lowest.currency);

    return {
      amount: lowest.amount,
      currency: lowest.currency,
      formatted,
    };
  } catch (error) {
    console.error("[Pricing] Error fetching lowest price:", error);
    return null;
  }
}

/**
 * Format price based on currency
 */
function formatPrice(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    USD: "$",
    GBP: "£",
    EUR: "€",
    SAR: "SR",
    AED: "د.إ",
  };

  const symbol = currencySymbols[currency.toUpperCase()] || currency.toUpperCase() + " ";
  
  // Format to 2 decimal places
  const formattedAmount = amount.toFixed(2);
  
  // For currencies that typically put symbol before (USD, GBP, EUR)
  if (["USD", "GBP", "EUR", "SAR"].includes(currency.toUpperCase())) {
    return `${symbol}${formattedAmount}`;
  }
  
  // For other currencies, put symbol after
  return `${formattedAmount} ${symbol}`.trim();
}

