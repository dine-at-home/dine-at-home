import { getApiUrl } from './api-config'

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface PayoutSettings {
  accountHolderName?: string | null
  payoutAddress?: string | null
  payoutCurrency?: string
  payoutCountry?: string
  payoutEntityType?: string
  taxId?: string | null
  kycStatus: 'UNVERIFIED' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED'
  rafraenSkilrikiVerifiedAt?: string | null
  hasCardRegistered: boolean
  payoutCardBrand?: 'VISA' | 'MASTER' | null
  payoutCardLast4?: string | null
}

export interface UpdatePayoutSettingsBody {
  accountHolderName?: string
  payoutAddress?: string
  payoutCountry?: string
  payoutCurrency?: string
  payoutEntityType?: string
  taxId?: string
}

export interface HostEarnings {
  pendingBalance: number
  payoutDebt: number
  minimumPayout: number
  currency: string
  pendingBookingCount: number
  nextEligibleAt: string | null
  kycStatus: PayoutSettings['kycStatus']
}

export interface HostPayout {
  id: string
  amount: number
  currency: string
  status: string
  scheduledFor: string | null
  arrivalDate: string | null
  createdAt: string
  failureMessage: string | null
  bookings?: Array<{ id: string; createdAt: string; dinner: { title: string } }>
}

export interface RafraenStartResponse {
  authorizeUrl: string
  mockMode: boolean
}

export interface CardRegistrationInitResponse {
  checkoutId: string
  registrationRef: string
  scriptUrl: string
  shopperResultUrl: string
  brands: string
}

export interface CardRegistrationFinalizeResponse {
  hasCardRegistered: boolean
  payoutCardBrand: 'VISA' | 'MASTER' | null
  payoutCardLast4: string | null
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = getToken()
    if (!token) return { success: false, error: 'Authentication required' }

    const response = await fetch(getApiUrl(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
    const json = await response.json()
    if (!response.ok) {
      return { success: false, error: json.error || json.message || 'Request failed' }
    }
    return { success: true, data: json.data as T }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Network error' }
  }
}

export const payoutService = {
  getSettings(): Promise<{ success: boolean; data?: PayoutSettings; error?: string }> {
    return request<PayoutSettings>('/host/payout-settings', { method: 'GET' })
  },
  updateSettings(
    body: UpdatePayoutSettingsBody
  ): Promise<{ success: boolean; data?: PayoutSettings; error?: string }> {
    return request<PayoutSettings>('/host/payout-settings', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  },
  initiateCardRegistration(): Promise<{
    success: boolean
    data?: CardRegistrationInitResponse
    error?: string
  }> {
    return request<CardRegistrationInitResponse>('/host/payout-card-registration/initiate', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
  finalizeCardRegistration(input: {
    resourcePath: string
    registrationRef: string
  }): Promise<{
    success: boolean
    data?: CardRegistrationFinalizeResponse
    error?: string
  }> {
    return request<CardRegistrationFinalizeResponse>(
      '/host/payout-card-registration/finalize',
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    )
  },
  listPayouts(): Promise<{ success: boolean; data?: HostPayout[]; error?: string }> {
    return request<HostPayout[]>('/host/payouts', { method: 'GET' })
  },
  getEarnings(): Promise<{ success: boolean; data?: HostEarnings; error?: string }> {
    return request<HostEarnings>('/host/earnings', { method: 'GET' })
  },
  startRafraen(): Promise<{ success: boolean; data?: RafraenStartResponse; error?: string }> {
    return request<RafraenStartResponse>('/auth/rafraen/start', { method: 'GET' })
  },
  getRafraenStatus(): Promise<{
    success: boolean
    data?: { verified: boolean; verifiedAt: string | null; kycStatus: string }
    error?: string
  }> {
    return request('/auth/rafraen/status', { method: 'GET' })
  },
}
