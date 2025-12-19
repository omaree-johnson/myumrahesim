import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://myumrahesim.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/checkout/',
          '/orders/',
          '/sign-in/',
          '/sign-up/',
          '/success/',
          '/review/',
          '/topup/',
          '/_next/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/checkout/',
          '/orders/',
          '/sign-in/',
          '/sign-up/',
          '/success/',
          '/review/',
          '/topup/',
          '/_next/',
          '/admin/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/checkout/',
          '/orders/',
          '/sign-in/',
          '/sign-up/',
          '/success/',
          '/review/',
          '/topup/',
          '/_next/',
          '/admin/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
