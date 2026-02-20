/**
 * Payout Service
 * Handles all payout-related API calls (Stripe Connect)
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

export interface StripeAccountStatus {
  connected: boolean
  details_submitted: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
}

export interface PayoutResponse {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface PaymentStatusResponse {
  pending: {
    count: number
    totalAmount: number
  }
  ready: {
    count: number
    totalAmount: number
  }
  currency: string
}

class PayoutService {
  /**
   * Get host's Stripe Connect account status
   */
  async getStripeStatus(): Promise<StripeAccountStatus> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(getApiUrl('/stripe/connect/status'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to fetch Stripe status')
      }

      return result
    } catch (error: any) {
      console.error('Error fetching Stripe status:', error)
      throw error
    }
  }

  /**
   * Create or get Stripe Connect onboarding link
   */
  async createConnectAccount(): Promise<{ url: string }> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(getApiUrl('/stripe/connect/create-account'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to create Connect account')
      }

      return result
    } catch (error: any) {
      console.error('Error creating Connect account:', error)
      throw error
    }
  }

  /**
   * Get host's payout history (Placeholder - will need backend update)
   */
  async getHostPayouts(hostId: string): Promise<any> {
    try {
      const token = getToken()
      if (!token) throw new Error('Authentication required')

      const response = await fetch(getApiUrl(`/payouts/host/${hostId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      return await response.json()
    } catch (error: any) {
      console.error('Error fetching payouts:', error)
      throw error
    }
  }

  /**
   * Get host's available balance (Placeholder - will need backend update)
   */
  async getHostBalance(hostId: string): Promise<HostBalanceResponse> {
    try {
      const token = getToken()
      if (!token) throw new Error('Authentication required')

      const response = await fetch(getApiUrl(`/payouts/host/${hostId}/balance`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      return result.data
    } catch (error: any) {
      console.error('Error fetching balance:', error)
      throw error
    }
  }
}

export const payoutService = new PayoutService()
