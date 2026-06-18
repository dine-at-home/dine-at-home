'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wallet, Clock, BadgeCheck, Loader2, Settings, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatCard } from '@/components/ui/stat-card'
import { HostSetupChecklist } from '@/components/host/dashboard/host-setup-checklist'
import { KycVerifiedRibbon } from '@/components/host/dashboard/kyc-status-banner'
import { payoutService, type HostEarnings, type HostPayout } from '@/lib/payout-service'
import { formatIsk, formatDate } from '@/lib/format'
import { cn } from '@/components/ui/utils'

const STATUS_VARIANT: Record<string, { label: string; className: string }> = {
  PENDING_SETTLEMENT: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  },
  IN_TRANSIT: {
    label: 'In transit',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
  },
  ON_HOLD: {
    label: 'On hold',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  },
}

interface EarningsSectionProps {
  highlightSetup?: boolean
}

export function EarningsSection({ highlightSetup = false }: EarningsSectionProps) {
  const [earnings, setEarnings] = useState<HostEarnings | null>(null)
  const [payouts, setPayouts] = useState<HostPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const [e, p] = await Promise.all([payoutService.getEarnings(), payoutService.listPayouts()])
      if (cancelled) return
      if (e.success && e.data) setEarnings(e.data)
      if (p.success && p.data) setPayouts(p.data)
      if (!e.success || !p.success) setError(e.error || p.error || 'Failed to load earnings')
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const status = earnings?.kycStatus || 'UNVERIFIED'
  const isVerified = status === 'VERIFIED'

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Earnings
          </p>
          <h2 className="mt-1 font-dm-sans text-2xl font-semibold tracking-tight sm:text-3xl">
            Your kitchen, your books.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Payouts are sent every week to your registered bank account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isVerified && <KycVerifiedRibbon />}
          <Link href="/host/payouts/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Payout settings
            </Button>
          </Link>
        </div>
      </header>

      {!isVerified && <HostSetupChecklist highlight={highlightSetup} />}

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            At a glance
          </h3>
          {earnings?.pendingBookingCount ? (
            <span className="text-xs text-muted-foreground">
              {earnings.pendingBookingCount} booking{earnings.pendingBookingCount !== 1 ? 's' : ''} pending settlement
            </span>
          ) : null}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              icon={Wallet}
              label="Pending balance"
              value={formatIsk(earnings?.pendingBalance || 0)}
              hint="Released with the next weekly payout."
              accent="orange"
            />
            <StatCard
              icon={Clock}
              label="Next release"
              value={
                earnings?.nextEligibleAt
                  ? new Date(earnings.nextEligibleAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—'
              }
              hint="Earliest your balance is queued for payout."
              accent="amber"
            />
            <StatCard
              icon={BadgeCheck}
              label="Adjustments"
              value={formatIsk(earnings?.payoutDebt || 0)}
              hint="Refunds or chargebacks deducted from your next payout."
              accent="slate"
            />
          </div>
        )}
      </section>

      <Card className="overflow-hidden border-border/70">
        <CardHeader className="border-b bg-muted/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-dm-sans text-lg font-semibold tracking-tight">Payout history</CardTitle>
              <CardDescription className="mt-1">
                Weekly disbursements to your bank account.
              </CardDescription>
            </div>
            {payouts.length > 0 && (
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground tabular-nums">
                {payouts.length} {payouts.length === 1 ? 'payout' : 'payouts'}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-sm text-rose-600">{error}</div>
          ) : payouts.length === 0 ? (
            <EmptyHistory verified={isVerified} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-transparent">
                  <TableHead>Created</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Arrived</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => {
                  const variant = STATUS_VARIANT[p.status] || {
                    label: p.status,
                    className: 'bg-muted text-foreground',
                  }
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{formatDate(p.createdAt)}</TableCell>
                      <TableCell className="font-dm-sans text-base font-semibold tabular-nums">
                        {formatIsk(p.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('font-medium', variant.className)} variant="secondary">
                          {variant.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {p.bookings?.length ?? 0}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(p.arrivalDate)}</TableCell>
                      <TableCell className="hidden max-w-xs truncate text-xs text-muted-foreground md:table-cell">
                        {p.failureMessage || '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyHistory({ verified }: { verified: boolean }) {
  return (
    <div className="px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3e0] text-[#e64a19]">
        <Sparkles className="h-5 w-5" />
      </span>
      <p className="mt-4 font-dm-sans text-lg font-semibold tracking-tight">
        {verified ? "No payouts yet" : "Once you’re verified, this is where the money lands."}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {verified
          ? 'Your first payout will appear here after a dinner is completed and the next weekly payout cycle runs.'
          : 'Finish payout setup to start receiving automatic disbursements after each dinner.'}
      </p>
    </div>
  )
}
