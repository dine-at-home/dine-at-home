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
    phone: string // Required field
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
  async createBooking(
    data: CreateBookingRequest
  ): Promise<{ success: boolean; data?: BookingResponse; error?: string }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(getApiUrl('/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to create booking',
        }
      }

      const responseData = result.data || result

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
        console.error('❌ No auth token found for getUserBookings')
        return { success: false, data: [] }
      }

      const url = getApiUrl(`/bookings/user/${userId}`)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ API error response:', result)
        return { success: false, data: [] }
      }

      const bookings = result.data || []

      return {
        success: true,
        data: bookings,
        pagination: result.pagination,
      }
    } catch (error: any) {
      console.error('❌ Error fetching user bookings:', error)
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
          Authorization: `Bearer ${token}`,
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

  /**
   * Update booking status (for hosts to accept/decline bookings)
   */
  async updateBookingStatus(
    bookingId: string,
    status: 'PENDING' | 'CONFIRMED' | 'ONGOING' | 'CANCELLED' | 'COMPLETED'
  ): Promise<{ success: boolean; data?: BookingResponse; error?: string }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(getApiUrl(`/bookings/${bookingId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to update booking status',
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error: any) {
      console.error('Error updating booking status:', error)
      return {
        success: false,
        error: error.message || 'Failed to update booking status',
      }
    }
  }

  /**
   * Cancel a booking (for guests)
   */
  async cancelBooking(
    bookingId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(getApiUrl(`/bookings/${bookingId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to cancel booking',
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error)
      return {
        success: false,
        error: error.message || 'Failed to cancel booking',
      }
    }
  }
}

export const bookingService = new BookingService()
