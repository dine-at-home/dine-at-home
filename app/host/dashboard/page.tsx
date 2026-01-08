'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { MainLayout } from '@/components/layout/main-layout'
import { HostGuard } from '@/components/auth/host-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Users,
  DollarSign,
  Star,
  Plus,
  Edit,
  Eye,
  Clock,
  MapPin,
  ChefHat,
  TrendingUp,
  MessageCircle,
  Settings,
  Home,
  User,
  Heart,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  AlertCircle,
  Mail,
  Phone,
  EyeOff,
  Loader2,
  Save,
  X,
  Camera,
} from 'lucide-react'
import Image from 'next/image'
import { getApiUrl } from '@/lib/api-config'
import { getDinnerStatus } from '@/lib/dinner-filters'
import { transformDinner } from '@/lib/dinner-utils'
import { bookingService } from '@/lib/booking-service'

// Mock data for demonstration (fallback)
const mockDinners = [
  {
    id: '1',
    title: 'Authentic Italian Pasta Making',
    date: '2024-02-15',
    time: '19:00',
    guests: 6,
    maxCapacity: 8,
    price: 85,
    status: 'upcoming',
    bookings: 6,
    revenue: 510,
    rating: 4.9,
    reviews: 12,
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: '2',
    title: 'Japanese Sushi Workshop',
    date: '2024-02-20',
    time: '18:30',
    guests: 4,
    maxCapacity: 6,
    price: 120,
    status: 'upcoming',
    bookings: 4,
    revenue: 480,
    rating: 5.0,
    reviews: 8,
    image:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center',
  },
  {
    id: '3',
    title: 'French Wine Tasting',
    date: '2024-01-08',
    time: '20:00',
    guests: 8,
    maxCapacity: 10,
    price: 95,
    status: 'completed',
    bookings: 8,
    revenue: 760,
    rating: 4.8,
    reviews: 15,
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center',
  },
]

const mockBookings = [
  {
    id: '1',
    dinner: 'Authentic Italian Pasta Making',
    guest: {
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612e845?w=100&h=100&fit=crop&crop=face',
      email: 'sarah@email.com',
    },
    date: '2024-02-15',
    time: '19:00',
    guests: 2,
    totalAmount: 170,
    status: 'confirmed',
    specialRequests: 'Vegetarian options please',
  },
  {
    id: '2',
    dinner: 'Japanese Sushi Workshop',
    guest: {
      name: 'Mike Chen',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      email: 'mike@email.com',
    },
    date: '2024-02-20',
    time: '18:30',
    guests: 1,
    totalAmount: 120,
    status: 'pending',
    specialRequests: 'No raw fish, please',
  },
]

function HostDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [dinnerFilter, setDinnerFilter] = useState('all')
  const [dinners, setDinners] = useState<any[]>([])
  const [dinnersLoading, setDinnersLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null)
  const [hostStats, setHostStats] = useState({
    totalDinners: 0,
    totalBookings: 0,
    averageRating: 0,
    loading: true,
  })
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsStats, setReviewsStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  })
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
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
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null)
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [guestProfile, setGuestProfile] = useState<any>(null)
  const [guestProfileLoading, setGuestProfileLoading] = useState(false)
  const [showGuestProfileDialog, setShowGuestProfileDialog] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'accept' | 'decline' | null
    bookingId: string | null
    guestName: string
  }>({
    open: false,
    type: null,
    bookingId: null,
    guestName: '',
  })
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: '',
    gender: '',
    country: '',
    languages: '',
    joinedDate: null as Date | null,
  })

  useEffect(() => {
    if (user) {
      // Parse languages if it's an array
      let languagesString = ''
      if (user.languages) {
        if (Array.isArray(user.languages)) {
          languagesString = user.languages.join(', ')
        } else if (typeof user.languages === 'string') {
          try {
            const parsed = JSON.parse(user.languages)
            languagesString = Array.isArray(parsed) ? parsed.join(', ') : user.languages
          } catch {
            languagesString = user.languages
          }
        }
      }

      // Parse joined date
      let joinedDate: Date | null = null
      if (user.createdAt) {
        const date = new Date(user.createdAt)
        // Validate date
        if (!isNaN(date.getTime())) {
          joinedDate = date
        }
      }

      setProfileData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        languages: languagesString,
        joinedDate: joinedDate,
        profileImage: user.image || '', // No placeholder - show initial fallback instead
      }))
    }
  }, [user])

  // Fetch host stats from backend
  useEffect(() => {
    const fetchHostStats = async () => {
      if (!user?.id) {
        setHostStats((prev) => ({ ...prev, loading: false }))
        return
      }

      try {
        setHostStats((prev) => ({ ...prev, loading: true }))
        const token = localStorage.getItem('auth_token')

        if (!token) {
          setHostStats((prev) => ({ ...prev, loading: false }))
          return
        }

        const response = await fetch(getApiUrl(`/host/${user.id}/stats`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setHostStats({
              totalDinners: result.data.totalDinners || 0,
              totalBookings: result.data.totalBookings || 0,
              averageRating: result.data.averageRating || 0,
              loading: false,
            })
          } else {
            setHostStats((prev) => ({ ...prev, loading: false }))
          }
        } else {
          setHostStats((prev) => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Error fetching host stats:', error)
        setHostStats((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchHostStats()
  }, [user?.id])

  // Fetch reviews from backend
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

        const response = await fetch(getApiUrl(`/host/${user.id}/reviews`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setReviews(result.data || [])
            if (result.stats) {
              setReviewsStats({
                averageRating: result.stats.averageRating || 0,
                totalReviews: result.stats.totalReviews || 0,
              })
            }
          } else {
            setReviews([])
            setReviewsStats({ averageRating: 0, totalReviews: 0 })
          }
        } else {
          setReviews([])
          setReviewsStats({ averageRating: 0, totalReviews: 0 })
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
        setReviewsStats({ averageRating: 0, totalReviews: 0 })
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [user?.id])

  // Handle profile save
  const handleProfileSave = async () => {
    if (!user?.id) {
      setProfileSaveError('User not found. Please sign in again.')
      return
    }

    setIsSavingProfile(true)
    setProfileSaveError(null)
    setProfileSaveSuccess(false)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setProfileSaveError('Authentication required. Please sign in again.')
        setIsSavingProfile(false)
        return
      }

      // Prepare languages array
      const languagesArray =
        typeof profileData.languages === 'string' && profileData.languages.trim()
          ? profileData.languages
              .split(',')
              .map((l) => l.trim())
              .filter((l) => l.length > 0)
          : []

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
        setProfileSaveError(result.error || 'Failed to save profile. Please try again.')
        setIsSavingProfile(false)
        return
      }

      // Success - refresh user data
      setProfileSaveSuccess(true)
      setIsEditingProfile(false)

      // Refresh user from auth context - refreshUser is already available from useAuth hook
      // We need to reload the user data
      const currentUser = await fetch(getApiUrl('/auth/current-user'), {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json())

      if (currentUser.success && currentUser.data) {
        // Update profileData with new user data
        let languagesString = ''
        if (currentUser.data.languages) {
          if (Array.isArray(currentUser.data.languages)) {
            languagesString = currentUser.data.languages.join(', ')
          } else if (typeof currentUser.data.languages === 'string') {
            try {
              const parsed = JSON.parse(currentUser.data.languages)
              languagesString = Array.isArray(parsed)
                ? parsed.join(', ')
                : currentUser.data.languages
            } catch {
              languagesString = currentUser.data.languages
            }
          }
        }

        let joinedDate: Date | null = null
        if (currentUser.data.createdAt) {
          const date = new Date(currentUser.data.createdAt)
          if (!isNaN(date.getTime())) {
            joinedDate = date
          }
        }

        setProfileData((prev) => ({
          ...prev,
          name: currentUser.data.name || '',
          email: currentUser.data.email || '',
          phone: currentUser.data.phone || '',
          country: currentUser.data.country || '',
          languages: languagesString,
          joinedDate: joinedDate,
          profileImage: currentUser.data.image || prev.profileImage,
        }))
      }

      // Clear success message after 2 seconds
      setTimeout(() => {
        setProfileSaveSuccess(false)
      }, 2000)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      setProfileSaveError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleProfileCancel = () => {
    setIsEditingProfile(false)
    setProfileSaveError(null)
    setProfileSaveSuccess(false)
    // Reset form data to user's current data
    if (user) {
      let languagesString = ''
      if (user.languages) {
        if (Array.isArray(user.languages)) {
          languagesString = user.languages.join(', ')
        } else if (typeof user.languages === 'string') {
          try {
            const parsed = JSON.parse(user.languages)
            languagesString = Array.isArray(parsed) ? parsed.join(', ') : user.languages
          } catch {
            languagesString = user.languages
          }
        }
      }

      let joinedDate: Date | null = null
      if (user.createdAt) {
        const date = new Date(user.createdAt)
        if (!isNaN(date.getTime())) {
          joinedDate = date
        }
      }

      setProfileData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        languages: languagesString,
        joinedDate: joinedDate,
        profileImage: user.image || '', // No placeholder - show initial fallback instead
      }))
    }
  }

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setProfileSaveError('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setProfileSaveError('Image size must be less than 10MB.')
      return
    }

    setIsUploadingImage(true)
    setProfileSaveError(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setProfileSaveError('Authentication required. Please sign in again.')
        setIsUploadingImage(false)
        return
      }

      // Create FormData for multipart/form-data upload
      const formData = new FormData()
      formData.append('image', file)

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
        setProfileSaveError(uploadResult.error || 'Failed to upload image. Please try again.')
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
            setProfileSaveSuccess(true)
            setTimeout(() => {
              setProfileSaveSuccess(false)
            }, 2000)
          }
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setProfileSaveError(
        'An unexpected error occurred while uploading the image. Please try again.'
      )
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Fetch dinners from backend
  useEffect(() => {
    const fetchDinners = async () => {
      if (!user?.id) {
        setDinnersLoading(false)
        return
      }

      try {
        setDinnersLoading(true)
        const token = localStorage.getItem('auth_token')

        if (!token) {
          setDinnersLoading(false)
          return
        }

        const response = await fetch(getApiUrl(`/host/${user.id}/dinners`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            // Transform backend data to match frontend format
            const transformedDinners = result.data.map((dinner: any) => {
              // Transform to Dinner type first
              const dinnerTransformed = transformDinner(dinner)
              // Use the new status logic: completed if booked OR past time
              const status = getDinnerStatus(dinnerTransformed, dinner.isActive !== false)

              // Images are stored as array directly
              const images = Array.isArray(dinner.images) ? dinner.images : []

              // Filter out invalid blob URLs (they don't work after page reload)
              const validImages = images.filter(
                (img: string) =>
                  img &&
                  typeof img === 'string' &&
                  (img.startsWith('http://') || img.startsWith('https://'))
              )

              return {
                id: dinner.id,
                title: dinner.title,
                date: dinnerTransformed.date, // Use formatted date from transformDinner
                time: dinner.time,
                guests: dinner.capacity - dinner.available,
                maxCapacity: dinner.capacity,
                price: dinner.price,
                status: status,
                bookings: dinner.capacity - dinner.available,
                revenue: (dinner.capacity - dinner.available) * dinner.price,
                rating: dinner.rating || 0,
                reviews: dinner.reviewCount || 0,
                image: dinner.thumbnail || validImages[0] || null,
              }
            })
            setDinners(transformedDinners)
          } else {
            // Fallback to mock data if API fails
            setDinners(mockDinners)
          }
        } else {
          // Fallback to mock data if API fails
          setDinners(mockDinners)
        }
      } catch (error) {
        console.error('Error fetching dinners:', error)
        // Fallback to mock data on error
        setDinners(mockDinners)
      } finally {
        setDinnersLoading(false)
      }
    }

    fetchDinners()
  }, [user])

  // Fetch bookings from backend
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) {
        setBookingsLoading(false)
        return
      }

      try {
        setBookingsLoading(true)
        const result = await bookingService.getHostBookings(user.id)
        if (result.success && result.data) {
          // Transform bookings to match frontend format
          const transformedBookings = result.data.map((booking: any) => {
            return {
              id: booking.id,
              dinner: booking.dinner?.title || 'Unknown Dinner',
              guest: {
                id: booking.user?.id || '',
                name: booking.user?.name || 'Unknown Guest',
                avatar:
                  booking.user?.image ||
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                email: booking.user?.email || '',
              },
              date: booking.dinner?.date
                ? typeof booking.dinner.date === 'string'
                  ? booking.dinner.date.split('T')[0]
                  : new Date(booking.dinner.date).toISOString().split('T')[0]
                : '',
              time: booking.dinner?.time || '',
              guests: booking.guests,
              totalAmount: booking.totalPrice,
              status: booking.status?.toLowerCase() || 'confirmed',
              specialRequests: booking.message || '',
            }
          })
          setBookings(transformedBookings)
        } else {
          setBookings([])
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setBookings([])
      } finally {
        setBookingsLoading(false)
      }
    }

    fetchBookings()
  }, [user?.id])

  // Handle viewing guest profile
  const handleViewGuestProfile = async (guestId: string) => {
    if (!guestId) return

    setSelectedGuestId(guestId)
    setShowGuestProfileDialog(true)
    setGuestProfileLoading(true)
    setGuestProfile(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setGuestProfileLoading(false)
        return
      }

      const response = await fetch(getApiUrl(`/users/${guestId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setGuestProfile(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching guest profile:', error)
    } finally {
      setGuestProfileLoading(false)
    }
  }

  // Handle booking status update with confirmation
  const handleConfirmBookingAction = (
    bookingId: string,
    type: 'accept' | 'decline',
    guestName: string
  ) => {
    setConfirmDialog({
      open: true,
      type,
      bookingId,
      guestName,
    })
  }

  // Handle booking status update
  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: 'CONFIRMED' | 'CANCELLED'
  ) => {
    try {
      setUpdatingBookingId(bookingId)
      const result = await bookingService.updateBookingStatus(bookingId, status)

      if (result.success) {
        // Refresh bookings list
        const updatedResult = await bookingService.getHostBookings(user!.id)
        if (updatedResult.success && updatedResult.data) {
          const transformedBookings = updatedResult.data.map((booking: any) => {
            return {
              id: booking.id,
              dinner: booking.dinner?.title || 'Unknown Dinner',
              guest: {
                id: booking.user?.id || '',
                name: booking.user?.name || 'Unknown Guest',
                avatar:
                  booking.user?.image ||
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                email: booking.user?.email || '',
              },
              date: booking.dinner?.date
                ? typeof booking.dinner.date === 'string'
                  ? booking.dinner.date.split('T')[0]
                  : new Date(booking.dinner.date).toISOString().split('T')[0]
                : '',
              time: booking.dinner?.time || '',
              guests: booking.guests,
              totalAmount: booking.totalPrice,
              status: booking.status?.toLowerCase() || 'confirmed',
              specialRequests: booking.message || '',
            }
          })
          setBookings(transformedBookings)
        }
      } else {
        alert(result.error || 'Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert('An error occurred while updating the booking status')
    } finally {
      setUpdatingBookingId(null)
    }
  }

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    const url = newTab === 'overview' ? '/host/dashboard' : `/host/dashboard?tab=${newTab}`
    router.replace(url)
  }

  // Helper function for dinner status colors
  const getDinnerStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function for booking status colors
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter dinners based on selected filter
  const filteredDinners = dinners.filter((dinner) => {
    if (dinnerFilter === 'all') return true
    return dinner.status === dinnerFilter
  })

  // Calculate stats from real data
  const calculateStats = () => {
    const totalRevenue = dinners.reduce((sum, d) => sum + (d.revenue || 0), 0)
    const totalGuests = dinners.reduce((sum, d) => sum + (d.guests || 0), 0)
    const dinnersWithRatings = dinners.filter((d) => d.rating > 0)
    const averageRating =
      dinnersWithRatings.length > 0
        ? (
            dinners.reduce((sum, d) => sum + (d.rating || 0), 0) / dinnersWithRatings.length
          ).toFixed(1)
        : '0.0'
    const totalReviews = dinners.reduce((sum, d) => sum + (d.reviews || 0), 0)
    const upcomingDinners = dinners.filter((d) => d.status === 'upcoming')
    const nextUpcoming =
      upcomingDinners.length > 0
        ? upcomingDinners.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
        : null

    return {
      totalRevenue,
      totalGuests,
      averageRating,
      totalReviews,
      upcomingCount: upcomingDinners.length,
      nextUpcoming,
    }
  }

  const stats = calculateStats()

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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">{stats.totalGuests}</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
              </div>
              <Star className="w-8 h-8 text-primary-600" />
            </div>
            {stats.totalReviews > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Dinners</p>
                <p className="text-2xl font-bold">{stats.upcomingCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
            {stats.nextUpcoming && (
              <p className="text-xs text-blue-600 mt-2">
                Next:{' '}
                {new Date(stats.nextUpcoming.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDinners = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Dinners</h2>
          <p className="text-muted-foreground">Manage your dining experiences</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={dinnerFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDinnerFilter('all')}
        >
          All ({dinners.length})
        </Button>
        <Button
          variant={dinnerFilter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDinnerFilter('upcoming')}
        >
          Upcoming ({dinners.filter((d) => d.status === 'upcoming').length})
        </Button>
        <Button
          variant={dinnerFilter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDinnerFilter('completed')}
        >
          Completed ({dinners.filter((d) => d.status === 'completed').length})
        </Button>
        <Button
          variant={dinnerFilter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDinnerFilter('draft')}
        >
          Draft ({dinners.filter((d) => d.status === 'draft').length})
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Dinners</p>
                <p className="text-2xl font-bold">{dinners.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${dinners.reduce((sum, d) => sum + d.revenue, 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">
                  {dinners.reduce((sum, d) => sum + d.guests, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">
                  {dinners.filter((d) => d.rating > 0).length > 0
                    ? (
                        dinners.reduce((sum, d) => sum + d.rating, 0) /
                        dinners.filter((d) => d.rating > 0).length
                      ).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {dinnersLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dinners...</p>
        </div>
      )}

      {/* Dinners Grid */}
      {!dinnersLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDinners.map((dinner) => (
            <Card key={dinner.id} className="overflow-hidden">
              <div className="relative bg-muted">
                {dinner.image ? (
                  <Image
                    src={dinner.image}
                    alt={dinner.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No image</p>
                  </div>
                )}
                <Badge className={`absolute top-3 right-3 ${getDinnerStatusColor(dinner.status)}`}>
                  {dinner.status.charAt(0).toUpperCase() + dinner.status.slice(1)}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{dinner.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dinner.date} at {dinner.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {dinner.guests}/{dinner.maxCapacity} guests
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />${dinner.price} per person
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">
                      {dinner.rating > 0 ? dinner.rating.toFixed(1) : 'No ratings'}
                    </span>
                    <span className="text-sm text-muted-foreground">({dinner.reviews})</span>
                  </div>
                  <span className="font-semibold text-primary-600">${dinner.revenue}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/dinners/${dinner.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/host/dinners/edit/${dinner.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!dinnersLoading && filteredDinners.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No dinners found</h3>
            <p className="text-muted-foreground mb-6">
              {dinnerFilter === 'all'
                ? "You haven't created any dinners yet. Create your first dining experience!"
                : `No dinners with status "${dinnerFilter}" found.`}
            </p>
            {dinnerFilter === 'all' && (
              <Button onClick={() => router.push('/host/dinners/create')} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Dinner
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderBookings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bookings</h2>
        <p className="text-muted-foreground">Manage guest reservations</p>
      </div>

      {bookingsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No bookings yet. Your bookings will appear here when guests make reservations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => booking.guest.id && handleViewGuestProfile(booking.guest.id)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={booking.guest.avatar} alt={booking.guest.name} />
                      <AvatarFallback>{booking.guest.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <button
                          onClick={() =>
                            booking.guest.id && handleViewGuestProfile(booking.guest.id)
                          }
                          className="cursor-pointer hover:underline"
                        >
                          <h3 className="font-semibold">{booking.guest.name}</h3>
                        </button>
                        <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4" />
                        {booking.dinner}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {booking.date} at {booking.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />${booking.totalAmount}
                      </div>
                      {booking.specialRequests && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleConfirmBookingAction(booking.id, 'accept', booking.guest.name)
                          }
                          disabled={updatingBookingId === booking.id}
                        >
                          {updatingBookingId === booking.id ? 'Updating...' : 'Accept'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleConfirmBookingAction(booking.id, 'decline', booking.guest.name)
                          }
                          disabled={updatingBookingId === booking.id}
                        >
                          {updatingBookingId === booking.id ? 'Updating...' : 'Decline'}
                        </Button>
                      </>
                    )}
                    {/* Message feature - commented out for now */}
                    {/* <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences and security</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Security Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Security</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Change Password</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowChangePasswordDialog(true)}>
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Verification</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone Verification</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Payment Methods</h3>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Manage Payment Methods</p>
                </div>
              </div>
              <Button variant="outline">Manage Payment Methods</Button>
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="pt-6 border-t">
            <Button variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderReviews = () => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return '1 day ago'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
      }
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `${months} ${months === 1 ? 'month' : 'months'} ago`
      }
      const years = Math.floor(diffDays / 365)
      return `${years} ${years === 1 ? 'year' : 'years'} ago`
    }

    if (reviewsLoading) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Reviews</h2>
            <p className="text-muted-foreground">Manage and respond to guest reviews</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading reviews...</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Reviews</h2>
          <p className="text-muted-foreground">Manage and respond to guest reviews</p>
        </div>

        {reviewsStats.totalReviews === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                You haven't received any reviews yet. Reviews will appear here once guests leave
                feedback on your dinners.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Overall Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600">
                    {reviewsStats.averageRating > 0 ? reviewsStats.averageRating.toFixed(1) : '0.0'}
                  </div>
                  <div className="flex justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(reviewsStats.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {reviewsStats.totalReviews}{' '}
                    {reviewsStats.totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reviews to display
                  </p>
                ) : (
                  reviews.slice(0, 5).map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={review.user?.image}
                              alt={review.user?.name || 'Guest'}
                            />
                            <AvatarFallback>
                              {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'G'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">"{review.comment}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {review.dinner?.title || 'Dinner'} • {formatDate(review.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  const renderProfile = () => (
    <div className="space-y-6">
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
                        profileData.profileImage && profileData.profileImage.trim() !== ''
                          ? profileData.profileImage
                          : user?.image && user.image.trim() !== ''
                            ? user.image || ''
                            : ''
                      }
                      alt={profileData.name || user?.name || 'Host profile'}
                    />
                    <AvatarFallback>
                      {profileData.name || user?.name
                        ? (profileData.name || user?.name || '').charAt(0).toUpperCase()
                        : 'H'}
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
                  <ChefHat className="w-3 h-3 mr-1" />
                  Host Member
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {profileData.joinedDate
                    ? `Member since ${profileData.joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                    : 'Member since recently'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your profile details and preferences</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isEditingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleProfileCancel}
                    disabled={isSavingProfile}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
                <Button
                  variant={isEditingProfile ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    isEditingProfile ? handleProfileSave() : setIsEditingProfile(true)
                  }
                  disabled={isSavingProfile}
                >
                  {isEditingProfile ? (
                    <>
                      {isSavingProfile ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isSavingProfile ? 'Saving...' : 'Save'}
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileSaveError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {profileSaveError}
                </div>
              )}
              {profileSaveSuccess && (
                <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md">
                  Profile updated successfully!
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  {isEditingProfile ? (
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
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
                  {isEditingProfile ? (
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {profileData.phone || 'Not provided'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  {isEditingProfile ? (
                    <Input
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {profileData.country || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Languages</label>
                {isEditingProfile ? (
                  <Input
                    value={typeof profileData.languages === 'string' ? profileData.languages : ''}
                    onChange={(e) => setProfileData({ ...profileData, languages: e.target.value })}
                    placeholder="e.g., English, Spanish, French"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.languages ? (
                      (typeof profileData.languages === 'string'
                        ? profileData.languages.split(',').map((lang: string) => lang.trim())
                        : []
                      ).map((lang: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">English</Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                {hostStats.loading ? (
                  <div className="text-2xl font-bold text-primary-600">...</div>
                ) : (
                  <div className="text-2xl font-bold text-primary-600">
                    {hostStats.totalDinners}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">Total Dinners</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                {hostStats.loading ? (
                  <div className="text-2xl font-bold text-primary-600">...</div>
                ) : (
                  <div className="text-2xl font-bold text-primary-600">
                    {hostStats.totalBookings}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">Guests Hosted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                {hostStats.loading ? (
                  <div className="text-2xl font-bold text-primary-600">...</div>
                ) : (
                  <div className="text-2xl font-bold text-primary-600">
                    {hostStats.averageRating > 0 ? hostStats.averageRating.toFixed(1) : '0.0'}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <HostGuard>
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Host Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your dining experiences and bookings
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <Button onClick={() => router.push('/host/dinners/create')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Dinner
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dinners">My Dinners</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {renderOverview()}
            </TabsContent>

            <TabsContent value="dinners" className="mt-6">
              {renderDinners()}
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              {renderBookings()}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {renderReviews()}
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              {renderProfile()}
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              {renderSettings()}
            </TabsContent>
          </Tabs>
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
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                    }
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
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                    }
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

        {/* Guest Profile Dialog */}
        <Dialog open={showGuestProfileDialog} onOpenChange={setShowGuestProfileDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Guest Profile</DialogTitle>
              <DialogDescription>View guest information and booking history</DialogDescription>
            </DialogHeader>
            {guestProfileLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading guest profile...</p>
                </div>
              </div>
            ) : guestProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={
                        guestProfile.image ||
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
                      }
                      alt={guestProfile.name}
                    />
                    <AvatarFallback>{guestProfile.name?.charAt(0) || 'G'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {guestProfile.name || 'Unknown Guest'}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {guestProfile.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4" />
                      {guestProfile.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <p className="text-sm flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {guestProfile.country || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-sm mt-1 capitalize">
                      {guestProfile.gender || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </label>
                    <p className="text-sm mt-1">
                      {guestProfile.joinedDate
                        ? new Date(guestProfile.joinedDate).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
                {guestProfile.languages && (
                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-muted-foreground">Languages</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(guestProfile.languages) ? (
                        guestProfile.languages.map((lang: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {lang}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">{guestProfile.languages}</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load guest profile</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGuestProfileDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {confirmDialog.type === 'accept' ? 'Accept Booking?' : 'Decline Booking?'}
              </DialogTitle>
              <DialogDescription>
                {confirmDialog.type === 'accept'
                  ? `Are you sure you want to accept the booking from ${confirmDialog.guestName}? This will confirm the reservation.`
                  : `Are you sure you want to decline the booking from ${confirmDialog.guestName}? This action cannot be undone.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
                disabled={updatingBookingId === confirmDialog.bookingId}
              >
                Cancel
              </Button>
              <Button
                variant={confirmDialog.type === 'accept' ? 'default' : 'destructive'}
                onClick={() => {
                  if (confirmDialog.bookingId) {
                    const status = confirmDialog.type === 'accept' ? 'CONFIRMED' : 'CANCELLED'
                    handleUpdateBookingStatus(confirmDialog.bookingId, status)
                    setConfirmDialog({ ...confirmDialog, open: false })
                  }
                }}
                disabled={updatingBookingId === confirmDialog.bookingId}
              >
                {updatingBookingId === confirmDialog.bookingId
                  ? 'Processing...'
                  : confirmDialog.type === 'accept'
                    ? 'Accept'
                    : 'Decline'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </HostGuard>
  )
}

export default function HostDashboardPage() {
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
      <HostDashboardContent />
    </Suspense>
  )
}
