import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import moment from 'moment-timezone'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Star, Zap, Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react'
import { Dinner } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { motion, AnimatePresence } from 'framer-motion'

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
    if (isHost) return
    router.push(`/booking?dinner=${dinner.id}`)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`group cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-100 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={
                  dinner.images && dinner.images.length > 0
                    ? dinner.images[currentImageIndex]
                    : dinner.thumbnail || ''
                }
                alt={dinner.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Image Navigation */}
          {dinner.images && dinner.images.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 border-0"
                onClick={prevImage}
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 border-0"
                onClick={nextImage}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Price & Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {dinner.instantBook && (
              <Badge className="bg-white/95 backdrop-blur text-zinc-900 border-0 shadow-sm py-1 px-2.5 rounded-full flex items-center gap-1 font-bold">
                <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="text-[10px] uppercase tracking-wider">Instant</span>
              </Badge>
            )}
            {dinner.host.superhost && (
              <Badge className="bg-rose-500 text-white border-0 shadow-sm py-1 px-2.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
                Superhost
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 left-3 z-10">
            <div className="bg-black/30 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 shadow-lg">
              <span className="text-white font-bold text-base">€{dinner.price}</span>
              <span className="text-white/80 text-[11px] ml-1 font-medium">/ person</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5 text-primary">
                <Calendar className="w-3.5 h-3.5" />
                {moment.utc(dinner.date).local().format('MMM D • HH:mm')}
              </span>
              <Badge
                variant="secondary"
                className="bg-zinc-50 text-zinc-500 border-zinc-100 text-[10px] px-2 py-0.5 font-medium"
              >
                {dinner.cuisine}
              </Badge>
            </div>
            <h3 className="font-bold text-lg text-zinc-900 line-clamp-1 group-hover:text-primary transition-colors">
              {dinner.title}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-zinc-500 text-sm mt-1">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">
                {[dinner.location.neighborhood, dinner.location.city]
                  .filter(Boolean)
                  .filter((val, index, arr) => arr.indexOf(val) === index)
                  .join(', ') || 'Location'}
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-300 shrink-0" />
            <div className="flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>{dinner.available} left</span>
            </div>
          </div>

          <div className="pt-3 mt-auto border-t border-zinc-50/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {dinner.reviewCount > 0 ? (
                <>
                  <span className="font-bold text-zinc-900 text-sm">{dinner.rating}</span>
                  <span className="text-zinc-400 text-xs">({dinner.reviewCount})</span>
                </>
              ) : (
                <span className="font-medium text-zinc-600 text-sm">New</span>
              )}
            </div>

            <Avatar className="w-7 h-7 border border-white shadow-sm ring-1 ring-zinc-50">
              {dinner.host.avatar && (
                <AvatarImage src={dinner.host.avatar} alt={dinner.host.name} />
              )}
              <AvatarFallback className="text-[10px] bg-zinc-100 text-zinc-600">
                {dinner.host.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Quick Action Button */}
          <div className="pt-1 h-0 group-hover:h-10 overflow-hidden transition-all duration-300 ease-out opacity-0 group-hover:opacity-100">
            <Button
              className={`w-full h-9 text-sm ${
                isHost ? 'bg-zinc-100 text-zinc-400' : 'bg-primary hover:bg-primary/90 text-white'
              } rounded-lg font-semibold transition-all shadow-md`}
              onClick={handleQuickBook}
              disabled={isHost}
            >
              {isHost ? 'Host View' : 'Quick Book'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
