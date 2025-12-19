import type { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/components/structured-data';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { getLowestPrice } from '@/lib/pricing';

export async function generateMetadata(): Promise<Metadata> {
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  return {
    title: "Best eSIM for Saudi Arabia | Complete Guide for Umrah & Hajj Pilgrims",
    description: `Find the best eSIM for Saudi Arabia for your Umrah or Hajj journey. Compare plans, coverage in Makkah and Madinah, pricing from ${priceText}, and why pilgrims choose eSIM over roaming.`,
    keywords: [
      "best esim saudi arabia",
      "best esim for umrah",
      "best esim for hajj",
      "saudi arabia esim",
      "esim mecca",
      "esim medina",
      "cheap esim saudi arabia",
      "esim plans saudi arabia",
      "best data plan saudi arabia",
      "esim for pilgrims",
    ],
    openGraph: {
      title: "Best eSIM for Saudi Arabia | Complete Guide for Umrah & Hajj Pilgrims",
      description: `Find the best eSIM for Saudi Arabia for your Umrah or Hajj journey. Compare plans, coverage, and pricing.`,
      type: "article",
      url: `${baseUrl}/blog/best-esim-saudi-arabia`,
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'Best eSIM for Saudi Arabia - Umrah and Hajj Guide',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/blog/best-esim-saudi-arabia`,
    },
  };
}

export default async function BestEsimSaudiArabiaPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";

  return (
    <>
      {/* Article Structured Data */}
      <StructuredData type="article" data={{
        headline: "Best eSIM for Saudi Arabia: Complete Guide for Umrah & Hajj Pilgrims",
        description: "Find the best eSIM for Saudi Arabia for your Umrah or Hajj journey. Learn what to look for, compare options, and discover why eSIM is the best choice for pilgrims.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/blog/best-esim-saudi-arabia`,
        datePublished: "2025-12-17",
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          name: "My Umrah eSIM Team",
          url: baseUrl,
        },
        articleBody: `Complete guide to finding the best eSIM for Saudi Arabia for Umrah and Hajj pilgrims. Learn what makes a good eSIM provider, what to look for in coverage and pricing, and why eSIM is the best choice for staying connected during your spiritual journey.`,
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs items={[
          { name: 'Blog', url: '/blog' },
          { name: 'Best eSIM for Saudi Arabia', url: '/blog/best-esim-saudi-arabia' },
        ]} className="mb-6" />

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Best eSIM for Saudi Arabia: Complete Guide for Umrah & Hajj Pilgrims
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Everything you need to know to choose the right eSIM for your pilgrimage journey
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime="2025-12-17">December 17, 2025</time>
              <span>•</span>
              <span>10 min read</span>
            </div>
          </header>

          <section className="mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you're planning a pilgrimage to Saudi Arabia for <strong>Umrah</strong> or <strong>Hajj</strong>, staying connected is essential. 
              You need internet access for the Nusuk app, navigation, contacting family, and accessing important information during your spiritual journey.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              When searching for the <strong>best eSIM for Saudi Arabia</strong>, you'll find many options. This guide helps you understand 
              what makes a good eSIM provider and why choosing the right one matters for your pilgrimage experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Pilgrims Need Reliable Internet in Saudi Arabia
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Modern Umrah and Hajj journeys require internet connectivity for several essential purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
              <li><strong>Nusuk App:</strong> The official app for Umrah and Hajj permits requires internet to download permits, access navigation, and receive updates</li>
              <li><strong>Navigation:</strong> Finding your hotel, locating prayer areas, navigating between Makkah and Madinah</li>
              <li><strong>Communication:</strong> Staying in touch with family back home via WhatsApp, video calls, and social media</li>
              <li><strong>Emergency Access:</strong> Contacting authorities, tour operators, or getting help if needed</li>
              <li><strong>Religious Resources:</strong> Accessing Quran apps, prayer times, Qibla compass, and educational content</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Without reliable internet, you'll be dependent on Wi-Fi hotspots which can be unreliable, especially in crowded areas during peak Umrah and Hajj seasons.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Makes the Best eSIM for Umrah?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Not all eSIM providers are created equal. Here's what to look for when choosing the best eSIM for your Umrah or Hajj journey:
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  ✓ Coverage in Makkah and Madinah
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  The best eSIM for Umrah must provide reliable coverage specifically in Makkah and Madinah, not just major cities. 
                  Look for providers that explicitly mention coverage in these holy cities and connect to major Saudi networks (STC, Mobily, Zain).
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  ✓ Instant Activation
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  You should receive your QR code immediately after purchase, not hours or days later. This allows you to set up your eSIM 
                  before you travel, so you're connected from the moment you land in Saudi Arabia.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  ✓ Plans Designed for Pilgrims
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Look for plans with validity periods that match typical Umrah (7-14 days) and Hajj (longer) durations. 
                  Avoid providers that only offer very short-term or very long-term plans that don't fit your journey.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  ✓ Support During Your Journey
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  The best eSIM providers offer 24/7 support via WhatsApp or email. If something goes wrong during your pilgrimage, 
                  you need help immediately, not during business hours only.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  ✓ Transparent Pricing
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Avoid hidden fees, activation charges, or surprise costs. The best eSIM providers show clear pricing upfront. 
                  Plans should start from around {priceText} for basic coverage, with transparent pricing for larger data allowances.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  ✓ Activation Guarantee
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Look for providers that offer a money-back guarantee if your eSIM doesn't activate or connect. 
                  This gives you peace of mind that you won't be left without connectivity during your journey.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our eSIM Plans: Designed for Pilgrims
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              At My Umrah eSIM, we've designed our service specifically for Umrah and Hajj pilgrims. Here's what makes us the best choice:
            </p>

            <div className="bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 mb-6 border border-sky-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Specialised for Umrah & Hajj
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Unlike generic eSIM providers, we understand the unique needs of pilgrims. We know you need coverage in Makkah and Madinah, 
                support during your journey, and plans that work for the duration of your stay.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Plans from 7 days to 30 days to match your journey length</li>
                <li>Data allowances from 1GB to unlimited, so you can choose what you need</li>
                <li>Instant QR code delivery so you can set up before you travel</li>
                <li>Coverage guaranteed in Makkah, Madinah, and throughout Saudi Arabia</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Pricing That Works for Pilgrims
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Our plans start from {priceText}, making them affordable for pilgrims on different budgets. We offer:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>No hidden fees or activation charges</li>
                <li>No contracts or credit checks</li>
                <li>Transparent pricing displayed clearly</li>
                <li>Money-back guarantee if activation fails</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How to Choose the Right Plan
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Choosing the right eSIM plan depends on your trip length and how you plan to use data:
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">For Short Umrah Trips (7-10 days)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  If you're doing a quick Umrah visit, a 7-day plan with 3-5GB is usually sufficient for navigation, WhatsApp, and basic browsing. 
                  This works well if you have Wi-Fi at your hotel and mainly need data when out and about.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">For Extended Stays (14-30 days)</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  For longer Umrah stays or Hajj, consider a 15-day or 30-day plan with 10GB or more. You'll likely make more video calls, 
                  use navigation more frequently, and may need data for longer periods without Wi-Fi access.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 dark:border-purple-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">For Heavy Data Users</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  If you plan to make frequent video calls, stream content, or use data-intensive apps, consider a larger data plan (10GB+) 
                  or unlimited option. It's better to have more data than to run out mid-journey.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Activation Made Simple
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The best eSIM for Saudi Arabia should be easy to activate. Here's how our process works:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 ml-4 mb-4">
              <li><strong>Purchase online:</strong> Choose your plan and complete checkout in minutes</li>
              <li><strong>Receive QR code:</strong> Get your activation QR code instantly via email</li>
              <li><strong>Scan and install:</strong> Use your phone's camera or settings to scan the QR code</li>
              <li><strong>Activate on arrival:</strong> Enable data roaming when you land in Saudi Arabia</li>
            </ol>
            <p className="text-gray-700 dark:text-gray-300">
              The entire process takes just a few minutes, and you can do most of it before you travel. No need to find a SIM card vendor 
              when you arrive or wait in queues at the airport.
            </p>
            <div className="mt-4">
              <Link href="/activation" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                View detailed activation guide →
              </Link>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Coverage You Can Trust
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The best eSIM for Saudi Arabia must provide reliable coverage where you need it most:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Makkah Coverage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reliable coverage at the Grand Mosque, hotels, and throughout Makkah on major Saudi networks.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Madinah Coverage</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Strong signal at the Prophet's Mosque and all areas of Madinah for seamless connectivity.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Jeddah & Airports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Coverage at Jeddah airport and throughout the city for immediate connectivity upon arrival.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Highways & Routes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Coverage along routes between cities so you stay connected while travelling.
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Our eSIM automatically connects to the best available network (STC, Mobily, or Zain) wherever you are, 
              ensuring you always have the strongest signal possible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              eSIM vs International Roaming: Why eSIM Wins
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Many pilgrims wonder whether to use eSIM or stick with their home network's international roaming. Here's why eSIM is the better choice:
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300 dark:border-slate-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-700">
                    <th className="border border-gray-300 dark:border-slate-600 p-3 text-left font-semibold">Feature</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-3 text-left font-semibold">eSIM</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-3 text-left font-semibold">Roaming</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Cost</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">From {priceText}, transparent pricing</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Often £5-10 per day, can be £100+ for a week</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-slate-800">
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Speed</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Full 4G/5G speeds on local networks</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Often throttled, slower speeds</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Setup</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Instant, before you travel</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">May require calling your carrier</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-slate-800">
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Surprise Charges</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">None - prepaid, fixed price</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Common - data overages, daily fees</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Coverage</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Optimised for Saudi networks</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Depends on carrier agreements</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              For most pilgrims, eSIM saves 70-90% compared to international roaming while providing better speeds and more reliable coverage.
            </p>
          </section>

          <section className="mb-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg p-6 border border-sky-200 dark:border-sky-800">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Your eSIM for Saudi Arabia?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Don't wait until you arrive. Get your eSIM now and have instant connectivity from the moment you land. 
              Plans start from {priceText} with instant QR code delivery and coverage in Makkah, Madinah, and throughout Saudi Arabia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/plans"
                className="inline-block px-6 py-3 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors text-center"
              >
                View eSIM Plans
              </Link>
              <Link
                href="/faq"
                className="inline-block px-6 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-semibold rounded-lg transition-colors text-center"
              >
                Read FAQ
              </Link>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Related Guides
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/blog/hajj-umrah-esim-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Hajj & Umrah eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Everything you need to know about eSIM for your pilgrimage</p>
              </Link>
              <Link href="/blog/nusuk-app-esim-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Nusuk App + eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">How eSIM makes using the Nusuk app seamless</p>
              </Link>
              <Link href="/activation" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Activation Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Step-by-step instructions for activating your eSIM</p>
              </Link>
              <Link href="/blog/esim-device-compatibility" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Device Compatibility</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Check if your phone supports eSIM</p>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
