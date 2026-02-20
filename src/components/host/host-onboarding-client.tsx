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
      // For Stripe Connect, we don't need to sync bank details manually anymore.
      // We just mark onboarding as completed in the backend.
      // (Backend logic should be updated if needed, but for now we'll just redirect)

      toast.success('Onboarding complete! Welcome to Dine at Home.')

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
                    We use Stripe Connect to handle secure payouts to our hosts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 border-2 border-dashed border-muted rounded-xl text-center space-y-4">
                    <CreditCard className="w-12 h-12 mx-auto text-primary" />
                    <div>
                      <p className="font-semibold text-lg">Set up your Payouts</p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        To receive payments from your guests, you need to set up a Stripe Connect account.
                        This is quick, secure, and ensures you get paid directly to your bank account.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3 text-left">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <p className="text-xs text-blue-800">
                        You can complete this step now or skip and finish it later in your host dashboard.
                        Note that payouts will only be enabled after completion.
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
