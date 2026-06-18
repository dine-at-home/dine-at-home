import { Metadata } from 'next'
import HostAgreementClient from '@/components/legal/host-agreement-client'

export const metadata: Metadata = {
  title: 'Host Agreement',
  description:
    'The legally binding agreement between Hosts and Datthome, including platform fees, payouts, set-off, and claw-back rights.',
  keywords: ['host agreement', 'host terms', 'payout terms', 'merchant of record'],
  alternates: { canonical: 'https://datthome.com/host-agreement' },
}

export default function HostAgreementPage() {
  return <HostAgreementClient />
}
