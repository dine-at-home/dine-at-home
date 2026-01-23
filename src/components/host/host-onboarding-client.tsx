'use client'

import { useState } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Check,
  ChevronsUpDown,
  Camera,
} from 'lucide-react'
import { authService } from '@/lib/auth-service'
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
  { label: 'Iceland', value: 'Iceland' },
  // ... (keeping it short for now)
]

export default function HostOnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [openCountry, setOpenCountry] = useState(false)
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
    country: 'United States',
    timezone: 'America/New_York',
    directions: '',
    accessibility: '',
    maxCapacity: 8,
    priceRange: 'moderate',
    cuisineTypes: [] as string[],
    dietaryAccommodations: [] as string[],
    termsAccepted: false,
    bankName: '',
    accountHolderName: '',
    iban: '',
    swiftBic: '',
    payoutAddress: '',
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
        return hostData.address && hostData.city && hostData.state && hostData.zipCode
      case 4:
        return hostData.termsAccepted
      case 5:
        return !!(
          hostData.bankName &&
          hostData.accountHolderName &&
          hostData.iban &&
          hostData.swiftBic &&
          hostData.payoutAddress
        )
      default:
        return true
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
                    {step}
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={hostData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    value={hostData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  {/* ... other fields ... */}
                </CardContent>
              </Card>
            )}
          </section>

          <footer className="flex items-center justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button onClick={nextStep} disabled={!isStepComplete()}>
              {currentStep === 5 ? 'Finish' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </footer>
        </main>
      </div>
    </HostGuard>
  )
}
