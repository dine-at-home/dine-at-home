'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { HostGuard } from '@/components/auth/host-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Wallet, Clock, AlertCircle, BadgeCheck, Loader2 } from 'lucide-react'
import { payoutService, type HostEarnings, type HostPayout } from '@/lib/payout-service'

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
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  },
  ON_HOLD: {
    label: 'On hold',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  },
}

const formatIsk = (n: number): string =>
  new Intl.NumberFormat('is-IS', { style: 'currency', currency: 'ISK', maximumFractionDigits: 0 }).format(n || 0)

const formatDate = (v: string | Date | null | undefined): string => {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return '—'
  }
}

export default function HostPayoutsPage() {
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
      if (!e.success || !p.success) setError(e.error || p.error || 'Failed to load payouts')
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const kycStatus = earnings?.kycStatus || 'UNVERIFIED'

  return (
    <HostGuard>
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Payouts</h1>
              <p className="text-muted-foreground mt-1">
                Your earnings from completed dinners. Payouts are sent 48 hours after each dinner ends.
              </p>
            </div>
          </header>

          {kycStatus !== 'VERIFIED' && (
            <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  KYC status: {kycStatus}
                </p>
                <p className="text-amber-700 dark:text-amber-200">
                  Payouts are paused until your identity and bank details are fully verified. Finish
                  onboarding or update your payout settings to proceed.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Pending balance
                </CardDescription>
                <CardTitle className="text-3xl">
                  {formatIsk(earnings?.pendingBalance || 0)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Released in batches once the minimum of{' '}
                {formatIsk(earnings?.minimumPayout || 100)} is reached.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Next release
                </CardDescription>
                <CardTitle className="text-2xl">
                  {earnings?.nextEligibleAt
                    ? new Date(earnings.nextEligibleAt).toLocaleDateString()
                    : '—'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                The earliest your pending balance will be queued for payout.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4" /> Outstanding adjustments
                </CardDescription>
                <CardTitle className="text-2xl">
                  {formatIsk(earnings?.payoutDebt || 0)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Chargebacks or refunds that will be deducted from your next payout.
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payout history</CardTitle>
              <CardDescription>
                Every batch disbursement to your bank account. Click a row for details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading…
                </div>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : payouts.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No payouts yet. They will appear here after your first completed dinner batch.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Created</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Arrived</TableHead>
                      <TableHead>Notes</TableHead>
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
                          <TableCell>{formatDate(p.createdAt)}</TableCell>
                          <TableCell className="font-medium">
                            {formatIsk(p.amount)} {p.currency}
                          </TableCell>
                          <TableCell>
                            <Badge className={variant.className} variant="secondary">
                              {variant.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{p.bookings?.length ?? 0}</TableCell>
                          <TableCell>{formatDate(p.arrivalDate)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
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
      </MainLayout>
    </HostGuard>
  )
}
