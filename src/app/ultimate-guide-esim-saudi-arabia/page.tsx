import type { Metadata } from 'next';
import Link from 'next/link';
import { getLowestPrice } from '@/lib/pricing';
import { StructuredData } from '@/components/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  return {
    title: "eSIM for Saudi Arabia - Complete Guide 2025 | Best eSIM Plans for KSA",
    description: `Complete guide to getting the best eSIM for Saudi Arabia. Instant activation, reliable 4G/5G coverage in Riyadh, Jeddah, Makkah, Madinah, and throughout KSA. Affordable pricing from ${priceText}. Step-by-step activation, coverage maps, and everything you need to stay connected in Saudi Arabia.`,
    keywords: [
      "eSIM for Saudi Arabia",
      "eSIM Saudi Arabia",
      "best eSIM Saudi Arabia",
      "Saudi Arabia eSIM",
      "KSA eSIM",
      "eSIM Riyadh",
      "eSIM Jeddah",
      "Saudi Arabia mobile data",
      "eSIM plans Saudi Arabia",
      "cheap eSIM Saudi Arabia",
      "instant eSIM Saudi Arabia",
      "prepaid eSIM Saudi Arabia",
      "Saudi Arabia travel SIM",
      "eSIM coverage Saudi Arabia",
      "how to get eSIM Saudi Arabia"
    ],
    openGraph: {
      title: "eSIM for Saudi Arabia - Complete Guide 2025",
      description: `Complete guide to getting the best eSIM for Saudi Arabia. Instant activation, reliable coverage throughout KSA, affordable pricing from ${priceText}.`,
      type: "article",
      url: "/ultimate-guide-esim-saudi-arabia",
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'Complete eSIM guide for Saudi Arabia travel',
        },
      ],
    },
    alternates: {
      canonical: "/ultimate-guide-esim-saudi-arabia",
    },
  };
}

export default async function UltimateGuideSaudiArabia() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  return (
    <>
      <StructuredData type="article" data={{
        headline: "eSIM for Saudi Arabia - Complete Guide 2025",
        description: "Complete guide to getting the best eSIM for Saudi Arabia. Instant activation, reliable coverage throughout KSA, affordable pricing, and step-by-step activation instructions.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/ultimate-guide-esim-saudi-arabia`,
        datePublished: "2025-01-01",
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          name: "My Umrah eSIM Team",
        },
      }} />
      
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <nav className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-sky-600">Home</Link>
            <span className="mx-2">/</span>
            <span>eSIM for Saudi Arabia Guide</span>
          </nav>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            eSIM for Saudi Arabia: Complete Guide 2025
          </h1>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Everything you need to know about getting and using an eSIM for travel to Saudi Arabia. 
            From choosing the right plan to activating it on arrival, this comprehensive guide covers all major cities and regions.
          </p>
          
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <span>Reading time: 18 minutes</span>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li><a href="#what-is-esim" className="hover:text-sky-600 underline">What is eSIM?</a></li>
            <li><a href="#why-esim-saudi" className="hover:text-sky-600 underline">Why Choose eSIM for Saudi Arabia?</a></li>
            <li><a href="#coverage-areas" className="hover:text-sky-600 underline">Coverage Areas in Saudi Arabia</a></li>
            <li><a href="#how-to-choose" className="hover:text-sky-600 underline">How to Choose the Right Plan</a></li>
            <li><a href="#activation-guide" className="hover:text-sky-600 underline">Step-by-Step Activation Guide</a></li>
            <li><a href="#major-cities" className="hover:text-sky-600 underline">Coverage in Major Cities</a></li>
            <li><a href="#pricing" className="hover:text-sky-600 underline">Pricing and Plans</a></li>
            <li><a href="#troubleshooting" className="hover:text-sky-600 underline">Troubleshooting</a></li>
            <li><a href="#faq" className="hover:text-sky-600 underline">Frequently Asked Questions</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          
          {/* What is eSIM Section */}
          <section id="what-is-esim" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What is eSIM?</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              An eSIM (embedded SIM) is a digital SIM card built into modern smartphones that allows you to activate 
              a mobile data plan without needing a physical SIM card. Unlike traditional SIM cards that require visiting 
              a store or waiting for delivery, eSIM can be activated instantly using a QR code sent to your email.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              For travelers to Saudi Arabia, this means you can purchase and activate your mobile data plan before you 
              even leave home. No need to visit a store upon arrival, no waiting in line, and no language barriers. 
              Simply scan the QR code when you arrive, and you're connected.
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 my-6">
              <p className="text-emerald-800 dark:text-emerald-200 font-semibold">
                ✅ Key Benefit: Your phone can use both your home SIM (for calls) and the eSIM (for data) simultaneously. 
                Perfect for staying in touch with family while using data in Saudi Arabia.
              </p>
            </div>
          </section>

          {/* Why eSIM for Saudi Arabia Section */}
          <section id="why-esim-saudi" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Choose eSIM for Saudi Arabia?</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Whether you're traveling to Saudi Arabia for business, tourism, Umrah, or Hajj, staying connected is essential. 
              Here's why eSIM is the best choice for Saudi Arabia travel:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🚀 Instant Activation</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Activate before you travel. Receive your QR code instantly via email and scan it when you arrive. 
                  No store visits, no waiting, no hassle.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">💰 Save on Roaming</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Save 70-90% compared to international roaming charges. Our eSIM plans start from {priceText} with 
                  transparent pricing and no hidden fees.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">📶 Nationwide Coverage</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  High-speed 4G and 5G coverage in Riyadh, Jeddah, Makkah, Madinah, Dammam, and throughout Saudi Arabia. 
                  Connect to local networks automatically.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🔒 Keep Your Home SIM</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Use your home number for calls and WhatsApp while using eSIM for data. Both work simultaneously on 
                  dual-SIM phones - no need to remove your home SIM.
                </p>
              </div>
            </div>
          </section>

          {/* Coverage Areas Section */}
          <section id="coverage-areas" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Coverage Areas in Saudi Arabia</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Our eSIM plans provide comprehensive coverage throughout Saudi Arabia, connecting to major local networks 
              for reliable connectivity wherever you travel:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Major Cities</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✅ Riyadh (Capital)</li>
                  <li>✅ Jeddah</li>
                  <li>✅ Makkah</li>
                  <li>✅ Madinah</li>
                  <li>✅ Dammam</li>
                  <li>✅ Khobar</li>
                  <li>✅ Taif</li>
                  <li>✅ Abha</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Key Locations</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✅ All airports (Jeddah, Riyadh, Dammam)</li>
                  <li>✅ Shopping malls and centers</li>
                  <li>✅ Hotels and resorts</li>
                  <li>✅ Business districts</li>
                  <li>✅ Tourist attractions</li>
                  <li>✅ Highways and intercity routes</li>
                  <li>✅ Remote areas (variable coverage)</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Network Quality:</strong> Our eSIM connects to major Saudi telecom operators (STC, Mobily, Zain) 
                providing high-speed 4G and 5G connectivity. Coverage is strongest in urban areas and along major highways.
              </p>
            </div>
          </section>

          {/* How to Choose Section */}
          <section id="how-to-choose" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">How to Choose the Right eSIM Plan</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Choosing the right eSIM plan depends on your travel duration, data needs, and activities. Here's a guide:
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300 dark:border-slate-700">
                <thead>
                  <tr className="bg-sky-100 dark:bg-slate-800">
                    <th className="border border-gray-300 dark:border-slate-700 p-4 text-left">Trip Duration</th>
                    <th className="border border-gray-300 dark:border-slate-700 p-4 text-left">Recommended Plan</th>
                    <th className="border border-gray-300 dark:border-slate-700 p-4 text-left">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">3-7 days</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">3GB - 5GB plan</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">Short trips, basic browsing, maps</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-slate-900">
                    <td className="border border-gray-300 dark:border-slate-700 p-4">7-15 days</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">5GB - 10GB plan</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">Business travel, video calls, social media</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">15-30 days</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">10GB+ or Unlimited</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">Extended stays, heavy usage, multiple devices</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-600 p-6 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Data Usage Tips:</strong> Most travelers use 1-2GB per day for navigation, WhatsApp, and basic browsing. 
                Video calls use approximately 500MB per hour. Streaming video uses 1-2GB per hour. Plan accordingly based on your activities.
              </p>
            </div>
          </section>

          {/* Activation Guide Section */}
          <section id="activation-guide" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Step-by-Step Activation Guide</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Activating your eSIM is simple and takes just a few minutes. Follow these steps:
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Purchase Your Plan</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Visit our <Link href="/plans" className="text-sky-600 hover:underline">plans page</Link> and choose the 
                    eSIM plan that suits your travel duration and data needs. Complete the secure checkout process with 
                    your credit card, Apple Pay, or Google Pay.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Receive QR Code</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Within minutes of purchase, you'll receive an email with your eSIM QR code and activation instructions. 
                    Save this email or screenshot the QR code. You can purchase before you travel and activate when you arrive.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Scan QR Code on Arrival</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    When you arrive in Saudi Arabia, scan the QR code:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>iPhone:</strong> Settings → Cellular → Add Cellular Plan → Scan QR code</li>
                    <li><strong>Android:</strong> Settings → Connections → SIM card manager → Add mobile plan → Scan QR code</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enable Data Roaming</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    After scanning, enable data roaming for the eSIM in your phone settings. Select the eSIM for mobile data 
                    and your home SIM for calls. Your eSIM will connect automatically to local Saudi networks (STC, Mobily, or Zain).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Major Cities Section */}
          <section id="major-cities" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Coverage in Major Cities</h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Riyadh (Capital)</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Full 4G/5G coverage throughout Riyadh including:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>✅ King Khalid International Airport</li>
                  <li>✅ King Fahd Road and business districts</li>
                  <li>✅ All shopping malls (Kingdom Centre, Al Nakheel Mall)</li>
                  <li>✅ Diplomatic Quarter</li>
                  <li>✅ All hotels and residential areas</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Jeddah</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Excellent coverage in Jeddah including:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>✅ King Abdulaziz International Airport</li>
                  <li>✅ Corniche and Red Sea areas</li>
                  <li>✅ Historic Al-Balad district</li>
                  <li>✅ Shopping centers and malls</li>
                  <li>✅ All hotels and resorts</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Makkah & Madinah</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Comprehensive coverage for pilgrims:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>✅ Grand Mosque (Masjid al-Haram) in Makkah</li>
                  <li>✅ Prophet's Mosque (Masjid an-Nabawi) in Madinah</li>
                  <li>✅ All hotels and accommodations</li>
                  <li>✅ Shopping areas and markets</li>
                  <li>✅ Transportation hubs</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Dammam & Eastern Province</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Full coverage in the Eastern Province:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>✅ King Fahd International Airport</li>
                  <li>✅ Khobar and Al Khobar</li>
                  <li>✅ Dhahran and business districts</li>
                  <li>✅ Jubail industrial city</li>
                  <li>✅ All major business centers</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Pricing and Plans</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Our eSIM plans for Saudi Arabia are affordable and transparent, with no hidden fees. Prices start from {priceText} 
              and vary based on data allowance and validity period.
            </p>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-3">What's Included:</h3>
              <ul className="space-y-2 text-emerald-800 dark:text-emerald-300">
                <li>✅ High-speed 4G/5G data</li>
                <li>✅ Coverage throughout Saudi Arabia</li>
                <li>✅ Instant QR code delivery</li>
                <li>✅ 24/7 customer support (English & Arabic)</li>
                <li>✅ Money-back guarantee if activation fails</li>
                <li>✅ No contracts or credit checks</li>
                <li>✅ Works with dual-SIM phones</li>
              </ul>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300">
              <Link href="/plans" className="text-sky-600 hover:underline font-semibold">View all eSIM plans for Saudi Arabia →</Link>
            </p>
          </section>

          {/* Troubleshooting Section */}
          <section id="troubleshooting" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Troubleshooting Common Issues</h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">eSIM Not Activating</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  If your eSIM doesn't activate:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Ensure you're scanning the QR code correctly (good lighting, steady hand)</li>
                  <li>Check that your phone supports eSIM (iPhone XS+, Samsung S20+, Google Pixel 3+)</li>
                  <li>Make sure you're connected to Wi-Fi when scanning</li>
                  <li>Try entering the activation code manually if QR scanning fails</li>
                  <li>Contact our support team for immediate assistance</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No Data Connection</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  If you can't connect to data:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Enable data roaming in your phone settings (Settings → Cellular → Data Roaming)</li>
                  <li>Select the eSIM for mobile data (not your home SIM)</li>
                  <li>Restart your phone after activation</li>
                  <li>Check that you're in Saudi Arabia (eSIM activates on arrival)</li>
                  <li>Verify you haven't exceeded your data limit</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Slow Connection</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  If your connection is slow:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Check your signal strength (move to a different location if needed)</li>
                  <li>Try switching between 4G and 5G in your network settings</li>
                  <li>Avoid crowded areas during peak times (network congestion)</li>
                  <li>Check your data usage to ensure you haven't exceeded your limit</li>
                  <li>Restart your phone to reconnect to the network</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Need Help?</strong> Our support team is available 24/7 via email and WhatsApp in both English and Arabic. 
                <Link href="/faq" className="text-sky-600 hover:underline ml-1">Visit our FAQ page →</Link>
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">When should I activate my eSIM for Saudi Arabia?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Activate your eSIM when you arrive in Saudi Arabia, not before. The eSIM will connect to local networks 
                  automatically once you're in the country. You can purchase and receive the QR code before you travel, but 
                  wait until you land to scan it.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Will my eSIM work in all cities in Saudi Arabia?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes! Our eSIM plans provide coverage throughout Saudi Arabia, including all major cities (Riyadh, Jeddah, 
                  Makkah, Madinah, Dammam, Khobar) and most smaller cities. Coverage is strongest in urban areas and along 
                  major highways. Remote desert areas may have limited or no coverage.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Can I use my home SIM and eSIM at the same time?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes! If your phone supports dual-SIM (most modern iPhones and Android phones do), you can use your home 
                  SIM for calls and WhatsApp while using the eSIM for mobile data. Both will work simultaneously - no need 
                  to remove your home SIM.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What if my eSIM doesn't work?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We offer a money-back guarantee if your eSIM fails to activate or connect. Contact our support team 
                  immediately, and we'll either fix the issue or provide a full refund. We're here to help 24/7 in both 
                  English and Arabic.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/faq" className="text-sky-600 hover:underline font-semibold">
                View all FAQs →
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-sky-600 to-emerald-600 rounded-2xl p-8 lg:p-12 text-center text-white mb-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Your eSIM for Saudi Arabia?</h2>
            <p className="text-xl mb-6 opacity-90">
              Choose your plan and get instant activation. Stay connected throughout your journey in Saudi Arabia.
            </p>
            <Link
              href="/plans"
              className="inline-block bg-white text-sky-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View eSIM Plans
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}

