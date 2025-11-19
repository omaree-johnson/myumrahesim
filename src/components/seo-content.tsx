"use client";

import Link from "next/link";

/**
 * SEO-optimized content component for homepage
 * Provides rich content for search engines while maintaining good UX
 */
export function SeoContent() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-4xl">
      <article className="prose prose-sky dark:prose-invert max-w-none">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Why Choose eSIM for Your Umrah and Hajj Journey?
        </h2>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-base sm:text-lg leading-relaxed">
            Traveling to <strong>Saudi Arabia</strong> for <strong>Umrah</strong> or <strong>Hajj</strong>? 
            Stay connected with our instant <strong>eSIM activation service</strong>. No need to visit a 
            physical store or wait for a SIM card to arrive. Get your <strong>mobile data plan</strong> 
            activated in seconds, right from your smartphone.
          </p>

          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Instant Activation for Makkah and Madinah
          </h3>
          <p className="text-base sm:text-lg leading-relaxed">
            Our <strong>eSIM plans</strong> work seamlessly in <strong>Makkah</strong>, <strong>Madinah</strong>, 
            and throughout <strong>Saudi Arabia</strong>. Whether you're performing Umrah rituals, visiting 
            historical sites, or staying in touch with family back home, our high-speed <strong>4G and 5G 
            networks</strong> ensure you're always connected.
          </p>

          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            No Physical SIM Card Required
          </h3>
          <p className="text-base sm:text-lg leading-relaxed">
            Unlike traditional <strong>Saudi Arabia SIM cards</strong>, our <strong>digital eSIM</strong> 
            is embedded in your device. Simply scan the QR code we send to your email, and you're ready 
            to use data. Perfect for travelers who want to avoid the hassle of finding a local SIM card 
            vendor upon arrival.
          </p>

          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            Affordable Prepaid Data Plans
          </h3>
          <p className="text-base sm:text-lg leading-relaxed">
            Choose from our range of <strong>affordable eSIM data plans</strong> for Saudi Arabia. 
            From short-term plans for a quick Umrah visit to longer validity periods for extended stays. 
            All plans include high-speed data with no hidden fees or contracts.
          </p>

          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Browse our <Link href="/plans" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">eSIM plans for Saudi Arabia</Link> and 
              find the perfect data plan for your Umrah or Hajj journey. Activation takes just minutes, 
              and you'll receive your QR code instantly via email.
            </p>
            <Link 
              href="/plans"
              className="inline-block px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
            >
              View All Plans
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

