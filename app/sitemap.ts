import { MetadataRoute } from 'next'

// In a real app, you would fetch dinner IDs or dynamic categories here
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://datthome.com'
  const locales = ['en', 'es']

  const staticRoutes = [
    '',
    '/search',
    '/how-it-works',
    '/help-center',
    '/terms-of-use',
    '/privacy-policy',
  ]

  const routes = locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${baseUrl}${locale === 'en' ? '' : `/${locale}`}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  )

  return routes
}
