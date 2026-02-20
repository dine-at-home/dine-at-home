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
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stripeStatus, setStripeStatus] = useState<any>(null)
  const [balance, setBalance] = useState<HostBalanceResponse | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null)
  const [payouts, setPayouts] = useState<PayoutResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()

    // Check if we just returned from onboarding
    if (searchParams.get('success') === 'true' || searchParams.get('refresh') === 'true') {
      refreshUser()
    }
  }, [hostId, searchParams])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statusData, balanceData, payoutsData] = await Promise.all([
        payoutService.getStripeStatus().catch(() => null),
        payoutService.getHostBalance(hostId).catch(() => null),
        payoutService.getHostPayouts(hostId).catch(() => ({ data: [] }))
      ])

      setStripeStatus(statusData)
      if (balanceData) setBalance(balanceData)
      setPayouts(payoutsData.data || [])
    } catch (err: any) {
      console.error('[Payout] Error loading payout data:', err)
      setError(err.message || 'Failed to load payout data')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    try {
      setConnectingStripe(true)
      setError(null)
      const { url } = await payoutService.createConnectAccount()
      window.location.href = url
    } catch (err: any) {
      setError(err.message || 'Failed to connect Stripe')
      setConnectingStripe(false)
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

  const isFullyOnboarded = stripeStatus?.connected && stripeStatus?.details_submitted && stripeStatus?.payouts_enabled

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Payouts & Earnings
        </CardTitle>
        <CardDescription>
          Payments are automatically transferred to your connected Stripe account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stripe Connection Status */}
        {!isFullyOnboarded ? (
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  {stripeStatus?.connected ? 'Complete Stripe Onboarding' : 'Connect Stripe to Receive Payouts'}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  We use Stripe Connect to handle secure payouts to our hosts.
                  Connection is required to receive payments from your guests.
                </p>
                <Button
                  onClick={handleConnectStripe}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  disabled={connectingStripe}
                >
                  {connectingStripe ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    stripeStatus?.connected ? 'Finish Setup' : 'Connect with Stripe'
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Stripe Account Connected</span>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-300">
              Verified
            </Badge>
          </div>
        )}

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Available for Payout</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(balance?.availableBalance || 0, balance?.currency)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending Balance</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(0, 'eur')}
              </p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Processing (usually 7 days)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Payout History */}
        <div>
          <h3 className="font-semibold mb-4">Recent Payouts</h3>
          {payouts.length === 0 ? (
            <div className="p-8 border rounded-lg border-dashed text-center">
              <p className="text-sm text-muted-foreground">No payout history yet</p>
            </div>
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
                    <p className="text-xs text-muted-foreground">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
