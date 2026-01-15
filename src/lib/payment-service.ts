/**
 * Payment Service
 * Handles all payment-related API calls
 */

import { getApiUrl } from './api-config'

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface CheckoutSessionResponse {
  checkoutUrl: string
}

export interface PaymentStatusResponse {
  status: string
  paymentIntentStatus?: string
  amount: number
  currency: string
}

class PaymentService {
  /**
   * Create a checkout session for a booking (payment-first flow)
   * This creates the checkout session BEFORE creating the booking
   * The booking will be created automatically when payment succeeds
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
    data?: CheckoutSessionResponse
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
          error: result.error || result.message || 'Failed to create checkout session',
        }
      }

      return {
        success: true,
        data: result.data,
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
   * Create a checkout session for an existing booking (legacy method)
   */
  async createCheckoutSession(bookingId: string): Promise<{
    success: boolean
    data?: CheckoutSessionResponse
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
          error: result.error || result.message || 'Failed to create checkout session',
        }
      }

      return {
        success: true,
        data: result.data,
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
