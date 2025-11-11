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
        <HeroSection onGetSimClick={() => setShowProducts(true)} />
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Saudi Arabia eSIM Plans
          </h1>
          <button
            onClick={() => setShowProducts(false)}
            className="px-4 py-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border border-sky-600 dark:border-sky-400 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Choose the perfect data plan for your travels in Saudi Arabia. Instant activation, no physical SIM required.
        </p>
        
        {hasProducts && (
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by duration:</span>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="w-52 dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                <SelectItem value="all">All durations</SelectItem>
                {uniqueDurations.map(days => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} day{days !== 1 ? 's' : ''}
                  </SelectItem>
                ))}
                {hasUnlimited && (
                  <SelectItem value="unlimited">Unlimited Data</SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedDuration !== "all" && (
              <button
                onClick={() => setSelectedDuration("all")}
                className="px-3 py-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border border-sky-600 dark:border-sky-400 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </div>

      {!hasProducts ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            No products available at the moment. Please check your Zendit API configuration.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <p className="text-blue-800 dark:text-blue-200">
            No products match your selected filters. Try selecting a different duration.
          </p>
        </div>
      ) : (
        <ProductList products={filteredProducts} />
      )}
    </div>
  );
}
