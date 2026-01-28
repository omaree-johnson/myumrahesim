import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/orders(.*)',
  '/account(.*)',
  '/dashboard(.*)',
]);

/**
 * Security Headers Configuration
 * Applies comprehensive security headers to all responses
 */
function applySecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  const isAuthPage = request.nextUrl.pathname.startsWith('/sign-in') || 
                     request.nextUrl.pathname.startsWith('/sign-up');

  // Content Security Policy
  // In development: More permissive CSP for Next.js HMR
  // In production: Stricter CSP (consider using nonces instead of 'unsafe-inline')
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const csp = [
    "default-src 'self'",
    // Scripts: Allow inline scripts and eval for Next.js (required for HMR)
    // Removed 'strict-dynamic' from script-src-elem as it disables host allowlists
    ...(isDevelopment
      ? [
          // Development: More permissive for HMR
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://localhost:* https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://js.stripe.com https://*.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://vercel.live https://*.vercel.app https://*.vercel.com https://challenges.cloudflare.com",
          "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://localhost:* https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://js.stripe.com https://*.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://vercel.live https://*.vercel.app https://*.vercel.com https://challenges.cloudflare.com",
        ]
      : [
          // Production: Stricter (no unsafe-eval)
          "script-src 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://js.stripe.com https://*.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://vercel.live https://*.vercel.app https://*.vercel.com https://challenges.cloudflare.com",
          "script-src-elem 'self' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://js.stripe.com https://*.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://vercel.live https://*.vercel.app https://*.vercel.com https://challenges.cloudflare.com",
        ]
    ),
    // Styles: Allow inline for Next.js (required)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Fonts
    "font-src 'self' https://fonts.gstatic.com data:",
    // Images
    "img-src 'self' data: https: blob:",
    // Connections
    "connect-src 'self' https://*.zendit.io https://*.supabase.co https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://clerk-telemetry.com https://api.resend.com https://api.exchangerate-api.com https://*.stripe.com https://api.esimaccess.com https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net https://*.facebook.com https://*.facebook.net https://vercel.live https://*.vercel.app https://*.vercel.com",
    // Frames
    "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.myumrahesim.com https://*.myumrahesim.com https://js.stripe.com https://hooks.stripe.com https://www.google.com https://www.googletagmanager.com https://challenges.cloudflare.com",
    // Workers
    "worker-src 'self' blob: https://*.clerk.com",
    // Objects (disable Flash, etc.)
    "object-src 'none'",
    // Base URI
    "base-uri 'self'",
    // Form actions
    "form-action 'self'",
    // Frame ancestors (clickjacking protection) - DENY for auth pages, SELF for others
    isAuthPage ? "frame-ancestors 'none'" : "frame-ancestors 'self'",
    // Upgrade insecure requests
    "upgrade-insecure-requests",
  ].join('; ');

  // Apply security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', isAuthPage ? 'DENY' : 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy: Disable all unnecessary browser features
  // Removed deprecated features: ambient-light-sensor, battery, document-domain, 
  // execution-while-not-rendered, execution-while-out-of-viewport, navigation-override
  const permissionsPolicy = [
    'accelerometer=()',
    'autoplay=()',
    'camera=()',
    'cross-origin-isolated=()',
    'display-capture=()',
    'encrypted-media=()',
    'fullscreen=()',
    'geolocation=()',
    'gyroscope=()',
    'keyboard-map=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'sync-xhr=()',
    'usb=()',
    'web-share=()',
    'xr-spatial-tracking=()',
  ].join(', ');
  response.headers.set('Permissions-Policy', permissionsPolicy);

  // Cross-Origin Policies (for better isolation)
  // Note: COEP is disabled because it blocks Stripe.js and other third-party payment scripts
  // COEP 'require-corp' requires all cross-origin resources to opt-in, which Stripe doesn't support
  // We keep COOP for security while allowing third-party scripts to load
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  // Don't set COEP or CORP as they interfere with Stripe.js and other payment providers

  // Additional security headers
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // HSTS: Only in production (HTTPS required)
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Prevent caching of auth pages
  if (isAuthPage) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

/**
 * Enforce HTTPS in production
 */
function enforceHTTPS(request: NextRequest): NextResponse | null {
  // Only enforce in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // Check protocol
  const protocol = request.headers.get('x-forwarded-proto') || 
                  (request.url.startsWith('https://') ? 'https' : 'http');
  
  // Redirect HTTP to HTTPS
  if (protocol !== 'https') {
    const httpsUrl = request.url.replace(/^http:/, 'https:');
    return NextResponse.redirect(httpsUrl, 301);
  }

  return null;
}

export default clerkMiddleware(async (auth, req) => {
  // 1. Enforce HTTPS in production
  const httpsRedirect = enforceHTTPS(req);
  if (httpsRedirect) {
    return applySecurityHeaders(httpsRedirect, req);
  }

  // 2. Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 3. Create response
  const response = NextResponse.next();

  // 4. Apply security headers
  applySecurityHeaders(response, req);

  // 5. Add session indicator header (for client-side timeout handling)
  const session = await auth();
  if (session.userId) {
    response.headers.set('X-Session-Active', 'true');
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
