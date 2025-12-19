import type { Metadata } from 'next';
import { Suspense } from "react";
import { StructuredData } from "@/components/structured-data";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ActivationContent } from "./activation-content";
import { seoConfig, getCanonicalUrl } from "@/lib/seoConfig";

export const metadata: Metadata = {
  title: "How to Activate Your eSIM for Umrah in Saudi Arabia",
  description: "Step-by-step guide to activating your eSIM for Umrah. Learn how to scan QR codes, enable data roaming, and connect to Saudi Arabia networks. Instant activation support.",
  keywords: [
    "eSIM activation",
    "eSIM activation Saudi Arabia",
    "how to activate eSIM",
    "eSIM activation Umrah",
    "eSIM QR code",
    "activate eSIM Makkah",
    "activate eSIM Madinah",
    "eSIM setup guide",
    "Saudi Arabia eSIM activation",
    "eSIM activation steps",
  ],
  openGraph: {
    title: "How to Activate Your eSIM for Umrah in Saudi Arabia",
    description: "Complete step-by-step guide to activating your eSIM for Umrah. Learn how to scan QR codes, enable data roaming, and stay connected in Makkah and Madinah.",
    type: "article",
    url: getCanonicalUrl("/activation"),
    images: [
      {
        url: seoConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'eSIM Activation Guide for Umrah',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Activate Your eSIM for Umrah in Saudi Arabia",
    description: "Step-by-step guide to activating your eSIM for Umrah. Learn how to scan QR codes and connect to Saudi Arabia networks.",
    images: [seoConfig.defaultOgImage],
  },
  alternates: {
    canonical: getCanonicalUrl("/activation"),
  },
};

export default function ActivationPage() {
  return (
    <>
      {/* HowTo Structured Data for Activation Steps */}
      <StructuredData type="howto" config={{ baseUrl: seoConfig.baseUrl }} data={{
        name: "How to Activate eSIM for Umrah in Saudi Arabia",
        description: "Complete step-by-step guide to activating your eSIM for Umrah journey in Saudi Arabia",
        steps: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Purchase Your eSIM Plan',
            text: 'Visit our website and choose an eSIM data plan for Saudi Arabia that suits your Umrah travel needs. Complete the secure checkout process.',
            url: getCanonicalUrl("/plans")
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Receive Your QR Code',
            text: 'After purchase, you will receive an email with your eSIM QR code and activation details. Check your inbox and spam folder if needed.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Open Phone Settings',
            text: 'On iPhone: Go to Settings > Cellular > Add Cellular Plan. On Android: Go to Settings > Connections > SIM card manager > Add mobile plan.',
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Scan the QR Code',
            text: 'Use your phone camera to scan the QR code from your email, or manually enter the activation code if provided.',
          },
          {
            '@type': 'HowToStep',
            position: 5,
            name: 'Enable Data Roaming',
            text: 'When you arrive in Saudi Arabia, go to Settings > Cellular/Mobile Data and enable data roaming. Select your eSIM as the primary data connection.',
          },
          {
            '@type': 'HowToStep',
            position: 6,
            name: 'Verify Connection',
            text: 'Your eSIM will automatically connect to local Saudi networks (STC, Mobily, or Zain). Check your signal bars and test internet connectivity.',
          }
        ]
      }} />
      
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Breadcrumbs items={[
          { name: 'Orders', url: '/orders' },
          { name: 'Activation', url: '/activation' },
        ]} className="mb-6" />
        
        <article className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
          <header>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              How to Activate Your eSIM for Umrah in Saudi Arabia
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Follow these simple steps to activate your eSIM and stay connected during your Umrah journey
            </p>
          </header>
        </article>
      </div>
      
      <Suspense fallback={
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading activation details...</p>
            </div>
          </div>
        </div>
      }>
        <ActivationContent />
      </Suspense>
    </>
  );
}
