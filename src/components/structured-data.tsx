import Script from 'next/script'

interface StructuredDataProps {
  type: 'organization' | 'website' | 'product' | 'breadcrumb'
  data?: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://umrahesim.com'
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'My Umrah eSIM'

  let structuredData = {}

  switch (type) {
    case 'organization':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: brandName,
        url: baseUrl,
        logo: `${baseUrl}/icons/icon-512.png`,
        description: 'Instant eSIM activation for Saudi Arabia. Get high-speed mobile data for your Umrah and Hajj pilgrimage.',
        sameAs: [
          // Add your social media URLs here when available
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          availableLanguage: ['English', 'Arabic'],
        },
      }
      break

    case 'website':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: brandName,
        url: baseUrl,
        description: 'Instant eSIM activation for Saudi Arabia. Get high-speed mobile data for your Umrah and Hajj pilgrimage.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
      break

    case 'product':
      if (data) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name || data.title || 'eSIM Plan',
          description: data.description || `${data.data} data for ${data.validity} in Saudi Arabia`,
          image: `${baseUrl}/icons/icon-512.png`,
          brand: {
            '@type': 'Brand',
            name: brandName,
          },
          offers: {
            '@type': 'Offer',
            price: data.price?.amount || '0',
            priceCurrency: data.price?.currency || 'USD',
            availability: 'https://schema.org/InStock',
            url: baseUrl,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '150',
          },
        }
      }
      break

    case 'breadcrumb':
      if (data?.items) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`,
          })),
        }
      }
      break
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      strategy="beforeInteractive"
    />
  )
}
