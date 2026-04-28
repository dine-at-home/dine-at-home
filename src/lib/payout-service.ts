import { getApiUrl } from './api-config'

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface PayoutSettings {
  bankName?: string | null
  accountHolderName?: string | null
  iban?: string | null
  swiftBic?: string | null
  payoutAddress?: string | null
  payoutCurrency?: string
  payoutMethod?: string
  payoutCountry?: string
  payoutEntityType?: string
  taxId?: string | null
  kycStatus: 'UNVERIFIED' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED'
  rafraenSkilrikiVerifiedAt?: string | null
  paystraxBeneficiaryId?: string | null
}

export interface HostEarnings {
  pendingBalance: number
  payoutDebt: number
  minimumPayout: number
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
  bookings?: Array<{ id: string; dinnerId: string; totalPrice: number }>
}

export interface RafraenStartResponse {
  authorizeUrl: string
  mockMode: boolean
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
    body: Partial<PayoutSettings>
  ): Promise<{ success: boolean; data?: PayoutSettings; error?: string }> {
    return request<PayoutSettings>('/host/payout-settings', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
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
