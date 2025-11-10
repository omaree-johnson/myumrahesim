import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { StructuredData } from "@/components/structured-data";
import Footer from "@/components/footer";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://umrahesim.com'),
  title: {
    default: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM - Stay Connected During Your Umrah Journey",
    template: `%s | ${process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM"}`,
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
    statusBarStyle: "default",
    title: process.env.NEXT_PUBLIC_BRAND_NAME || "Umrah eSIM",
  },
  formatDetection: {
    telephone: false,
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
  maximumScale: 1,
  userScalable: false,
  themeColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#0ea5e9",
  viewportFit: "cover",
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
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 min-h-screen`}
        >
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm" role="banner">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <a href="/" className="text-xl font-bold text-sky-600 hover:text-sky-700" aria-label="Home - Umrah eSIM">
                  {brandName}
                </a>
                <nav className="flex items-center justify-center gap-8 text-sm flex-1 mx-8" role="navigation" aria-label="Main navigation">
                  <a href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Blog
                  </a>
                  {isClerkConfigured && (
                    <>
                      <SignedIn>
                        <a href="/orders" className="text-gray-600 hover:text-gray-900 transition-colors">
                          My Orders
                        </a>
                      </SignedIn>
                    </>
                  )}
                  <a href="#support" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Support
                  </a>
                </nav>
                <div className="flex items-center gap-4">
                  {isClerkConfigured && (
                    <>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className="px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors" aria-label="Sign in to your account">
                            Sign In
                          </button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                      </SignedIn>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
          <PWAInstallPrompt />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
  );

  return isClerkConfigured ? <ClerkProvider>{content}</ClerkProvider> : content;
}
