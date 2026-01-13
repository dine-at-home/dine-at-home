'use client'

import { useState, useEffect, Suspense } from 'react'
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
          const durationHours = rawDinner.duration ? Math.floor(rawDinner.duration / 60) : 3

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
            state: locationData.state || dinner.location?.state || '',
            zipCode: locationData.zipCode || '',
            directions: '',
            accessibility: '',
            date: formattedDate,
            time: dinner.time || '',
            duration: durationHours,
            maxCapacity: dinner.capacity || 8,
            pricePerPerson: dinner.price || 85,
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
        neighborhood: dinnerData.city,
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
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <Input
                      value={dinnerData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="NY"
                      required
                    />
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
                    <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                    <Select
                      value={dinnerData.duration.toString()}
                      onValueChange={(value) => handleInputChange('duration', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                        value={dinnerData.pricePerPerson}
                        onChange={(e) =>
                          handleInputChange('pricePerPerson', parseInt(e.target.value))
                        }
                        placeholder="85"
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
                      <SelectItem value="strict">
                        Strict - 50% refund up to 7 days before
                      </SelectItem>
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
