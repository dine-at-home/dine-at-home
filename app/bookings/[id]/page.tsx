'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageLayout } from '@/components/layout/page-layout'
import { useAuth } from '@/contexts/auth-context'
import { getApiUrl } from '@/lib/api-config'
import { transformDinner } from '@/lib/dinner-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  ArrowLeft,
  User,
  ChefHat,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import Image from 'next/image'
import { formatFriendlyDateTime } from '@/lib/dinner-utils'

function BookingDetailPageContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const bookingId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string)
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || !user?.id) {
        setError('Booking ID or user not found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('auth_token')
        if (!token) {
          setError('Authentication required')
          setLoading(false)
          return
        }

        // Fetch user bookings and find the one with matching ID
        const response = await fetch(getApiUrl(`/bookings/user/${user.id}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (result.success && result.data) {
          const foundBooking = result.data.find((b: any) => b.id === bookingId)
          if (foundBooking) {
            setBooking(foundBooking)
          } else {
            setError('Booking not found')
          }
        } else {
          setError(result.error || 'Failed to load booking')
        }
      } catch (err: any) {
        console.error('Error fetching booking:', err)
        setError('Failed to load booking. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, user?.id])

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    if (normalizedStatus === 'CONFIRMED') return 'bg-blue-500 text-white'
    if (normalizedStatus === 'PENDING') return 'bg-yellow-100 text-yellow-800'
    if (normalizedStatus === 'CANCELLED') return 'bg-red-100 text-red-800'
    if (normalizedStatus === 'COMPLETED') return 'bg-green-100 text-green-800 font-semibold'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    if (normalizedStatus === 'CONFIRMED') return <CheckCircle className="w-4 h-4" />
    if (normalizedStatus === 'CANCELLED') return <XCircle className="w-4 h-4" />
    if (normalizedStatus === 'PENDING') return <AlertCircle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </PageLayout>
    )
  }

  if (error || !booking) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Booking Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "The booking you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push('/profile?tab=bookings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
      </PageLayout>
    )
  }

  const dinner = booking.dinner
  if (!dinner) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Dinner Not Found</h1>
          <p className="text-muted-foreground mb-4">The dinner for this booking is no longer available.</p>
          <Button onClick={() => router.push('/profile?tab=bookings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
        </div>
      </PageLayout>
    )
  }

  const location = typeof dinner.location === 'object' ? dinner.location : {}
  const hasConfirmedBooking = booking.status === 'CONFIRMED' || booking.status === 'confirmed'

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/profile?tab=bookings')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Button>

        <div className="space-y-6">
          {/* Booking Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{dinner.title}</CardTitle>
                </div>
                {dinner.thumbnail || (dinner.images && dinner.images.length > 0) ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                    <Image
                      src={dinner.thumbnail || dinner.images[0]}
                      alt={dinner.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFriendlyDateTime(dinner.date, dinner.time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Guests</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {hasConfirmedBooking
                        ? [location.address, location.neighborhood || location.city, location.city, location.state].filter(Boolean).join(', ')
                        : [location.neighborhood || location.city, location.city, location.state].filter(Boolean).join(', ')}
                    </p>
                    {!hasConfirmedBooking && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Full address will be shown after booking is confirmed
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Price</p>
                    <p className="text-sm text-muted-foreground">${booking.totalPrice}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Host Information */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <ChefHat className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Host</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {dinner.host?.image ? (
                      <Image
                        src={dinner.host.image}
                        alt={dinner.host.name || 'Host'}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{dinner.host?.name || 'Unknown Host'}</p>
                  </div>
                </div>
              </div>

              {booking.message && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Special Requests</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{booking.message}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Booking Timeline */}
              <div>
                <h3 className="font-semibold mb-4">Booking Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Booking Created</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.createdAt).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.updatedAt).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}

export default function BookingDetailPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </PageLayout>
      }
    >
      <BookingDetailPageContent />
    </Suspense>
  )
}
