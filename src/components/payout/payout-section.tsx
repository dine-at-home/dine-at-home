'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  payoutService,
  HostBalanceResponse,
  PayoutResponse,
  PaymentStatusResponse,
} from '@/lib/payout-service'
import {
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface PayoutSectionProps {
  hostId: string
}

export function PayoutSection({ hostId }: PayoutSectionProps) {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [balance, setBalance] = useState<HostBalanceResponse | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null)
  const [payouts, setPayouts] = useState<PayoutResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeUntilReady, setTimeUntilReady] = useState<Record<string, number>>({})

  useEffect(() => {
    loadData()
    // Refresh payment status every 10 seconds to catch payments that become ready quickly (2 min in dev)
    const interval = setInterval(() => {
      loadPaymentStatus()
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [hostId])



  // Update countdown timers every second and auto-refresh when payments become ready
  useEffect(() => {
    if (!paymentStatus || paymentStatus.pending.payments.length === 0) return

    const interval = setInterval(() => {
      const now = new Date()
      const updates: Record<string, number> = {}
      let shouldRefresh = false

      paymentStatus.pending.payments.forEach((payment) => {
        const readyAt = new Date(payment.readyToWithdrawAt)
        const diff = readyAt.getTime() - now.getTime()
        // Calculate in minutes for more accurate countdown (especially in dev mode with 2 min wait)
        const minutes = Math.max(0, Math.ceil(diff / (1000 * 60)))
        updates[payment.bookingId] = minutes

        // If payment just became ready (was > 0, now <= 0), trigger refresh
        const previousMinutes = timeUntilReady[payment.bookingId] ?? payment.hoursUntilReady * 60
        if (previousMinutes > 0 && minutes <= 0) {
          shouldRefresh = true
        }
      })

      setTimeUntilReady(updates)

      // Auto-refresh payment status when any payment becomes ready
      if (shouldRefresh) {
        console.log('[Payout] Payment became ready, refreshing status...')
        // Reload payment status to move ready payments from pending to ready section
        payoutService.getHostPaymentStatus(hostId)
          .then((statusData) => {
            if (statusData) {
              setPaymentStatus(statusData)
              // Also reload balance to get updated amounts
              payoutService.getHostBalance(hostId)
                .then((balanceData) => {
                  if (balanceData) setBalance(balanceData)
                })
                .catch(() => { }) // Ignore errors
            }
          })
          .catch(() => { }) // Ignore errors
      }
    }, 1000) // Every second

    return () => clearInterval(interval)
  }, [paymentStatus, timeUntilReady, hostId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [balanceData, payoutsData, statusData] = await Promise.all([
        payoutService.getHostBalance(hostId).catch((err) => {
          console.warn('[Payout] Failed to load balance:', err)
          return null
        }),
        payoutService.getHostPayouts(hostId).catch((err) => {
          console.warn('[Payout] Failed to load payouts:', err)
          return { data: [], pagination: undefined } as any
        }),
        payoutService.getHostPaymentStatus(hostId).catch((err) => {
          console.warn('[Payout] Failed to load payment status:', err)
          return null
        }),
      ])

      if (balanceData) setBalance(balanceData)
      if (payoutsData) setPayouts(payoutsData.data || [])
      if (statusData) setPaymentStatus(statusData)
    } catch (err: any) {
      console.error('[Payout] Error loading payout data:', err)
      setError(err.message || 'Failed to load payout data')
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentStatus = async () => {
    try {
      const statusData = await payoutService.getHostPaymentStatus(hostId)
      if (statusData) {
        setPaymentStatus(statusData)
        // Also reload balance when status changes to get updated amounts
        payoutService.getHostBalance(hostId)
          .then((balanceData) => {
            if (balanceData) setBalance(balanceData)
          })
          .catch(() => { }) // Ignore errors
      }
    } catch (err) {
      console.error('Error refreshing payment status:', err)
    }
  }

  const handleRequestPayout = async () => {
    try {
      setRequestingPayout(true)
      setError(null)

      const result = await payoutService.requestPayout(hostId)
      setShowPayoutDialog(false)
      // Reload data
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to request payout')
    } finally {
      setRequestingPayout(false)
    }
  }

  // Removed handleWithdrawToBank - handled by system

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case 'IN_TRANSIT':
        return (
          <Badge variant="default" className="bg-blue-600">
            <Clock className="w-3 h-3 mr-1" />
            In Transit
          </Badge>
        )
      case 'PENDING_SETTLEMENT':
        return (
          <Badge variant="default" className="bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Waiting for Funds
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="default" className="bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      case 'CANCELED':
        return (
          <Badge variant="outline">
            <XCircle className="w-3 h-3 mr-1" />
            Canceled
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = 'eur') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  // Check if we're in development mode (2 min wait) or production (72 hour wait)
  const isDevMode = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const waitTimeText = isDevMode ? '2 minutes' : '72 hours'

  const formatTimeRemaining = (minutes: number) => {
    // If less than 60 minutes, show in minutes
    if (minutes < 60) {
      if (minutes <= 0) return 'Ready now'
      if (minutes === 1) return '1 minute'
      return `${minutes} minutes`
    }
    // Otherwise show in hours
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours === 1 && remainingMinutes === 0) return '1 hour'
    if (remainingMinutes === 0) return `${hours} hours`
    return `${hours}h ${remainingMinutes}m`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Allow multiple payouts - removed the check that prevents multiple payouts
  const canRequestPayout =
    !!user?.airwallexBeneficiaryId &&
    paymentStatus &&
    paymentStatus.ready.totalAmount > 0

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Payouts & Earnings
          </CardTitle>
          <CardDescription>
            Automatic withdrawal system - Payments become available {waitTimeText} after dinner completion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Airwallex Account Status */}
          {user && !user.airwallexBeneficiaryId && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Bank Details Verification Required</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Connect your bank account via Airwallex to receive automated payouts.
                  </p>
                  <Button
                    onClick={() => router.push('/host/onboarding?step=5')}
                    className="mt-3"
                    size="sm"
                  >
                    Setup Bank Details
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Ready Payments - Can Request Payout */}
          {paymentStatus && paymentStatus.ready.totalAmount > 0 && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Ready to Request Payout</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {formatCurrency(paymentStatus.ready.totalAmount, paymentStatus.currency)}
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    {paymentStatus.ready.count} payment{paymentStatus.ready.count !== 1 ? 's' : ''} ready to request payout
                  </p>
                </div>
                <Clock className="w-12 h-12 text-blue-600" />
              </div>
              {canRequestPayout ? (
                <Button
                  onClick={() => setShowPayoutDialog(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Request Payout
                </Button>
              ) : (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    {!user?.airwallexBeneficiaryId && 'Connect your bank account via Airwallex to enable withdrawals.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Processing Payouts - PENDING_SETTLEMENT */}
          {payouts.filter((p) => p.status === 'PENDING_SETTLEMENT').length > 0 && (
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Processing Payouts</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {formatCurrency(
                      payouts
                        .filter((p) => p.status === 'PENDING_SETTLEMENT')
                        .reduce((sum, p) => sum + p.amount, 0),
                      payouts[0]?.currency || 'eur'
                    )}
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    {payouts.filter((p) => p.status === 'PENDING_SETTLEMENT').length} payout{payouts.filter((p) => p.status === 'PENDING_SETTLEMENT').length !== 1 ? 's' : ''} being processed
                  </p>
                </div>
                <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
              </div>
              <p className="text-xs text-yellow-700 mb-4">
                These payouts are being processed. Funds will be moved to your connected account shortly (usually within minutes).
                Once completed, they will appear below as "Ready to Withdraw".
              </p>
            </div>
          )}

          {/* Ready to Withdraw to Bank - IN_TRANSIT Payouts */}
          {payouts.filter((p) => p.status === 'IN_TRANSIT').length > 0 && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-green-800 font-medium">Ready to Withdraw to Bank</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {formatCurrency(
                      payouts
                        .filter((p) => p.status === 'IN_TRANSIT')
                        .reduce((sum, p) => sum + p.amount, 0),
                      payouts[0]?.currency || 'eur'
                    )}
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    {payouts.filter((p) => p.status === 'IN_TRANSIT').length} payout{payouts.filter((p) => p.status === 'IN_TRANSIT').length !== 1 ? 's' : ''} in your connected account
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-xs text-green-700 mb-4">
                Funds have been transferred to your connected Airwallex account and are now on their way to your bank.
              </p>
            </div>
          )}

          {/* Pending Payments (Waiting for 72 hours) */}
          {paymentStatus && paymentStatus.pending.count > 0 && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Pending Payments
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {formatCurrency(paymentStatus.pending.totalAmount, paymentStatus.currency)}
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    {paymentStatus.pending.count} payment{paymentStatus.pending.count !== 1 ? 's' : ''} waiting
                    for {waitTimeText} period
                  </p>
                </div>
                <Clock className="w-10 h-10 text-blue-600" />
              </div>

              <div className="mt-4 space-y-3">
                {paymentStatus.pending.payments.slice(0, 3).map((payment) => {
                  // Convert hours to minutes if needed, or use minutes directly from countdown
                  const minutesRemaining = timeUntilReady[payment.bookingId]
                    ? timeUntilReady[payment.bookingId]
                    : (payment.hoursUntilReady ? payment.hoursUntilReady * 60 : 0)
                  return (
                    <div
                      key={payment.bookingId}
                      className="p-3 bg-white/60 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">{payment.dinnerTitle}</p>
                          <p className="text-xs text-blue-700 mt-1">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            <Timer className="w-3 h-3 mr-1" />
                            {formatTimeRemaining(minutesRemaining)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {paymentStatus.pending.payments.length > 3 && (
                  <p className="text-xs text-blue-600 text-center">
                    +{paymentStatus.pending.payments.length - 3} more payment
                    {paymentStatus.pending.payments.length - 3 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Automatic System:</strong> Payments automatically become available for withdrawal {waitTimeText}
                  after dinner completion. No action needed - just wait for the countdown!
                </p>
              </div>
            </div>
          )}

          {/* No Payments Available */}
          {paymentStatus &&
            paymentStatus.ready.totalAmount === 0 &&
            paymentStatus.pending.totalAmount === 0 && (
              <div className="p-6 bg-muted rounded-lg text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No payments available yet. Payments will appear here after completed dinners.
                </p>
              </div>
            )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Payout History */}
          <div>
            <h3 className="font-semibold mb-4">Payout History</h3>
            {payouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payouts yet</p>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="p-4 border rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(payout.status)}
                        <span className="font-semibold">
                          {formatCurrency(payout.amount, payout.currency)}
                        </span>
                      </div>
                      {payout.description && (
                        <p className="text-sm text-muted-foreground">{payout.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </p>
                      {payout.failureMessage && (
                        <p className="text-xs text-destructive mt-1">{payout.failureMessage}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Payout Confirmation Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw your available balance. Funds will be transferred to your connected bank
              account within 2-3 business days.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-2xl font-bold">
                {paymentStatus
                  ? formatCurrency(paymentStatus.ready.totalAmount, paymentStatus.currency)
                  : '€0.00'}
              </p>
              {paymentStatus && paymentStatus.ready.count > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  From {paymentStatus.ready.count} completed booking{paymentStatus.ready.count !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestPayout} disabled={requestingPayout}>
              {requestingPayout ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Withdrawal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
