'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowLeft,
  CreditCard,
  Loader2,
  ShieldCheck,
  Star,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import {
  paymentMethodService,
  type SavedPaymentMethod,
} from '@/lib/payment-service'

const formatExpiry = (m?: string | null, y?: string | null) => {
  if (!m || !y) return ''
  const yy = y.length === 4 ? y.slice(2) : y
  return `${m.padStart(2, '0')}/${yy}`
}

const brandLabel = (brand: string) => {
  const upper = brand.toUpperCase()
  if (upper === 'MASTER') return 'Mastercard'
  if (upper === 'VISA') return 'Visa'
  return upper
}

export default function PaymentMethodsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/profile/payment-methods')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const result = await paymentMethodService.list()
      if (cancelled) return
      if (result.success && result.data) {
        setMethods(result.data)
      } else {
        setError(result.error || 'Failed to load payment methods')
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const refresh = async () => {
    const result = await paymentMethodService.list()
    if (result.success && result.data) setMethods(result.data)
  }

  const handleDelete = async (id: string) => {
    setPendingId(id)
    setError(null)
    const result = await paymentMethodService.remove(id)
    if (result.success) {
      setMethods((prev) => prev.filter((m) => m.id !== id))
    } else {
      setError(result.error || 'Failed to remove card')
    }
    setPendingId(null)
    setConfirmId(null)
  }

  const handleSetDefault = async (id: string) => {
    setPendingId(id)
    setError(null)
    const result = await paymentMethodService.setDefault(id)
    if (result.success) {
      await refresh()
    } else {
      setError(result.error || 'Failed to set default')
    }
    setPendingId(null)
  }

  const cardToConfirm = methods.find((m) => m.id === confirmId) || null

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/profile?tab=settings')}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to profile
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">
            Saved cards for faster checkout. We never store your full card number — only a secure
            token from our payment provider.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Your Cards
            </CardTitle>
            <CardDescription>
              Cards you choose to save during checkout appear here for one-tap reuse.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading cards…
              </div>
            ) : methods.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No saved cards yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  When you book a dinner you'll have the option to save your card for next time.
                </p>
                <Button className="mt-4" onClick={() => router.push('/search')}>
                  Browse dinners
                </Button>
              </div>
            ) : (
              methods.map((m) => {
                const isPending = pendingId === m.id
                return (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-xl"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex-shrink-0 w-12 h-8 rounded-md bg-muted flex items-center justify-center text-xs font-bold tracking-wider">
                        {brandLabel(m.brand)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">•••• {m.last4}</p>
                          {m.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="w-3 h-3 mr-1 fill-current" /> Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.holder ? `${m.holder} · ` : ''}
                          {formatExpiry(m.expiryMonth, m.expiryYear) || 'Expiry unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      {!m.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(m.id)}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Set default'
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/40 hover:bg-destructive hover:text-white"
                        onClick={() => setConfirmId(m.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}

            <div className="flex items-start gap-2 pt-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
              <p>
                Card numbers are stored by our PCI-DSS compliant payment provider Paystrax. DatHome
                only sees the last 4 digits and a secure token used for future charges.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this card?</DialogTitle>
            <DialogDescription>
              {cardToConfirm
                ? `${brandLabel(cardToConfirm.brand)} ending in ${cardToConfirm.last4} will be removed and can no longer be used for one-tap booking.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmId(null)}
              disabled={pendingId === confirmId}
            >
              Keep card
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmId && handleDelete(confirmId)}
              disabled={pendingId === confirmId}
            >
              {pendingId === confirmId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing…
                </>
              ) : (
                'Remove card'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
