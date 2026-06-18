import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth/',
          '/profile/',
          '/booking/',
          '/bookings/',
          '/favorites/',
          '/callback/',
          '/host/dashboard/',
          '/host/dinners/',
          '/host/payouts/',
          '/host/restricted/',
          '/api/',
        ],
      },
      {
        userAgent: ['GPTBot', 'Google-Extended', 'CCBot'],
        allow: '/',
        disallow: ['/auth/', '/profile/', '/booking/', '/bookings/'],
      },
    ],
    sitemap: 'https://datthome.com/sitemap.xml',
  }
}
