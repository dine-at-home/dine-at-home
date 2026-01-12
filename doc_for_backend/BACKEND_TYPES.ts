// ============================================
// DineWithUs Backend API Types
// ============================================

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  GUEST = 'guest',
  HOST = 'host',
  ADMIN = 'admin',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// ============================================
// DATABASE MODELS
// ============================================

export interface User {
  id: string
  email: string
  name: string | null
  password: string | null
  image: string | null
  role: UserRole
  emailVerified: Date | null
  needsRoleSelection: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Account {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
}

export interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: Date
}

export interface Dinner {
  id: string
  title: string
  description: string
  price: number
  currency: string
  date: Date
  time: string
  duration: number // in minutes
  capacity: number
  available: number
  images: string // JSON array
  cuisine: string
  dietary: string // JSON array
  rating: number
  reviewCount: number
  instantBook: boolean
  menu: string // JSON array
  included: string // JSON array
  houseRules: string // JSON array
  location: string // JSON object
  isActive: boolean
  hostId: string
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  status: BookingStatus
  guests: number
  totalPrice: number
  message: string | null
  userId: string
  dinnerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  rating: number // 1-5
  comment: string | null
  userId: string
  dinnerId: string
  createdAt: Date
}

// ============================================
// REQUEST TYPES
// ============================================

// Auth Requests
export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: UserRole
}

export interface UpdateRoleRequest {
  role: UserRole
}

// User Requests
export interface UpdateUserProfileRequest {
  name?: string
  bio?: string
  image?: string
}

// Dinner Requests
export interface CreateDinnerRequest {
  title: string
  description: string
  price: number
  currency?: string
  date: string // ISO 8601
  time: string
  duration: number
  capacity: number
  images: string[]
  cuisine: string
  dietary: string[]
  instantBook: boolean
  menu: string[]
  included: string[]
  houseRules: string[]
  location: LocationData
}

export interface UpdateDinnerRequest {
  title?: string
  description?: string
  price?: number
  date?: string
  time?: string
  duration?: number
  capacity?: number
  available?: number
  images?: string[]
  cuisine?: string
  dietary?: string[]
  instantBook?: boolean
  menu?: string[]
  included?: string[]
  houseRules?: string[]
  location?: LocationData
  isActive?: boolean
}

export interface GetDinnersQuery {
  location?: string
  date?: string
  guests?: number
  cuisine?: string
  minPrice?: number
  maxPrice?: number
  instantBook?: boolean
  page?: number
  limit?: number
}

// Booking Requests
export interface CreateBookingRequest {
  dinnerId: string
  guests: number
  message?: string
  contactInfo: {
    name: string
    email: string
    phone: string
  }
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus
}

export interface GetBookingsQuery {
  status?: BookingStatus
  page?: number
  limit?: number
}

// Review Requests
export interface CreateReviewRequest {
  dinnerId: string
  rating: number // 1-5
  comment?: string
}

export interface GetReviewsQuery {
  page?: number
  limit?: number
  sort?: 'recent' | 'helpful' | 'rating'
}

// Search Requests
export interface SearchDinnersQuery {
  query?: string
  location?: string
  date?: string
  guests?: number
  cuisine?: string
  minPrice?: number
  maxPrice?: number
  instantBook?: boolean
  dietary?: string
  page?: number
  limit?: number
}

// ============================================
// RESPONSE TYPES
// ============================================

// Generic API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
  details?: any
}

// Paginated Response
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth Responses
export interface RegisterResponse {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
}

export interface UpdateRoleResponse {
  success: boolean
  role: UserRole
}

export interface CurrentUserResponse {
  email: string
  role: UserRole
  needsRoleSelection: boolean
}

// User Responses
export interface UserProfileResponse {
  id: string
  email: string
  name: string
  image: string | null
  role: UserRole
  bio?: string
  joinedDate: Date
  responseRate?: number
  responseTime?: string
  superhost?: boolean
}

// Dinner Responses
export interface DinnerResponse {
  id: string
  title: string
  description: string
  price: number
  currency: string
  date: string
  time: string
  duration: number
  capacity: number
  available: number
  images: string[]
  cuisine: string
  dietary: string[]
  rating: number
  reviewCount: number
  instantBook: boolean
  menu: string[]
  included: string[]
  houseRules: string[]
  location: LocationData
  host: HostData
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  reviews?: ReviewResponse[]
}

export interface DinnerListResponse extends PaginatedResponse<DinnerResponse> {}

// Booking Responses
export interface BookingResponse {
  id: string
  status: BookingStatus
  guests: number
  totalPrice: number
  message: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  dinner: {
    id: string
    title: string
    date: string
    time: string
    price: number
    images: string[]
    host: {
      id: string
      name: string
    }
    location: LocationData
  }
}

export interface BookingListResponse extends PaginatedResponse<BookingResponse> {}

// Review Responses
export interface ReviewResponse {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    id: string
    name: string
    image: string | null
  }
  dinner: {
    id: string
    title: string
  }
}

export interface ReviewListResponse extends PaginatedResponse<ReviewResponse> {
  stats?: {
    averageRating: number
    totalReviews: number
    ratingDistribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }
}

// Search Responses
export interface SearchDinnersResponse extends PaginatedResponse<DinnerResponse> {
  filters: {
    cuisines: string[]
    priceRange: {
      min: number
      max: number
    }
    cities: string[]
  }
}

export interface PopularCuisineResponse {
  name: string
  count: number
  image: string
}

export interface PopularLocationResponse {
  city: string
  state: string
  count: number
  image: string
}

// Host Dashboard Responses
export interface HostStatsResponse {
  totalDinners: number
  activeDinners: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalRevenue: number
  monthlyRevenue: number
  averageRating: number
  totalReviews: number
  responseRate: number
  responseTime: string
}

// ============================================
// NESTED TYPES
// ============================================

export interface LocationData {
  address: string
  city: string
  state: string
  neighborhood: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface HostData {
  id: string
  name: string
  avatar?: string
  superhost: boolean
  joinedDate: string
  responseRate: number
  responseTime: string
  bio?: string
}

export interface ContactInfo {
  name: string
  email: string
  phone: string
}

// ============================================
// ERROR TYPES
// ============================================

export interface ApiError {
  success: false
  error: string
  code: string
  details?: {
    field?: string
    message?: string
    [key: string]: any
  }
}

export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  BOOKING_NOT_AVAILABLE = 'BOOKING_NOT_AVAILABLE',
  INSUFFICIENT_CAPACITY = 'INSUFFICIENT_CAPACITY',
  PAST_DATE = 'PAST_DATE',
  ALREADY_REVIEWED = 'ALREADY_REVIEWED',
}

// ============================================
// UTILITY TYPES
// ============================================

export type SortOrder = 'asc' | 'desc'

export interface PaginationParams {
  page: number
  limit: number
}

export interface DateRange {
  start: Date
  end: Date
}

export interface PriceRange {
  min: number
  max: number
}

// ============================================
// VALIDATION SCHEMAS (for reference)
// ============================================

export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  password: {
    minLength: 8,
    maxLength: 100,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  name: {
    minLength: 2,
    maxLength: 100,
  },
  rating: {
    min: 1,
    max: 5,
  },
  guests: {
    min: 1,
    max: 50,
  },
  price: {
    min: 0,
    max: 10000,
  },
  duration: {
    min: 30,
    max: 480, // 8 hours
  },
}
