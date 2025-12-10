import { getEsimProducts } from "@/lib/esimaccess";
import { PlansPageClient } from "@/components/plans-page-client";
import { Suspense } from "react";
import type { Metadata } from 'next';

// Dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate metadata dynamically to include accurate pricing
export async function generateMetadata(): Promise<Metadata> {
  const products = await getProducts();
  const lowestPrice = products.length > 0 && products[0].price?.display 
    ? products[0].price.display 
    : "£17.39";
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com';
  
  return {
    title: "eSIM Plans for Saudi Arabia - Best eSIM for Umrah & Hajj | Umrah eSIM",
    description: `Browse affordable eSIM data plans for Saudi Arabia. High-speed 5G/4G mobile data for Makkah, Madinah, Jeddah, and throughout Saudi Arabia. Instant activation, no physical SIM needed. Perfect for Umrah and Hajj pilgrims. Plans starting from ${lowestPrice}.`,
    keywords: [
      "eSIM plans Saudi Arabia",
      "eSIM for Umrah",
      "eSIM for Hajj",
      "Saudi Arabia eSIM plans",
      "Makkah eSIM",
      "Madinah eSIM",
      "best eSIM Saudi Arabia",
      "cheap eSIM Saudi Arabia",
      "prepaid eSIM Saudi Arabia",
      "instant eSIM activation",
      "Umrah eSIM plans",
      "Hajj eSIM plans",
      "Saudi Arabia mobile data",
      "eSIM coverage Saudi Arabia",
    ],
    openGraph: {
      title: "eSIM Plans for Saudi Arabia - Best eSIM for Umrah & Hajj",
      description: `Instant eSIM data plans for your Umrah and Hajj journey. High-speed 5G/4G connectivity in Makkah, Madinah, and throughout Saudi Arabia. Plans starting from ${lowestPrice}.`,
      type: "website",
      url: `${baseUrl}/plans`,
      images: [
        {
          url: '/kaaba-herop.jpg',
          width: 1200,
          height: 630,
          alt: 'eSIM Plans for Saudi Arabia - Stay connected during Umrah and Hajj',
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "eSIM Plans for Saudi Arabia - Best eSIM for Umrah & Hajj",
      description: `Instant eSIM data plans for your Umrah and Hajj journey. High-speed 5G/4G connectivity in Makkah and Madinah.`,
      images: ['/kaaba-herop.jpg'],
    },
    alternates: {
      canonical: `${baseUrl}/plans`,
    },
  };
}

// Provider package structure
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
    // STRICT FILTER: Only Saudi Arabia (SA) eSIMs
    // This app only shows Saudi Arabia-specific plans, excluding:
    // - Multi-country packages (Gulf region, Asia, etc.)
    // - Regional packages that include SA but also other countries
    const data = await getEsimProducts("SA");
    
    if (Array.isArray(data) && data.length > 0) {
      // Additional frontend filtering for extra safety
      // Since getEsimProducts already filters for SA-only packages, this is a double-check
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
          return false; // Not SA
        }

        // Check location field - reject if it's a multi-country list
        const locationStr = offer.location?.toString().trim().toUpperCase() || "";
        if (locationStr.includes(",")) {
          return false; // Multi-country package
        }
        
        // If location is specified and not SA, reject
        if (locationStr && locationStr !== "SA") {
          return false;
        }

        // All checks passed - this is a Saudi Arabia package
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

export default async function PlansPage() {
  const allProducts = await getProducts();

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Loading plans...</p>
        </div>
      </div>
    }>
      <PlansPageClient products={allProducts} />
    </Suspense>
  );
}
