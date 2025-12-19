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
    title: "eSIM vs Physical SIM for Umrah | Complete Comparison 2025",
    description: `Compare eSIM vs physical SIM for Umrah and Hajj. Learn which is better for pilgrims: instant activation, cost savings, convenience, and coverage. Plans from ${priceText}.`,
    keywords: [
      "esim vs sim card umrah",
      "esim vs physical sim",
      "esim vs regular sim",
      "digital sim vs physical sim",
      "esim better than sim card",
      "should i get esim for umrah",
      "esim advantages umrah",
      "physical sim saudi arabia",
    ],
    openGraph: {
      title: "eSIM vs Physical SIM for Umrah | Complete Comparison 2025",
      description: `Compare eSIM vs physical SIM for Umrah and Hajj. Learn which is better for pilgrims with instant activation and cost savings.`,
      type: "article",
      url: `${baseUrl}/blog/esim-vs-physical-sim-umrah`,
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'eSIM vs Physical SIM for Umrah - Complete Comparison',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/blog/esim-vs-physical-sim-umrah`,
    },
  };
}

export default async function EsimVsPhysicalSimPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";

  return (
    <>
      {/* Article Structured Data */}
      <StructuredData type="article" data={{
        headline: "eSIM vs Physical SIM for Umrah: Complete Comparison 2025",
        description: "Complete comparison of eSIM vs physical SIM for Umrah and Hajj pilgrims. Learn the differences, advantages, and which option is better for your pilgrimage journey.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/blog/esim-vs-physical-sim-umrah`,
        datePublished: "2025-12-17",
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          name: "My Umrah eSIM Team",
          url: baseUrl,
        },
        articleBody: `Complete comparison of eSIM vs physical SIM for Umrah and Hajj pilgrims. Learn about activation speed, cost, convenience, coverage, and which option is better for staying connected during your spiritual journey in Saudi Arabia.`,
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs items={[
          { name: 'Blog', url: '/blog' },
          { name: 'eSIM vs Physical SIM', url: '/blog/esim-vs-physical-sim-umrah' },
        ]} className="mb-6" />

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              eSIM vs Physical SIM for Umrah: Complete Comparison
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Which is better for your Umrah or Hajj journey? We compare both options to help you decide.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime="2025-12-17">December 17, 2025</time>
              <span>•</span>
              <span>8 min read</span>
            </div>
          </header>

          <section className="mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              When planning your <strong>Umrah</strong> or <strong>Hajj</strong> journey, you need to decide how to stay connected in Saudi Arabia. 
              You have two main options: <strong>eSIM</strong> (digital SIM) or <strong>physical SIM</strong> (traditional SIM card).
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              This guide compares both options so you can make an informed decision that works best for your pilgrimage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What's the Difference?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">eSIM (Digital SIM)</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  An eSIM is a digital SIM card built into your smartphone. You activate it by scanning a QR code or entering an activation code. 
                  No physical card needed—everything is digital.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                  <li>Built into your device</li>
                  <li>Activated via QR code</li>
                  <li>No physical card</li>
                  <li>Works alongside your home SIM</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Physical SIM (Traditional)</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  A physical SIM is a small plastic card that you insert into your phone. You typically buy it from a store or vendor 
                  in Saudi Arabia after you arrive.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                  <li>Physical plastic card</li>
                  <li>Purchased at a store</li>
                  <li>Requires SIM ejector tool</li>
                  <li>Replaces your home SIM</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              eSIM Advantages for Umrah Travellers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For most Umrah and Hajj pilgrims, eSIM offers significant advantages:
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 p-5 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Activation Before You Travel</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Purchase your eSIM online, receive your QR code instantly, and install it before you leave home. 
                  No need to find a SIM card vendor when you arrive or wait in queues at the airport. 
                  You can focus on your spiritual journey instead of setting up your phone.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 p-5 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Keep Your Home Number Active</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  With eSIM, you can keep your home country SIM card active for calls and texts while using the eSIM for mobile data. 
                  This means family can still reach you on your regular number, and you can use WhatsApp, make video calls, and browse the internet 
                  using your eSIM data. With a physical SIM, you typically need to remove your home SIM, losing access to your regular number.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 p-5 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Physical Card to Lose</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  eSIM is digital, so there's no tiny card to keep track of, lose, or damage. Everything is stored on your device. 
                  If you lose your phone, you can reinstall the eSIM on a new device using your backup QR code.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 p-5 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Faster Setup Process</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Installing eSIM takes 2-3 minutes. Buying a physical SIM requires finding a vendor, waiting in line, 
                  providing identification, and then installing the card. This can take 30-60 minutes, especially during peak Umrah seasons.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 p-5 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Better for Dual-SIM Devices</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Modern smartphones support dual SIM functionality with eSIM. You can have your home SIM for calls and your eSIM for data, 
                  all working simultaneously. This is perfect for pilgrims who need to stay in touch with family while using data for navigation and apps.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Physical SIM: When It Might Work
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Physical SIM cards can work for Umrah, but they have limitations:
            </p>

            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-5 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Requires Finding a Vendor</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  You need to find a SIM card vendor when you arrive in Saudi Arabia. This can be challenging if you arrive at odd hours, 
                  don't speak Arabic, or are unfamiliar with the area. During peak Umrah seasons, vendors can be busy with long queues.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-5 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Replaces Your Home SIM</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Most phones can only use one physical SIM at a time. This means you'll need to remove your home SIM card, 
                  losing access to your regular number for calls and texts. Family back home won't be able to reach you on your usual number.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-5 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Setup Takes Longer</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  The process of buying, activating, and setting up a physical SIM can take 30-60 minutes. 
                  You may need to provide identification, wait for activation, and troubleshoot connection issues on the spot.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-5 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Risk of Losing the Card</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Physical SIM cards are small and easy to lose. If you lose it, you'll need to buy a new one and go through 
                  the activation process again. There's also a risk of damaging the card when inserting or removing it.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Cost Comparison
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Let's compare the costs:
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300 dark:border-slate-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-700">
                    <th className="border border-gray-300 dark:border-slate-600 p-3 text-left font-semibold">Cost Factor</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-3 text-left font-semibold">eSIM</th>
                    <th className="border border-gray-300 dark:border-slate-600 p-3 text-left font-semibold">Physical SIM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Plan Price</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">From {priceText}, transparent</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Varies, often similar</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-slate-800">
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Activation Fee</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">None</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Sometimes charged</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Time Cost</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">2-3 minutes online</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">30-60 minutes at vendor</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-slate-800">
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Hidden Fees</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">None - prepaid</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Sometimes surprise charges</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Replacement Cost</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Free - reinstall from email</td>
                    <td className="border border-gray-300 dark:border-slate-600 p-3">Buy new card if lost</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Overall, eSIM typically offers better value with transparent pricing and no hidden fees. Physical SIM prices can vary significantly 
              depending on where you buy them, and you may encounter unexpected charges.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Convenience Factor
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Convenience matters, especially when you're focused on your spiritual journey:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>eSIM:</strong> Purchase online before you travel, install in minutes, activate when you arrive. 
                    No need to find vendors or wait in queues.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-600 dark:bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                  !
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Physical SIM:</strong> Must find a vendor after arrival, may need to provide ID, wait for activation, 
                    and potentially deal with language barriers or unclear instructions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Recommendation for Pilgrims
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For Umrah and Hajj pilgrims, we strongly recommend <strong>eSIM</strong> for these reasons:
            </p>

            <div className="bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 mb-6 border border-sky-200 dark:border-slate-700">
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 dark:text-sky-400 font-bold mt-1">1.</span>
                  <span><strong>Less stress:</strong> Set everything up before you travel, so you can focus on your spiritual journey when you arrive.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 dark:text-sky-400 font-bold mt-1">2.</span>
                  <span><strong>Stay connected:</strong> Keep your home number active so family can reach you while using data for navigation and apps.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 dark:text-sky-400 font-bold mt-1">3.</span>
                  <span><strong>Reliable support:</strong> Get help from our 24/7 support team if anything goes wrong, even during your journey.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 dark:text-sky-400 font-bold mt-1">4.</span>
                  <span><strong>Better value:</strong> Transparent pricing, no hidden fees, and plans designed specifically for pilgrims.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 dark:text-sky-400 font-bold mt-1">5.</span>
                  <span><strong>Peace of mind:</strong> Money-back guarantee if activation fails, so you're protected if something goes wrong.</span>
                </li>
              </ul>
            </div>

            <p className="text-gray-700 dark:text-gray-300">
              Physical SIM cards can work, but they add unnecessary complexity and stress to your journey. 
              eSIM is the modern, convenient choice that lets you focus on what matters most: your pilgrimage.
            </p>
          </section>

          <section className="mb-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg p-6 border border-sky-200 dark:border-sky-800">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Get Your eSIM Today
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ready to experience the convenience of eSIM for your Umrah or Hajj journey? 
              Our plans start from {priceText} with instant QR code delivery and coverage in Makkah, Madinah, and throughout Saudi Arabia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/plans"
                className="inline-block px-6 py-3 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors text-center"
              >
                View eSIM Plans
              </Link>
              <Link
                href="/blog/how-to-install-esim-saudi-arabia"
                className="inline-block px-6 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-semibold rounded-lg transition-colors text-center"
              >
                Installation Guide
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
              <Link href="/blog/best-esim-saudi-arabia" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Best eSIM for Saudi Arabia</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete guide to choosing the best eSIM</p>
              </Link>
              <Link href="/blog/how-to-install-esim-saudi-arabia" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How to Install eSIM</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Step-by-step installation guide</p>
              </Link>
              <Link href="/blog/hajj-umrah-esim-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hajj & Umrah eSIM Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete guide for pilgrims</p>
              </Link>
              <Link href="/faq" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get answers to common questions</p>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
