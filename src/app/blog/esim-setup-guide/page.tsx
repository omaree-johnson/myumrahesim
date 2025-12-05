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

        {/* ...removed featured image... */}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 font-medium">
            Setting up your eSIM for your Umrah journey has never been easier. This comprehensive guide will walk you through every step of the process, ensuring you stay connected from the moment you land in Saudi Arabia.
          </p>

          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 border-l-4 border-sky-500 dark:border-sky-400 rounded-r-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-sky-600 dark:text-sky-400">📋</span>
            What You'll Need
          </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-sky-600 dark:text-sky-400 font-bold mt-1">✓</span>
                <span>An eSIM-compatible smartphone (iPhone XS or newer, Samsung Galaxy S20+, Google Pixel 3+, etc.)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sky-600 dark:text-sky-400 font-bold mt-1">✓</span>
                <span>Your eSIM QR code (sent via email after purchase)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sky-600 dark:text-sky-400 font-bold mt-1">✓</span>
                <span>A stable WiFi or mobile data connection for initial setup</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sky-600 dark:text-sky-400 font-bold mt-1">✓</span>
                <span>5-10 minutes of your time</span>
              </li>
          </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-10 mb-6 pb-3 border-b-2 border-sky-200 dark:border-sky-800">
            Step-by-Step Setup Process
          </h2>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center font-bold text-sky-700 dark:text-sky-300 text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Check Device Compatibility</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Before purchasing, verify that your device supports eSIM technology. On iPhone, go to <strong>Settings → General → About</strong> and look for "Available SIM" or "Digital SIM". On Android, check <strong>Settings → Connections → SIM card manager</strong>.
          </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center font-bold text-sky-700 dark:text-sky-300 text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Purchase Your eSIM Plan</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Choose a plan that matches your data needs from our plans page. After completing your purchase, you'll receive an email with your unique QR code within minutes.
          </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center font-bold text-sky-700 dark:text-sky-300 text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Install the eSIM Profile</h3>
                  
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">For iPhone:</p>
                    <ol className="space-y-2 text-gray-700 dark:text-gray-300 ml-4 list-decimal">
                      <li>Open <strong>Settings → Cellular/Mobile Data → Add eSIM</strong></li>
            <li>Select "Use QR Code"</li>
            <li>Scan the QR code from your email</li>
            <li>Follow the on-screen prompts to complete installation</li>
            <li>Label your new eSIM (e.g., "Saudi Arabia Travel")</li>
          </ol>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">For Android (Samsung/Google Pixel):</p>
                    <ol className="space-y-2 text-gray-700 dark:text-gray-300 ml-4 list-decimal">
                      <li>Go to <strong>Settings → Connections → SIM Manager</strong></li>
            <li>Tap "Add Mobile Plan" or "Add eSIM"</li>
            <li>Scan the QR code provided</li>
            <li>Confirm the installation</li>
            <li>Name your eSIM for easy identification</li>
          </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center font-bold text-sky-700 dark:text-sky-300 text-lg">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Configure Your Settings</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
            After installation, you need to configure which SIM handles what:
          </p>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 dark:text-sky-400 mt-1">•</span>
                      <span>Set your eSIM as the primary line for Mobile Data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 dark:text-sky-400 mt-1">•</span>
                      <span>Enable Data Roaming for your eSIM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 dark:text-sky-400 mt-1">•</span>
                      <span>Keep your home SIM active for calls/SMS if needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 dark:text-sky-400 mt-1">•</span>
                      <span>Turn on "Allow Cellular Data Switching" if available</span>
                    </li>
          </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center font-bold text-sky-700 dark:text-sky-300 text-lg">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Activate Upon Arrival</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Your eSIM will automatically connect once you land in Saudi Arabia. Make sure to enable the eSIM in your settings and turn on data roaming. Connection typically takes 30-60 seconds.
          </p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-6 pb-3 border-b-2 border-sky-200 dark:border-sky-800">
            Troubleshooting Common Issues
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                No Connection After Landing?
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 mt-1">→</span>
                  <span>Restart your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 mt-1">→</span>
                  <span>Toggle Airplane Mode on/off</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 mt-1">→</span>
                  <span>Manually select a network operator</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 mt-1">→</span>
                  <span>Ensure Data Roaming is enabled for your eSIM</span>
                </li>
            </ul>
          </div>

            <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">💡</span>
                Pro Tips for Best Performance
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>Install your eSIM before leaving home (but don't activate until arrival)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>Take a screenshot of your QR code as backup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>Monitor your data usage through device settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span>Use WiFi when available to conserve data</span>
                </li>
            </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 dark:border-green-400 rounded-r-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Need More Data?</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            If you run out of data during your trip, simply purchase another eSIM plan. Each plan is independent and can be installed alongside your existing one.
          </p>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-16 mb-12 relative">
          <div className="bg-gradient-to-br from-sky-600 via-blue-600 to-sky-700 dark:from-sky-700 dark:via-blue-700 dark:to-sky-800 rounded-2xl p-10 md:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] opacity-20"></div>
            <div className="relative z-10">
              <div className="inline-block mb-4 px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full">
                <span className="text-white font-semibold text-sm">Get Connected Today</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
              <p className="text-lg text-sky-100 dark:text-sky-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Choose from our range of affordable eSIM plans designed specifically for Umrah travelers. Instant activation, high-speed 5G, and 24/7 support.
          </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/plans"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-sky-600 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg min-w-[200px] justify-center"
            >
                  <span>View eSIM Plans</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/faq"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all border-2 border-white/30 hover:border-white/50 text-lg min-w-[200px] justify-center"
            >
                  <span>Visit FAQ</span>
            </Link>
              </div>
            </div>
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
