import { getEsimProducts } from "@/lib/zendit";
import { HomePageClient } from "@/components/home-page-client";
import { Suspense } from "react";
import type { Metadata } from 'next';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Umrah eSIM - Instant Mobile Data for Saudi Arabia | Stay Connected",
  description: "Get instant eSIM activation for your Umrah journey in Saudi Arabia. High-speed 5G mobile data plans for Makkah and Madinah. No physical SIM card needed. Affordable prepaid data starting from £17.39. Activate in seconds.",
  openGraph: {
    title: "Umrah eSIM - Stay Connected During Your Umrah Journey",
    description: "Instant eSIM activation for Saudi Arabia. High-speed 5G data for Makkah and Madinah. No physical SIM needed.",
    type: "website",
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Umrah eSIM Logo',
      },
    ],
  },
};

// Zendit API response structure (per official docs)
interface ZenditOffer {
  offerId: string;
  shortNotes: string;
  notes: string;
  country: string;
  brandName: string;
  durationDays: number;
  dataGB: number;
  dataUnlimited: boolean;
  price: {
    fixed: number;           // Price in smallest currency unit (e.g., cents)
    currency: string;        // e.g., "USD"
    currencyDivisor: number; // Divisor to get actual price (e.g., 100 for cents)
  };
  enabled: boolean;
}

interface EsimProduct {
  id: string;
  name?: string;
  title?: string;
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

async function getProducts(): Promise<EsimProduct[]> {
  try {
    // Call Zendit API directly from server component
    // Filter for Saudi Arabia eSIMs using country code "SA"
    const data = await getEsimProducts("SA");
    
    // Zendit API returns an array of offers
    if (Array.isArray(data) && data.length > 0) {
      console.log('[Debug] Total offers received:', data.length);
      console.log('[Debug] Sample offer:', data[0]);
      
      // Transform Zendit offers to our format
      const filtered = data.filter((offer: ZenditOffer) => {
        // Only show offers with valid price structure
        // Note: Removed 'enabled' check as test mode offers may be disabled
        return offer.price && 
               offer.price.fixed !== undefined;
      });
      
      console.log('[Debug] After filtering:', filtered.length);
      
      const products = filtered.map((offer: ZenditOffer) => {
        // Calculate actual price using currencyDivisor (default to 1 if not set)
        const divisor = offer.price.currencyDivisor || 1;
        const actualPrice = offer.price.fixed / divisor;
        
        return {
          id: offer.offerId,
          name: offer.shortNotes || offer.brandName,
          description: offer.notes,
          price: {
            display: `${offer.price.currency} ${actualPrice.toFixed(2)}`,
            amount: actualPrice,
            currency: offer.price.currency,
          },
          data: offer.dataUnlimited ? "Unlimited" : `${offer.dataGB}GB`,
          validity: `${offer.durationDays} day${offer.durationDays !== 1 ? "s" : ""}`,
          dataGB: offer.dataGB,
          durationDays: offer.durationDays,
          dataUnlimited: offer.dataUnlimited,
        };
      });
      
      // Sort by price (cheapest first)
      return products.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function Home() {
  const allProducts = await getProducts();

  // Get unique durations and data amounts for filters
  const uniqueDurations = [...new Set(allProducts.map(p => p.durationDays).filter((d): d is number => d !== undefined))].sort((a, b) => a - b);
  const hasUnlimited = allProducts.some(p => p.dataUnlimited);

  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <HomePageClient 
        products={allProducts}
        uniqueDurations={uniqueDurations}
        hasUnlimited={hasUnlimited}
      />
    </Suspense>
  );
}
