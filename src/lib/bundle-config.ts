/**
 * Bundle plan configuration for Umrah/Hajj eSIM.
 * Bundles are built from existing products: we select a base product and quantity.
 * No separate pricing logic: cart/API uses existing offerId + quantity; volume discount applies.
 * Extend by adding more bundle types or fields (e.g. custom discount per bundle) here.
 */

export type BundleSlug = "single" | "couple" | "family" | "extended";

export interface BundleDefinition {
  slug: BundleSlug;
  /** UI label, e.g. "Single traveller" */
  label: string;
  /** Number of eSIMs (devices) in the bundle */
  devices: number;
  /** "Most Popular" badge; only one should be true */
  mostPopular: boolean;
  /** Short copy for "Ideal for …" / "Best for …" */
  bestFor: string;
  /** If true, we pick a 30-day product; otherwise 14-day (or first available). */
  extendedValidity: boolean;
}

/** Static bundle definitions. Product selection is done in the UI from available products. */
export const BUNDLE_DEFINITIONS: BundleDefinition[] = [
  {
    slug: "single",
    label: "Single traveller",
    devices: 1,
    mostPopular: false,
    bestFor: "Solo pilgrims",
    extendedValidity: false,
  },
  {
    slug: "couple",
    label: "Couple",
    devices: 2,
    mostPopular: true,
    bestFor: "Two people travelling together",
    extendedValidity: false,
  },
  {
    slug: "family",
    label: "Family / group",
    devices: 5,
    mostPopular: false,
    bestFor: "Families or groups of 3–5",
    extendedValidity: false,
  },
  {
    slug: "extended",
    label: "Extended stay",
    devices: 1,
    mostPopular: false,
    bestFor: "Longer trips (e.g. 30 days)",
    extendedValidity: true,
  },
];

/**
 * Resolve which product to use for a bundle.
 * All bundles use 10GB plans: standard (Single/Couple/Family) use 7–14 day 10GB; Extended uses 30-day 10GB.
 * Falls back to highest data in pool if no 10GB is available.
 */
export function pickProductForBundle(
  products: Array<{
    id: string;
    dataGB?: number;
    durationDays?: number;
    price?: { display?: string; amount?: number; currency?: string };
    data?: string;
    validity?: string;
  }>,
  extendedValidity: boolean
): { id: string; priceDisplay: string; data?: string; validity?: string } | null {
  if (!products?.length) return null;
  const sorted = [...products].sort((a, b) => (b.durationDays ?? 0) - (a.durationDays ?? 0));
  const pool = extendedValidity
    ? sorted.filter((p) => (p.durationDays ?? 0) >= 14)
    : sorted.filter((p) => (p.durationDays ?? 0) >= 7 && (p.durationDays ?? 0) <= 14);
  const usePool = pool.length ? pool : sorted;
  // Prefer 10GB (9–11 GB) for all bundles; else highest data in pool
  const preferred =
    usePool.find((p) => p.dataGB && p.dataGB >= 9 && p.dataGB <= 11) ||
    [...usePool].sort((a, b) => (b.dataGB ?? 0) - (a.dataGB ?? 0))[0];
  if (!preferred) return null;
  const priceDisplay = preferred.price?.display ?? "";
  return {
    id: preferred.id,
    priceDisplay,
    data: preferred.data,
    validity: preferred.validity,
  };
}

/**
 * Approximate savings label from volume discount (5% off $30+, 10% off $70+).
 * Actual discount applied at checkout; this is for display only.
 */
export function getSavingsLabel(
  _unitPrice: number,
  quantity: number,
  totalRaw: number,
  _currency: string
): string | null {
  if (quantity <= 1 || totalRaw <= 0) return null;
  if (totalRaw >= 70) return "Save ~10% at checkout";
  if (totalRaw >= 30) return "Save ~5% at checkout";
  return null;
}
