'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { HostGuard } from '@/components/auth/host-guard'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Upload,
  Plus,
  X,
  Save,
  ArrowLeft,
  ChefHat,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Shield,
} from 'lucide-react'
import Image from 'next/image'
import { getApiUrl } from '@/lib/api-config'
import { transformDinner } from '@/lib/dinner-utils'

function EditDinnerPageContent() {
  const router = useRouter()
  const params = useParams()
  const dinnerId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string)

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])

  const cityInputRef = useRef<HTMLInputElement>(null)
  const neighborhoodInputRef = useRef<HTMLInputElement>(null)
  const citySuggestionsRef = useRef<HTMLDivElement>(null)
  const neighborhoodSuggestionsRef = useRef<HTMLDivElement>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const [googlePlacesLoaded, setGooglePlacesLoaded] = useState(false)

  // City autocomplete state
  const [citySuggestions, setCitySuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedCityIndex, setSelectedCityIndex] = useState(-1)

  // Neighborhood autocomplete state
  const [neighborhoodSuggestions, setNeighborhoodSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showNeighborhoodSuggestions, setShowNeighborhoodSuggestions] = useState(false)
  const [selectedNeighborhoodIndex, setSelectedNeighborhoodIndex] = useState(-1)

  const [dinnerData, setDinnerData] = useState({
    title: '',
    description: '',
    cuisineType: '',
    dietaryAccommodations: [] as string[],
    menu: '',
    ingredients: '',
    specialInstructions: '',
    address: '',
    city: '',
    neighborhood: '',
    state: '',
    zipCode: '',
    directions: '',
    accessibility: '',
    date: '',
    time: '',
    duration: 3,
    maxCapacity: 8,
    pricePerPerson: 100,
    minGuests: 2,
    images: [] as string[],
    experienceLevel: 'beginner',
    includesDrinks: false,
    includesDessert: false,
    cancellationPolicy: 'flexible',
  })

  // Fetch dinner data
  useEffect(() => {
    const fetchDinner = async () => {
      if (!dinnerId) {
        setError('Invalid dinner ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const token = localStorage.getItem('auth_token')
        const response = await fetch(getApiUrl(`/dinners/${dinnerId}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()

        if (result.success && result.data) {
          const rawDinner = result.data // Get raw data before transformation
          const dinner = transformDinner(result.data)

          // Parse menu array to string
          const menuString = Array.isArray(dinner.menu) ? dinner.menu.join(', ') : dinner.menu || ''

          // Parse houseRules array to string
          const houseRulesString = Array.isArray(dinner.houseRules)
            ? dinner.houseRules.join(', ')
            : dinner.houseRules?.[0] || ''

          // Parse duration from minutes to hours (from raw backend response)
          // Handle cases where duration is less than 60 minutes (e.g., 2 minutes = 0.033333 hours)
          const durationMinutes = rawDinner.duration || 180
          const durationHours = durationMinutes < 60 ? durationMinutes / 60 : Math.floor(durationMinutes / 60)

          // Get location data from raw response (it has zipCode)
          const locationData = rawDinner.location
            ? typeof rawDinner.location === 'string'
              ? JSON.parse(rawDinner.location)
              : rawDinner.location
            : {}

          // Format date for HTML date input (YYYY-MM-DD)
          let formattedDate = ''
          if (dinner.date) {
            try {
              const dateObj = new Date(dinner.date)
              if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0]
              }
            } catch (e) {
              console.error('Error parsing date:', e)
            }
          }

          setDinnerData({
            title: dinner.title || '',
            description: dinner.description || '',
            cuisineType: dinner.cuisine || '',
            dietaryAccommodations: Array.isArray(dinner.dietary) ? dinner.dietary : [],
            menu: menuString,
            ingredients: '',
            specialInstructions: houseRulesString,
            address: locationData.address || dinner.location?.address || '',
            city: locationData.city || dinner.location?.city || '',
            neighborhood: locationData.neighborhood || dinner.location?.neighborhood || '',
            state: locationData.state || dinner.location?.state || '',
            zipCode: locationData.zipCode || '',
            directions: '',
            accessibility: '',
            date: formattedDate,
            time: dinner.time || '',
            duration: durationHours,
            maxCapacity: dinner.capacity || 8,
            pricePerPerson: dinner.price || 100,
            minGuests: 2,
            images: Array.isArray(dinner.images)
              ? dinner.images.filter((img: any) => img && typeof img === 'string')
              : [],
            experienceLevel: 'beginner',
            includesDrinks: false,
            includesDessert: false,
            cancellationPolicy: 'flexible',
          })
        } else {
          setError(result.error || 'Dinner not found')
        }
      } catch (err: any) {
        console.error('Error fetching dinner:', err)
        setError('Failed to load dinner. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchDinner()
  }, [dinnerId])

  const cuisineTypes = [
    'Italian',
    'French',
    'Japanese',
    'Chinese',
    'Indian',
    'Mexican',
    'Mediterranean',
    'American',
    'Thai',
    'Korean',
    'Spanish',
    'Greek',
    'Lebanese',
    'Ethiopian',
    'Vietnamese',
    'Fusion',
    'Icelandic',
    'Scandinavian',
    'Swedish',
    'Danish',
    'Norwegian',
    'Other',
  ]

  const dietaryAccommodations = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Kosher',
    'Halal',
    'Low-Sodium',
    'Diabetic-Friendly',
  ]

  const handleInputChange = (field: string, value: any) => {
    setDinnerData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

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
        // Initialize services
        try {
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
          const dummyDiv = document.createElement('div')
          placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv)
        } catch (error) {
          console.error('Error initializing Google Places services:', error)
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
              const dummyDiv = document.createElement('div')
              placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv)
            } catch (error) {
              console.error('Error initializing Google Places services:', error)
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
            const dummyDiv = document.createElement('div')
            placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv)
          } catch (error) {
            console.error('Error initializing Google Places services:', error)
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

  // Fetch city suggestions when city input changes
  useEffect(() => {
    if (!googlePlacesLoaded || !autocompleteServiceRef.current || !dinnerData.city.trim()) {
      setCitySuggestions([])
      setShowCitySuggestions(false)
      return
    }

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      if (autocompleteServiceRef.current && dinnerData.city.trim()) {
        try {
          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: dinnerData.city,
              // No country restriction - allow all countries
              types: ['(cities)'],
            },
            (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                setCitySuggestions(predictions)
                setShowCitySuggestions(predictions.length > 0)
                setSelectedCityIndex(-1)
              } else if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                // Only log errors, not zero results (which is normal)
                console.warn('Google Places API error for city search:', status)
                setCitySuggestions([])
                setShowCitySuggestions(false)
              } else {
                setCitySuggestions([])
                setShowCitySuggestions(false)
              }
            }
          )
        } catch (error) {
          console.error('Error fetching city predictions:', error)
          setCitySuggestions([])
          setShowCitySuggestions(false)
        }
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [dinnerData.city, googlePlacesLoaded])

  // Handle city selection
  const handleSelectCity = (placeId: string, description: string) => {
    // Get place details to extract city name
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: placeId,
          fields: ['address_components', 'name'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            // Extract city name
            const cityComponent = place.address_components?.find(
              (component) => component.types.includes('locality') || component.types.includes('administrative_area_level_1')
            )
            if (cityComponent) {
              handleInputChange('city', cityComponent.long_name)
            } else {
              handleInputChange('city', place.name || description)
            }
            // Clear neighborhood when city changes
            handleInputChange('neighborhood', '')
            setShowCitySuggestions(false)
            setCitySuggestions([])
            setSelectedCityIndex(-1)
          }
        }
      )
    } else {
      // Fallback to description if service not available
      handleInputChange('city', description)
      handleInputChange('neighborhood', '')
      setShowCitySuggestions(false)
    }
  }

  // Fetch neighborhood suggestions when neighborhood input changes
  useEffect(() => {
    if (!googlePlacesLoaded || !autocompleteServiceRef.current || !dinnerData.neighborhood.trim() || !dinnerData.city) {
      setNeighborhoodSuggestions([])
      setShowNeighborhoodSuggestions(false)
      return
    }

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      if (autocompleteServiceRef.current && dinnerData.neighborhood.trim()) {
        try {
          // Search for neighborhoods - use a broader search strategy
          const searchQuery = dinnerData.neighborhood.trim()
          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: searchQuery,
              // No country restriction - allow all countries
              // Don't restrict types too much - let Google return relevant results
            },
            (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                // Filter predictions to prioritize neighborhoods/areas in the selected city
                const filtered = predictions.filter((pred) => {
                  const desc = pred.description.toLowerCase()
                  const cityLower = dinnerData.city.toLowerCase()
                  // Include results that mention the city or Iceland
                  return desc.includes(cityLower) || desc.includes('iceland')
                })
                // Use filtered results if available, otherwise use all predictions
                const finalResults = filtered.length > 0 ? filtered : predictions
                setNeighborhoodSuggestions(finalResults)
                setShowNeighborhoodSuggestions(finalResults.length > 0)
                setSelectedNeighborhoodIndex(-1)
              } else if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                // Only log errors, not zero results (which is normal)
                console.warn('Google Places API error for neighborhood search:', status)
                setNeighborhoodSuggestions([])
                setShowNeighborhoodSuggestions(false)
              } else {
                setNeighborhoodSuggestions([])
                setShowNeighborhoodSuggestions(false)
              }
            }
          )
        } catch (error) {
          console.error('Error fetching neighborhood predictions:', error)
          setNeighborhoodSuggestions([])
          setShowNeighborhoodSuggestions(false)
        }
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [dinnerData.neighborhood, dinnerData.city, googlePlacesLoaded])

  // Handle neighborhood selection
  const handleSelectNeighborhood = (placeId: string, description: string) => {
    // Get place details to extract neighborhood name
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: placeId,
          fields: ['name'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            handleInputChange('neighborhood', place.name || description)
            setShowNeighborhoodSuggestions(false)
            setNeighborhoodSuggestions([])
            setSelectedNeighborhoodIndex(-1)
          }
        }
      )
    } else {
      // Fallback to description if service not available
      handleInputChange('neighborhood', description)
      setShowNeighborhoodSuggestions(false)
    }
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        citySuggestionsRef.current &&
        !citySuggestionsRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCitySuggestions(false)
      }
      if (
        neighborhoodSuggestionsRef.current &&
        !neighborhoodSuggestionsRef.current.contains(event.target as Node) &&
        neighborhoodInputRef.current &&
        !neighborhoodInputRef.current.contains(event.target as Node)
      ) {
        setShowNeighborhoodSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation for city
  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCitySuggestions || citySuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedCityIndex((prev) => {
          const newIndex = prev < citySuggestions.length - 1 ? prev + 1 : prev
          if (citySuggestionsRef.current && newIndex >= 0) {
            const element = citySuggestionsRef.current.children[newIndex] as HTMLElement
            if (element) element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }
          return newIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedCityIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : -1
          if (citySuggestionsRef.current && newIndex >= 0) {
            const element = citySuggestionsRef.current.children[newIndex] as HTMLElement
            if (element) element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }
          return newIndex
        })
        break
      case 'Enter':
        e.preventDefault()
        if (selectedCityIndex >= 0 && citySuggestions[selectedCityIndex]) {
          handleSelectCity(citySuggestions[selectedCityIndex].place_id, citySuggestions[selectedCityIndex].description)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowCitySuggestions(false)
        setSelectedCityIndex(-1)
        break
    }
  }

  // Handle keyboard navigation for neighborhood
  const handleNeighborhoodKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showNeighborhoodSuggestions || neighborhoodSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedNeighborhoodIndex((prev) => {
          const newIndex = prev < neighborhoodSuggestions.length - 1 ? prev + 1 : prev
          if (neighborhoodSuggestionsRef.current && newIndex >= 0) {
            const element = neighborhoodSuggestionsRef.current.children[newIndex] as HTMLElement
            if (element) element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }
          return newIndex
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedNeighborhoodIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : -1
          if (neighborhoodSuggestionsRef.current && newIndex >= 0) {
            const element = neighborhoodSuggestionsRef.current.children[newIndex] as HTMLElement
            if (element) element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }
          return newIndex
        })
        break
      case 'Enter':
        e.preventDefault()
        if (selectedNeighborhoodIndex >= 0 && neighborhoodSuggestions[selectedNeighborhoodIndex]) {
          handleSelectNeighborhood(
            neighborhoodSuggestions[selectedNeighborhoodIndex].place_id,
            neighborhoodSuggestions[selectedNeighborhoodIndex].description
          )
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowNeighborhoodSuggestions(false)
        setSelectedNeighborhoodIndex(-1)
        break
    }
  }

  const handleDietaryToggle = (dietary: string) => {
    setDinnerData((prev) => ({
      ...prev,
      dietaryAccommodations: prev.dietaryAccommodations.includes(dietary)
        ? prev.dietaryAccommodations.filter((d) => d !== dietary)
        : [...prev.dietaryAccommodations, dietary],
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)

    // Check total image count (max 5) - existing images + new files
    const existingImageCount = dinnerData.images.length
    const totalAfterAdd = existingImageCount + selectedImageFiles.length + newFiles.length
    if (totalAfterAdd > 5) {
      setError(
        `Maximum 5 images allowed. You have ${existingImageCount} existing image${existingImageCount !== 1 ? 's' : ''} and ${selectedImageFiles.length} new image${selectedImageFiles.length !== 1 ? 's' : ''} selected.`
      )
      e.target.value = ''
      return
    }

    const validFiles = newFiles.filter((file) => file.type.startsWith('image/'))
    if (validFiles.length !== newFiles.length) {
      setError('Only image files are allowed')
      e.target.value = ''
      return
    }

    const sizeValidFiles = validFiles.filter((file) => file.size <= 5 * 1024 * 1024)
    if (sizeValidFiles.length !== validFiles.length) {
      setError('Images must be smaller than 5MB each')
      e.target.value = ''
      return
    }

    // Limit to 5 total images (existing + new)
    const remainingSlots = 5 - existingImageCount - selectedImageFiles.length
    const filesToAdd = sizeValidFiles.slice(0, remainingSlots)

    if (filesToAdd.length < sizeValidFiles.length) {
      setError(
        `Maximum 5 images allowed. Only ${filesToAdd.length} image${filesToAdd.length !== 1 ? 's' : ''} added.`
      )
    }

    setSelectedImageFiles((prev) => [...prev, ...filesToAdd])
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index))
    setDinnerData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []

    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('You must be logged in to upload images')
    }

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images[]', file)
    })

    const response = await fetch(getApiUrl('/upload/images'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to upload images')
    }

    if (!result.success || !result.data?.urls) {
      throw new Error('Invalid response from upload endpoint')
    }

    return result.data.urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', { dinnerData, selectedImageFiles })
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setError('You must be logged in to update a dinner')
        setIsSubmitting(false)
        return
      }

      // Upload new images if any
      let imageUrls: string[] = []
      if (selectedImageFiles.length > 0) {
        setUploadingImages(true)
        try {
          imageUrls = await uploadImages(selectedImageFiles)
          setUploadingImages(false)
        } catch (uploadError: any) {
          setUploadingImages(false)
          setError(uploadError.message || 'Failed to upload images. Please try again.')
          setIsSubmitting(false)
          return
        }
      }

      // Combine existing images with new ones
      const allImages = [...dinnerData.images, ...imageUrls]

      // Validate total images don't exceed 5
      if (allImages.length > 5) {
        setError('Maximum 5 images allowed per dinner')
        setIsSubmitting(false)
        return
      }

      // Parse menu from string
      const menuItems = dinnerData.menu
        ? dinnerData.menu
          .split(/[,\n]/)
          .map((item) => item.trim())
          .filter((item) => item)
        : []

      // Build location object
      const location = {
        address: dinnerData.address,
        city: dinnerData.city,
        state: dinnerData.state,
        zipCode: dinnerData.zipCode,
        neighborhood: dinnerData.neighborhood || dinnerData.city,
        coordinates: {
          lat: 0,
          lng: 0,
        },
      }

      // Validate date and time are provided
      if (!dinnerData.date || !dinnerData.time) {
        setError('Date and time are required')
        setIsSubmitting(false)
        return
      }

      // Validate price
      if (!dinnerData.pricePerPerson || dinnerData.pricePerPerson <= 0) {
        setError('Price per person must be greater than 0')
        setIsSubmitting(false)
        return
      }

      if (dinnerData.pricePerPerson > 1000) {
        setError('Price per person cannot exceed 1000 euros')
        setIsSubmitting(false)
        return
      }

      // Combine date and time into ISO date string
      const dateTime = new Date(`${dinnerData.date}T${dinnerData.time}:00`).toISOString()

      // Validate date is valid
      if (isNaN(new Date(dateTime).getTime())) {
        setError('Invalid date or time format')
        setIsSubmitting(false)
        return
      }

      // Prepare request body
      const requestBody = {
        title: dinnerData.title,
        description: dinnerData.description,
        price: dinnerData.pricePerPerson,
        currency: 'EUR',
        cancellationPolicy: dinnerData.cancellationPolicy || 'flexible',
        date: dateTime,
        time: dinnerData.time,
        duration: dinnerData.duration * 60,
        capacity: dinnerData.maxCapacity,
        images: allImages,
        cuisine: dinnerData.cuisineType,
        dietary: dinnerData.dietaryAccommodations,
        menu: menuItems,
        houseRules: dinnerData.specialInstructions ? [dinnerData.specialInstructions] : [],
        location: location,
      }

      // Send PATCH request
      const response = await fetch(getApiUrl(`/dinners/${dinnerId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Update failed:', result)
        setError(result.error || result.message || 'Failed to update dinner. Please try again.')
        setIsSubmitting(false)
        return
      }

      console.log('Update successful:', result)

      // Success - redirect to dashboard
      router.push('/host/dashboard?tab=dinners')
      router.refresh()
    } catch (err: any) {
      console.error('Error updating dinner:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <HostGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading dinner details...</p>
          </div>
        </div>
      </HostGuard>
    )
  }

  return (
    <HostGuard>
      <div className="min-h-screen bg-background">
        {error && (
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Edit Dinner</h1>
                <p className="text-muted-foreground mt-1">Update your dining experience details</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/host/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Tell guests about your dining experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Dinner Title *</label>
                  <Input
                    value={dinnerData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Authentic Italian Pasta Making Workshop"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    value={dinnerData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your dining experience, what makes it special, and what guests can expect..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cuisine Type *</label>
                    <Select
                      value={dinnerData.cuisineType}
                      onValueChange={(value) => handleInputChange('cuisineType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cuisine type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cuisineTypes.map((cuisine) => (
                          <SelectItem key={cuisine} value={cuisine}>
                            {cuisine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Experience Level</label>
                    <Select
                      value={dinnerData.experienceLevel}
                      onValueChange={(value) => handleInputChange('experienceLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner Friendly</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Dietary Accommodations</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dietaryAccommodations.map((dietary) => (
                      <Button
                        key={dietary}
                        type="button"
                        variant={
                          dinnerData.dietaryAccommodations.includes(dietary) ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => handleDietaryToggle(dietary)}
                        className="justify-start"
                      >
                        {dietary}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu & Food Details */}
            <Card>
              <CardHeader>
                <CardTitle>Menu & Food Details</CardTitle>
                <CardDescription>What will you be serving?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Menu Description *</label>
                  <Textarea
                    value={dinnerData.menu}
                    onChange={(e) => handleInputChange('menu', e.target.value)}
                    placeholder="Describe each course, appetizers, main dishes, and any special preparations..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Key Ingredients</label>
                  <Textarea
                    value={dinnerData.ingredients}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                    placeholder="List main ingredients, any allergens, or special ingredients you'll be using..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Special Instructions</label>
                  <Textarea
                    value={dinnerData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="Any special preparation methods, cooking techniques, or guest participation details..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includesDrinks"
                      checked={dinnerData.includesDrinks}
                      onChange={(e) => handleInputChange('includesDrinks', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="includesDrinks" className="text-sm font-medium">
                      Includes Drinks (wine, beverages)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includesDessert"
                      checked={dinnerData.includesDessert}
                      onChange={(e) => handleInputChange('includesDessert', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="includesDessert" className="text-sm font-medium">
                      Includes Dessert
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Access
                </CardTitle>
                <CardDescription>Where will the dinner take place?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Street Address *</label>
                  <Input
                    value={dinnerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    This address will not be visible to guests until their booking is confirmed
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <div className="relative">
                      <Input
                        ref={cityInputRef}
                        value={dinnerData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        onKeyDown={handleCityKeyDown}
                        onFocus={() => {
                          if (citySuggestions.length > 0) {
                            setShowCitySuggestions(true)
                          }
                        }}
                        placeholder="Reykjavik, Akureyri, etc."
                        required
                        disabled={!googlePlacesLoaded}
                      />
                      {!googlePlacesLoaded && (
                        <p className="text-xs text-muted-foreground mt-1">Loading city suggestions...</p>
                      )}
                      {/* Custom City Suggestions Dropdown */}
                      {showCitySuggestions && citySuggestions.length > 0 && (
                        <div
                          ref={citySuggestionsRef}
                          className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                        >
                          {citySuggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.place_id}
                              type="button"
                              onClick={() => handleSelectCity(suggestion.place_id, suggestion.description)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${index === selectedCityIndex ? 'bg-gray-50' : ''
                                } ${index === 0 ? 'rounded-t-xl' : ''} ${index === citySuggestions.length - 1 ? 'rounded-b-xl' : ''
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Area/Neighborhood *</label>
                    <div className="relative">
                      <Input
                        ref={neighborhoodInputRef}
                        value={dinnerData.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        onKeyDown={handleNeighborhoodKeyDown}
                        onFocus={() => {
                          if (neighborhoodSuggestions.length > 0) {
                            setShowNeighborhoodSuggestions(true)
                          }
                        }}
                        placeholder={dinnerData.city ? `Neighborhood in ${dinnerData.city}` : 'Select a city first'}
                        required
                        disabled={!googlePlacesLoaded || !dinnerData.city}
                      />
                      {!dinnerData.city && (
                        <p className="text-xs text-muted-foreground mt-1">Please select a city first</p>
                      )}
                      {/* Custom Neighborhood Suggestions Dropdown */}
                      {showNeighborhoodSuggestions && neighborhoodSuggestions.length > 0 && (
                        <div
                          ref={neighborhoodSuggestionsRef}
                          className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                        >
                          {neighborhoodSuggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.place_id}
                              type="button"
                              onClick={() => handleSelectNeighborhood(suggestion.place_id, suggestion.description)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${index === selectedNeighborhoodIndex ? 'bg-gray-50' : ''
                                } ${index === 0 ? 'rounded-t-xl' : ''} ${index === neighborhoodSuggestions.length - 1 ? 'rounded-b-xl' : ''
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <Input
                      value={dinnerData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Iceland"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <Input
                      value={dinnerData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Directions & Access</label>
                  <Textarea
                    value={dinnerData.directions}
                    onChange={(e) => handleInputChange('directions', e.target.value)}
                    placeholder="Parking instructions, building access, elevator usage, etc."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Accessibility Information
                  </label>
                  <Textarea
                    value={dinnerData.accessibility}
                    onChange={(e) => handleInputChange('accessibility', e.target.value)}
                    placeholder="Wheelchair access, stairs, special accommodations available..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date, Time & Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date, Time & Capacity
                </CardTitle>
                <CardDescription>When and how many guests?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <Input
                      type="date"
                      value={dinnerData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time *</label>
                    <Input
                      type="time"
                      value={dinnerData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (hours/minutes)</label>
                    <Select
                      value={dinnerData.duration.toString()}
                      onValueChange={(value) => handleInputChange('duration', parseFloat(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.033333">2 minutes</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="5">5 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Capacity *</label>
                    <Select
                      value={dinnerData.maxCapacity.toString()}
                      onValueChange={(value) => handleInputChange('maxCapacity', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 guests</SelectItem>
                        <SelectItem value="6">6 guests</SelectItem>
                        <SelectItem value="8">8 guests</SelectItem>
                        <SelectItem value="10">10 guests</SelectItem>
                        <SelectItem value="12">12 guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Guests</label>
                    <Select
                      value={dinnerData.minGuests.toString()}
                      onValueChange={(value) => handleInputChange('minGuests', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 guests</SelectItem>
                        <SelectItem value="4">4 guests</SelectItem>
                        <SelectItem value="6">6 guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price Per Person *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">€</span>
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        value={dinnerData.pricePerPerson}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) || 0 : 0
                          // Prevent values over 1000
                          const clampedValue = value > 1000 ? 1000 : value
                          handleInputChange('pricePerPerson', clampedValue)
                        }}
                        placeholder="100"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Photos
                </CardTitle>
                <CardDescription>Show guests what to expect</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Photos</label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload additional photos (maximum 5 images total)
                    </p>
                    {(dinnerData.images.length > 0 || selectedImageFiles.length > 0) && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {dinnerData.images.length} existing + {selectedImageFiles.length} new ={' '}
                        {dinnerData.images.length + selectedImageFiles.length} of 5 images
                      </p>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Photos
                      </label>
                    </Button>
                  </div>
                </div>

                {/* Existing Images */}
                {dinnerData.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Current Photos ({dinnerData.images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {dinnerData.images.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={imageUrl}
                            alt={`Dinner image ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 w-6 h-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Selected Images */}
                {selectedImageFiles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      New Photos ({selectedImageFiles.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedImageFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 w-6 h-6 p-0"
                            onClick={() => {
                              setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index))
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Policies</CardTitle>
                <CardDescription>Set your cancellation and booking policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Cancellation Policy</label>
                  <Select
                    value={dinnerData.cancellationPolicy}
                    onValueChange={(value) => handleInputChange('cancellationPolicy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible - Full refund 24h before</SelectItem>
                      <SelectItem value="moderate">Moderate - Full refund 5 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/host/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2" disabled={isSubmitting || uploadingImages}>
                {uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading images...
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Dinner
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </HostGuard>
  )
}

export default function EditDinnerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <EditDinnerPageContent />
    </Suspense>
  )
}
