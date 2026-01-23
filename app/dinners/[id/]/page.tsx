import { Metadata } from 'next'
import { getApiUrl } from '@/lib/api-config'
import DinnerDetailClient from '@/components/dinner/dinner-detail-client'
import { transformDinner } from '@/lib/dinner-utils'
import { JsonLd } from '@/components/seo/JsonLd'

async function getDinner(id: string) {
  const response = await fetch(getApiUrl(`/dinners/${id}`), {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })
  const result = await response.json()
  return result.success && result.data ? transformDinner(result.data) : null
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const dinner = await getDinner(params.id)

  if (!dinner) {
    return {
      title: 'Dinner Not Found | Dine at Home',
    }
  }

  return {
    title: `${dinner.title} in ${dinner.location.city} | Dine at Home`,
    description: `Book a ${dinner.cuisine} dinner hosted by ${dinner.host.name}. Just ${dinner.price} ${dinner.currency} per person. ${dinner.description.substring(0, 150)}...`,
    openGraph: {
      title: dinner.title,
      description: dinner.description,
      images: [dinner.thumbnail || '/og-image.jpg'],
    },
    keywords: [dinner.cuisine, dinner.location.city, 'social dining', 'home cooked meal'],
  }
}

export default async function DinnerDetailPage({ params }: { params: { id: string } }) {
  const dinner = await getDinner(params.id)

  if (!dinner) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Dinner Not Found</h1>
        <p className="text-muted-foreground">
          The dinner experience you're looking for doesn't exist.
        </p>
      </div>
    )
  }

  // Product Schema for Dinners
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: dinner.title,
    description: dinner.description,
    image: dinner.thumbnail,
    brand: {
      '@type': 'Brand',
      name: 'Dine at Home',
    },
    offers: {
      '@type': 'Offer',
      price: dinner.price,
      priceCurrency: dinner.currency,
      availability:
        dinner.available > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <JsonLd data={productSchema} />
      <article>
        <DinnerDetailClient dinner={dinner} />
      </article>
    </>
  )
}
