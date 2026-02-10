'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HostGuard } from '@/components/auth/host-guard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  User,
  MapPin,
  Calendar,
  ChefHat,
  Star,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Home,
  Shield,
  CreditCard,
  Building,
} from 'lucide-react'
import { authService } from '@/lib/auth-service'
import { payoutService } from '@/lib/payout-service'
import { toast } from 'sonner'

export default function HostOnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
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
    payoutCurrency: 'EUR',
    payoutMethod: 'LOCAL',
    payoutCountry: 'ES', // Default for now
    payoutEntityType: 'INDIVIDUAL',
    airwallexBeneficiaryId: '',
  })

  const handleInputChange = (field: string, value: any) => {
    setHostData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => currentStep < 5 && setCurrentStep(currentStep + 1)
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1)

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return hostData.fullName && hostData.email && hostData.phone && hostData.bio
      case 2:
        return hostData.address && hostData.city && hostData.state
      case 4:
        return hostData.termsAccepted
      case 5:
        // Either Airwallex SDK verified OR manual bank details filled
        if (hostData.airwallexBeneficiaryId) return true
        return !!(hostData.bankName && hostData.accountHolderName && hostData.iban && hostData.swiftBic)
      default:
        return true
    }
  }

  const handleFinish = async () => {
    if (!isStepComplete()) return

    setIsLoading(true)
    try {
      // 1. Sync payout details with backend and Airwallex
      await payoutService.updatePayoutDetails({
        bankName: hostData.bankName,
        accountHolderName: hostData.accountHolderName,
        iban: hostData.iban,
        swiftBic: hostData.swiftBic,
        payoutAddress: hostData.payoutAddress,
        payoutCountry: hostData.payoutCountry,
        payoutCurrency: hostData.payoutCurrency,
        payoutMethod: hostData.payoutMethod,
        payoutEntityType: hostData.payoutEntityType,
        airwallexBeneficiaryId: hostData.airwallexBeneficiaryId,
      })

      toast.success('Onboarding complete! Your bank details are synced.')

      // 2. Redirect to dashboard
      router.push('/host/dashboard')
    } catch (error: any) {
      console.error('Onboarding finish error:', error)
      toast.error(error.message || 'Failed to complete onboarding. Please try again.')
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
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep ? 'bg-primary-600 text-white' : 'bg-muted text-muted-foreground'}`}
                  >
                    {step === 5 ? <CreditCard className="w-4 h-4" /> : step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${step < currentStep ? 'bg-primary-600' : 'bg-muted'}`}
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

            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                  <CardDescription>
                    Configure where you want to receive your earnings. We use Airwallex for secure payouts to Iceland.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payout Preferences */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="payoutCurrency">Payout Currency</Label>
                      <select
                        id="payoutCurrency"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={hostData.payoutCurrency || 'EUR'}
                        onChange={(e) => handleInputChange('payoutCurrency', e.target.value)}
                      >
                        <option value="EUR">Euro (EUR)</option>
                        <option value="ISK">Icelandic Króna (ISK)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">Prices on the site are in EUR.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payoutMethod">Transfer Method</Label>
                      <select
                        id="payoutMethod"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={hostData.payoutMethod || 'LOCAL'}
                        onChange={(e) => handleInputChange('payoutMethod', e.target.value)}
                      >
                        <option value="LOCAL">Local Transfer (Fast & Free)</option>
                        <option value="SWIFT">SWIFT (International)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payout Region/Entity Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="payoutCountry">Bank Country / Region</Label>
                      <select
                        id="payoutCountry"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={hostData.payoutCountry || 'IS'}
                        onChange={(e) => handleInputChange('payoutCountry', e.target.value)}
                      >
                        <option value="IS">Iceland (IS)</option>
                        <option value="ES">Spain (ES)</option>
                        <option value="GB">United Kingdom (GB)</option>
                        <option value="US">United States (US)</option>
                        {/* More countries can be added here */}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payoutEntityType">Recipient Type</Label>
                      <select
                        id="payoutEntityType"
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={hostData.payoutEntityType || 'INDIVIDUAL'}
                        onChange={(e) => handleInputChange('payoutEntityType', e.target.value)}
                      >
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="BUSINESS">Business</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Bank Details</Label>

                    {hostData.airwallexBeneficiaryId ? (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-primary">Verification Successful</p>
                          <p className="text-sm text-muted-foreground">
                            Your bank account is linked (ID: {hostData.airwallexBeneficiaryId.substring(0, 8)}...)
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleInputChange('airwallexBeneficiaryId', '')}>
                          Change
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Manual Bank Details Entry */}
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
                        </div>

                        {/* Divider with OR */}
                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">or verify automatically</span>
                          </div>
                        </div>

                        {/* Airwallex SDK Option */}
                        <div className="border-2 border-dashed border-muted rounded-xl p-6 text-center space-y-3">
                          <CreditCard className="w-10 h-10 mx-auto text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">Secure Bank Verification via Airwallex</p>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                              Use our partner Airwallex to verify your bank details securely and instantly.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                setIsLoading(true)
                                const { authCode, codeVerifier, clientId } = await payoutService.getAirwallexAuthCode() as any

                                const Airwallex = await import('@airwallex/components-sdk')
                                await Airwallex.init({
                                  env: 'demo',
                                  origin: window.location.origin,
                                  authCode,
                                  codeVerifier,
                                  clientId,
                                })

                                const element = (await Airwallex.createElement('beneficiaryForm')) as any
                                element.mount('airwallex-beneficiary-container')

                                element.on('ready', () => {
                                  setIsLoading(false)
                                  document.getElementById('airwallex-beneficiary-container')?.scrollIntoView({ behavior: 'smooth' })
                                })

                                element.on('success', (event: any) => {
                                  handleInputChange('airwallexBeneficiaryId', event.detail.beneficiary_id)
                                  if (event.detail.entity_type) {
                                    handleInputChange('payoutEntityType', event.detail.entity_type)
                                  }
                                  toast.success('Bank details verified successfully!')
                                })

                                element.on('error', (event: any) => {
                                  toast.error(event.detail.message || 'Verification failed')
                                })
                              } catch (error: any) {
                                setIsLoading(false)
                                toast.error('Failed to initialize verification: ' + error.message)
                              }
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Loading...' : 'Launch Secure Verification'}
                          </Button>
                        </div>
                      </>
                    )}
                    <div id="airwallex-beneficiary-container" className="min-h-[400px] empty:hidden border rounded-xl p-4 bg-white" />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">Secure Icelandic Payouts</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        We support local ISK transfers and EUR transfers. Processing time is usually 24-48 hours after dinner completion.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <div className="text-center py-12">
                <ChefHat className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-medium">Menu and Availability</h3>
                <p className="text-muted-foreground">This section will be configured in your dashboard.</p>
              </div>
            )}

            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Terms and Conditions</CardTitle>
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
          </section>

          <footer className="flex items-center justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              onClick={currentStep === 5 ? handleFinish : nextStep}
              disabled={!isStepComplete() || isLoading}
            >
              {currentStep === 5 ? (isLoading ? 'Saving...' : 'Finish') : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </footer>
        </main>
      </div>
    </HostGuard>
  )
}
