import { MetadataRoute } from 'next'
import { getBackendUrl } from '@/lib/api-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://datthome.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/host/onboarding`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help-center`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/host-payouts-info`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...[
      '/terms-of-use',
      '/privacy-policy',
      '/refund-policy',
      '/cookie-policy',
      '/assumption-of-risk',
      '/host-agreement',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
  ]

  let dinnerRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(getBackendUrl('/dinners?page=1&limit=100'), {
      next: { revalidate: 3600 },
    })
    const result = await res.json()
    if (result.success && Array.isArray(result.data)) {
      dinnerRoutes = result.data.map((dinner: { id: string; updatedAt?: string }) => ({
        url: `${baseUrl}/dinners/${dinner.id}`,
        lastModified: dinner.updatedAt ? new Date(dinner.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {
    // API unreachable during build — static routes only
  }

  return [...staticRoutes, ...dinnerRoutes]
}
