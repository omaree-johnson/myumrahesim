import { HeroSection } from "@/components/hero-section";
import Footer from "@/components/footer";
import { SeoContent } from "@/components/seo-content";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "My Umrah eSIM - Instant Mobile Data for Saudi Arabia | Stay Connected During Umrah & Hajj",
  description: "Get instant eSIM activation for your Umrah and Hajj journey in Saudi Arabia. High-speed 5G/4G mobile data plans for Makkah, Madinah, and all of Saudi Arabia. No physical SIM card needed. Affordable prepaid data starting from £17.39. Activate in seconds with instant QR code delivery. Best eSIM for Umrah pilgrims.",
  keywords: [
    "Umrah eSIM",
    "Hajj eSIM",
    "Saudi Arabia eSIM",
    "Makkah eSIM",
    "Madinah eSIM",
    "instant eSIM activation",
    "best eSIM Saudi Arabia",
    "cheap eSIM Saudi Arabia",
    "eSIM for Umrah",
    "eSIM for Hajj",
    "Saudi Arabia mobile data",
    "prepaid eSIM Saudi Arabia"
  ],
  openGraph: {
    title: "My Umrah eSIM - Stay Connected During Your Umrah Journey",
    description: "Instant eSIM activation for Saudi Arabia. High-speed 5G/4G data for Makkah and Madinah. No physical SIM needed. Activate in seconds.",
    type: "website",
    url: "/",
    images: [
      {
        url: '/kaaba-herop.jpg',
        width: 1200,
        height: 630,
        alt: 'Kaaba in Makkah - Stay connected with eSIM during your Umrah journey',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My Umrah eSIM - Instant Mobile Data for Saudi Arabia",
    description: "Get instant eSIM activation for your Umrah journey. High-speed data for Makkah and Madinah.",
    images: ['/kaaba-herop.jpg'],
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <SeoContent />
      <Footer />
    </>
  );
}
