/**
 * Central SEO Configuration
 * 
 * This file provides a single source of truth for SEO-related configuration
 * across the application. Use this instead of hardcoding values or duplicating
 * environment variable access.
 */

export const seoConfig = {
  /**
   * Base URL of the site (with protocol, no trailing slash)
   * Used for canonical URLs, OpenGraph URLs, sitemap, etc.
   */
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com',
  
  /**
   * Site name / brand name
   * Used in titles, OpenGraph, structured data
   */
  siteName: process.env.NEXT_PUBLIC_BRAND_NAME || 'My Umrah eSIM',
  
  /**
   * Default site title template
   * Used in root layout metadata
   */
  defaultTitle: process.env.NEXT_PUBLIC_BRAND_NAME || 'My Umrah eSIM - Stay Connected During Your Umrah Journey',
  
  /**
   * Default site description
   * Used in root layout metadata and as fallback
   */
  defaultDescription: process.env.NEXT_PUBLIC_TAGLINE || 
    'The best eSIM for Umrah and Hajj. Get instant mobile data activation for Saudi Arabia. High-speed 4G/5G coverage in Makkah, Madinah, and throughout Saudi Arabia. No physical SIM card needed. Affordable prepaid plans starting from £17.39. Perfect for Umrah pilgrims who need reliable internet during their spiritual journey.',
  
  /**
   * Default OpenGraph image
   * Used when page-specific images aren't provided
   */
  defaultOgImage: '/kaaba-herop.jpg',
  
  /**
   * Default Twitter handle
   */
  twitterHandle: '@umrahesim',
  
  /**
   * Support email
   * Used in structured data and contact information
   */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com',
  
  /**
   * Site locale
   */
  locale: 'en_US',
  
  /**
   * Site language
   */
  language: 'en',
  
  /**
   * Default keywords (used in root layout)
   * Page-specific keywords should override these
   */
  defaultKeywords: [
    'eSIM for Umrah',
    'eSIM for Saudi Arabia',
    'eSIM for Hajj',
    'best eSIM Saudi Arabia',
    'Umrah eSIM',
    'Hajj eSIM',
    'cheap eSIM Saudi Arabia',
    'Saudi Arabia eSIM plans',
    'eSIM Makkah',
    'eSIM Madinah',
    'instant eSIM Saudi Arabia',
    'prepaid eSIM Saudi Arabia',
    'best eSIM for Umrah',
    'best eSIM for Hajj',
  ],
} as const;

/**
 * Helper function to generate canonical URL
 */
export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${seoConfig.baseUrl}${cleanPath}`;
}

/**
 * Helper function to generate full URL
 */
export function getFullUrl(path: string = ''): string {
  return getCanonicalUrl(path);
}

/**
 * Helper function to generate title with template
 */
export function getTitle(title: string, useTemplate: boolean = true): string {
  if (useTemplate) {
    return `${title} | ${seoConfig.siteName}`;
  }
  return title;
}

/**
 * Type for SEO config
 */
export type SeoConfig = typeof seoConfig;
