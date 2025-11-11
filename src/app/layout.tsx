import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { StructuredData } from "@/components/structured-data";
import { MobileNav } from "@/components/mobile-nav";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
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
    "Umrah connectivity"
  ],
  authors: [{ name: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM" }],
  creator: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM",
  publisher: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM",
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
  applicationName: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Better for notched devices
    title: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM",
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
    siteName: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM",
    title: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM - Stay Connected During Your Umrah Journey",
    description: "Instant eSIM activation for Saudi Arabia. Get high-speed mobile data for your Umrah and Hajj pilgrimage. No physical SIM needed, activate in seconds.",
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM - Stay Connected During Your Umrah Journey",
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
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "eSIM Store";
  const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                            !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_clerk');
  
  const content = (
    <html lang="en">
        <head>
          {/* Structured Data for SEO */}
          <StructuredData type="organization" />
          <StructuredData type="website" />
          
          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://api.zendit.io" />
          
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
        >
          <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-800/95 shadow-sm transition-colors" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} role="banner">
            <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4 max-w-7xl">
              <div className="flex items-center justify-between">
                <a 
                  href="/" 
                  className="text-xl lg:text-2xl font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors" 
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  aria-label="Home - Umrah eSIM"
                >
                  {brandName}
                </a>
                
                {/* Desktop Navigation - Only show on large screens */}
                <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-10 text-base flex-1 mx-8" role="navigation" aria-label="Main navigation">
                  <a 
                    href="/blog" 
                    className="text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium whitespace-nowrap"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Blog
                  </a>
                  <a 
                    href="/plans" 
                    className="text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium whitespace-nowrap"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Plans
                  </a>
                  <a 
                    href="/faq" 
                    className="text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium whitespace-nowrap"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    FAQ
                  </a>
                  <a 
                    href="#support" 
                    className="text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium whitespace-nowrap"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Support
                  </a>
                </nav>
                
                {/* Desktop My Orders Button - Only show on large screens */}
                {isClerkConfigured && (
                  <a 
                    href="/orders" 
                    className="hidden lg:inline-block px-5 py-2.5 text-base font-medium text-white bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 rounded-lg transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    My Orders
                  </a>
                )}
                
                {/* Mobile Navigation - Show on small/medium screens */}
                <MobileNav brandName={brandName} isClerkConfigured={!!isClerkConfigured} />
              </div>
            </div>
          </header>
          <PWAInstallPrompt />
          <ServiceWorkerRegistration />
          <main className="min-h-[calc(100vh-80px)] w-full overflow-x-hidden">{children}</main>
        </body>
      </html>
  );

  return isClerkConfigured ? <ClerkProvider>{content}</ClerkProvider> : content;
}
