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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Saudi Arabia eSIM Plans
            </h1>
            <Link
              href="/"
              className="px-4 py-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 border border-sky-600 dark:border-sky-400 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            Choose the perfect data plan for your travels in Saudi Arabia.
            Instant activation, no physical SIM required.
          </p>

          {hasProducts && (
            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-center">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="duration-select"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  Filter by duration:
                </label>

                {/* ✅ Fixed Select */}
                <Select 
                  value={selectedDuration} 
                  onValueChange={(value: any) => setSelectedDuration(value as string)}
                >
                  <SelectTrigger className="w-[200px]" id="duration-select">
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

              <span className="text-sm text-gray-500 dark:text-gray-400 sm:ml-auto">
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
