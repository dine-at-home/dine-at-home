/**
 * Booking Service
 * Handles all booking-related API calls
 */

import { getApiUrl } from './api-config'

// Simple helper to get token from localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface CreateBookingRequest {
  dinnerId: string
  guests: number
  message?: string
  contactInfo: {
    name: string
    email: string
    phone?: string
  }
}

export interface BookingResponse {
  id: string
  status: string
  guests: number
  totalPrice: number
  dinnerId: string
  userId: string
  message?: string
  createdAt: string
  updatedAt: string
  dinner?: any
  user?: any
}

export interface BookingListResponse {
  success: boolean
  data: BookingResponse[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingRequest): Promise<{ success: boolean; data?: BookingResponse; error?: string }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(getApiUrl('/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      console.log('🔴 Booking Service - Raw API Response:', result)
      console.log('🔴 Response status:', response.status)
      console.log('🔴 result.data:', result.data)
      console.log('🔴 result.data.dinnerId:', result.data?.dinnerId)

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to create booking',
        }
      }

      const responseData = result.data || result
      console.log('🔴 Returning data to component:', responseData)
      console.log('🔴 responseData.dinnerId:', responseData.dinnerId)

      return {
        success: true,
        data: responseData,
      }
    } catch (error: any) {
      console.error('Error creating booking:', error)
      return {
        success: false,
        error: error.message || 'Failed to create booking',
      }
    }
  }

  /**
   * Get bookings for the current user (guest)
   */
  async getUserBookings(userId: string): Promise<BookingListResponse> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, data: [] }
      }

      const response = await fetch(getApiUrl(`/bookings/user/${userId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, data: [] }
      }

      return {
        success: true,
        data: result.data || [],
        pagination: result.pagination,
      }
    } catch (error: any) {
      console.error('Error fetching user bookings:', error)
      return { success: false, data: [] }
    }
  }

  /**
   * Get bookings for a host
   */
  async getHostBookings(hostId: string): Promise<BookingListResponse> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, data: [] }
      }

      const response = await fetch(getApiUrl(`/bookings/host/${hostId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, data: [] }
      }

      return {
        success: true,
        data: result.data || [],
        pagination: result.pagination,
      }
    } catch (error: any) {
      console.error('Error fetching host bookings:', error)
      return { success: false, data: [] }
    }
  }
}

export const bookingService = new BookingService()

