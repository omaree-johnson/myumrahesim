import type { Metadata } from 'next';
import Link from 'next/link';
import { getLowestPrice } from '@/lib/pricing';
import { StructuredData } from '@/components/structured-data';
import Image from 'next/image';

export async function generateMetadata(): Promise<Metadata> {
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  return {
    title: "eSIM for Umrah - Complete Guide 2025",
    description: `Complete guide to eSIM for Umrah. Instant activation, coverage in Makkah and Madinah, pricing from ${priceText}. Step-by-step guide.`,
    keywords: [
      "eSIM for Umrah",
      "best eSIM for Umrah",
      "Umrah eSIM guide",
      "eSIM Umrah activation",
      "Makkah eSIM",
      "Madinah eSIM",
      "Umrah mobile data",
      "Saudi Arabia eSIM Umrah",
      "how to get eSIM for Umrah",
      "Umrah internet connection",
      "eSIM for Umrah pilgrims",
      "best eSIM plans Umrah",
      "cheap eSIM Umrah",
      "instant eSIM Umrah"
    ],
    openGraph: {
      title: "eSIM for Umrah - Complete Guide 2025",
      description: `Complete guide to getting the best eSIM for Umrah. Instant activation, reliable coverage in Makkah and Madinah, affordable pricing from ${priceText}.`,
      type: "article",
      url: "/ultimate-guide-esim-umrah",
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'Kaaba in Makkah - Complete eSIM guide for Umrah pilgrims',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/ultimate-guide-esim-umrah`,
    },
  };
}

export default async function UltimateGuideUmrah() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  return (
    <>
      <StructuredData type="article" data={{
        headline: "eSIM for Umrah - Complete Guide 2025",
        description: "Complete guide to getting the best eSIM for Umrah. Instant activation, reliable coverage in Makkah and Madinah, affordable pricing, and step-by-step activation instructions.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/ultimate-guide-esim-umrah`,
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
            <span>eSIM for Umrah Guide</span>
          </nav>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            eSIM for Umrah: Complete Guide 2025
          </h1>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Everything you need to know about getting and using an eSIM for your Umrah journey. 
            From choosing the right plan to activating it on arrival, this comprehensive guide covers it all.
          </p>
          
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <span>Reading time: 15 minutes</span>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li><a href="#what-is-esim" className="hover:text-sky-600 underline">What is eSIM?</a></li>
            <li><a href="#why-esim-umrah" className="hover:text-sky-600 underline">Why Choose eSIM for Umrah?</a></li>
            <li><a href="#how-to-choose" className="hover:text-sky-600 underline">How to Choose the Right eSIM Plan</a></li>
            <li><a href="#activation-guide" className="hover:text-sky-600 underline">Step-by-Step Activation Guide</a></li>
            <li><a href="#coverage" className="hover:text-sky-600 underline">Coverage in Makkah and Madinah</a></li>
            <li><a href="#pricing" className="hover:text-sky-600 underline">Pricing and Plans</a></li>
            <li><a href="#troubleshooting" className="hover:text-sky-600 underline">Troubleshooting Common Issues</a></li>
            <li><a href="#faq" className="hover:text-sky-600 underline">Frequently Asked Questions</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          
          {/* What is eSIM Section */}
          <section id="what-is-esim" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What is eSIM?</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              An eSIM (embedded SIM) is a digital SIM card built into modern smartphones. Unlike traditional physical SIM cards 
              that you need to insert into your phone, an eSIM is already in your device and can be activated remotely using 
              a QR code or activation code.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              For Umrah pilgrims, this means you can purchase and activate your Saudi Arabia mobile data plan before you even 
              leave home. No need to visit a store in Saudi Arabia or wait in line at the airport. Simply scan the QR code 
              we send to your email, and you're ready to connect.
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 my-6">
              <p className="text-emerald-800 dark:text-emerald-200 font-semibold">
                ✅ Key Benefit: Your phone can use both your home SIM (for calls) and the eSIM (for data) simultaneously. 
                Perfect for staying in touch with family back home while using data in Saudi Arabia.
              </p>
            </div>
          </section>

          {/* Why eSIM for Umrah Section */}
          <section id="why-esim-umrah" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Choose eSIM for Umrah?</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              When planning your Umrah journey, staying connected is essential for navigation, communication, and accessing 
              important information. Here's why eSIM is the best choice for Umrah pilgrims:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🚀 Instant Activation</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Activate before you travel. Receive your QR code instantly via email and scan it when you arrive. 
                  No store visits or waiting in line.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">💰 Avoid Roaming Fees</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Save hundreds compared to international roaming. Our eSIM plans start from {priceText} with no hidden fees.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">📶 Reliable Coverage</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  High-speed 4G and 5G coverage in Makkah, Madinah, Jeddah, and throughout Saudi Arabia. 
                  Connect to local networks automatically.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🔒 Keep Your Home SIM</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Use your home number for calls and WhatsApp while using eSIM for data. Both work simultaneously on dual-SIM phones.
                </p>
              </div>
            </div>
          </section>

          {/* How to Choose Section */}
          <section id="how-to-choose" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">How to Choose the Right eSIM Plan for Umrah</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Choosing the right eSIM plan depends on your Umrah duration and data needs. Here's a simple guide:
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300 dark:border-slate-700">
                <thead>
                  <tr className="bg-sky-100 dark:bg-slate-800">
                    <th className="border border-gray-300 dark:border-slate-700 p-4 text-left">Umrah Duration</th>
                    <th className="border border-gray-300 dark:border-slate-700 p-4 text-left">Recommended Plan</th>
                    <th className="border border-gray-300 dark:border-slate-700 p-4 text-left">Data Usage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">7-10 days</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">3GB - 5GB plan</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">Maps, WhatsApp, basic browsing</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-slate-900">
                    <td className="border border-gray-300 dark:border-slate-700 p-4">10-15 days</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">5GB - 10GB plan</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">Video calls, social media, streaming</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">15-30 days</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">10GB+ or Unlimited</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">Heavy usage, multiple devices</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Pro Tip:</strong> Most Umrah pilgrims use 1-2GB per day for navigation, WhatsApp, and basic browsing. 
                A 7-day plan with 5GB is usually sufficient for a typical Umrah trip.
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
                    eSIM plan that suits your Umrah duration and data needs. Complete the secure checkout process.
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
                    Save this email or screenshot the QR code.
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
                    and your home SIM for calls. Your eSIM will connect automatically to local Saudi networks.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Coverage Section */}
          <section id="coverage" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Coverage in Makkah and Madinah</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Our eSIM plans provide excellent coverage throughout Saudi Arabia, including all key Umrah locations:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Makkah</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✅ Grand Mosque (Masjid al-Haram)</li>
                  <li>✅ All hotels and accommodations</li>
                  <li>✅ Shopping areas and markets</li>
                  <li>✅ Transportation hubs</li>
                  <li>✅ High-speed 4G/5G coverage</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Madinah</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✅ Prophet's Mosque (Masjid an-Nabawi)</li>
                  <li>✅ All hotels and accommodations</li>
                  <li>✅ Historical sites</li>
                  <li>✅ Shopping centers</li>
                  <li>✅ High-speed 4G/5G coverage</li>
                </ul>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Coverage also extends to Jeddah, Riyadh, and all major cities in Saudi Arabia. Your eSIM will automatically 
              connect to the best available network wherever you are.
            </p>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Pricing and Plans</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Our eSIM plans for Umrah are affordable and transparent, with no hidden fees. Prices start from {priceText} 
              and vary based on data allowance and validity period.
            </p>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-3">What's Included:</h3>
              <ul className="space-y-2 text-emerald-800 dark:text-emerald-300">
                <li>✅ High-speed 4G/5G data</li>
                <li>✅ Coverage in Makkah, Madinah, and all of Saudi Arabia</li>
                <li>✅ Instant QR code delivery</li>
                <li>✅ 24/7 customer support</li>
                <li>✅ Money-back guarantee if activation fails</li>
                <li>✅ No contracts or credit checks</li>
              </ul>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300">
              <Link href="/plans" className="text-sky-600 hover:underline font-semibold">View all eSIM plans →</Link>
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
                  <li>Ensure you're scanning the QR code correctly</li>
                  <li>Check that your phone supports eSIM</li>
                  <li>Make sure you're connected to Wi-Fi when scanning</li>
                  <li>Contact our support team for assistance</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No Data Connection</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  If you can't connect to data:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Enable data roaming in your phone settings</li>
                  <li>Select the eSIM for mobile data</li>
                  <li>Restart your phone</li>
                  <li>Check that you're in Saudi Arabia (eSIM activates on arrival)</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Slow Connection</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  If your connection is slow:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Check your signal strength</li>
                  <li>Try switching between 4G and 5G</li>
                  <li>Move to a different location if in a crowded area</li>
                  <li>Check your data usage to ensure you haven't exceeded your limit</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Need Help?</strong> Our support team is available 24/7 via WhatsApp and email. 
                <Link href="/faq" className="text-sky-600 hover:underline ml-1">Visit our FAQ page →</Link>
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">When should I activate my eSIM for Umrah?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Activate your eSIM when you arrive in Saudi Arabia, not before. The eSIM will connect to local networks 
                  automatically once you're in the country. You can purchase and receive the QR code before you travel, but 
                  wait until you land to scan it.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Will my eSIM work in both Makkah and Madinah?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes! Our eSIM plans provide coverage throughout Saudi Arabia, including Makkah, Madinah, Jeddah, and all 
                  major cities. You'll have seamless connectivity as you travel between cities during your Umrah journey.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Can I use my home SIM and eSIM at the same time?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes! If your phone supports dual-SIM (most modern iPhones and Android phones do), you can use your home 
                  SIM for calls and WhatsApp while using the eSIM for mobile data. Both will work simultaneously.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What if my eSIM doesn't work?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We offer a money-back guarantee if your eSIM fails to activate or connect. Contact our support team 
                  immediately, and we'll either fix the issue or provide a full refund. We're here to help 24/7.
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
            <h2 className="text-3xl font-bold mb-4">Ready to Get Your eSIM for Umrah?</h2>
            <p className="text-xl mb-6 opacity-90">
              Choose your plan and get instant activation. Stay connected throughout your Umrah journey.
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

