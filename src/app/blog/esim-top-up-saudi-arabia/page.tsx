import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, CheckCircle2, AlertTriangle, Wifi, Smartphone } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Top Up Your Saudi Arabia eSIM (When Data Is Low) | Umrah eSIM",
  description:
    "Learn how to top up your Saudi Arabia eSIM when your data is running low. Includes low-data alerts, checking usage, and the fastest top up steps for Umrah/Hajj travel.",
  keywords: [
    "eSIM top up Saudi Arabia",
    "top up eSIM",
    "low data alert eSIM",
    "Umrah eSIM top up",
    "Saudi Arabia data top up",
    "eSIM usage check",
    "how to add more data eSIM",
  ],
  openGraph: {
    title: "How to Top Up Your Saudi Arabia eSIM (When Data Is Low)",
    description:
      "Step-by-step guide to topping up your Saudi eSIM when your data is running low—so you stay connected in Makkah and Madinah.",
    type: "article",
    publishedTime: "2025-12-17T00:00:00.000Z",
  },
};

export default function BlogPost() {
  return (
    <article className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-sm font-medium rounded-full mb-4">
            Tutorial
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            How to Top Up Your Saudi Arabia eSIM (When Data Is Low)
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime="2025-12-17">December 17, 2025</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>6 min read</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 font-medium">
            Running low on data during Umrah is stressful—especially when you need maps, ride apps, or messages to
            coordinate your group. This guide shows you the fastest way to top up so you stay connected in Saudi
            Arabia.
          </p>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-l-4 border-amber-500 dark:border-amber-400 rounded-r-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              Quick Answer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-0">
              If you get a <strong>Low Data Alert</strong> email, open it and tap <strong>Top Up My eSIM</strong>.
              You’ll be guided to sign in (or create an account) with the same email you used at checkout, then you can
              top up in minutes.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-10 mb-6 pb-3 border-b-2 border-sky-200 dark:border-sky-800 flex items-center gap-2">
            <Wifi className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            How low-data alerts work
          </h2>

          <p>
            Your eSIM provider can notify our system when your remaining data drops below certain thresholds. When that
            happens, we email you a quick summary (remaining data + plan total) and a one-tap link to top up.
          </p>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              Tip: Use the same email every time
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-0">
              If you purchased without an account, you can still create one later. Just sign up with the <strong>same
              email</strong> you used when you bought the eSIM—your orders will appear automatically.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-10 mb-6 pb-3 border-b-2 border-sky-200 dark:border-sky-800 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Step-by-step: Top up in minutes
          </h2>

          <ol>
            <li>
              <strong>Open your low-data email</strong> and tap <strong>Top Up My eSIM</strong>.
            </li>
            <li>
              <strong>Sign in / sign up</strong> with the same email you used at checkout.
            </li>
            <li>
              Choose a <strong>top up option</strong> that matches how long you’ll stay and how much data you need.
            </li>
            <li>
              Complete checkout and your top up will be applied to your existing eSIM.
            </li>
          </ol>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-10 mb-6 pb-3 border-b-2 border-sky-200 dark:border-sky-800">
            Prefer checking manually?
          </h2>

          <p>
            You can also sign in and go to{" "}
            <Link href="/orders" className="text-sky-600 dark:text-sky-400 underline">
              My Orders
            </Link>{" "}
            to see usage and tap <strong>Get more data</strong> when a top up is recommended.
          </p>

          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 border border-sky-200 dark:border-sky-800 rounded-xl p-6 mt-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Stay connected for every step</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Don’t wait until you hit 0 GB—top up as soon as you get the low-data alert.
            </p>
            <Link
              href="/plans"
              className="inline-flex items-center justify-center px-6 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors"
            >
              Browse eSIM plans
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

