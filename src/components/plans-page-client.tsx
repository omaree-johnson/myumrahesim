"use client";

import { useState } from "react";
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

interface PlansPageClientProps {
  products: any[];
  uniqueDurations: number[];
  hasUnlimited: boolean;
}

export function PlansPageClient({
  products,
  uniqueDurations,
  hasUnlimited,
}: PlansPageClientProps) {
  const [selectedDuration, setSelectedDuration] = useState<string>("all");

  // ✅ Filter products dynamically based on selected duration
  const filteredProducts =
    selectedDuration === "all"
      ? products
      : selectedDuration === "unlimited"
      ? products.filter((p) => p.dataUnlimited)
      : products.filter((p) => p.durationDays?.toString() === selectedDuration);

  const hasProducts = products.length > 0;

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">
              Saudi Arabia eSIM Plans
            </h1>
            <Link
              href="/"
              className="px-4 lg:px-5 py-2.5 lg:py-3 text-sm lg:text-base font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border-2 border-sky-600 dark:border-sky-400 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors text-center sm:text-left whitespace-nowrap"
            >
              ← Back to Home
            </Link>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg mb-6">
            Choose the perfect data plan for your travels in Saudi Arabia.
            Instant activation, no physical SIM required.
          </p>

          {hasProducts && (
            <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4 lg:gap-6 sm:items-center bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4 flex-1">
                <label
                  htmlFor="duration-select"
                  className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  Filter by duration:
                </label>

                {/* ✅ Fixed Select */}
                <Select 
                  value={selectedDuration} 
                  onValueChange={(value: any) => setSelectedDuration(value as string)}
                >
                                    <SelectTrigger className="w-full sm:w-60 h-11" id="duration-select">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectPositioner>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All durations</SelectItem>
                        {uniqueDurations.map((days) => (
                          <SelectItem key={days} value={days.toString()}>
                            {days} day{days !== 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                        {hasUnlimited && (
                          <SelectItem value="unlimited">Unlimited Data</SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </SelectPositioner>
                </Select>
              </div>

              <span className="text-sm text-gray-500 dark:text-gray-400 sm:ml-auto text-center sm:text-right">
                {filteredProducts.length} plan
                {filteredProducts.length !== 1 ? "s" : ""} available
              </span>
            </div>
          )}
        </div>

        <ProductList products={filteredProducts} />
      </div>

      <div className="mt-24">
        <Footer />
      </div>
    </>
  );
}
