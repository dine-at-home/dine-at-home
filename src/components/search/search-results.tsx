'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { DinnerCard } from '../dinner/dinner-card'
import { SearchWidget } from './search-widget'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Slider } from '../ui/slider'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import {
  Filter,
  MapPin,
  Star,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
  Search,
} from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '../ui/pagination'
import { getApiUrl } from '@/lib/api-config'
import { transformDinner } from '@/lib/dinner-utils'
import { shouldShowInListings } from '@/lib/dinner-filters'
import { BOOKING_CREATED_EVENT } from '@/lib/booking-events'
import { SearchParams, NavigationParams, Dinner } from '@/types'

interface SearchResultsProps {
  searchParams: SearchParams
}

const FiltersContent = ({
  priceRange,
  setPriceRange,
  selectedCuisines,
  toggleCuisine,
  instantBookOnly,
  setInstantBookOnly,
  superhostOnly,
  setSuperhostOnly,
  clearFilters,
}: {
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  selectedCuisines: string[]
  toggleCuisine: (val: string) => void
  instantBookOnly: boolean
  setInstantBookOnly: (val: boolean) => void
  superhostOnly: boolean
  setSuperhostOnly: (val: boolean) => void
  clearFilters: () => void
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold mb-3">Price per person</h3>
      <div className="space-y-3">
        <Slider
          value={priceRange}
          onValueChange={(val) => {
            if (Array.isArray(val)) setPriceRange(val)
          }}
          max={1000}
          min={0}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>€{priceRange[0]}</span>
          <span>€{priceRange[1]}+</span>
        </div>
      </div>
    </div>

    {/* <div>
      <h3 className="font-semibold mb-3">Cuisine Type</h3>
      <div className="grid grid-cols-2 gap-2">
        {cuisines.map(cuisine => (
          <div key={cuisine} className="flex items-center space-x-2">
            <Checkbox
              id={cuisine}
              checked={selectedCuisines.includes(cuisine)}
              onCheckedChange={() => toggleCuisine(cuisine)}
            />
            <label 
              htmlFor={cuisine}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {cuisine}
            </label>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 className="font-semibold mb-3">Booking Options</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="instant-book"
            checked={instantBookOnly}
            onCheckedChange={(checkedState) => setInstantBookOnly(checkedState === true)}
          />
          <label htmlFor="instant-book" className="text-sm font-medium">
            Instant Book only
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="superhost"
            checked={superhostOnly}
            onCheckedChange={(checked) => {
              setSuperhostOnly(checked === true)
              // Page reset is handled by parent component
            }}
          />
          <label htmlFor="superhost" className="text-sm font-medium">
            Superhost only
          </label>
        </div>
      </div>
    </div> */}

    <Button variant="outline" onClick={clearFilters} className="w-full">
      Clear all filters
    </Button>
  </div>
)

export function SearchResults({ searchParams }: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('rating')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [instantBookOnly, setInstantBookOnly] = useState(false)
  const [superhostOnly, setSuperhostOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [dinners, setDinners] = useState<Dinner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDinners, setTotalDinners] = useState(0)

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)

  // Fetch dinners from API
  useEffect(() => {
    const fetchDinners = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query parameters with pagination (6 items per page)
        const queryParams = new URLSearchParams({
          limit: '6',
          page: currentPage.toString(),
        })
        
        // Add sortBy parameter
        if (sortBy) {
          queryParams.append('sortBy', sortBy)
        }
        
        // Add price filter
        if (priceRange[0] > 0) {
          queryParams.append('minPrice', priceRange[0].toString())
        }
        if (priceRange[1] < 1000) {
          queryParams.append('maxPrice', priceRange[1].toString())
        }
        
        // Add instant book filter
        if (instantBookOnly) {
          queryParams.append('instantBook', 'true')
        }

        // Search by query (title or location) - takes precedence over location
        if (searchParams.location) {
          // Use location as query to search both title and location
          queryParams.append('query', searchParams.location)
        }
        if (searchParams.month) {
          queryParams.append('month', searchParams.month)
        } else if (searchParams.date) {
          queryParams.append('date', searchParams.date.toISOString().split('T')[0])
        }
        if (searchParams.guests) {
          queryParams.append('guests', searchParams.guests.toString())
        }
        if (searchParams.cuisine) {
          queryParams.append('cuisine', searchParams.cuisine)
        }

        const response = await fetch(getApiUrl(`/dinners?${queryParams.toString()}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const result = await response.json()

        if (result.success && result.data) {
          const transformedDinners = result.data.map(transformDinner)
          // Filter out booked and past dinners
          const availableDinners = transformedDinners.filter(shouldShowInListings)
          setDinners(availableDinners)
          
          // Update pagination info
          if (result.pagination) {
            setTotalPages(result.pagination.totalPages || 1)
            setTotalDinners(result.pagination.total || 0)
          }
        } else {
          setError(result.error || 'Failed to load dinners')
          setDinners([])
          setTotalPages(1)
          setTotalDinners(0)
        }
      } catch (err: any) {
        console.error('Error fetching dinners:', err)
        setError('Failed to load dinners. Please try again later.')
        setDinners([])
      } finally {
        setLoading(false)
      }
    }

    fetchDinners()
  }, [
    searchParams.location,
    searchParams.date,
    searchParams.month,
    searchParams.guests,
    searchParams.cuisine,
    sortBy, // Refetch when sort changes
    currentPage, // Refetch when page changes
    priceRange, // Refetch when price filter changes
    instantBookOnly, // Refetch when instant book filter changes
  ])

  // Listen for booking created events to remove dinner from listings in real-time
  useEffect(() => {
    const handleBookingCreated = (event: Event) => {
      console.log('🟠 Search results received booking-created event:', event)
      const customEvent = event as CustomEvent<{ dinnerId: string; bookingId: string }>
      const { dinnerId } = customEvent.detail

      console.log('🟠 Event detail:', customEvent.detail)
      console.log('🟠 Removing dinnerId from search results:', dinnerId)
      console.log('🟠 Current dinners count:', dinners.length)

      // Remove the booked dinner from listings immediately
      setDinners((prevDinners) => {
        const filtered = prevDinners.filter((d) => d.id !== dinnerId)
        console.log('🟠 After filtering, remaining dinners:', filtered.length)
        return filtered
      })
    }

    console.log('🟠 Search results setting up event listener for:', BOOKING_CREATED_EVENT)
    window.addEventListener(BOOKING_CREATED_EVENT, handleBookingCreated)

    return () => {
      console.log('🟠 Search results removing event listener')
      window.removeEventListener(BOOKING_CREATED_EVENT, handleBookingCreated)
    }
  }, [dinners.length])

  // Get unique cuisines for filter (computed from fetched dinners)
  const cuisines = useMemo(() => {
    return Array.from(new Set(dinners.map((dinner) => dinner.cuisine).filter(Boolean)))
  }, [dinners])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter dinners (client-side filtering only for cuisine and superhost since they're not in API yet)
  // Server handles sorting and pagination
  const filteredDinners = useMemo(() => {
    return dinners.filter((dinner) => {
      // Cuisine filter (client-side for now)
      if (selectedCuisines.length > 0 && !selectedCuisines.includes(dinner.cuisine)) return false

      // Superhost filter (client-side for now)
      if (superhostOnly && !dinner.host.superhost) return false

      return true
    })
  }, [dinners, selectedCuisines, superhostOnly])

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    )
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  const handlePriceRangeChange = (newRange: number[]) => {
    setPriceRange(newRange)
    setCurrentPage(1) // Reset to first page when price filter changes
  }
  
  const handleInstantBookChange = (value: boolean) => {
    setInstantBookOnly(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  const handleSuperhostChange = (value: boolean) => {
    setSuperhostOnly(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1) // Reset to first page when sort changes
  }

  const clearFilters = () => {
    setPriceRange([0, 1000])
    setSelectedCuisines([])
    setInstantBookOnly(false)
    setSuperhostOnly(false)
    setCurrentPage(1) // Reset to first page
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Bar */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Mobile: Hero variant, Desktop: Compact variant */}
          <div className="block md:hidden">
            <SearchWidget
              variant="hero"
              initialParams={{
                location: searchParams.location,
                date: searchParams.date,
                month: searchParams.month,
                guests: searchParams.guests,
              }}
            />
          </div>
          <div className="hidden md:block">
            <SearchWidget
              variant="compact"
              initialParams={{
                location: searchParams.location,
                date: searchParams.date,
                month: searchParams.month,
                guests: searchParams.guests,
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block lg:w-80 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
              <FiltersContent
                priceRange={priceRange}
                setPriceRange={handlePriceRangeChange}
                selectedCuisines={selectedCuisines}
                toggleCuisine={toggleCuisine}
                instantBookOnly={instantBookOnly}
                setInstantBookOnly={handleInstantBookChange}
                superhostOnly={superhostOnly}
                setSuperhostOnly={handleSuperhostChange}
                clearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-semibold">
                  {loading ? 'Loading...' : `${totalDinners || filteredDinners.length} dinner experience${totalDinners !== 1 ? 's' : ''}`}
                  {searchParams.location && (
                    <span className="text-muted-foreground"> for "{searchParams.location}"</span>
                  )}
                </h1>
                {(searchParams.month || searchParams.date) && (
                  <p className="text-muted-foreground mt-1">
                    {searchParams.month
                      ? (() => {
                          const [year, month] = searchParams.month.split('-').map(Number)
                          const date = new Date(year, month - 1, 1)
                          return date.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        })()
                      : searchParams.date
                        ? searchParams.date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })
                        : ''}
                    {searchParams.guests && ` • ${searchParams.guests} guests`}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {/* Mobile Filters */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh]">
                    <div className="px-4 py-6">
                      <h2 className="font-semibold mb-6">Filters</h2>
                      <FiltersContent
                        priceRange={priceRange}
                        setPriceRange={handlePriceRangeChange}
                        selectedCuisines={selectedCuisines}
                        toggleCuisine={toggleCuisine}
                        instantBookOnly={instantBookOnly}
                        setInstantBookOnly={handleInstantBookChange}
                        superhostOnly={superhostOnly}
                        setSuperhostOnly={setSuperhostOnly}
                        clearFilters={clearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="date">Soonest Date</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex border border-border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none border-r"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dinners...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-16">
                <p className="text-destructive text-lg mb-2">{error}</p>
                <p className="text-muted-foreground mb-4">Please try again later</p>
              </div>
            )}

            {/* Active Filters */}
            {!loading &&
              !error &&
              (selectedCuisines.length > 0 ||
                instantBookOnly ||
                superhostOnly ||
                priceRange[0] > 0 ||
                priceRange[1] < 200) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCuisines.map((cuisine) => (
                    <Badge
                      key={cuisine}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => toggleCuisine(cuisine)}
                    >
                      {cuisine} ×
                    </Badge>
                  ))}
                  {instantBookOnly && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        setInstantBookOnly(false)
                        setCurrentPage(1)
                      }}
                    >
                      Instant Book ×
                    </Badge>
                  )}
                  {superhostOnly && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        handleSuperhostChange(false)
                      }}
                    >
                      Superhost ×
                    </Badge>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        setPriceRange([0, 1000])
                        setCurrentPage(1)
                      }}
                    >
                      €{priceRange[0]} - €{priceRange[1]} ×
                    </Badge>
                  )}
                </div>
              )}

            {/* Results Grid */}
            {!loading && !error && filteredDinners.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : !loading && !error ? (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
                }`}
              >
                {filteredDinners.map((dinner) => (
                  <DinnerCard
                    key={dinner.id}
                    dinner={dinner}
                    className={viewMode === 'list' ? 'md:flex md:space-x-4' : ''}
                  />
                ))}
              </div>
            ) : null}
            
            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={page === currentPage}
                              onClick={() => {
                                setCurrentPage(page)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }
                      return null
                    })}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
