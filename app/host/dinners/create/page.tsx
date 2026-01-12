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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Upload,
  Plus,
  X,
  Save,
  ArrowLeft,
  ChefHat,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react'
import Image from 'next/image'
import { getApiUrl } from '@/lib/api-config'

const COUNTRIES = ['Iceland']

function CreateDinnerPageContent() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])

  const errorRef = useRef<HTMLDivElement>(null)

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
        state: '',
        zipCode: '',
        directions: '',
        accessibility: '',
        date: '',
        time: '',
        duration: 3,
        maxCapacity: 8,
        pricePerPerson: 85,
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
      address: '123 Main Street',
      city: 'Reykjavik',
      state: 'Iceland',
      zipCode: '101',
      directions: 'Take the subway to 14th Street station, walk 2 blocks north',
      accessibility: 'Wheelchair accessible entrance and restroom available',
      date: dateStr,
      time: '19:00',
      duration: 3,
      maxCapacity: 8,
      pricePerPerson: 85,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Get auth token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setError('You must be logged in to create a dinner')
        setIsSubmitting(false)
        return
      }

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

      if (!dinnerData.zipCode || dinnerData.zipCode.trim() === '') {
        validationErrors.push('ZIP code is required')
      }

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
        zipCode: dinnerData.zipCode,
        neighborhood: dinnerData.city, // Using city as neighborhood if not separate field
        coordinates: {
          lat: 0, // TODO: Get from geocoding service
          lng: 0, // TODO: Get from geocoding service
        },
      }

      // Combine date and time into ISO date string
      const dateTime =
        dinnerData.date && dinnerData.time
          ? new Date(`${dinnerData.date}T${dinnerData.time}:00`).toISOString()
          : new Date(dinnerData.date).toISOString()

      // Prepare request body according to API specification
      const requestBody = {
        title: dinnerData.title,
        description: dinnerData.description,
        price: dinnerData.pricePerPerson,
        currency: 'USD',
        date: dateTime,
        time: dinnerData.time,
        duration: Math.round(dinnerData.duration * 60), // Convert hours to minutes (rounds to integer)
        capacity: dinnerData.maxCapacity,
        images: imageUrls, // Use uploaded image URLs
        cuisine: dinnerData.cuisineType,
        dietary: dinnerData.dietaryAccommodations,
        instantBook: false, // Default value
        menu: menuItems,
        included: [], // Can be extended later
        houseRules: dinnerData.houseRules ? [dinnerData.houseRules] : [],
        location: location,
      }

      // Send to backend API
      const response = await fetch(getApiUrl('/dinners'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to create dinner. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Success - redirect to dashboard
      router.push('/host/dashboard?tab=dinners')
      router.refresh()
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                      value={dinnerData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country *</label>
                    <Select
                      value={dinnerData.state}
                      onValueChange={(value) => handleInputChange('state', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                    <Input
                      value={dinnerData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="10001"
                      required
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
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={dinnerData.pricePerPerson}
                      onChange={(e) =>
                        handleInputChange(
                          'pricePerPerson',
                          e.target.value ? parseInt(e.target.value) || 0 : 0
                        )
                      }
                      placeholder="85"
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
                      <SelectItem value="strict">
                        Strict - 50% refund up to 7 days before
                      </SelectItem>
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
