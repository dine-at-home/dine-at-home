import { Metadata } from 'next'
import TermsOfUseClient from '@/components/legal/terms-of-use-client'

export const metadata: Metadata = {
  title: 'Terms of Use | Dine at Home',
  description:
    'Read the terms and conditions for using the Dine at Home platform. Understand your rights and responsibilities as a guest or host.',
  keywords: ['terms of use', 'legal agreement', 'user terms', 'service agreement'],
}

export default function TermsOfUsePage() {
  return <TermsOfUseClient />
}
