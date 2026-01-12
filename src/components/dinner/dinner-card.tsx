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
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-zinc-100 flex flex-col h-full">
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
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Image Navigation */}
          {dinner.images && dinner.images.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border-0"
                onClick={prevImage}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border-0"
                onClick={nextImage}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Price & Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {dinner.instantBook && (
              <Badge className="bg-white text-zinc-900 border-0 shadow-sm py-1.5 px-3 rounded-full flex items-center gap-1.5 font-bold">
                <Zap className="w-3.5 h-3.5 fill-primary-500 text-primary-500" />
                <span className="text-[10px] uppercase tracking-wider">Instant</span>
              </Badge>
            )}
            {dinner.host.superhost && (
              <Badge className="bg-primary-500 text-white border-0 shadow-sm py-1.5 px-3 rounded-full font-bold text-[10px] uppercase tracking-wider">
                Superhost
              </Badge>
            )}
          </div>

          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
              <span className="text-white font-bold text-lg">${dinner.price}</span>
              <span className="text-white/80 text-xs ml-1 font-medium">/ person</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-primary-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {moment.utc(dinner.date).local().format('MMM D, HH:mm')}
              </span>
              <Badge
                variant="secondary"
                className="bg-zinc-100 text-zinc-600 border-0 text-[10px] px-2 py-0"
              >
                {dinner.cuisine}
              </Badge>
            </div>
            <h3 className="font-bold text-xl text-zinc-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {dinner.title}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-zinc-500 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span className="truncate max-w-[120px]">{dinner.location.neighborhood}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-300" />
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-zinc-400" />
              <span>{dinner.available} left</span>
            </div>
          </div>

          <div className="pt-2 mt-auto border-t border-zinc-50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-zinc-900">{dinner.rating}</span>
              <span className="text-zinc-400 text-xs">({dinner.reviewCount})</span>
            </div>

            <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
              {dinner.host.avatar && (
                <AvatarImage
                  src={dinner.host.avatar}
                  alt={dinner.host.name}
                />
              )}
              <AvatarFallback>{dinner.host.name[0]}</AvatarFallback>
            </Avatar>
          </div>

          {/* Quick Action Button - Floating on top of everything or slide up? Let's do slide up */}
          <div className="pt-2 h-0 group-hover:h-12 overflow-hidden transition-all duration-300">
            <Button
              className={`w-full ${isHost ? 'bg-zinc-100 text-zinc-400' : 'bg-primary-600 hover:bg-primary-700 text-white'} rounded-xl font-bold transition-all`}
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
