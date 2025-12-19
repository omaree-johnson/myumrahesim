import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Smartphone, Zap, Shield, DollarSign, Globe, Clock, Star } from "lucide-react";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "About My Umrah eSIM | Trusted eSIM for Pilgrims",
  description: "Learn why thousands of Umrah and Hajj pilgrims trust My Umrah eSIM. Specialised service for pilgrims, instant activation, coverage in Makkah and Madinah, and 24/7 support.",
  keywords: [
    "about my umrah esim",
    "why choose us",
    "umrah esim provider",
    "hajj esim service",
    "trusted esim for pilgrims",
    "esim for umrah",
    "esim for hajj",
  ],
  openGraph: {
    title: "About My Umrah eSIM | Trusted eSIM for Pilgrims",
    description: "Learn why thousands of Umrah and Hajj pilgrims trust My Umrah eSIM. Specialised service, instant activation, and reliable support.",
    type: "website",
    url: "/learn-more",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com'}/learn-more`,
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
              Why Choose My Umrah eSIM for Your Pilgrimage
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We're dedicated to helping Umrah and Hajj pilgrims stay connected during their spiritual journey. 
              Specialised service, instant activation, and reliable support when you need it most.
            </p>
          </header>

          {/* Our Story Section */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Our Story: Helping Pilgrims Stay Connected
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-base sm:text-lg leading-relaxed">
                My Umrah eSIM was created specifically for Muslims travelling for Umrah and Hajj. We understand that staying connected during your pilgrimage isn't just about convenience—it's about peace of mind for you and your family back home.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Whether you need to access the Nusuk app for permits, navigate to holy sites, make video calls to loved ones, or simply stay in touch, reliable internet access is essential. We've designed our service to make this as simple and stress-free as possible.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Unlike generic eSIM providers, we specialise in serving pilgrims. This means we understand your unique needs: coverage in Makkah and Madinah, support during your journey, and plans that work for the duration of your stay.
              </p>
            </div>
          </section>

          {/* What Makes Us Different */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              What Makes Us Different
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Specialised for Umrah & Hajj
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We're not a generic travel eSIM provider. Every aspect of our service is designed with Umrah and Hajj pilgrims in mind—from our coverage focus on Makkah and Madinah to our understanding of what you need during your journey.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Instant Activation, No Hassle
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No need to find a SIM card vendor when you arrive. Purchase before you travel, receive your QR code instantly, and activate in minutes when you land. Focus on your spiritual journey, not on setting up your phone.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Reliable Support When You Need It
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our support team understands the importance of staying connected during Umrah and Hajj. We're available 24/7 via WhatsApp and email, even during your journey. If something goes wrong, we'll help you fix it quickly.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Transparent Pricing, No Surprises
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No hidden fees, no contracts, no credit checks. You pay once for your plan, and that's it. Our prices are clearly displayed, and we offer a money-back guarantee if your eSIM doesn't activate.
                </p>
              </div>
            </div>
          </section>

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

          {/* Our Commitment Section */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Our Commitment to You
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Activation Guarantee</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  If your eSIM doesn't activate or connect in Saudi Arabia, we'll replace it immediately or provide a full refund. No questions asked.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our support team is available around the clock via WhatsApp and email. We understand that issues can arise at any time during your journey, and we're here to help.
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 dark:border-purple-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Coverage You Can Trust</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our eSIM plans connect to major Saudi networks (STC, Mobily, Zain) providing reliable coverage in Makkah, Madinah, Jeddah, and throughout Saudi Arabia.
                </p>
              </div>
            </div>
          </section>

          {/* Trusted By Section */}
          <section className="mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Trusted by Thousands of Pilgrims
            </h2>
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Over 10,000 Umrah and Hajj pilgrims have trusted us with their connectivity needs. We're proud to help Muslims stay connected during their spiritual journeys.
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-500">
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <span className="ml-2 text-gray-900 dark:text-white font-semibold">4.8/5 from 150+ reviews</span>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 border border-sky-200 dark:border-slate-700 rounded-2xl p-8 lg:p-12 shadow-xl">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Get Your eSIM for Umrah?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of pilgrims who trust My Umrah eSIM for reliable connectivity during their spiritual journey. 
                Instant activation, coverage in Makkah and Madinah, and 24/7 support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/plans"
                  className="inline-block px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  View eSIM Plans
                </Link>
                <Link
                  href="/faq"
                  className="inline-block px-8 py-4 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors border border-gray-300 dark:border-slate-600"
                >
                  Read Our FAQ
                </Link>
                <Link
                  href="/ultimate-guide-esim-umrah"
                  className="inline-block px-8 py-4 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors border border-gray-300 dark:border-slate-600"
                >
                  Read Our Guides
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
