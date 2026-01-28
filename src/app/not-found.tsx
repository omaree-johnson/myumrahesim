import Link from "next/link";
import { Metadata } from "next";
import { Home, Search, Phone, ArrowRight } from "lucide-react";
import { seoConfig, getCanonicalUrl } from "@/lib/seoConfig";
import Footer from "@/components/footer";
import { StructuredData } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Page Not Found - 404 | My Umrah eSIM",
  description: "The page you're looking for doesn't exist. Find the best eSIM plans for Umrah and Hajj, or get help from our support team.",
  robots: {
    index: false, // Don't index 404 pages
    follow: true,
  },
  alternates: {
    canonical: getCanonicalUrl("/404"),
  },
};

export default function NotFound() {
  return (
    <>
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "404 - Page Not Found", url: "/404" },
          ],
        }}
      />
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="max-w-2xl w-full text-center">
            {/* 404 Number */}
            <div className="mb-8">
              <h1 className="text-9xl sm:text-[12rem] font-bold text-sky-600 dark:text-sky-400 leading-none">
                404
              </h1>
            </div>

            {/* Main Message */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.
            </p>

            {/* Helpful Links */}
            <div className="space-y-4 mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Popular Pages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/"
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Homepage</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/plans"
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-medium rounded-lg border-2 border-gray-300 dark:border-slate-600 transition-colors"
                >
                  <Search className="w-5 h-5" />
                  <span>View Plans</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/faq"
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-medium rounded-lg border-2 border-gray-300 dark:border-slate-600 transition-colors"
                >
                  <Search className="w-5 h-5" />
                  <span>FAQ</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/support"
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-medium rounded-lg border-2 border-gray-300 dark:border-slate-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>Support</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Search Suggestion */}
            <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Looking for something specific? Try searching our site or browse our popular guides:
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/ultimate-guide-esim-umrah"
                  className="px-4 py-2 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-medium rounded-lg border border-sky-300 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors text-sm"
                >
                  Umrah eSIM Guide
                </Link>
                <Link
                  href="/ultimate-guide-esim-hajj"
                  className="px-4 py-2 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-medium rounded-lg border border-sky-300 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors text-sm"
                >
                  Hajj eSIM Guide
                </Link>
                <Link
                  href="/ultimate-guide-esim-saudi-arabia"
                  className="px-4 py-2 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-medium rounded-lg border border-sky-300 dark:border-sky-700 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors text-sm"
                >
                  Saudi Arabia Guide
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
