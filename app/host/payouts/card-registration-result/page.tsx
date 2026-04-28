'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { HostGuard } from '@/components/auth/host-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { payoutService } from '@/lib/payout-service'
import { CARD_REGISTRATION_RETURN_TO_KEY } from '@/components/host/host-card-registration-step'

type Phase = 'finalizing' | 'success' | 'failed'

function CardRegistrationResultBody() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<Phase>('finalizing')
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState<{ brand: string | null; last4: string | null }>({
    brand: null,
    last4: null,
  })
  const finalized = useRef(false)

  useEffect(() => {
    if (finalized.current) return
    finalized.current = true

    const resourcePath = searchParams?.get('resourcePath')
    const registrationRef = searchParams?.get('ref')
    if (!resourcePath || !registrationRef) {
      setPhase('failed')
      setError('Missing resourcePath or ref query parameters')
      return
    }

    payoutService
      .finalizeCardRegistration({ resourcePath, registrationRef })
      .then((res) => {
        if (!res.success || !res.data) {
          setPhase('failed')
          setError(res.error || 'Card registration failed')
          return
        }
        setCard({ brand: res.data.payoutCardBrand, last4: res.data.payoutCardLast4 })
        setPhase('success')
      })
      .catch((err: any) => {
        setPhase('failed')
        setError(err?.message || 'Card registration failed')
      })
  }, [searchParams])

  const returnTo =
    typeof window !== 'undefined'
      ? sessionStorage.getItem(CARD_REGISTRATION_RETURN_TO_KEY) || '/host/payouts/settings'
      : '/host/payouts/settings'

  const handleContinue = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CARD_REGISTRATION_RETURN_TO_KEY)
    }
    router.push(returnTo)
  }

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="pt-8 pb-8 space-y-5">
            {phase === 'finalizing' && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Finishing card registration…</span>
              </div>
            )}

            {phase === 'success' && (
              <>
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                  <p className="font-medium text-foreground">
                    Payout card registered successfully
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {card.brand || 'Card'} •••• {card.last4 || '••••'} — future payouts will be sent to
                  this card. The temporary verification charge has been refunded; you will not see
                  it on your statement.
                </p>
                <Button onClick={handleContinue} className="w-full">
                  Continue
                </Button>
              </>
            )}

            {phase === 'failed' && (
              <>
                <div className="flex items-center gap-3 text-destructive">
                  <XCircle className="w-6 h-6" />
                  <p className="font-medium text-foreground">Card registration failed</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {error ||
                    'The card was declined or the request was malformed. You can try again.'}
                </p>
                <Button variant="outline" onClick={handleContinue} className="w-full">
                  Back to payout settings
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function CardRegistrationResultPage() {
  return (
    <HostGuard>
      <Suspense
        fallback={
          <MainLayout>
            <div className="max-w-xl mx-auto px-4 py-12 text-muted-foreground">Loading…</div>
          </MainLayout>
        }
      >
        <CardRegistrationResultBody />
      </Suspense>
    </HostGuard>
  )
}
