import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Smartphone, Zap, Shield, DollarSign, Globe, Clock } from "lucide-react";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Why Choose eSIM for Umrah - Benefits & Installation Guide | My Umrah eSIM",
  description: "Discover the benefits of using eSIM for your Umrah journey. Learn how to install and activate your eSIM in minutes. No physical SIM card needed, instant activation.",
  keywords: ["eSIM benefits", "eSIM installation", "Umrah connectivity", "digital SIM", "travel eSIM"],
  openGraph: {
    title: "Why Choose eSIM for Umrah - Benefits & Installation Guide",
    description: "Discover the benefits of using eSIM for your Umrah journey and learn how to install it in minutes.",
    type: "website",
  },
};

export default function LearnMorePage() {
  return (
    <>
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 max-w-6xl">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <header className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Why Choose eSIM for Your Umrah Journey?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience seamless connectivity in Saudi Arabia with modern eSIM technology. 
              No physical cards, no hassle—just instant activation and reliable service.
            </p>
          </header>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Key Benefits of eSIM
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Benefit 1 */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Instant Activation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Activate your eSIM in seconds via QR code. No waiting for physical SIM cards or visiting stores.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Physical SIM Card
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Everything is digital. No more fumbling with tiny SIM cards or needing a SIM ejector tool.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Keep Your Number
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Dual SIM functionality lets you keep your home number active while using local data.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Cost-Effective
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Avoid expensive roaming charges. Pay only for what you need with transparent pricing.
                </p>
              </div>

              {/* Benefit 5 */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Secure & Reliable
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Built-in security with encrypted profiles. Connect to premium network providers in Saudi Arabia.
                </p>
              </div>

              {/* Benefit 6 */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Flexible Plans
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose from multiple data plans for different trip lengths. Valid from 7 to 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              How to Install Your eSIM
            </h2>

            <div className="max-w-3xl mx-auto space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Purchase Your eSIM Plan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Browse our plans and select the data package that suits your trip duration and needs. 
                    Complete the secure checkout process.
                  </p>
                  <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      💡 <strong>Tip:</strong> We recommend purchasing at least 24 hours before your departure 
                      to ensure you receive your QR code and have time to install it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Receive Your QR Code
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Within minutes of purchase, you'll receive an email with your unique eSIM QR code 
                    and activation instructions.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ✅ <strong>Pro Tip:</strong> Take a screenshot of your QR code as backup. 
                      Save it in your Photos app for offline access.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Install the eSIM Profile
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Before traveling or upon arrival, scan the QR code to install your eSIM profile:
                  </p>
                  
                  {/* iPhone Instructions */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      For iPhone (iOS 12+)
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-7">
                      <li>Go to <strong>Settings</strong> → <strong>Cellular/Mobile Data</strong></li>
                      <li>Tap <strong>Add eSIM</strong></li>
                      <li>Select <strong>Use QR Code</strong></li>
                      <li>Scan the QR code from your email</li>
                      <li>Follow on-screen prompts to complete installation</li>
                      <li>Label your eSIM (e.g., "Saudi Arabia Travel")</li>
                    </ol>
                  </div>

                  {/* Android Instructions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      For Android
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-7">
                      <li>Open <strong>Settings</strong> → <strong>Network & Internet</strong></li>
                      <li>Tap <strong>Mobile Network</strong> → <strong>Add Carrier</strong></li>
                      <li>Select <strong>Scan carrier QR code</strong></li>
                      <li>Scan the QR code provided</li>
                      <li>Confirm installation and name your eSIM</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center text-xl font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Activate Upon Arrival
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    When you land in Saudi Arabia, turn on your eSIM and enable Data Roaming for that line. 
                    Your connection will activate automatically within 30-60 seconds.
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      ⚠️ <strong>Important:</strong> Make sure "Data Roaming" is enabled specifically 
                      for your eSIM line in your device settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Device Compatibility */}
          <section className="mb-16">
            <div className="bg-linear-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Is Your Device Compatible?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Most modern smartphones support eSIM technology. Compatible devices include:
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 dark:text-white">iPhone</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">XS, XR, 11, 12, 13, 14, 15, 16 and newer</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 dark:text-white">Samsung Galaxy</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">S20, S21, S22, S23, S24, Z Flip/Fold series</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 dark:text-white">Google Pixel</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">3, 4, 5, 6, 7, 8, 9 and newer models</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                To verify compatibility, check: Settings → General → About → Available SIM (iOS) or 
                Settings → Network → SIM Manager (Android)
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 lg:p-12 shadow-xl">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Stay Connected?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Choose from our affordable eSIM plans designed specifically for Umrah travelers. 
                Instant activation, high-speed 5G, and 24/7 support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/plans"
                  className="inline-block px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Browse eSIM Plans
                </Link>
                <Link
                  href="/faq"
                  className="inline-block px-8 py-4 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors border border-gray-300 dark:border-slate-600"
                >
                  Visit FAQ
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
