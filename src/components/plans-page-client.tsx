"use client";

import { useState, useMemo } from "react";
import { ProductList } from "./product-list";
import Footer from "./footer";
import Link from "next/link";
import { CurrencySelector } from "./currency-selector";
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
}

export function PlansPageClient({
  products = [],
}: PlansPageClientProps) {
  const [selectedDataSize, setSelectedDataSize] = useState<string>("all");

  // ✅ Extract unique data sizes from products on the client side
  const uniqueDataSizes = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    
    const dataSizes = products
      .map(p => p.dataGB)
      .filter((gb): gb is number => typeof gb === 'number' && !isNaN(gb));
    
    return [...new Set(dataSizes)].sort((a, b) => a - b);
  }, [products]);

  const hasUnlimited = useMemo(() => {
    return Array.isArray(products) && products.some(p => p.dataUnlimited);
  }, [products]);

  // ✅ Filter products dynamically based on selected data size
  const filteredProducts =
    selectedDataSize === "all"
      ? products
      : selectedDataSize === "unlimited"
      ? products.filter((p) => p.dataUnlimited)
      : products.filter((p) => p.dataGB?.toString() === selectedDataSize);

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

          {hasProducts && uniqueDataSizes && (
            <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4 lg:gap-6 sm:items-center bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4 flex-1 flex-wrap">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="data-select"
                    className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  >
                    Filter by data:
                  </label>

                  {/* Improved Select Component */}
                  <Select
                    value={selectedDataSize}
                    onValueChange={(value: unknown) => {
                      if (typeof value === 'string') {
                        setSelectedDataSize(value);
                      }
                    }}
                  >
                    <SelectTrigger 
                      id="data-select"
                      className="w-full sm:w-64 h-11 px-4 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-150 shadow-sm hover:shadow-md focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                    >
                      <SelectValue placeholder="Select data size" />
                    </SelectTrigger>
                    <SelectPositioner>
                      <SelectContent className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-lg max-h-[300px] overflow-y-auto z-50">
                        <SelectItem 
                          value="all"
                          className="cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/30 focus:bg-sky-50 dark:focus:bg-sky-900/30 transition-colors duration-150"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">All data sizes</span>
                        </SelectItem>
                        {Array.isArray(uniqueDataSizes) && uniqueDataSizes.map((gb: number) => (
                          <SelectItem 
                            key={gb} 
                            value={gb.toString()}
                            className="cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/30 focus:bg-sky-50 dark:focus:bg-sky-900/30 transition-colors duration-150"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">{gb}GB</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Data</span>
                            </span>
                          </SelectItem>
                        ))}
                        {hasUnlimited && (
                          <SelectItem 
                            value="unlimited"
                            className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/30 focus:bg-green-50 dark:focus:bg-green-900/30 transition-colors duration-150"
                          >
                            <span className="flex items-center gap-2">
                              <span className="font-semibold text-green-700 dark:text-green-300">Unlimited Data</span>
                              <span className="text-xs text-green-600 dark:text-green-400">∞</span>
                            </span>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                </div>

                {/* Currency Selector - Next to filter */}
                <div className="flex items-center gap-3 border-l border-gray-200 dark:border-slate-700 pl-4 ml-4">
                  <label
                    htmlFor="currency-select"
                    className="text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap hidden sm:block"
                  >
                    Currency:
                  </label>
                  <div className="flex-shrink-0">
                    <CurrencySelector />
                  </div>
                </div>
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
