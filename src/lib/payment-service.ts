/**
 * Payment Service
 * Handles all payment-related API calls (Airwallex)
 */

import { getApiUrl } from './api-config'

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface PaymentIntentResponse {
  intentId: string
  clientSecret: string
  currency: string
}

export interface PaymentStatusResponse {
  status: string
  paymentIntentStatus?: string
  amount: number
  currency: string
}

class PaymentService {
  /**
   * Create a payment intent for a booking (payment-first flow)
   * Returns intentId + clientSecret for Airwallex Hosted Payment Page redirect
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
    data?: PaymentIntentResponse
    error?: string
  }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(getApiUrl('/payments/checkout-for-booking'), {
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
          error: result.error || result.message || 'Failed to create payment intent',
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error: any) {
      console.error('Error creating payment intent:', error)
      return {
        success: false,
        error: error.message || 'Failed to create payment intent',
      }
    }
  }

  /**
   * Create a payment intent for an existing booking (legacy method)
   */
  async createCheckoutSession(bookingId: string): Promise<{
    success: boolean
    data?: PaymentIntentResponse
    error?: string
  }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(getApiUrl('/payments/checkout'), {
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
          error: result.error || result.message || 'Failed to create payment intent',
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error: any) {
      console.error('Error creating payment intent:', error)
      return {
        success: false,
        error: error.message || 'Failed to create payment intent',
      }
    }
  }

  /**
   * Create booking from payment intent (fallback if webhook fails)
   */
  async createBookingFromPayment(data: {
    intentId: string
  }): Promise<{
    success: boolean
    data?: { bookingId: string }
    error?: string
  }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(getApiUrl('/payments/create-booking-from-payment'), {
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
          error: result.error || result.message || 'Failed to create booking from payment',
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error: any) {
      console.error('Error creating booking from payment:', error)
      return {
        success: false,
        error: error.message || 'Failed to create booking from payment',
      }
    }
  }

  /**
   * Verify payment status for a booking
   */
  async verifyPayment(bookingId: string): Promise<{
    success: boolean
    data?: PaymentStatusResponse
    error?: string
  }> {
    try {
      const token = getToken()
      if (!token) {
        return { success: false, error: 'Authentication required' }
      }

      const response = await fetch(getApiUrl(`/payments/verify/${bookingId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || result.message || 'Failed to verify payment',
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error)
      return {
        success: false,
        error: error.message || 'Failed to verify payment',
      }
    }
  }
}

export const paymentService = new PaymentService()
