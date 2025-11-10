/**
 * Brand Configuration for White-Labeling
 * 
 * This file allows you to customize the branding of your eSIM store
 * without changing code. Swap values via environment variables or
 * modify this file directly for different deployments.
 */

export const brandConfig = {
  // Brand name displayed in header and metadata
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "eSIM Store",
  
  // Primary theme color (used for buttons, links, theme-color meta tag)
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#0ea5e9",
  
  // Logo URL (can be relative path or absolute URL)
  logoUrl: process.env.NEXT_PUBLIC_LOGO || "/icons/icon-192.png",
  
  // Support email
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@esimstore.com",
  
  // Social media links (optional)
  social: {
    twitter: process.env.NEXT_PUBLIC_TWITTER,
    facebook: process.env.NEXT_PUBLIC_FACEBOOK,
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM,
  },
  
  // Additional customization
  tagline: process.env.NEXT_PUBLIC_TAGLINE || "Stay connected anywhere in the world",
};

export type BrandConfig = typeof brandConfig;
