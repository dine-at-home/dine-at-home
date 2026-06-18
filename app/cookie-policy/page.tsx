import { Metadata } from 'next'
import CookiePolicyClient from '@/components/legal/cookie-policy-client'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Learn how Dine at Home uses cookies and similar technologies to improve your browsing experience.',
  keywords: ['cookie policy', 'cookies', 'tracking', 'privacy'],
  alternates: { canonical: 'https://datthome.com/cookie-policy' },
}

export default function CookiePolicyPage() {
  return <CookiePolicyClient />
}
