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
    title: "When to Buy eSIM for Umrah | Best Time to Order (2025)",
    description: `When to buy eSIM for Umrah: order before you travel for instant QR delivery. Best time to order, how early, and why avoid buying at the airport. Plans from ${priceText}.`,
    keywords: [
      "when to buy eSIM Umrah",
      "when to order eSIM Umrah",
      "best time buy eSIM Umrah",
      "eSIM Umrah before travel",
      "how early buy eSIM Umrah",
      "eSIM Umrah order timing",
      "Umrah eSIM when to buy",
      "Saudi Arabia eSIM timing",
      "eSIM before Umrah",
      "order eSIM Umrah advance",
    ],
    openGraph: {
      title: "When to Buy eSIM for Umrah | Best Time to Order",
      description: `When to buy eSIM for Umrah: order before you travel for instant QR delivery. Best time to order and why avoid buying at the airport.`,
      type: "article",
      url: `${baseUrl}/blog/when-to-buy-esim-umrah`,
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'When to buy eSIM for Umrah - Order before you travel',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/blog/when-to-buy-esim-umrah`,
    },
  };
}

export default async function WhenToBuyEsimUmrahPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";

  return (
    <>
      <StructuredData type="article" data={{
        headline: "When to Buy eSIM for Umrah | Best Time to Order",
        description: "When to buy eSIM for Umrah: order before you travel for instant QR delivery. Best time to order, how early, and why avoid buying at the airport.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/blog/when-to-buy-esim-umrah`,
        datePublished: "2025-01-20",
        dateModified: new Date().toISOString().split('T')[0],
        author: { name: "My Umrah eSIM Team", url: baseUrl },
        articleBody: `When to buy eSIM for Umrah: order before you travel so you get your QR code by email and can set up your eSIM before you fly. Avoid buying at the airport. Higher prices and queues. Plans from ${priceText}.`,
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs items={[
          { name: 'Blog', url: '/blog' },
          { name: 'When to Buy eSIM for Umrah', url: '/blog/when-to-buy-esim-umrah' },
        ]} className="mb-6" />

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              When to Buy eSIM for Umrah: Best Time to Order
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Order before you travel. Get your QR code by email and avoid airport queues and higher prices.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime="2025-01-20">January 20, 2025</time>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </header>

          <section className="mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              The best time to buy an <strong>eSIM for Umrah</strong> is <strong>before you travel</strong>. 
              Order online, receive your QR code by email within minutes, and add the eSIM to your phone before or after you fly. 
              That way you avoid airport SIM queues, language barriers, and usually higher prices at the airport.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Early Should You Order?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can order your <strong>eSIM for Umrah</strong> as soon as you know your travel dates. Many pilgrims order a few days to a few weeks before departure. 
              There’s no need to wait until the last minute. You’ll get your QR code immediately after purchase, and you can install the eSIM on your phone anytime before or after you land.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Validity typically starts when you first use data in Saudi Arabia (or when you activate, depending on the plan). 
              So ordering early doesn’t “use up” your days. You’re just securing your plan and having it ready.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Not Buy at the Airport?
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
              <li><strong>Queues:</strong> SIM kiosks at Saudi airports can be busy, especially during Umrah and Hajj season.</li>
              <li><strong>Price:</strong> Airport SIMs are often more expensive than ordering an eSIM online (e.g. from {priceText}).</li>
              <li><strong>Language:</strong> If you don’t speak Arabic, setting up a physical SIM at the counter can be slower.</li>
              <li><strong>Time:</strong> You may land at odd hours; eSIM is already in your email, ready to scan.</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              With an eSIM, you skip the queue and have data as soon as you enable roaming. Often before you leave the airport.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Steps: Order → QR → Activate
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 ml-4 mb-4">
              <li><strong>Order online</strong>: Choose a plan (7–30 days) and complete checkout. Plans from {priceText}.</li>
              <li><strong>Get your QR code</strong>: Delivered by email within minutes. Save the email or screenshot the QR.</li>
              <li><strong>Add eSIM to your phone</strong>: Before or after you fly: Settings → Cellular / Mobile Data → Add plan → Scan QR.</li>
              <li><strong>Turn on data in Saudi Arabia</strong>: When you land, enable data roaming and select the eSIM for mobile data.</li>
            </ol>
            <p className="text-gray-700 dark:text-gray-300">
              <Link href="/plans" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">Browse eSIM plans →</Link>
              {' '}
              <Link href="/activation" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">Activation guide →</Link>
            </p>
          </section>

          <section className="mb-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg p-6 border border-sky-200 dark:border-sky-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Order Your eSIM for Umrah Now
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Don’t leave it until you land. Order your eSIM now and have instant connectivity from the moment you arrive. Plans from {priceText} with instant QR delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/plans" className="inline-block px-6 py-3 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-lg text-center">
                View eSIM Plans
              </Link>
              <Link href="/faq" className="inline-block px-6 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-semibold rounded-lg text-center">
                FAQ
              </Link>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Related Guides
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/blog/ramadan-esim-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">eSIM for Ramadan Umrah</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stay connected during Ramadan</p>
              </Link>
              <Link href="/blog/hajj-umrah-esim-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hajj & Umrah eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete pilgrim guide</p>
              </Link>
              <Link href="/blog/best-esim-saudi-arabia" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Best eSIM for Saudi Arabia</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">How to choose the right plan</p>
              </Link>
              <Link href="/ultimate-guide-esim-umrah" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Umrah eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full Umrah eSIM guide</p>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
