import Script from 'next/script'

interface StructuredDataProps {
  type: 'organization' | 'website' | 'product' | 'breadcrumb' | 'faq' | 'service' | 'localbusiness'
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
        logo: `${baseUrl}/android/android-launchericon-512-512.png`,
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
          image: `${baseUrl}/android/android-launchericon-512-512.png`,
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

    case 'faq':
      if (data?.questions && Array.isArray(data.questions)) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.questions.map((q: any) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer,
            },
          })),
        }
      }
      break

    case 'service':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'eSIM Activation Service',
        provider: {
          '@type': 'Organization',
          name: brandName,
          url: baseUrl,
        },
        areaServed: {
          '@type': 'Country',
          name: 'Saudi Arabia',
        },
        description: 'Instant eSIM activation service for Saudi Arabia. High-speed mobile data plans for Umrah and Hajj pilgrims.',
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceCurrency: 'USD',
        },
      }
      break

    case 'localbusiness':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: brandName,
        description: 'Instant eSIM activation service for Saudi Arabia. Get high-speed mobile data for your Umrah and Hajj pilgrimage.',
        url: baseUrl,
        telephone: data?.phone || '',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressCountry: data?.country || 'SA',
        },
        geo: data?.geo || undefined,
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '150',
          bestRating: '5',
          worstRating: '1',
        },
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
