"use client";

import { useState, useEffect } from "react";
import { SUPPORTED_CURRENCIES, type CurrencyCode, setPreferredCurrency } from "@/lib/currency";
import { useCurrency } from "@/components/currency-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectPositioner,
} from "@/components/ui/select";

export function CurrencySelector() {
  const { currency, setCurrency, isLoading } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (value: unknown) => {
    const newCurrency = value as CurrencyCode;
    if (SUPPORTED_CURRENCIES.some(c => c.code === newCurrency)) {
      setCurrency(newCurrency);
      setPreferredCurrency(newCurrency);
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-[140px] h-9 bg-gray-100 dark:bg-slate-700 rounded-md animate-pulse border border-gray-300 dark:border-slate-600" />
    );
  }

  return (
    <Select
        value={currency}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger 
          className="w-[140px] h-9 text-sm border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
          aria-label="Select currency"
        >
          <SelectValue>
            {isLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                {SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol || '$'}
                <span className="text-xs">{currency}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectPositioner>
          <SelectContent className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-lg max-h-[300px] overflow-y-auto !z-[100]">
            {SUPPORTED_CURRENCIES.map((curr) => (
              <SelectItem 
                key={curr.code} 
                value={curr.code}
                className="cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/30 focus:bg-sky-50 dark:focus:bg-sky-900/30"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">{curr.symbol}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{curr.code}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">- {curr.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>
  );
}

