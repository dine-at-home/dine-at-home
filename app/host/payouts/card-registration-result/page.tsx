'use client'

// DISABLED — card-payout (OCT) registration result page. Hosts now provide an IBAN for manual
// bank transfers, so this Paystrax card-registration callback is no longer used. The full
// working page is preserved on the `card-payout` git branch (see PAYIN_MANUAL_PAYOUT_PLAN.md).
// Kept as a redirect so any stale bookmark lands somewhere sensible.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CardRegistrationResultPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/host/payouts/settings')
  }, [router])
  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-muted-foreground">Redirecting…</div>
  )
}
