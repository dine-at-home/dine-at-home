import { Metadata } from 'next'
import { getApiUrl } from '@/lib/api-config'
import DinnerDetailClient from '@/components/dinner/dinner-detail-client'
import { transformDinner } from '@/lib/dinner-utils'
import { JsonLd, getDinnerEventSchema, getBreadcrumbSchema } from '@/components/seo/JsonLd'

async function getDinner(id: string) {
  const response = await fetch(getApiUrl(`/dinners/${id}`), {
    next: { revalidate: 3600 },
  })
  const result = await response.json()
  return result.success && result.data ? transformDinner(result.data) : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const dinner = await getDinner(id)

  if (!dinner) {
    return {
      title: 'Dinner Not Found',
      robots: { index: false },
    }
  }

  const description = `Book a ${dinner.cuisine} dinner hosted by ${dinner.host.name} in ${dinner.location.city}. ${dinner.price} ${dinner.currency} per person. ${dinner.description.substring(0, 120)}…`

  return {
    title: `${dinner.title} in ${dinner.location.city}`,
    description,
    alternates: {
      canonical: `https://datthome.com/dinners/${id}`,
    },
    openGraph: {
      type: 'article',
      title: dinner.title,
      description,
      url: `https://datthome.com/dinners/${id}`,
      images: [
        {
          url: dinner.thumbnail || 'https://datthome.com/og-image.png',
          width: 1200,
          height: 630,
          alt: dinner.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dinner.title,
      description,
      images: [dinner.thumbnail || 'https://datthome.com/og-image.png'],
    },
    keywords: [
      dinner.cuisine,
      dinner.location.city,
      'social dining',
      'home cooked meal',
      'dinner experience',
      `${dinner.cuisine} food ${dinner.location.city}`,
    ],
  }
}

export default async function DinnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dinner = await getDinner(id)

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

  const eventSchema = getDinnerEventSchema(dinner, id)

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://datthome.com' },
    { name: 'Search', url: 'https://datthome.com/search' },
    { name: dinner.title, url: `https://datthome.com/dinners/${id}` },
  ])

  return (
    <>
      <JsonLd data={eventSchema} />
      <JsonLd data={breadcrumbSchema} />
      <article>
        <DinnerDetailClient dinner={dinner} />
      </article>
    </>
  )
}
