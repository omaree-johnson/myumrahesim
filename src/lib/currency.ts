/**
 * Currency Conversion Utilities
 * Handles currency conversion for popular currencies used by Umrah travelers
 */

// Popular currencies for Umrah travelers
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'BGD', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

// Exchange rates (fallback rates - 1 USD = X other currency)
// These are updated from API, but serve as fallback
const DEFAULT_RATES: Record<string, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  SAR: 3.75,
  AED: 3.67,
  INR: 83.0,
  PKR: 278.0,
  BGD: 110.0,
  IDR: 15600.0,
  MYR: 4.75,
};

// Cache key for localStorage
const RATES_CACHE_KEY = 'exchangeRates';
const RATES_CACHE_TIME_KEY = 'exchangeRatesTime';
const CURRENCY_PREFERENCE_KEY = 'preferredCurrency';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Get exchange rates from cache or API
 */
export async function getExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
  // Only run on client side
  if (typeof window === 'undefined') {
    return DEFAULT_RATES;
  }

  // Check cache first
  try {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    const cacheTime = localStorage.getItem(RATES_CACHE_TIME_KEY);
    
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime, 10);
      if (age < CACHE_DURATION) {
        const rates = JSON.parse(cached);
        // Ensure base currency rate exists
        if (rates[baseCurrency] || baseCurrency === 'USD') {
          return rates;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to read cached rates:', error);
  }

  // Fetch fresh rates from API
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.rates) {
      // Cache the rates
      try {
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(data.rates));
        localStorage.setItem(RATES_CACHE_TIME_KEY, Date.now().toString());
      } catch (error) {
        console.warn('Failed to cache rates:', error);
      }
      
      return data.rates;
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rates:', error);
    // Return default rates on error
  }

  return DEFAULT_RATES;
}

/**
 * Convert price from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (!amount || isNaN(amount)) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  // Normalize currency codes to uppercase
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  
  // If same currency, no conversion needed
  if (from === to) return amount;
  
  // Convert to USD first (base currency)
  const usdAmount = from === 'USD' 
    ? amount 
    : amount / (rates[from] || DEFAULT_RATES[from] || 1);
  
  // Convert from USD to target currency
  const targetRate = rates[to] || DEFAULT_RATES[to] || 1;
  const converted = usdAmount * targetRate;
  
  // Round to 2 decimal places
  return Math.round(converted * 100) / 100;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currencyCode: CurrencyCode): string {
  if (!amount || isNaN(amount)) return '0.00';
  
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  const symbol = currency?.symbol || currencyCode;
  
  // Format number based on currency
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  // Some currencies put symbol after
  if (['INR', 'PKR', 'BGD', 'IDR'].includes(currencyCode)) {
    return `${formatted} ${symbol}`;
  }
  
  return `${symbol}${formatted}`;
}

/**
 * Get user's preferred currency from localStorage
 */
export function getPreferredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  
  try {
    const saved = localStorage.getItem(CURRENCY_PREFERENCE_KEY);
    if (saved && SUPPORTED_CURRENCIES.some(c => c.code === saved)) {
      return saved as CurrencyCode;
    }
  } catch (error) {
    console.warn('Failed to read preferred currency:', error);
  }
  
  // Try to detect from browser locale
  try {
    const locale = navigator.language || 'en-US';
    if (locale.includes('GB')) return 'GBP';
    if (locale.includes('EU') || locale.includes('DE') || locale.includes('FR')) return 'EUR';
    if (locale.includes('IN')) return 'INR';
    if (locale.includes('PK')) return 'PKR';
    if (locale.includes('BD')) return 'BGD';
    if (locale.includes('ID')) return 'IDR';
    if (locale.includes('MY')) return 'MYR';
    if (locale.includes('AE') || locale.includes('SA')) return 'SAR';
  } catch (error) {
    // Ignore locale detection errors
  }
  
  return 'USD';
}

/**
 * Set user's preferred currency
 */
export function setPreferredCurrency(currency: CurrencyCode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CURRENCY_PREFERENCE_KEY, currency);
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currency }));
  } catch (error) {
    console.warn('Failed to save preferred currency:', error);
  }
}

/**
 * Check if a currency code is supported
 */
export function isSupportedCurrency(code: string): boolean {
  return SUPPORTED_CURRENCIES.some(c => c.code === code.toUpperCase());
}

/**
 * Get currency info by code
 */
export function getCurrencyInfo(code: string) {
  return SUPPORTED_CURRENCIES.find(c => c.code === code.toUpperCase());
}

