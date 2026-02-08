"use client";

import Link from "next/link";
import { Smartphone, ChevronRight } from "lucide-react";

/**
 * Compact device compatibility + how-it-works block for checkout and cart.
 * Stays client: rendered by client pages (checkout/cart), so cannot be a Server Component.
 * No modals; simple, obvious for non-technical users. Emphasises install before travel.
 */
export function CheckoutSetupReassurance() {
  return (
    <div className="w-full max-w-lg mx-auto mt-6 sm:mt-8 space-y-6">
      {/* Is my phone compatible? */}
      <section aria-labelledby="compat-heading" className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 sm:p-5">
        <h2 id="compat-heading" className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white mb-2">
          <Smartphone className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden />
          Is my phone compatible?
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          Most iPhones (XS and newer) and many Android phones (e.g. Samsung S20+, Google Pixel) support eSIM.
        </p>
        <Link
          href="/blog/esim-device-compatibility"
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
        >
          Check my device
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      {/* How it works: 3 steps, install before travel emphasised */}
      <section aria-labelledby="how-heading" className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 sm:p-5">
        <h2 id="how-heading" className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          How it works
        </h2>
        <ol className="space-y-4" role="list">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-sm font-semibold" aria-hidden>
              1
            </span>
            <div>
              <span className="font-medium text-slate-900 dark:text-white">Pay securely</span>
              <span className="text-slate-600 dark:text-slate-300"> You get your QR code by email right away.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-sm font-semibold" aria-hidden>
              2
            </span>
            <div>
              <span className="font-medium text-slate-900 dark:text-white">Install the eSIM on your phone</span>
              <span className="text-slate-600 dark:text-slate-300"> Scan the QR we sent. You can do this at home before you travel.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-sm font-semibold" aria-hidden>
              3
            </span>
            <div>
              <span className="font-medium text-slate-900 dark:text-white">When you land</span>
              <span className="text-slate-600 dark:text-slate-300"> Turn on data for your eSIM and you’re connected. No airport SIM queues.</span>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
