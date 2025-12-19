"use client";

import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";
import Link from "next/link";

interface ComparisonTableProps {
  lowestPrice?: string;
}

/**
 * Comparison Table Component
 * Shows MyUmrahESIM vs Roaming vs Airport SIM
 * Helps users understand value proposition
 */
type WinnerType = "myumrahesim" | "roaming" | "airportSim";

interface FeatureRow {
  feature: string;
  roaming: string;
  airportSim: string;
  myumrahesim: string;
  winner: WinnerType;
}

export function ComparisonTable({ lowestPrice = "£17.39" }: ComparisonTableProps) {
  const features: FeatureRow[] = [
    {
      feature: "Cost for 10GB (7 days)",
      roaming: "£70-150",
      airportSim: "£25-40",
      myumrahesim: lowestPrice,
      winner: "myumrahesim",
    },
    {
      feature: "Activation time",
      roaming: "Automatic",
      airportSim: "30-60 minutes at airport",
      myumrahesim: "Instant (before you travel)",
      winner: "myumrahesim",
    },
    {
      feature: "Setup required",
      roaming: "None",
      airportSim: "Physical SIM swap, find store",
      myumrahesim: "Scan QR code (2 minutes)",
      winner: "roaming",
    },
    {
      feature: "Keep home number active",
      roaming: "Yes",
      airportSim: "No (must swap SIM)",
      myumrahesim: "Yes (dual-SIM)",
      winner: "myumrahesim",
    },
    {
      feature: "Coverage in Makkah & Madinah",
      roaming: "Depends on home carrier",
      airportSim: "Yes",
      myumrahesim: "Yes (optimized)",
      winner: "myumrahesim",
    },
    {
      feature: "Support in English",
      roaming: "Depends on carrier",
      airportSim: "Limited",
      myumrahesim: "24/7 UK WhatsApp support",
      winner: "myumrahesim",
    },
    {
      feature: "Money-back guarantee",
      roaming: "No",
      airportSim: "No",
      myumrahesim: "Yes",
      winner: "myumrahesim",
    },
    {
      feature: "Pre-purchase before travel",
      roaming: "N/A",
      airportSim: "No",
      myumrahesim: "Yes",
      winner: "myumrahesim",
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose MyUmrahESIM?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Compare us with roaming and airport SIM cards. See why 10,000+ pilgrims choose us.
          </p>
        </motion.div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 sm:px-6 font-semibold text-gray-900 dark:text-white">
                    Feature
                  </th>
                  <th className="text-center py-4 px-4 sm:px-6 font-semibold text-gray-700 dark:text-gray-300">
                    Roaming
                  </th>
                  <th className="text-center py-4 px-4 sm:px-6 font-semibold text-gray-700 dark:text-gray-300">
                    Airport SIM
                  </th>
                  <th className="text-center py-4 px-4 sm:px-6 font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 rounded-t-lg">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-5 h-5 fill-current" />
                      MyUmrahESIM
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((row, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-b border-gray-100 dark:border-slate-800 ${
                      row.winner === "myumrahesim" 
                        ? "bg-sky-50/50 dark:bg-sky-900/10" 
                        : "hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <td className="py-4 px-4 sm:px-6 font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {row.winner === "roaming" ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-gray-700 dark:text-gray-300">{row.roaming}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {row.winner === "airportSim" ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-gray-700 dark:text-gray-300">{row.airportSim}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center bg-sky-50 dark:bg-sky-900/20">
                      <div className="flex items-center justify-center gap-2">
                        {row.winner === "myumrahesim" ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Check className="w-5 h-5 text-sky-600" />
                        )}
                        <span className={`font-semibold ${
                          row.winner === "myumrahesim" 
                            ? "text-sky-700 dark:text-sky-300" 
                            : "text-gray-700 dark:text-gray-300"
                        }`}>
                          {row.myumrahesim}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-700 dark:to-sky-800 rounded-2xl p-8 sm:p-12 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Save 70% vs. Roaming • Get Connected in 60 Seconds
            </h3>
            <p className="text-lg mb-6 text-sky-100">
              Join 10,000+ pilgrims who chose MyUmrahESIM. Instant activation, UK support, money-back guarantee.
            </p>
            <Link
              href="/plans"
              className="inline-flex items-center gap-2 bg-white text-sky-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-sky-50 transition-all shadow-lg hover:shadow-xl"
              onClick={() => {
                if (typeof window !== 'undefined' && window.fbq) {
                  window.fbq('track', 'Lead');
                }
              }}
            >
              Get Your eSIM Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}




