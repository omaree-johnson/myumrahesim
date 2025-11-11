import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Complete eSIM Setup Guide for Saudi Arabia | Umrah eSIM",
  description: "Step-by-step guide to setting up your eSIM for Umrah. Learn how to scan QR codes, activate your eSIM, and get connected instantly in Saudi Arabia.",
  keywords: ["eSIM setup", "Saudi Arabia eSIM", "Umrah connectivity", "eSIM activation", "QR code setup"],
  openGraph: {
    title: "Complete eSIM Setup Guide for Saudi Arabia",
    description: "Everything you need to know about setting up your eSIM for your Umrah journey.",
    type: "article",
    publishedTime: "2025-11-10T00:00:00.000Z",
  },
};

export default function BlogPost() {
  return (
    <article className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <span className="inline-block px-3 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-sm font-medium rounded-full mb-4">
            Guide
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Complete eSIM Setup Guide for Saudi Arabia
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime="2025-11-10">November 10, 2025</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>5 min read</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative h-64 sm:h-96 w-full overflow-hidden rounded-xl mb-8">
          <img
            src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&auto=format&fit=crop"
            alt="eSIM Setup Guide"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Setting up your eSIM for your Umrah journey has never been easier. This comprehensive guide will walk you through every step of the process, ensuring you stay connected from the moment you land in Saudi Arabia.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            What You'll Need
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
            <li>An eSIM-compatible smartphone (iPhone XS or newer, Samsung Galaxy S20+, Google Pixel 3+, etc.)</li>
            <li>Your eSIM QR code (sent via email after purchase)</li>
            <li>A stable WiFi or mobile data connection for initial setup</li>
            <li>5-10 minutes of your time</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Step-by-Step Setup Process
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Step 1: Check Device Compatibility
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Before purchasing, verify that your device supports eSIM technology. On iPhone, go to Settings → General → About and look for "Available SIM" or "Digital SIM". On Android, check Settings → Connections → SIM card manager.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Step 2: Purchase Your eSIM Plan
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Choose a plan that matches your data needs from our plans page. After completing your purchase, you'll receive an email with your unique QR code within minutes.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Step 3: Install the eSIM Profile
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>For iPhone:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
            <li>Open Settings → Cellular/Mobile Data → Add eSIM</li>
            <li>Select "Use QR Code"</li>
            <li>Scan the QR code from your email</li>
            <li>Follow the on-screen prompts to complete installation</li>
            <li>Label your new eSIM (e.g., "Saudi Arabia Travel")</li>
          </ol>

          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>For Android (Samsung/Google Pixel):</strong>
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
            <li>Go to Settings → Connections → SIM Manager</li>
            <li>Tap "Add Mobile Plan" or "Add eSIM"</li>
            <li>Scan the QR code provided</li>
            <li>Confirm the installation</li>
            <li>Name your eSIM for easy identification</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Step 4: Configure Your Settings
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            After installation, you need to configure which SIM handles what:
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
            <li>Set your eSIM as the primary line for Mobile Data</li>
            <li>Enable Data Roaming for your eSIM</li>
            <li>Keep your home SIM active for calls/SMS if needed</li>
            <li>Turn on "Allow Cellular Data Switching" if available</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Step 5: Activate Upon Arrival
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Your eSIM will automatically connect once you land in Saudi Arabia. Make sure to enable the eSIM in your settings and turn on data roaming. Connection typically takes 30-60 seconds.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Troubleshooting Common Issues
          </h2>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">No Connection After Landing?</h4>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>• Restart your device</li>
              <li>• Toggle Airplane Mode on/off</li>
              <li>• Manually select a network operator</li>
              <li>• Ensure Data Roaming is enabled for your eSIM</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pro Tips for Best Performance</h4>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>• Install your eSIM before leaving home (but don't activate until arrival)</li>
              <li>• Take a screenshot of your QR code as backup</li>
              <li>• Monitor your data usage through device settings</li>
              <li>• Use WiFi when available to conserve data</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Need More Data?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            If you run out of data during your trip, simply purchase another eSIM plan. Each plan is independent and can be installed alongside your existing one.
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-linear-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Choose from our range of affordable eSIM plans designed specifically for Umrah travelers. Instant activation, high-speed 5G, and 24/7 support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/plans"
              className="inline-block px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              View eSIM Plans
            </Link>
            <Link
              href="/faq"
              className="inline-block px-8 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors border border-gray-300 dark:border-slate-600"
            >
              Visit FAQ
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Articles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/blog/staying-connected-saudi-arabia" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">Travel Tips</span>
              <h4 className="font-semibold text-gray-900 dark:text-white mt-1">Staying Connected in Saudi Arabia</h4>
            </Link>
            <Link href="/blog/troubleshooting-esim" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">Tutorial</span>
              <h4 className="font-semibold text-gray-900 dark:text-white mt-1">Troubleshooting eSIM Issues</h4>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
