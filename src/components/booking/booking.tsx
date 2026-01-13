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

  const subtotal = dinner.price * guests
  const serviceFee = Math.round(subtotal * 0.20)
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
      // Validate phone number is provided
      if (!guestDetails.phone || guestDetails.phone.trim() === '') {
        setError('Phone number is required to complete the booking')
        setIsSubmitting(false)
        return
      }

      // Create booking with all details
      const bookingData = {
        dinnerId: dinner.id,
        guests: guests,
        message: guestDetails.specialRequests || undefined,
        contactInfo: {
          name: `${guestDetails.firstName} ${guestDetails.lastName}`,
          email: guestDetails.email,
          phone: guestDetails.phone.trim(),
        },
      }

      const result = await bookingService.createBooking(bookingData)

      console.log('🔵 Booking Response:', result)
      console.log('🔵 Full result.data:', result.data)
      console.log('🔵 result.data.dinnerId:', result.data?.dinnerId)
      console.log('🔵 Component dinner.id:', dinner.id)

      if (result.success && result.data) {
        // Get dinnerId from backend response (REQUIRED - backend must send this)
        // Fallback to component prop only if backend doesn't send it (should not happen)
        const bookedDinnerId = result.data.dinnerId || dinner.id

        console.log('🔵 Using dinnerId:', bookedDinnerId)

        if (!result.data.dinnerId) {
          console.warn(
            '⚠️ Warning: Backend did not return dinnerId in booking response. Using fallback.'
          )
        }

        // Navigate to home page with booking success and dinnerId to remove
        // The home page will filter out this dinnerId immediately
        window.location.href = `/?booking=success&bookedDinnerId=${bookedDinnerId}`
      } else {
        setError(result.error || 'Failed to create booking. Please try again.')
      }
    } catch (err: any) {
      console.error('Booking error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
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

                <Button
                  onClick={handleGuestDetailsSubmit}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                  disabled={
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
                      €{dinner.price} x {guests} guests
                    </span>
                    <span>€{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>€{serviceFee}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>€{total}</span>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                    <div className="text-xs">
                      <span className="font-medium">Free cancellation</span>
                      <p className="text-muted-foreground mt-1">
                        Cancel up to 24 hours before your dinner for a full refund.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
