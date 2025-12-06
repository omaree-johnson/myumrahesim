"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Expandable, 
  ExpandableCard, 
  ExpandableTrigger, 
  ExpandableContent,
  ExpandableCardHeader,
  ExpandableCardContent,
  ExpandableCardFooter
} from "./expandable";
import { Wifi, Calendar, Database, ShoppingCart, ChevronDown, Check, Zap, Globe, Star, Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/components/currency-provider";

interface EsimProduct {
  id: string;
  name?: string;
  title?: string;
  providerLabel?: string;
  description?: string;
  price?: {
    display?: string;
    amount?: number;
    currency?: string;
  };
  data?: string;
  validity?: string;
  dataGB?: number;
  durationDays?: number;
  dataUnlimited?: boolean;
}

export function ProductList({ products }: { products: EsimProduct[] }) {
  const searchParams = useSearchParams();
  const durationFilter = searchParams.get("duration");
  const unlimitedFilter = searchParams.get("unlimited");
  const { convertPrice } = useCurrency();

  // Determine "Most Popular" product - specifically the 10GB 30 days plan
  const determineMostPopular = (products: EsimProduct[]): string | null => {
    if (products.length === 0) return null;
    
    // Find the 10GB 30 days plan specifically
    const mostPopular = products.find(p => {
      // Check for 10GB (allowing for rounding - between 9.5 and 10.5 GB)
      const is10GB = p.dataGB && p.dataGB >= 9.5 && p.dataGB <= 10.5;
      // Check for 30 days
      const is30Days = p.durationDays === 30;
      
      return is10GB && is30Days;
    });
    
    return mostPopular?.id || null;
  };

  const mostPopularId = determineMostPopular(products);

  // Apply filters
  // First, exclude 1-day plans - only show 7-day and 30-day plans
  let filteredProducts = products.filter(p => p.durationDays !== 1);

  if (durationFilter) {
    const days = parseInt(durationFilter);
    filteredProducts = filteredProducts.filter(p => p.durationDays === days);
  }

  if (unlimitedFilter === "true") {
    filteredProducts = filteredProducts.filter(p => p.dataUnlimited);
  }

  const hasProducts = filteredProducts.length > 0;

  return (
    <>
      {!hasProducts && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            No products match your filters. Try adjusting your selection.
          </p>
        </div>
      )}

      {hasProducts && (
        <div className="mb-4 lg:mb-6 text-sm lg:text-base text-gray-600 dark:text-gray-400">
          Showing {filteredProducts.length} of {products.length} plans • Sorted by price (lowest first)
        </div>
      )}
      
      {hasProducts && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 sm:gap-x-10 lg:gap-x-12 xl:gap-x-16 gap-y-10 sm:gap-y-12 lg:gap-y-14 xl:gap-y-16 w-full">
          {filteredProducts.map((product: EsimProduct) => {
            const rawName = product.providerLabel || product.name || product.title || "eSIM Plan";
            const fallbackDescription =
              "Instant-activation Saudi Arabia eSIM with reliable 4G/5G coverage.";
            
            // Extract throttle info from name (e.g., "(512kbps throttled)" or "(1.25mbps throttled)")
            const throttleMatch = rawName.match(/\((\d+(?:\.\d+)?(?:k|m)bps)\s+throttled\)/i);
            const throttleInfo = throttleMatch ? throttleMatch[1] : null;
            const cleanedName = throttleInfo
              ? rawName.replace(/\s*\(\d+(?:\.\d+)?(?:k|m)bps\s+throttled\)/i, "").trim()
              : rawName;

            const displayName =
              product.title ||
              (() => {
                const dataLabel = product.dataUnlimited
                  ? "Unlimited Data"
                  : product.data?.replace(/saudi arabia/gi, "").trim() ||
                    (product.dataGB 
                      ? `${product.dataGB < 1 ? product.dataGB.toFixed(1) : Math.round(product.dataGB)}GB Data` 
                      : "Saudi eSIM");

                const durationLabel =
                  product.validity ||
                  (product.durationDays && product.durationDays > 0 
                    ? `${product.durationDays}-Day Validity` 
                    : "Flexible Duration");

                return `${dataLabel} • ${durationLabel} • Saudi Arabia`;
              })();

            const displayDescription = product.description || fallbackDescription;
            const detailNotes: string[] = [];
            if (throttleInfo) {
              detailNotes.push(`Speed reduces to ${throttleInfo} after the included data is used.`);
            }
            if (cleanedName && cleanedName !== displayName) {
              detailNotes.push(`Provider listing: ${cleanedName}`);
            }
            
            // Try to convert price using currency context, fallback to original
            let displayPrice = "Contact for price";
            if (product.price?.amount && product.price?.currency) {
              try {
                // Use currency conversion if available
                displayPrice = convertPrice(product.price.amount, product.price.currency);
              } catch (error) {
                // Fallback to original price display
                displayPrice = product.price.display || 
                  `${product.price.currency} ${product.price.amount.toFixed(2)}`;
              }
            } else if (product.price?.display) {
              displayPrice = product.price.display;
            }
            
            // Keep original price for checkout link (needed for Stripe)
            const originalPriceDisplay = product.price?.display || 
              (product.price?.amount && product.price?.currency 
                ? `${product.price.currency} ${product.price.amount.toFixed(2)}` 
                : "0.00");

            return (
              <Expandable 
                key={product.id}
                expandDirection="vertical"
                expandBehavior="push"
                transitionDuration={0.1}
                easeType="easeOut"
              >
                {({ isExpanded }) => (
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isExpanded ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.08 }}
                    className="h-full"
                  >
                    <ExpandableTrigger>
                      <ExpandableCard
                        className="w-full h-full relative cursor-pointer group transition-all duration-100 hover:shadow-xl dark:hover:shadow-2xl"
                        collapsedSize={{ width: undefined, height: undefined }}
                        expandedSize={{ width: undefined, height: undefined }}
                        hoverToExpand={false}
                      >
                        {/* Header with Price Badge */}
                        <ExpandableCardHeader className="pb-4">
                          <div className="flex flex-col gap-3">
                            {/* Top row: Badges and Price */}
                            <div className="flex justify-between items-center w-full gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                {product.id === mostPopularId && (
                                  <motion.span 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-fit border border-orange-400 shadow-md"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    Most Popular
                                  </motion.span>
                                )}
                                {product.dataUnlimited && (
                                  <motion.span 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-200 text-xs font-semibold rounded-full w-fit border border-green-200 dark:border-green-800"
                                  >
                                    <Zap className="w-3.5 h-3.5" />
                                    Unlimited Data
                                  </motion.span>
                                )}
                              </div>
                              <motion.div
                                animate={{ 
                                  scale: isExpanded ? 1.05 : 1,
                                }}
                                transition={{ duration: 0.1 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700 text-white text-lg font-bold rounded-xl shadow-lg w-fit ml-auto"
                              >
                                {displayPrice}
                              </motion.div>
                            </div>
                            
                            {/* Star Rating */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= 4
                                        ? "fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500"
                                        : star === 5
                                        ? "fill-amber-200 text-amber-200 dark:fill-amber-300 dark:text-amber-300"
                                        : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">4.8</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">(150 reviews)</span>
                            </div>
                            
                            {/* Trust Badges */}
                            <div className="flex items-center gap-3 flex-wrap text-xs">
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <Shield className="w-3.5 h-3.5" />
                                <span className="font-medium">Instant activation guaranteed</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <Lock className="w-3.5 h-3.5" />
                                <span className="font-medium">Secure payment</span>
                              </div>
                            </div>
                          </div>
                        </ExpandableCardHeader>

                        <ExpandableCardContent className="pt-0">
                          {/* Product Title and Key Info */}
                          <div className="mb-4">
                            <motion.h3
                              animate={{
                                fontSize: isExpanded ? "22px" : "18px",
                                fontWeight: isExpanded ? 700 : 600,
                              }}
                              transition={{ duration: 0.1 }}
                              className="font-semibold text-gray-900 dark:text-white tracking-tight mb-3 line-clamp-2"
                            >
                              {displayName}
                            </motion.h3>
                            
                            {/* Key Features - Always Visible */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              {product.data && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/30 rounded-lg border border-sky-200 dark:border-sky-800">
                                  <Database className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                                  <span className={`text-sm font-medium ${product.dataUnlimited ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"}`}>
                                    {product.data}
                                  </span>
                                </div>
                              )}
                              {(product.validity || (product.durationDays === 0)) && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {product.validity || "Flexible validity"}
                                  </span>
                                </div>
                              )}
                            </div>

                          </div>

                          {/* Expandable Content */}
                          <ExpandableContent
                            preset="slide-up"
                            keepMounted={true}
                            animateIn={{
                              initial: { opacity: 0, y: -10 },
                              animate: { opacity: 1, y: 0 },
                              transition: { duration: 0.05, ease: "easeOut" },
                            }}
                          >
                            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-slate-700">
                              {/* Description */}
                              {displayDescription && (
                                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                  {displayDescription}
                                </p>
                              )}
                              {detailNotes.length > 0 && (
                                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                  {detailNotes.map((note) => (
                                    <li key={note} className="flex gap-2">
                                      <span className="text-sky-500 dark:text-sky-400">•</span>
                                      <span>{note}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {/* Features List */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Instant activation</span>
                                </div>
                                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                                  <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">High-speed 4G/5G</span>
                                </div>
                                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Works in Saudi Arabia</span>
                                </div>
                                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                                    <Wifi className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">No physical SIM needed</span>
                                  </div>
                              </div>

                              {/* CTA Button */}
                              <Link
                                href={`/checkout?product=${encodeURIComponent(product.id)}&name=${encodeURIComponent(displayName)}&price=${encodeURIComponent(originalPriceDisplay)}`}
                                className="block w-full group/btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-500 dark:to-sky-600 text-white px-6 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl text-center font-semibold text-base touch-manipulation flex items-center justify-center gap-2"
                                >
                                  <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                  <span>Buy Now</span>
                                </motion.div>
                              </Link>
                            </div>
                          </ExpandableContent>
                        </ExpandableCardContent>

                        {/* Footer with Expand Indicator */}
                        <ExpandableCardFooter className="pt-3 border-t border-gray-100 dark:border-slate-700">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Instant delivery
                              </span>
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                24/7 support
                              </span>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.05 }}
                              className="text-gray-400 dark:text-gray-500"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </ExpandableCardFooter>
                      </ExpandableCard>
                    </ExpandableTrigger>
                  </motion.div>
                )}
              </Expandable>
            );
          })}
        </div>
      )}
    </>
  );
}
