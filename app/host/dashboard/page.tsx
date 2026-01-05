'use client'

import { useState, useEffect, Suspense } from 'react'
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
  Phone
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
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&crop=center'
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
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&crop=center'
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
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&crop=center'
  }
]

const mockBookings = [
  {
    id: '1',
    dinner: 'Authentic Italian Pasta Making',
    guest: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612e845?w=100&h=100&fit=crop&crop=face',
      email: 'sarah@email.com'
    },
    date: '2024-02-15',
    time: '19:00',
    guests: 2,
    totalAmount: 170,
    status: 'confirmed',
    specialRequests: 'Vegetarian options please'
  },
  {
    id: '2',
    dinner: 'Japanese Sushi Workshop',
    guest: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      email: 'mike@email.com'
    },
    date: '2024-02-20',
    time: '18:30',
    guests: 1,
    totalAmount: 120,
    status: 'pending',
    specialRequests: 'No raw fish, please'
  }
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
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: '',
    gender: '',
    country: '',
    languages: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        profileImage: user.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
      }))
    }
  }, [user])

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
            'Authorization': `Bearer ${token}`
          }
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

              // Parse images (assuming it's a JSON string or array)
              let images = []
              try {
                images = typeof dinner.images === 'string' 
                  ? JSON.parse(dinner.images) 
                  : dinner.images || []
              } catch (e) {
                images = []
              }

              // Filter out invalid blob URLs (they don't work after page reload)
              const validImages = images.filter((img: string) => 
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
                image: validImages[0] || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&crop=center'
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
                name: booking.user?.name || 'Unknown Guest',
                avatar: booking.user?.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
                email: booking.user?.email || ''
              },
              date: booking.dinner?.date ? (typeof booking.dinner.date === 'string' ? booking.dinner.date.split('T')[0] : new Date(booking.dinner.date).toISOString().split('T')[0]) : '',
              time: booking.dinner?.time || '',
              guests: booking.guests,
              totalAmount: booking.totalPrice,
              status: booking.status?.toLowerCase() || 'confirmed',
              specialRequests: booking.message || ''
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

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    const url = newTab === 'overview' ? '/host/dashboard' : `/host/dashboard?tab=${newTab}`
    router.replace(url)
  }

  // Helper function for dinner status colors
  const getDinnerStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function for booking status colors
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter dinners based on selected filter
  const filteredDinners = dinners.filter(dinner => {
    if (dinnerFilter === 'all') return true
    return dinner.status === dinnerFilter
  })


  // Calculate stats from real data
  const calculateStats = () => {
    const totalRevenue = dinners.reduce((sum, d) => sum + (d.revenue || 0), 0)
    const totalGuests = dinners.reduce((sum, d) => sum + (d.guests || 0), 0)
    const dinnersWithRatings = dinners.filter(d => d.rating > 0)
    const averageRating = dinnersWithRatings.length > 0
      ? (dinners.reduce((sum, d) => sum + (d.rating || 0), 0) / dinnersWithRatings.length).toFixed(1)
      : '0.0'
    const totalReviews = dinners.reduce((sum, d) => sum + (d.reviews || 0), 0)
    const upcomingDinners = dinners.filter(d => d.status === 'upcoming')
    const nextUpcoming = upcomingDinners.length > 0
      ? upcomingDinners.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
      : null

    return {
      totalRevenue,
      totalGuests,
      averageRating,
      totalReviews,
      upcomingCount: upcomingDinners.length,
      nextUpcoming
    }
  }

  const stats = calculateStats()

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
              <p className="text-xs text-muted-foreground mt-2">Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</p>
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
                Next: {new Date(stats.nextUpcoming.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
          Upcoming ({dinners.filter(d => d.status === 'upcoming').length})
        </Button>
        <Button
          variant={dinnerFilter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDinnerFilter('completed')}
        >
          Completed ({dinners.filter(d => d.status === 'completed').length})
        </Button>
        <Button
          variant={dinnerFilter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDinnerFilter('draft')}
        >
          Draft ({dinners.filter(d => d.status === 'draft').length})
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
                <p className="text-2xl font-bold">${dinners.reduce((sum, d) => sum + d.revenue, 0)}</p>
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
                <p className="text-2xl font-bold">{dinners.reduce((sum, d) => sum + d.guests, 0)}</p>
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
                  {dinners.filter(d => d.rating > 0).length > 0 
                    ? (dinners.reduce((sum, d) => sum + d.rating, 0) / dinners.filter(d => d.rating > 0).length).toFixed(1)
                    : '0.0'
                  }
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
            <div className="relative">
              <Image
                src={dinner.image}
                alt={dinner.title}
                width={400}
                height={200}
                className="w-full h-48 object-cover"
              />
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
                  <DollarSign className="w-4 h-4" />
                  ${dinner.price} per person
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
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
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
                : `No dinners with status "${dinnerFilter}" found.`
              }
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
          <p className="text-muted-foreground">No bookings yet. Your bookings will appear here when guests make reservations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={booking.guest.avatar} alt={booking.guest.name} />
                  <AvatarFallback>{booking.guest.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{booking.guest.name}</h3>
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
                      <DollarSign className="w-4 h-4" />
                      ${booking.totalAmount}
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
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
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
                <Button variant="outline">Change Password</Button>
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

  const renderReviews = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reviews</h2>
        <p className="text-muted-foreground">Manage and respond to guest reviews</p>
      </div>

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
              <div className="text-4xl font-bold text-primary-600">4.8</div>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Based on 24 reviews</p>
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
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="John Doe profile" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">John Doe</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">"Amazing experience! The host was fantastic and the food was delicious."</p>
              <p className="text-xs text-muted-foreground mt-2">Japanese Sushi Workshop • 2 days ago</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612e845?w=100&h=100&fit=crop&crop=face" alt="Sarah Miller profile" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Sarah Miller</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">"Perfect evening! Great conversation and wonderful food."</p>
              <p className="text-xs text-muted-foreground mt-2">Italian Family Dinner • 1 week ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

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
                    <AvatarImage src={profileData.profileImage} alt={profileData.name || 'Host profile'} />
                    <AvatarFallback>
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'H'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-xl font-semibold mb-1">{profileData.name || 'Loading...'}</h2>
                <p className="text-muted-foreground text-sm mb-4">{profileData.email || 'Loading...'}</p>
                <Badge variant="secondary" className="mb-4">
                  <ChefHat className="w-3 h-3 mr-1" />
                  Host Member
                </Badge>
                <p className="text-xs text-muted-foreground">Member since January 2024</p>
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
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <p className="text-sm text-muted-foreground">{profileData.name || 'Loading...'}</p>
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
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profileData.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profileData.country || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <p className="text-sm text-muted-foreground">{profileData.bio || 'No bio provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {profileData.languages ? (
                    profileData.languages.split(',').map((lang, index) => (
                      <Badge key={index} variant="secondary">{lang.trim()}</Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">English</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">12</div>
                <div className="text-sm text-muted-foreground">Total Dinners</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">48</div>
                <div className="text-sm text-muted-foreground">Guests Hosted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">4.8</div>
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
              <p className="text-muted-foreground mt-1">Manage your dining experiences and bookings</p>
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
      </MainLayout>
    </HostGuard>
  )
}

export default function HostDashboardPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    }>
      <HostDashboardContent />
    </Suspense>
  )
}
