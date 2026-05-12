'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, FileWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { CURRENT_LEGAL_VERSIONS } from '@/lib/legal-document-versions'
import { cn } from '@/components/ui/utils'

interface StaleLegalBannerProps {
  className?: string
}

export function StaleLegalBanner({ className }: StaleLegalBannerProps) {
  const router = useRouter()
  const { user } = useAuth()

  if (!user) return null

  const accepted = {
    termsOfUse: (user as { legalAcceptedTermsVersion?: string | null }).legalAcceptedTermsVersion,
    hostAgreement: (user as { legalAcceptedHostAgreementVersion?: string | null })
      .legalAcceptedHostAgreementVersion,
    liabilityWaiver: (user as { legalAcceptedLiabilityWaiverVersion?: string | null })
      .legalAcceptedLiabilityWaiverVersion,
  }

  const upToDate =
    accepted.termsOfUse === CURRENT_LEGAL_VERSIONS.termsOfUse &&
    accepted.hostAgreement === CURRENT_LEGAL_VERSIONS.hostAgreement &&
    accepted.liabilityWaiver === CURRENT_LEGAL_VERSIONS.liabilityWaiver

  if (upToDate) return null

  const neverAccepted = !accepted.termsOfUse && !accepted.hostAgreement && !accepted.liabilityWaiver

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-4 py-4 text-amber-950 sm:px-6 sm:py-5',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <FileWarning className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <p className="font-dm-sans text-base font-semibold leading-tight tracking-tight sm:text-lg">
              {neverAccepted
                ? 'Accept the Host Agreement to receive payouts'
                : 'Updated Host Agreement — please review and re-accept'}
            </p>
            <p className="mt-1 text-sm leading-relaxed opacity-90">
              Datthome operates as Merchant of Record. The Host Agreement defines how refunds and
              chargebacks are settled against your payouts. Your acceptance is required before the
              next payout cycle.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-row-reverse">
          <Button
            size="sm"
            onClick={() => router.push('/host/onboarding')}
            className="shrink-0 bg-foreground text-background hover:bg-foreground/90"
          >
            Review and accept
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
