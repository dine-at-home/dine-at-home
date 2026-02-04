'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Edit3,
  Camera,
  Settings,
  History,
  CreditCard,
  Shield,
  LogOut,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  ChefHat,
  AlertCircle,
  Clock,
  Info,
} from 'lucide-react'
import Image from 'next/image'
import { bookingService } from '@/lib/booking-service'
import { transformDinner, formatFriendlyDateTime } from '@/lib/dinner-utils'
import { getApiUrl } from '@/lib/api-config'

// Mock data for demonstration (fallback only)
const mockBookings = [
  {
    id: '1',
    dinner: {
      title: 'Authentic Italian Pasta Making',
      host: {
        name: 'Marco Rossi',
        avatar: '',
      },
      image:
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&crop=center',
      location: 'Rome, Italy',
      date: '2024-01-15',
      time: '19:00',
      price: 100,
      capacity: 8,
    },
    status: 'completed',
    guests: 2,
    totalAmount: 170,
    paymentStatus: 'paid',
    review: { rating: 5, comment: 'Amazing experience! Marco was a fantastic teacher.' },
  },
  {
    id: '2',
    dinner: {
      title: 'Japanese Sushi Workshop',
      host: {
        name: 'Yuki Tanaka',
        avatar: '',
      },
      image:
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center',
      location: 'Tokyo, Japan',
      date: '2024-02-20',
      time: '18:30',
      price: 120,
      capacity: 6,
    },
    status: 'confirmed',
    guests: 1,
    totalAmount: 120,
    paymentStatus: 'paid',
    review: null,
  },
  {
    id: '3',
    dinner: {
      title: 'French Wine Tasting',
      host: {
        name: 'Pierre Dubois',
        avatar: '',
      },
      image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center',
      location: 'Paris, France',
      date: '2024-01-08',
      time: '20:00',
      price: 95,
      capacity: 10,
    },
    status: 'cancelled',
    guests: 2,
    totalAmount: 190,
    paymentStatus: 'refunded',
    review: null,
  },
]

function ProfilePageContent() {
  const { user, loading, refreshUser, resendOTP } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyEmailError, setVerifyEmailError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
  // Redirect to host dashboard profile tab if user is a host
  useEffect(() => {
    if (user?.role === 'host') {
      router.replace('/host/dashboard?tab=profile')
    }
  }, [user, router])

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [cancelDetails, setCancelDetails] = useState<{
    refundAmount: number
    refundPercentage: number
    message: string
    cancellationPolicy: string
    hoursUntilDinner: number
    daysUntilDinner: number
    dinnerTitle: string
    totalAmount: number
  } | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    gender: '',
    country: '',
    languages: [] as string[],
    profileImage: '',
    memberSince: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update profile data when user loads
  useEffect(() => {
    if (user) {
      // Parse languages if it's an array or JSON string
      let languagesArray: string[] = []
      if (user.languages) {
        if (Array.isArray(user.languages)) {
          languagesArray = user.languages
        } else if (typeof user.languages === 'string') {
          try {
            const parsed = JSON.parse(user.languages)
            languagesArray = Array.isArray(parsed) ? parsed : []
          } catch {
            languagesArray = []
          }
        }
      }

      // Format member since date
      let memberSince = ''
      if (user.createdAt) {
        const date = new Date(user.createdAt)
        // Validate date
        if (!isNaN(date.getTime())) {
          memberSince = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }
      }

      // Debug: Log the user image URL
      if (user.image) {
        console.log('Profile image URL:', user.image)
      }

      setProfileData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        gender: user.gender || '',
        languages: languagesArray,
        profileImage: user.image && user.image.trim() !== '' ? user.image : '',
        memberSince: memberSince,
      }))
    }
  }, [user])

  // Fetch bookings when user is available
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) {
        setBookingsLoading(false)
        return
      }

      try {
        setBookingsLoading(true)
        console.log('🔵 Fetching bookings for user:', user.id)
        const result = await bookingService.getUserBookings(user.id)
        console.log('🔵 Bookings API result:', result)

        if (result.success && result.data) {
          console.log('🔵 Bookings data:', result.data)
          // Transform bookings to match frontend format
          const transformedBookings = result.data.map((booking: any) => {
            console.log('🔵 Processing booking:', booking.id, 'dinner:', booking.dinner)
            console.log('🔵 Backend dinner cancellationPolicy:', booking.dinner?.cancellationPolicy)
            console.log('🔵 Full backend booking object:', JSON.parse(JSON.stringify(booking)))

            // Handle dinner data - backend already transforms it, but we need to ensure compatibility
            let dinner = null
            if (booking.dinner) {
              try {
                // The backend already provides a transformed dinner object
                // We need to adapt it to work with transformDinner or use it directly
                const backendDinner = booking.dinner
                console.log('🔵 Backend dinner object:', {
                  id: backendDinner.id,
                  title: backendDinner.title,
                  cancellationPolicy: backendDinner.cancellationPolicy,
                  hasCancellationPolicy: 'cancellationPolicy' in backendDinner,
                  allKeys: Object.keys(backendDinner),
                  fullDinnerObject: JSON.parse(JSON.stringify(backendDinner)),
                })

                // Use transformDinner if needed, or use the backend format directly
                dinner = transformDinner({
                  ...backendDinner,
                  // Ensure required fields exist
                  description: backendDinner.description || '',
                  cuisine: backendDinner.cuisine || 'Other',
                  capacity: backendDinner.capacity || 0,
                  available: backendDinner.available || 0,
                  instantBook: backendDinner.instantBook || false,
                  rating: backendDinner.rating || 0,
                  reviewCount: backendDinner.reviewCount || 0,
                  cancellationPolicy: backendDinner.cancellationPolicy ?? 'flexible',
                  // Images might already be an array from backend
                  images: Array.isArray(backendDinner.images)
                    ? backendDinner.images
                    : backendDinner.images || [],
                  // Location might already be an object from backend
                  location:
                    typeof backendDinner.location === 'object' ? backendDinner.location : {},
                  // Host is already transformed
                  host: backendDinner.host || {},
                })
                console.log('🔵 Transformed dinner cancellationPolicy:', dinner.cancellationPolicy)
              } catch (error) {
                console.error('Error transforming dinner for booking:', booking.id, error)
                // Fallback: use backend data directly if transform fails
                dinner = {
                  id: booking.dinner.id,
                  title: booking.dinner.title || 'Unknown Dinner',
                  date: booking.dinner.date
                    ? typeof booking.dinner.date === 'string'
                      ? booking.dinner.date.split('T')[0]
                      : new Date(booking.dinner.date).toISOString().split('T')[0]
                    : '',
                  time: booking.dinner.time || '19:00',
                  price: booking.dinner.price || 0,
                  capacity: booking.dinner.capacity || 0,
                  images: Array.isArray(booking.dinner.images) ? booking.dinner.images : [],
                  host: {
                    id: booking.dinner.host?.id || '',
                    name: booking.dinner.host?.name || 'Unknown Host',
                    avatar: booking.dinner.host?.image || undefined,
                    superhost: false,
                    joinedDate: new Date().toISOString(),
                    responseRate: 0,
                    responseTime: 'responds within 24 hours',
                  },
                  location:
                    typeof booking.dinner.location === 'object'
                      ? booking.dinner.location
                      : {
                          address: '',
                          city: '',
                          state: '',
                          neighborhood: '',
                        },
                }
              }
            }

            return {
              id: booking.id,
              status: booking.status?.toLowerCase() || 'pending',
              guests: booking.guests || 1,
              totalAmount: booking.totalPrice || 0,
              dinnerId: dinner?.id || booking.dinnerId,
              dinner: dinner
                ? {
                    id: dinner.id,
                    title: dinner.title,
                    host: {
                      name: dinner.host.name,
                      avatar: dinner.host.avatar || '',
                    },
                    image: dinner.thumbnail || dinner.images?.[0] || null,
                    location:
                      `${dinner.location.neighborhood || ''}, ${dinner.location.city || ''}`.trim() ||
                      'Location not available',
                    date: dinner.date,
                    time: dinner.time,
                    price: dinner.price,
                    capacity: dinner.capacity,
                    cancellationPolicy:
                      dinner.cancellationPolicy ?? booking.dinner?.cancellationPolicy ?? 'flexible',
                  }
                : null,
              review: booking.review
                ? {
                    rating: booking.review.rating,
                    comment: booking.review.comment || '',
                  }
                : null,
              hostReview: booking.hostReview
                ? {
                    rating: booking.hostReview.rating,
                    comment: booking.hostReview.comment || '',
                  }
                : null,
            }
          })

          console.log('🔵 Transformed bookings:', transformedBookings)
          // Verify cancellationPolicy is set in each booking
          transformedBookings.forEach((b: any) => {
            if (b.dinner) {
              console.log('🔵 Verification - Booking dinner cancellationPolicy:', {
                bookingId: b.id,
                cancellationPolicy: b.dinner.cancellationPolicy,
                hasCancellationPolicy: 'cancellationPolicy' in b.dinner,
                dinnerKeys: Object.keys(b.dinner),
              })
            }
          })
          setBookings(transformedBookings)
        } else {
          console.log('🔵 No bookings found or API returned error')
          setBookings([])
        }
      } catch (error) {
        console.error('❌ Error fetching bookings:', error)
        setBookings([])
      } finally {
        setBookingsLoading(false)
      }
    }

    fetchBookings()
  }, [user?.id])

  // Note: Reviews now come with bookings from the backend, so no merging needed

  // Handle review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking || reviewRating === 0) {
      setReviewError('Please select a rating')
      return
    }

    setReviewSubmitting(true)
    setReviewError(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setReviewError('Authentication required. Please sign in again.')
        setReviewSubmitting(false)
        return
      }

      const dinnerId = selectedBooking.dinner?.id || selectedBooking.dinnerId
      if (!dinnerId) {
        setReviewError('Dinner information is missing')
        setReviewSubmitting(false)
        return
      }

      const response = await fetch(getApiUrl('/reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dinnerId,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // If review already exists, refresh bookings to show it
        if (result.code === 'ALREADY_REVIEWED' || result.error?.includes('already reviewed')) {
          // Close the dialog and refresh bookings (reviews are included with bookings)
          setShowReviewDialog(false)
          setSelectedBooking(null)
          setReviewRating(0)
          setReviewComment('')
          setReviewError(null)

          // Refresh bookings (which now include reviews)
          if (user?.id) {
            const bookingsResult = await bookingService.getUserBookings(user.id)
            if (bookingsResult.success && bookingsResult.data) {
              const transformedBookings = bookingsResult.data.map((booking: any) => {
                let dinner = null
                if (booking.dinner) {
                  try {
                    const backendDinner = booking.dinner
                    dinner = transformDinner({
                      ...backendDinner,
                      description: backendDinner.description || '',
                      cuisine: backendDinner.cuisine || 'Other',
                      capacity: backendDinner.capacity || 0,
                      available: backendDinner.available || 0,
                      instantBook: backendDinner.instantBook || false,
                      rating: backendDinner.rating || 0,
                      reviewCount: backendDinner.reviewCount || 0,
                      cancellationPolicy: backendDinner.cancellationPolicy ?? 'flexible',
                      images: Array.isArray(backendDinner.images)
                        ? backendDinner.images
                        : backendDinner.images || [],
                      location:
                        typeof backendDinner.location === 'object' ? backendDinner.location : {},
                      host: backendDinner.host || {},
                    })
                  } catch (error) {
                    console.error('Error transforming dinner:', error)
                    dinner = {
                      id: booking.dinner.id,
                      title: booking.dinner.title || 'Unknown Dinner',
                      date: booking.dinner.date
                        ? typeof booking.dinner.date === 'string'
                          ? booking.dinner.date.split('T')[0]
                          : new Date(booking.dinner.date).toISOString().split('T')[0]
                        : '',
                      time: booking.dinner.time || '19:00',
                      price: booking.dinner.price || 0,
                      capacity: booking.dinner.capacity || 0,
                      images: Array.isArray(booking.dinner.images) ? booking.dinner.images : [],
                      cancellationPolicy: booking.dinner.cancellationPolicy || 'flexible',
                      host: {
                        id: booking.dinner.host?.id || '',
                        name: booking.dinner.host?.name || 'Unknown Host',
                        avatar: booking.dinner.host?.image || undefined,
                      },
                      location:
                        typeof booking.dinner.location === 'object'
                          ? booking.dinner.location
                          : {
                              address: '',
                              city: '',
                              state: '',
                              neighborhood: '',
                            },
                    }
                  }
                }

                // Use the cancellationPolicy directly from the transformed dinner
                // We explicitly pass it to transformDinner, so it should be preserved
                const cancellationPolicy =
                  dinner?.cancellationPolicy ?? booking.dinner?.cancellationPolicy ?? 'flexible'

                // Create the dinner object with cancellationPolicy
                // Use Object.assign to ensure the property is set
                const dinnerObject = dinner
                  ? Object.assign(
                      {
                        id: dinner.id,
                        title: dinner.title,
                        host: {
                          name: dinner.host.name,
                          avatar: dinner.host.avatar || undefined,
                        },
                        image: dinner.thumbnail || dinner.images?.[0] || null,
                        location:
                          `${dinner.location.neighborhood || ''}, ${dinner.location.city || ''}`.trim() ||
                          'Location not available',
                        date: dinner.date,
                        time: dinner.time,
                        price: dinner.price,
                        capacity: dinner.capacity,
                      },
                      { cancellationPolicy: cancellationPolicy }
                    ) // Explicitly set as separate property
                  : null

                // Double-check it's set - force it if needed
                if (dinnerObject) {
                  if (dinnerObject.cancellationPolicy !== cancellationPolicy) {
                    console.warn(
                      '⚠️ WARNING: cancellationPolicy mismatch, forcing correct value:',
                      {
                        expected: cancellationPolicy,
                        actual: dinnerObject.cancellationPolicy,
                        willSet: cancellationPolicy,
                      }
                    )
                  }
                  // Force set it to ensure it's there
                  dinnerObject.cancellationPolicy = cancellationPolicy
                  // Verify it's set
                  if (
                    !dinnerObject.cancellationPolicy ||
                    dinnerObject.cancellationPolicy !== cancellationPolicy
                  ) {
                    console.error(
                      '❌ CRITICAL ERROR: cancellationPolicy still not set after force!',
                      {
                        cancellationPolicy,
                        dinnerObjectKeys: Object.keys(dinnerObject),
                        dinnerObject,
                      }
                    )
                  }
                }

                // CRITICAL: Ensure cancellationPolicy is set - add it explicitly if missing
                if (dinnerObject && !dinnerObject.cancellationPolicy) {
                  console.warn(
                    '⚠️ WARNING: cancellationPolicy missing in dinnerObject, adding it:',
                    {
                      bookingId: booking.id,
                      cancellationPolicy,
                      dinnerObjectKeys: Object.keys(dinnerObject),
                    }
                  )
                  dinnerObject.cancellationPolicy = cancellationPolicy
                }

                console.log('🔵 Final booking transformation:', {
                  bookingId: booking.id,
                  backendDinnerCancellationPolicy: booking.dinner?.cancellationPolicy,
                  transformedDinnerCancellationPolicy: dinner?.cancellationPolicy,
                  finalPolicy: cancellationPolicy,
                  dinnerObjectCancellationPolicy: dinnerObject?.cancellationPolicy,
                  dinnerObjectKeys: dinnerObject ? Object.keys(dinnerObject) : null,
                  dinnerObjectFull: dinnerObject,
                })

                const finalBooking = {
                  id: booking.id,
                  status: booking.status?.toLowerCase() || 'pending',
                  guests: booking.guests || 1,
                  totalAmount: booking.totalPrice || 0,
                  dinner: dinnerObject,
                  dinnerId: dinner?.id || booking.dinnerId,
                  review: booking.review
                    ? {
                        rating: booking.review.rating,
                        comment: booking.review.comment || '',
                      }
                    : null,
                  hostReview: booking.hostReview
                    ? {
                        rating: booking.hostReview.rating,
                        comment: booking.hostReview.comment || '',
                      }
                    : null,
                }

                // Final verification before returning
                if (finalBooking.dinner && !finalBooking.dinner.cancellationPolicy) {
                  console.error('❌ ERROR: cancellationPolicy still missing after setting!', {
                    bookingId: finalBooking.id,
                    dinnerObject: finalBooking.dinner,
                    cancellationPolicy,
                  })
                  // Force set it one more time
                  finalBooking.dinner.cancellationPolicy = cancellationPolicy
                }

                return finalBooking
              })
              setBookings(transformedBookings)
            }
          }
        } else {
          setReviewError(result.error || result.message || 'Failed to submit review')
        }
        setReviewSubmitting(false)
        return
      }

      // Success - refresh bookings and reviews
      setShowReviewDialog(false)
      setSelectedBooking(null)
      setReviewRating(0)
      setReviewComment('')
      setReviewError(null)

      // Refresh bookings to show the new review
      if (user?.id) {
        const bookingsResult = await bookingService.getUserBookings(user.id)
        if (bookingsResult.success && bookingsResult.data) {
          // Transform and update bookings similar to fetchBookings
          const transformedBookings = bookingsResult.data.map((booking: any) => {
            let dinner = null
            if (booking.dinner) {
              try {
                const backendDinner = booking.dinner
                dinner = transformDinner({
                  ...backendDinner,
                  description: backendDinner.description || '',
                  cuisine: backendDinner.cuisine || 'Other',
                  capacity: backendDinner.capacity || 0,
                  available: backendDinner.available || 0,
                  instantBook: backendDinner.instantBook || false,
                  rating: backendDinner.rating || 0,
                  reviewCount: backendDinner.reviewCount || 0,
                  cancellationPolicy: backendDinner.cancellationPolicy ?? 'flexible',
                  images: Array.isArray(backendDinner.images)
                    ? backendDinner.images
                    : backendDinner.images || [],
                  location:
                    typeof backendDinner.location === 'object' ? backendDinner.location : {},
                  host: backendDinner.host || {},
                })
              } catch (error) {
                console.error('Error transforming dinner:', error)
                dinner = {
                  id: booking.dinner.id,
                  title: booking.dinner.title || 'Unknown Dinner',
                  date: booking.dinner.date
                    ? typeof booking.dinner.date === 'string'
                      ? booking.dinner.date.split('T')[0]
                      : new Date(booking.dinner.date).toISOString().split('T')[0]
                    : '',
                  time: booking.dinner.time || '19:00',
                  price: booking.dinner.price || 0,
                  capacity: booking.dinner.capacity || 0,
                  images: Array.isArray(booking.dinner.images) ? booking.dinner.images : [],
                  cancellationPolicy: booking.dinner.cancellationPolicy || 'flexible',
                  host: {
                    id: booking.dinner.host?.id || '',
                    name: booking.dinner.host?.name || 'Unknown Host',
                    avatar: booking.dinner.host?.image || undefined,
                  },
                  location:
                    typeof booking.dinner.location === 'object'
                      ? booking.dinner.location
                      : {
                          address: '',
                          city: '',
                          state: '',
                          neighborhood: '',
                        },
                }
              }
            }

            // Use the cancellationPolicy directly from the transformed dinner
            const cancellationPolicy =
              dinner?.cancellationPolicy ?? booking.dinner?.cancellationPolicy ?? 'flexible'

            return {
              id: booking.id,
              status: booking.status?.toLowerCase() || 'pending',
              guests: booking.guests || 1,
              totalAmount: booking.totalPrice || 0,
              dinner: dinner
                ? {
                    title: dinner.title,
                    host: {
                      name: dinner.host.name,
                      avatar: dinner.host.avatar || undefined,
                    },
                    image: dinner.thumbnail || dinner.images?.[0] || null,
                    location:
                      `${dinner.location.neighborhood || ''}, ${dinner.location.city || ''}`.trim() ||
                      'Location not available',
                    date: dinner.date,
                    time: dinner.time,
                    price: dinner.price,
                    capacity: dinner.capacity,
                    cancellationPolicy: cancellationPolicy,
                  }
                : null,
              dinnerId: dinner?.id || booking.dinnerId,
              review: booking.review
                ? {
                    rating: booking.review.rating,
                    comment: booking.review.comment || '',
                  }
                : null,
              hostReview: booking.hostReview
                ? {
                    rating: booking.hostReview.rating,
                    comment: booking.hostReview.comment || '',
                  }
                : null,
            }
          })
          setBookings(transformedBookings)
        }
      }
    } catch (error: any) {
      console.error('Error submitting review:', error)
      setReviewError(error.message || 'Failed to submit review. Please try again.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  // Fetch reviews when user is available
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.id) {
        setReviewsLoading(false)
        return
      }

      try {
        setReviewsLoading(true)
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setReviewsLoading(false)
          return
        }

        const response = await fetch(getApiUrl(`/users/${user.id}/reviews`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (result.success && result.data) {
          setReviews(result.data)
        } else {
          setReviews([])
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [user?.id])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)
    setPasswordLoading(true)

    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError('All fields are required')
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      setPasswordLoading(false)
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password')
      setPasswordLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token || !user?.id) {
        setPasswordError('Authentication required. Please sign in again.')
        setPasswordLoading(false)
        return
      }

      const response = await fetch(getApiUrl(`/users/${user.id}/change-password`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setPasswordError(result.error || 'Failed to change password. Please try again.')
        setPasswordLoading(false)
        return
      }

      // Success
      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowChangePasswordDialog(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (error: any) {
      console.error('Error changing password:', error)
      setPasswordError('An unexpected error occurred. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    const url = newTab === 'overview' ? '/profile' : `/profile?tab=${newTab}`
    router.replace(url)
  }

  const handleVerifyEmail = async () => {
    if (!user?.email) {
      setVerifyEmailError('Email address not found')
      return
    }

    setVerifyingEmail(true)
    setVerifyEmailError(null)

    try {
      // Send OTP to user's email
      const result = await resendOTP(user.email)

      if (result.success) {
        // Redirect to OTP verification page
        const currentUrl = window.location.pathname + (window.location.search || '')
        const verifyOtpUrl = `/auth/verify-otp?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(currentUrl)}`
        router.push(verifyOtpUrl)
      } else {
        setVerifyEmailError(result.error || 'Failed to send verification code. Please try again.')
      }
    } catch (error: any) {
      console.error('Error sending verification email:', error)
      setVerifyEmailError('An unexpected error occurred. Please try again.')
    } finally {
      setVerifyingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show loading if user is not loaded yet
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Preserve the current URL as callback URL
    const currentUrl = window.location.pathname + (window.location.search || '')
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`)
    return null
  }

  // Redirect to OTP verification if email is not verified
  if (user && !user.emailVerified) {
    const currentUrl = window.location.pathname + (window.location.search || '')
    const verifyOtpUrl = `/auth/verify-otp?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(currentUrl)}`
    router.push(verifyOtpUrl)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to email verification...</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!user?.id) {
      setSaveError('User not found. Please sign in again.')
      return
    }

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setSaveError('Authentication required. Please sign in again.')
        setIsSaving(false)
        return
      }

      // Prepare languages array
      const languagesArray = Array.isArray(profileData.languages) ? profileData.languages : []

      const response = await fetch(getApiUrl(`/users/${user.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name || undefined,
          phone: profileData.phone || null,
          country: profileData.country || undefined,
          gender: profileData.gender || undefined,
          languages: languagesArray.length > 0 ? languagesArray : undefined,
          image: profileData.profileImage || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setSaveError(result.error || 'Failed to save profile. Please try again.')
        setIsSaving(false)
        return
      }

      // Success - refresh user data
      setSaveSuccess(true)
      setIsEditing(false)

      // Refresh user from auth context
      await refreshUser()

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 2000)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      setSaveError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSaveError(null)
    setSaveSuccess(false)
    // Reset form data to user's current data
    if (user) {
      const languagesArray = Array.isArray(user.languages)
        ? user.languages
        : typeof user.languages === 'string'
          ? (() => {
              try {
                const parsed = JSON.parse(user.languages)
                return Array.isArray(parsed) ? parsed : []
              } catch {
                return []
              }
            })()
          : []

      let memberSince = ''
      if (user.createdAt) {
        const date = new Date(user.createdAt)
        memberSince = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }

      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        gender: user.gender || '',
        languages: languagesArray,
        profileImage: user.image && user.image.trim() !== '' ? user.image : '',
        bio: '',
        memberSince: memberSince,
      })
    }
  }

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setSaveError('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setSaveError('Image size must be less than 10MB.')
      return
    }

    setIsUploadingImage(true)
    setSaveError(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setSaveError('Authentication required. Please sign in again.')
        setIsUploadingImage(false)
        return
      }

      // Create FormData for multipart/form-data upload
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'profile') // Indicate this is a profile image

      // Upload image
      const uploadResponse = await fetch(getApiUrl('/upload/image'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResponse.ok) {
        setSaveError(uploadResult.error || 'Failed to upload image. Please try again.')
        setIsUploadingImage(false)
        return
      }

      // Update profile data with new image URL
      if (uploadResult.data?.url) {
        setProfileData((prev) => ({
          ...prev,
          profileImage: uploadResult.data.url,
        }))

        // Automatically save the profile with the new image
        if (user?.id) {
          const saveResponse = await fetch(getApiUrl(`/users/${user.id}`), {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              image: uploadResult.data.url,
            }),
          })

          if (saveResponse.ok) {
            setSaveSuccess(true)
            await refreshUser()
            setTimeout(() => {
              setSaveSuccess(false)
            }, 2000)
          }
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setSaveError('An unexpected error occurred while uploading the image. Please try again.')
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    switch (normalizedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800 font-semibold'
      case 'confirmed':
        return 'bg-blue-500 text-white font-semibold'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and view your dining history
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={
                          user?.image && user.image.trim() !== ''
                            ? user.image
                            : profileData.profileImage && profileData.profileImage.trim() !== ''
                              ? profileData.profileImage
                              : ''
                        }
                        alt={profileData.name || user?.name || 'Profile'}
                      />
                      <AvatarFallback>
                        {profileData.name || user?.name
                          ? (profileData.name || user?.name || '').charAt(0).toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={handleImageClick}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
                    </>
                  </div>
                  <h2 className="text-xl font-semibold mb-1">{profileData.name || 'Loading...'}</h2>
                  <p className="text-muted-foreground text-sm mb-4">
                    {profileData.email || 'Loading...'}
                  </p>
                  <Badge variant="secondary" className="mb-4">
                    {user.role === 'host' ? (
                      <>
                        <ChefHat className="w-3 h-3 mr-1" />
                        Host Member
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Guest Member
                      </>
                    )}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Member since {profileData.memberSince}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>Your profile details and preferences</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {saveError && (
                      <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {saveError}
                      </div>
                    )}
                    {saveSuccess && (
                      <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md">
                        Profile updated successfully!
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        {isEditing ? (
                          <Input
                            value={profileData.name}
                            onChange={(e) =>
                              setProfileData({ ...profileData, name: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {profileData.name || 'Loading...'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {profileData.email || 'Loading...'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        {isEditing ? (
                          <Input
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({ ...profileData, phone: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {profileData.phone ? (
                              profileData.phone
                            ) : (
                              <span className="italic text-muted-foreground/70">Not added</span>
                            )}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country</label>
                        {isEditing ? (
                          <Input
                            value={profileData.country}
                            onChange={(e) =>
                              setProfileData({ ...profileData, country: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {profileData.country ? (
                              profileData.country
                            ) : (
                              <span className="italic text-muted-foreground/70">Not added</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      {isEditing ? (
                        <Textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {profileData.bio ? (
                            profileData.bio
                          ) : (
                            <span className="italic text-muted-foreground/70">Not added</span>
                          )}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Languages</label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.languages && profileData.languages.length > 0 ? (
                          profileData.languages.map((lang, index) => (
                            <Badge key={index} variant="secondary">
                              {lang}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm italic text-muted-foreground/70">Not added</span>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSave}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary-600">{bookings.length}</div>
                      <div className="text-sm text-muted-foreground">Total Bookings</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {
                          bookings.filter(
                            (b) => b.status === 'completed' || b.status === 'COMPLETED'
                          ).length
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Completed Dinners</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {reviews.length > 0
                          ? (
                              reviews.reduce((acc: number, review: any) => acc + review.rating, 0) /
                              reviews.length
                            ).toFixed(1)
                          : '0.0'}
                      </div>
                      <div className="text-sm text-muted-foreground">Average Rating Given</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Booking History
                    </CardTitle>
                    <CardDescription>Your past and upcoming dinner reservations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bookingsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading bookings...</p>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No bookings yet. Start exploring dinners!
                        </p>
                      </div>
                    ) : (
                      bookings.map((booking) => {
                        if (!booking.dinner) return null
                        return (
                          <div
                            key={booking.id}
                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/bookings/${booking.id}`)}
                          >
                            <div className="flex gap-4">
                              <div className="relative flex-shrink-0 w-36 h-36 bg-muted rounded-lg overflow-hidden">
                                {booking.dinner.image ? (
                                  <Image
                                    src={booking.dinner.image}
                                    alt={booking.dinner.title}
                                    fill
                                    className="rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-muted-foreground text-xs">No image</p>
                                  </div>
                                )}
                                <Badge
                                  className={`absolute top-2 right-2 text-xs px-3 py-1 rounded-full shadow-md ${getStatusColor(booking.status)}`}
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-lg">
                                        {booking.dinner.title}
                                      </h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <User className="w-4 h-4" />
                                      {booking.dinner.host.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <MapPin className="w-4 h-4" />
                                      {typeof booking.dinner.location === 'object' &&
                                      booking.dinner.location
                                        ? `${booking.dinner.location.neighborhood || ''}, ${booking.dinner.location.city || ''}`.trim() ||
                                          'Location not available'
                                        : booking.dinner.location || 'Location not available'}
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatFriendlyDateTime(
                                        booking.dinner.date,
                                        booking.dinner.time
                                      )}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <span className="text-sm text-muted-foreground">
                                        {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                                      </span>
                                      <span className="text-lg font-semibold text-primary-600">
                                        €{booking.totalAmount}
                                      </span>
                                    </div>
                                    {/* Cancel Button for Confirmed/Pending Bookings */}
                                    {(booking.status === 'confirmed' ||
                                      booking.status === 'CONFIRMED' ||
                                      booking.status === 'pending' ||
                                      booking.status === 'PENDING') && (
                                      <div className="mt-3">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            // Calculate cancellation details
                                            // Get cancellation policy from the booking's dinner object
                                            // It should be set during booking transformation
                                            // Try multiple sources to find the value
                                            const cancellationPolicy =
                                              booking.dinner?.cancellationPolicy ??
                                              (booking as any)._originalCancellationPolicy ??
                                              'flexible'

                                            // Debug logging - expand bookingDinner to see all properties
                                            console.log(
                                              '🔵 Cancel booking - cancellation policy check:',
                                              {
                                                bookingId: booking.id,
                                                bookingDinnerKeys: booking.dinner
                                                  ? Object.keys(booking.dinner)
                                                  : null,
                                                cancellationPolicyFromBooking:
                                                  booking.dinner?.cancellationPolicy,
                                                originalCancellationPolicy: (booking as any)
                                                  ._originalCancellationPolicy,
                                                finalCancellationPolicy: cancellationPolicy,
                                                fullBookingDinner: JSON.parse(
                                                  JSON.stringify(booking.dinner)
                                                ),
                                              }
                                            )
                                            const dinnerDateTime = new Date(booking.dinner.date)
                                            const now = new Date()
                                            const hoursUntilDinner =
                                              (dinnerDateTime.getTime() - now.getTime()) /
                                              (1000 * 60 * 60)
                                            const daysUntilDinner = hoursUntilDinner / 24

                                            // Calculate refund based on policy
                                            let refundAmount = 0
                                            let refundPercentage = 0
                                            let message = ''

                                            switch (cancellationPolicy) {
                                              case 'flexible':
                                                if (hoursUntilDinner >= 24) {
                                                  refundAmount = booking.totalAmount
                                                  refundPercentage = 100
                                                  message =
                                                    'Full refund - cancelled 24+ hours before dinner'
                                                } else {
                                                  refundAmount = 0
                                                  refundPercentage = 0
                                                  message =
                                                    'No refund - cancelled less than 24 hours before dinner'
                                                }
                                                break
                                              case 'moderate':
                                                if (daysUntilDinner >= 5) {
                                                  refundAmount = booking.totalAmount
                                                  refundPercentage = 100
                                                  message =
                                                    'Full refund - cancelled 5+ days before dinner'
                                                } else {
                                                  refundAmount = 0
                                                  refundPercentage = 0
                                                  message =
                                                    'No refund - cancelled less than 5 days before dinner'
                                                }
                                                break
                                              case 'strict':
                                                if (daysUntilDinner >= 7) {
                                                  refundAmount = booking.totalAmount * 0.5
                                                  refundPercentage = 50
                                                  message =
                                                    '50% refund - cancelled 7+ days before dinner'
                                                } else {
                                                  refundAmount = 0
                                                  refundPercentage = 0
                                                  message =
                                                    'No refund - cancelled less than 7 days before dinner'
                                                }
                                                break
                                              default:
                                                if (hoursUntilDinner >= 24) {
                                                  refundAmount = booking.totalAmount
                                                  refundPercentage = 100
                                                  message =
                                                    'Full refund - cancelled 24+ hours before dinner'
                                                } else {
                                                  refundAmount = 0
                                                  refundPercentage = 0
                                                  message =
                                                    'No refund - cancelled less than 24 hours before dinner'
                                                }
                                            }

                                            setCancelDetails({
                                              refundAmount,
                                              refundPercentage,
                                              message,
                                              cancellationPolicy,
                                              hoursUntilDinner,
                                              daysUntilDinner,
                                              dinnerTitle: booking.dinner.title,
                                              totalAmount: booking.totalAmount,
                                            })
                                            setCancelBookingId(booking.id)
                                            setShowCancelDialog(true)
                                          }}
                                        >
                                          Cancel Booking
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Review Section - Always present for consistency */}
                                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                                  {booking.review && booking.hostReview ? (
                                    // Both reviews - display side by side
                                    <div className="flex gap-3">
                                      {/* Guest's Review of Dinner */}
                                      <div className="flex-1 bg-muted rounded-lg p-4 min-w-0">
                                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                          <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                                              Guest's Review
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            {renderStars(booking.review.rating)}
                                          </div>
                                        </div>
                                        {booking.review.comment && (
                                          <p className="text-sm text-foreground leading-relaxed break-words">
                                            {booking.review.comment}
                                          </p>
                                        )}
                                      </div>

                                      {/* Host's Review of Guest */}
                                      <div className="flex-1 bg-muted rounded-lg p-4 min-w-0">
                                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                          <div className="flex items-center gap-2">
                                            <ChefHat className="w-4 h-4 text-primary flex-shrink-0" />
                                            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                                              Host's Review
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            {renderStars(booking.hostReview.rating)}
                                          </div>
                                        </div>
                                        {booking.hostReview.comment && (
                                          <p className="text-sm text-foreground leading-relaxed break-words">
                                            {booking.hostReview.comment}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    // Single review or no reviews - stack vertically
                                    <div className="space-y-3">
                                      {/* Guest's Review of Dinner */}
                                      {booking.review ? (
                                        <div className="border-l-4 border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                              <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                              <span className="text-sm font-semibold text-foreground">
                                                Your Review
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              {renderStars(booking.review.rating)}
                                            </div>
                                          </div>
                                          {booking.review.comment && (
                                            <p className="text-sm text-foreground leading-relaxed break-words">
                                              {booking.review.comment}
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-muted-foreground">
                                            {booking.status === 'completed' ||
                                            booking.status === 'COMPLETED'
                                              ? 'No review written yet'
                                              : booking.status === 'confirmed' ||
                                                  booking.status === 'CONFIRMED'
                                                ? 'Review available after completion'
                                                : booking.status === 'cancelled' ||
                                                    booking.status === 'CANCELLED'
                                                  ? 'Booking was cancelled'
                                                  : booking.status === 'pending' ||
                                                      booking.status === 'PENDING'
                                                    ? 'Waiting for host approval'
                                                    : 'Pending review'}
                                          </span>
                                          {(booking.status === 'completed' ||
                                            booking.status === 'COMPLETED') && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedBooking(booking)
                                                setReviewRating(0)
                                                setReviewComment('')
                                                setReviewError(null)
                                                setShowReviewDialog(true)
                                              }}
                                            >
                                              Write Review
                                            </Button>
                                          )}
                                        </div>
                                      )}

                                      {/* Host's Review of Guest */}
                                      {booking.hostReview && (
                                        <div className="border-l-4 border-primary/30 bg-primary/5 rounded-lg p-4">
                                          <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                              <ChefHat className="w-4 h-4 text-primary" />
                                              <span className="text-sm font-semibold text-foreground">
                                                Host's Review
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              {renderStars(booking.hostReview.rating)}
                                            </div>
                                          </div>
                                          {booking.hostReview.comment && (
                                            <p className="text-sm text-foreground leading-relaxed break-words">
                                              {booking.hostReview.comment}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Reviews Given
                    </CardTitle>
                    <CardDescription>Reviews you've written for hosts and dinners</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading reviews...</p>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          You haven't written any reviews yet.
                        </p>
                      </div>
                    ) : (
                      reviews.map((review: any) => {
                        const dinner = review.dinner
                        const reviewDate = review.createdAt ? new Date(review.createdAt) : null
                        return (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex items-start gap-4">
                              <div className="relative flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden">
                                {dinner?.thumbnail ? (
                                  <Image
                                    src={dinner.thumbnail}
                                    alt={dinner?.title || 'Dinner'}
                                    fill
                                    className="rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ChefHat className="w-8 h-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">
                                    {dinner?.title || 'Unknown Dinner'}
                                  </h3>
                                  <div className="flex">{renderStars(review.rating)}</div>
                                </div>
                                {dinner?.host?.name && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Host: {dinner.host.name}
                                  </p>
                                )}
                                {review.comment && <p className="text-sm mb-2">{review.comment}</p>}
                                {reviewDate && (
                                  <p className="text-xs text-muted-foreground">
                                    {reviewDate.toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Account Settings
                    </CardTitle>
                    <CardDescription>Manage your account preferences and security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Security
                      </h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setShowChangePasswordDialog(true)}
                        >
                          Change Password
                        </Button>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">Email Verification</p>
                              <p className="text-sm text-muted-foreground">
                                {user?.emailVerified
                                  ? 'Your email is verified'
                                  : 'Please verify your email address'}
                              </p>
                            </div>
                            {user?.emailVerified ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-500 text-white border-transparent hover:bg-green-600"
                              >
                                Verified
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-500 text-white border-transparent hover:bg-yellow-600"
                              >
                                Not Verified
                              </Badge>
                            )}
                          </div>
                          {!user?.emailVerified && (
                            <>
                              {verifyEmailError && (
                                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                                  {verifyEmailError}
                                </div>
                              )}
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleVerifyEmail}
                                disabled={verifyingEmail}
                              >
                                {verifyingEmail ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending verification code...
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Verify Email
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                        {/* Phone Verification - Commented out for now */}
                        {/* <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Phone Verification</p>
                            <p className="text-sm text-muted-foreground">Your phone is verified</p>
                          </div>
                          <Badge variant="secondary">Verified</Badge>
                        </div> */}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Methods
                      </h3>
                      <Button variant="outline" className="w-full justify-start">
                        Manage Payment Methods
                      </Button>
                    </div>

                    <div className="border-t pt-6">
                      <Button variant="destructive" className="w-full justify-start">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password. Make sure it's at least 8
              characters long.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  placeholder="Enter current password"
                  required
                  disabled={passwordLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="Enter new password (min 8 characters)"
                  required
                  disabled={passwordLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  placeholder="Confirm new password"
                  required
                  disabled={passwordLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600">Password changed successfully!</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangePasswordDialog(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  setPasswordError(null)
                  setPasswordSuccess(false)
                }}
                disabled={passwordLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  passwordLoading ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              {selectedBooking?.dinner?.title
                ? `Share your experience about ${selectedBooking.dinner.title}`
                : 'Share your experience'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitReview}>
            <div className="space-y-4 py-4">
              {/* Rating Selection */}
              <div>
                <Label className="mb-2 block">Rating *</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewRating(rating)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= reviewRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="review-comment" className="mb-2 block">
                  Comment (Optional)
                </Label>
                <Textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell others about your experience..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Error Message */}
              {reviewError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{reviewError}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowReviewDialog(false)
                  setSelectedBooking(null)
                  setReviewRating(0)
                  setReviewComment('')
                  setReviewError(null)
                }}
                disabled={reviewSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={reviewSubmitting || reviewRating === 0}>
                {reviewSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription>Review the cancellation details before confirming</DialogDescription>
          </DialogHeader>

          {cancelDetails && (
            <div className="space-y-4 py-4">
              {/* Booking Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">{cancelDetails.dinnerTitle}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {cancelDetails.daysUntilDinner >= 1
                      ? `${Math.floor(cancelDetails.daysUntilDinner)} day${Math.floor(cancelDetails.daysUntilDinner) > 1 ? 's' : ''} until dinner`
                      : `${Math.floor(cancelDetails.hoursUntilDinner)} hour${Math.floor(cancelDetails.hoursUntilDinner) > 1 ? 's' : ''} until dinner`}
                  </span>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">
                    Cancellation Policy:{' '}
                    {cancelDetails.cancellationPolicy.charAt(0).toUpperCase() +
                      cancelDetails.cancellationPolicy.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{cancelDetails.message}</p>
              </div>

              {/* Refund Details */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Original Amount:</span>
                  <span className="text-sm">€{cancelDetails.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Refund Amount:</span>
                  <span
                    className={`text-sm font-semibold ${cancelDetails.refundAmount > 0 ? 'text-green-600' : 'text-destructive'}`}
                  >
                    €{cancelDetails.refundAmount.toFixed(2)} ({cancelDetails.refundPercentage}%)
                  </span>
                </div>
                {cancelDetails.refundAmount < cancelDetails.totalAmount && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Non-refundable:</span>
                    <span className="text-sm text-destructive">
                      €{(cancelDetails.totalAmount - cancelDetails.refundAmount).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning */}
              {cancelDetails.refundAmount === 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ No refund will be issued for this cancellation
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isCancelling}
              onClick={() => {
                setShowCancelDialog(false)
                setCancelBookingId(null)
                setCancelDetails(null)
              }}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              disabled={isCancelling}
              onClick={async () => {
                if (!cancelBookingId) return

                setIsCancelling(true)
                try {
                  const result = await bookingService.cancelBooking(cancelBookingId)
                  if (result.success) {
                    // Refresh bookings
                    if (user?.id) {
                      const bookingsResult = await bookingService.getUserBookings(user.id)
                      if (bookingsResult.success && bookingsResult.data) {
                        const transformedBookings = bookingsResult.data.map((booking: any) => {
                          let dinner = null
                          if (booking.dinner) {
                            try {
                              const backendDinner = booking.dinner
                              dinner = transformDinner({
                                ...backendDinner,
                                description: backendDinner.description || '',
                                cuisine: backendDinner.cuisine || 'Other',
                                capacity: backendDinner.capacity || 0,
                                available: backendDinner.available || 0,
                                instantBook: backendDinner.instantBook || false,
                                rating: backendDinner.rating || 0,
                                reviewCount: backendDinner.reviewCount || 0,
                                images: Array.isArray(backendDinner.images)
                                  ? backendDinner.images
                                  : backendDinner.images || [],
                                location:
                                  typeof backendDinner.location === 'object'
                                    ? backendDinner.location
                                    : {},
                                host: backendDinner.host || {},
                              })
                            } catch (err) {
                              console.error('Error transforming dinner:', err)
                              // Fallback: use backend data directly if transform fails
                              dinner = {
                                id: booking.dinner.id,
                                title: booking.dinner.title || 'Unknown Dinner',
                                date: booking.dinner.date
                                  ? typeof booking.dinner.date === 'string'
                                    ? booking.dinner.date.split('T')[0]
                                    : new Date(booking.dinner.date).toISOString().split('T')[0]
                                  : '',
                                time: booking.dinner.time || '19:00',
                                price: booking.dinner.price || 0,
                                capacity: booking.dinner.capacity || 0,
                                images: Array.isArray(booking.dinner.images)
                                  ? booking.dinner.images
                                  : [],
                                host: {
                                  id: booking.dinner.host?.id || '',
                                  name: booking.dinner.host?.name || 'Unknown Host',
                                  avatar: booking.dinner.host?.image || undefined,
                                  superhost: false,
                                  joinedDate: new Date().toISOString(),
                                  responseRate: 0,
                                  responseTime: 'responds within 24 hours',
                                },
                                location:
                                  typeof booking.dinner.location === 'object'
                                    ? booking.dinner.location
                                    : {
                                        address: '',
                                        city: '',
                                        state: '',
                                        neighborhood: '',
                                      },
                              }
                            }
                          }

                          return {
                            id: booking.id,
                            status: booking.status?.toLowerCase() || 'pending',
                            guests: booking.guests || 1,
                            totalAmount: booking.totalPrice || 0,
                            dinnerId: dinner?.id || booking.dinnerId,
                            dinner: dinner
                              ? {
                                  id: dinner.id,
                                  title: dinner.title,
                                  host: {
                                    name: dinner.host.name,
                                    avatar: dinner.host.avatar || '',
                                  },
                                  image: dinner.thumbnail || dinner.images?.[0] || null,
                                  location:
                                    `${dinner.location.neighborhood || ''}, ${dinner.location.city || ''}`.trim() ||
                                    'Location not available',
                                  date: dinner.date,
                                  time: dinner.time,
                                  price: dinner.price,
                                  capacity: dinner.capacity,
                                }
                              : null,
                            review: booking.review
                              ? {
                                  rating: booking.review.rating,
                                  comment: booking.review.comment || '',
                                }
                              : null,
                            hostReview: booking.hostReview
                              ? {
                                  rating: booking.hostReview.rating,
                                  comment: booking.hostReview.comment || '',
                                }
                              : null,
                          }
                        })
                        setBookings(transformedBookings)
                      }
                    }
                    setShowCancelDialog(false)
                    setCancelBookingId(null)
                    setCancelDetails(null)
                  } else {
                    alert(result.error || 'Failed to cancel booking')
                  }
                } catch (error) {
                  console.error('Error cancelling booking:', error)
                  alert('Failed to cancel booking')
                } finally {
                  setIsCancelling(false)
                }
              }}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </MainLayout>
      }
    >
      <ProfilePageContent />
    </Suspense>
  )
}
