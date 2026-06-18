'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, ShieldCheck, Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { payoutService, type PayoutSettings } from '@/lib/payout-service'
import { cn } from '@/components/ui/utils'

interface HostSetupChecklistProps {
  className?: string
  highlight?: boolean
}

type StepDef = {
  key: 'identity' | 'bank'
  title: string
  copy: string
  icon: typeof ShieldCheck
  isComplete: (s: PayoutSettings) => boolean
}

const STEPS: StepDef[] = [
  {
    key: 'identity',
    title: 'Verify your identity',
    copy: 'Quick check via Auðkenni / Rafræn skilríki.',
    icon: ShieldCheck,
    isComplete: (s) => Boolean(s.rafraenSkilrikiVerifiedAt),
  },
  {
    key: 'bank',
    title: 'Add your bank account',
    copy: 'Account holder name and IBAN — earnings are paid here by bank transfer.',
    icon: Landmark,
    isComplete: (s) => Boolean((s.bankAccountHolder || '').trim() && (s.iban || '').trim()),
  },
]

export function HostSetupChecklist({ className, highlight = false }: HostSetupChecklistProps) {
  const [settings, setSettings] = useState<PayoutSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await payoutService.getSettings()
      if (cancelled) return
      if (res.success && res.data) setSettings(res.data)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!settings || settings.kycStatus === 'VERIFIED') return null

  const completed = STEPS.map((s) => s.isComplete(settings))
  const total = STEPS.length
  const done = completed.filter(Boolean).length
  const nextIndex = completed.findIndex((c) => !c)
  const isInReview = settings.kycStatus === 'IN_REVIEW'

  return (
    <Card
      className={cn(
        'overflow-hidden border-border/70 transition-shadow',
        highlight && 'ring-2 ring-[#ff5745]/40 shadow-[0_24px_60px_-30px_rgba(230,74,25,0.55)]',
        className,
      )}
    >
      <div className="bg-gradient-to-br from-[#fff7ed] via-white to-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="font-dm-sans text-xl font-semibold tracking-tight">
                Get paid for your dinners
              </CardTitle>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Finish two quick steps to start getting paid after every booking.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-dm-sans text-2xl font-semibold tabular-nums leading-none text-foreground">
                {done}
                <span className="text-muted-foreground/60">/{total}</span>
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                done
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {isInReview && done === total && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.25} />
              <span>
                <span className="font-semibold">Under review.</span> You've completed both steps —
                we're verifying your details. Payouts unlock once approved.
              </span>
            </div>
          )}
          <ol className="space-y-3">
            {STEPS.map((step, index) => {
              const isDone = completed[index]
              const isNext = index === nextIndex
              const Icon = step.icon
              return (
                <li
                  key={step.key}
                  className={cn(
                    'relative flex flex-col gap-3 rounded-xl border bg-card/60 px-4 py-3 backdrop-blur-sm transition sm:flex-row sm:items-center sm:justify-between',
                    isDone && 'border-emerald-200 bg-emerald-50/60',
                    !isDone && isNext && 'border-[#ff5745]/30 bg-white shadow-sm',
                    !isDone && !isNext && 'border-border/60',
                  )}
                >
                  <div className="flex items-start gap-3 sm:items-center">
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isNext
                            ? 'bg-[#ff5745] text-white'
                            : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {isDone ? (
                        <Check className="h-4 w-4" strokeWidth={2.75} />
                      ) : (
                        <Icon className="h-4 w-4" strokeWidth={2.25} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tracking-tight">{step.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {step.copy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {isDone ? (
                      <span className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
                        Complete
                      </span>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        className={cn(
                          isNext
                            ? 'bg-foreground text-background hover:bg-foreground/90'
                            : 'border border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:bg-muted/60 hover:text-foreground',
                        )}
                      >
                        <Link href="/host/payouts/settings" className="inline-flex items-center gap-1.5">
                          Continue
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </div>
    </Card>
  )
}
