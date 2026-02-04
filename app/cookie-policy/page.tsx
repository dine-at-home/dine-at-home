import { Metadata } from 'next'
import CookiePolicyClient from '@/components/legal/cookie-policy-client'

export const metadata: Metadata = {
  title: 'Cookie Policy | Dine at Home',
  description:
    'Learn how Dine at Home uses cookies and similar technologies to improve your browsing experience.',
  keywords: ['cookie policy', 'cookies', 'tracking', 'privacy'],
}

export default function CookiePolicyPage() {
  return <CookiePolicyClient />
}
