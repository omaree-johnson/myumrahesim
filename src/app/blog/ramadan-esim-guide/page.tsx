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
    title: "eSIM for Ramadan Umrah | Stay Connected During Ramadan 2025",
    description: `Best eSIM for Ramadan Umrah. Instant activation, coverage in Makkah & Madinah. Plans from ${priceText}. No physical SIM—order before you travel. Ramadan-ready connectivity.`,
    keywords: [
      "eSIM for Ramadan",
      "Ramadan eSIM Saudi Arabia",
      "eSIM Ramadan Umrah",
      "best eSIM for Ramadan",
      "Ramadan Umrah eSIM",
      "eSIM Makkah Ramadan",
      "eSIM Madinah Ramadan",
      "mobile data Ramadan",
      "Ramadan travel eSIM",
      "Saudi Arabia eSIM Ramadan",
      "instant eSIM Ramadan",
    ],
    openGraph: {
      title: "eSIM for Ramadan Umrah | Stay Connected During Ramadan",
      description: `Best eSIM for Ramadan Umrah. Instant activation, coverage in Makkah & Madinah. Plans from ${priceText}. No physical SIM—order before you travel.`,
      type: "article",
      url: `${baseUrl}/blog/ramadan-esim-guide`,
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'eSIM for Ramadan Umrah - Stay connected in Makkah and Madinah',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/blog/ramadan-esim-guide`,
    },
  };
}

export default async function RamadanEsimGuidePage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";

  return (
    <>
      <StructuredData type="article" data={{
        headline: "eSIM for Ramadan Umrah | Stay Connected During Ramadan",
        description: "Complete guide to using eSIM for Ramadan Umrah. Instant activation, coverage in Makkah and Madinah, when to buy, and tips for staying connected during Ramadan travel.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/blog/ramadan-esim-guide`,
        datePublished: "2025-01-15",
        dateModified: new Date().toISOString().split('T')[0],
        author: { name: "My Umrah eSIM Team", url: baseUrl },
        articleBody: `eSIM for Ramadan Umrah: Stay connected in Saudi Arabia during Ramadan. Order before you travel, get instant QR delivery, activate when you land. Coverage in Makkah, Madinah, and Jeddah. Plans from ${priceText}. No physical SIM needed. Perfect for Ramadan pilgrims.`,
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs items={[
          { name: 'Blog', url: '/blog' },
          { name: 'eSIM for Ramadan Umrah', url: '/blog/ramadan-esim-guide' },
        ]} className="mb-6" />

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              eSIM for Ramadan Umrah: Stay Connected During Ramadan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Order before you travel. Instant data in Makkah and Madinah—no physical SIM, no queues.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime="2025-01-15">January 15, 2025</time>
              <span>•</span>
              <span>6 min read</span>
            </div>
          </header>

          <section className="mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Travelling for <strong>Ramadan Umrah</strong>? A reliable <strong>eSIM for Ramadan</strong> lets you focus on worship instead of hunting for a SIM. 
              Order online before you travel, get your QR code by email, and activate as soon as you land in Saudi Arabia. 
              Same coverage and plans we offer for Umrah and Hajj—ready for Ramadan travellers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Use eSIM for Ramadan Umrah?
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
              <li><strong>No airport queues:</strong> Set up before you fly; no need to find a SIM vendor when you arrive.</li>
              <li><strong>Instant activation:</strong> QR code by email within minutes; scan and add the plan before you travel.</li>
              <li><strong>Coverage in Makkah & Madinah:</strong> Reliable 5G/4G on local Saudi networks where you need it.</li>
              <li><strong>Nusuk app ready:</strong> Use the Nusuk app for permits and navigation without worrying about Wi‑Fi.</li>
              <li><strong>Keep your home number:</strong> Use eSIM for data and keep your usual SIM for calls and texts.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              When to Buy Your Ramadan eSIM
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Buy your <strong>eSIM for Ramadan</strong> before you travel. You can order weeks or days in advance—you’ll get the QR code straight away, 
              and you only activate (turn on data) when you’re in Saudi Arabia. That way you avoid last‑minute stress and airport SIM queues.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Plans start from {priceText}. Choose a 7–30 day plan to match your trip length. We sometimes run <strong>Ramadan promotions</strong>—check the homepage for current offers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How to Get Your eSIM for Ramadan Umrah
            </h2>
            <div className="space-y-4">
              {[
                { step: 1, title: "Choose your plan", text: "Pick a data plan and validity (7–30 days) that fits your Ramadan trip." },
                { step: 2, title: "Order online", text: "Check out; you’ll receive an email with your QR code and instructions." },
                { step: 3, title: "Add the eSIM to your phone", text: "Before or after you fly, scan the QR code in your phone settings to install the plan." },
                { step: 4, title: "Turn on data in Saudi Arabia", text: "When you land, enable data roaming and select the eSIM for mobile data." },
              ].map(({ step, title, text }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                    <p className="text-gray-700 dark:text-gray-300">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4">
              <Link href="/plans" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">Browse eSIM plans →</Link>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Coverage in Makkah and Madinah
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our <strong>Ramadan eSIM</strong> uses the same Saudi networks as our Umrah and Hajj plans. You get coverage in Makkah (including around the Haram), 
              Madinah (including around the Prophet’s Mosque), Jeddah, and on the routes between them. 
              Your phone will connect automatically to the best available network (STC, Mobily, or Zain).
            </p>
          </section>

          <section className="mb-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg p-6 border border-sky-200 dark:border-sky-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Get Your eSIM for Ramadan Umrah
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Don’t leave connectivity to chance. Order your eSIM now and have data from the moment you land. Plans from {priceText} with instant QR delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/plans" className="inline-block px-6 py-3 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-lg text-center">
                View eSIM Plans
              </Link>
              <Link href="/activation" className="inline-block px-6 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-semibold rounded-lg text-center">
                Activation Guide
              </Link>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Related Guides
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/blog/hajj-umrah-esim-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hajj & Umrah eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete guide for pilgrims</p>
              </Link>
              <Link href="/blog/when-to-buy-esim-umrah" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">When to Buy eSIM for Umrah</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Timing and tips</p>
              </Link>
              <Link href="/blog/nusuk-app-esim-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Nusuk App + eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Use Nusuk with eSIM</p>
              </Link>
              <Link href="/ultimate-guide-esim-umrah" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Umrah eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full Umrah guide</p>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
