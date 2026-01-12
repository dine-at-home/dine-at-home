'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Search, MapPin, Calendar as CalendarIcon, Users, Plus, Minus } from 'lucide-react'

import { SearchParams } from '@/types'

interface SearchWidgetProps {
  variant?: 'hero' | 'compact'
  className?: string
  initialParams?: {
    location?: string
    date?: Date
    month?: string // Format: "YYYY-MM"
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
  const [showDateSelector, setShowDateSelector] = useState(false)
  
  // Month/Year selection
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialParams?.date 
      ? `${new Date(initialParams.date).getFullYear()}-${String(new Date(initialParams.date).getMonth() + 1).padStart(2, '0')}`
      : initialParams?.month || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
  )
  
  // Calendar month state (for controlling which month is displayed)
  const getInitialCalendarMonth = () => {
    if (initialParams?.date) {
      const dateObj = new Date(initialParams.date)
      return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
    }
    const [year, monthNum] = selectedMonth.split('-').map(Number)
    return new Date(year, monthNum - 1, 1)
  }
  const [calendarMonth, setCalendarMonth] = useState<Date>(getInitialCalendarMonth())

  // Generate month/year options
  const generateMonthOptions = () => {
    const months = []
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    
    // Generate options for current month and next 12 months
    for (let i = 0; i < 13; i++) {
      const date = new Date(currentYear, currentMonth + i, 1)
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthValue = `${year}-${String(month + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      months.push({ value: monthValue, label: monthLabel, year, month })
    }
    return months
  }

  const monthOptions = generateMonthOptions()

  // Update state when initialParams change (e.g., when navigating to different search URL)
  useEffect(() => {
    if (initialParams) {
      setLocation(initialParams.location || '')
      setDate(initialParams.date)
      setGuests(initialParams.guests || 2)
      if (initialParams.date) {
        const dateObj = new Date(initialParams.date)
        const monthValue = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
        setSelectedMonth(monthValue)
        setCalendarMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1))
      } else if (initialParams.month) {
        setSelectedMonth(initialParams.month)
        const [year, monthNum] = initialParams.month.split('-').map(Number)
        setCalendarMonth(new Date(year, monthNum - 1, 1))
      }
    }
  }, [initialParams])

  const incrementGuests = () => setGuests((prev) => Math.min(prev + 1, 20))
  const decrementGuests = () => setGuests((prev) => Math.max(prev - 1, 1))

  const handleSearch = () => {
    // Create search params
    const searchParams = new URLSearchParams()

    if (location) searchParams.set('location', location)
    // If date is selected, use date; otherwise use month
    if (date) {
      searchParams.set('date', date.toISOString())
    } else if (selectedMonth) {
      searchParams.set('month', selectedMonth)
    }
    if (guests) searchParams.set('guests', guests.toString())

    // Navigate to search page with query parameters
    const queryString = searchParams.toString()
    router.push(`/search${queryString ? `?${queryString}` : ''}`)
  }

  // When month changes, clear date if it's outside the selected month and update calendar month
  const handleMonthChange = (monthValue: string) => {
    setSelectedMonth(monthValue)
    const [year, monthNum] = monthValue.split('-').map(Number)
    setCalendarMonth(new Date(year, monthNum - 1, 1))
    if (date) {
      const dateYear = date.getFullYear()
      const dateMonth = date.getMonth() + 1
      if (dateYear !== year || dateMonth !== monthNum) {
        setDate(undefined)
      }
    }
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

          {/* Month & Date */}
          <div className="relative flex-1">
            <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">When</label>
            <Popover open={showDateSelector} onOpenChange={setShowDateSelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start py-3 px-4 h-auto bg-gray-50 hover:bg-gray-100 border-0 rounded-xl text-foreground"
                >
                  <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {date
                      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : monthOptions.find((m) => m.value === selectedMonth)?.label || 'Select month'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-4">
                  {/* Month Selector */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Month</label>
                    <Select value={selectedMonth} onValueChange={handleMonthChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {monthOptions.find((m) => m.value === selectedMonth)?.label || 'Select month'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Date Picker (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Date (optional)</label>
                      {date && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.preventDefault()
                            setDate(undefined)
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        setDate(selectedDate)
                        if (selectedDate) {
                          setShowDateSelector(false)
                        }
                      }}
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      disabled={(dateToCheck) => {
                        const [year, monthNum] = selectedMonth.split('-').map(Number)
                        const checkYear = dateToCheck.getFullYear()
                        const checkMonth = dateToCheck.getMonth() + 1
                        // Disable dates outside the selected month
                        if (checkYear !== year || checkMonth !== monthNum) return true
                        // Disable past dates
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return dateToCheck < today
                      }}
                      initialFocus
                    />
                  </div>
                </div>
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

        {/* Month & Date */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">When</label>
          <Popover open={showDateSelector} onOpenChange={setShowDateSelector}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start py-3 px-4 h-auto bg-gray-50 hover:bg-gray-100 border-0 rounded-xl text-foreground"
              >
                <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {date
                    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : monthOptions.find((m) => m.value === selectedMonth)?.label || 'Select month'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                {/* Month Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Month</label>
                  <Select value={selectedMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {monthOptions.find((m) => m.value === selectedMonth)?.label || 'Select month'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Date Picker (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Date (optional)</label>
                    {date && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          setDate(undefined)
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate)
                      if (selectedDate) {
                        setShowDateSelector(false)
                      }
                    }}
                    month={date ? new Date(date.getFullYear(), date.getMonth(), 1) : (() => {
                      const [year, monthNum] = selectedMonth.split('-').map(Number)
                      return new Date(year, monthNum - 1, 1)
                    })()}
                    disabled={(dateToCheck) => {
                      const [year, monthNum] = selectedMonth.split('-').map(Number)
                      const checkYear = dateToCheck.getFullYear()
                      const checkMonth = dateToCheck.getMonth() + 1
                      // Disable dates outside the selected month
                      if (checkYear !== year || checkMonth !== monthNum) return true
                      // Disable past dates
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return dateToCheck < today
                    }}
                    initialFocus
                  />
                </div>
              </div>
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
