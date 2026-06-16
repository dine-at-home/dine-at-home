'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'

import { Dinner, NavigationParams } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { bookingService } from '@/lib/booking-service'
import { dispatchBookingCreated } from '@/lib/booking-events'
import {
  paymentService,
  paymentMethodService,
  saveCardIntent,
  type SavedPaymentMethod,
} from '@/lib/payment-service'
import { PaystraxWidget } from './paystrax-widget'

interface BookingProps {
  dinner: Dinner
  date?: Date
  guests: number
  onNavigate: (page: string, params?: NavigationParams) => void
}

export function Booking({ dinner, date, guests, onNavigate }: BookingProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [saveCard, setSaveCard] = useState(false)
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([])
  // 'new' = enter a new card; otherwise the PaymentMethod id of a saved card.
  const [paymentChoice, setPaymentChoice] = useState<'new' | string>('new')
  const [paystraxSession, setPaystraxSession] = useState<{
    bookingId: string
    checkoutId: string
    scriptUrl: string
    shopperResultUrl: string
    brands: string
    isSavedCard: boolean
  } | null>(null)

  // Pre-fill guest details from user profile (only if fields are empty)
  useEffect(() => {
    if (user) {
      setGuestDetails((prev) => {
        // Only pre-fill if all fields are currently empty (user hasn't started editing)
        if (prev.firstName || prev.lastName || prev.email || prev.phone) {
          return prev // Don't overwrite if user has already entered data
        }

        // Split name into first and last name
        let firstName = ''
        let lastName = ''
        if (user.name) {
          const nameParts = user.name.trim().split(/\s+/)
          if (nameParts.length > 0) {
            firstName = nameParts[0]
            if (nameParts.length > 1) {
              lastName = nameParts.slice(1).join(' ')
            }
          }
        }

        return {
          firstName: firstName,
          lastName: lastName,
          email: user.email || '',
          phone: user.phone || '',
          specialRequests: prev.specialRequests, // Preserve special requests if any
        }
      })
    }
  }, [user]) // Run when user object changes

  // Load the guest's saved cards so we can offer one-click checkout.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const result = await paymentMethodService.list()
      if (cancelled) return
      if (result.success && result.data) {
        setSavedMethods(result.data)
        const defaultMethod = result.data.find((m) => m.isDefault) || result.data[0]
        if (defaultMethod) setPaymentChoice(defaultMethod.id)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  // Pricing model: guest pays subtotal + platform service fee on top. Backend is authoritative;
  // this display mirrors the dinner detail page so the guest sees the same number end-to-end.
  // Keep PLATFORM_FEE_PERCENTAGE in sync if you change it server-side.
  const PLATFORM_FEE_PERCENT = 20
  const subtotal = dinner.price * guests
  const serviceFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100))
  const total = subtotal + serviceFee

  const handleGuestDetailsSubmit = () => {
    if (
      guestDetails.firstName &&
      guestDetails.lastName &&
      guestDetails.email &&
      guestDetails.phone
    ) {
      // Skip payment step and go directly to booking confirmation
      handleBookingConfirm()
    }
  }

  const handleBookingConfirm = async () => {
    if (!user) {
      setError('Please sign in to make a booking')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (!guestDetails.phone || guestDetails.phone.trim() === '') {
        setError('Phone number is required to complete the booking')
        setIsSubmitting(false)
        return
      }

      const bookingResult = await bookingService.createBooking({
        dinnerId: dinner.id,
        guests,
        message: guestDetails.specialRequests || undefined,
        contactInfo: {
          name: `${guestDetails.firstName} ${guestDetails.lastName}`.trim(),
          email: guestDetails.email,
          phone: guestDetails.phone,
        },
      })

      if (!bookingResult.success || !bookingResult.data?.id) {
        setError(bookingResult.error || 'Failed to create booking')
        setIsSubmitting(false)
        return
      }

      const bookingId = bookingResult.data.id
      dispatchBookingCreated(dinner.id, bookingId)

      const isSavedCard = paymentChoice !== 'new'
      const paymentResult = await paymentService.initiatePayment(bookingId, {
        paymentMethodId: isSavedCard ? paymentChoice : undefined,
      })
      if (!paymentResult.success || !paymentResult.data) {
        setError(paymentResult.error || 'Failed to start payment')
        setIsSubmitting(false)
        return
      }

      // Reset save-card intent for this booking; user will re-tick on the widget step.
      saveCardIntent.set(bookingId, false)
      setSaveCard(false)
      setPaystraxSession({ ...paymentResult.data, bookingId, isSavedCard })
      setIsSubmitting(false)
    } catch (err: any) {
      console.error('Booking error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <Button
          variant="ghost"
          onClick={() => onNavigate('dinner-detail', { dinner })}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to dinner</span>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6">
            {paystraxSession ? (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Payment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your card details below. Your card will be authorized for kr {total} now;
                    it is only captured once the host confirms your reservation.
                  </p>
                  <div
                    className="flex items-center gap-3 mb-4 rounded-lg border bg-muted/30 px-3 py-2"
                    aria-label="Accepted payment methods"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-11 rounded bg-[#1A1F71] flex items-center justify-center" aria-label="Visa">
                        <span className="text-white font-bold text-xs italic tracking-tight">VISA</span>
                      </div>
                      <div className="h-7 w-11 rounded bg-[#252525] flex items-center justify-center relative overflow-hidden" aria-label="Mastercard">
                        <div className="absolute left-1.5 w-4 h-4 rounded-full bg-[#EB001B]" />
                        <div className="absolute right-1.5 w-4 h-4 rounded-full bg-[#F79E1B] mix-blend-screen" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We accept Visa and Mastercard. Card brand is detected automatically.
                    </p>
                  </div>
                  <PaystraxWidget
                    checkoutId={paystraxSession.checkoutId}
                    scriptUrl={paystraxSession.scriptUrl}
                    shopperResultUrl={paystraxSession.shopperResultUrl}
                    brands={paystraxSession.brands}
                  />
                  {!paystraxSession.isSavedCard && (
                    <div className="mt-4 flex items-start space-x-3 rounded-lg border bg-muted/30 p-3">
                      <input
                        type="checkbox"
                        id="save-card"
                        checked={saveCard}
                        onChange={(e) => {
                          setSaveCard(e.target.checked)
                          saveCardIntent.set(paystraxSession.bookingId, e.target.checked)
                        }}
                        className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                      />
                      <label
                        htmlFor="save-card"
                        className="text-sm leading-relaxed cursor-pointer"
                      >
                        <span className="font-medium">Save this card for faster checkout next time.</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          DatHome never stores your card number — only a secure token from Paystrax
                          plus the last 4 digits.
                        </span>
                      </label>
                    </div>
                  )}
                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    By clicking “Pay now” you confirm you have read and agree to our{' '}
                    <a href="/terms-of-use" className="underline hover:text-foreground">
                      Terms of Use
                    </a>
                    ,{' '}
                    <a href="/refund-policy" className="underline hover:text-foreground">
                      Refund &amp; Cancellation Policy
                    </a>
                    , and{' '}
                    <a href="/privacy-policy" className="underline hover:text-foreground">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </CardContent>
              </Card>
            ) : (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Guest Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First name *</Label>
                    <Input
                      id="firstName"
                      value={guestDetails.firstName}
                      onChange={(e) =>
                        setGuestDetails((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last name *</Label>
                    <Input
                      id="lastName"
                      value={guestDetails.lastName}
                      onChange={(e) =>
                        setGuestDetails((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestDetails.email}
                    onChange={(e) =>
                      setGuestDetails((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={guestDetails.phone}
                    onChange={(e) =>
                      setGuestDetails((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requests" className="text-sm font-medium">
                    Special requests or dietary restrictions
                  </Label>
                  <Textarea
                    id="requests"
                    value={guestDetails.specialRequests}
                    onChange={(e) =>
                      setGuestDetails((prev) => ({ ...prev, specialRequests: e.target.value }))
                    }
                    placeholder="Let the host know about any allergies, dietary preferences, or special requests..."
                    rows={4}
                    className="mt-2 resize-none"
                  />
                </div>

                {savedMethods.length > 0 && (
                  <div className="space-y-2">
                    <Label>Payment method</Label>
                    <div className="space-y-2">
                      {savedMethods.map((m) => {
                        const checked = paymentChoice === m.id
                        const yy = m.expiryYear?.length === 4 ? m.expiryYear.slice(2) : m.expiryYear
                        return (
                          <label
                            key={m.id}
                            htmlFor={`pm-${m.id}`}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                            }`}
                          >
                            <input
                              type="radio"
                              id={`pm-${m.id}`}
                              name="payment-choice"
                              checked={checked}
                              onChange={() => setPaymentChoice(m.id)}
                              className="h-4 w-4 accent-primary"
                            />
                            {m.brand === 'VISA' ? (
                              <div className="flex-shrink-0 h-8 w-12 rounded-md bg-[#1A1F71] flex items-center justify-center" aria-label="Visa">
                                <span className="text-white font-bold text-xs italic tracking-tight">VISA</span>
                              </div>
                            ) : m.brand === 'MASTER' || m.brand === 'MASTERCARD' ? (
                              <div className="flex-shrink-0 h-8 w-12 rounded-md bg-[#252525] flex items-center justify-center relative overflow-hidden" aria-label="Mastercard">
                                <div className="absolute left-1.5 w-4 h-4 rounded-full bg-[#EB001B]" />
                                <div className="absolute right-1.5 w-4 h-4 rounded-full bg-[#F79E1B] mix-blend-screen" />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-8 w-12 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold tracking-wider px-1">
                                {m.brand}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">•••• {m.last4}</p>
                              {m.expiryMonth && yy && (
                                <p className="text-xs text-muted-foreground">
                                  Expires {m.expiryMonth.padStart(2, '0')}/{yy}
                                </p>
                              )}
                            </div>
                            {m.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </label>
                        )
                      })}
                      <label
                        htmlFor="pm-new"
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          paymentChoice === 'new' ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                        }`}
                      >
                        <input
                          type="radio"
                          id="pm-new"
                          name="payment-choice"
                          checked={paymentChoice === 'new'}
                          onChange={() => setPaymentChoice('new')}
                          className="h-4 w-4 accent-primary"
                        />
                        <div className="flex-shrink-0 w-12 h-8 rounded-md border border-dashed flex items-center justify-center text-xs font-bold">
                          NEW
                        </div>
                        <p className="text-sm font-medium">Use a different card</p>
                      </label>
                    </div>
                  </div>
                )}


                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms-agree"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                  />
                  <label htmlFor="terms-agree" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <Link href="/terms-of-use" target="_blank" className="text-primary underline hover:no-underline">
                      Terms of Use
                    </Link>
                    ,{' '}
                    <Link href="/refund-policy" target="_blank" className="text-primary underline hover:no-underline">
                      Refund & Cancellation Policy
                    </Link>
                    , and{' '}
                    <Link href="/privacy-policy" target="_blank" className="text-primary underline hover:no-underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button
                  onClick={handleGuestDetailsSubmit}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  disabled={
                    !agreedToTerms ||
                    !guestDetails.firstName ||
                    !guestDetails.lastName ||
                    !guestDetails.email ||
                    !guestDetails.phone ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
                {error && (
                  <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-4 sm:p-6">
                {/* Dinner Info */}
                <div className="flex space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="relative w-16 h-12 sm:w-20 sm:h-16 bg-muted rounded-lg">
                    {dinner.thumbnail || (dinner.images && dinner.images.length > 0) ? (
                      <Image
                        src={dinner.thumbnail || dinner.images[0]}
                        alt={dinner.title}
                        fill
                        sizes="80px"
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-xs">No image</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm line-clamp-2">
                      {dinner.title}
                    </h3>
                    <div className="flex items-center space-x-1 mt-1">
                      <Avatar className="w-3 h-3 sm:w-4 sm:h-4">
                        <AvatarImage
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                          alt={dinner.host.name}
                        />
                        <AvatarFallback>{dinner.host.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{dinner.host.name}</span>
                    </div>
                  </div>
                </div>

                <Separator className="mb-4 sm:mb-6" />

                {/* Booking Details */}
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {date
                        ? date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        : 'Date not selected'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="font-medium">{dinner.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {guests} {guests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span>
                      {dinner.location.neighborhood}, {dinner.location.city}
                    </span>
                  </div>
                </div>

                <Separator className="mb-4 sm:mb-6" />

                {/* Price Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>
                      kr {dinner.price} x {guests} guests
                    </span>
                    <span>kr {subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>kr {serviceFee}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>kr {total}</span>
                  </div>
                </div>

                {/* Cancellation Policy */}
                {dinner.cancellationPolicy && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                      <div className="text-xs">
                        <span className="font-medium">
                          {dinner.cancellationPolicy === 'flexible'
                            ? 'Free cancellation'
                            : dinner.cancellationPolicy === 'moderate'
                              ? 'Moderate cancellation'
                              : 'Cancellation policy'}
                        </span>
                        <p className="text-muted-foreground mt-1">
                          {dinner.cancellationPolicy === 'flexible'
                            ? 'Cancel up to 24 hours before your dinner for a full refund.'
                            : dinner.cancellationPolicy === 'moderate'
                              ? 'Full refund if cancelled 5+ days before. No refund if cancelled less than 5 days before.'
                              : 'Please check cancellation policy details.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
