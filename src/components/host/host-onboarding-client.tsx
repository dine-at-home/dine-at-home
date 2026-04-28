'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HostGuard } from '@/components/auth/host-guard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  ArrowLeft,
  Home,
  Shield,
  CreditCard,
  Building,
  BadgeCheck,
  Loader2,
} from 'lucide-react'
import { payoutService, type PayoutSettings } from '@/lib/payout-service'
import { toast } from 'sonner'

const TOTAL_STEPS = 6

export default function HostOnboardingClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [kycStatus, setKycStatus] = useState<PayoutSettings['kycStatus']>('UNVERIFIED')
  const [rafraenVerifiedAt, setRafraenVerifiedAt] = useState<string | null>(null)
  const [hostData, setHostData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Iceland',
    termsAccepted: false,
    bankName: '',
    accountHolderName: '',
    iban: '',
    swiftBic: '',
    payoutAddress: '',
    payoutCurrency: 'ISK',
    payoutMethod: 'LOCAL',
    payoutCountry: 'IS',
    payoutEntityType: 'INDIVIDUAL',
    taxId: '',
  })

  // On mount, and when we return from the Auðkenni callback, refresh verification status.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const [settings, status] = await Promise.all([
        payoutService.getSettings(),
        payoutService.getRafraenStatus(),
      ])
      if (cancelled) return
      if (settings.success && settings.data) {
        setKycStatus(settings.data.kycStatus)
        setRafraenVerifiedAt(settings.data.rafraenSkilrikiVerifiedAt ?? null)
        setHostData((prev) => ({
          ...prev,
          bankName: settings.data?.bankName ?? prev.bankName,
          accountHolderName: settings.data?.accountHolderName ?? prev.accountHolderName,
          iban: settings.data?.iban ?? prev.iban,
          swiftBic: settings.data?.swiftBic ?? prev.swiftBic,
          payoutAddress: settings.data?.payoutAddress ?? prev.payoutAddress,
          payoutCurrency: settings.data?.payoutCurrency ?? prev.payoutCurrency,
          payoutMethod: settings.data?.payoutMethod ?? prev.payoutMethod,
          payoutCountry: settings.data?.payoutCountry ?? prev.payoutCountry,
          payoutEntityType: settings.data?.payoutEntityType ?? prev.payoutEntityType,
          taxId: settings.data?.taxId ?? prev.taxId,
        }))
      }
      if (status.success && status.data) {
        setRafraenVerifiedAt(status.data.verifiedAt ?? null)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Returning from callback — surface a toast and jump to the bank-details step.
  useEffect(() => {
    const verified = searchParams?.get('rafraen')
    if (verified === 'success') {
      toast.success('Identity verified with Rafræn skilríki')
      setCurrentStep(6)
    } else if (verified === 'error') {
      const reason = searchParams?.get('reason') || 'Verification failed'
      toast.error(reason)
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: any) => {
    setHostData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => currentStep < TOTAL_STEPS && setCurrentStep(currentStep + 1)
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1)

  const isRafraenVerified = Boolean(rafraenVerifiedAt)

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return hostData.fullName && hostData.email && hostData.phone && hostData.bio
      case 2:
        return hostData.address && hostData.city && hostData.state
      case 3:
        return true
      case 4:
        return hostData.termsAccepted
      case 5:
        return isRafraenVerified
      case 6:
        return !!(
          hostData.bankName &&
          hostData.accountHolderName &&
          hostData.iban &&
          hostData.swiftBic &&
          hostData.payoutAddress &&
          isRafraenVerified
        )
      default:
        return true
    }
  }

  const handleStartRafraen = async () => {
    try {
      setIsVerifying(true)
      const res = await payoutService.startRafraen()
      if (!res.success || !res.data) {
        toast.error(res.error || 'Could not start verification')
        setIsVerifying(false)
        return
      }
      // Full-page redirect — Auðkenni (or the mock) will redirect back to our callback which then
      // bounces to /host/onboarding/rafraen-callback with ?rafraen=success.
      window.location.href = res.data.authorizeUrl
    } catch (err: any) {
      toast.error(err?.message || 'Could not start verification')
      setIsVerifying(false)
    }
  }

  const handleFinish = async () => {
    if (!isStepComplete()) return
    setIsLoading(true)
    try {
      const res = await payoutService.updateSettings({
        bankName: hostData.bankName,
        accountHolderName: hostData.accountHolderName,
        iban: hostData.iban,
        swiftBic: hostData.swiftBic,
        payoutAddress: hostData.payoutAddress,
        payoutCurrency: hostData.payoutCurrency,
        payoutMethod: hostData.payoutMethod,
        payoutCountry: hostData.payoutCountry,
        payoutEntityType: hostData.payoutEntityType,
        taxId: hostData.taxId,
      })
      if (!res.success) {
        toast.error(res.error || 'Failed to save payout settings')
        return
      }
      if (res.data?.kycStatus) setKycStatus(res.data.kycStatus)
      if (res.data?.kycStatus === 'VERIFIED') {
        toast.success('Payout details saved — you are ready to host')
      } else {
        toast.success('Payout details saved — KYC is under review')
      }
      router.push('/host/dashboard')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save payout settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <HostGuard>
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Become a Host</h1>
                <p className="text-muted-foreground mt-1">
                  Share your passion for food and earn money
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </header>

          <nav className="mb-8" aria-label="Onboarding Progress">
            <div className="flex items-center justify-between">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep ? 'bg-primary-600 text-white' : 'bg-muted text-muted-foreground'}`}
                  >
                    {step === 5 ? (
                      <BadgeCheck className="w-4 h-4" />
                    ) : step === 6 ? (
                      <CreditCard className="w-4 h-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < TOTAL_STEPS && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${step < currentStep ? 'bg-primary-600' : 'bg-muted'}`}
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
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Tell us a bit about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Jane Doe"
                      value={hostData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={hostData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+354 ..."
                      value={hostData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell guests about your cooking style and background..."
                      value={hostData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                  <CardDescription>Where will you be hosting your dinners?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="Laugavegur 1"
                      value={hostData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Reykjavík"
                        value={hostData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Region/State</Label>
                      <Input
                        id="state"
                        placeholder="Capital Region"
                        value={hostData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Menu and Availability</CardTitle>
                  <CardDescription>
                    You'll add your dinners, photos, and schedule from the host dashboard after signup.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Nothing to do here right now — click Next to continue.
                  </p>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Terms and Conditions</CardTitle>
                  <CardDescription>
                    As a host you are responsible for food safety, hygiene, and event execution.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={hostData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="terms">I accept the host terms and conditions</Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Verify Your Identity</CardTitle>
                  <CardDescription>
                    Icelandic law requires hosts to be identified with Rafræn skilríki (electronic ID)
                    before receiving payouts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isRafraenVerified ? (
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/40 rounded-lg flex items-start gap-3">
                      <BadgeCheck className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Identity verified
                        </p>
                        <p className="text-green-700 dark:text-green-300">
                          Verified on {new Date(rafraenVerifiedAt!).toLocaleString()}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            You'll be redirected to Auðkenni
                          </p>
                          <p className="text-blue-700 dark:text-blue-300">
                            Complete the Rafræn skilríki flow on your phone or card reader, then
                            you'll land back here automatically.
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleStartRafraen}
                        disabled={isVerifying}
                        className="w-full"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting...
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="w-4 h-4 mr-2" /> Verify with Rafræn skilríki
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                  <CardDescription>
                    Configure where you want to receive your earnings. Payouts are sent 48 hours after
                    each dinner via Paystrax.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="payoutCurrency">Payout Currency</Label>
                      <select
                        id="payoutCurrency"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={hostData.payoutCurrency}
                        onChange={(e) => handleInputChange('payoutCurrency', e.target.value)}
                      >
                        <option value="ISK">Icelandic Króna (ISK)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Payouts are settled in ISK to Icelandic bank accounts.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payoutMethod">Transfer Method</Label>
                      <select
                        id="payoutMethod"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={hostData.payoutMethod}
                        onChange={(e) => handleInputChange('payoutMethod', e.target.value)}
                      >
                        <option value="LOCAL">Local Transfer (Fast &amp; Free)</option>
                        <option value="SWIFT">SWIFT (International)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="payoutCountry">Bank Country / Region</Label>
                      <select
                        id="payoutCountry"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={hostData.payoutCountry}
                        onChange={(e) => handleInputChange('payoutCountry', e.target.value)}
                      >
                        <option value="IS">Iceland (IS)</option>
                        <option value="ES">Spain (ES)</option>
                        <option value="GB">United Kingdom (GB)</option>
                        <option value="US">United States (US)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payoutEntityType">Recipient Type</Label>
                      <select
                        id="payoutEntityType"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={hostData.payoutEntityType}
                        onChange={(e) => handleInputChange('payoutEntityType', e.target.value)}
                      >
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="BUSINESS">Business</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Bank Details</Label>

                    <div className="border border-input rounded-xl p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="w-5 h-5 text-muted-foreground" />
                        <p className="font-medium">Enter Bank Details</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Provide your bank account details below for receiving payouts.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Bank Name *</Label>
                          <Input
                            id="bankName"
                            placeholder="e.g. Landsbankinn"
                            value={hostData.bankName}
                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                          <Input
                            id="accountHolderName"
                            placeholder="Full name on the account"
                            value={hostData.accountHolderName}
                            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="iban">IBAN *</Label>
                          <Input
                            id="iban"
                            placeholder="IS00 0000 0000 0000 0000 0000 00"
                            value={hostData.iban}
                            onChange={(e) => handleInputChange('iban', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="swiftBic">SWIFT / BIC *</Label>
                          <Input
                            id="swiftBic"
                            placeholder="e.g. LANDISRE"
                            value={hostData.swiftBic}
                            onChange={(e) => handleInputChange('swiftBic', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="payoutAddress">Billing Address *</Label>
                          <Input
                            id="payoutAddress"
                            placeholder="Street, city, postcode"
                            value={hostData.payoutAddress}
                            onChange={(e) => handleInputChange('payoutAddress', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxId">Tax ID / Kennitala</Label>
                          <Input
                            id="taxId"
                            placeholder="000000-0000"
                            value={hostData.taxId}
                            onChange={(e) => handleInputChange('taxId', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">Secure Payouts</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Payouts are released 48 hours after each dinner ends. Minimum payout is 10,000 kr —
                        smaller balances roll over to the next cycle.
                      </p>
                    </div>
                  </div>

                  {kycStatus !== 'VERIFIED' && (
                    <div className="p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 rounded-md text-sm text-amber-900 dark:text-amber-100">
                      Your KYC status is <strong>{kycStatus}</strong>. We'll finish verification once
                      you submit — if the bank details fail validation, an admin will reach out.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </section>

          <footer className="flex items-center justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              onClick={currentStep === TOTAL_STEPS ? handleFinish : nextStep}
              disabled={!isStepComplete() || isLoading}
            >
              {currentStep === TOTAL_STEPS
                ? isLoading
                  ? 'Saving...'
                  : 'Finish'
                : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </footer>
        </main>
      </div>
    </HostGuard>
  )
}
