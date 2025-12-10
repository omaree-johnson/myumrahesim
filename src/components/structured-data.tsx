import Script from 'next/script'

interface StructuredDataProps {
  type: 'organization' | 'website' | 'product' | 'breadcrumb' | 'faq' | 'service' | 'localbusiness' | 'howto' | 'article' | 'review' | 'qapage'
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
        description: 'The best eSIM service for Umrah and Hajj pilgrims. Instant eSIM activation for Saudi Arabia with reliable coverage in Makkah and Madinah. High-speed 4G/5G mobile data plans starting from £17.39. No physical SIM card needed.',
        sameAs: [
          // Add your social media URLs here when available
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Support',
          email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@myumrahesim.com',
          availableLanguage: ['English', 'Arabic'],
          areaServed: 'SA',
          availableChannel: {
            '@type': 'ServiceChannel',
            serviceUrl: baseUrl,
            serviceType: 'Online Support'
          }
        },
        areaServed: {
          '@type': 'Country',
          name: 'Saudi Arabia'
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

    case 'howto':
      if (data) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: data.name || 'How to Activate eSIM for Umrah',
          description: data.description || 'Step-by-step guide to activating an eSIM for your Umrah journey in Saudi Arabia',
          image: `${baseUrl}/android/android-launchericon-512-512.png`,
          totalTime: data.totalTime || 'PT5M',
          tool: [
            {
              '@type': 'HowToTool',
              name: 'Smartphone with eSIM support'
            }
          ],
          step: data.steps || [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Purchase eSIM Plan',
              text: 'Visit our website and choose an eSIM data plan for Saudi Arabia that suits your Umrah travel needs.',
              url: `${baseUrl}/plans`
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Receive QR Code',
              text: 'After purchase, you will receive a QR code via email instantly. Check your inbox for the activation email.',
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Scan QR Code',
              text: 'Open your smartphone settings, go to Mobile Data or Cellular, select Add Data Plan, and scan the QR code.',
            },
            {
              '@type': 'HowToStep',
              position: 4,
              name: 'Activate in Saudi Arabia',
              text: 'When you arrive in Saudi Arabia, enable data roaming and select the eSIM for mobile data. Your eSIM will activate automatically.',
            }
          ]
        }
      }
      break

    case 'article':
      if (data) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.headline || 'Best eSIM for Umrah: Complete Guide',
          description: data.description || 'Complete guide to choosing and activating the best eSIM for your Umrah journey in Saudi Arabia',
          image: data.image || `${baseUrl}/kaaba-herop.jpg`,
          author: data.author ? {
            '@type': data.author['@type'] || 'Organization',
            name: data.author.name || brandName,
            url: data.author.url || baseUrl
          } : {
            '@type': 'Organization',
            name: brandName,
            url: baseUrl
          },
          publisher: {
            '@type': 'Organization',
            name: brandName,
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/android/android-launchericon-512-512.png`
            }
          },
          datePublished: data.datePublished || new Date().toISOString(),
          dateModified: data.dateModified || new Date().toISOString(),
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url || baseUrl
          },
          // articleBody is critical for AI search engines (ChatGPT, Perplexity, etc.)
          articleBody: data.articleBody || data.description || 'Complete guide to choosing and activating the best eSIM for your Umrah journey in Saudi Arabia',
        }
      }
      break

    case 'review':
      if (data) {
        // If data is an array of reviews, create aggregate rating with individual reviews
        if (Array.isArray(data.reviews) && data.reviews.length > 0) {
          const reviews = data.reviews;
          const totalRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
          const averageRating = (totalRating / reviews.length).toFixed(1);
          
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: data.productName || 'eSIM for Umrah and Hajj',
            description: data.description || 'Instant eSIM activation for Saudi Arabia. High-speed mobile data plans for Umrah and Hajj pilgrims.',
            brand: {
              '@type': 'Brand',
              name: brandName,
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: averageRating,
              reviewCount: reviews.length.toString(),
              bestRating: '5',
              worstRating: '1',
            },
            review: reviews.map((review: any) => ({
              '@type': 'Review',
              author: {
                '@type': 'Person',
                name: review.author || 'Anonymous',
              },
              datePublished: review.datePublished || new Date().toISOString().split('T')[0],
              reviewBody: review.reviewBody || review.text || '',
              reviewRating: {
                '@type': 'Rating',
                ratingValue: review.rating?.toString() || '5',
                bestRating: '5',
                worstRating: '1',
              },
            })),
          };
        } else if (data.rating && data.reviewCount) {
          // Simple aggregate rating only
          structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: data.productName || 'eSIM for Umrah and Hajj',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: data.rating.toString(),
              reviewCount: data.reviewCount.toString(),
              bestRating: '5',
              worstRating: '1',
            },
          };
        }
      }
      break

    case 'qapage':
      // QAPage schema for AI search engines (ChatGPT, Perplexity, etc.)
      if (data?.mainEntity) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'QAPage',
          mainEntity: {
            '@type': 'Question',
            name: data.mainEntity.question || data.mainEntity.name,
            text: data.mainEntity.question || data.mainEntity.name,
            answerCount: data.mainEntity.answers?.length || 1,
            acceptedAnswer: data.mainEntity.answers?.[0] ? {
              '@type': 'Answer',
              text: data.mainEntity.answers[0].text,
              author: {
                '@type': 'Organization',
                name: brandName,
              },
              dateCreated: data.mainEntity.answers[0].dateCreated || new Date().toISOString(),
            } : {
              '@type': 'Answer',
              text: data.mainEntity.answer || data.mainEntity.text,
              author: {
                '@type': 'Organization',
                name: brandName,
              },
            },
            suggestedAnswer: data.mainEntity.answers?.slice(1).map((ans: any) => ({
              '@type': 'Answer',
              text: ans.text,
              author: {
                '@type': 'Organization',
                name: brandName,
              },
            })) || [],
          },
        };
      }
      break
  }

  // Don't render if structuredData is empty
  if (!structuredData || Object.keys(structuredData).length === 0) {
    return null;
  }

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
      strategy="beforeInteractive"
    />
  )
}
