"use client";

import { useState } from "react";
import { HeroSection } from "./hero-section";
import { ProductList } from "./product-list";
import Footer from "./footer";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectPositioner,
} from "@/components/ui/select";

interface HomePageClientProps {
  products: any[];
  uniqueDurations: number[];
  hasUnlimited: boolean;
}

export function HomePageClient({ products, uniqueDurations, hasUnlimited }: HomePageClientProps) {
  const [showProducts, setShowProducts] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>("all");

  if (!showProducts) {
    return (
      <>
        <HeroSection />
        <Footer />
      </>
    );
  }

  // Filter products based on selected duration
  const filteredProducts = selectedDuration === "all" 
    ? products 
    : selectedDuration === "unlimited"
    ? products.filter(p => p.dataUnlimited)
    : products.filter(p => p.durationDays?.toString() === selectedDuration);

  const hasProducts = products.length > 0;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-7xl">
      <div className="mb-8 lg:mb-12">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white">
            Saudi Arabia eSIM Plans
          </h1>
          <button
            onClick={() => setShowProducts(false)}
            className="px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border-2 border-sky-600 dark:border-sky-400 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors font-medium"
          >
            ← Back to Home
          </button>
        </div>
        <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
          Choose the perfect data plan for your travels in Saudi Arabia. Instant activation, no physical SIM required.
        </p>
        
        {hasProducts && (
          <div className="mt-6 lg:mt-8 flex flex-wrap gap-4 lg:gap-5 items-center">
            <span className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300">Filter by duration:</span>
            <Select 
              value={selectedDuration} 
              onValueChange={(value: any) => setSelectedDuration(value as string)}
            >
              <SelectTrigger className="w-52 lg:w-64 lg:text-base dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectPositioner>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-600 lg:text-base">
                  <SelectGroup>
                    <SelectItem value="all">All durations</SelectItem>
                    {uniqueDurations.map(days => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} day{days !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                    {hasUnlimited && (
                      <SelectItem value="unlimited">Unlimited Data</SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </SelectPositioner>
            </Select>
            {selectedDuration !== "all" && (
              <button
                onClick={() => setSelectedDuration("all")}
                className="px-4 lg:px-5 py-2 lg:py-2.5 text-sm lg:text-base text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border-2 border-sky-600 dark:border-sky-400 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </div>

      {!hasProducts ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 lg:p-8 text-center">
          <p className="text-base lg:text-lg text-yellow-800 dark:text-yellow-200 font-medium">
            No products available at the moment. Please check your Zendit API configuration.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 lg:p-8 text-center">
          <p className="text-base lg:text-lg text-blue-800 dark:text-blue-200 font-medium">
            No products match your selected filters. Try selecting a different duration.
          </p>
        </div>
      ) : (
        <ProductList products={filteredProducts} />
      )}
    </div>
  );
}
