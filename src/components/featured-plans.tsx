"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Check, 
  Zap, 
  Star, 
  Shield, 
  Lock,
  Database,
  Calendar,
  ArrowRight
} from "lucide-react";
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

interface FeaturedPlansProps {
  products: EsimProduct[];
}

/**
 * Featured Plans Component - Shows top 5 plans on homepage
 * Reduces choice paralysis by highlighting best options
 */
export function FeaturedPlans({ products }: FeaturedPlansProps) {
  const { convertPrice } = useCurrency();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Get top 5 plans - prioritize by:
  // 1. Most popular (10GB 30 days)
  // 2. Lowest price
  // 3. Best value (data/duration ratio)
  const getTopPlans = (products: EsimProduct[]): EsimProduct[] => {
    if (products.length === 0) return [];

    // Find most popular (10GB 30 days)
    const mostPopular = products.find(p => {
      const is10GB = p.dataGB && p.dataGB >= 9.5 && p.dataGB <= 10.5;
      const is30Days = p.durationDays === 30;
      return is10GB && is30Days;
    });

    // Get remaining products sorted by price
    const sortedByPrice = [...products]
      .filter(p => p.id !== mostPopular?.id)
      .sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));

    // Take top 4 from sorted list
    const top4 = sortedByPrice.slice(0, 4);

    // Combine: most popular first, then top 4 by price
    const top5 = mostPopular 
      ? [mostPopular, ...top4].slice(0, 5)
      : sortedByPrice.slice(0, 5);

    return top5;
  };

  const topPlans = getTopPlans(products);

  if (topPlans.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Plans are loading... Please check back in a moment.
            </p>
            <Link
              href="/plans"
              className="mt-4 inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold hover:underline"
            >
              View all plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Determine most popular ID
  const mostPopularId = topPlans.find(p => {
    const is10GB = p.dataGB && p.dataGB >= 9.5 && p.dataGB <= 10.5;
    const is30Days = p.durationDays === 30;
    return is10GB && is30Days;
  })?.id || null;

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your eSIM Plan
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Instant activation, reliable coverage in Makkah & Madinah. 
              <span className="font-semibold text-sky-600 dark:text-sky-400"> Start from {topPlans[0]?.price?.display || "£17.39"}</span>
            </p>
            <div className="mt-6 flex items-center justify-center gap-6 flex-wrap text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Instant QR delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Works in Makkah & Madinah</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-7 lg:gap-10">
          {topPlans.map((product, index) => {
            const displayName = product.title || 
              `${product.dataUnlimited ? "Unlimited" : (product.dataGB ? `${product.dataGB < 1 ? product.dataGB.toFixed(1) : Math.round(product.dataGB)}GB` : "Data")} • ${product.durationDays || 7} Days`;
            
            let displayPrice = "Contact for price";
            if (product.price?.amount && product.price?.currency) {
              try {
                displayPrice = convertPrice(product.price.amount, product.price.currency);
              } catch {
                displayPrice = product.price.display || 
                  `${product.price.currency} ${product.price.amount.toFixed(2)}`;
              }
            } else if (product.price?.display) {
              displayPrice = product.price.display;
            }

            const originalPriceDisplay = product.price?.display || 
              (product.price?.amount && product.price?.currency 
                ? `${product.price.currency} ${product.price.amount.toFixed(2)}` 
                : "0.00");

            const isMostPopular = product.id === mostPopularId;
            const isHovered = hoveredId === product.id;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onHoverStart={() => setHoveredId(product.id)}
                onHoverEnd={() => setHoveredId(null)}
                className={`relative h-full ${isHovered ? "z-10" : ""}`}
              >
                <div
                  className={`relative h-full rounded-2xl border-2 transition-all duration-300 ${
                    isMostPopular
                      ? "border-orange-400 dark:border-orange-500 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-800 shadow-xl"
                      : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl"
                  } ${isHovered ? "scale-[1.03]" : ""}`}
                >
                  {/* Most Popular Badge */}
                  {isMostPopular && (
                    <div className="absolute top-4 right-4 z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg leading-none whitespace-nowrap"
                      >
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                        Most Popular
                      </motion.div>
                    </div>
                  )}

                  <div className={`p-6 flex flex-col h-full ${isMostPopular ? "pt-7" : ""}`}>
                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {displayPrice}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        One-time payment
                      </p>
                    </div>

                    {/* Plan Details */}
                    <div className="flex-1 space-y-4 mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                          {displayName}
                        </h3>
                      </div>

                      {/* Features */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Database className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                          <span>
                            {product.dataUnlimited 
                              ? "Unlimited data" 
                              : `${product.dataGB ? (product.dataGB < 1 ? product.dataGB.toFixed(1) : Math.round(product.dataGB)) : "High-speed"}GB`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <span>{product.durationDays || 7} days validity</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Zap className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span>High-speed 4G/5G</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span>Instant activation</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/checkout?product=${encodeURIComponent(product.id)}&name=${encodeURIComponent(displayName)}&price=${encodeURIComponent(originalPriceDisplay)}`}
                      className="block w-full"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.fbq) {
                          window.fbq('track', 'InitiateCheckout');
                        }
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-center transition-all ${
                          isMostPopular
                            ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg"
                            : "bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white shadow-md"
                        } flex items-center justify-center gap-2`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Buy Now</span>
                      </motion.div>
                    </Link>

                    {/* Trust Badge */}
                    <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Lock className="w-3 h-3" />
                      <span>Secure checkout</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Plans Link */}
        <div className="mt-12 text-center">
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 font-semibold rounded-xl hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all"
          >
            View All {products.length} Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}



