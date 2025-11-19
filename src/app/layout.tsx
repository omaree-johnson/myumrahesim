import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { StructuredData } from "@/components/structured-data";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { CurrencyProvider } from "@/components/currency-provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com'),
  title: {
    default: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM - Stay Connected During Your Umrah Journey",
    template: `%s | ${process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM"}`,
  },
  description: process.env.NEXT_PUBLIC_TAGLINE || "Instant eSIM activation for Saudi Arabia. Get high-speed mobile data for your Umrah and Hajj pilgrimage. No physical SIM needed, activate in seconds with affordable prepaid data plans.",
  keywords: [
    "Umrah eSIM",
    "Saudi Arabia eSIM",
    "Hajj mobile data",
    "Makkah eSIM",
    "Madinah eSIM",
    "KSA eSIM",
    "Saudi mobile data",
    "prepaid eSIM Saudi Arabia",
    "instant eSIM activation",
    "travel eSIM",
    "digital SIM card",
    "virtual SIM",
    "international roaming",
    "pilgrimage mobile data",
    "Umrah connectivity",
    "eSIM Saudi Arabia",
    "Saudi Arabia travel SIM",
    "Umrah internet",
    "Hajj internet",
    "Makkah internet",
    "Madinah internet",
    "Saudi Arabia data plan",
    "eSIM for Umrah",
    "eSIM for Hajj",
    "Saudi Arabia roaming",
    "best eSIM Saudi Arabia",
    "cheap eSIM Saudi Arabia",
    "instant activation eSIM",
    "no contract eSIM",
    "prepaid data Saudi Arabia"
  ],
  authors: [{ name: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM" }],
  creator: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM",
  publisher: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  applicationName: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Better for notched devices
    title: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM",
    startupImage: [
      {
        url: "/android/android-launchericon-512-512.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  ...(process.env.NEXT_PUBLIC_IOS_APP_ID && {
    itunes: {
      appId: process.env.NEXT_PUBLIC_IOS_APP_ID,
    },
  }),
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: '/',
    siteName: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM",
    title: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM - Stay Connected During Your Umrah Journey",
    description: "Instant eSIM activation for Saudi Arabia. Get high-speed mobile data for your Umrah and Hajj pilgrimage. No physical SIM needed, activate in seconds.",
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM - Stay Connected During Your Umrah Journey",
    description: "Instant eSIM activation for Saudi Arabia. Get high-speed mobile data for your Umrah and Hajj pilgrimage.",
    images: ['/icons/icon-512.png'],
    creator: '@umrahesim',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Allow zoom for accessibility
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c4a6e" }
  ],
  viewportFit: "cover", // Ensures content extends into safe areas on notched devices
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM";
  const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                            !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk');
  
  const content = (
    <html lang="en">
        <head>
          {/* Structured Data for SEO */}
          <StructuredData type="organization" />
          <StructuredData type="website" />
          <StructuredData type="service" />
          
          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://api.zendit.io" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          
          {/* Preload critical resources */}
          <link rel="preload" href="/kaaba-herop.jpg" as="image" type="image/jpeg" />
          <link rel="preload" href="/icons/icon-512.png" as="image" type="image/png" />
          
          {/* Theme Color */}
          <meta name="theme-color" content="#0ea5e9" />
          <meta name="theme-color" media="(prefers-color-scheme: light)" content="#0ea5e9" />
          <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0c4a6e" />
          
          {/* Apple Touch Icons */}
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192.png" />
          
          {/* Apple Splash Screens */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={brandName} />
          
          {/* Microsoft Tiles */}
          <meta name="msapplication-TileColor" content="#0ea5e9" />
          <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          
          {/* Mobile Optimization */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors overflow-x-hidden`}
          style={{ position: 'relative' }}
        >
          <Navbar brandName={brandName} isClerkConfigured={!!isClerkConfigured} />
          <PWAInstallPrompt />
          <ServiceWorkerRegistration />
          <main className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4.5rem)] w-full overflow-x-hidden relative z-0">{children}</main>
        </body>
      </html>
  );

  // Wrap with providers
  const wrappedContent = (
    <CurrencyProvider>
      {isClerkConfigured ? <ClerkProvider>{content}</ClerkProvider> : content}
    </CurrencyProvider>
  );

  return wrappedContent;
}
