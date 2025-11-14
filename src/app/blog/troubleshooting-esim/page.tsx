import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Troubleshooting eSIM Issues - Quick Fixes | Umrah eSIM",
  description: "Common eSIM activation problems and how to solve them quickly. Get your connection working in minutes with these troubleshooting solutions.",
  keywords: ["eSIM troubleshooting", "eSIM not working", "activation problems", "connection issues", "eSIM fix"],
  openGraph: {
    title: "Troubleshooting eSIM Issues - Quick Solutions",
    description: "Common eSIM problems and how to solve them quickly.",
    type: "article",
    publishedTime: "2025-11-05T00:00:00.000Z",
  },
};

export default function BlogPost() {
  return (
    <article className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <header className="mb-8">
          <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full mb-4">
            Tutorial
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Troubleshooting eSIM Issues: Quick Fixes & Solutions
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime="2025-11-05">November 5, 2025</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>6 min read</span>
            </div>
          </div>
        </header>

        {/* ...removed featured image... */}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Experiencing issues with your eSIM? Don't worry! Most eSIM problems can be resolved quickly with simple troubleshooting steps. This guide covers the most common issues and their solutions to get you connected fast.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Diagnostic Checklist</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">Before diving into specific issues, verify these basics:</p>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>✓ Your device supports eSIM technology</li>
              <li>✓ The eSIM profile is properly installed</li>
              <li>✓ You're in Saudi Arabia or your destination country</li>
              <li>✓ Data Roaming is enabled for your eSIM</li>
              <li>✓ Your eSIM plan is within its validity period</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Common Issues & Solutions
          </h2>

          <div className="space-y-6">
            {/* Issue 1 */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Issue #1: No Network Connection After Installation
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 ml-8">
                Your eSIM is installed but shows "No Service" or doesn't connect to any network.
              </p>
              <div className="ml-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                  <li>Toggle Airplane Mode on, wait 10 seconds, then turn it off</li>
                  <li>Restart your device completely</li>
                  <li>Go to Settings → Mobile Data and ensure your eSIM is selected for data</li>
                  <li>Enable Data Roaming specifically for your eSIM line</li>
                  <li>Manually select a network operator (Settings → Mobile Network → Network Operators)</li>
                </ol>
              </div>
            </div>

            {/* Issue 2 */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Issue #2: Cannot Scan QR Code
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 ml-8">
                Camera won't focus on QR code or the scan doesn't work.
              </p>
              <div className="ml-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                  <li>Increase screen brightness of the device displaying the QR code</li>
                  <li>Clean your camera lens</li>
                  <li>Display the QR code on a larger screen or print it</li>
                  <li>Use manual entry: look for "Enter Details Manually" option</li>
                  <li>For iPhone: ensure camera permissions are enabled for Settings app</li>
                </ol>
              </div>
            </div>

            {/* Issue 3 */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Issue #3: Slow Data Speeds
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 ml-8">
                Connected but experiencing slower than expected speeds.
              </p>
              <div className="ml-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                  <li>Check if you've exceeded your data limit (some plans throttle after limit)</li>
                  <li>Move to a different location for better signal strength</li>
                  <li>Disable VPN temporarily to test speeds</li>
                  <li>Close background apps consuming bandwidth</li>
                  <li>Toggle mobile data off and on again</li>
                  <li>Check for carrier congestion during peak prayer times at Haramain</li>
                </ol>
              </div>
            </div>

            {/* Issue 4 */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Issue #4: eSIM Shows "Invalid" or Won't Install
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 ml-8">
                Error message appears when trying to install the eSIM profile.
              </p>
              <div className="ml-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                  <li>Ensure you're connected to stable WiFi or mobile data</li>
                  <li>Check if the QR code has already been used (each code works once)</li>
                  <li>Verify your device isn't carrier-locked</li>
                  <li>Update your device to the latest iOS/Android version</li>
                  <li>Contact support for a replacement QR code if needed</li>
                </ol>
              </div>
            </div>

            {/* Issue 5 */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Issue #5: eSIM Stops Working Suddenly
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 ml-8">
                Was working fine, then suddenly lost connection.
              </p>
              <div className="ml-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                  <li>Check if your data plan has expired or data limit reached</li>
                  <li>Verify the eSIM is still enabled in your device settings</li>
                  <li>Check your device's data usage to see remaining balance</li>
                  <li>Restart your device</li>
                  <li>Re-select the network operator manually</li>
                </ol>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Advanced Troubleshooting
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Reset Network Settings
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If basic troubleshooting doesn't work, try resetting your network settings:
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              <strong>⚠️ Warning:</strong> This will erase all saved WiFi passwords and Bluetooth connections.
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2"><strong>iPhone:</strong> Settings → General → Transfer or Reset iPhone → Reset → Reset Network Settings</p>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Android:</strong> Settings → System → Reset Options → Reset WiFi, mobile & Bluetooth</p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            Check APN Settings
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Most eSIMs configure APN automatically, but if you're having persistent issues:
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
            <li>Navigate to your eSIM's APN settings</li>
            <li>Ensure APN is set to auto or the carrier's recommended settings</li>
            <li>If in doubt, contact support for correct APN configuration</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            When to Contact Support
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Reach out to our support team if:
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
            <li>You've tried all troubleshooting steps without success</li>
            <li>Your QR code appears to be invalid or already used</li>
            <li>You need a replacement eSIM</li>
            <li>You suspect a technical issue with your plan</li>
            <li>Your data ran out faster than expected</li>
          </ul>

          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Prevention Tips</h4>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>• Install eSIM before your trip but activate upon arrival</li>
              <li>• Screenshot your QR code as backup</li>
              <li>• Test connectivity immediately after installation</li>
              <li>• Keep your device's software updated</li>
              <li>• Monitor data usage regularly</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 bg-linear-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help? We're Here for You
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Our support team is available 24/7 to help resolve any eSIM issues. Get reliable connectivity with our hassle-free eSIM plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/plans"
              className="inline-block px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              Browse Plans
            </Link>
            <Link
              href="/faq"
              className="inline-block px-8 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors border border-gray-300 dark:border-slate-600"
            >
              Visit FAQ
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Articles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/blog/esim-setup-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">Guide</span>
              <h4 className="font-semibold text-gray-900 dark:text-white mt-1">Complete eSIM Setup Guide</h4>
            </Link>
            <Link href="/blog/staying-connected-saudi-arabia" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">Travel Tips</span>
              <h4 className="font-semibold text-gray-900 dark:text-white mt-1">Staying Connected in Saudi Arabia</h4>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
