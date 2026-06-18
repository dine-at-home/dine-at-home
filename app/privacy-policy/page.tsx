import { Metadata } from 'next'
import PrivacyPolicyClient from '@/components/legal/privacy-policy-client'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Your privacy is important to us. Learn how Dine at Home collects, uses, and protects your personal information.',
  keywords: ['privacy policy', 'data protection', 'user privacy', 'cookie policy'],
  alternates: { canonical: 'https://datthome.com/privacy-policy' },
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />
}
