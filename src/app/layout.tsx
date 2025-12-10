import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { StructuredData } from "@/components/structured-data";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { CurrencyProvider } from "@/components/currency-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
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
  description: process.env.NEXT_PUBLIC_TAGLINE || "The best eSIM for Umrah and Hajj. Get instant mobile data activation for Saudi Arabia. High-speed 4G/5G coverage in Makkah, Madinah, and throughout Saudi Arabia. No physical SIM card needed. Affordable prepaid plans starting from £17.39. Perfect for Umrah pilgrims who need reliable internet during their spiritual journey.",
  keywords: [
    // Primary Keywords (Target #1)
    "eSIM for Umrah",
    "eSIM for Saudi Arabia",
    "eSIM for Hajj",
    "best eSIM Saudi Arabia",
    "Umrah eSIM",
    "Hajj eSIM",
    // Secondary Keywords (Target top 3)
    "cheap eSIM Saudi Arabia",
    "Saudi Arabia eSIM plans",
    "eSIM Makkah",
    "eSIM Madinah",
    "instant eSIM Saudi Arabia",
    "prepaid eSIM Saudi Arabia",
    "best eSIM for Umrah",
    "best eSIM for Hajj",
    // Long-tail Keywords (Target top 5)
    "how to get eSIM for Umrah",
    "best eSIM for Umrah pilgrims",
    "eSIM activation Saudi Arabia",
    "eSIM coverage Makkah Madinah",
    "cheapest eSIM Saudi Arabia",
    "eSIM plans for Umrah",
    "eSIM plans for Hajj",
    // Additional SEO Keywords
    "KSA eSIM",
    "Saudi mobile data",
    "instant eSIM activation",
    "travel eSIM",
    "digital SIM card",
    "virtual SIM",
    "international roaming",
    "pilgrimage mobile data",
    "Umrah connectivity",
    "Saudi Arabia travel SIM",
    "Umrah internet",
    "Hajj internet",
    "Makkah internet",
    "Madinah internet",
    "Saudi Arabia data plan",
    "Saudi Arabia roaming",
    "no contract eSIM",
    "prepaid data Saudi Arabia",
    "eSIM Umrah travel",
    "digital SIM for Umrah",
    "Umrah eSIM plans",
    "Hajj eSIM plans",
    "eSIM Makkah Madinah",
    "Umrah mobile data",
    "Hajj mobile data",
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
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com',
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
            url: '/myumrahesim-logo.png',
            width: 1200,
            height: 630,
            alt: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM Logo",
          },
        ],
  },
  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_BRAND_NAME || "My Umrah eSIM - Stay Connected During Your Umrah Journey",
    description: "Instant eSIM activation for Saudi Arabia. Get high-speed mobile data for your Umrah and Hajj pilgrimage.",
    images: ['/myumrahesim-logo.png'],
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
    <html lang="en" suppressHydrationWarning>
        <head>
          <ThemeScript />
          {/* Structured Data for SEO and AI Search */}
          <StructuredData type="organization" />
          <StructuredData type="website" />
          <StructuredData type="service" />
          <StructuredData type="howto" data={{
            name: "How to Get and Activate eSIM for Umrah",
            description: "Complete step-by-step guide to getting and activating an eSIM for your Umrah journey in Saudi Arabia",
            steps: [
              {
                '@type': 'HowToStep',
                position: 1,
                name: 'Choose Your eSIM Plan',
                text: 'Visit our website and browse eSIM plans for Saudi Arabia. Select a plan based on your data needs and travel duration for Umrah or Hajj.',
                url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com'}/plans`
              },
              {
                '@type': 'HowToStep',
                position: 2,
                name: 'Complete Purchase',
                text: 'Add your email address and complete the secure payment. You will receive an order confirmation email immediately.',
              },
              {
                '@type': 'HowToStep',
                position: 3,
                name: 'Receive QR Code',
                text: 'Within minutes, you will receive an activation email with a QR code. This QR code contains your eSIM profile for Saudi Arabia.',
              },
              {
                '@type': 'HowToStep',
                position: 4,
                name: 'Scan QR Code on Your Phone',
                text: 'On iPhone: Go to Settings > Cellular > Add Cellular Plan, then scan the QR code. On Android: Go to Settings > Connections > SIM card manager > Add mobile plan, then scan the QR code.',
              },
              {
                '@type': 'HowToStep',
                position: 5,
                name: 'Activate When You Arrive',
                text: 'When you arrive in Saudi Arabia, enable data roaming in your phone settings and select the eSIM for mobile data. Your eSIM will connect to local Saudi networks automatically.',
              }
            ]
          }} />
          
          {/* Favicon - using public directory to avoid Next.js image processing */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          
          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://api.esimaccess.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          
          {/* Google tag (gtag.js) for Google Ads conversion tracking */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-872734372"
            strategy="afterInteractive"
          />
          <Script
            id="google-ads-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-872734372');
              `,
            }}
          />
          
          {/* Preload critical resources */}
          <link rel="preload" href="/kaaba-herop.jpg" as="image" type="image/jpeg" />
          <link rel="preload" href="/myumrahesim-logo.svg" as="image" type="image/svg+xml" />
          
          {/* Theme Color */}
          <meta name="theme-color" content="#0ea5e9" />
          <meta name="theme-color" media="(prefers-color-scheme: light)" content="#0ea5e9" />
          <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0c4a6e" />
          
          {/* Apple Touch Icons */}
          <link rel="apple-touch-icon" href="/android/android-launchericon-192-192.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/ios/152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/ios/180.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/ios/167.png" />
          
          {/* Apple Splash Screens */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={brandName} />
          
          {/* Microsoft Tiles */}
          <meta name="msapplication-TileColor" content="#0ea5e9" />
          <meta name="msapplication-TileImage" content="/android/android-launchericon-144-144.png" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          
          {/* Mobile Optimization */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="format-detection" content="telephone=no" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors overflow-x-hidden`}
          style={{ position: 'relative' }}
        >
          {/* Meta Pixel base code */}
          {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
            <>
              <Script
                id="facebook-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
                    fbq('track', 'PageView');
                  `,
                }}
              />
              {/* Noscript fallback for users with JavaScript disabled */}
              <noscript>
                <img
                  height="1"
                  width="1"
                  style={{ display: 'none' }}
                  src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
                  alt=""
                />
              </noscript>
            </>
          )}
          
          <Navbar brandName={brandName} isClerkConfigured={!!isClerkConfigured} />
          <PWAInstallPrompt />
          <ServiceWorkerRegistration />
          <main className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4.5rem)] w-full overflow-x-hidden relative z-0">{children}</main>
        </body>
      </html>
  );

  // Wrap with providers
  const wrappedContent = (
    <ThemeProvider>
      <CurrencyProvider>
        {isClerkConfigured ? <ClerkProvider>{content}</ClerkProvider> : content}
      </CurrencyProvider>
    </ThemeProvider>
  );

  return wrappedContent;
}
