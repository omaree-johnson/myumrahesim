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
    title: "Complete eSIM Guide for Hajj & Umrah | 2025",
    description: `Complete guide to eSIM for Hajj and Umrah. Learn why pilgrims need data, how to activate eSIM, coverage in Makkah and Madinah, and troubleshooting tips. Plans from ${priceText}.`,
    keywords: [
      "eSIM for Hajj",
      "eSIM for Umrah",
      "Hajj eSIM guide",
      "Umrah eSIM guide",
      "eSIM Hajj Umrah",
      "Saudi Arabia eSIM pilgrims",
      "Makkah eSIM",
      "Madinah eSIM",
      "pilgrimage eSIM",
      "Hajj mobile data",
      "Umrah mobile data",
      "best eSIM for Hajj",
      "best eSIM for Umrah",
    ],
    openGraph: {
      title: "Complete eSIM Guide for Hajj & Umrah | 2025",
      description: `Complete guide to eSIM for Hajj and Umrah pilgrims. Learn why you need data, how to activate, and stay connected during your spiritual journey.`,
      type: "article",
      url: `${baseUrl}/blog/hajj-umrah-esim-guide`,
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'Complete eSIM Guide for Hajj and Umrah',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/blog/hajj-umrah-esim-guide`,
    },
  };
}

export default async function HajjUmrahEsimGuidePage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";

  return (
    <>
      {/* Article Structured Data */}
      <StructuredData type="article" data={{
        headline: "Complete eSIM Guide for Hajj & Umrah | 2025",
        description: "Complete guide to eSIM for Hajj and Umrah. Learn why pilgrims need data, how to activate eSIM, coverage in Makkah and Madinah, and troubleshooting tips.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/blog/hajj-umrah-esim-guide`,
        datePublished: "2025-12-17",
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          name: "My Umrah eSIM Team",
          url: baseUrl,
        },
        articleBody: `Complete guide to using eSIM for Hajj and Umrah. Learn why pilgrims need mobile data, how eSIM works, activation steps, coverage in Makkah and Madinah, troubleshooting tips, and how to stay connected during your spiritual journey.`,
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs items={[
          { name: 'Blog', url: '/blog' },
          { name: 'Hajj & Umrah eSIM Guide', url: '/blog/hajj-umrah-esim-guide' },
        ]} className="mb-6" />

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Complete eSIM Guide for Hajj & Umrah
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Everything you need to know about staying connected during your spiritual journey
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime="2025-12-17">December 17, 2025</time>
              <span>•</span>
              <span>8 min read</span>
            </div>
          </header>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Pilgrims Need Mobile Data During Hajj & Umrah
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Modern Hajj and Umrah journeys require reliable internet connectivity for several essential purposes:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  📱 Nusuk App & Digital Permits
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  The official Nusuk app requires internet to download permits, access navigation, receive updates, and check prayer times. Without data, you'll need to find Wi-Fi hotspots which can be unreliable.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  🗺️ Navigation & Maps
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Google Maps and navigation apps help you find your hotel, locate prayer areas, navigate between Makkah and Madinah, and find essential services. Offline maps have limitations.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  💬 Communication with Family
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Stay connected with loved ones back home via WhatsApp, video calls, and social media. Share your journey and provide updates on your safety and wellbeing.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  📞 Emergency Connectivity
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Access emergency services, contact tour operators, reach out to authorities, and get help if needed. Reliable connectivity is crucial for safety.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  📚 Religious Resources
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Access Quran apps, prayer time apps, Qibla compass, Islamic guides, and educational content to enhance your spiritual experience.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              eSIM vs Physical SIM for Hajj & Umrah
            </h2>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300 dark:border-slate-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-700">
                    <th className="border border-gray-300 dark:border-slate-600 p-3 text-left font-semibold">Feature</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-3 text-left font-semibold">eSIM</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-3 text-left font-semibold">Physical SIM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Activation</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Instant via QR code</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Visit store, wait in line</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-slate-800">
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Setup Time</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">2-3 minutes</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">30-60 minutes</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Cost</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">From {priceText}</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Usually higher</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-slate-800">
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Convenience</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Buy before travel</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Buy after arrival</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Dual SIM</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Keep home SIM active</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Remove home SIM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How to Activate Your eSIM for Hajj & Umrah
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Purchase Your eSIM Plan
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Choose a data plan that matches your travel duration. For Umrah (typically 7-14 days), a 7-day or 15-day plan works well. For Hajj (longer duration), consider a 30-day plan.
                  </p>
                  <Link href="/plans" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                    Browse eSIM Plans →
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Receive QR Code via Email
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    After purchase, you'll receive an email with your QR code and activation instructions. Save this email or screenshot the QR code for easy access.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Activate When You Arrive
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    When you land in Saudi Arabia, go to Settings &gt; Cellular/Mobile Data &gt; Add Cellular Plan. Scan the QR code or enter the activation code manually.
                  </p>
                  <Link href="/activation" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                    Detailed Activation Guide →
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Enable Data Roaming
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    After activation, enable data roaming in your phone settings and select the eSIM as your primary data connection. Your phone will connect to local Saudi networks automatically.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Coverage in Makkah & Madinah
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our eSIM plans provide excellent coverage throughout Saudi Arabia, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
              <li><strong>Makkah:</strong> Grand Mosque area, hotels, residential areas, and throughout the city</li>
              <li><strong>Madinah:</strong> Prophet's Mosque, hotels, and all areas of the city</li>
              <li><strong>Jeddah:</strong> Airport, hotels, and city center</li>
              <li><strong>Highways:</strong> Coverage along routes between cities</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Our eSIM connects to major Saudi networks (STC, Mobily, Zain) automatically, ensuring the best available signal wherever you are.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Troubleshooting Common Issues
            </h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">eSIM Not Activating</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Ensure your device supports eSIM. Most modern iPhones (XS and later) and Android phones (Pixel 3 and later, Samsung Galaxy S20+) support eSIM.
                </p>
                <Link href="/blog/esim-device-compatibility" className="text-sky-600 dark:text-sky-400 hover:underline text-sm font-medium">
                  Check Device Compatibility →
                </Link>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Internet Connection</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  Make sure data roaming is enabled in your phone settings. Go to Settings &gt; Cellular/Mobile Data &gt; Data Roaming and toggle it on.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Slow Internet Speed</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  During peak times (especially during Hajj), network congestion can occur. Try switching between networks manually or wait a few minutes.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/blog/troubleshooting-esim" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                View Complete Troubleshooting Guide →
              </Link>
            </div>
          </section>

          <section className="mb-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg p-6 border border-sky-200 dark:border-sky-800">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Get Your eSIM for Hajj & Umrah Today
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Don't wait until you arrive. Purchase your eSIM now and have instant connectivity from the moment you land. Plans start from {priceText} with instant QR code delivery.
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
              <Link href="/blog/nusuk-app-esim-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Nusuk App + eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">How to use the Nusuk app with eSIM</p>
              </Link>
              <Link href="/ultimate-guide-esim-umrah" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Umrah eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Detailed guide for Umrah pilgrims</p>
              </Link>
              <Link href="/ultimate-guide-esim-hajj" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Hajj eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive guide for Hajj pilgrims</p>
              </Link>
              <Link href="/blog/esim-device-compatibility" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Device Compatibility</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Check if your device supports eSIM</p>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
