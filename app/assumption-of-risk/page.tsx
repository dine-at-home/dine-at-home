import { Metadata } from 'next'
import LiabilityWaiverClient from '@/components/legal/liability-waiver-client'

export const metadata: Metadata = {
  title: 'Assumption of Risk | Dine at Home',
  description:
    'Read the assumption of risk and liability waiver for using the Dine at Home platform. Important legal information for hosts and guests.',
  keywords: ['assumption of risk', 'liability waiver', 'legal waiver', 'dining events'],
}

export default function AssumptionOfRiskPage() {
  return <LiabilityWaiverClient />
}
