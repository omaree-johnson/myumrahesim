"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  Calendar,
  Database,
  Users,
  Check,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import {
  BUNDLE_DEFINITIONS,
  pickProductForBundle,
  getSavingsLabel,
} from "@/lib/bundle-config";
import { trackBundleEvent } from "@/lib/bundle-analytics";

interface EsimProduct {
  id: string;
  title?: string;
  data?: string;
  validity?: string;
  dataGB?: number;
  durationDays?: number;
  price?: { display?: string; amount?: number; currency?: string };
}

interface BundleSectionProps {
  products: EsimProduct[];
}

/**
 * Bundle section: Single, Couple, Family, Extended Stay.
 * Uses existing products + quantity; cart/checkout unchanged. Volume discount applied at checkout.
 */
export function BundleSection({ products }: BundleSectionProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const resolved = BUNDLE_DEFINITIONS.map((def) => {
    const picked = pickProductForBundle(products, def.extendedValidity);
    if (!picked) return null;
    const unitAmount = products.find((p) => p.id === picked.id)?.price?.amount ?? 0;
    const currency = products.find((p) => p.id === picked.id)?.price?.currency ?? "USD";
    const totalRaw = unitAmount * def.devices;
    const totalDisplay =
      picked.priceDisplay && def.devices > 1
        ? `${picked.priceDisplay} × ${def.devices}`
        : picked.priceDisplay;
    const savingsLabel =
      def.devices > 1 && unitAmount > 0
        ? getSavingsLabel(unitAmount, def.devices, totalRaw, currency)
        : null;
    return {
      def,
      picked,
      unitAmount,
      totalRaw,
      totalDisplay,
      savingsLabel,
      bundleCartName: `Bundle: ${def.label}, ${def.devices} × ${picked.data || "Data"} ${picked.validity || ""}`.trim(),
    };
  }).filter(Boolean) as Array<{
    def: (typeof BUNDLE_DEFINITIONS)[0];
    picked: { id: string; priceDisplay: string; data?: string; validity?: string };
    unitAmount: number;
    totalRaw: number;
    totalDisplay: string;
    savingsLabel: string | null;
    bundleCartName: string;
  }>;

  const handleSelectBundle = (item: (typeof resolved)[0]) => {
    // Bundle analytics: track selection before adding to cart
    trackBundleEvent({
      event: "bundle_selected",
      bundleSlug: item.def.slug,
      offerId: item.picked.id,
      quantity: item.def.devices,
    });
    addItem(
      {
        offerId: item.picked.id,
        name: item.bundleCartName,
        priceLabel: item.picked.priceDisplay,
        bundleSlug: item.def.slug,
      },
      item.def.devices
    );
    router.push("/cart");
  };

  // Bundle analytics: track section view once per mount when bundles are visible
  const viewedRef = useRef(false);
  useEffect(() => {
    if (resolved.length > 0 && !viewedRef.current) {
      viewedRef.current = true;
      trackBundleEvent({ event: "bundle_section_viewed", bundleSlugs: resolved.map((r) => r.def.slug) });
    }
  }, [resolved.length]);

  if (resolved.length === 0) return null;

  // Short, clear descriptions per bundle; reduce confusion, emphasise peace of mind (no hype)
  const bundleDescriptions: Record<string, string> = {
    single: "One plan for your phone. Simple and straightforward for those travelling alone.",
    couple: "Two plans in one order. You and your travel companion each get your own data and QR code.",
    family: "Up to five plans in one order. Everyone gets their own QR code. No sharing, no hassle.",
    extended: "One plan with longer validity. For trips of a month or more.",
  };

  return (
    <section
      aria-labelledby="bundle-heading"
      className="py-10 sm:py-12 lg:py-16 border-t border-slate-200 dark:border-slate-700"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h2
          id="bundle-heading"
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2"
        >
          Stay connected during your journey
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-2xl">
          Choose how many people need data. One order, one email. Each person gets their own QR code to use on their phone. No airport SIM queues; you can activate before you fly or when you land.
        </p>

        {/* Cards: mobile-first stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {resolved.map((item) => (
            <div
              key={item.def.slug}
              className={`relative rounded-xl border-2 p-4 sm:p-5 flex flex-col min-h-[280px] touch-manipulation ${
                item.def.mostPopular
                  ? "border-sky-500 dark:border-sky-400 bg-sky-50/50 dark:bg-slate-800/50 shadow-lg"
                  : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
              }`}
            >
              {item.def.mostPopular && (
                <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-xs font-semibold">
                  Most popular
                </span>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden />
                <span className="font-semibold text-slate-900 dark:text-white">{item.def.label}</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-3 flex-1">
                <li className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                  <span>{item.def.devices} eSIM{item.def.devices !== 1 ? "s" : ""} included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                  <span>{item.picked.data || "Data"} per eSIM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                  <span>{item.picked.validity || "Valid"} each</span>
                </li>
              </ul>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                {bundleDescriptions[item.def.slug] ?? item.def.bestFor}
              </p>
              {item.savingsLabel && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                  {item.savingsLabel}
                </p>
              )}
              <p className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                {item.totalDisplay}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Volume discount applied at checkout
              </p>
              <button
                type="button"
                onClick={() => handleSelectBundle(item)}
                className={`w-full py-3.5 rounded-lg font-semibold text-center transition-all touch-manipulation ${
                  item.def.mostPopular
                    ? "bg-sky-600 hover:bg-sky-700 text-white shadow-md"
                    : "bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white"
                }`}
              >
                Add to cart
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                You’ll review your order in the cart before paying
              </p>
            </div>
          ))}
        </div>

        {/* Who this is for + QR explanation + installation + reassurance */}
        <div className="mt-8 sm:mt-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-sky-600 dark:text-sky-400" aria-hidden />
            How it works
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Single and Extended Stay are one plan for one phone. Couple and Family mean multiple plans in one order; each person gets their own QR code. No sharing data, and no need to queue for a SIM at the airport.
          </p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Each person gets their own QR code
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            After you pay, we send one email with a link to your order page. You’ll see a separate QR code for each plan. Each traveller scans their own code on their phone. Simple and clear.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Link
              href="/blog/how-to-install-esim-saudi-arabia"
              className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-400 hover:underline font-medium"
            >
              Installation guide
            </Link>
            <span className="text-slate-400">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden />
              Instant activation, works before you land
            </span>
            <span className="text-slate-400">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden />
              Money-back guarantee · 24/7 support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
