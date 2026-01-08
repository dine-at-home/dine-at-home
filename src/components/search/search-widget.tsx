'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Search, MapPin, Calendar as CalendarIcon, Users, Plus, Minus } from 'lucide-react'

import { SearchParams } from '@/types'

interface SearchWidgetProps {
  variant?: 'hero' | 'compact'
  className?: string
  initialParams?: {
    location?: string
    date?: Date
    guests?: number
  }
}

export function SearchWidget({
  variant = 'hero',
  className = '',
  initialParams,
}: SearchWidgetProps) {
  const router = useRouter()
  const [location, setLocation] = useState(initialParams?.location || '')
  const [date, setDate] = useState<Date | undefined>(initialParams?.date)
  const [guests, setGuests] = useState(initialParams?.guests || 2)
  const [showGuestSelector, setShowGuestSelector] = useState(false)

  // Update state when initialParams change (e.g., when navigating to different search URL)
  useEffect(() => {
    if (initialParams) {
      setLocation(initialParams.location || '')
      setDate(initialParams.date)
      setGuests(initialParams.guests || 2)
    }
  }, [initialParams])

  const incrementGuests = () => setGuests((prev) => Math.min(prev + 1, 20))
  const decrementGuests = () => setGuests((prev) => Math.max(prev - 1, 1))

  const handleSearch = () => {
    // Create search params
    const searchParams = new URLSearchParams()

    if (location) searchParams.set('location', location)
    if (date) searchParams.set('date', date.toISOString())
    if (guests) searchParams.set('guests', guests.toString())

    // Navigate to search page with query parameters
    const queryString = searchParams.toString()
    router.push(`/search${queryString ? `?${queryString}` : ''}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-2xl shadow-modal border border-border p-4 ${className}`}>
        <div className="flex items-center gap-4">
          {/* Location */}
          <div className="relative flex-1">
            <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">Where</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 py-3 border-0 focus:ring-2 focus:ring-primary rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-foreground"
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">When</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start py-3 px-4 h-auto bg-gray-50 hover:bg-gray-100 border-0 rounded-xl"
                >
                  <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {date
                      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Add dates'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const dateToCheck = new Date(date)
                    dateToCheck.setHours(0, 0, 0, 0)
                    return dateToCheck < today
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">Guests</label>
            <Popover open={showGuestSelector} onOpenChange={setShowGuestSelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start py-3 px-4 h-auto bg-gray-50 hover:bg-gray-100 border-0 rounded-xl"
                >
                  <Users className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {guests} {guests === 1 ? 'guest' : 'guests'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-6" align="start">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Guests</div>
                      <div className="text-sm text-muted-foreground">Ages 13 or above</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full"
                        onClick={decrementGuests}
                        disabled={guests <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center">{guests}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full"
                        onClick={incrementGuests}
                        disabled={guests >= 20}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button */}
          <div className="flex items-end pt-6">
            <Button
              size="sm"
              className="rounded-full w-12 h-12 p-0 bg-primary-600 hover:bg-primary-700"
              onClick={handleSearch}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-modal border border-border p-4 relative z-50 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">Where</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search destinations"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 py-3 border-0 focus:ring-2 focus:ring-primary rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-foreground"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">When</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start py-3 px-4 h-auto bg-gray-50 hover:bg-gray-100 border-0 rounded-xl"
              >
                <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {date
                    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Add dates'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const dateToCheck = new Date(date)
                  dateToCheck.setHours(0, 0, 0, 0)
                  return dateToCheck < today
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">Guests</label>
          <Popover open={showGuestSelector} onOpenChange={setShowGuestSelector}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start py-3 px-4 h-auto bg-gray-50 hover:bg-gray-100 border-0 rounded-xl"
              >
                <Users className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6" align="start">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Guests</div>
                    <div className="text-sm text-muted-foreground">Ages 13 or above</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full"
                      onClick={decrementGuests}
                      disabled={guests <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center">{guests}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full"
                      onClick={incrementGuests}
                      disabled={guests >= 20}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center space-x-2"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SearchWidget
