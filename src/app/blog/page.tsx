import type { Metadata } from "next";
import Link from "next/link";
import { BlogClient } from "./blog-client";
import { getCanonicalUrl } from "@/lib/seoConfig";

// Performance: Static page with long revalidation (blog content changes infrequently)
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "Blog - eSIM for Umrah, Hajj & Ramadan | Guides & Tips",
  description:
    "Expert guides and tips for Umrah, Hajj and Ramadan. eSIM setup, Nusuk app, when to buy, Ramadan eSIM, device compatibility, troubleshooting, and staying connected in Saudi Arabia.",
  keywords: [
    "Umrah travel tips",
    "eSIM guide Umrah",
    "eSIM guide Hajj",
    "eSIM Ramadan",
    "Ramadan eSIM guide",
    "when to buy eSIM Umrah",
    "Saudi Arabia travel",
    "Makkah travel guide",
    "Madinah tips",
    "mobile data abroad",
    "pilgrimage connectivity",
    "Nusuk app eSIM",
    "eSIM troubleshooting",
  ],
  openGraph: {
    title: "Blog - eSIM for Umrah, Hajj & Ramadan | Guides & Tips",
    description:
      "Expert guides and tips for Umrah, Hajj and Ramadan. eSIM setup, Nusuk app, Ramadan eSIM, when to buy, and staying connected in Saudi Arabia.",
    type: "website",
    url: getCanonicalUrl("/blog"),
  },
  alternates: {
    canonical: getCanonicalUrl("/blog"),
  },
};

export default function BlogPage() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-16">
        {/* Back to Home Link */}
        <div className="max-w-5xl mx-auto mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-sky-800 dark:text-sky-400 mb-6 tracking-tight">
            {brandName} Blog
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Insights, guides, and expert advice for Umrah, Hajj and Ramadan—eSIM setup, Nusuk app, when to buy, and staying connected in Saudi Arabia.
          </p>
        </div>

        {/* Blog Client Component with Tabs */}
        <BlogClient />

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-20 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-10 border border-sky-100 dark:border-sky-900">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready for Your Umrah, Hajj or Ramadan Trip?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-base md:text-lg">
              Browse eSIM plans and get instant QR delivery. No physical SIM needed—activate when you land.
            </p>
            <Link
              href="/plans"
              className="inline-block px-8 py-3 bg-sky-600 dark:bg-sky-500 text-white rounded-full text-sm md:text-base font-semibold hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors shadow-md"
            >
              Browse eSIM Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
