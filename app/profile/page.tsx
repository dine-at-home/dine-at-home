'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
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
  Bell,
  Shield,
  LogOut,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  ChefHat,
} from 'lucide-react'
import Image from 'next/image'
import { bookingService } from '@/lib/booking-service'
import { transformDinner } from '@/lib/dinner-utils'
import { getApiUrl } from '@/lib/api-config'

// Mock data for demonstration (fallback only)
const mockBookings = [
  {
    id: '1',
    dinner: {
      title: 'Authentic Italian Pasta Making',
      host: {
        name: 'Marco Rossi',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      },
      image:
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&crop=center',
      location: 'Rome, Italy',
      date: '2024-01-15',
      time: '19:00',
      price: 85,
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
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b612e845?w=100&h=100&fit=crop&crop=face',
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
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
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
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isEditing, setIsEditing] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
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

      setProfileData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        gender: user.gender || '',
        languages: languagesArray,
        profileImage:
          user.image ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
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

            // Handle dinner data - backend already transforms it, but we need to ensure compatibility
            let dinner = null
            if (booking.dinner) {
              try {
                // The backend already provides a transformed dinner object
                // We need to adapt it to work with transformDinner or use it directly
                const backendDinner = booking.dinner

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
                    responseTime: 'within 24 hours',
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
              dinner: dinner
                ? {
                    title: dinner.title,
                    host: {
                      name: dinner.host.name,
                      avatar:
                        dinner.host.avatar ||
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
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
              review: null, // Reviews will be fetched separately if needed
            }
          })

          console.log('🔵 Transformed bookings:', transformedBookings)
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
    router.push('/auth/signin')
    return null
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
        profileImage:
          user.image ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        bio: '',
        memberSince: memberSince,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
                      <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                      <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
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
                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex gap-4">
                              <div className="relative flex-shrink-0 w-36 self-stretch min-h-[140px] bg-muted rounded-lg">
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
                                  className={`absolute -top-2 -right-2 text-xs ${getStatusColor(booking.status)}`}
                                >
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg">
                                      {booking.dinner.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <User className="w-4 h-4" />
                                      {booking.dinner.host.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <MapPin className="w-4 h-4" />
                                      {booking.dinner.location}
                                    </p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <Calendar className="w-4 h-4" />
                                      {booking.dinner.date} at {booking.dinner.time}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <span className="text-sm text-muted-foreground">
                                        {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                                      </span>
                                      <span className="text-lg font-semibold text-primary-600">
                                        ${booking.totalAmount}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Review Section - Always present for consistency */}
                                <div className="mt-4">
                                  {booking.review ? (
                                    <div className="p-3 bg-muted rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                          {renderStars(booking.review.rating)}
                                        </div>
                                        <span className="text-sm font-medium">Your Review</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {booking.review.comment}
                                      </p>
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
                                        <Button size="sm" variant="outline">
                                          Write Review
                                        </Button>
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
                              {dinner?.host?.image ? (
                                <Avatar className="w-12 h-12">
                                  <AvatarImage
                                    src={dinner.host.image}
                                    alt={dinner.host?.name || 'Host'}
                                  />
                                  <AvatarFallback>
                                    {(dinner.host?.name || 'H').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback>
                                    {(dinner?.host?.name || 'H').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
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
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Email Verification</p>
                            <p className="text-sm text-muted-foreground">Your email is verified</p>
                          </div>
                          <Badge variant="secondary">Verified</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Phone Verification</p>
                            <p className="text-sm text-muted-foreground">Your phone is verified</p>
                          </div>
                          <Badge variant="secondary">Verified</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive updates via email
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Enabled
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Disabled
                          </Button>
                        </div>
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
