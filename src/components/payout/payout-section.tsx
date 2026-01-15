'use client'

import { useState, useEffect } from 'react'
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
import { stripeConnectService } from '@/lib/stripe-connect-service'
import {
  Wallet,
  DollarSign,
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
  const [balance, setBalance] = useState<HostBalanceResponse | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null)
  const [payouts, setPayouts] = useState<PayoutResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [timeUntilReady, setTimeUntilReady] = useState<Record<string, number>>({})

  useEffect(() => {
    loadData()
    // Refresh payment status every minute to update countdown
    const interval = setInterval(() => {
      if (paymentStatus) {
        loadPaymentStatus()
      }
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [hostId])

  // Update countdown timers every second
  useEffect(() => {
    if (!paymentStatus || paymentStatus.pending.payments.length === 0) return

    const interval = setInterval(() => {
      const now = new Date()
      const updates: Record<string, number> = {}

      paymentStatus.pending.payments.forEach((payment) => {
        const readyAt = new Date(payment.readyToWithdrawAt)
        const diff = readyAt.getTime() - now.getTime()
        const hours = Math.max(0, Math.ceil(diff / (1000 * 60 * 60)))
        updates[payment.bookingId] = hours
      })

      setTimeUntilReady(updates)
    }, 1000) // Every second

    return () => clearInterval(interval)
  }, [paymentStatus])

  const loadData = async () => {
    try {
      setLoading(true)
      const [balanceData, payoutsData, accountData, statusData] = await Promise.all([
        payoutService.getHostBalance(hostId).catch(() => null),
        payoutService.getHostPayouts(hostId).catch(() => ({ data: [], pagination: undefined })),
        stripeConnectService.getAccountStatus().catch(() => null),
        payoutService.getHostPaymentStatus(hostId).catch(() => null),
      ])

      if (balanceData) setBalance(balanceData)
      if (payoutsData) setPayouts(payoutsData.data || [])
      if (accountData) setAccountStatus(accountData)
      if (statusData) setPaymentStatus(statusData)
    } catch (err: any) {
      console.error('Error loading payout data:', err)
      setError(err.message || 'Failed to load payout data')
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentStatus = async () => {
    try {
      const statusData = await payoutService.getHostPaymentStatus(hostId)
      if (statusData) setPaymentStatus(statusData)
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

  const formatTimeRemaining = (hours: number) => {
    if (hours <= 0) return 'Ready now'
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) return `${days} day${days !== 1 ? 's' : ''}`
    return `${days}d ${remainingHours}h`
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

  const canRequestPayout =
    accountStatus?.kycVerified &&
    accountStatus?.payoutsEnabled &&
    paymentStatus &&
    paymentStatus.ready.totalAmount > 0 &&
    !payouts.some((p) => p.status === 'PENDING' || p.status === 'IN_TRANSIT')

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Payouts & Earnings
          </CardTitle>
          <CardDescription>
            Automatic withdrawal system - Payments become available 72 hours after dinner completion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Status */}
          {accountStatus && !accountStatus.hasAccount && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Stripe Account Setup Required</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Complete your Stripe Connect onboarding to receive payouts. This includes KYC verification.
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        const result = await stripeConnectService.createOnboardingLink()
                        if (result.onboardingUrl) {
                          window.open(result.onboardingUrl, '_blank', 'noopener,noreferrer')
                        }
                      } catch (err: any) {
                        setError(err.message || 'Failed to start onboarding')
                      }
                    }}
                    className="mt-3"
                    size="sm"
                  >
                    Start Onboarding
                  </Button>
                </div>
              </div>
            </div>
          )}

          {accountStatus && accountStatus.hasAccount && !accountStatus.kycVerified && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">KYC Verification Required</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Complete KYC verification to enable payouts. This includes identity verification and business details.
                  </p>
                  {accountStatus.requirements?.currentlyDue &&
                    accountStatus.requirements.currentlyDue.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-orange-800">Required:</p>
                        <ul className="text-xs text-orange-700 mt-1 list-disc list-inside">
                          {accountStatus.requirements.currentlyDue.slice(0, 3).map((req: string, idx: number) => (
                            <li key={idx}>{req.replace(/_/g, ' ')}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  <Button
                    onClick={async () => {
                      try {
                        const result = await stripeConnectService.createOnboardingLink()
                        if (result.onboardingUrl) {
                          window.open(result.onboardingUrl, '_blank', 'noopener,noreferrer')
                        }
                      } catch (err: any) {
                        setError(err.message || 'Failed to continue onboarding')
                      }
                    }}
                    className="mt-3"
                    size="sm"
                  >
                    Complete KYC Verification
                  </Button>
                </div>
              </div>
            </div>
          )}

          {accountStatus && accountStatus.kycVerified && !accountStatus.payoutsEnabled && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Add Withdrawal Method</p>
                  <p className="text-sm text-blue-700 mt-1">
                    KYC verification is complete! Add a bank account or debit card to receive payouts.
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        const result = await stripeConnectService.createAccountUpdateLink()
                        if (result.updateUrl) {
                          window.open(result.updateUrl, '_blank', 'noopener,noreferrer')
                        }
                      } catch (err: any) {
                        setError(err.message || 'Failed to add withdrawal method')
                      }
                    }}
                    className="mt-3"
                    size="sm"
                  >
                    Add Withdrawal Method
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Ready to Withdraw Balance */}
          {paymentStatus && paymentStatus.ready.totalAmount > 0 && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-green-800 font-medium">Ready to Withdraw</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {formatCurrency(paymentStatus.ready.totalAmount, paymentStatus.currency)}
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    {paymentStatus.ready.count} payment{paymentStatus.ready.count !== 1 ? 's' : ''} available
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              {canRequestPayout && (
                <Button
                  onClick={() => setShowPayoutDialog(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Withdraw Now
                </Button>
              )}
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
                    for 72-hour period
                  </p>
                </div>
                <Clock className="w-10 h-10 text-blue-600" />
              </div>

              <div className="mt-4 space-y-3">
                {paymentStatus.pending.payments.slice(0, 3).map((payment) => {
                  const hoursRemaining = timeUntilReady[payment.bookingId] ?? payment.hoursUntilReady
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
                            {formatTimeRemaining(hoursRemaining)}
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
                  <strong>Automatic System:</strong> Payments automatically become available for withdrawal 72 hours
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
                    <div>
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
