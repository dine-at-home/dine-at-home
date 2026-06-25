'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShieldCheck, ShieldAlert, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { payoutService, type HostEarnings, type PayoutSettings } from '@/lib/payout-service'
import { cn } from '@/components/ui/utils'

interface KycStatusBannerProps {
  className?: string
}

const SESSION_DISMISS_KEY = 'datthome.kyc-banner.dismissed'

const completedSteps = (settings: PayoutSettings | null): number => {
  if (!settings) return 0
  let n = 0
  if (settings.rafraenSkilrikiVerifiedAt) n++
  if ((settings.bankAccountHolder || '').trim() && (settings.iban || '').trim()) n++
  return n
}

export function KycStatusBanner({ className }: KycStatusBannerProps) {
  const router = useRouter()
  const [earnings, setEarnings] = useState<HostEarnings | null>(null)
  const [settings, setSettings] = useState<PayoutSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDismissed(sessionStorage.getItem(SESSION_DISMISS_KEY) === '1')
    }
    let cancelled = false
    const load = async () => {
      const [e, s] = await Promise.all([payoutService.getEarnings(), payoutService.getSettings()])
      if (cancelled) return
      if (e.success && e.data) setEarnings(e.data)
      if (s.success && s.data) setSettings(s.data)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return null

  const rawStatus = earnings?.kycStatus || settings?.kycStatus || 'UNVERIFIED'
  if (rawStatus === 'VERIFIED') return null
  if (dismissed) return null

  const steps = completedSteps(settings)
  const total = 2

  // While the host still has a step to finish, show the "finish setup" prompt
  // even if the backend reports IN_REVIEW. Once both steps are done and we're
  // only waiting on admin approval, keep IN_REVIEW so they see "under review"
  // rather than being told to set up payouts again.
  const status = rawStatus === 'IN_REVIEW' && steps < total ? 'UNVERIFIED' : rawStatus

  const variants = {
    UNVERIFIED: {
      title: 'Finish payout setup to start receiving earnings',
      copy: 'Two quick steps — identity and your bank account (IBAN). Takes about 3 minutes.',
      tone: 'amber' as const,
      cta: 'Set up payouts',
      icon: ShieldAlert,
    },
    IN_REVIEW: {
      title: "We're reviewing your details",
      copy: 'Identity check usually clears within an hour. You can keep drafting dinners.',
      tone: 'sky' as const,
      cta: null,
      icon: Loader2,
    },
    REJECTED: {
      title: 'Payout setup needs your attention',
      copy: settings?.kycRejectionReason
        ? `Your verification was declined: ${settings.kycRejectionReason} Please update your details and resubmit.`
        : 'Your last submission could not be verified. Please update your details and resubmit.',
      tone: 'rose' as const,
      cta: 'Update details',
      icon: ShieldAlert,
    },
  } as const

  const variant = variants[status as keyof typeof variants] ?? variants.UNVERIFIED
  const Icon = variant.icon

  const toneClasses = {
    amber: 'border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 text-amber-950',
    sky: 'border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 text-sky-950',
    rose: 'border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 text-rose-950',
  }[variant.tone]

  const iconWrap = {
    amber: 'bg-amber-100 text-amber-700',
    sky: 'bg-sky-100 text-sky-700',
    rose: 'bg-rose-100 text-rose-700',
  }[variant.tone]

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border px-4 py-4 sm:px-6 sm:py-5',
        toneClasses,
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              iconWrap,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <p className="font-dm-sans text-base font-semibold leading-tight tracking-tight sm:text-lg">
              {variant.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed opacity-90">{variant.copy}</p>
            {status === 'UNVERIFIED' && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] opacity-80">
                <span className="tabular-nums">
                  {steps} of {total} complete
                </span>
                <span className="flex gap-1">
                  {Array.from({ length: total }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-1.5 w-6 rounded-full transition',
                        i < steps ? 'bg-current opacity-90' : 'bg-current opacity-25',
                      )}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-row-reverse">
          {variant.cta && (
            <Button
              size="sm"
              onClick={() => router.push('/host/payouts/settings')}
              className="shrink-0 bg-foreground text-background hover:bg-foreground/90"
            >
              {variant.cta}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={handleDismiss}
            className="rounded-full p-1.5 transition hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function KycVerifiedRibbon() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      <ShieldCheck className="h-3.5 w-3.5" />
      Verified — paid to your bank account
    </div>
  )
}
