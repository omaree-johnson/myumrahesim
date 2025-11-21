import { getEsimProducts } from "@/lib/esimcard";
import { PlansPageClient } from "@/components/plans-page-client";
import { Suspense } from "react";
import type { Metadata } from 'next';

// Dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "eSIM Plans - Umrah eSIM | Saudi Arabia Mobile Data Plans",
  description: "Browse affordable eSIM data plans for Saudi Arabia. High-speed 5G mobile data for Makkah and Madinah. Instant activation, no physical SIM needed. Plans starting from £17.39.",
  openGraph: {
    title: "eSIM Plans for Saudi Arabia - Umrah eSIM",
    description: "Instant eSIM data plans for your Umrah journey. High-speed 5G connectivity in Makkah and Madinah.",
    type: "website",
    images: [
      {
        url: '/android/android-launchericon-512-512.png',
        width: 512,
        height: 512,
        alt: 'Umrah eSIM Logo',
      },
    ],
  },
};

// Provider package structure
interface ProviderPackage {
  offerId: string;
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
    // Filter by Saudi Arabia (SA) or use location code
    const data = await getEsimProducts("SA");
    
    if (Array.isArray(data) && data.length > 0) {
      const filtered = data.filter((offer: ProviderPackage) => {
        const hasValidPrice = offer.price && offer.price.fixed !== undefined && offer.enabled;
        if (!hasValidPrice) return false;

        const locationCodes =
          offer.location?.split(',').map((code) => code.trim().toUpperCase()) || [];
        const normalizedCountry = offer.country?.trim().toUpperCase();
        const isStrictSaudi =
          normalizedCountry === "SA" &&
          locationCodes.length === 1 &&
          locationCodes[0] === "SA";

        return isStrictSaudi;
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
              ? `${normalizedDataGB}GB`
              : undefined,
          validity: `${offer.durationDays} day${offer.durationDays !== 1 ? "s" : ""}`,
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
