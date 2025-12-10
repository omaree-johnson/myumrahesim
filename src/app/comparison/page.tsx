import type { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/components/structured-data';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: "eSIM vs Physical SIM vs Roaming - Complete Comparison for Saudi Arabia | Umrah eSIM",
  description: "Compare eSIM vs physical SIM vs international roaming for Saudi Arabia travel. See costs, activation time, coverage, and convenience. Find out why eSIM is the best choice for Umrah and Hajj pilgrims.",
  keywords: [
    "eSIM vs physical SIM",
    "eSIM vs roaming",
    "eSIM comparison",
    "best SIM for Saudi Arabia",
    "eSIM vs traditional SIM",
    "roaming vs eSIM",
    "Saudi Arabia SIM comparison",
    "Umrah SIM card comparison",
    "Hajj SIM comparison",
    "cheapest way to get data in Saudi Arabia",
  ],
  openGraph: {
    title: "eSIM vs Physical SIM vs Roaming - Complete Comparison",
    description: "Compare eSIM vs physical SIM vs international roaming for Saudi Arabia travel. See why eSIM is the best choice for Umrah and Hajj.",
    type: "article",
    url: "/comparison",
    images: [
      {
        url: '/kaaba-herop.jpg',
        width: 1200,
        height: 630,
        alt: 'eSIM vs Physical SIM vs Roaming Comparison',
      },
    ],
  },
  alternates: {
    canonical: "/comparison",
  },
};

export default function ComparisonPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  return (
    <>
      <StructuredData type="article" data={{
        headline: "eSIM vs Physical SIM vs Roaming - Complete Comparison for Saudi Arabia",
        description: "Compare eSIM vs physical SIM vs international roaming for Saudi Arabia travel. See costs, activation time, coverage, and convenience.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/comparison`,
        datePublished: "2025-01-01",
        dateModified: new Date().toISOString().split('T')[0],
      }} />
      
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-5xl">
        <Breadcrumbs 
          items={[
            { name: 'Home', url: '/' },
            { name: 'Comparison', url: '/comparison' }
          ]} 
          className="mb-6"
        />
        
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            eSIM vs Physical SIM vs Roaming: Complete Comparison
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Choosing the right connectivity option for your Saudi Arabia trip can save you hundreds of dollars. 
            Compare eSIM, physical SIM, and international roaming to make the best decision for your Umrah or Hajj journey.
          </p>
        </header>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sky-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">eSIM</th>
                  <th className="px-6 py-4 text-center font-semibold">Physical SIM</th>
                  <th className="px-6 py-4 text-center font-semibold">Roaming</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                <tr className="bg-gray-50 dark:bg-slate-900">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Cost (7 days)</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">£17-30</td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">£25-50</td>
                  <td className="px-6 py-4 text-center text-red-600 dark:text-red-400 font-semibold">£100-300+</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Activation Time</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">Instant</td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">1-2 hours</td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">Pre-activated</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-slate-900">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Setup Required</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">Scan QR code</td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">Visit store, swap SIM</td>
                  <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">None</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Keep Home SIM</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">✅ Yes</td>
                  <td className="px-6 py-4 text-center text-red-600 dark:text-red-400">❌ No</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400">✅ Yes</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-slate-900">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Coverage</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">Excellent</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400">Excellent</td>
                  <td className="px-6 py-4 text-center text-amber-600 dark:text-amber-400">Variable</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Data Speeds</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">4G/5G</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400">4G/5G</td>
                  <td className="px-6 py-4 text-center text-amber-600 dark:text-amber-400">3G/4G</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-slate-900">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Purchase Before Travel</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">✅ Yes</td>
                  <td className="px-6 py-4 text-center text-red-600 dark:text-red-400">❌ No</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400">✅ Yes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Hidden Fees</td>
                  <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">None</td>
                  <td className="px-6 py-4 text-center text-amber-600 dark:text-amber-400">Possible</td>
                  <td className="px-6 py-4 text-center text-red-600 dark:text-red-400 font-semibold">Many</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Comparison */}
        <div className="space-y-8 mb-12">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why eSIM is the Best Choice</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                eSIM combines the best of all worlds: the convenience of roaming (no store visits), the cost savings of a local SIM, 
                and the ability to keep your home number active. Here's why eSIM is the clear winner:
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li>✅ <strong>70-90% cheaper than roaming</strong> - Save hundreds on your trip</li>
                <li>✅ <strong>Instant activation</strong> - No waiting in line at stores</li>
                <li>✅ <strong>Keep your home SIM</strong> - Use both simultaneously</li>
                <li>✅ <strong>Purchase before travel</strong> - Activate when you arrive</li>
                <li>✅ <strong>No hidden fees</strong> - Transparent pricing</li>
                <li>✅ <strong>High-speed 4G/5G</strong> - Fast data speeds</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Cost Comparison Example</h2>
            <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200 mb-4">
                <strong>7-day trip to Saudi Arabia for Umrah:</strong>
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>📱 <strong>eSIM:</strong> £17-30 (5-10GB plan)</li>
                <li>📱 <strong>Physical SIM:</strong> £25-50 (plus time to find/store)</li>
                <li>📱 <strong>International Roaming:</strong> £100-300+ (depending on carrier)</li>
              </ul>
              <p className="text-gray-800 dark:text-gray-200 mt-4">
                <strong>Savings with eSIM:</strong> Up to £280 compared to roaming!
              </p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-sky-600 to-emerald-600 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your eSIM?</h2>
          <p className="text-xl mb-6 opacity-90">
            Choose the best connectivity option for your Umrah or Hajj journey. Save money and stay connected.
          </p>
          <Link
            href="/plans"
            className="inline-block bg-white text-sky-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            View eSIM Plans
          </Link>
        </div>
      </article>
      
      <Footer />
    </>
  );
}

