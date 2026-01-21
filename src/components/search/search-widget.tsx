'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Search, MapPin, Calendar as CalendarIcon, Users, Plus, Minus } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

import { SearchParams } from '@/types'

interface SearchWidgetProps {
  variant?: 'hero' | 'compact'
  className?: string
  initialParams?: {
    location?: string
    date?: Date
    startDate?: Date
    endDate?: Date
    month?: string // Format: "YYYY-MM"
    guests?: number
  }
}

interface PlacePrediction {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export function SearchWidget({
  variant = 'hero',
  className = '',
  initialParams,
}: SearchWidgetProps) {
  const router = useRouter()
  const [location, setLocation] = useState(initialParams?.location || '')

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialParams?.startDate) {
      return {
        from: initialParams.startDate,
        to: initialParams.endDate,
      }
    } else if (initialParams?.date) {
      return {
        from: initialParams.date,
        to: undefined,
      }
    }
    return undefined
  })

  // Helper to format date display
  const getDateDisplay = () => {
    if (dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
      }
      return format(dateRange.from, 'MMM d')
    }
    return monthOptions.find((m) => m.value === selectedMonth)?.label || 'Select dates'
  }
  const [guests, setGuests] = useState(initialParams?.guests || 2)
  const [showGuestSelector, setShowGuestSelector] = useState(false)
  const [showDateSelector, setShowDateSelector] = useState(false)

  // Google Places autocomplete state
  const [googlePlacesLoaded, setGooglePlacesLoaded] = useState(false)
  const [placeSuggestions, setPlaceSuggestions] = useState<PlacePrediction[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)

  // Month/Year selection
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialParams?.startDate
      ? `${new Date(initialParams.startDate).getFullYear()}-${String(new Date(initialParams.startDate).getMonth() + 1).padStart(2, '0')}`
      : initialParams?.month || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
  )

  // Calendar month state (for controlling which month is displayed)
  const getInitialCalendarMonth = () => {
    if (initialParams?.startDate) {
      const dateObj = new Date(initialParams.startDate)
      return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
    }
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

  // Load Google Places API
  useEffect(() => {
    const loadGooglePlaces = () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

      if (!apiKey) {
        console.warn('Google Places API key is not set. Autocomplete will not work.')
        return
      }

      if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
        setGooglePlacesLoaded(true)
        // Initialize AutocompleteService
        try {
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
        } catch (error) {
          console.error('Error initializing AutocompleteService:', error)
        }
        return
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkInterval = setInterval(() => {
          if ((window as any).google?.maps?.places) {
            setGooglePlacesLoaded(true)
            try {
              autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
            } catch (error) {
              console.error('Error initializing AutocompleteService:', error)
            }
            clearInterval(checkInterval)
          }
        }, 100)

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
        }, 10000)

        return () => clearInterval(checkInterval)
      }

      // Load Google Maps API with Places library
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en`
      script.async = true
      script.defer = true
      script.onload = () => {
        if ((window as any).google?.maps?.places) {
          setGooglePlacesLoaded(true)
          try {
            autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
          } catch (error) {
            console.error('Error initializing AutocompleteService:', error)
          }
        }
      }
      script.onerror = (error) => {
        console.error('Failed to load Google Places API:', error)
        console.error('Please check your NEXT_PUBLIC_GOOGLE_PLACES_API_KEY environment variable')
      }
      document.head.appendChild(script)
    }

    loadGooglePlaces()
  }, [])

  // Update state when initialParams change (e.g., when navigating to different search URL)
  useEffect(() => {
    if (initialParams) {
      setLocation(initialParams.location || '')
      setGuests(initialParams.guests || 2)

      if (initialParams.startDate) {
        setDateRange({
          from: new Date(initialParams.startDate),
          to: initialParams.endDate ? new Date(initialParams.endDate) : undefined,
        })
        const dateObj = new Date(initialParams.startDate)
        const monthValue = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
        setSelectedMonth(monthValue)
        setCalendarMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1))
      } else if (initialParams.date) {
        setDateRange({
          from: new Date(initialParams.date),
          to: undefined,
        })
        const dateObj = new Date(initialParams.date)
        const monthValue = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
        setSelectedMonth(monthValue)
        setCalendarMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1))
      } else if (initialParams.month) {
        setSelectedMonth(initialParams.month)
        const [year, monthNum] = initialParams.month.split('-').map(Number)
        setCalendarMonth(new Date(year, monthNum - 1, 1))
        setDateRange(undefined)
      }
    }
  }, [initialParams])

  // Fetch place suggestions when location input changes
  useEffect(() => {
    // Clear suggestions if location is empty
    if (!location.trim()) {
      setPlaceSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Don't fetch if API isn't ready
    if (!googlePlacesLoaded || !autocompleteServiceRef.current) {
      return
    }

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      if (autocompleteServiceRef.current && location.trim()) {
        try {
          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: location,
              // No country restriction - allow all countries
              // Don't restrict types - let Google return relevant results (cities, regions, etc.)
            },
            (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                setPlaceSuggestions(predictions)
                // Always show suggestions if we have them
                setShowSuggestions(true)
                setSelectedSuggestionIndex(-1)
              } else if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                // Only log errors, not zero results (which is normal)
                console.warn('Google Places API error:', status)
                setPlaceSuggestions([])
                setShowSuggestions(false)
              } else {
                // Zero results - hide suggestions
                setPlaceSuggestions([])
                setShowSuggestions(false)
              }
            }
          )
        } catch (error) {
          console.error('Error fetching place predictions:', error)
          setPlaceSuggestions([])
          setShowSuggestions(false)
        }
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [location, googlePlacesLoaded])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle location input change
  const handleLocationChange = (value: string) => {
    setLocation(value)
    // Don't set showSuggestions here - let the useEffect handle it based on API results
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: PlacePrediction) => {
    // Extract the main location name (first part before comma, or main_text)
    // This makes the search more effective by using just the location name
    const locationName =
      suggestion.structured_formatting.main_text || suggestion.description.split(',')[0]
    setLocation(locationName)
    setShowSuggestions(false)
    setPlaceSuggestions([])
    setSelectedSuggestionIndex(-1)
    locationInputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || placeSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => {
          const newIndex = prev < placeSuggestions.length - 1 ? prev + 1 : prev
          // Scroll into view
          if (suggestionsRef.current && newIndex >= 0) {
            const suggestionElement = suggestionsRef.current.children[newIndex] as HTMLElement
            if (suggestionElement) {
              suggestionElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
          }
          return newIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : -1
          // Scroll into view
          if (suggestionsRef.current && newIndex >= 0) {
            const suggestionElement = suggestionsRef.current.children[newIndex] as HTMLElement
            if (suggestionElement) {
              suggestionElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
          }
          return newIndex
        })
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && placeSuggestions[selectedSuggestionIndex]) {
          handleSelectSuggestion(placeSuggestions[selectedSuggestionIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const incrementGuests = () => setGuests((prev) => Math.min(prev + 1, 20))
  const decrementGuests = () => setGuests((prev) => Math.max(prev - 1, 1))

  const handleSearch = () => {
    // Create search params
    const searchParams = new URLSearchParams()

    if (location) searchParams.set('location', location)

    if (dateRange?.from) {
      searchParams.set('startDate', format(dateRange.from, 'yyyy-MM-dd'))
      if (dateRange.to) {
        searchParams.set('endDate', format(dateRange.to, 'yyyy-MM-dd'))
      } else {
        // If only 'from' is selected, fall back to single date behavior if backend desires,
        // or just send startDate. For now, let's keep 'date' for backward compat or just rely on new logic.
        // The plan said push startDate and endDate.
        // Let's also set 'date' for backward compatibility if it's a single day?
        // Actually, stick to the plan: startDate/endDate.
      }
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
    // We don't automatically clear the range here to allow cross-month viewing,
    // but if the user explicitly switches the 'Month' dropdown, maybe we should reset or just let them pick new dates.
    // For now, let's leave it as is, or maybe checking if the range is completely out of view?
    // The previous logic cleared 'date'. Let's clear range if it doesn't overlap at all maybe?
    // Safe bet: just update the calendar view.
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-2xl shadow-modal border border-border p-4 ${className}`}>
        <div className="flex items-center gap-4">
          {/* Location */}
          <div className="relative flex-1">
            <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">Where</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Input
                ref={locationInputRef}
                placeholder="Search by location or dinner title"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onKeyDown={handleLocationKeyDown}
                onFocus={() => {
                  if (placeSuggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                className="pl-10 py-3 border-0 focus:ring-2 focus:ring-primary rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-foreground"
              />
              {/* Custom Suggestions Dropdown */}
              {showSuggestions && placeSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  {placeSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        index === selectedSuggestionIndex ? 'bg-gray-50' : ''
                      } ${index === 0 ? 'rounded-t-xl' : ''} ${
                        index === placeSuggestions.length - 1 ? 'rounded-b-xl' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {suggestion.structured_formatting.main_text}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {suggestion.structured_formatting.secondary_text}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
                  <span className="text-sm text-foreground">{getDateDisplay()}</span>
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
                          {monthOptions.find((m) => m.value === selectedMonth)?.label ||
                            'Select month'}
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
                      <label className="text-sm font-medium">Select dates</label>
                      {dateRange?.from && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.preventDefault()
                            setDateRange(undefined)
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      numberOfMonths={2}
                      disabled={(dateToCheck) => {
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
      className={`bg-white rounded-2xl shadow-modal border border-border p-4 relative ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-800 mb-2 ml-4">Where</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              ref={locationInputRef}
              placeholder="Search by location or dinner title"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onKeyDown={handleLocationKeyDown}
              onFocus={() => {
                // Show suggestions if we have any, or trigger a search if there's text
                if (placeSuggestions.length > 0) {
                  setShowSuggestions(true)
                } else if (
                  location.trim() &&
                  googlePlacesLoaded &&
                  autocompleteServiceRef.current
                ) {
                  // Trigger a search when focusing with existing text
                  // The useEffect will handle the actual API call
                  setShowSuggestions(true)
                }
              }}
              className="pl-10 py-3 border-0 focus:ring-2 focus:ring-primary rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-foreground"
            />
            {/* Custom Suggestions Dropdown */}
            {showSuggestions && placeSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
              >
                {placeSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      index === selectedSuggestionIndex ? 'bg-gray-50' : ''
                    } ${index === 0 ? 'rounded-t-xl' : ''} ${
                      index === placeSuggestions.length - 1 ? 'rounded-b-xl' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {suggestion.structured_formatting.main_text}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.structured_formatting.secondary_text}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
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
                <span className="text-sm text-foreground">{getDateDisplay()}</span>
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
                        {monthOptions.find((m) => m.value === selectedMonth)?.label ||
                          'Select month'}
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
                    <label className="text-sm font-medium">Select dates</label>
                    {dateRange?.from && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          setDateRange(undefined)
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    numberOfMonths={2}
                    disabled={(dateToCheck) => {
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
