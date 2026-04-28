'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { HostGuard } from '@/components/auth/host-guard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { payoutService, type PayoutSettings } from '@/lib/payout-service'
import { PaystraxWidget } from '@/components/booking/paystrax-widget'
import {
  CARD_REGISTRATION_RETURN_TO_KEY,
} from '@/components/host/host-card-registration-step'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const RETURN_TO = '/host/payouts/settings'
const AUTOSAVE_DEBOUNCE_MS = 600

type StepKey = 'identity' | 'card' | 'details'

type RafraenWidgetState =
  | { phase: 'idle' }
  | { phase: 'starting' }
  | { phase: 'redirecting'; mock: boolean }

type CardWidgetState =
  | { phase: 'idle' }
  | { phase: 'starting' }
  | {
      phase: 'mounted'
      checkoutId: string
      scriptUrl: string
      shopperResultUrl: string
      brands: string
    }

function StatusPill({
  tone,
  label,
}: {
  tone: 'success' | 'pending' | 'neutral'
  label: string
}) {
  const palette = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    neutral: 'bg-stone-100 text-stone-600 border-stone-200',
  }[tone]
  const dot = {
    success: 'bg-emerald-500',
    pending: 'bg-amber-500',
    neutral: 'bg-stone-400',
  }[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${palette}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function StepShell({
  number,
  done,
  icon: Icon,
  title,
  subtitle,
  status,
  children,
}: {
  number: number
  done: boolean
  icon: typeof ShieldCheck
  title: string
  subtitle: string
  status: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 transition-colors"
      data-step={number}
      data-done={done ? 'true' : 'false'}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition ${
              done
                ? 'bg-primary text-primary-foreground'
                : 'border border-stone-300 bg-white text-stone-500'
            }`}
            aria-label={`Step ${number}${done ? ' complete' : ''}`}
          >
            {done ? <Check className="h-3.5 w-3.5" /> : number}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-stone-500" />
              <h2 className="font-semibold leading-none">{title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="shrink-0">{status}</div>
      </header>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function PayoutSettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<PayoutSettings | null>(null)
  const [rafraen, setRafraen] = useState<RafraenWidgetState>({ phase: 'idle' })
  const [card, setCard] = useState<CardWidgetState>({ phase: 'idle' })
  const [details, setDetails] = useState({
    accountHolderName: '',
    taxId: '',
    payoutAddress: '',
  })
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const refresh = async () => {
    const res = await payoutService.getSettings()
    if (res.success && res.data) {
      setSettings(res.data)
      setDetails((prev) => ({
        accountHolderName: prev.accountHolderName || res.data?.accountHolderName || '',
        taxId: prev.taxId || res.data?.taxId || '',
        payoutAddress: prev.payoutAddress || res.data?.payoutAddress || '',
      }))
    }
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  // Returning from Rafræn callback. Auðkenni redirects through the backend → /host/onboarding/rafraen-callback
  // which can then bounce here with ?rafraen=success. Refresh settings so the card flips to "verified".
  useEffect(() => {
    const flag = searchParams?.get('rafraen')
    if (flag === 'success') {
      toast.success('Identity verified with Rafræn skilríki')
      refresh()
    } else if (flag === 'error') {
      toast.error(searchParams?.get('reason') || 'Verification failed')
    }
  }, [searchParams])

  const identityDone = Boolean(settings?.rafraenSkilrikiVerifiedAt)
  const cardDone = Boolean(settings?.hasCardRegistered)
  const detailsDone = Boolean(
    details.accountHolderName.trim() && details.payoutAddress.trim()
  )
  const stepsDone = [identityDone, cardDone, detailsDone].filter(Boolean).length
  const allDone = stepsDone === 3 && settings?.kycStatus === 'VERIFIED'

  const handleStartRafraen = async () => {
    setRafraen({ phase: 'starting' })
    const res = await payoutService.startRafraen()
    if (!res.success || !res.data) {
      setRafraen({ phase: 'idle' })
      toast.error(res.error || 'Could not start verification')
      return
    }
    setRafraen({ phase: 'redirecting', mock: res.data.mockMode })
    // Full-page redirect; Auðkenni (or the mock) sends the user back to our callback which bounces here.
    window.location.href = res.data.authorizeUrl
  }

  const handleRegisterCard = async () => {
    setCard({ phase: 'starting' })
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CARD_REGISTRATION_RETURN_TO_KEY, RETURN_TO)
    }
    const res = await payoutService.initiateCardRegistration()
    if (!res.success || !res.data) {
      setCard({ phase: 'idle' })
      toast.error(res.error || 'Could not start card registration')
      return
    }
    setCard({
      phase: 'mounted',
      checkoutId: res.data.checkoutId,
      scriptUrl: res.data.scriptUrl,
      shopperResultUrl: res.data.shopperResultUrl,
      brands: res.data.brands,
    })
  }

  // Debounced autosave for recipient details. Only saves when something changed.
  const initialDetailsRef = useRef<typeof details | null>(null)
  useEffect(() => {
    if (!settings) return
    if (!initialDetailsRef.current) {
      initialDetailsRef.current = {
        accountHolderName: settings.accountHolderName ?? '',
        taxId: settings.taxId ?? '',
        payoutAddress: settings.payoutAddress ?? '',
      }
      return
    }
    const baseline = initialDetailsRef.current
    const changed =
      baseline.accountHolderName !== details.accountHolderName ||
      baseline.taxId !== details.taxId ||
      baseline.payoutAddress !== details.payoutAddress
    if (!changed) return
    if (!details.accountHolderName.trim() || !details.payoutAddress.trim()) return

    const timer = setTimeout(async () => {
      const res = await payoutService.updateSettings({
        accountHolderName: details.accountHolderName,
        taxId: details.taxId,
        payoutAddress: details.payoutAddress,
      })
      if (res.success && res.data) {
        setSettings((prev) => (prev ? { ...prev, ...res.data } : prev))
        initialDetailsRef.current = { ...details }
        setSavedAt(Date.now())
      } else {
        toast.error(res.error || 'Failed to save recipient details')
      }
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [details, settings])

  // Fade out the "Saved" indicator a moment after each save.
  const showSaved = useMemo(() => {
    if (!savedAt) return false
    return Date.now() - savedAt < 1500
  }, [savedAt])

  return (
    <HostGuard>
      <MainLayout>
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/host/payouts')}
              className="-ml-2 text-muted-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Payouts
            </Button>
          </div>

          <header className="mb-6 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Get paid</h1>
            <p className="text-muted-foreground">
              Three steps. Once you're done, payouts run automatically after every dinner.
            </p>
          </header>

          <div
            className={`mb-6 rounded-xl border p-4 transition-colors ${
              allDone
                ? 'border-emerald-200 bg-emerald-50/60'
                : 'border-stone-200 bg-stone-50/70'
            }`}
            role="status"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                {allDone ? (
                  <span className="font-medium text-emerald-800">
                    You're verified — payouts run automatically after each dinner.
                  </span>
                ) : (
                  <span className="font-medium">
                    {stepsDone} of 3 complete
                    <span className="ml-2 text-muted-foreground">
                      Finish the remaining steps to enable payouts.
                    </span>
                  </span>
                )}
              </div>
              {allDone && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  allDone ? 'bg-emerald-500' : 'bg-primary'
                }`}
                style={{ width: `${(stepsDone / 3) * 100}%` }}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-stone-200 bg-white py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="space-y-3">
              {/* ① Identity (Rafræn) */}
              <StepShell
                number={1}
                done={identityDone}
                icon={ShieldCheck}
                title="Identity"
                subtitle="Verify your kennitala via Rafræn skilríki — required by Icelandic law."
                status={
                  identityDone ? (
                    <StatusPill tone="success" label="Verified" />
                  ) : settings?.kycStatus === 'IN_REVIEW' ? (
                    <StatusPill tone="pending" label="In review" />
                  ) : (
                    <StatusPill tone="neutral" label="Required" />
                  )
                }
              >
                {identityDone ? (
                  <div className="flex items-center justify-between rounded-lg bg-stone-50 p-3 text-sm">
                    <span className="text-stone-700">
                      Verified {settings?.rafraenSkilrikiVerifiedAt
                        ? new Date(settings.rafraenSkilrikiVerifiedAt).toLocaleDateString(
                            undefined,
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )
                        : ''}
                    </span>
                    <button
                      onClick={handleStartRafraen}
                      className="text-xs text-stone-500 underline-offset-4 hover:text-stone-700 hover:underline"
                    >
                      Re-verify
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={handleStartRafraen}
                    disabled={rafraen.phase !== 'idle'}
                    className="w-full sm:w-auto"
                  >
                    {rafraen.phase === 'idle' && (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Start verification
                      </>
                    )}
                    {rafraen.phase === 'starting' && (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting to Auðkenni…
                      </>
                    )}
                    {rafraen.phase === 'redirecting' && (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting…
                      </>
                    )}
                  </Button>
                )}
              </StepShell>

              {/* ② Payout card */}
              <StepShell
                number={2}
                done={cardDone}
                icon={CreditCard}
                title="Payout card"
                subtitle="A Visa or Mastercard. Earnings settle in ISK and arrive after each dinner."
                status={
                  cardDone ? (
                    <StatusPill tone="success" label="Saved" />
                  ) : (
                    <StatusPill tone="neutral" label="Required" />
                  )
                }
              >
                {card.phase === 'mounted' ? (
                  <div className="rounded-lg border border-stone-200 bg-stone-50/40 p-4">
                    <p className="mb-3 text-sm text-muted-foreground">
                      You'll be charged 1.00 in {/* registrationCurrency */}EUR to verify the
                      card; the authorization is reversed immediately.
                    </p>
                    <PaystraxWidget
                      checkoutId={card.checkoutId}
                      scriptUrl={card.scriptUrl}
                      shopperResultUrl={card.shopperResultUrl}
                      brands={card.brands}
                    />
                  </div>
                ) : cardDone ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 rounded-lg bg-stone-50 px-3 py-2 text-sm">
                      <div className="flex h-7 w-10 items-center justify-center rounded bg-stone-900 text-[10px] font-bold uppercase tracking-wider text-white">
                        {settings?.payoutCardBrand || 'CARD'}
                      </div>
                      <span className="font-medium tabular-nums">
                        •••• {settings?.payoutCardLast4 || '••••'}
                      </span>
                    </div>
                    <button
                      onClick={handleRegisterCard}
                      disabled={card.phase === 'starting'}
                      className="text-xs text-stone-500 underline-offset-4 hover:text-stone-700 hover:underline"
                    >
                      {card.phase === 'starting' ? 'Loading…' : 'Replace card'}
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={handleRegisterCard}
                    disabled={card.phase === 'starting'}
                    className="w-full sm:w-auto"
                  >
                    {card.phase === 'starting' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading widget…
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Register card
                      </>
                    )}
                  </Button>
                )}
              </StepShell>

              {/* ③ Recipient details */}
              <StepShell
                number={3}
                done={detailsDone}
                icon={UserRound}
                title="Recipient details"
                subtitle="These travel with each transfer and must match the cardholder."
                status={
                  detailsDone ? (
                    <StatusPill tone="success" label={showSaved ? 'Saved' : 'Saved'} />
                  ) : (
                    <StatusPill tone="neutral" label="Required" />
                  )
                }
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cardholderName">Cardholder name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="e.g. Jón Jónsson"
                      value={details.accountHolderName}
                      onChange={(e) =>
                        setDetails((prev) => ({ ...prev, accountHolderName: e.target.value }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Must match the name printed on your payout card.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="kennitala">Tax ID (kennitala)</Label>
                    <Input
                      id="kennitala"
                      placeholder="e.g. 010101-2570"
                      value={details.taxId}
                      onChange={(e) =>
                        setDetails((prev) => ({ ...prev, taxId: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payoutAddress">Registered address</Label>
                    <Input
                      id="payoutAddress"
                      placeholder="e.g. Laugavegur 1, 101 Reykjavík"
                      value={details.payoutAddress}
                      onChange={(e) =>
                        setDetails((prev) => ({ ...prev, payoutAddress: e.target.value }))
                      }
                    />
                  </div>
                  <p
                    className={`text-xs text-stone-500 transition-opacity duration-300 ${
                      showSaved ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    ✓ Saved
                  </p>
                </div>
              </StepShell>
            </div>
          )}
        </div>
      </MainLayout>
    </HostGuard>
  )
}
