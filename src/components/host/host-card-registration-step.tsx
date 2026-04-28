'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { payoutService, type CardRegistrationInitResponse } from '@/lib/payout-service'
import { PaystraxWidget } from '@/components/booking/paystrax-widget'

const RETURN_TO_KEY = 'datthome.cardRegistrationReturnTo'

export interface HostCardRegistrationStepProps {
  hasCardRegistered: boolean
  cardBrand?: 'VISA' | 'MASTER' | null
  cardLast4?: string | null
  // Where the user should land after the widget redirects through /host/payouts/card-registration-result
  returnTo: string
  // Called after the user clicks the "Register card" button (not after the widget completes — the
  // widget redirects to a separate result page; the parent will see updates on its next mount).
  onLaunch?: () => void
}

/**
 * Two-state UI:
 *   1. No card on file → "Register card" button which opens the COPYandPAY widget inline.
 *   2. Card on file    → display brand + last4 with a "Replace card" button.
 *
 * The widget itself runs a 1-ISK PA + createRegistration; the auth is reversed on finalize.
 */
export function HostCardRegistrationStep({
  hasCardRegistered,
  cardBrand,
  cardLast4,
  returnTo,
  onLaunch,
}: HostCardRegistrationStepProps) {
  const [launching, setLaunching] = useState(false)
  const [init, setInit] = useState<CardRegistrationInitResponse | null>(null)
  const launchedRef = useRef(false)

  useEffect(() => {
    if (init && typeof window !== 'undefined') {
      sessionStorage.setItem(RETURN_TO_KEY, returnTo)
    }
  }, [init, returnTo])

  const handleLaunch = async () => {
    if (launchedRef.current) return
    launchedRef.current = true
    setLaunching(true)
    onLaunch?.()
    try {
      const res = await payoutService.initiateCardRegistration()
      if (!res.success || !res.data) {
        toast.error(res.error || 'Could not start card registration')
        launchedRef.current = false
        setLaunching(false)
        return
      }
      setInit(res.data)
    } catch (err: any) {
      toast.error(err?.message || 'Could not start card registration')
      launchedRef.current = false
      setLaunching(false)
    }
  }

  if (init) {
    return (
      <div className="border border-input rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          <p className="font-medium">Enter your payout card</p>
        </div>
        <p className="text-sm text-muted-foreground">
          You will be charged ISK 1 to verify the card; the authorization is reversed immediately.
        </p>
        <PaystraxWidget
          checkoutId={init.checkoutId}
          scriptUrl={init.scriptUrl}
          shopperResultUrl={init.shopperResultUrl}
          brands={init.brands}
        />
      </div>
    )
  }

  if (hasCardRegistered) {
    return (
      <div className="border border-input rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium">Payout card on file</p>
            <p className="text-sm text-muted-foreground">
              {cardBrand || 'Card'} •••• {cardLast4 || '••••'} — payouts will land on this card.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLaunch} disabled={launching}>
          {launching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading…
            </>
          ) : (
            'Replace card'
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="border border-input rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-muted-foreground" />
        <p className="font-medium">Register your payout card</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Add a Visa or Mastercard. Payouts (settled in ISK) land on this card after each completed
        dinner.
      </p>
      <Button onClick={handleLaunch} disabled={launching} className="w-full">
        {launching ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading widget…
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Register payout card
          </>
        )}
      </Button>
    </div>
  )
}

export const CARD_REGISTRATION_RETURN_TO_KEY = RETURN_TO_KEY
