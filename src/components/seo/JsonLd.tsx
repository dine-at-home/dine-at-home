import React from 'react'

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}

export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dine at Home',
  legalName: 'Esja Fjarskipti ehf',
  url: 'https://datthome.com',
  logo: 'https://datthome.com/datthome-logo-full.svg',
  description: 'Marketplace for authentic home-cooked dining experiences hosted by verified locals in Iceland.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Stórikríki 17',
    addressLocality: 'Mosfellsbær',
    postalCode: '270',
    addressCountry: 'IS',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@datthome.com',
    contactType: 'customer service',
    availableLanguage: ['English', 'Icelandic'],
  },
  sameAs: [
    'https://twitter.com/datthome',
    'https://facebook.com/datthome',
    'https://instagram.com/datthome',
  ],
}

export const WebSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dine at Home',
  url: 'https://datthome.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://datthome.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export const KnowledgeGraphSchema = [OrganizationSchema, WebSiteSchema]

export const getFaqSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})

interface DinnerEventInput {
  title: string
  description: string
  thumbnail?: string | null
  price: number
  currency: string
  date: string
  location: { city: string; state: string; address?: string }
  host: { name: string }
  cuisine: string
  capacity: number
  available: number
  rating?: number
  reviewCount?: number
}

export const getDinnerEventSchema = (dinner: DinnerEventInput, dinnerId: string) => ({
  '@context': 'https://schema.org',
  '@type': 'FoodEvent',
  name: dinner.title,
  description: dinner.description,
  image: dinner.thumbnail || 'https://datthome.com/og-image.png',
  startDate: dinner.date,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: `${dinner.host.name}'s Home`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: dinner.location.city,
      addressRegion: dinner.location.state,
      addressCountry: 'IS',
    },
  },
  organizer: {
    '@type': 'Person',
    name: dinner.host.name,
  },
  offers: {
    '@type': 'Offer',
    price: dinner.price,
    priceCurrency: dinner.currency,
    availability: dinner.available > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    url: `https://datthome.com/dinners/${dinnerId}`,
    validFrom: new Date().toISOString(),
  },
  maximumAttendeeCapacity: dinner.capacity,
  remainingAttendeeCapacity: dinner.available,
  ...(dinner.rating && dinner.reviewCount ? {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: dinner.rating,
      reviewCount: dinner.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  } : {}),
})

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})
