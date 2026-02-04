'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
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
  EyeOff,
  Shield,
  Check,
  ChevronsUpDown,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'
import { getApiUrl } from '@/lib/api-config'
import { transformDinner } from '@/lib/dinner-utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/components/ui/utils'

import { COUNTRIES } from '@/lib/countries'

const HOUR_OPTIONS = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, '0'))
const MINUTE_OPTIONS = ['00', '15', '30', '45']

const MENU_SUGGESTIONS = [
  {
    category: '🥘 Hot Dishes',
    items: [
      {
        title: '1. Icelandic Meat Soup (Kjötsúpa)',
        description:
          'Put lamb meat in a pot and cover with water.\nBoil for about 45 minutes.\nAdd potatoes, carrots, turnips, and salt.\nSimmer for another 20–30 minutes.',
      },
      {
        title: '2. Plokkfiskur (Fish Stew)',
        description:
          'Boil fish and potatoes separately.\nRoughly mash the potatoes.\nMelt butter in a pot and add milk.\nAdd fish and potatoes, stir gently.',
      },
      {
        title: '3. Fish Balls',
        description:
          'Heat a frying pan with butter.\nFry fish balls on medium heat for 4–5 minutes per side.\nServe with potatoes and sauce.',
      },
      {
        title: '4. Boiled Haddock',
        description:
          'Place haddock in a pot with lightly salted water.\nBoil for 8–10 minutes.\nServe with potatoes and melted butter.',
      },
      {
        title: '5. Boiled Lamb with Potatoes',
        description:
          'Put lamb in a pot and cover with water.\nBoil for 1–1.5 hours.\nAdd potatoes for the last 25 minutes.',
      },
      {
        title: '6. Breaded Fish',
        description:
          'Lightly salt fish fillets.\nDip in egg, then breadcrumbs.\nFry in butter until golden on both sides.',
      },
      {
        title: '7. Meatballs',
        description:
          'Mix ground meat, egg, salt, and breadcrumbs.\nShape into small balls.\nFry on a pan for 8–10 minutes.',
      },
      {
        title: '8. Bread Soup',
        description:
          'Put water and torn rye bread into a pot.\nAdd raisins and sugar.\nSimmer for 20 minutes, stirring often.',
      },
    ],
  },
  {
    category: '🍞 Bread & Sides',
    items: [
      {
        title: '9. Icelandic Rye Bread (Oven Method)',
        description:
          'Mix rye flour, sugar, salt, and baking powder.\nAdd milk and syrup.\nBake at 170°C (340°F) for about 1.5 hours.',
      },
      {
        title: '10. Flatbread (Flatkökur)',
        description: 'Heat ready-made flatbread on a pan.\nServe with butter or cured meat.',
      },
    ],
  },
  {
    category: '🍰 Desserts & Snacks',
    items: [
      {
        title: '11. Icelandic Pancakes',
        description:
          'Mix flour, eggs, and milk.\nHeat a pan with butter.\nFry thin pancakes for 1–2 minutes per side.',
      },
      {
        title: '12. Rice Porridge',
        description:
          'Boil rice in water for 10 minutes.\nAdd milk and reduce heat.\nSimmer for 20–30 minutes, stirring often.',
      },
      {
        title: '13. Skyr with Cream',
        description: 'Put skyr in a bowl.\nPour cream on top.\nAdd sugar or berries.',
      },
      {
        title: '14. Dried Fish (Harðfiskur)',
        description:
          'Break dried fish into pieces.\nSpread butter on top.\nEat – no cooking needed 😄',
      },
    ],
  },
]

function EditDinnerPageContent() {
  const router = useRouter()
  const params = useParams()
  const dinnerId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string)

  const [loading, setLoading] = useState(true)
  const [hasBookings, setHasBookings] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])
  const [openCountry, setOpenCountry] = useState(false)
  const [isManualCuisine, setIsManualCuisine] = useState(false)

  const errorRef = useRef<HTMLDivElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const citySuggestionsRef = useRef<HTMLDivElement>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const [googlePlacesLoaded, setGooglePlacesLoaded] = useState(false)

  // City autocomplete state
  const [citySuggestions, setCitySuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedCityIndex, setSelectedCityIndex] = useState(-1)

  // Address Suggestion State
  const [addressSuggestions, setAddressSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [cityBounds, setCityBounds] = useState<google.maps.LatLngBounds | null>(null)

  // Initial State (empty, populated by useEffect)
  const [dinnerData, setDinnerData] = useState({
    title: '',
    description: '',
    cuisineType: '',
    dietaryAccommodations: [] as string[],
    menu: '',
    ingredients: '',
    houseRules: '',
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

  // Auto-scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [error])

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
        try {
          autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
          const dummyDiv = document.createElement('div')
          placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv)
        } catch (error) {
          console.error('Error initializing Google Places services:', error)
        }
        return
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkInterval = setInterval(() => {
          if ((window as any).google?.maps?.places) {
            setGooglePlacesLoaded(true)
            try {
              autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
              const dummyDiv = document.createElement('div')
              placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv)
            } catch (error) {}
            clearInterval(checkInterval)
          }
        }, 100)
        setTimeout(() => clearInterval(checkInterval), 10000)
        return () => clearInterval(checkInterval)
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en&loading=async`
      script.async = true
      script.defer = true
      script.onload = () => {
        if ((window as any).google?.maps?.places) {
          setGooglePlacesLoaded(true)
          try {
            autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
            const dummyDiv = document.createElement('div')
            placesServiceRef.current = new google.maps.places.PlacesService(dummyDiv)
          } catch (error) {}
        }
      }
      document.head.appendChild(script)
    }
    loadGooglePlaces()
  }, [])

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
          const rawDinner = result.data
          const dinner = transformDinner(result.data)

          const menuString = Array.isArray(dinner.menu)
            ? dinner.menu.join('\\n')
            : dinner.menu || ''
          const houseRulesString = Array.isArray(dinner.houseRules)
            ? dinner.houseRules.join('\\n')
            : dinner.houseRules?.[0] || ''

          const durationMinutes = rawDinner.duration || 180
          const durationHours =
            durationMinutes < 60 ? durationMinutes / 60 : Math.floor(durationMinutes / 60)

          const locationData = rawDinner.location
            ? typeof rawDinner.location === 'string'
              ? JSON.parse(rawDinner.location)
              : rawDinner.location
            : {}

          let formattedDate = ''
          if (dinner.date) {
            try {
              const dateObj = new Date(dinner.date)
              if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0]
              }
            } catch (e) {}
          }

          setDinnerData({
            title: dinner.title || '',
            description: dinner.description || '',
            cuisineType: dinner.cuisine || '',
            dietaryAccommodations: Array.isArray(dinner.dietary) ? dinner.dietary : [],
            menu: menuString,
            ingredients: dinner.ingredients || '',
            houseRules: houseRulesString,
            address: locationData.address || dinner.location?.address || '',
            city: locationData.city || dinner.location?.city || '',
            neighborhood: locationData.neighborhood || dinner.location?.neighborhood || '',
            state: locationData.state || dinner.location?.state || '',
            zipCode: locationData.zipCode || '',
            directions: dinner.directions || '',
            accessibility: dinner.accessibility || '',
            date: formattedDate,
            time: dinner.time || '',
            duration: durationHours,
            maxCapacity: dinner.capacity || 8,
            pricePerPerson: dinner.price || 100,
            minGuests: dinner.minGuests || 2,
            images: Array.isArray(dinner.images)
              ? dinner.images.filter((img: any) => img && typeof img === 'string')
              : [],
            experienceLevel: dinner.experienceLevel || 'beginner',
            includesDrinks: !!dinner.includesDrinks,
            includesDessert: !!dinner.includesDessert,
            cancellationPolicy: dinner.cancellationPolicy || 'flexible',
          })

          // Check for bookings
          if (rawDinner.bookingCount > 0) {
            setHasBookings(true)
          }

          if (
            dinner.cuisine &&
            !cuisineTypes.includes(dinner.cuisine) &&
            dinner.cuisine !== 'Other'
          ) {
            setIsManualCuisine(true)
          }
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
    'Icelandic',
    'French',
    'Japanese',
    'Chinese',
    'Indian',
    'Mexican',
    'Mediterranean',
    'Thai',
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

  // Fetch city suggestions when city input changes
  useEffect(() => {
    if (!googlePlacesLoaded || !autocompleteServiceRef.current || !dinnerData.city.trim()) {
      setCitySuggestions([])
      setShowCitySuggestions(false)
      return
    }

    const timeoutId = setTimeout(() => {
      if (autocompleteServiceRef.current && dinnerData.city.trim()) {
        const selectedCountry = COUNTRIES.find((c) => c.value === dinnerData.state)
        const countryCode = selectedCountry ? selectedCountry.code : undefined

        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: dinnerData.city,
            componentRestrictions: countryCode ? { country: countryCode } : undefined,
            types: ['(cities)'],
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setCitySuggestions(predictions)
              setShowCitySuggestions(predictions.length > 0)
              setSelectedCityIndex(-1)
            } else {
              setCitySuggestions([])
              setShowCitySuggestions(false)
            }
          }
        )
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [dinnerData.city, googlePlacesLoaded, dinnerData.state])

  const handleSelectCity = (placeId: string, description: string) => {
    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        {
          placeId: placeId,
          fields: ['address_components', 'name', 'geometry'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const cityComponent = place.address_components?.find(
              (component) =>
                component.types.includes('locality') ||
                component.types.includes('administrative_area_level_1')
            )
            if (cityComponent) {
              handleInputChange('city', cityComponent.long_name)
            } else {
              handleInputChange('city', place.name || description)
            }

            // Set city bounds if available
            if (place.geometry?.viewport) {
              setCityBounds(place.geometry.viewport)
            }

            setShowCitySuggestions(false)
            setCitySuggestions([])
            setSelectedCityIndex(-1)
          }
        }
      )
    } else {
      handleInputChange('city', description)
      setShowCitySuggestions(false)
    }
  }

  // Fetch address suggestions
  useEffect(() => {
    if (
      !googlePlacesLoaded ||
      !autocompleteServiceRef.current ||
      !dinnerData.address.trim() ||
      !cityBounds
    ) {
      setAddressSuggestions([])
      return
    }

    const timeoutId = setTimeout(() => {
      if (autocompleteServiceRef.current) {
        try {
          // Find country code
          const countryCode = COUNTRIES.find((c) => c.value === dinnerData.state)?.code

          const request: google.maps.places.AutocompletionRequest = {
            input: dinnerData.address,
            types: ['address'],
            componentRestrictions: { country: countryCode || null },
            bounds: cityBounds,
          }

          // @ts-ignore
          request.strictBounds = true

          autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              predictions &&
              predictions.length > 0
            ) {
              setAddressSuggestions(predictions)
              setShowAddressSuggestions(true)
            } else {
              setAddressSuggestions([])
              setShowAddressSuggestions(false)
            }
          })
        } catch (error) {
          console.error('Error fetching address predictions:', error)
          setAddressSuggestions([])
          setShowAddressSuggestions(false)
        }
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [dinnerData.address, googlePlacesLoaded, cityBounds, dinnerData.state])

  // Handle click outside
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
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCitySuggestions || citySuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedCityIndex((prev) => (prev < citySuggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedCityIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedCityIndex >= 0 && citySuggestions[selectedCityIndex]) {
          handleSelectCity(
            citySuggestions[selectedCityIndex].place_id,
            citySuggestions[selectedCityIndex].description
          )
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowCitySuggestions(false)
        setSelectedCityIndex(-1)
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

  const handleToggleSuggestion = (suggestion: { title: string; description: string }) => {
    const textBlock = `${suggestion.title}\\n${suggestion.description}`
    const currentMenu = dinnerData.menu || ''

    if (currentMenu.includes(textBlock)) {
      let newMenu = currentMenu.replace(`\\n\\n${textBlock}`, '')
      if (newMenu === currentMenu) newMenu = currentMenu.replace(`${textBlock}\\n\\n`, '')
      if (newMenu === currentMenu) newMenu = currentMenu.replace(textBlock, '')
      handleInputChange('menu', newMenu.trim())
    } else {
      const separator = currentMenu.length > 0 ? '\\n\\n' : ''
      handleInputChange('menu', currentMenu + separator + textBlock)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)
    const existingImageCount = dinnerData.images.length
    const totalAfterAdd = existingImageCount + selectedImageFiles.length + newFiles.length

    if (totalAfterAdd > 5) {
      setError(`Maximum 5 images allowed.`)
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

    setSelectedImageFiles((prev) => [...prev, ...sizeValidFiles])
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setDinnerData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return []
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('You must be logged in to upload images')

    const formData = new FormData()
    files.forEach((file) => formData.append('images[]', file))

    const response = await fetch(getApiUrl('/upload/images'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Failed to upload images')
    return result.data.urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const token = localStorage.getItem('auth_token')
    if (!token) {
      setError('You must be logged in')
      setIsSubmitting(false)
      return
    }

    try {
      // Validation
      const validationErrors: string[] = []
      if (!dinnerData.title.trim()) validationErrors.push('Title is required')
      if (!dinnerData.description.trim()) validationErrors.push('Description is required')
      if (!dinnerData.cuisineType) validationErrors.push('Cuisine type is required')
      if (!dinnerData.menu.trim()) validationErrors.push('Menu description is required')
      if (!dinnerData.date) validationErrors.push('Date is required')
      if (!dinnerData.time) validationErrors.push('Time is required')
      if (dinnerData.pricePerPerson <= 0) validationErrors.push('Price must be greater than 0')
      if (dinnerData.maxCapacity <= 0) validationErrors.push('Max capacity must be greater than 0')
      if (!dinnerData.address.trim()) validationErrors.push('Address is required')
      if (!dinnerData.city.trim()) validationErrors.push('City is required')
      if (!dinnerData.state.trim()) validationErrors.push('Country is required')

      if (dinnerData.images.length === 0 && selectedImageFiles.length === 0) {
        validationErrors.push('Please upload at least one image')
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join('. ') + '.')
        setIsSubmitting(false)
        return
      }

      // Upload Images
      let newImageUrls: string[] = []
      if (selectedImageFiles.length > 0) {
        setUploadingImages(true)
        try {
          newImageUrls = await uploadImages(selectedImageFiles)
          setUploadingImages(false)
        } catch (err: any) {
          setUploadingImages(false)
          setError(err.message || 'Failed to upload images')
          setIsSubmitting(false)
          return
        }
      }

      const allImages = [...dinnerData.images, ...newImageUrls]

      const menuItems = dinnerData.menu
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter((item) => item)
      const dateTime = new Date(`${dinnerData.date}T${dinnerData.time}:00`).toISOString()

      const requestBody = {
        title: dinnerData.title,
        description: dinnerData.description,
        cuisine: dinnerData.cuisineType,
        menu: menuItems,
        ingredients: dinnerData.ingredients,
        location: {
          address: dinnerData.address,
          city: dinnerData.city,
          state: dinnerData.state,
          zipCode: dinnerData.zipCode,
          neighborhood: dinnerData.neighborhood || dinnerData.city,
          coordinates: { lat: 0, lng: 0 },
        },
        directions: dinnerData.directions,
        accessibility: dinnerData.accessibility,
        date: dateTime,
        time: dinnerData.time,
        duration: dinnerData.duration * 60,
        capacity: dinnerData.maxCapacity,
        minGuests: dinnerData.minGuests,
        price: dinnerData.pricePerPerson,
        currency: 'EUR',
        images: allImages,
        dietary: dinnerData.dietaryAccommodations,
        experienceLevel: dinnerData.experienceLevel,
        includesDrinks: dinnerData.includesDrinks,
        includesDessert: dinnerData.includesDessert,
        cancellationPolicy: dinnerData.cancellationPolicy,
        houseRules: [dinnerData.houseRules],
        instantBook: false,
      }

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
        throw new Error(result.error || 'Failed to update dinner')
      }

      router.push('/host/dashboard?tab=dinners')
      router.refresh()
    } catch (error: any) {
      console.error('Submission error:', error)
      setError(error.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dinner details...</p>
        </div>
      </div>
    )
  }

  return (
    <HostGuard>
      <div className="min-h-screen bg-background">
        {error && (
          <div className="max-w-4xl mx-auto px-4 py-4" ref={errorRef}>
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
                <p className="text-muted-foreground mt-1">Update your dinner listing details</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/host/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {hasBookings && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">Editing Restricted</h3>
                <p className="text-sm text-amber-700 mt-1">
                  This dinner has existing bookings and cannot be edited. Please contact support if
                  you need to make critical changes.
                </p>
              </div>
            </div>
          )}

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
                    {isManualCuisine ? (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Type your cuisine (e.g. Georgian)"
                          value={dinnerData.cuisineType}
                          onChange={(e) => handleInputChange('cuisineType', e.target.value)}
                          required
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIsManualCuisine(false)
                            handleInputChange('cuisineType', '')
                          }}
                          className="h-10 w-10 shrink-0"
                          title="Back to list"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={dinnerData.cuisineType}
                        onValueChange={(value) => {
                          if (value === 'manual_trigger') {
                            setIsManualCuisine(true)
                            handleInputChange('cuisineType', '')
                          } else {
                            handleInputChange('cuisineType', value)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual_trigger" className="text-primary font-medium">
                            Can't find my cuisine type?
                          </SelectItem>
                          {cuisineTypes.map((cuisine) => (
                            <SelectItem key={cuisine} value={cuisine}>
                              {cuisine}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
                    rows={12}
                    required
                  />
                </div>

                {/* Menu Suggestions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Quick Add Suggestions</span>
                    <span className="text-xs text-muted-foreground">
                      (Click to add popular dishes to your menu)
                    </span>
                  </div>
                  <div className="grid gap-6">
                    {MENU_SUGGESTIONS.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          {category.category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((item) => (
                            <Button
                              key={item.title}
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                'h-auto py-1 px-3 text-left whitespace-normal text-xs transition-colors',
                                (dinnerData.menu || '').includes(
                                  `${item.title}\\n${item.description}`
                                )
                                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-primary'
                                  : 'hover:border-primary hover:text-primary'
                              )}
                              onClick={() => handleToggleSuggestion(item)}
                              title={item.description}
                            >
                              {item.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Country *</label>
                    <Popover open={openCountry} onOpenChange={setOpenCountry}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCountry}
                          className="w-full justify-between"
                        >
                          {dinnerData.state
                            ? COUNTRIES.find((country) => country.value === dinnerData.state)?.label
                            : 'Select country...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search country..."
                            className="border-none focus:ring-0 outline-none shadow-none ring-0"
                          />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {COUNTRIES.map((country) => (
                                <CommandItem
                                  key={country.value}
                                  value={country.label}
                                  onSelect={(currentValue) => {
                                    handleInputChange('state', country.value)
                                    setOpenCountry(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      dinnerData.state === country.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {country.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <Input
                      value={dinnerData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="10001"
                    />
                  </div>
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
                      />
                      {!googlePlacesLoaded && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Google Places loading... (You can still type)
                        </p>
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
                              onClick={() =>
                                handleSelectCity(suggestion.place_id, suggestion.description)
                              }
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                index === selectedCityIndex ? 'bg-gray-50' : ''
                              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                                index === citySuggestions.length - 1 ? 'rounded-b-xl' : ''
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

                <div>
                  <label className="block text-sm font-medium mb-2">Street Address *</label>
                  <div className="relative">
                    <Input
                      value={dinnerData.address}
                      onChange={(e) => {
                        handleInputChange('address', e.target.value)
                        if (!e.target.value.trim()) {
                          setShowAddressSuggestions(false)
                        }
                      }}
                      onFocus={() => {
                        if (dinnerData.address.trim() && addressSuggestions.length > 0) {
                          setShowAddressSuggestions(true)
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding to allow click event to register
                        setTimeout(() => setShowAddressSuggestions(false), 200)
                      }}
                      placeholder="123 Main Street"
                      required
                      className="w-full"
                      autoComplete="off"
                    />
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {addressSuggestions.map((suggestion, index) => (
                          <button
                            key={suggestion.place_id}
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors border-b last:border-b-0 border-gray-100"
                            onClick={() => {
                              handleInputChange(
                                'address',
                                suggestion.structured_formatting.main_text
                              )
                              setShowAddressSuggestions(false)
                            }}
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
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    This address will not be visible to guests until their booking is confirmed
                  </p>
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
                <div className="space-y-4">
                  {/* Primary Date */}
                  <div className="p-3 border rounded-lg bg-muted/50 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Date *</label>
                        <Input
                          type="date"
                          value={dinnerData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Start Time *</label>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 items-center flex-1">
                            <div className="flex-1">
                              <Select
                                value={dinnerData.time ? dinnerData.time.split(':')[0] : ''}
                                onValueChange={(hour) => {
                                  const currentMinutes = dinnerData.time
                                    ? dinnerData.time.split(':')[1]
                                    : '00'
                                  handleInputChange('time', `${hour}:${currentMinutes}`)
                                }}
                              >
                                <SelectTrigger className="text-center h-10">
                                  <SelectValue placeholder="HH" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                  {HOUR_OPTIONS.map((hour) => (
                                    <SelectItem key={hour} value={hour}>
                                      {hour}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <span className="text-muted-foreground font-medium pb-0">:</span>
                            <div className="flex-1">
                              <Select
                                value={dinnerData.time ? dinnerData.time.split(':')[1] : ''}
                                onValueChange={(minute) => {
                                  const currentHour = dinnerData.time
                                    ? dinnerData.time.split(':')[0]
                                    : '19' // Default hour if not selected yet
                                  handleInputChange('time', `${currentHour}:${minute}`)
                                }}
                              >
                                <SelectTrigger className="text-center h-10">
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MINUTE_OPTIONS.map((minute) => (
                                    <SelectItem key={minute} value={minute}>
                                      {minute}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Duration (hours/minutes)
                    </label>
                    <Select
                      value={dinnerData.duration?.toString() || '3'}
                      onValueChange={(value) =>
                        handleInputChange('duration', parseFloat(value) || 3)
                      }
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
                      value={dinnerData.maxCapacity?.toString() || '8'}
                      onValueChange={(value) =>
                        handleInputChange('maxCapacity', parseInt(value) || 8)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 guest</SelectItem>
                        <SelectItem value="2">2 guests</SelectItem>
                        <SelectItem value="3">3 guests</SelectItem>
                        <SelectItem value="4">4 guests</SelectItem>
                        <SelectItem value="5">5 guests</SelectItem>
                        <SelectItem value="6">6 guests</SelectItem>
                        <SelectItem value="7">7 guests</SelectItem>
                        <SelectItem value="8">8 guests</SelectItem>
                        <SelectItem value="9">9 guests</SelectItem>
                        <SelectItem value="10">10 guests</SelectItem>
                        <SelectItem value="11">11 guests</SelectItem>
                        <SelectItem value="12">12 guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Guests</label>
                    <Select
                      value={dinnerData.minGuests?.toString() || '2'}
                      onValueChange={(value) =>
                        handleInputChange('minGuests', parseInt(value) || 2)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 guest</SelectItem>
                        <SelectItem value="2">2 guests</SelectItem>
                        <SelectItem value="3">3 guests</SelectItem>
                        <SelectItem value="4">4 guests</SelectItem>
                        <SelectItem value="5">5 guests</SelectItem>
                        <SelectItem value="6">6 guests</SelectItem>
                        <SelectItem value="7">7 guests</SelectItem>
                        <SelectItem value="8">8 guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price Per Person *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
                      €
                    </span>
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
                  <label className="block text-sm font-medium mb-2">
                    Upload Photos <span className="text-destructive">*</span>
                  </label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload at least one photo (maximum 5 images) of your dishes, kitchen, or
                      dining space
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
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer flex items-center justify-center"
                      >
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
                            onClick={() => removeExistingImage(index)}
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
                      Selected Photos ({selectedImageFiles.length})
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
                            onClick={() => removeImage(index)}
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

                <div>
                  <label className="block text-sm font-medium mb-2">House Rules</label>
                  <Textarea
                    value={dinnerData.houseRules}
                    onChange={(e) => handleInputChange('houseRules', e.target.value)}
                    placeholder="No smoking, no pets, shoes off, etc..."
                    rows={3}
                  />
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
              <Button
                type="submit"
                className="gap-2"
                disabled={isSubmitting || uploadingImages || hasBookings}
              >
                {uploadingImages ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading images...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
