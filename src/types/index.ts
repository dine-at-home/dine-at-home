// Core Types
export interface Dinner {
  id: string
  title: string
  description: string
  price: number
  cuisine: string
  date: string
  time: string
  capacity: number
  available: number
  instantBook: boolean
  rating: number
  reviewCount: number
  images: string[]
  host: Host
  location: Location
  reviews?: Review[]
}

export interface Host {
  id: string
  name: string
  avatar?: string
  superhost: boolean
  joinedDate: string
  responseRate: number
  responseTime: string
  bio?: string
}

export interface Location {
  address: string
  city: string
  state: string
  neighborhood: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  date: string
  helpful: number
}

// Search & Navigation Types
export interface SearchParams {
  location?: string
  date?: Date
  guests?: number
  cuisine?: string
  priceRange?: [number, number]
}

export interface NavigationParams {
  dinner?: Dinner
  date?: Date
  guests?: number
  [key: string]: any
}

// Component Props Types
export interface PageProps {
  params?: { [key: string]: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export interface LayoutProps {
  children: React.ReactNode
  params?: { [key: string]: string }
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface BookingFormData {
  dinnerId: string
  date: Date
  guests: number
  specialRequests?: string
  contactInfo: {
    name: string
    email: string
    phone: string
  }
}

export interface SearchFormData {
  location: string
  date?: Date
  guests: number
}

// UI Component Types
export interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

// Feature Flags
export interface FeatureFlags {
  enableInstantBooking: boolean
  enableReviews: boolean
  enableMessaging: boolean
  enableHostDashboard: boolean
}

// Environment Variables
// Note: DATABASE_URL and JWT_SECRET are backend-only and not needed in frontend
export interface EnvConfig {
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string
  NEXT_PUBLIC_MAP_API_KEY?: string
}
