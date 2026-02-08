import type { Metadata } from "next";
import { seoConfig, getCanonicalUrl } from "@/lib/seoConfig";

export interface SeoLandingMeta {
  title: string;
  description: string;
  /** Path without leading slash, e.g. "saudi-arabia-esim-umrah" */
  canonicalPath: string;
  keywords?: string[];
  ogImage?: string;
}

export interface SeoLandingSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface SeoLandingFaqItem {
  question: string;
  answer: string;
}

export interface SeoLandingInternalLink {
  label: string;
  href: string;
}

export interface SeoLandingConfig {
  /** Optional: only needed if the template uses it. Prefer generateSeoLandingMetadata() in the page. */
  meta?: SeoLandingMeta;
  h1: string;
  intro: React.ReactNode;
  sections: SeoLandingSection[];
  faq: SeoLandingFaqItem[];
  /** Breadcrumb label (e.g. "Saudi Arabia eSIM for Umrah") */
  breadcrumbLabel: string;
  /** Default: [{ label: "View eSIM plans", href: "/plans" }] */
  internalLinks?: SeoLandingInternalLink[];
}

const DEFAULT_INTERNAL_LINKS: SeoLandingInternalLink[] = [
  { label: "View eSIM plans", href: "/plans" },
  { label: "FAQ", href: "/faq" },
];

/**
 * Generate Next.js metadata for an SEO landing page.
 * Use in page generateMetadata() or export const metadata.
 */
export function generateSeoLandingMetadata(meta: SeoLandingMeta): Metadata {
  const canonicalUrl = getCanonicalUrl(`/${meta.canonicalPath}`);
  const ogImage = meta.ogImage ?? seoConfig.defaultOgImage;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${seoConfig.baseUrl}${ogImage}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      url: canonicalUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    alternates: { canonical: canonicalUrl },
  };
}
