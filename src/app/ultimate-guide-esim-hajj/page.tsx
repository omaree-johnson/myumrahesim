import type { Metadata } from 'next';
import Link from 'next/link';
import { getLowestPrice } from '@/lib/pricing';
import { StructuredData } from '@/components/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  return {
    title: "eSIM for Hajj - Complete Guide 2025",
    description: `Complete guide to eSIM for Hajj. Instant activation, coverage in Makkah, Madinah, Mina, Arafat. Pricing from ${priceText}. Step-by-step guide.`,
    keywords: [
      "eSIM for Hajj",
      "Hajj eSIM",
      "best eSIM for Hajj",
      "eSIM Hajj guide",
      "eSIM Makkah Hajj",
      "eSIM Madinah Hajj",
      "Hajj mobile data",
      "Saudi Arabia eSIM Hajj",
      "how to get eSIM for Hajj",
      "Hajj internet connection",
      "eSIM for Hajj pilgrims",
      "best eSIM plans Hajj",
      "cheap eSIM Hajj",
      "instant eSIM Hajj",
      "eSIM Mina Arafat"
    ],
    openGraph: {
      title: "eSIM for Hajj - Complete Guide 2025",
      description: `Complete guide to getting the best eSIM for Hajj. Instant activation, reliable coverage in Makkah, Madinah, and all Hajj sites, affordable pricing from ${priceText}.`,
      type: "article",
      url: "/ultimate-guide-esim-hajj",
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'Complete eSIM guide for Hajj pilgrims',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/ultimate-guide-esim-hajj`,
    },
  };
}

export default async function UltimateGuideHajj() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  return (
    <>
      <StructuredData type="article" data={{
        headline: "eSIM for Hajj - Complete Guide 2025",
        description: "Complete guide to getting the best eSIM for Hajj. Instant activation, reliable coverage in Makkah, Madinah, and all Hajj sites, affordable pricing, and step-by-step activation instructions.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/ultimate-guide-esim-hajj`,
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
            <span>eSIM for Hajj Guide</span>
          </nav>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            eSIM for Hajj: Complete Guide 2025
          </h1>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Everything you need to know about getting and using an eSIM for your Hajj journey. 
            From choosing the right plan to staying connected during all Hajj rituals, this comprehensive guide covers it all.
          </p>
          
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <span>Reading time: 16 minutes</span>
          </div>
        </header>

        {/* Table of Contents */}
        <nav className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li><a href="#what-is-esim" className="hover:text-sky-600 underline">What is eSIM?</a></li>
            <li><a href="#why-esim-hajj" className="hover:text-sky-600 underline">Why Choose eSIM for Hajj?</a></li>
            <li><a href="#hajj-coverage" className="hover:text-sky-600 underline">Coverage During Hajj</a></li>
            <li><a href="#how-to-choose" className="hover:text-sky-600 underline">How to Choose the Right Plan for Hajj</a></li>
            <li><a href="#activation-guide" className="hover:text-sky-600 underline">Step-by-Step Activation Guide</a></li>
            <li><a href="#hajj-sites" className="hover:text-sky-600 underline">Coverage at Hajj Sites</a></li>
            <li><a href="#peak-season" className="hover:text-sky-600 underline">Peak Season Considerations</a></li>
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
              a mobile data plan without needing a physical SIM card. For Hajj pilgrims, this means you can purchase 
              and activate your Saudi Arabia mobile data plan before you even leave home.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              No need to visit a store in Saudi Arabia or wait in line at the airport. Simply scan the QR code we send 
              to your email when you arrive, and you're ready to connect. This is especially valuable during Hajj when 
              millions of pilgrims are in Makkah and Madinah, making store visits difficult.
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 my-6">
              <p className="text-emerald-800 dark:text-emerald-200 font-semibold">
                ✅ Key Benefit: Your phone can use both your home SIM (for calls) and the eSIM (for data) simultaneously. 
                Perfect for staying in touch with family back home while using data during your Hajj journey.
              </p>
            </div>
          </section>

          {/* Why eSIM for Hajj Section */}
          <section id="why-esim-hajj" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Choose eSIM for Hajj?</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              During Hajj, staying connected is essential for navigation, communication with your group, and accessing 
              important information. Here's why eSIM is the best choice for Hajj pilgrims:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🚀 Activate Before You Travel</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Purchase and receive your QR code before leaving home. Activate when you arrive - no need to find a 
                  store during the busy Hajj season when millions of pilgrims are in Makkah.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">💰 Avoid Expensive Roaming</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Save hundreds compared to international roaming charges. Our eSIM plans start from {priceText} with 
                  transparent pricing - perfect for extended Hajj stays.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">📶 Coverage at All Hajj Sites</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  High-speed 4G and 5G coverage in Makkah, Madinah, Mina, Arafat, Muzdalifah, and throughout your Hajj journey. 
                  Connect to local networks automatically.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">👥 Stay Connected with Your Group</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Use WhatsApp, maps, and navigation apps to stay in touch with your Hajj group and find your way in 
                  crowded areas. Essential for group coordination during Hajj.
                </p>
              </div>
            </div>
          </section>

          {/* Hajj Coverage Section */}
          <section id="hajj-coverage" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Coverage During Hajj</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Our eSIM plans provide reliable coverage throughout your Hajj journey, including all key locations:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Makkah</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✅ Grand Mosque (Masjid al-Haram)</li>
                  <li>✅ Tawaf area and Sa'i</li>
                  <li>✅ All hotels and accommodations</li>
                  <li>✅ Shopping areas</li>
                  <li>✅ High-speed 4G/5G coverage</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Madinah</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✅ Prophet's Mosque (Masjid an-Nabawi)</li>
                  <li>✅ Rawdah area</li>
                  <li>✅ All hotels and accommodations</li>
                  <li>✅ Historical sites</li>
                  <li>✅ High-speed 4G/5G coverage</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Mina</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✅ Tent city and accommodations</li>
                  <li>✅ Jamarat area</li>
                  <li>✅ All Hajj facilities</li>
                  <li>✅ Transportation hubs</li>
                  <li>✅ Reliable coverage (may be congested during peak times)</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Arafat & Muzdalifah</h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>✅ Arafat (Day of Arafah)</li>
                  <li>✅ Muzdalifah (overnight stay)</li>
                  <li>✅ All Hajj ritual areas</li>
                  <li>✅ Transportation routes</li>
                  <li>✅ Coverage available (may be limited in remote areas)</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-600 p-6 rounded-lg">
              <p className="text-amber-800 dark:text-amber-200">
                <strong>Important Note:</strong> During peak Hajj times (especially on the Day of Arafah and in Mina), 
                network congestion is common due to millions of pilgrims using mobile networks simultaneously. While coverage 
                is available, speeds may be slower during these peak periods. Plan accordingly and download important information 
                before peak times.
              </p>
            </div>
          </section>

          {/* How to Choose Section */}
          <section id="how-to-choose" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">How to Choose the Right Plan for Hajj</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Hajj typically lasts 5-7 days, but many pilgrims stay longer in Makkah and Madinah. Choose your plan based on 
              your total stay duration:
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300 dark:border-slate-700">
                <thead>
                  <tr className="bg-sky-100 dark:bg-slate-800">
                    <th className="border border-gray-300 dark:border-slate-700 p-4 text-left">Hajj Duration</th>
                    <th className="border border-gray-300 dark:border-slate-700 p-4 text-left">Recommended Plan</th>
                    <th className="border border-gray-300 dark:border-slate-700 p-4 text-left">Data Usage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">5-7 days (Hajj only)</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">5GB - 10GB plan</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">Maps, WhatsApp, basic browsing</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-slate-900">
                    <td className="border border-gray-300 dark:border-slate-700 p-4">10-15 days (Hajj + Umrah)</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">10GB - 20GB plan</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">Video calls, social media, extended use</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">15-30 days (Extended stay)</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">20GB+ or Unlimited</td>
                    <td className="border border-gray-300 dark:border-slate-700 p-4">Heavy usage, multiple devices, streaming</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Pro Tip:</strong> During Hajj, network congestion can slow down data speeds. Consider purchasing a 
                plan with more data than you think you'll need, as slower speeds may require more data usage for the same 
                activities. Also, download maps and important information before arriving in crowded areas.
              </p>
            </div>
          </section>

          {/* Activation Guide Section */}
          <section id="activation-guide" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Step-by-Step Activation Guide</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Activating your eSIM for Hajj is simple and takes just a few minutes. Follow these steps:
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Purchase Before You Travel</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Visit our <Link href="/plans" className="text-sky-600 hover:underline">plans page</Link> and choose the 
                    eSIM plan that suits your Hajj duration and data needs. Complete the secure checkout process. We recommend 
                    purchasing at least a week before your travel date to ensure you receive your QR code in time.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Receive QR Code Instantly</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Within minutes of purchase, you'll receive an email with your eSIM QR code and activation instructions. 
                    Save this email or screenshot the QR code. Print a backup copy if possible - this is especially important 
                    during Hajj when you may not have easy access to email.
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
                    When you arrive in Saudi Arabia (Jeddah or Madinah airport), scan the QR code:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li><strong>iPhone:</strong> Settings → Cellular → Add Cellular Plan → Scan QR code</li>
                    <li><strong>Android:</strong> Settings → Connections → SIM card manager → Add mobile plan → Scan QR code</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    Activate when you arrive, not before. The validity period starts from first activation.
                  </p>
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
                    and your home SIM for calls. Your eSIM will connect automatically to local Saudi networks. Test the connection 
                    before leaving the airport to ensure everything works.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Hajj Sites Section */}
          <section id="hajj-sites" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Coverage at Hajj Sites</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Understanding coverage at different Hajj sites will help you plan your connectivity:
            </p>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Grand Mosque (Makkah)</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Excellent coverage throughout the Grand Mosque area:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>✅ Tawaf area (circumambulation)</li>
                  <li>✅ Sa'i area (between Safa and Marwa)</li>
                  <li>✅ All prayer areas</li>
                  <li>✅ Abraj Al Bait and surrounding hotels</li>
                  <li>⚠️ Network may be slower during peak prayer times</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Mina (Tent City)</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Coverage in Mina during Hajj:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>✅ Tent areas and accommodations</li>
                  <li>✅ Jamarat (stoning area) - coverage available</li>
                  <li>✅ Transportation hubs</li>
                  <li>⚠️ Network congestion expected during peak stoning times</li>
                  <li>⚠️ Download maps and important info before arriving</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Arafat (Day of Arafah)</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Coverage on the Day of Arafah:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>✅ Main Arafat area</li>
                  <li>✅ Namira Mosque area</li>
                  <li>✅ Transportation routes</li>
                  <li>⚠️ Heavy network congestion expected (millions of pilgrims)</li>
                  <li>⚠️ Prepare for slower speeds - download essentials beforehand</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📍 Muzdalifah</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Coverage during overnight stay:
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>✅ Main Muzdalifah area</li>
                  <li>✅ Transportation routes</li>
                  <li>⚠️ Limited facilities - network available but may be slower</li>
                  <li>⚠️ Prepare for basic connectivity during overnight stay</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Peak Season Section */}
          <section id="peak-season" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Peak Season Considerations</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              During Hajj, millions of pilgrims use mobile networks simultaneously, which can affect connectivity. Here's what to expect:
            </p>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-4">What to Expect During Peak Times:</h3>
              <ul className="space-y-2 text-amber-800 dark:text-amber-300">
                <li>⚠️ Slower data speeds during peak prayer times (especially in Grand Mosque)</li>
                <li>⚠️ Network congestion on Day of Arafah (millions of pilgrims in one area)</li>
                <li>⚠️ Slower speeds during Jamarat (stoning) times in Mina</li>
                <li>✅ Coverage is still available, but speeds may be reduced</li>
                <li>✅ Early morning and late evening typically have better speeds</li>
              </ul>
            </div>
            
            <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Tips for Better Connectivity During Hajj:</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>📥 Download maps, important apps, and information before arriving in crowded areas</li>
                <li>📱 Use data during off-peak hours (early morning, late evening) when possible</li>
                <li>💾 Save important contacts and information offline</li>
                <li>🔋 Keep a portable charger - network searching uses more battery</li>
                <li>📞 Use WhatsApp for calls instead of regular calls (uses less data)</li>
                <li>🌐 Consider using a VPN if needed, but be aware it may slow speeds further</li>
              </ul>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Pricing and Plans</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Our eSIM plans for Hajj are affordable and transparent, with no hidden fees. Prices start from {priceText} 
              and vary based on data allowance and validity period.
            </p>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-3">What's Included:</h3>
              <ul className="space-y-2 text-emerald-800 dark:text-emerald-300">
                <li>✅ High-speed 4G/5G data</li>
                <li>✅ Coverage in Makkah, Madinah, and all Hajj sites</li>
                <li>✅ Instant QR code delivery</li>
                <li>✅ 24/7 customer support (English & Arabic)</li>
                <li>✅ Money-back guarantee if activation fails</li>
                <li>✅ No contracts or credit checks</li>
                <li>✅ Works with dual-SIM phones</li>
              </ul>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300">
              <Link href="/plans" className="text-sky-600 hover:underline font-semibold">View all eSIM plans for Hajj →</Link>
            </p>
          </section>

          {/* Troubleshooting Section */}
          <section id="troubleshooting" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Troubleshooting During Hajj</h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Slow Connection During Peak Times</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  This is normal during Hajj due to network congestion:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Be patient - speeds will improve during off-peak hours</li>
                  <li>Use data early morning or late evening when possible</li>
                  <li>Download important information before peak times</li>
                  <li>Consider using text-based apps instead of video during congestion</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">eSIM Not Connecting</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  If your eSIM doesn't connect:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Ensure data roaming is enabled</li>
                  <li>Select the eSIM for mobile data in settings</li>
                  <li>Restart your phone</li>
                  <li>Move to a less crowded area if possible</li>
                  <li>Contact our 24/7 support team for immediate help</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Battery Draining Quickly</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  During Hajj, your phone may use more battery:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>Carry a portable charger or power bank</li>
                  <li>Reduce screen brightness</li>
                  <li>Close unnecessary apps</li>
                  <li>Turn off Wi-Fi and Bluetooth when not needed</li>
                  <li>Enable battery saver mode</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 p-6 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">
                <strong>24/7 Support During Hajj:</strong> Our support team is available around the clock in both English 
                and Arabic to help you with any issues during your Hajj journey. 
                <Link href="/faq" className="text-sky-600 hover:underline ml-1">Visit our FAQ page →</Link>
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">When should I purchase my eSIM for Hajj?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Purchase your eSIM at least a week before your travel date to ensure you receive your QR code in time. 
                  You can activate it when you arrive in Saudi Arabia. We recommend purchasing before you travel to avoid 
                  any last-minute issues during the busy Hajj season.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Will my eSIM work in Mina, Arafat, and Muzdalifah?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes, our eSIM plans provide coverage in Mina, Arafat, and Muzdalifah. However, during peak Hajj times 
                  (especially on the Day of Arafah), network congestion is expected due to millions of pilgrims using mobile 
                  networks simultaneously. Coverage is available, but speeds may be slower during these peak periods.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">How much data do I need for Hajj?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  For a typical 5-7 day Hajj, most pilgrims use 1-2GB per day for navigation, WhatsApp, and basic browsing. 
                  We recommend a 10GB plan for comfortable usage. If you plan to make video calls or stay longer, consider 
                  a 15-20GB plan or unlimited option.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What if my eSIM doesn't work during Hajj?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We offer a money-back guarantee if your eSIM fails to activate or connect. Contact our 24/7 support team 
                  immediately (available in English and Arabic), and we'll either fix the issue or provide a full refund. 
                  We understand the importance of staying connected during Hajj and are here to help.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Can I use eSIM for both Hajj and Umrah?</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes! If your validity period covers both trips, you can use the same eSIM for both Hajj and Umrah. 
                  Our eSIM plans provide coverage throughout Saudi Arabia, including Makkah, Madinah, and all Hajj sites. 
                  Simply ensure your plan's validity period covers your entire stay.
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
            <h2 className="text-3xl font-bold mb-4">Ready to Get Your eSIM for Hajj?</h2>
            <p className="text-xl mb-6 opacity-90">
              Choose your plan and get instant activation. Stay connected throughout your Hajj journey and stay in touch with your group.
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

