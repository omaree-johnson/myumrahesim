"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { 
  getPreferredCurrency, 
  getExchangeRates, 
  convertCurrency,
  formatPrice,
  type CurrencyCode 
} from "@/lib/currency";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: Record<string, number>;
  isLoading: boolean;
  convertPrice: (amount: number, fromCurrency: string) => string;
  formatCurrency: (amount: number) => string;
  getConvertedAmount: (amount: number, fromCurrency: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load preferred currency and exchange rates on mount
  useEffect(() => {
    // Load preferred currency
    const preferred = getPreferredCurrency();
    setCurrencyState(preferred);

    // Load exchange rates
    setIsLoading(true);
    getExchangeRates('USD')
      .then((fetchedRates) => {
        setRates(fetchedRates);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn('Failed to load exchange rates:', error);
        setIsLoading(false);
      });

    // Listen for currency changes from other components
    const handleCurrencyChange = (e: CustomEvent) => {
      setCurrencyState(e.detail);
    };
    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    // This will trigger the event listener in other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }));
  }, []);

  const getConvertedAmount = useCallback((amount: number, fromCurrency: string): number => {
    if (!amount || isNaN(amount)) return 0;
    if (!fromCurrency || fromCurrency === currency) return amount;
    if (Object.keys(rates).length === 0) return amount; // No rates loaded yet
    
    try {
      return convertCurrency(amount, fromCurrency, currency, rates);
    } catch (error) {
      console.warn('Currency conversion error:', error);
      return amount; // Return original amount on error
    }
  }, [currency, rates]);

  const convertPrice = useCallback((amount: number, fromCurrency: string): string => {
    if (!amount || isNaN(amount)) return '0.00';
    
    // If no conversion needed or rates not loaded, format original
    if (fromCurrency === currency || Object.keys(rates).length === 0) {
      return formatPrice(amount, currency);
    }
    
    try {
      const converted = getConvertedAmount(amount, fromCurrency);
      return formatPrice(converted, currency);
    } catch (error) {
      console.warn('Price conversion error:', error);
      // Fallback to original price formatting
      return formatPrice(amount, currency);
    }
  }, [currency, rates, getConvertedAmount]);

  const formatCurrency = useCallback((amount: number): string => {
    return formatPrice(amount, currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        rates, 
        isLoading,
        convertPrice, 
        formatCurrency,
        getConvertedAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      currency: 'USD' as CurrencyCode,
      setCurrency: () => {},
      rates: {},
      isLoading: false,
      convertPrice: (amount: number, fromCurrency: string) => {
        return formatPrice(amount, 'USD');
      },
      formatCurrency: (amount: number) => {
        return formatPrice(amount, 'USD');
      },
      getConvertedAmount: (amount: number, fromCurrency: string) => amount,
    };
  }
  return context;
}

