import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable React Compiler to fix HMR issues
  // Re-enable after verifying stability
  // reactCompiler: true,
  reactStrictMode: true,
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Experimental features for better performance
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['lucide-react', '@radix-ui/react-select', '@radix-ui/react-switch', '@radix-ui/react-dropdown-menu', 'sonner'],
  },
  // Allow cross-origin requests from local network and ngrok
  allowedDevOrigins: [
    'fenny-mathias-allodially.ngrok-free.dev',
    'http://192.168.100.160:3001',
    'http://192.168.100.160',
  ],
  
  // SEO Optimizations
  compress: true, // Enable gzip compression
  
  // Trailing slashes for better SEO
  trailingSlash: false,
  
  // Performance optimizations for Core Web Vitals
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Compiler optimizations for smaller bundles
  compiler: {
    // Remove console.log in production (reduces bundle size)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep errors and warnings
    } : false,
  },
  
  // Image optimization - optimized for performance
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF is ~50% smaller than WebP
    qualities: [70, 75, 85, 90], // Lower quality for faster loads
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days - long cache for static images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
    // Enable content-based image optimization
    dangerouslyAllowSVG: false, // Security: disable SVG
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Security and SEO headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Note: Security headers are now set in middleware.ts for better control
          // These headers in next.config.ts serve as fallback for static assets
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // HSTS: Only set in production (HTTPS required)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : []),
        ],
      },
      {
        // CRITICAL: Security headers for authentication pages
        source: '/sign-in/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Prevent clickjacking on auth pages
          },
        ],
      },
      {
        source: '/sign-up/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache API responses for better performance
        source: '/api/products',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/:path*\\.(jpg|jpeg|png|webp|avif|svg|ico|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
