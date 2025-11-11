import { getEsimProducts } from "@/lib/zendit";
import { PlansPageClient } from "@/components/plans-page-client";
import { Suspense } from "react";
import type { Metadata } from 'next';

// Force static generation for prerendering
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "eSIM Plans - Umrah eSIM | Saudi Arabia Mobile Data Plans",
  description: "Browse affordable eSIM data plans for Saudi Arabia. High-speed 5G mobile data for Makkah and Madinah. Instant activation, no physical SIM needed. Plans starting from £17.39.",
  openGraph: {
    title: "eSIM Plans for Saudi Arabia - Umrah eSIM",
    description: "Instant eSIM data plans for your Umrah journey. High-speed 5G connectivity in Makkah and Madinah.",
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

// Zendit API response structure
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
    const data = await getEsimProducts("SA");
    
    if (Array.isArray(data) && data.length > 0) {
      const filtered = data.filter((offer: ZenditOffer) => {
        return offer.price && offer.price.fixed !== undefined;
      });
      
      const products = filtered.map((offer: ZenditOffer) => {
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

  const uniqueDurations = [...new Set(allProducts.map(p => p.durationDays).filter((d): d is number => d !== undefined))].sort((a, b) => a - b);
  const hasUnlimited = allProducts.some(p => p.dataUnlimited);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Loading plans...</p>
        </div>
      </div>
    }>
      <PlansPageClient 
        products={allProducts}
        uniqueDurations={uniqueDurations}
        hasUnlimited={hasUnlimited}
      />
    </Suspense>
  );
}
