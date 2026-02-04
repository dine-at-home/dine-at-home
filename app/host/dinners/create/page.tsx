'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
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
import { useGooglePlaces } from '@/hooks/use-google-places'
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
} from 'lucide-react'
import Image from 'next/image'
import { getApiUrl } from '@/lib/api-config'
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

function CreateDinnerPageContent() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])
  const [openCountry, setOpenCountry] = useState(false)
  const [additionalDates, setAdditionalDates] = useState<{ date: string; time: string }[]>([])

  const errorRef = useRef<HTMLDivElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const citySuggestionsRef = useRef<HTMLDivElement>(null)

  const { googlePlacesLoaded, autocompleteServiceRef, placesServiceRef } = useGooglePlaces()

  // City autocomplete state
  const [citySuggestions, setCitySuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedCityIndex, setSelectedCityIndex] = useState(-1)
  const [isManualCuisine, setIsManualCuisine] = useState(false)

  // Address Suggestion State
  const [addressSuggestions, setAddressSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [cityBounds, setCityBounds] = useState<google.maps.LatLngBounds | null>(null)

  // Neighborhood autocomplete state

  // Check if we're in development mode
  const isDev =
    typeof window !== 'undefined'
      ? process.env.NODE_ENV === 'development' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      : process.env.NODE_ENV === 'development'

  // Auto-scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [error])

  // Sample data for development mode
  const getDefaultDinnerData = () => {
    // Check if we're in development mode
    // In Next.js, NODE_ENV is available in client components
    const isDev =
      typeof window !== 'undefined'
        ? process.env.NODE_ENV === 'development' ||
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'
        : process.env.NODE_ENV === 'development'

    if (!isDev) {
      // Return empty form for production
      return {
        title: '',
        description: '',
        cuisineType: '',
        dietaryAccommodations: [] as string[],
        menu: '',
        ingredients: '',

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
        pricePerPerson: '' as unknown as number,
        minGuests: 2,
        images: [] as string[],
        experienceLevel: 'beginner',
        includesDrinks: false,
        includesDessert: false,
        cancellationPolicy: 'flexible',
      }
    }

    // Auto-fill with sample data for development
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]

    return {
      title: 'Authentic Italian Pasta Making Workshop',
      description:
        "Join me for an authentic Italian dinner experience in my cozy home. We'll start with a welcome aperitivo, followed by a 4-course meal featuring fresh handmade pasta, seasonal vegetables from my garden, and traditional desserts.\n\nThis intimate dining experience is perfect for food lovers who want to learn about Italian cooking traditions while enjoying great company. I'll share stories about each dish and the family recipes behind them.\n\nPlease let me know about any dietary restrictions when booking - I'm happy to accommodate vegetarian, vegan, and gluten-free guests with advance notice.",
      cuisineType: 'Italian',
      dietaryAccommodations: ['Vegetarian', 'Gluten-Free'] as string[],
      menu: 'The Menu will consist of 3 dishes Chicken Muglai, Chicken Karahi and Gajar ka Halwa',
      ingredients: 'Fresh pasta, tomatoes, basil, olive oil, parmesan cheese, seasonal vegetables',

      houseRules:
        'Please arrive on time. Let us know about dietary restrictions in advance. No smoking indoors. Children welcome with advance notice.',
      address: '',
      city: '',
      neighborhood: 'Downtown',
      state: 'Iceland',
      zipCode: '101',
      directions: 'Take the subway to 14th Street station, walk 2 blocks north',
      accessibility: 'Wheelchair accessible entrance and restroom available',
      date: dateStr,
      time: '19:00',
      duration: 3,
      maxCapacity: 8,
      pricePerPerson: 100,
      minGuests: 2,
      images: [] as string[],
      experienceLevel: 'beginner',
      includesDrinks: true,
      includesDessert: true,
      cancellationPolicy: 'flexible',
    }
  }

  const [dinnerData, setDinnerData] = useState(getDefaultDinnerData())

  // Log in dev mode to confirm auto-fill is working
  useEffect(() => {
    const isDev =
      typeof window !== 'undefined'
        ? process.env.NODE_ENV === 'development' ||
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'
        : process.env.NODE_ENV === 'development'

    if (isDev) {
      console.log('🔧 Development mode: Dinner form auto-filled with sample data')
      console.log('📝 Pre-filled data:', dinnerData)
    }
  }, [])

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

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      if (autocompleteServiceRef.current && dinnerData.city.trim()) {
        try {
          // Find the country code
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
          fields: ['address_components', 'name', 'geometry'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            // Set city bounds for address filtering
            if (place.geometry?.viewport) {
              setCityBounds(place.geometry.viewport)
            }

            // Extract city name
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

            setShowCitySuggestions(false)
            setCitySuggestions([])
            setSelectedCityIndex(-1)
          }
        }
      )
    } else {
      // Fallback to description if service not available
      handleInputChange('city', description)
      setShowCitySuggestions(false)
    }
  }

  // Handle neighborhood selection

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
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Handle keyboard navigation for neighborhood

  // Handle additional dates
  const handleAddDate = () => {
    // Get the last date/time to copy from
    // If additional dates exist, take the last one
    // Otherwise take the main dinner date/time
    const sourceData =
      additionalDates.length > 0
        ? additionalDates[additionalDates.length - 1]
        : { date: dinnerData.date, time: dinnerData.time }

    // Fallback to today/now if main dinner data is missing
    const dateToUse = sourceData.date || new Date().toISOString().split('T')[0]
    const timeToUse = sourceData.time || '19:00'

    setAdditionalDates((prev) => [...prev, { date: dateToUse, time: timeToUse }])
  }

  const handleRemoveDate = (index: number) => {
    setAdditionalDates((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAdditionalDateChange = (index: number, field: 'date' | 'time', value: string) => {
    setAdditionalDates((prev) => {
      const newDates = [...prev]
      newDates[index] = { ...newDates[index], [field]: value }
      return newDates
    })
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

    // Check total image count (max 5)
    const totalAfterAdd = selectedImageFiles.length + newFiles.length
    if (totalAfterAdd > 5) {
      setError(
        `Maximum 5 images allowed. You already have ${
          selectedImageFiles.length
        } image${selectedImageFiles.length !== 1 ? 's' : ''} selected.`
      )
      e.target.value = ''
      return
    }

    // Validate file types
    const validFiles = newFiles.filter((file) => file.type.startsWith('image/'))
    if (validFiles.length !== newFiles.length) {
      setError('Only image files are allowed')
      e.target.value = ''
      return
    }

    // Validate file sizes (5MB max)
    const sizeValidFiles = validFiles.filter((file) => file.size <= 5 * 1024 * 1024)
    if (sizeValidFiles.length !== validFiles.length) {
      setError('Images must be smaller than 5MB each')
      e.target.value = ''
      return
    }

    // Limit to 5 total images
    const remainingSlots = 5 - selectedImageFiles.length
    const filesToAdd = sizeValidFiles.slice(0, remainingSlots)

    if (filesToAdd.length < sizeValidFiles.length) {
      setError(
        `Maximum 5 images allowed. Only ${filesToAdd.length} image${
          filesToAdd.length !== 1 ? 's' : ''
        } added.`
      )
    }

    // Add to selected files (will upload when form is submitted)
    setSelectedImageFiles((prev) => [...prev, ...filesToAdd])
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index))
    // Also remove from dinnerData.images if it exists
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
        // DON'T set Content-Type - browser will set it with boundary
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
  /*
   * Toggle suggestion:
   * If the exact text block (title + description) is present, remove it.
   * Otherwise, append it.
   */
  const handleToggleSuggestion = (suggestion: { title: string; description: string }) => {
    const textBlock = `${suggestion.title}\n${suggestion.description}`
    const currentMenu = dinnerData.menu || ''

    if (currentMenu.includes(textBlock)) {
      // Remove it
      // We try to remove the block plus a preceding or following separator to keep it clean
      let newMenu = currentMenu.replace(`\n\n${textBlock}`, '')

      if (newMenu === currentMenu) {
        // Try removing with following separator
        newMenu = currentMenu.replace(`${textBlock}\n\n`, '')
      }

      if (newMenu === currentMenu) {
        // Just remove the block
        newMenu = currentMenu.replace(textBlock, '')
      }

      handleInputChange('menu', newMenu.trim())
    } else {
      // Add it
      const separator = currentMenu.length > 0 ? '\n\n' : ''
      handleInputChange('menu', currentMenu + separator + textBlock)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const token = localStorage.getItem('auth_token')
    if (!token) {
      setError('You must be logged in to create a dinner')
      setIsSubmitting(false)
      return
    }

    try {
      // Step 1: Validate all form data before uploading images
      const validationErrors: string[] = []

      if (!dinnerData.title || dinnerData.title.trim() === '') {
        validationErrors.push('Title is required')
      }

      if (!dinnerData.description || dinnerData.description.trim() === '') {
        validationErrors.push('Description is required')
      }

      if (!dinnerData.cuisineType || dinnerData.cuisineType.trim() === '') {
        validationErrors.push('Cuisine type is required')
      }

      if (!dinnerData.menu || dinnerData.menu.trim() === '') {
        validationErrors.push('Menu description is required')
      }

      if (!dinnerData.date) {
        validationErrors.push('Date is required')
      }

      if (!dinnerData.time) {
        validationErrors.push('Time is required')
      }

      if (!dinnerData.pricePerPerson || dinnerData.pricePerPerson <= 0) {
        validationErrors.push('Price per person must be greater than 0')
      }

      if (dinnerData.pricePerPerson > 1000) {
        validationErrors.push('Price per person cannot exceed 1000 euros')
      }

      if (!dinnerData.maxCapacity || dinnerData.maxCapacity <= 0) {
        validationErrors.push('Max capacity must be greater than 0')
      }

      if (!dinnerData.address || dinnerData.address.trim() === '') {
        validationErrors.push('Street address is required')
      }

      if (!dinnerData.city || dinnerData.city.trim() === '') {
        validationErrors.push('City is required')
      }

      if (!dinnerData.state || dinnerData.state.trim() === '') {
        validationErrors.push('Country is required')
      }

      // ZIP code is optional - no validation needed

      if (selectedImageFiles.length === 0) {
        validationErrors.push('Please upload at least one image for your dinner listing')
      }

      // Validate date is in the future
      if (dinnerData.date) {
        const selectedDate = new Date(`${dinnerData.date}T${dinnerData.time || '00:00'}:00`)
        const now = new Date()
        if (selectedDate <= now) {
          validationErrors.push('Dinner date and time must be in the future')
        }
      }

      // If there are validation errors, stop before uploading images
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. ') + '.')
        setIsSubmitting(false)
        return
      }

      // Step 2: Upload images (only after all validations pass)
      let imageUrls: string[] = []
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

      // Parse menu from string (assuming it's comma-separated or newline-separated)
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
        zipCode: dinnerData.zipCode || '', // Optional - can be empty
        neighborhood: dinnerData.neighborhood || dinnerData.city, // Use area/neighborhood if provided, fallback to city
        coordinates: {
          lat: 0, // TODO: Get from geocoding service
          lng: 0, // TODO: Get from geocoding service
        },
      }

      // Step 3: Create dinners for all selected dates
      // Step 3: Create dinners for all selected dates - concurrently
      const allDates = [
        { date: dinnerData.date, time: dinnerData.time },
        ...additionalDates,
      ].filter((d) => d.date && d.time)

      const createPromises = allDates.map(async (item) => {
        // Construct the full ISO date string from the date part and the time
        // We create a Date object which interprets the string as local time
        // Then we convert to ISO string (UTC) for the backend
        const fullDateTime = `${item.date}T${item.time}:00`
        const dateObj = new Date(fullDateTime)

        // Final sanity check on date
        const now = new Date()
        if (dateObj <= now) {
          return {
            success: false,
            error: `Date ${item.date} ${item.time} is in the past`,
            date: item.date,
          }
        }

        console.log(
          '🚀 [DEBUG-BUILD-FIX-V2] Submitting dinner with rules:',
          dinnerData.houseRules || ''
        )

        const requestBody = {
          title: dinnerData.title || '',
          description: dinnerData.description || '',
          cuisine: dinnerData.cuisineType || '',
          menu: menuItems,
          ingredients: dinnerData.ingredients || '',
          location: location,
          directions: dinnerData.directions || '',
          accessibility: dinnerData.accessibility || '',

          // Date & Time
          // Backend Zod schema requires full ISO string (e.g., 2023-10-27T19:00:00.000Z)
          date: dateObj.toISOString(),
          time: item.time,
          duration: dinnerData.duration || 3,

          capacity: dinnerData.maxCapacity || 1,
          minGuests: dinnerData.minGuests || 1,
          price: dinnerData.pricePerPerson || 0,
          currency: 'EUR',

          images: imageUrls,

          dietary: dinnerData.dietaryAccommodations || [],
          experienceLevel: dinnerData.experienceLevel || 'beginner',

          includesDrinks: !!dinnerData.includesDrinks,
          includesDessert: !!dinnerData.includesDessert,

          cancellationPolicy: dinnerData.cancellationPolicy || 'flexible',
          houseRules: [dinnerData.houseRules || ''],

          instantBook: false,
        }

        try {
          const response = await fetch(getApiUrl('/dinners'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          })

          const data = await response.json()

          if (!response.ok) {
            // Backend middleware returns { error: 'message', details: { ... } }
            const errorMsg =
              data.error ||
              data.message ||
              (data.details && data.details.message) ||
              'Unknown error'
            console.error(`Creation failed for ${item.date}:`, data)
            return { success: false, error: errorMsg, date: item.date }
          } else {
            return { success: true, data: data, date: item.date }
          }
        } catch (err: any) {
          return { success: false, error: err.message, date: item.date }
        }
      })

      const outcomes = await Promise.all(createPromises)

      const results = outcomes.filter((o) => o.success).map((o) => o.data)
      const errors = outcomes.filter((o) => !o.success).map((o) => (o as any).error)

      if (results.length > 0) {
        // If at least one dinner was created successfully
        if (errors.length > 0) {
          // Mixed success
          console.warn('Some dinners failed to create:', errors)
          // Ideally show a toast here, but for now we'll redirect to dashboard
          // storing the error in session storage or just alerting
          alert(
            `Created ${results.length} dinners, but ${errors.length} failed. Check console for details.`
          )
        }

        router.push('/host/dashboard?tab=dinners')
        router.refresh()
      } else {
        // complete failure
        setError(errors.join('. '))
        setIsSubmitting(false)
      }
    } catch (err: any) {
      console.error('Error creating dinner:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
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
                <h1 className="text-3xl font-bold text-foreground">Create New Dinner</h1>
                <p className="text-muted-foreground mt-1">
                  Share your culinary passion with guests
                </p>
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
                                  `${item.title}\n${item.description}`
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

                  {/* Additional Dates */}
                  {additionalDates.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/50 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDate(index)}
                        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                        <div>
                          <label className="block text-xs font-medium mb-1">Date</label>
                          <Input
                            type="date"
                            value={item.date}
                            onChange={(e) =>
                              handleAdditionalDateChange(index, 'date', e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Time</label>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1 items-center flex-1">
                              <div className="flex-1">
                                <Select
                                  value={item.time ? item.time.split(':')[0] : ''}
                                  onValueChange={(hour) => {
                                    const currentMinutes = item.time
                                      ? item.time.split(':')[1]
                                      : '00'
                                    handleAdditionalDateChange(
                                      index,
                                      'time',
                                      `${hour}:${currentMinutes}`
                                    )
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
                                  value={item.time ? item.time.split(':')[1] : ''}
                                  onValueChange={(minute) => {
                                    const currentHour = item.time ? item.time.split(':')[0] : '19'
                                    handleAdditionalDateChange(
                                      index,
                                      'time',
                                      `${currentHour}:${minute}`
                                    )
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
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDate}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add Another Date
                  </Button>
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={dinnerData.pricePerPerson === 0 ? '' : dinnerData.pricePerPerson}
                      onChange={(e) => {
                        // Only allow numeric input
                        const rawValue = e.target.value.replace(/[^0-9]/g, '')
                        if (rawValue === '') {
                          handleInputChange('pricePerPerson', '' as unknown as number)
                        } else {
                          const numValue = parseInt(rawValue, 10)
                          // Prevent values over 1000
                          const clampedValue = numValue > 1000 ? 1000 : numValue
                          handleInputChange('pricePerPerson', clampedValue)
                        }
                      }}
                      placeholder="Enter price"
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
                    {selectedImageFiles.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {selectedImageFiles.length} of 5 images selected
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
              <Button type="submit" className="gap-2" disabled={isSubmitting || uploadingImages}>
                {uploadingImages ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading images...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Dinner
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

export default function CreateDinnerPage() {
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
      <CreateDinnerPageContent />
    </Suspense>
  )
}
