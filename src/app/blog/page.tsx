import type { Metadata } from 'next';
import SimpleBlogContent01 from "@/components/creative-tim/blocks/simple-blog-content-01";

export const metadata: Metadata = {
  title: "Blog - Umrah Travel Tips & eSIM Guides",
  description: "Expert guides and tips for your Umrah journey. Learn about eSIM technology, staying connected in Saudi Arabia, and travel advice for Makkah and Madinah.",
  keywords: [
    "Umrah travel tips",
    "eSIM guide",
    "Saudi Arabia travel",
    "Makkah travel guide",
    "Madinah tips",
    "mobile data abroad",
    "pilgrimage connectivity",
    "international roaming tips"
  ],
  openGraph: {
    title: "Blog - Umrah Travel Tips & eSIM Guides",
    description: "Expert guides and tips for your Umrah journey. Learn about eSIM technology and staying connected in Saudi Arabia.",
    type: "website",
  },
};

export default function BlogPage() {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {brandName} Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert guides, travel tips, and insights to help you stay connected during your Umrah journey
          </p>
        </div>

        {/* Categories */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
              All Posts
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Guides
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Travel Tips
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              Tutorials
            </button>
          </div>
        </div>

        {/* Creative Tim Blog Content Block */}
        <SimpleBlogContent01 />

        {/* Coming Soon Message */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-white rounded-xl shadow-md p-8 border-2 border-sky-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">More Content Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              We're working on creating valuable content to help make your Umrah journey smooth and connected.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
            >
              Browse eSIM Plans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
