import { HeroSection } from "@/components/hero-section";
import Footer from "@/components/footer";
import { SeoContent } from "@/components/seo-content";
import { TrustBadges } from "@/components/trust-badges";
import { StructuredData } from "@/components/structured-data";
import { ConversionBoost } from "@/components/conversion-boost";
import { ReviewsSection } from "@/components/reviews-section";
import { FeaturedPlans } from "@/components/featured-plans";
import { ComparisonTable } from "@/components/comparison-table";
import { getLowestPrice } from "@/lib/pricing";
import { getEsimProducts } from "@/lib/esimaccess";
import type { Metadata } from 'next';

// Generate metadata dynamically to include accurate pricing
export async function generateMetadata(): Promise<Metadata> {
  const lowestPrice = await getLowestPrice();
  const priceText = lowestPrice?.formatted || "£17.39";
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  return {
    title: "Best eSIM for Umrah & Hajj | Instant Activation",
    description: `Best eSIM for Umrah and Hajj. Instant activation, reliable coverage in Makkah and Madinah. Plans from ${priceText}. No physical SIM needed.`,
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
      canonical: `${baseUrl}/`,
    },
  };
}

// Provider package structure (matching plans page)
interface ProviderPackage {
  offerId: string;
  costPrice?: {
    fixed: number;
    currency: string;
    currencyDivisor: number;
  };
  profitMargin?: number;
  packageCode: string;
  slug: string;
  shortNotes: string;
  notes: string;
  name: string;
  country: string;
  location: string;
  brandName: string;
  durationDays: number;
  dataGB: number;
  dataUnlimited: boolean;
  price: {
    fixed: number;
    currency: string;
    currencyDivisor: number;
  };
  enabled: boolean;
}

interface EsimProduct {
  id: string;
  name?: string;
  title?: string;
  providerLabel?: string;
  description?: string;
  price?: {
    display?: string;
    amount?: number;
    currency?: string;
  };
  data?: string;
  validity?: string;
  dataGB?: number;
  durationDays?: number;
  dataUnlimited?: boolean;
}

function buildTitle(offer: ProviderPackage, normalizedDataGB?: number) {
  const dataLabel = offer.dataUnlimited
    ? "Unlimited Data"
    : normalizedDataGB
    ? `${normalizedDataGB < 1 ? normalizedDataGB.toFixed(1) : normalizedDataGB.toFixed(0)}GB Data`
    : "High-speed Data";

  const hasDuration = typeof offer.durationDays === "number" && offer.durationDays > 0;
  const durationLabel = hasDuration
    ? `${offer.durationDays}-Day`
    : "Flexible Duration";

  return `${dataLabel} • ${durationLabel} • Saudi Arabia`;
}

async function getProducts(): Promise<EsimProduct[]> {
  try {
    const data = await getEsimProducts("SA");
    
    if (Array.isArray(data) && data.length > 0) {
      const filtered = data.filter((offer: ProviderPackage) => {
        const hasValidPrice = offer.price && offer.price.fixed !== undefined && offer.enabled;
        if (!hasValidPrice) return false;

        // Filter out 1-day plans - only show 7-day and 30-day plans
        if (offer.durationDays === 1) {
          return false;
        }

        // Check country field (should be SA from API filter)
        const normalizedCountry = offer.country?.trim().toUpperCase();
        if (normalizedCountry && normalizedCountry !== "SA") {
          return false;
        }

        // Check location field - reject if it's a multi-country list
        const locationStr = offer.location?.toString().trim().toUpperCase() || "";
        if (locationStr.includes(",")) {
          return false;
        }
        
        if (locationStr && locationStr !== "SA") {
          return false;
        }

        return true;
      });
      
      const buildDescription = (offer: ProviderPackage, normalizedDataGB?: number) => {
        const hasDataValue = typeof normalizedDataGB === "number";
        const formattedData = hasDataValue
          ? `${normalizedDataGB < 1 ? normalizedDataGB.toFixed(1) : normalizedDataGB.toFixed(0)}GB`
          : "High-speed data";

        const gbLabel = offer.dataUnlimited ? "Unlimited data" : `${formattedData} of high-speed data`;

        const hasDuration = typeof offer.durationDays === "number" && offer.durationDays > 0;
        const daysLabel = hasDuration
          ? `${offer.durationDays} day${offer.durationDays !== 1 ? "s" : ""}`
          : "flexible validity";

        return `${gbLabel} for ${daysLabel}. Ideal for pilgrims needing instant LTE/5G access across Makkah and Madinah. Activate via QR code immediately—no physical SIM required.`;
      };

      const products = filtered.map((offer: ProviderPackage) => {
        const divisor = offer.price.currencyDivisor || 100;
        const actualPrice = offer.price.fixed / divisor;
        const normalizedDataGB =
          typeof offer.dataGB === "number" && offer.dataGB > 0 ? offer.dataGB : undefined;
        const providerLabel = offer.shortNotes || offer.name || offer.brandName;
        
        return {
          id: offer.offerId || offer.packageCode || offer.slug,
          name: providerLabel,
          providerLabel,
          title: buildTitle(offer, normalizedDataGB),
          description: buildDescription(offer, normalizedDataGB),
          price: {
            display: `${offer.price.currency} ${actualPrice.toFixed(2)}`,
            amount: actualPrice,
            currency: offer.price.currency,
          },
          data: offer.dataUnlimited
            ? "Unlimited"
            : normalizedDataGB
            ? `${normalizedDataGB < 1 ? normalizedDataGB.toFixed(1) : Math.round(normalizedDataGB)}GB`
            : undefined,
          validity: offer.durationDays > 0 
            ? `${offer.durationDays} day${offer.durationDays !== 1 ? "s" : ""}`
            : "Flexible validity",
          dataGB: normalizedDataGB,
          durationDays: offer.durationDays,
          dataUnlimited: offer.dataUnlimited,
        };
      });
      
      return products.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  // Note: Hreflang tags are not needed as this is a single-language site (English only)
  // If you add Arabic or other language versions in the future, add hreflang tags here
  
  // Fetch the lowest price dynamically
  const lowestPrice = await getLowestPrice();
  const priceDisplay = lowestPrice?.formatted || "£17.39"; // Fallback if API fails
  
  // Fetch products for featured plans
  const products = await getProducts();
  
  return (
    <>
      {/* Organization Schema with Aggregate Rating */}
      <StructuredData type="organization" />
      
      {/* Review Schema for SEO */}
      <StructuredData 
        type="review" 
        data={{
          productName: "eSIM for Umrah and Hajj",
          rating: 4.8,
          reviewCount: 150,
        }} 
      />
      
      {/* Article structured data for AI search optimization */}
      <StructuredData type="article" data={{
        headline: "Best eSIM for Umrah: Complete Guide to Mobile Data in Saudi Arabia",
        description: "Complete guide to choosing and activating the best eSIM for your Umrah journey. Learn about eSIM plans for Saudi Arabia, coverage in Makkah and Madinah, pricing, and step-by-step activation instructions.",
        image: `${baseUrl}/kaaba-herop.jpg`,
        url: baseUrl,
        datePublished: "2025-01-01",
        dateModified: new Date().toISOString().split('T')[0],
        author: {
          name: "My Umrah eSIM Team",
          url: baseUrl,
        },
        articleBody: `Get the best eSIM for Umrah and Hajj with instant activation and reliable coverage in Makkah and Madinah. Our eSIM plans for Saudi Arabia offer high-speed 5G/4G mobile data starting from ${priceDisplay}. No physical SIM card needed - activate instantly via QR code. Perfect for Umrah pilgrims who need reliable internet during their spiritual journey. Coverage includes Makkah, Madinah, Jeddah, and throughout Saudi Arabia.`,
      }} />
      
      {/* QAPage schema for AI search engines - Key Questions */}
      <StructuredData type="qapage" data={{
        mainEntity: {
          question: "What is the best eSIM for Umrah?",
          answer: `The best eSIM for Umrah is My Umrah eSIM, offering instant activation, reliable coverage in Makkah and Madinah, and affordable pricing starting from ${priceDisplay}. Our eSIM plans provide high-speed 5G/4G mobile data throughout Saudi Arabia, instant QR code delivery, and no physical SIM card needed. Perfect for Umrah and Hajj pilgrims.`,
          answers: [
            {
              text: `The best eSIM for Umrah provides instant activation, reliable coverage in Makkah and Madinah, and affordable pricing. My Umrah eSIM offers plans starting from ${priceDisplay} with high-speed 5G/4G data, instant QR code delivery, and coverage throughout Saudi Arabia.`,
              dateCreated: new Date().toISOString(),
            }
          ],
        },
      }} />
      
      <StructuredData type="qapage" data={{
        mainEntity: {
          question: "How do I get an eSIM for Umrah?",
          answer: `To get an eSIM for Umrah: 1) Visit our website and choose a data plan, 2) Complete the secure checkout, 3) Receive your QR code instantly via email, 4) Scan the QR code on your smartphone when you arrive in Saudi Arabia, 5) Enable data roaming and start using your eSIM. The entire process takes just minutes.`,
        },
      }} />
      
      <StructuredData type="qapage" data={{
        mainEntity: {
          question: "How much does an eSIM for Umrah cost?",
          answer: `eSIM plans for Umrah start from ${priceDisplay} and vary based on data allowance and validity period. We offer plans ranging from 3GB to unlimited data, with validity periods from 7 days to 30 days. All plans are prepaid with no hidden fees, no contracts, and no credit checks.`,
        },
      }} />
      
      <HeroSection lowestPrice={priceDisplay} />
      <FeaturedPlans products={products} />
      <ComparisonTable lowestPrice={priceDisplay} />
      <ConversionBoost lowestPrice={priceDisplay} />
      <TrustBadges />
      <ReviewsSection />
      <Footer />
    </>
  );
}
