'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { HostGuard } from '@/components/auth/host-guard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  Camera,
  Upload,
  ChefHat,
  Heart,
  Star,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Home,
  Shield,
  Loader2,
  Check,
  ChevronsUpDown,
} from 'lucide-react'
import Image from 'next/image'
import { stripeConnectService } from '@/lib/stripe-connect-service'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/components/ui/utils'

const countries = [
  { label: 'United States', value: 'United States' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Italy', value: 'Italy' },
  { label: 'Spain', value: 'Spain' },
  { label: 'Japan', value: 'Japan' },
  { label: 'China', value: 'China' },
  { label: 'India', value: 'India' },
  { label: 'Brazil', value: 'Brazil' },
  { label: 'Mexico', value: 'Mexico' },
  { label: 'Netherlands', value: 'Netherlands' },
  { label: 'Sweden', value: 'Sweden' },
  { label: 'Switzerland', value: 'Switzerland' },
  { label: 'Belgium', value: 'Belgium' },
  { label: 'Denmark', value: 'Denmark' },
  { label: 'Norway', value: 'Norway' },
  { label: 'Finland', value: 'Finland' },
  { label: 'Ireland', value: 'Ireland' },
  { label: 'New Zealand', value: 'New Zealand' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'South Korea', value: 'South Korea' },
  { label: 'Portugal', value: 'Portugal' },
  { label: 'Greece', value: 'Greece' },
  { label: 'Austria', value: 'Austria' },
  { label: 'Poland', value: 'Poland' },
  { label: 'Czech Republic', value: 'Czech Republic' },
  { label: 'Hungary', value: 'Hungary' },
  { label: 'Turkey', value: 'Turkey' },
  { label: 'Thailand', value: 'Thailand' },
  { label: 'Vietnam', value: 'Vietnam' },
  { label: 'Indonesia', value: 'Indonesia' },
  { label: 'Malaysia', value: 'Malaysia' },
  { label: 'Philippines', value: 'Philippines' },
  { label: 'Argentina', value: 'Argentina' },
  { label: 'Chile', value: 'Chile' },
  { label: 'Colombia', value: 'Colombia' },
  { label: 'Peru', value: 'Peru' },
  { label: 'South Africa', value: 'South Africa' },
  { label: 'Egypt', value: 'Egypt' },
  { label: 'United Arab Emirates', value: 'United Arab Emirates' },
  { label: 'Saudi Arabia', value: 'Saudi Arabia' },
  { label: 'Israel', value: 'Israel' },
] as const

function HostOnboardingPageContent() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [openCountry, setOpenCountry] = useState(false)
  const [hostData, setHostData] = useState({
    // Step 1: Personal Info
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: '',

    // Step 2: Location & Availability
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    timezone: 'America/New_York',
    directions: '',
    accessibility: '',

    // Step 3: Hosting Preferences
    maxCapacity: 8,
    priceRange: 'moderate',
    cuisineTypes: [] as string[],
    dietaryAccommodations: [] as string[],

    // Step 4: Verification
    idVerification: false,
    backgroundCheck: false,
    termsAccepted: false,

    // Step 5: Stripe Connect
    stripeConnected: false,
    bankAccount: '',
    taxId: '',
  })

  const cuisineTypes = [
    'Italian',
    'French',
    'Japanese',
    'Chinese',
    'Indian',
    'Mexican',
    'Mediterranean',
    'American',
    'Thai',
    'Korean',
    'Spanish',
    'Greek',
    'Lebanese',
    'Ethiopian',
    'Vietnamese',
    'Fusion',
    'Other',
  ]

  const dietaryAccommodations = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Kosher',
    'Halal',
    'Low-Sodium',
    'Diabetic-Friendly',
  ]

  const handleInputChange = (field: string, value: any) => {
    setHostData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCuisineToggle = (cuisine: string) => {
    setHostData((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter((c) => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }))
  }

  const handleDietaryToggle = (dietary: string) => {
    setHostData((prev) => ({
      ...prev,
      dietaryAccommodations: prev.dietaryAccommodations.includes(dietary)
        ? prev.dietaryAccommodations.filter((d) => d !== dietary)
        : [...prev.dietaryAccommodations, dietary],
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    // TODO: Submit to backend
    console.log('Host onboarding completed:', hostData)
    router.push('/host/dashboard')
  }

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
        <CardDescription>Tell us about yourself as a host</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Image */}
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={hostData.profileImage} alt={hostData.fullName} />
            <AvatarFallback>
              {hostData.fullName ? hostData.fullName.charAt(0) : <User className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" className="gap-2">
              <Camera className="w-4 h-4" />
              Upload Photo
            </Button>
            <p className="text-sm text-muted-foreground mt-2">Add a professional photo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <Input
              value={hostData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <Input
              type="email"
              value={hostData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number *</label>
            <Input
              type="tel"
              value={hostData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio *</label>
          <Textarea
            value={hostData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about your cooking experience, passion for food, and what makes your dinners special..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location & Availability
        </CardTitle>
        <CardDescription>Where will you host your dinners?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Country *</label>
          <Popover open={openCountry} onOpenChange={setOpenCountry}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCountry}
                className="w-full justify-between"
              >
                {hostData.country
                  ? countries.find((country) => country.value === hostData.country)?.label
                  : 'Select country...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.value}
                        value={country.value}
                        onSelect={(currentValue) => {
                          handleInputChange(
                            'country',
                            currentValue === hostData.country ? '' : currentValue
                          )
                          setOpenCountry(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            hostData.country === country.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {country.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <Input
              value={hostData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Area/Neighborhood *</label>
            <Input
              value={hostData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Neighborhood in New York"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Street Address *</label>
          <Input
            value={hostData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 Main Street"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            This address will not be visible to guests until their booking is confirmed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">ZIP/Postal Code *</label>
            <Input
              value={hostData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              placeholder="10001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timezone *</label>
            <Select
              value={hostData.timezone}
              onValueChange={(value) => handleInputChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Directions & Access</label>
          <Textarea
            value={hostData.directions}
            onChange={(e) => handleInputChange('directions', e.target.value)}
            placeholder="Parking instructions, building access, elevator usage, etc."
            rows={3}
            className="resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Accessibility Information</label>
          <Textarea
            value={hostData.accessibility}
            onChange={(e) => handleInputChange('accessibility', e.target.value)}
            placeholder="Wheelchair access, stairs, special accommodations available..."
            rows={3}
            className="resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Maximum Capacity *</label>
          <Select
            value={hostData.maxCapacity.toString()}
            onValueChange={(value) => handleInputChange('maxCapacity', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 guests</SelectItem>
              <SelectItem value="6">6 guests</SelectItem>
              <SelectItem value="8">8 guests</SelectItem>
              <SelectItem value="10">10 guests</SelectItem>
              <SelectItem value="12">12 guests</SelectItem>
              <SelectItem value="15">15 guests</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="w-5 h-5" />
          Hosting Preferences
        </CardTitle>
        <CardDescription>What type of dining experiences will you offer?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Cuisine Types *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cuisineTypes.map((cuisine) => (
              <Button
                key={cuisine}
                variant={hostData.cuisineTypes.includes(cuisine) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCuisineToggle(cuisine)}
                className="justify-start"
              >
                {cuisine}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Dietary Accommodations</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietaryAccommodations.map((dietary) => (
              <Button
                key={dietary}
                variant={hostData.dietaryAccommodations.includes(dietary) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDietaryToggle(dietary)}
                className="justify-start"
              >
                {dietary}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price Range *</label>
          <Select
            value={hostData.priceRange}
            onValueChange={(value) => handleInputChange('priceRange', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="budget">Budget (€20-40 per person)</SelectItem>
              <SelectItem value="moderate">Moderate (€40-80 per person)</SelectItem>
              <SelectItem value="premium">Premium (€80-150 per person)</SelectItem>
              <SelectItem value="luxury">Luxury (€150+ per person)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Verification & Terms
        </CardTitle>
        <CardDescription>Complete verification to become a verified host</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium">Identity Verification</p>
                <p className="text-sm text-muted-foreground">Upload a government-issued ID</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Upload ID
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium">Background Check</p>
                <p className="text-sm text-muted-foreground">Complete background verification</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Start Check
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={hostData.termsAccepted}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
              className="mt-1"
            />
            <div>
              <p className="text-sm">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:underline">
                  Host Agreement
                </a>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const handleConnectStripe = async () => {
    try {
      setConnectingStripe(true)
      const result = await stripeConnectService.createOnboardingLink()
      if (result.onboardingUrl) {
        // Open Stripe onboarding in new tab
        window.open(result.onboardingUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error: any) {
      console.error('Error connecting Stripe:', error)
      alert(error.message || 'Failed to connect Stripe account')
    } finally {
      setConnectingStripe(false)
    }
  }

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-5 h-5 text-lg font-bold">€</span>
          Payment Setup
        </CardTitle>
        <CardDescription>Connect your Stripe account to receive payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="w-8 h-8 text-primary-600 text-2xl font-bold">€</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Stripe Account</h3>
          <p className="text-muted-foreground mb-6">
            Secure payment processing with automatic commission splits. You'll be redirected to
            Stripe to complete the setup.
          </p>
          <Button
            size="lg"
            className="gap-2"
            onClick={handleConnectStripe}
            disabled={connectingStripe}
          >
            {connectingStripe ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect Stripe Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
          {hostData.stripeConnected && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Stripe account connected</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Stripe Connect allows you to receive payments directly. The
            platform takes a {process.env.NEXT_PUBLIC_STRIPE_PLATFORM_FEE || '15'}% commission fee,
            and the rest is transferred to your connected account.
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const getStepTitle = () => {
    const titles = [
      'Personal Information',
      'Location & Availability',
      'Hosting Preferences',
      'Verification & Terms',
      'Payment Setup',
    ]
    return titles[currentStep - 1]
  }

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return hostData.fullName && hostData.email && hostData.phone && hostData.bio
      case 2:
        return hostData.address && hostData.city && hostData.state && hostData.zipCode
      case 3:
        return hostData.cuisineTypes.length > 0 && hostData.priceRange
      case 4:
        return hostData.termsAccepted
      case 5:
        return true // Stripe connection is optional for now
      default:
        return false
    }
  }

  return (
    <HostGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
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
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        step < currentStep ? 'bg-primary-600' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center mt-4 text-lg font-medium">{getStepTitle()}</p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button onClick={nextStep} disabled={!isStepComplete()} className="gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={completeOnboarding} disabled={!isStepComplete()} className="gap-2">
                Complete Onboarding
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </HostGuard>
  )
}

export default function HostOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <HostOnboardingPageContent />
    </Suspense>
  )
}
