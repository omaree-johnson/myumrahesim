import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { StructuredData } from '@/components/structured-data';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { getLowestPrice } from '@/lib/pricing';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  return {
    title: "How to Install eSIM for Saudi Arabia | Step-by-Step Guide",
    description: "Complete step-by-step guide to installing eSIM for Saudi Arabia. Detailed instructions for iPhone and Android. Learn how to scan QR codes and activate your eSIM in minutes.",
    keywords: [
      "how to install esim",
      "esim setup saudi arabia",
      "esim activation guide",
      "how to activate esim",
      "esim installation",
      "esim setup iphone",
      "esim setup android",
      "esim qr code",
      "install esim saudi arabia",
      "esim activation steps",
    ],
    openGraph: {
      title: "How to Install eSIM for Saudi Arabia | Step-by-Step Guide",
      description: "Complete step-by-step guide to installing eSIM for Saudi Arabia. Detailed instructions for iPhone and Android devices.",
      type: "article",
      url: `${baseUrl}/blog/how-to-install-esim-saudi-arabia`,
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'How to Install eSIM for Saudi Arabia - Step-by-Step Guide',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/blog/how-to-install-esim-saudi-arabia`,
    },
  };
}

export default async function HowToInstallEsimPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";

  return (
    <>
      {/* Article Structured Data */}
      <StructuredData type="article" data={{
        headline: "How to Install eSIM for Saudi Arabia: Step-by-Step Guide",
        description: "Complete step-by-step guide to installing eSIM for Saudi Arabia. Detailed instructions for iPhone and Android devices, troubleshooting tips, and activation best practices.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: `${baseUrl}/blog/how-to-install-esim-saudi-arabia`,
        datePublished: "2025-12-17",
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          name: "My Umrah eSIM Team",
          url: baseUrl,
        },
        articleBody: `Complete step-by-step guide to installing eSIM for Saudi Arabia on iPhone and Android devices. Learn how to check compatibility, scan QR codes, activate your eSIM, and troubleshoot common installation issues. Perfect for Umrah and Hajj pilgrims who need reliable connectivity.`,
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs items={[
          { name: 'Blog', url: '/blog' },
          { name: 'How to Install eSIM', url: '/blog/how-to-install-esim-saudi-arabia' },
        ]} className="mb-6" />

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How to Install eSIM for Saudi Arabia: Step-by-Step Guide
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              Complete instructions for installing and activating your eSIM on iPhone and Android devices
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <time dateTime="2025-12-17">December 17, 2025</time>
              <span>•</span>
              <span>12 min read</span>
            </div>
          </header>

          <section className="mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Installing an eSIM for Saudi Arabia is straightforward, but it helps to follow the right steps. 
              This guide walks you through the entire process, from checking compatibility to activating your eSIM when you arrive.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Whether you're travelling for <strong>Umrah</strong> or <strong>Hajj</strong>, having your eSIM set up correctly 
              ensures you stay connected from the moment you land in Saudi Arabia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Before You Start: Check Compatibility
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              First, make sure your device supports eSIM. Most modern smartphones do, but it's worth checking:
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-5 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">eSIM-Compatible Devices</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">iPhone</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    iPhone XS, XR, 11, 12, 13, 14, 15, 16 and newer models. Check Settings &gt; General &gt; About &gt; Available SIM to confirm.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Samsung Galaxy</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Galaxy S20, S21, S22, S23, S24, Z Flip, Z Fold series and newer. Check Settings &gt; Connections &gt; SIM card manager.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Google Pixel</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Pixel 3, 4, 5, 6, 7, 8, 9 and newer models. Most Pixel devices support eSIM.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Other Android</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Many newer Android devices support eSIM. Check your device settings or manufacturer's website.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/blog/esim-device-compatibility" className="text-sky-600 dark:text-sky-400 hover:underline font-medium text-sm">
                  View complete device compatibility guide →
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Step 1: Purchase Your eSIM Plan
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Before you can install an eSIM, you need to purchase a plan:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300 ml-4 mb-4">
              <li>Visit our <Link href="/plans" className="text-sky-600 dark:text-sky-400 hover:underline">eSIM plans page</Link> and choose a plan that matches your trip length and data needs</li>
              <li>Complete the secure checkout process (takes 2-3 minutes)</li>
              <li>You'll receive an email confirmation immediately</li>
              <li>Within minutes, you'll receive a second email with your QR code and activation instructions</li>
            </ol>
            <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 p-4 rounded-r">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Tip:</strong> Purchase your eSIM at least 24 hours before you travel. This gives you time to install it and test that everything works before you leave home.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Step 2: Receive Your QR Code
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              After purchase, check your email (including spam folder) for your eSIM activation email. This email contains:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
              <li>Your unique QR code (as an image attachment)</li>
              <li>Activation instructions for your device type</li>
              <li>Manual activation details (SM-DP+ address and activation code) as backup</li>
            </ul>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Important:</strong> Save a screenshot of your QR code to your Photos app. This ensures you can access it even if you lose internet connection or can't access your email.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Step 3: Install on iPhone (Detailed Instructions)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Installing eSIM on iPhone is straightforward. Follow these steps carefully:
            </p>

            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Open Settings</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Tap the Settings app on your iPhone home screen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Go to Cellular</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Scroll down and tap "Cellular" (or "Mobile Data" in some regions).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add Cellular Plan</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Tap "Add Cellular Plan" (or "Add eSIM" on newer iPhones). You'll see options to scan a QR code or enter details manually.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Scan QR Code</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Choose "Use QR Code" and point your camera at the QR code from your email. Your iPhone will automatically detect and scan it.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      If scanning doesn't work, you can enter the activation code manually from your email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Label Your eSIM</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      When prompted, give your eSIM a label like "Saudi Arabia" or "Umrah eSIM" so you can easily identify it later.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Installation</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Follow the on-screen prompts to complete installation. Your iPhone will download the eSIM profile. This usually takes 30-60 seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> The eSIM profile is now installed on your iPhone, but it won't activate until you enable it and arrive in Saudi Arabia. 
                You can leave it installed and activate it when you're ready to use data.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Step 4: Install on Android (Detailed Instructions)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Android eSIM installation varies slightly by manufacturer, but the general process is similar:
            </p>

            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Open Settings</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Open the Settings app on your Android device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Find SIM Settings</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Navigate to "Connections" or "Network & Internet", then tap "SIM card manager" or "Mobile networks". 
                      On some devices, this may be under "Dual SIM & mobile network".
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add Mobile Plan</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Tap "Add mobile plan" or "Download a SIM instead". You'll see options to scan a QR code or enter details manually.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Scan QR Code</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Select "Scan carrier QR code" and point your camera at the QR code from your email. Your Android device will scan and process it.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      If scanning fails, you can enter the activation code manually from your email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Confirm Installation</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Review the plan details and tap "Download" or "Activate" to install the eSIM profile. This usually takes 30-60 seconds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-600 dark:bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Name Your eSIM</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Give your eSIM a name like "Saudi Arabia" or "Umrah" so you can easily identify it in your settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r mt-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> Android eSIM settings vary by manufacturer. If you can't find these options, check your device manufacturer's support website or contact us for device-specific guidance.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Step 5: Activate When You Arrive
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Once you've installed the eSIM profile, you can activate it when you arrive in Saudi Arabia:
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Enable Data Roaming</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Go to Settings &gt; Cellular/Mobile Data and enable "Data Roaming" specifically for your eSIM line. 
                    This is crucial—without data roaming enabled, your eSIM won't connect.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Select eSIM for Data</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    In your cellular/mobile data settings, select your eSIM as the primary line for mobile data. 
                    Your home SIM can remain active for calls and texts.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 dark:bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Verify Connection</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Within 30-60 seconds, your eSIM should connect to a local Saudi network (STC, Mobily, or Zain). 
                    Check your signal bars and try opening a website to confirm connectivity.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Success!</strong> Once you see signal bars and can access the internet, your eSIM is active and working. 
                You can now use WhatsApp, navigation apps, the Nusuk app, and all your usual internet services.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Troubleshooting Installation Issues
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you encounter problems during installation, try these solutions:
            </p>

            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">QR Code Won't Scan</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Make sure you have good lighting and the QR code is clear. Try zooming in or using the manual activation code from your email instead.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">"eSIM Not Supported" Error</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  This usually means your device doesn't support eSIM. Check our <Link href="/blog/esim-device-compatibility" className="text-sky-600 dark:text-sky-400 hover:underline">device compatibility guide</Link> or contact your device manufacturer.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Installation Fails Midway</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Ensure you have a stable Wi-Fi or mobile data connection during installation. Try restarting your device and attempting installation again.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can't Find eSIM Settings</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  On some Android devices, eSIM settings may be in a different location. Try searching "eSIM" or "Add mobile plan" in your Settings search bar, or check your device manufacturer's support website.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/blog/troubleshooting-esim" className="text-sky-600 dark:text-sky-400 hover:underline font-medium">
                View complete troubleshooting guide →
              </Link>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Best Practices for eSIM Installation
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                  <span><strong>Install before you travel:</strong> Set up your eSIM at home where you have reliable Wi-Fi. This avoids stress at the airport.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                  <span><strong>Save QR code as backup:</strong> Take a screenshot of your QR code and save it to your Photos app for offline access.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                  <span><strong>Test before you leave:</strong> If possible, enable data roaming briefly at home to verify the eSIM profile installed correctly (don't worry, it won't activate until you're in Saudi Arabia).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                  <span><strong>Keep email accessible:</strong> Save your activation email or bookmark it so you can access manual activation details if needed.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                  <span><strong>Enable at the right time:</strong> Activate data roaming only when you arrive in Saudi Arabia to avoid starting your validity period early.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8 bg-sky-50 dark:bg-sky-900/30 rounded-lg p-6 border border-sky-200 dark:border-sky-800">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Need Help? We're Here for You
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you encounter any issues during installation or activation, our support team is available 24/7 to help. 
              We understand that getting your eSIM working is important for your journey, and we're committed to making sure it works.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/support"
                className="inline-block px-6 py-3 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors text-center"
              >
                Contact Support
              </Link>
              <Link
                href="/faq"
                className="inline-block px-6 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-semibold rounded-lg transition-colors text-center"
              >
                Read FAQ
              </Link>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Now that you know how to install eSIM, get your plan and start the process. Plans start from {priceText} with instant QR code delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/plans"
                className="inline-block px-6 py-3 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors text-center"
              >
                View eSIM Plans
              </Link>
              <Link
                href="/activation"
                className="inline-block px-6 py-3 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-semibold rounded-lg transition-colors text-center"
              >
                Activation Guide
              </Link>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Related Guides
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/blog/best-esim-saudi-arabia" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Best eSIM for Saudi Arabia</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complete guide to choosing the best eSIM for your pilgrimage</p>
              </Link>
              <Link href="/blog/esim-device-compatibility" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Device Compatibility</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Check if your phone supports eSIM</p>
              </Link>
              <Link href="/blog/troubleshooting-esim" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Troubleshooting Guide</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Solutions to common eSIM issues</p>
              </Link>
              <Link href="/faq" className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get answers to common eSIM questions</p>
              </Link>
            </div>
          </section>
        </article>
      </div>
    </>
  );
}
