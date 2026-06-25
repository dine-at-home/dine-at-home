'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { HostGuard } from '@/components/auth/host-guard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Landmark,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { payoutService, type PayoutSettings } from '@/lib/payout-service'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const AUTOSAVE_DEBOUNCE_MS = 600

type BankDetails = {
  bankAccountHolder: string
  iban: string
  bankSwiftBic: string
  bankName: string
  taxId: string
}

type BankErrors = Partial<Record<keyof BankDetails, string>>

function normalizeIban(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase()
}

// IBAN check: structural shape + ISO 7064 mod-97 checksum (== 1 when valid).
function isValidIban(raw: string): boolean {
  const iban = normalizeIban(raw)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  const expanded = rearranged.replace(/[A-Z]/g, (c) => (c.charCodeAt(0) - 55).toString())
  // Process in chunks to avoid overflowing Number on the long integer.
  let remainder = 0
  for (const digit of expanded) {
    remainder = (remainder * 10 + Number(digit)) % 97
  }
  return remainder === 1
}

// Icelandic kennitala: 10 digits with a mod-11 check digit in position 9.
function isValidKennitala(raw: string): boolean {
  const k = raw.replace(/\D/g, '')
  if (k.length !== 10) return false
  const weights = [3, 2, 7, 6, 5, 4, 3, 2]
  const sum = weights.reduce((acc, w, i) => acc + w * Number(k[i]), 0)
  const remainder = sum % 11
  const check = remainder === 0 ? 0 : 11 - remainder
  if (check === 10) return false
  return check === Number(k[8])
}

// SWIFT/BIC: 8 or 11 alphanumeric characters.
function isValidSwiftBic(raw: string): boolean {
  return /^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(normalizeIban(raw))
}

// Hosts are paid in ISK by domestic transfer, so the IBAN must be Icelandic.
function validateBankDetails(details: BankDetails): BankErrors {
  const errors: BankErrors = {}

  if (!details.bankAccountHolder.trim()) {
    errors.bankAccountHolder = 'Account holder name is required.'
  }

  const iban = details.iban.trim()
  if (!iban) {
    errors.iban = 'IBAN is required.'
  } else if (!isValidIban(iban)) {
    errors.iban = 'Enter a valid IBAN.'
  } else if (!normalizeIban(iban).startsWith('IS')) {
    errors.iban = 'Enter an Icelandic IBAN (starts with IS).'
  }

  if (details.bankSwiftBic.trim() && !isValidSwiftBic(details.bankSwiftBic)) {
    errors.bankSwiftBic = 'Enter a valid SWIFT/BIC (8 or 11 characters).'
  }

  if (details.taxId.trim() && !isValidKennitala(details.taxId)) {
    errors.taxId = 'Enter a valid kennitala (10 digits).'
  }

  return errors
}

type RafraenWidgetState =
  | { phase: 'idle' }
  | { phase: 'starting' }
  | { phase: 'redirecting'; mock: boolean }

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
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading…
        </div>
      }
    >
      <PayoutSettingsPageInner />
    </Suspense>
  )
}

const TOTAL_STEPS = 2

function PayoutSettingsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<PayoutSettings | null>(null)
  const [rafraen, setRafraen] = useState<RafraenWidgetState>({ phase: 'idle' })
  const [details, setDetails] = useState<BankDetails>({
    bankAccountHolder: '',
    iban: '',
    bankSwiftBic: '',
    bankName: '',
    taxId: '',
  })
  const [touched, setTouched] = useState<Partial<Record<keyof BankDetails, boolean>>>({})
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const bankErrors = useMemo(() => validateBankDetails(details), [details])
  const bankValid = Object.keys(bankErrors).length === 0
  const markTouched = (field: keyof BankDetails) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const refresh = async () => {
    const res = await payoutService.getSettings()
    if (res.success && res.data) {
      setSettings(res.data)
      setDetails((prev) => ({
        bankAccountHolder: prev.bankAccountHolder || res.data?.bankAccountHolder || '',
        iban: prev.iban || res.data?.iban || '',
        bankSwiftBic: prev.bankSwiftBic || res.data?.bankSwiftBic || '',
        bankName: prev.bankName || res.data?.bankName || '',
        taxId: prev.taxId || res.data?.taxId || '',
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
  const bankDone = bankValid
  const stepsDone = [identityDone, bankDone].filter(Boolean).length
  const allDone = stepsDone === TOTAL_STEPS && settings?.kycStatus === 'VERIFIED'
  // Both steps submitted but admin hasn't approved yet — nothing left for the host to do.
  const awaitingReview = stepsDone === TOTAL_STEPS && settings?.kycStatus !== 'VERIFIED'

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

  // Debounced autosave for bank details. Only saves when something changed and the required
  // fields (account holder + IBAN) are present.
  const initialDetailsRef = useRef<typeof details | null>(null)
  useEffect(() => {
    if (!settings) return
    if (!initialDetailsRef.current) {
      initialDetailsRef.current = {
        bankAccountHolder: settings.bankAccountHolder ?? '',
        iban: settings.iban ?? '',
        bankSwiftBic: settings.bankSwiftBic ?? '',
        bankName: settings.bankName ?? '',
        taxId: settings.taxId ?? '',
      }
      return
    }
    const baseline = initialDetailsRef.current
    const changed =
      baseline.bankAccountHolder !== details.bankAccountHolder ||
      baseline.iban !== details.iban ||
      baseline.bankSwiftBic !== details.bankSwiftBic ||
      baseline.bankName !== details.bankName ||
      baseline.taxId !== details.taxId
    if (!changed) return
    // Never persist invalid bank details — inline errors guide the host instead.
    if (Object.keys(validateBankDetails(details)).length > 0) return

    const timer = setTimeout(async () => {
      const res = await payoutService.updateSettings({
        bankAccountHolder: details.bankAccountHolder,
        iban: details.iban,
        bankSwiftBic: details.bankSwiftBic || undefined,
        bankName: details.bankName || undefined,
        taxId: details.taxId || undefined,
      })
      if (res.success && res.data) {
        setSettings((prev) => (prev ? { ...prev, ...res.data } : prev))
        initialDetailsRef.current = { ...details }
        setSavedAt(Date.now())
      } else {
        toast.error(res.error || 'Failed to save bank details')
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
              Two steps. Once you're verified, your earnings are paid to your bank account after
              each dinner.
            </p>
          </header>

          <div
            className={`mb-6 rounded-xl border p-4 transition-colors ${
              allDone
                ? 'border-emerald-200 bg-emerald-50/60'
                : awaitingReview
                  ? 'border-amber-200 bg-amber-50/60'
                  : 'border-stone-200 bg-stone-50/70'
            }`}
            role="status"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                {allDone ? (
                  <span className="font-medium text-emerald-800">
                    You're verified — earnings are paid to your bank account after each dinner.
                  </span>
                ) : awaitingReview ? (
                  <span className="font-medium text-amber-800">
                    Under review
                    <span className="ml-2 font-normal text-amber-700/80">
                      You've completed both steps. We're verifying your details — payouts unlock
                      once approved.
                    </span>
                  </span>
                ) : (
                  <span className="font-medium">
                    {stepsDone} of {TOTAL_STEPS} complete
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
                  allDone ? 'bg-emerald-500' : awaitingReview ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${(stepsDone / TOTAL_STEPS) * 100}%` }}
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

              {/* ② Bank account */}
              <StepShell
                number={2}
                done={bankDone}
                icon={Landmark}
                title="Bank account"
                subtitle="Your IBAN. Earnings are paid here in ISK by bank transfer after each dinner."
                status={
                  bankDone ? (
                    <StatusPill tone="success" label="Saved" />
                  ) : (
                    <StatusPill tone="neutral" label="Required" />
                  )
                }
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bankAccountHolder">Account holder name</Label>
                    <Input
                      id="bankAccountHolder"
                      placeholder="e.g. Jón Jónsson"
                      value={details.bankAccountHolder}
                      onChange={(e) =>
                        setDetails((prev) => ({ ...prev, bankAccountHolder: e.target.value }))
                      }
                      onBlur={() => markTouched('bankAccountHolder')}
                      aria-invalid={Boolean(touched.bankAccountHolder && bankErrors.bankAccountHolder)}
                      className={
                        touched.bankAccountHolder && bankErrors.bankAccountHolder
                          ? 'border-destructive focus-visible:ring-destructive'
                          : ''
                      }
                    />
                    {touched.bankAccountHolder && bankErrors.bankAccountHolder ? (
                      <p className="text-xs text-destructive">{bankErrors.bankAccountHolder}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Must match the name on your bank account.
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      placeholder="e.g. IS14 0159 2600 7654 5510 7303 39"
                      value={details.iban}
                      onChange={(e) => setDetails((prev) => ({ ...prev, iban: e.target.value }))}
                      onBlur={() => markTouched('iban')}
                      aria-invalid={Boolean(touched.iban && bankErrors.iban)}
                      className={
                        touched.iban && bankErrors.iban
                          ? 'border-destructive focus-visible:ring-destructive'
                          : ''
                      }
                    />
                    {touched.iban && bankErrors.iban && (
                      <p className="text-xs text-destructive">{bankErrors.iban}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="bankSwiftBic">SWIFT / BIC (optional)</Label>
                      <Input
                        id="bankSwiftBic"
                        placeholder="e.g. NBIIISRE"
                        value={details.bankSwiftBic}
                        onChange={(e) =>
                          setDetails((prev) => ({ ...prev, bankSwiftBic: e.target.value }))
                        }
                        onBlur={() => markTouched('bankSwiftBic')}
                        aria-invalid={Boolean(touched.bankSwiftBic && bankErrors.bankSwiftBic)}
                        className={
                          touched.bankSwiftBic && bankErrors.bankSwiftBic
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                        }
                      />
                      {touched.bankSwiftBic && bankErrors.bankSwiftBic && (
                        <p className="text-xs text-destructive">{bankErrors.bankSwiftBic}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bankName">Bank name (optional)</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g. Landsbankinn"
                        value={details.bankName}
                        onChange={(e) =>
                          setDetails((prev) => ({ ...prev, bankName: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="kennitala">Tax ID (kennitala)</Label>
                    <Input
                      id="kennitala"
                      placeholder="e.g. 010101-2570"
                      value={details.taxId}
                      onChange={(e) => setDetails((prev) => ({ ...prev, taxId: e.target.value }))}
                      onBlur={() => markTouched('taxId')}
                      aria-invalid={Boolean(touched.taxId && bankErrors.taxId)}
                      className={
                        touched.taxId && bankErrors.taxId
                          ? 'border-destructive focus-visible:ring-destructive'
                          : ''
                      }
                    />
                    {touched.taxId && bankErrors.taxId && (
                      <p className="text-xs text-destructive">{bankErrors.taxId}</p>
                    )}
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

          {allDone ? (
            <div className="mt-8 flex justify-end">
              <Button size="lg" onClick={() => router.push('/host/dinners/create')}>
                Continue — create your first dinner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : awaitingReview ? (
            // Nothing left for the host to do until admin approves — let them leave.
            <div className="mt-8 flex justify-end">
              <Button size="lg" onClick={() => router.push('/host/dashboard')}>
                Go to dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </MainLayout>
    </HostGuard>
  )
}
