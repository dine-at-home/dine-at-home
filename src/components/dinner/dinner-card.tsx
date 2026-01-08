'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Star, Zap, Calendar, MapPin, Users, Clock } from 'lucide-react'
import { Dinner } from '@/types'
import { useAuth } from '@/contexts/auth-context'

interface DinnerCardProps {
  dinner: Dinner
  className?: string
}

export function DinnerCard({ dinner, className = '' }: DinnerCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const isHost = user?.role === 'host'
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dinner.images && dinner.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % dinner.images.length)
    }
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dinner.images && dinner.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + dinner.images.length) % dinner.images.length)
    }
  }

  const handleCardClick = () => {
    router.push(`/dinners/${dinner.id}`)
  }

  const handleQuickBook = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isHost) {
      // Hosts can't book, do nothing or show message
      return
    }
    router.push(`/booking?dinner=${dinner.id}`)
  }

  return (
    <div 
      className={`group cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] ${className}`}
      onClick={handleCardClick}
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {(dinner.thumbnail || (dinner.images && dinner.images.length > 0)) ? (
            <Image
              key={currentImageIndex}
              src={
                dinner.images && dinner.images.length > 0
                  ? dinner.images[currentImageIndex]
                  : dinner.thumbnail || ''
              }
              alt={dinner.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No image</p>
            </div>
          )}
          
          {/* Image Navigation */}
          {dinner.images && dinner.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-8 h-8 p-0 rounded-full z-10"
                onClick={prevImage}
              >
                <span className="text-lg">‹</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white w-8 h-8 p-0 rounded-full z-10"
                onClick={nextImage}
              >
                <span className="text-lg">›</span>
              </Button>
            </>
          )}

          {/* Image Indicators */}
          {dinner.images && dinner.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
              {dinner.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-black/70 text-white hover:bg-black/80 border-0">
              ${dinner.price} per person
            </Badge>
          </div>

          {/* Instant Book Badge */}
          {dinner.instantBook && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white text-gray-800 hover:bg-white border-0 flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span className="text-xs">Instant Book</span>
              </Badge>
            </div>
          )}

          {/* Superhost Badge */}
          {dinner.host.superhost && (
            <div className="absolute top-12 left-3">
              <Badge className="bg-primary text-white hover:bg-primary border-0">
                Superhost
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Host Info */}
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`} alt={dinner.host.name} />
              <AvatarFallback>{dinner.host.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">Hosted by {dinner.host.name}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
            {dinner.title}
          </h3>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(dinner.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{dinner.time}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{dinner.location.neighborhood}, {dinner.location.city}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{dinner.available} spots left</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">{dinner.rating}</span>
              <span className="text-sm text-muted-foreground">({dinner.reviewCount} reviews)</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {dinner.cuisine}
            </Badge>
          </div>

          {/* Quick Book Button */}
          <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isHost ? (
              <Button 
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-not-allowed opacity-60"
                onClick={handleQuickBook}
                disabled
                title="Host can't book - switch to guest account to book"
              >
                Host can't book
              </Button>
            ) : (
              <Button 
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                onClick={handleQuickBook}
              >
                Quick Book
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}