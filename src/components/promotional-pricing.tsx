"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/components/currency-provider";

interface PromotionalPricingProps {
  offerId: string;
  originalPrice: string; // Display string in user's currency (from convertPrice)
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface PricingData {
  success: boolean;
  originalPriceCents: number;
  discountPercent: number;
  discountAmountCents: number;
  finalPriceCents: number;
  currency: string;
  promotionId?: string;
  promotionName?: string;
  promoCode?: string;
  appliedPromotion?: {
    id: string;
    name: string;
    code: string | null;
    discountPercent: number;
  };
  error?: string;
}

/**
 * Promotional Pricing Component
 * 
 * Fetches server-calculated pricing and displays:
 * - Original price with strikethrough (if discounted)
 * - Discounted price highlighted
 * - "Ramadan Offer Applied – 10% Off 🌙" badge
 * - Automatically hides when promo expires
 * 
 * No client-side pricing math - all calculations server-side
 */
export function PromotionalPricing({
  offerId,
  originalPrice,
  currency = "USD",
  className = "",
  size = "md",
}: PromotionalPricingProps) {
  const { formatCurrency, getConvertedAmount } = useCurrency();
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPricing() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/pricing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pricing");
        }

        const data: PricingData = await response.json();

        if (isMounted) {
          if (data.success) {
            setPricing(data);
          } else {
            setError(data.error || "Failed to load pricing");
            setPricing(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load pricing");
          setPricing(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPricing();

    return () => {
      isMounted = false;
    };
  }, [offerId]);

  // Size classes
  const sizeClasses = {
    sm: {
      original: "text-sm sm:text-base",
      final: "text-lg sm:text-xl",
      badge: "text-xs",
    },
    md: {
      original: "text-base sm:text-lg",
      final: "text-xl sm:text-2xl",
      badge: "text-xs sm:text-sm",
    },
    lg: {
      original: "text-lg sm:text-xl",
      final: "text-2xl sm:text-3xl",
      badge: "text-sm sm:text-base",
    },
  };

  const classes = sizeClasses[size];

  // If no pricing data or no discount, show original price
  if (isLoading) {
    return (
      <div className={`${className} flex items-baseline gap-2`}>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>
    );
  }

  if (error || !pricing || !pricing.success) {
    // Fallback to original price if pricing fetch fails
    return (
      <div className={`${className} flex items-baseline gap-2`}>
        <span className={`${classes.final} font-bold text-gray-900 dark:text-white`}>
          {originalPrice}
        </span>
      </div>
    );
  }

  const hasDiscount = pricing.discountPercent > 0 && pricing.discountAmountCents > 0;
  const isRamadanPromo = pricing.appliedPromotion?.name?.toLowerCase().includes("ramadan");

  // Convert API prices (in cents, API currency) to user's selected currency for display
  const apiCurrency = pricing.currency || "USD";
  const originalAmount = pricing.originalPriceCents / 100;
  const finalAmount = pricing.finalPriceCents / 100;
  const originalPriceFormatted = formatCurrency(getConvertedAmount(originalAmount, apiCurrency));
  const finalPriceFormatted = formatCurrency(getConvertedAmount(finalAmount, apiCurrency));

  if (!hasDiscount) {
    // No discount - show regular price
    return (
      <div className={`${className} flex items-baseline gap-2`}>
        <span className={`${classes.final} font-bold text-gray-900 dark:text-white`}>
          {originalPriceFormatted}
        </span>
      </div>
    );
  }

  // Has discount - show promotional pricing
  return (
    <div className={`${className} flex flex-col gap-1.5 sm:gap-2`}>
      {/* Price Display */}
      <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
        {/* Original Price (Strikethrough) */}
        <span
          className={`${classes.original} text-gray-500 dark:text-gray-400 line-through`}
          aria-label={`Original price: ${originalPriceFormatted}`}
        >
          {originalPriceFormatted}
        </span>

        {/* Discounted Price (Highlighted) */}
        <span
          className={`${classes.final} font-bold text-sky-600 dark:text-sky-400`}
          aria-label={`Discounted price: ${finalPriceFormatted}`}
        >
          {finalPriceFormatted}
        </span>
      </div>

      {/* Ramadan Promotion Badge */}
      <AnimatePresence>
        {isRamadanPromo && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-300 dark:border-amber-700 rounded-full w-fit"
            role="status"
            aria-label="Ramadan promotional discount applied"
          >
            <span className="text-base sm:text-lg leading-none">🌙</span>
            <span
              className={`${classes.badge} font-semibold text-amber-800 dark:text-amber-200`}
            >
              Ramadan Offer Applied – {pricing.discountPercent}% Off
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discount Amount (Screen Reader Only, in user's currency) */}
      <span className="sr-only">
        You save {formatCurrency(getConvertedAmount(pricing.discountAmountCents / 100, apiCurrency))} (
        {pricing.discountPercent}% off)
      </span>
    </div>
  );
}
