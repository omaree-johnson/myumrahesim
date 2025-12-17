import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, AlertCircle, CheckCircle2, Wifi, Smartphone, Settings, Signal } from "lucide-react";

export const metadata: Metadata = {
  title: "Why Your eSIM Might Not Be Working: Common Causes & Solutions | Umrah eSIM",
  description: "Discover the most common reasons why eSIMs fail to work and how to fix them. Learn about device compatibility, network issues, activation problems, and more.",
  keywords: ["eSIM not working", "eSIM problems", "eSIM troubleshooting", "eSIM activation issues", "eSIM connection problems", "why eSIM failed"],
  openGraph: {
    title: "Why Your eSIM Might Not Be Working: Common Causes & Solutions",
    description: "Comprehensive guide to understanding and fixing eSIM connectivity issues.",
    type: "article",
    publishedTime: new Date().toISOString(),
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
            Why Your eSIM Might Not Be Working: Common Causes & Solutions
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={new Date().toISOString().split('T')[0]}>
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>8 min read</span>
            </div>
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Your eSIM should work seamlessly, but sometimes things don't go as planned. Understanding the root causes of eSIM failures can help you diagnose and fix issues quickly. This comprehensive guide explores the most common reasons why eSIMs fail and provides actionable solutions.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Self-Diagnosis</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Before diving deep, ask yourself these questions:
            </p>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>✓ Is your device eSIM-compatible?</li>
              <li>✓ Did you successfully install the eSIM profile?</li>
              <li>✓ Is data roaming enabled for your eSIM line?</li>
              <li>✓ Are you in the correct country/region?</li>
              <li>✓ Is your eSIM plan still valid and not expired?</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Reason #1: Device Compatibility Issues
          </h2>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>The Problem:</strong> Not all smartphones support eSIM technology. Older devices or certain models may lack the necessary hardware or software support.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li><strong>Check Compatibility:</strong> iPhone XS or newer, Samsung Galaxy S20+ or newer, Google Pixel 3+ or newer</li>
                <li><strong>Verify eSIM Support:</strong> iPhone: Settings → General → About → look for "Digital SIM" or "Available SIM"</li>
                <li><strong>Android Check:</strong> Settings → Connections → SIM card manager → look for "Add eSIM" option</li>
                <li><strong>Update Software:</strong> Ensure your device is running the latest iOS or Android version</li>
                <li><strong>Carrier Lock:</strong> Verify your device isn't carrier-locked (especially for international eSIMs)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Reason #2: Incorrect Device Settings
          </h2>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>The Problem:</strong> Even with a properly installed eSIM, incorrect device settings can prevent connectivity. This is one of the most common causes of eSIM failures.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Critical Settings to Check:</h4>
              </div>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <div>
                  <strong>1. Data Roaming:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>iPhone: Settings → Cellular → [Your eSIM] → Enable "Data Roaming"</li>
                    <li>Android: Settings → Connections → Mobile Networks → [Your eSIM] → Enable "Data Roaming"</li>
                  </ul>
                </div>
                <div>
                  <strong>2. Default Data Line:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Ensure your eSIM is selected as the primary data line</li>
                    <li>iPhone: Settings → Cellular → Cellular Data → Select your eSIM</li>
                    <li>Android: Settings → Connections → Mobile Networks → Preferred SIM for data</li>
                  </ul>
                </div>
                <div>
                  <strong>3. Network Selection:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Try manually selecting a network operator instead of automatic</li>
                    <li>Settings → Mobile Network → Network Operators → Select available network</li>
                  </ul>
                </div>
                <div>
                  <strong>4. Airplane Mode:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Toggle Airplane Mode off and on to reset network connections</li>
                    <li>Wait 10-15 seconds between toggles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
            <Signal className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Reason #3: Network Coverage & Location Issues
          </h2>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>The Problem:</strong> eSIMs are region-specific. Using a Saudi Arabia eSIM in a different country, or being in an area with poor network coverage, will cause connection failures.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li><strong>Verify Location:</strong> Ensure you're in the correct country where your eSIM plan is valid</li>
                <li><strong>Check Coverage:</strong> Move to an area with better signal strength (near windows, higher floors)</li>
                <li><strong>Network Congestion:</strong> During peak times at Haramain (prayer times), networks can be congested - be patient</li>
                <li><strong>Manual Network Selection:</strong> Try switching between available networks (STC, Mobily, Zain)</li>
                <li><strong>Wait for Registration:</strong> After landing, it may take 5-10 minutes for your device to register on the local network</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Reason #4: Activation & Installation Problems
          </h2>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>The Problem:</strong> The eSIM profile may not have installed correctly, or the activation process was interrupted. This can happen due to poor internet connection during installation or QR code issues.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li><strong>Reinstall eSIM:</strong> Delete the existing eSIM profile and reinstall using the QR code</li>
                <li><strong>Stable Connection:</strong> Ensure you have a strong WiFi or mobile data connection during installation</li>
                <li><strong>QR Code Quality:</strong> Use a high-resolution display, increase brightness, clean camera lens</li>
                <li><strong>Manual Entry:</strong> If QR scanning fails, use manual entry with SM-DP+ address and activation code</li>
                <li><strong>Check Installation:</strong> Verify the eSIM appears in Settings → Cellular/Mobile Networks</li>
                <li><strong>Contact Support:</strong> If installation repeatedly fails, request a new QR code from support</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 flex items-center gap-2">
            <Wifi className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Reason #5: Plan Expiration & Data Exhaustion
          </h2>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>The Problem:</strong> Your eSIM plan may have expired or you've used all your data allowance. Many users don't realize their plan has a validity period or data limit.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-white">How to Check & Fix:</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li><strong>Check Validity:</strong> Review your purchase email for plan validity dates</li>
                <li><strong>Data Usage:</strong> iPhone: Settings → Cellular → check data usage per line</li>
                <li><strong>Android:</strong> Settings → Connections → Data Usage → check per-SIM usage</li>
                <li><strong>Plan Details:</strong> Visit your activation page or contact support to verify plan status</li>
                <li><strong>Purchase New Plan:</strong> If expired or exhausted, purchase a new eSIM plan</li>
                <li><strong>Monitor Usage:</strong> Set up data usage alerts to avoid unexpected exhaustion</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Reason #6: Software & Firmware Issues
          </h2>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>The Problem:</strong> Outdated operating systems, software bugs, or corrupted network settings can prevent eSIM functionality.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li><strong>Update OS:</strong> Install the latest iOS or Android updates (Settings → General → Software Update)</li>
                <li><strong>Restart Device:</strong> Perform a full restart (not just sleep/wake)</li>
                <li><strong>Reset Network Settings:</strong> Settings → General → Reset → Reset Network Settings (⚠️ erases WiFi passwords)</li>
                <li><strong>Clear Cache:</strong> Android: Settings → Apps → Carrier Services → Clear Cache</li>
                <li><strong>Factory Reset (Last Resort):</strong> Only if all else fails, backup data and perform factory reset</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Reason #7: APN Configuration Problems
          </h2>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>The Problem:</strong> Access Point Name (APN) settings control how your device connects to the mobile network. Incorrect APN settings can prevent data connectivity even when the eSIM is installed correctly.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li><strong>Auto Configuration:</strong> Most eSIMs configure APN automatically - ensure this is enabled</li>
                <li><strong>Manual APN:</strong> If needed, contact your eSIM provider for correct APN settings</li>
                <li><strong>iPhone APN:</strong> Settings → Cellular → [Your eSIM] → Cellular Data Network</li>
                <li><strong>Android APN:</strong> Settings → Connections → Mobile Networks → Access Point Names → [Your eSIM]</li>
                <li><strong>Reset APN:</strong> Delete custom APN settings and let the device auto-configure</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Reason #8: Multiple eSIM Profiles Conflict
          </h2>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>The Problem:</strong> Having multiple eSIM profiles installed can cause conflicts, especially if both are trying to connect simultaneously or if the device is confused about which profile to use.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Solutions:</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li><strong>Disable Other eSIMs:</strong> Temporarily disable other eSIM profiles to test</li>
                <li><strong>Set Primary Line:</strong> Clearly designate which eSIM is for data and which is for calls</li>
                <li><strong>Remove Unused:</strong> Delete old or unused eSIM profiles from your device</li>
                <li><strong>One at a Time:</strong> Activate and test one eSIM profile before installing another</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Diagnostic Checklist
          </h2>

          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 border border-sky-200 dark:border-sky-800 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Systematic Troubleshooting Steps</h3>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-1">1.</span>
                <span>Verify device eSIM compatibility and software version</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-1">2.</span>
                <span>Confirm eSIM profile is installed (visible in Settings)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-1">3.</span>
                <span>Enable data roaming for your eSIM line</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-1">4.</span>
                <span>Set eSIM as default data line</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-1">5.</span>
                <span>Check plan validity and data balance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-1">6.</span>
                <span>Toggle Airplane Mode and restart device</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-1">7.</span>
                <span>Manually select network operator</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-1">8.</span>
                <span>Verify location matches eSIM plan region</span>
              </li>
            </ol>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            When to Contact Support
          </h2>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Contact our support team if you've tried all troubleshooting steps and your eSIM still isn't working:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• QR code appears invalid or already used</li>
              <li>• eSIM won't install despite correct device and settings</li>
              <li>• Plan shows as active but no connectivity after 30+ minutes</li>
              <li>• Data exhausted faster than expected</li>
              <li>• Need a replacement eSIM or refund</li>
            </ul>
          </div>

          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Prevention Tips</h4>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>• Install eSIM before travel but activate upon arrival</li>
              <li>• Test connectivity immediately after installation</li>
              <li>• Keep device software updated</li>
              <li>• Monitor data usage regularly</li>
              <li>• Save QR code as backup (screenshot)</li>
              <li>• Enable data usage alerts on your device</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 mb-12 relative">
          <div className="bg-gradient-to-br from-sky-600 via-blue-600 to-sky-700 dark:from-sky-700 dark:via-blue-700 dark:to-sky-800 rounded-2xl p-10 md:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] opacity-20"></div>
            <div className="relative z-10">
              <div className="inline-block mb-4 px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full">
                <span className="text-white font-semibold text-sm">24/7 Support Available</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Still Having Issues? We're Here to Help
              </h3>
              <p className="text-lg text-sky-100 dark:text-sky-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                Our expert support team is available around the clock to help resolve any eSIM issues. Get reliable connectivity with our hassle-free eSIM plans for your Umrah journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/plans"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-sky-600 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg min-w-[200px] justify-center"
                >
                  <span>Browse Plans</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/blog/troubleshooting-esim"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all border-2 border-white/30 hover:border-white/50 text-lg min-w-[200px] justify-center"
                >
                  <span>Quick Fixes</span>
                </Link>
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all border-2 border-white/30 hover:border-white/50 text-lg min-w-[200px] justify-center"
                >
                  <span>Contact Support</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Articles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/blog/troubleshooting-esim" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Tutorial</span>
              <h4 className="font-semibold text-gray-900 dark:text-white mt-1">Troubleshooting eSIM Issues: Quick Fixes</h4>
            </Link>
            <Link href="/blog/esim-setup-guide" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">Guide</span>
              <h4 className="font-semibold text-gray-900 dark:text-white mt-1">Complete eSIM Setup Guide</h4>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}






