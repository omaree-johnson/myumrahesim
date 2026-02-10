"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/components/currency-provider";
import { useCart } from "@/components/cart-provider";
import { ShoppingCart, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Volume discount thresholds in USD (must match volume-discount-banner and backend). */
const THRESHOLD_30_USD = 30;
const THRESHOLD_70_USD = 70;

// ---------------------------------------------------------------------------
// DATA STRUCTURE (extensible for future bundles or discount sources)
// ---------------------------------------------------------------------------

export interface BundleProduct {
  id: string;
  name?: string;
  title?: string;
  data?: string;
  validity?: string;
  dataGB?: number;
  durationDays?: number;
  price?: {
    display?: string;
    amount?: number;
    currency?: string;
  };
}

/**
 * Tier definition for the bundles section.
 * Add more tiers (e.g. "Pilgrim Ultimate 50GB") by extending this array.
 * displayDiscountPercent: used for CRO anchoring (strikethrough + "SAVE X%").
 * Actual checkout may apply different volume/promo logic; this is for display.
 */
export interface BundleTierConfig {
  id: string;
  /** e.g. "Pilgrim Plus" */
  name: string;
  /** e.g. "10GB" – used to match product by dataGB */
  dataGBTarget: number;
  /** Tolerance when matching (e.g. 1 => 9–11 GB for 10) */
  dataGBTolerance?: number;
  /** Short subtitle, Holafly-style "peace of mind" copy */
  subtitle: string;
  /** Display-only discount for anchoring (e.g. 10 = "SAVE 10%"). 0 = no strikethrough. */
  displayDiscountPercent: number;
  /** "BEST VALUE" vs "MOST POPULAR" – only one tier should have bestValue true. */
  bestValue?: boolean;
  /** Social proof micro-copy below price (e.g. "Chosen by 80% of travelers") */
  socialProof?: string;
}

const DEFAULT_BUNDLE_TIERS: BundleTierConfig[] = [
  {
    id: "pilgrim-plus",
    name: "Pilgrim Plus",
    dataGBTarget: 10,
    dataGBTolerance: 1,
    subtitle: "Ideal for a week of maps, messaging & light browsing",
    displayDiscountPercent: 5,
    bestValue: false,
    socialProof: "Chosen by 80% of travelers",
  },
  {
    id: "pilgrim-pro",
    name: "Pilgrim Pro",
    dataGBTarget: 20,
    dataGBTolerance: 1,
    subtitle: "Peace of mind: video calls, hotspot & heavy use",
    displayDiscountPercent: 10,
    bestValue: true,
    socialProof: "Best for families and longer stays",
  },
];

/** Match product by data tier (e.g. 10GB → 9–11, 20GB → 19–21). Prefer 30-day. */
function findProductForTier(
  products: BundleProduct[],
  dataGBTarget: number,
  tolerance: number = 1
): BundleProduct | null {
  const low = dataGBTarget - tolerance;
  const high = dataGBTarget + tolerance;
  const pool = products.filter(
    (p) => p.dataGB != null && p.dataGB >= low && p.dataGB <= high
  );
  if (pool.length === 0) return null;
  // Prefer 30-day; then 14-day; then any
  const byDuration = [...pool].sort(
    (a, b) => (b.durationDays ?? 0) - (a.durationDays ?? 0)
  );
  return byDuration[0];
}

/** Discount applies only from this quantity onward (2+ people). */
const MIN_QUANTITY_FOR_DISCOUNT = 2;

/** Build display name for cart/checkout (aligned with product-list logic). */
function getDisplayName(product: BundleProduct): string {
  const dataLabel = product.data
    ? product.data.replace(/saudi arabia/gi, "").trim()
    : product.dataGB
      ? `${Math.round(product.dataGB)}GB Data`
      : "Saudi eSIM";
  const durationLabel =
    product.validity ||
    (product.durationDays && product.durationDays > 0
      ? `${product.durationDays}-Day Validity`
      : "Flexible");
  return product.title || `${dataLabel} • ${durationLabel} • Saudi Arabia`;
}

/** Short spec so customers see exactly what they get: e.g. "10GB • 30 days" */
function getProductSpec(product: BundleProduct): string {
  const data =
    product.dataGB != null
      ? `${product.dataGB < 1 ? product.dataGB.toFixed(1) : Math.round(product.dataGB)}GB`
      : product.data?.replace(/saudi arabia/gi, "").trim() || "Data";
  const validity =
    product.validity ||
    (product.durationDays && product.durationDays > 0
      ? `${product.durationDays} days`
      : "valid");
  return `${data} • ${validity}`;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export interface BundlesSectionProps {
  products: BundleProduct[];
  /** Override default tiers (e.g. from CMS). If not provided, uses DEFAULT_BUNDLE_TIERS. */
  tiers?: BundleTierConfig[];
  /** Section heading */
  heading?: string;
  /** Section subheading */
  subheading?: string;
  className?: string;
}

export function BundlesSection({
  products,
  tiers = DEFAULT_BUNDLE_TIERS,
  heading = "10GB & 20GB bundles",
  subheading = "Get more data at a better price when you buy for 2+ people. Each eSIM includes high-speed data and validity in Saudi Arabia, perfect for Umrah & Hajj.",
  className,
}: BundlesSectionProps) {
  const { convertPrice, getConvertedAmount, formatCurrency, isLoading, rates } = useCurrency();
  const { addItem, showCartModal } = useCart();

  const showConvertedThresholds = !isLoading && Object.keys(rates).length > 0;
  const threshold30 = showConvertedThresholds ? convertPrice(THRESHOLD_30_USD, "USD") : "$30.00";
  const threshold70 = showConvertedThresholds ? convertPrice(THRESHOLD_70_USD, "USD") : "$70.00";

  const [selectedTierId, setSelectedTierId] = useState<string | null>(
    tiers[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);

  const tierProducts = useMemo(() => {
    const map: Record<string, BundleProduct | null> = {};
    tiers.forEach((tier) => {
      map[tier.id] = findProductForTier(
        products,
        tier.dataGBTarget,
        tier.dataGBTolerance ?? 1
      );
    });
    return map;
  }, [products, tiers]);

  const selectedTier = tiers.find((t) => t.id === selectedTierId) ?? tiers[0];
  const selectedProduct = selectedTier
    ? tierProducts[selectedTier.id]
    : null;

  const priceCalculation = useMemo(() => {
    if (!selectedProduct?.price?.amount || !selectedTier) return null;
    const currency = selectedProduct.price.currency ?? "USD";
    const unitAmount = getConvertedAmount(
      selectedProduct.price.amount,
      currency
    );
    const standardTotal = unitAmount * quantity;
    const qualifiesForDiscount = quantity >= MIN_QUANTITY_FOR_DISCOUNT;
    const discount =
      qualifiesForDiscount ? selectedTier.displayDiscountPercent / 100 : 0;
    const bundleTotal = standardTotal * (1 - discount);
    const savedAmount = standardTotal - bundleTotal;
    const percentSaved = qualifiesForDiscount
      ? selectedTier.displayDiscountPercent
      : 0;

    return {
      standardTotal,
      bundleTotal,
      savedAmount,
      percentSaved,
      currency,
      unitAmount,
      qualifiesForDiscount,
    };
  }, [
    selectedProduct?.price?.amount,
    selectedProduct?.price?.currency,
    selectedTier,
    quantity,
    getConvertedAmount,
  ]);

  const hasAnyBundle = tiers.some((t) => tierProducts[t.id] != null);
  const minQty = 1;
  const maxQty = 5;

  if (!hasAnyBundle || !selectedTier) return null;

  const displayName = selectedProduct
    ? getDisplayName(selectedProduct)
    : selectedTier.name;
  const priceLabel = selectedProduct?.price?.display ?? "";

  const handleAddBundle = () => {
    if (!selectedProduct) return;
    addItem(
      {
        offerId: selectedProduct.id,
        name: displayName,
        priceLabel,
      },
      quantity
    );
    showCartModal(displayName);
  };

  return (
    <section
      className={cn("mb-10 sm:mb-12 lg:mb-14", className)}
      aria-labelledby="bundles-heading"
    >
      <div className="mb-6 sm:mb-8">
        <h2
          id="bundles-heading"
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {heading}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl">
          {subheading}
        </p>
        {/* Same volume discount copy as top-of-page banner; applied at checkout */}
        <div
          className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-emerald-600 dark:bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white sm:text-base"
          role="status"
          aria-label={`Volume discount: 5% off ${threshold30}+, 10% off ${threshold70}. Applied automatically at checkout.`}
        >
          <span aria-hidden="true">🎉</span>
          <span>
            5% off {threshold30}+, 10% off {threshold70}. Applied automatically at checkout.
          </span>
          <Link
            href="/plans"
            className="inline-flex shrink-0 items-center rounded-md bg-white/20 px-2.5 py-1 text-sm font-semibold text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600 dark:focus:ring-offset-emerald-700"
          >
            Shop plans
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {tiers.map((tier) => {
          const product = tierProducts[tier.id];
          const isSelected = selectedTierId === tier.id;
          const isAvailable = product != null;

          if (!isAvailable) return null;

          return (
            <Card
              key={tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={cn(
                "cursor-pointer transition-all duration-200 border-2",
                isSelected
                  ? "border-sky-500 dark:border-sky-400 shadow-lg ring-2 ring-sky-500/20 dark:ring-sky-400/20"
                  : "border-gray-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-slate-600"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Psychology: Value badge near the top; discount applies for 2+ people only */}
                  {tier.bestValue && (
                    <Badge
                      variant="default"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 border-0 text-white font-bold text-xs sm:text-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 inline" />
                      BEST VALUE
                    </Badge>
                  )}
                  {tier.displayDiscountPercent > 0 && !tier.bestValue && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                    >
                      SAVE {tier.displayDiscountPercent}% (2+ people)
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-2">
                  {tier.name}
                </h3>
                <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
                  {getProductSpec(product)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tier.subtitle}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Visual hierarchy: price is secondary to CTA but still prominent */}
                {isSelected && priceCalculation && (
                  <>
                    <div className="flex flex-wrap items-baseline gap-2">
                      {priceCalculation.percentSaved > 0 && (
                        <span
                          className="text-base sm:text-lg text-gray-500 dark:text-gray-400 line-through"
                          aria-hidden="true"
                        >
                          {formatCurrency(priceCalculation.standardTotal)}
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-2xl sm:text-3xl font-bold",
                          priceCalculation.percentSaved > 0
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-gray-900 dark:text-white"
                        )}
                      >
                        {formatCurrency(priceCalculation.bundleTotal)}
                      </span>
                      {quantity > 1 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          for {quantity} {quantity === 1 ? "eSIM" : "eSIMs"}
                        </span>
                      )}
                    </div>
                    {/* Social proof: placed below price to reinforce decision (Holafly-style trust) */}
                    {tier.socialProof && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                        {tier.socialProof}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected bundle customization + CTA (single row on desktop, stacked on mobile) */}
      {selectedProduct && selectedTier && priceCalculation && (
        <Card className="mt-4 sm:mt-6 border-2 border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-900/10">
          <CardContent className="p-4 sm:p-6">
            <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              You're getting: {quantity} {quantity === 1 ? "eSIM" : "eSIMs"} × {getProductSpec(selectedProduct)} (Saudi Arabia)
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of eSIMs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(minQty, q - 1))}
                    disabled={quantity <= minQty}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span
                    className="w-10 text-center font-bold text-gray-900 dark:text-white"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                {quantity < MIN_QUANTITY_FOR_DISCOUNT && selectedTier.displayDiscountPercent > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add 2 or more for bundle discount
                  </p>
                )}
              </div>
              <div className="flex flex-col xs:flex-row sm:items-center gap-3">
                <div className="flex items-baseline gap-2">
                  {priceCalculation.percentSaved > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {formatCurrency(priceCalculation.standardTotal)}
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-xl sm:text-2xl font-bold",
                      priceCalculation.percentSaved > 0
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-gray-900 dark:text-white"
                    )}
                  >
                    {formatCurrency(priceCalculation.bundleTotal)}
                  </span>
                  {quantity > 1 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      for {quantity} {quantity === 1 ? "eSIM" : "eSIMs"}
                    </span>
                  )}
                </div>
                {/* CRO: Primary CTA is the most prominent element; primary brand color, full width on mobile */}
                <Button
                  onClick={handleAddBundle}
                  className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-500 dark:to-sky-600 hover:from-sky-700 hover:to-sky-800 dark:hover:from-sky-600 dark:hover:to-sky-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-base flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add bundle to cart
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
