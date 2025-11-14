import type { Metadata } from "next";
import SimpleBlogContent01 from "@/components/creative-tim/blocks/simple-blog-content-01";

export const metadata: Metadata = {
  title: "Blog - Umrah Travel Tips & eSIM Guides",
  description:
    "Expert guides and tips for your Umrah journey. Learn about eSIM technology, staying connected in Saudi Arabia, and travel advice for Makkah and Madinah.",
  keywords: [
    "Umrah travel tips",
    "eSIM guide",
    "Saudi Arabia travel",
    "Makkah travel guide",
    "Madinah tips",
    "mobile data abroad",
    "pilgrimage connectivity",
    "international roaming tips",
  ],
  openGraph: {
    title: "Blog - Umrah Travel Tips & eSIM Guides",
    description:
      "Expert guides and tips for your Umrah journey. Learn about eSIM technology and staying connected in Saudi Arabia.",
    type: "website",
  },
};

export default function BlogPage() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-16">
        {/* Back to Home Link */}
        <div className="max-w-5xl mx-auto mb-8">
          <a
            href="/"
            className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium transition-colors"
          >
            ← Back to Home
          </a>
        </div>

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-sky-800 dark:text-sky-400 mb-6 tracking-tight">
            {brandName} Blog
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Insights, guides, and expert advice to help you stay connected and
            make the most of your Umrah journey in Saudi Arabia.
          </p>
        </div>

        {/* Categories */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "All Posts", active: true },
              { label: "Guides" },
              { label: "Travel Tips" },
              { label: "Tutorials" },
            ].map((cat) => (
              <button
                key={cat.label}
                className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all border ${
                  cat.active
                    ? "bg-sky-600 text-white border-sky-600 hover:bg-sky-700"
                    : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Content */}
        <div className="max-w-5xl mx-auto">
          {/* Replace with clickable blog post cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Example blog post card, repeat for each post */}
            <a
              href="/blog/esim-setup-guide"
              className="block bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all group"
            >
              <h3 className="text-xl font-bold text-sky-700 dark:text-sky-400 group-hover:underline mb-2">eSIM Setup Guide</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Step-by-step instructions for installing and activating your eSIM for Umrah travel.</p>
              <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">Read More →</span>
            </a>
            <a
              href="/blog/staying-connected-saudi-arabia"
              className="block bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all group"
            >
              <h3 className="text-xl font-bold text-sky-700 dark:text-sky-400 group-hover:underline mb-2">Staying Connected in Saudi Arabia</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Tips for reliable mobile data and connectivity during your pilgrimage.</p>
              <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">Read More →</span>
            </a>
            <a
              href="/blog/troubleshooting-esim"
              className="block bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all group"
            >
              <h3 className="text-xl font-bold text-sky-700 dark:text-sky-400 group-hover:underline mb-2">Troubleshooting eSIM Issues</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Common problems and solutions for eSIM activation and usage.</p>
              <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">Read More →</span>
            </a>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="max-w-3xl mx-auto mt-20 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-10 border border-sky-100 dark:border-sky-900">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              More Content Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-base md:text-lg">
              We're preparing valuable guides and insights to make your Umrah
              experience smoother and more connected.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-3 bg-sky-600 dark:bg-sky-500 text-white rounded-full text-sm md:text-base font-semibold hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors shadow-md"
            >
              Browse eSIM Plans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
