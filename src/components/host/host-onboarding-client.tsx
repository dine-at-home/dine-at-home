'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HostGuard } from '@/components/auth/host-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HostAddressFields } from '@/components/host/host-address-fields'
import { ArrowRight, ArrowLeft, ChefHat, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { authService } from '@/lib/auth-service'
import { toast } from 'sonner'
import { CURRENT_LEGAL_VERSIONS } from '@/lib/legal-document-versions'

const TOTAL_STEPS = 3

export default function HostOnboardingClient() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '', // region
    zipCode: '',
    termsAccepted: false,
  })

  // Resume mid-flow + auto-fill what we already know about the host.
  // If the host's accepted legal versions are stale (or never set), force them
  // back to step 2 regardless of saved progress so they re-accept.
  useEffect(() => {
    if (!user) return
    const u = user as {
      legalAcceptedTermsVersion?: string | null
      legalAcceptedHostAgreementVersion?: string | null
      legalAcceptedLiabilityWaiverVersion?: string | null
    }
    const legalUpToDate =
      u.legalAcceptedTermsVersion === CURRENT_LEGAL_VERSIONS.termsOfUse &&
      u.legalAcceptedHostAgreementVersion === CURRENT_LEGAL_VERSIONS.hostAgreement &&
      u.legalAcceptedLiabilityWaiverVersion === CURRENT_LEGAL_VERSIONS.liabilityWaiver
    const savedStep = Math.min(Math.max(user.hostOnboardingStep || 1, 1), TOTAL_STEPS)
    setCurrentStep(legalUpToDate ? savedStep : Math.min(savedStep, 2))
    setForm((prev) => ({
      ...prev,
      address: prev.address || user.hostAddress || '',
      city: prev.city || user.hostCity || '',
      state: prev.state || user.hostState || '',
      zipCode: prev.zipCode || user.hostZipCode || '',
      termsAccepted: prev.termsAccepted || legalUpToDate,
    }))
  }, [user])

  const set = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        // Region is optional; only city + street address are required.
        return Boolean(form.city.trim() && form.address.trim())
      case 2:
        return form.termsAccepted
      case 3:
        return true
      default:
        return true
    }
  }

  const persistStep = async (step: number, extra: Record<string, unknown> = {}): Promise<boolean> => {
    if (!user) return false
    setSaving(true)
    try {
      const res = await authService.updateProfile(user.id, {
        hostOnboardingStep: step,
        ...extra,
      } as any)
      if (!res.success) {
        toast.error(res.error || 'Could not save your progress')
        return false
      }
      await refreshUser()
      return true
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    if (!isStepComplete() || saving) return
    let saved = false
    if (currentStep === 1) {
      // Save the location alongside step advance. Country is always Iceland.
      saved = await persistStep(2, {
        country: 'Iceland',
        hostAddress: form.address.trim(),
        hostCity: form.city.trim(),
        hostState: form.state.trim(),
        hostZipCode: form.zipCode.trim(),
      })
    } else if (currentStep === 2) {
      saved = await persistStep(3, {
        legalAcceptance: {
          termsOfUseVersion: CURRENT_LEGAL_VERSIONS.termsOfUse,
          hostAgreementVersion: CURRENT_LEGAL_VERSIONS.hostAgreement,
          liabilityWaiverVersion: CURRENT_LEGAL_VERSIONS.liabilityWaiver,
        },
      })
    }
    // Don't advance if the save failed — otherwise the host sees "Almost there"
    // while their acceptance/location never persisted.
    if (!saved) return
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const handleHandoff = () => router.push('/host/payouts/settings')
  const handleSkipForNow = () =>
    router.push('/host/dashboard?tab=earnings&setup=skipped')

  return (
    <HostGuard>
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Become a Host</h1>
            <p className="mt-1 text-muted-foreground">
              Three quick steps and you're ready to set up payouts.
            </p>
          </header>

          <nav className="mb-8" aria-label="Onboarding progress">
            <div className="flex items-center justify-between">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium tabular-nums transition ${
                      step <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  {step < TOTAL_STEPS && (
                    <div
                      className={`mx-2 h-0.5 w-12 ${
                        step < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </nav>

          <section className="mb-8">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Where will you be hosting?</CardTitle>
                  <CardDescription>
                    Your home address — guests only see the neighborhood until they book.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HostAddressFields
                    value={{
                      city: form.city,
                      region: form.state,
                      address: form.address,
                      zipCode: form.zipCode,
                    }}
                    onChange={(next) =>
                      setForm((prev) => ({
                        ...prev,
                        city: next.city,
                        state: next.region,
                        address: next.address,
                        zipCode: next.zipCode,
                      }))
                    }
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Host responsibilities</CardTitle>
                  <CardDescription>
                    As a host you take responsibility for food safety, hygiene, and event execution
                    in your home. Datthome handles payments as Merchant of Record, and may deduct
                    refunds or chargebacks caused by host conduct from your payouts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.termsAccepted}
                      onChange={(e) => set('termsAccepted', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">
                      I accept the{' '}
                      <Link
                        href="/host-agreement"
                        target="_blank"
                        className="text-primary font-medium hover:underline underline-offset-4"
                      >
                        Host Agreement
                      </Link>
                      ,{' '}
                      <Link
                        href="/terms-of-use"
                        target="_blank"
                        className="text-primary font-medium hover:underline underline-offset-4"
                      >
                        Terms of Use
                      </Link>
                      , and{' '}
                      <Link
                        href="/assumption-of-risk"
                        target="_blank"
                        className="text-primary font-medium hover:underline underline-offset-4"
                      >
                        Liability Waiver
                      </Link>
                      , and confirm I'm an Icelandic resident.
                    </span>
                  </label>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardContent className="space-y-6 py-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <ChefHat className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Almost there</h2>
                    <p className="mx-auto max-w-md text-muted-foreground">
                      You can already start drafting dinners. To start receiving payouts, finish a
                      one-time identity check and add your bank account (IBAN). About 3 minutes.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button onClick={handleHandoff} size="lg" className="w-full sm:w-auto">
                      Set up payouts
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <div>
                      <button
                        onClick={handleSkipForNow}
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        I'll do this later
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </section>

          {currentStep !== 3 && (
            <footer className="flex items-center justify-between">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || saving}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={handleNext} disabled={!isStepComplete() || saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </footer>
          )}
        </main>
      </div>
    </HostGuard>
  )
}
