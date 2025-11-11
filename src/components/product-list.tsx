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
import { Wifi, Calendar, Database, ShoppingCart } from "lucide-react";

interface EsimProduct {
  id: string;
  name?: string;
  title?: string;
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

  // Apply filters
  let filteredProducts = products;

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
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredProducts.length} of {products.length} plans • Sorted by price (lowest first)
        </div>
      )}
      
      {hasProducts && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 w-full">
          {filteredProducts.map((product: EsimProduct) => {
            const rawName = product.name || product.title || "eSIM Plan";
            
            // Extract throttle info from name (e.g., "(512kbps throttled)" or "(1.25mbps throttled)")
            const throttleMatch = rawName.match(/\((\d+(?:\.\d+)?(?:k|m)bps)\s+throttled\)/i);
            const throttleInfo = throttleMatch ? throttleMatch[1] : null;
            const displayName = throttleInfo ? rawName.replace(/\s*\(\d+(?:\.\d+)?(?:k|m)bps\s+throttled\)/i, '').trim() : rawName;
            
            const displayPrice = product.price?.display || 
              (product.price?.amount && product.price?.currency 
                ? `${product.price.currency} ${product.price.amount}` 
                : "Contact for price");

            return (
              <Expandable 
                key={product.id}
                expandDirection="vertical"
                expandBehavior="push"
              >
                {({ isExpanded }) => (
                  <ExpandableTrigger>
                    <ExpandableCard
                      className="w-full relative"
                      collapsedSize={{ width: undefined, height: undefined }}
                      expandedSize={{ width: undefined, height: undefined }}
                      hoverToExpand={false}
                    >
                      <ExpandableCardHeader>
                        <div className="flex justify-between items-start w-full">
                          {product.dataUnlimited && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-medium rounded-full">
                              Unlimited Data
                            </span>
                          )}
                          <span className="px-2 py-1 bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 text-sm font-semibold rounded-md ml-auto">
                            {displayPrice}
                          </span>
                        </div>
                      </ExpandableCardHeader>

                      <ExpandableCardContent>
                        <div className="flex items-start mb-4">
                          <div className="flex-1">
                            <h3
                              className="font-medium text-gray-800 dark:text-white tracking-tight transition-all duration-300"
                              style={{
                                fontSize: isExpanded ? "20px" : "16px",
                                fontWeight: isExpanded ? "700" : "500",
                              }}
                            >
                              {displayName}
                            </h3>
                            <div className="flex items-center gap-3 text-sm mt-2">
                              {product.data && (
                                <div className="flex items-center gap-1.5">
                                  <Database className="w-4 h-4 text-sky-500" />
                                  <span className={product.dataUnlimited ? "text-green-600 font-medium" : "text-gray-600"}>
                                    {product.data}
                                  </span>
                                </div>
                              )}
                              {product.validity && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-amber-500" />
                                  <span className="text-gray-600">{product.validity}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <ExpandableContent
                          preset="fade"
                          keepMounted={false}
                          animateIn={{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 },
                            transition: { type: "spring", stiffness: 300, damping: 20 },
                          }}
                        >
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {product.description || "High-speed mobile data for your travels in Saudi Arabia. Instant activation upon purchase."}
                          </p>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Wifi className="w-4 h-4 mr-2 text-sky-500" />
                              <span>Instant activation</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Database className="w-4 h-4 mr-2 text-sky-500" />
                              <span>High-speed 4G/5G network</span>
                            </div>
                            {throttleInfo && (
                              <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                                <Database className="w-4 h-4 mr-2 text-amber-500" />
                                <span>Throttled to {throttleInfo} after limit</span>
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                              <span>Flexible validity period</span>
                            </div>
                          </div>

                          <Link
                            href={`/checkout?product=${encodeURIComponent(product.id)}&name=${encodeURIComponent(displayName)}&price=${encodeURIComponent(displayPrice)}`}
                            className="w-full bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white px-4 py-3 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center justify-center font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Now
                          </Link>
                        </ExpandableContent>
                      </ExpandableCardContent>

                      <ExpandableContent preset="slide-up">
                        <ExpandableCardFooter>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 w-full">
                            <span>Instant delivery</span>
                            <span>24/7 support</span>
                          </div>
                        </ExpandableCardFooter>
                      </ExpandableContent>
                    </ExpandableCard>
                  </ExpandableTrigger>
                )}
              </Expandable>
            );
          })}
        </div>
      )}
    </>
  );
}
