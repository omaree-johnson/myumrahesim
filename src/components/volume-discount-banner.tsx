"use client";

import Link from "next/link";
import { useCurrency } from "@/components/currency-provider";

/** Volume discount thresholds in USD (backend uses these). */
const THRESHOLD_30_USD = 30;
const THRESHOLD_70_USD = 70;

/**
 * Volume discount banner: always visible at the very top of the page.
 * 5% off $30+, 10% off $70 (or equivalent in selected currency). Applied automatically at checkout.
 */
export function VolumeDiscountBanner() {
  const { currency, convertPrice, isLoading, rates } = useCurrency();

  const showConverted = !isLoading && Object.keys(rates).length > 0;
  const threshold30 = showConverted ? convertPrice(THRESHOLD_30_USD, "USD") : "$30";
  const threshold70 = showConverted ? convertPrice(THRESHOLD_70_USD, "USD") : "$70";

  const label = `Volume discount: 5% off ${threshold30}+, 10% off ${threshold70}. Applied automatically at checkout.`;

  return (
    <div
      className="relative z-50 w-full bg-emerald-600 dark:bg-emerald-700 text-white"
      role="banner"
      aria-label={label}
    >
      <div className="container mx-auto px-4 py-2 sm:py-2.5">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm font-medium sm:text-base">
          <span className="shrink-0" aria-hidden="true">
            🎉
          </span>
          <span>
            5% off {threshold30}+, 10% off {threshold70}. Applied automatically at checkout.
          </span>
          <Link
            href="/plans"
            className="inline-flex items-center rounded-md bg-white/20 px-2.5 py-1 text-sm font-semibold text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600 dark:focus:ring-offset-emerald-700"
          >
            Shop plans
          </Link>
        </div>
      </div>
    </div>
  );
}
