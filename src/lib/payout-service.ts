/**
 * Payout Service
 * Handles all payout-related API calls
 */

import { getApiUrl } from './api-config'

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface HostBalanceResponse {
  availableBalance: number
  currency: string
  unpaidBookingCount: number
}

export interface PaymentStatusResponse {
  pending: {
    count: number
    totalAmount: number
    payments: Array<{
      bookingId: string
      dinnerTitle: string
      amount: number
      currency: string
      completedAt: string
      readyToWithdrawAt: string
      hoursUntilReady: number
    }>
  }
  ready: {
    count: number
    totalAmount: number
  }
  currency: string
}

export interface PaymentDetail {
  id: string
  bookingId: string
  bookingStatus: string
  dinnerTitle: string
  dinnerDate: string
  dinnerTime: string
  guest: {
    id: string
    name: string
    email: string
    image?: string
  }
  amount: number // Full payment amount
  currency: string
  platformFee: number
  hostAmount: number
  paymentStatus: string
  readyToWithdrawAt?: string
  refundedAmount: number
  refundedAt?: string
  paymentMethod?: string
  isPaidOut: boolean
  createdAt: string
  updatedAt: string
}

export interface PaymentDetailsResponse {
  success: boolean
  data: PaymentDetail[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PayoutResponse {
  id: string
  amount: number
  currency: string
  status: string
  description?: string
  bookingIds: string[]
  failureCode?: string
  failureMessage?: string
  arrivalDate?: string
  createdAt: string
  updatedAt: string
}

export interface PayoutListResponse {
  success: boolean
  data: PayoutResponse[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class PayoutService {
  /**
   * Get host's payout history
   */
  async getHostPayouts(hostId: string): Promise<PayoutListResponse> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(getApiUrl(`/payouts/host/${hostId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch payouts')
      }

      return result
    } catch (error: any) {
      console.error('Error fetching payouts:', error)
      throw error
    }
  }

  /**
   * Get host's available balance
   */
  async getHostBalance(hostId: string): Promise<HostBalanceResponse> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(getApiUrl(`/payouts/host/${hostId}/balance`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch balance')
      }

      return result.data
    } catch (error: any) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }

  /**
   * Get host's payment details (all payments from bookings)
   */
  async getHostPaymentDetails(
    hostId: string,
    options?: { status?: string; bookingStatus?: string; page?: number; limit?: number }
  ): Promise<PaymentDetailsResponse> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const params = new URLSearchParams()
      if (options?.status) params.append('status', options.status)
      if (options?.bookingStatus) params.append('bookingStatus', options.bookingStatus)
      if (options?.page) params.append('page', options.page.toString())
      if (options?.limit) params.append('limit', options.limit.toString())

      const queryString = params.toString()
      const url = `/payouts/host/${hostId}/payments${queryString ? `?${queryString}` : ''}`

      const response = await fetch(getApiUrl(url), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch payment details')
      }

      return result
    } catch (error: any) {
      console.error('Error fetching payment details:', error)
      throw error
    }
  }

  /**
   * Get host's payment status (pending vs ready to withdraw)
   */
  async getHostPaymentStatus(hostId: string): Promise<PaymentStatusResponse> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(getApiUrl(`/payouts/host/${hostId}/status`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch payment status')
      }

      return result.data
    } catch (error: any) {
      console.error('Error fetching payment status:', error)
      throw error
    }
  }

  /**
   * Request a payout
   */
  async requestPayout(hostId: string): Promise<PayoutResponse> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(getApiUrl(`/payouts/host/${hostId}/request`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to request payout')
      }

      return result.data
    } catch (error: any) {
      console.error('Error requesting payout:', error)
      throw error
    }
  }
}

export const payoutService = new PayoutService()
