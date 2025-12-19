import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { StructuredData } from '@/components/structured-data';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { getLowestPrice } from '@/lib/pricing';

export async function generateMetadata(): Promise<Metadata> {
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  return {
    title: "Nusuk App + eSIM Guide for Umrah & Hajj | Complete Setup",
    description: `Complete guide to using the Nusuk app with eSIM during Umrah and Hajj. Learn how eSIM makes Nusuk app usage smoother for permits, navigation, and staying connected. Plans from ${priceText}.`,
    keywords: [
      "Nusuk app eSIM",
      "Nusuk app Umrah",
      "Nusuk app Hajj",
      "eSIM Nusuk",
      "Nusuk app guide",
      "Umrah permits app",
      "Hajj permits app",
      "Nusuk app setup",
      "eSIM for Nusuk",
      "Saudi Arabia eSIM Nusuk",
      "Makkah eSIM Nusuk",
      "Madinah eSIM Nusuk",
    ],
    openGraph: {
      title: "Nusuk App + eSIM Guide for Umrah & Hajj | Complete Setup",
      description: `Complete guide to using the Nusuk app with eSIM during Umrah and Hajj. Learn how eSIM makes permits, navigation, and connectivity seamless.`,
      type: "article",
      url: `${baseUrl}/blog/nusuk-app-esim-guide`,
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'Nusuk App and eSIM Guide for Umrah and Hajj',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/blog/nusuk-app-esim-guide`,
    },
  };
}

export default async function NusukAppEsimGuidePage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";

  return (
    <>
      {/* Article Structured Data */}
      <StructuredData type="article" data={{
        headline: "Nusuk App + eSIM Guide for Umrah & Hajj | Complete Setup",
        description: "Complete guide to using the Nusuk app with eSIM during Umrah and Hajj. Learn how eSIM makes Nusuk app usage smoother for permits, navigation, and staying connected.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/blog/nusuk-app-esim-guide`,
        datePublished: "2025-12-17",
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          name: "My Umrah eSIM Team",
          url: baseUrl,
        },
        articleBody: `The Nusuk app is essential for Umrah and Hajj pilgrims, providing digital permits, navigation, and important information. Having a reliable eSIM connection makes using the Nusuk app seamless and stress-free. This guide explains how eSIM enhances your Nusuk app experience during your spiritual journey.`,
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs items={[
          { name: 'Blog', url: '/blog' },
          { name: 'Nusuk App + eSIM Guide', url: '/blog/nusuk-app-esim-guide' },
        ]} className="mb-6" />

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Nusuk App + eSIM: Complete Guide for Umrah & Hajj
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              How eSIM makes using the Nusuk app seamless during your spiritual journey
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime="2025-12-17">December 17, 2025</time>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </header>

          <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 mb-8 rounded-r">
            <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
              Quick Summary
            </p>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              The Nusuk app is the official app for Umrah and Hajj permits. Having an eSIM ensures you can access permits, navigation, and important updates instantly without relying on Wi-Fi or expensive roaming.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What is the Nusuk App?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The <strong>Nusuk app</strong> is the official digital platform for Umrah and Hajj pilgrims, developed by the Saudi Ministry of Hajj and Umrah. It provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
              <li>Digital Umrah and Hajj permits</li>
              <li>Real-time navigation to holy sites</li>
              <li>Prayer times and Qibla direction</li>
              <li>Important announcements and updates</li>
              <li>Health and safety information</li>
              <li>Emergency contact information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why You Need eSIM for the Nusuk App
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              While the Nusuk app can work offline for some features, having a reliable internet connection is crucial for:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  📱 Instant Permit Access
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Download and access your Umrah permits immediately upon arrival. No need to wait for Wi-Fi or worry about roaming charges.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  🗺️ Real-Time Navigation
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Get turn-by-turn directions to the Grand Mosque, Prophet's Mosque, and other important sites. Works seamlessly with Google Maps integration.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  🔔 Important Updates
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Receive real-time notifications about prayer times, crowd levels, weather, and any important announcements from authorities.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  📞 Emergency Connectivity
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Stay connected for emergency calls, WhatsApp messages to family, and accessing help services if needed.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How to Set Up Nusuk App with eSIM
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Purchase Your eSIM Before Travel
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Buy your eSIM plan for Saudi Arabia before you leave home. Our plans start from {priceText} and include instant QR code delivery.
                  </p>
                  <Link href="/plans" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                    View eSIM Plans →
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Activate Your eSIM
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Scan the QR code when you arrive in Saudi Arabia. Your eSIM will connect to local networks (STC, Mobily, or Zain) automatically.
                  </p>
                  <Link href="/activation" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                    Activation Guide →
                  </Link>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Download the Nusuk App
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Download the Nusuk app from the App Store (iOS) or Google Play Store (Android) before or after you arrive.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Register and Access Permits
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Create your Nusuk account and access your Umrah permits. With eSIM, you can do this instantly without waiting for Wi-Fi.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Benefits of eSIM + Nusuk App Combination
            </h2>
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">✓</span>
                  <span><strong>No Wi-Fi dependency:</strong> Access permits and navigation anywhere, anytime</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">✓</span>
                  <span><strong>Cost-effective:</strong> Save 70% compared to international roaming</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">✓</span>
                  <span><strong>Instant activation:</strong> Connect immediately upon arrival</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">✓</span>
                  <span><strong>Reliable coverage:</strong> Works in Makkah, Madinah, and throughout Saudi Arabia</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 font-bold mt-1">✓</span>
                  <span><strong>High-speed data:</strong> 4G/5G speeds for smooth app usage and video calls</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Common Nusuk App Features That Require Internet
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Permit Downloads</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download and refresh permits</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Navigation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time directions to holy sites</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Prayer Times</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accurate prayer time updates</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Important updates and alerts</p>
              </div>
            </div>
          </section>

          <section className="mb-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg p-6 border border-sky-200 dark:border-sky-800">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Get your eSIM for Saudi Arabia today and ensure seamless Nusuk app usage during your Umrah or Hajj journey. Plans start from {priceText} with instant activation.
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
              <Link href="/ultimate-guide-esim-umrah" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Umrah eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Everything you need to know about eSIM for Umrah</p>
              </Link>
              <Link href="/ultimate-guide-esim-hajj" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Hajj eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive guide to eSIM for Hajj pilgrims</p>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
