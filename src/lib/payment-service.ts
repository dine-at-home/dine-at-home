/**
 * Payment Service
 * Handles all payment-related API calls (Stripe)
 */

import { getApiUrl } from './api-config'

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface StripeSessionResponse {
  sessionId: string
  url: string
}

class PaymentService {
  /**
   * Create a checkout session for a booking
   */
  async createCheckoutSession(bookingId: string): Promise<{
    success: boolean
    data?: StripeSessionResponse
    error?: string
  }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(getApiUrl('/stripe/checkout/create-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to create checkout session',
        }
      }

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      return {
        success: false,
        error: error.message || 'Failed to create checkout session',
      }
    }
  }

  /**
   * Create a checkout session for a booking (payment-first flow)
   * Note: This now creates a temporary booking first if needed, or we adapt the backend.
   * For now, we point to the same checkout session logic.
   */
  async createCheckoutSessionForBooking(data: {
    dinnerId: string
    guests: number
    message?: string
    contactInfo: {
      name: string
      email: string
      phone: string
    }
  }): Promise<{
    success: boolean
    data?: StripeSessionResponse
    error?: string
  }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      // 1. Create a pending booking first
      const bookingResponse = await fetch(getApiUrl('/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dinnerId: data.dinnerId,
          guests: data.guests,
          message: data.message,
          ...data.contactInfo
        }),
      })

      const bookingResult = await bookingResponse.json()
      if (!bookingResponse.ok) {
        return { success: false, error: bookingResult.message || 'Failed to create booking' }
      }

      const bookingId = bookingResult.booking.id

      // 2. Create Stripe checkout session for this booking
      return this.createCheckoutSession(bookingId)
    } catch (error: any) {
      console.error('Error in payment-first flow:', error)
      return {
        success: false,
        error: error.message || 'Failed to initiate payment',
      }
    }
  }
}

export const paymentService = new PaymentService()
