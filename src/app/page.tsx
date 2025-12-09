import { HeroSection } from "@/components/hero-section";
import Footer from "@/components/footer";
import { SeoContent } from "@/components/seo-content";
import { TrustBadges } from "@/components/trust-badges";
import { StructuredData } from "@/components/structured-data";
import { ConversionBoost } from "@/components/conversion-boost";
import { getLowestPrice } from "@/lib/pricing";
import type { Metadata } from 'next';

// Generate metadata dynamically to include accurate pricing
export async function generateMetadata(): Promise<Metadata> {
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  return {
    title: "Best eSIM for Umrah - Instant Mobile Data for Saudi Arabia | Umrah eSIM Plans",
    description: `Get the best eSIM for Umrah and Hajj. Instant activation, reliable coverage in Makkah and Madinah. High-speed 5G/4G mobile data plans for Saudi Arabia. No physical SIM card needed. Affordable prepaid data starting from ${priceText}. Activate in seconds with instant QR code delivery. Perfect for Umrah pilgrims who need reliable internet during their spiritual journey.`,
    keywords: [
      "eSIM for Umrah",
      "best eSIM for Umrah",
      "Umrah eSIM",
      "Hajj eSIM",
      "Saudi Arabia eSIM",
      "Makkah eSIM",
      "Madinah eSIM",
      "instant eSIM activation",
      "best eSIM Saudi Arabia",
      "cheap eSIM Saudi Arabia",
      "eSIM for Hajj",
      "Saudi Arabia mobile data",
      "prepaid eSIM Saudi Arabia",
      "how to get eSIM for Umrah",
      "eSIM Umrah travel",
      "digital SIM for Umrah",
      "Saudi Arabia eSIM plans",
      "Umrah internet connection",
      "Hajj mobile data",
      "eSIM Makkah Madinah"
    ],
    openGraph: {
      title: "Best eSIM for Umrah - Instant Mobile Data for Saudi Arabia",
      description: `Get the best eSIM for Umrah and Hajj. Instant activation, reliable coverage in Makkah and Madinah. High-speed 5G/4G mobile data plans starting from ${priceText}. No physical SIM card needed. Perfect for Umrah pilgrims.`,
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
      title: "Best eSIM for Umrah - Instant Mobile Data for Saudi Arabia",
      description: `Get the best eSIM for Umrah and Hajj. Instant activation, reliable coverage in Makkah and Madinah. High-speed 5G/4G data plans starting from ${priceText}.`,
      images: ['/kaaba-herop.jpg'],
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  // Fetch the lowest price dynamically
  const lowestPrice = await getLowestPrice();
  const priceDisplay = lowestPrice?.formatted || "£17.39"; // Fallback if API fails
  
  return (
    <>
      {/* Article structured data for AI search optimization */}
      <StructuredData type="article" data={{
        headline: "Best eSIM for Umrah: Complete Guide to Mobile Data in Saudi Arabia",
        description: "Complete guide to choosing and activating the best eSIM for your Umrah journey. Learn about eSIM plans for Saudi Arabia, coverage in Makkah and Madinah, pricing, and step-by-step activation instructions.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: baseUrl,
        datePublished: "2025-01-01",
        dateModified: new Date().toISOString().split('T')[0]
      }} />
      
      <HeroSection lowestPrice={priceDisplay} />
      <ConversionBoost lowestPrice={priceDisplay} />
      <TrustBadges />
      <Footer />
    </>
  );
}
