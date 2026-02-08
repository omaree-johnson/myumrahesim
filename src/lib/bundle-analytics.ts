/**
 * Bundle performance analytics: event hooks for view, select, and purchase.
 * No full analytics platform yet: events are buffered in memory (and optionally
 * logged) so you can see which bundles convert best. Add your analytics provider
 * in the "Future integration" section below.
 *
 * Usage (e.g. in browser console or a simple dashboard):
 *   import { getBundleConversionSummary, getBundleEventBuffer } from '@/lib/bundle-analytics';
 *   getBundleConversionSummary()  // { bySlug: { single: { views, selections, purchases, ... }, ... }, totalSectionViews, ... }
 *   getBundleEventBuffer()        // Raw events for export or debugging
 */

import type { BundleSlug } from "./bundle-config";

// -----------------------------------------------------------------------------
// Event types (for type-safe tracking and future analytics integration)
// -----------------------------------------------------------------------------

export type BundleAnalyticsEvent =
  | {
      event: "bundle_section_viewed";
      /** Slugs of bundles visible in the section (e.g. ["single", "couple", "family", "extended"]) */
      bundleSlugs: BundleSlug[];
      timestamp: number;
    }
  | {
      event: "bundle_selected";
      bundleSlug: BundleSlug;
      /** Optional: offerId added to cart for this bundle */
      offerId?: string;
      /** Optional: quantity (e.g. 2 for couple) */
      quantity?: number;
      timestamp: number;
    }
  | {
      event: "bundle_purchased";
      bundleSlug: BundleSlug;
      /** Optional: transaction ID once available */
      transactionId?: string;
      timestamp: number;
    };

// -----------------------------------------------------------------------------
// In-memory buffer (for dev/debug and simple conversion summary without a backend)
// -----------------------------------------------------------------------------

const MAX_BUFFER_SIZE = 500;
const eventBuffer: BundleAnalyticsEvent[] = [];

function pushToBuffer(ev: BundleAnalyticsEvent) {
  eventBuffer.push(ev);
  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.shift();
  }
}

// -----------------------------------------------------------------------------
// Public API: track bundle events
// -----------------------------------------------------------------------------

/**
 * Track a bundle analytics event. Call this from UI (bundle section, checkout, success).
 * Events are buffered in memory; add your analytics provider in trackBundleEventInternal.
 * Overloads allow correct typing when passing object literals for each event kind.
 */
export function trackBundleEvent(
  ev: Omit<Extract<BundleAnalyticsEvent, { event: "bundle_section_viewed" }>, "timestamp">
): void;
export function trackBundleEvent(
  ev: Omit<Extract<BundleAnalyticsEvent, { event: "bundle_selected" }>, "timestamp">
): void;
export function trackBundleEvent(
  ev: Omit<Extract<BundleAnalyticsEvent, { event: "bundle_purchased" }>, "timestamp">
): void;
export function trackBundleEvent(ev: Omit<BundleAnalyticsEvent, "timestamp">) {
  const withTimestamp: BundleAnalyticsEvent = {
    ...ev,
    timestamp: Date.now(),
  } as BundleAnalyticsEvent;

  pushToBuffer(withTimestamp);
  trackBundleEventInternal(withTimestamp);

  // Dev: optional console output (strip in production if desired)
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
    console.debug("[Bundle Analytics]", withTimestamp.event, withTimestamp);
  }
}

/**
 * Internal dispatch: today we only buffer + optional console.
 * Future: send to Segment, GA4, PostHog, Mixpanel, etc.
 *
 * Example future integration:
 *   if (typeof window !== 'undefined' && window.analytics?.track) {
 *     window.analytics.track('bundle_event', { ...ev, event: ev.event });
 *   }
 *   if (typeof window !== 'undefined' && window.gtag) {
 *     window.gtag('event', 'bundle_' + ev.event, { bundle_slug: 'bundleSlug' in ev ? ev.bundleSlug : undefined });
 *   }
 */
function trackBundleEventInternal(ev: BundleAnalyticsEvent) {
  // Placeholder for future analytics integration (no-op for now)
  void ev;
}

// -----------------------------------------------------------------------------
// Conversion summary (which bundles convert best)
// -----------------------------------------------------------------------------

export interface BundleConversionSummary {
  bySlug: Record<
    string,
    { views: number; selections: number; purchases: number; viewToSelectRate: number; selectToPurchaseRate: number }
  >;
  totalSectionViews: number;
  totalSelections: number;
  totalPurchases: number;
}

/**
 * Compute conversion summary from buffered events. Use for dashboards or debugging.
 * Section view is counted once per "bundle_section_viewed"; selections and purchases
 * are counted per slug.
 */
export function getBundleConversionSummary(): BundleConversionSummary {
  const bySlug: Record<string, { views: number; selections: number; purchases: number }> = {};
  let totalSectionViews = 0;
  let totalSelections = 0;
  let totalPurchases = 0;

  for (const ev of eventBuffer) {
    if (ev.event === "bundle_section_viewed") {
      totalSectionViews += 1;
      for (const slug of ev.bundleSlugs) {
        bySlug[slug] = bySlug[slug] || { views: 0, selections: 0, purchases: 0 };
        bySlug[slug].views += 1;
      }
    } else if (ev.event === "bundle_selected") {
      totalSelections += 1;
      bySlug[ev.bundleSlug] = bySlug[ev.bundleSlug] || { views: 0, selections: 0, purchases: 0 };
      bySlug[ev.bundleSlug].selections += 1;
    } else if (ev.event === "bundle_purchased") {
      totalPurchases += 1;
      bySlug[ev.bundleSlug] = bySlug[ev.bundleSlug] || { views: 0, selections: 0, purchases: 0 };
      bySlug[ev.bundleSlug].purchases += 1;
    }
  }

  const result: BundleConversionSummary["bySlug"] = {};
  for (const [slug, counts] of Object.entries(bySlug)) {
    result[slug] = {
      ...counts,
      viewToSelectRate: counts.views > 0 ? counts.selections / counts.views : 0,
      selectToPurchaseRate: counts.selections > 0 ? counts.purchases / counts.selections : 0,
    };
  }

  return {
    bySlug: result,
    totalSectionViews,
    totalSelections,
    totalPurchases,
  };
}

/**
 * Return recent raw events (e.g. for debugging or exporting to an analytics platform).
 */
export function getBundleEventBuffer(): readonly BundleAnalyticsEvent[] {
  return eventBuffer;
}
