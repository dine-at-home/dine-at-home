'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import {
  ArrowLeft,
  Heart,
  Share,
  Star,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Zap,
  Shield,
  Award,
  ChefHat,
  Utensils,
  Wine,
  // MessageSquare, // Commented out - message host feature not needed for now
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

import { Dinner, NavigationParams } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { favoriteService } from '@/lib/favorite-service'
import { getApiUrl } from '@/lib/api-config'

interface DinnerDetailProps {
  dinner: Dinner
  onNavigate: (page: string, params?: NavigationParams) => void
}

export function DinnerDetail({ dinner, onNavigate }: DinnerDetailProps) {
  const { user } = useAuth()
  const isHost = user?.role === 'host'
  const [selectedGuests, setSelectedGuests] = useState(2)
  const [hasConfirmedBooking, setHasConfirmedBooking] = useState(false)

  // Use the date and time set by the host when creating the listing
  const dinnerDate = new Date(dinner.date)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [hostReviews, setHostReviews] = useState<any[]>([])
  const [hostReviewsLoading, setHostReviewsLoading] = useState(true)

  // Use reviews from dinner data if available, otherwise empty array
  const reviews = Array.isArray(dinner.reviews) ? dinner.reviews : []
  // Debug logging
  useEffect(() => {
    console.log('🔵 DinnerDetail - Reviews Debug:', {
      dinnerId: dinner.id,
      dinnerTitle: dinner.title,
      reviewCount: dinner.reviewCount,
      hasReviewsProperty: 'reviews' in dinner,
      reviewsType: typeof dinner.reviews,
      reviewsIsArray: Array.isArray(dinner.reviews),
      reviewsArray: reviews,
      reviewsLength: reviews.length,
      hasReviews: reviews.length > 0,
      reviewsData: reviews.map((r: any) => ({
        id: r?.id,
        userName: r?.userName,
        rating: r?.rating,
        hasComment: !!r?.comment,
        comment: r?.comment?.substring(0, 50),
      })),
    })
  }, [dinner.id, dinner.reviews, reviews])

  // Fetch host reviews
  useEffect(() => {
    const fetchHostReviews = async () => {
      if (!dinner.host?.id) {
        setHostReviewsLoading(false)
        return
      }

      try {
        setHostReviewsLoading(true)
        const response = await fetch(getApiUrl(`/host/${dinner.host.id}/reviews/public`))
        const result = await response.json()

        if (result.success && result.data) {
          setHostReviews(result.data)
        } else {
          setHostReviews([])
        }
      } catch (error) {
        console.error('Error fetching host reviews:', error)
        setHostReviews([])
      } finally {
        setHostReviewsLoading(false)
      }
    }

    fetchHostReviews()
  }, [dinner.host?.id])

  // Check if dinner is favorited on mount
  useEffect(() => {
    if (user) {
      favoriteService.checkFavorite(dinner.id).then((result) => {
        if (result.success && result.data) {
          setIsFavorited(result.data.isFavorited)
        }
      })
    }
  }, [dinner.id, user])

  // Check if user has a confirmed booking for this dinner
  useEffect(() => {
    const checkBooking = async () => {
      if (!user || isHost) {
        // Hosts can always see the address, guests need confirmed booking
        setHasConfirmedBooking(isHost || false)
        return
      }

      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setHasConfirmedBooking(false)
          return
        }

        const response = await fetch(getApiUrl(`/bookings/user/${user.id}?status=CONFIRMED`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const hasBooking = result.data.some(
              (booking: any) => booking.dinnerId === dinner.id && booking.status === 'CONFIRMED'
            )
            setHasConfirmedBooking(hasBooking)
          }
        }
      } catch (error) {
        console.error('Error checking booking:', error)
        setHasConfirmedBooking(false)
      }
    }

    checkBooking()
  }, [user, dinner.id, isHost])

  const handleFavoriteToggle = async () => {
    if (!user) {
      onNavigate('signin')
      return
    }

    if (isToggling) return

    const wasFavorited = isFavorited
    const newFavoritedState = !wasFavorited

    // Immediately update UI for instant feedback
    // React 18 will batch this update and render it synchronously
    setIsFavorited(newFavoritedState)

    // Use a microtask to ensure state update is processed before API call
    // This ensures the UI updates immediately while the API call happens in background
    Promise.resolve().then(async () => {
      setIsToggling(true)

      try {
        if (wasFavorited) {
          const result = await favoriteService.removeFavorite(dinner.id)
          if (!result.success) {
            // Revert on error
            setIsFavorited(wasFavorited)
          }
        } else {
          const result = await favoriteService.addFavorite(dinner.id)
          if (!result.success) {
            // Revert on error
            setIsFavorited(wasFavorited)
          }
        }
      } catch (error) {
        // Revert on error
        setIsFavorited(wasFavorited)
        console.error('Error toggling favorite:', error)
      } finally {
        setIsToggling(false)
      }
    })
  }

  const handleBooking = () => {
    if (isHost) {
      // Hosts can't book, do nothing
      return
    }
    onNavigate('booking', {
      dinner,
      date: dinnerDate,
      guests: selectedGuests,
    })
  }

  const openCarousel = (index: number) => {
    setCarouselIndex(index)
    setIsCarouselOpen(true)
  }

  const closeCarousel = () => {
    setIsCarouselOpen(false)
  }

  const nextImage = () => {
    setCarouselIndex((prev) => (prev + 1) % dinner.images.length)
  }

  const prevImage = () => {
    setCarouselIndex((prev) => (prev - 1 + dinner.images.length) % dinner.images.length)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isCarouselOpen) return

    if (e.key === 'ArrowLeft') {
      prevImage()
    } else if (e.key === 'ArrowRight') {
      nextImage()
    } else if (e.key === 'Escape') {
      closeCarousel()
    }
  }

  return (
    <div className="min-h-screen bg-background pt-10" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{dinner.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{dinner.rating}</span>
                <span>({dinner.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>
                  {dinner.location.neighborhood}, {dinner.location.city}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              disabled={isToggling}
              className="flex items-center space-x-2 transition-all duration-150"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-150 ${
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
              <span className="transition-all duration-150">{isFavorited ? 'Saved' : 'Save'}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div
              className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden"
              style={{ gridAutoRows: 'minmax(200px, auto)' }}
            >
              {dinner.images && dinner.images.length > 0 ? (
                <>
                  <div className="col-span-4 sm:col-span-2 sm:row-span-2 relative min-h-[400px]">
                    <Image
                      src={dinner.thumbnail || dinner.images[0]}
                      alt={dinner.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover cursor-pointer hover:brightness-90 transition-all"
                      onClick={() => openCarousel(0)}
                    />
                  </div>
                  {dinner.images.slice(1, 5).map((image, index) => (
                    <div className="relative min-h-[200px]" key={index}>
                      <Image
                        src={image}
                        alt={`${dinner.title} ${index + 2}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover cursor-pointer hover:brightness-90 transition-all"
                        onClick={() => openCarousel(index + 1)}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <div className="col-span-4 relative min-h-[400px] bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No images available</p>
                </div>
              )}
            </div>

            {/* Host Info */}
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16">
                {dinner.host.avatar && (
                  <AvatarImage src={dinner.host.avatar} alt={dinner.host.name} />
                )}
                <AvatarFallback>{dinner.host.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-lg">Hosted by {dinner.host.name}</h3>
                  {dinner.host.superhost && (
                    <Badge className="bg-primary text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Superhost
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  {(() => {
                    const joinedDate = new Date(dinner.host.joinedDate)
                    const yearsSince = Math.floor(
                      (new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
                    )
                    const yearsText =
                      yearsSince > 0
                        ? `${yearsSince} year${yearsSince > 1 ? 's' : ''}`
                        : 'Recently joined'
                    return `${yearsText} • ${dinner.reviewCount} review${dinner.reviewCount !== 1 ? 's' : ''}`
                  })()}
                </p>
                {dinner.host.bio && <p className="text-sm">"{dinner.host.bio}"</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Response Rate: {dinner.host.responseRate}%</span>
                  <span>•</span>
                  <span>{dinner.host.responseTime}</span>
                </div>
              </div>
            </div>

            {/* Host Reviews */}
            {hostReviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading reviews...</p>
              </div>
            ) : hostReviews.length > 0 ? (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-xl mb-4">
                    Reviews about {dinner.host.name} ({hostReviews.length})
                  </h3>
                  <div className="space-y-4">
                    {hostReviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={review.user?.image}
                              alt={review.user?.name || 'Guest'}
                            />
                            <AvatarFallback>
                              {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'G'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <p className="font-medium text-sm">
                                  {review.user?.name || 'Anonymous'}
                                </p>
                                {review.dinner && (
                                  <p className="text-xs text-muted-foreground">
                                    {review.dinner.title}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <Separator />

            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <Utensils className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Cuisine</p>
                  <p className="text-sm text-muted-foreground">{dinner.cuisine}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {(dinner.duration || 0) / 60} hours
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">{dinner.capacity} guests</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {hasConfirmedBooking || isHost
                      ? [dinner.location.address, dinner.location.neighborhood || dinner.location.city, dinner.location.city, dinner.location.state].filter(Boolean).join(', ')
                      : [dinner.location.neighborhood || dinner.location.city, dinner.location.city, dinner.location.state].filter(Boolean).join(', ')}
                  </p>
                  {!hasConfirmedBooking && !isHost && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Full address will be shown after booking is confirmed
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {dinner.description && (
              <div>
                <h3 className="font-semibold text-xl mb-4">About this experience</h3>
                <div className="space-y-4 text-sm whitespace-pre-line">
                  {dinner.description
                    .split('\n')
                    .map((paragraph, index) => paragraph.trim() && <p key={index}>{paragraph}</p>)}
                </div>
              </div>
            )}

            {/* Menu */}
            {dinner.menu && dinner.menu.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-xl mb-4">Menu</h3>
                  <ul className="space-y-2 text-sm">
                    {dinner.menu.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* What's Included */}
            {dinner.included && dinner.included.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-xl mb-4">What's included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dinner.included.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* House Rules */}
            {dinner.houseRules && dinner.houseRules.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-xl mb-4">House rules</h3>
                  <ul className="space-y-2 text-sm">
                    {dinner.houseRules.map((rule, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Dietary Accommodations */}
            {dinner.dietary && dinner.dietary.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-xl mb-4">Dietary accommodations</h3>
                  <div className="flex flex-wrap gap-2">
                    {dinner.dietary.map((item, index) => (
                      <Badge key={index} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <h3 className="font-semibold text-xl">Reviews</h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{dinner.rating}</span>
                  <span className="text-muted-foreground">({dinner.reviewCount} reviews)</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.userAvatar || ''} alt={review.userName} />
                            <AvatarFallback>{review.userName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{review.userName}</div>
                            <div className="flex items-center space-x-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                              <span className="text-xs text-muted-foreground ml-2">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            {review.dinner && review.dinner.title && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {review.dinner.title}
                              </p>
                            )}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this experience!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-modal">
              <CardContent className="p-6">
                <div className="flex items-baseline space-x-2 mb-6">
                  <span className="text-2xl font-semibold">€{dinner.price}</span>
                  <span className="text-muted-foreground">per person</span>
                </div>

                {/* Date and Time (Set by Host - Read Only) */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date & Time</label>
                    <div className="space-y-2 p-3 bg-muted rounded-md">
                      <div className="flex items-center space-x-2 text-sm">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {dinnerDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{dinner.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Guest Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Guests</label>
                    <Select
                      value={selectedGuests.toString()}
                      onValueChange={(value) => setSelectedGuests(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(dinner.capacity)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span>
                      €{dinner.price} x {selectedGuests} guests
                    </span>
                    <span>€{dinner.price * selectedGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>€{Math.round(dinner.price * selectedGuests * 0.20)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>€{Math.round(dinner.price * selectedGuests * 1.20)}</span>
                  </div>
                </div>

                {/* Booking Options */}
                <div className="space-y-3">
                  {isHost ? (
                    <Button
                      className="w-full cursor-not-allowed opacity-60"
                      onClick={handleBooking}
                      disabled
                      title="Host can't book - switch to guest account to make booking"
                    >
                      Host can't book
                    </Button>
                  ) : (
                    <>
                      {dinner.instantBook ? (
                        <Button
                          className="w-full bg-primary-600 hover:bg-primary-700"
                          onClick={handleBooking}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Reserve instantly
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={handleBooking}>
                          Request to book
                        </Button>
                      )}
                    </>
                  )}

                  {/* Message host feature - commented out for now */}
                  {/* <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onNavigate("chat", { host: dinner.host })}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message host
                  </Button> */}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">You won't be charged yet</p>
                </div>

                {/* Safety Features */}
                <div className="mt-6 pt-4 border-t space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Identity verified host</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Secure payment system</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Carousel Modal */}
      {isCarouselOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeCarousel}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeCarousel}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          {/* Image */}
          <div
            className="relative max-w-7xl w-full h-full flex items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {dinner.images && dinner.images.length > 0 ? (
              <Image
                src={dinner.images[carouselIndex]}
                alt={`${dinner.title} - Image ${carouselIndex + 1}`}
                width={1200}
                height={800}
                className="object-contain max-h-[90vh] max-w-full"
              />
            ) : (
              <div className="text-white text-center">
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {carouselIndex + 1} / {dinner.images.length}
          </div>
        </div>
      )}
    </div>
  )
}
