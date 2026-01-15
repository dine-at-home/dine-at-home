/**
 * Stripe Connect Service
 * Handles Stripe Connect account onboarding
 */

import { getApiUrl } from './api-config'

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface OnboardingLinkResponse {
  onboardingUrl: string
  onboardingComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
}

export interface AccountStatusResponse {
  hasAccount: boolean
  onboardingComplete: boolean
  kycVerified: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirements?: {
    currentlyDue: string[]
    eventuallyDue: string[]
    pastDue: string[]
    pendingVerification: string[]
  }
}

export interface AccountUpdateLinkResponse {
  updateUrl: string
}

class StripeConnectService {
  /**
   * Create onboarding link for Stripe Connect
   */
  async createOnboardingLink(): Promise<OnboardingLinkResponse> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(getApiUrl('/stripe-connect/onboarding'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to create onboarding link')
      }

      return result.data
    } catch (error: any) {
      console.error('Error creating onboarding link:', error)
      throw error
    }
  }

  /**
   * Get Stripe Connect account status
   */
  async getAccountStatus(): Promise<AccountStatusResponse> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(getApiUrl('/stripe-connect/status'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to get account status')
      }

      return result.data
    } catch (error: any) {
      console.error('Error getting account status:', error)
      throw error
    }
  }

  /**
   * Create account update link (for adding withdrawal methods after KYC)
   */
  async createAccountUpdateLink(): Promise<AccountUpdateLinkResponse> {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(getApiUrl('/stripe-connect/update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to create account update link')
      }

      return result.data
    } catch (error: any) {
      console.error('Error creating account update link:', error)
      throw error
    }
  }
}

export const stripeConnectService = new StripeConnectService()
