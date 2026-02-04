import { Metadata } from 'next'
import { JsonLd, KnowledgeGraphSchema } from '@/components/seo/JsonLd'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { CookieConsent } from '@/components/cookie-consent'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Dine at Home | Authentic Social Dining & Home-Cooked Experiences',
    template: '%s | Dine at Home',
  },
  description:
    'Join unique home-cooked dinners with local hosts. Discover authentic social dining experiences, meet new people, and share delicious meals in a warm, communal atmosphere.',
  keywords: [
    'social dining',
    'home-cooked meals',
    'local food events',
    'dinner parties',
    'authentic dining',
    'host a dinner',
    'book a meal',
    'food community',
    'communal dining',
    'culinary experiences',
    'homemade food',
    'chef at home',
    'food tourism',
    'local hosts',
    'group dining',
    'supper club',
    'feast with locals',
    'dinner invitations',
    'food sharing',
    'unique dining',
    'meal hosting',
    'dinner reservations',
    'gastronomic experiences',
    'home kitchen',
    'local flavors',
    'organic food',
    'dietary friendly',
    'vegetarian dining',
    'vegan options',
    'cultural exchange',
    'food lovers',
    'foodie events',
    'travel for food',
    'dine with locals',
    'private dining',
    'chef experiences',
    'social food platform',
    'authentic culinary tours',
    'community dinners',
    'local dinner hosting',
    'book a local chef',
    'home dining invitations',
    'authentic food travel',
  ],
  alternates: {
    canonical: 'https://datthome.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://datthome.com',
    siteName: 'Dine at Home',
    title: 'Dine at Home | Authentic Social Dining Experiences',
    description:
      'Book unique dinners with local hosts. Authentic home-cooked meals and social dining community.',
    images: [
      {
        url: 'https://datthome.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dine at Home - Social Dining Experiences',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dine at Home | Authentic Social Dining Experiences',
    description:
      'Book unique dinners with local hosts. Authentic home-cooked meals and social dining community.',
    images: ['https://datthome.com/og-image.png'],
    creator: '@datthome',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Get BASE_URL from environment (server-side only)
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001/api'

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__BASE_URL__ = ${JSON.stringify(baseUrl)};`,
          }}
        />
        <JsonLd data={KnowledgeGraphSchema} />
      </head>
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">{children}</main>
          </div>
          <Toaster position="top-center" />
          <CookieConsent />
        </AuthProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''} />
      </body>
    </html>
  )
}
