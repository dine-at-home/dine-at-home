import { getApiUrl } from './api-config'

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface PayoutSettings {
  // Manual bank-transfer payout details (current model). Hosts give us an IBAN; payouts are
  // sent off-platform via a bank file the admin exports (see PAYIN_MANUAL_PAYOUT_PLAN.md).
  bankAccountHolder?: string | null
  iban?: string | null
  bankSwiftBic?: string | null
  bankName?: string | null
  payoutCurrency?: string
  payoutCountry?: string
  commissionRate?: number | null
  taxId?: string | null
  kycStatus: 'UNVERIFIED' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED'
  kycRejectionReason?: string | null
  rafraenSkilrikiVerifiedAt?: string | null
  hasBankAccount: boolean
}

export interface UpdatePayoutSettingsBody {
  bankAccountHolder?: string
  iban?: string
  bankSwiftBic?: string
  bankName?: string
  payoutCountry?: string
  payoutCurrency?: string
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

// DISABLED — card-payout (OCT) registration. Replaced by manual IBAN collection.
// Kept on the `card-payout` branch (see PAYIN_MANUAL_PAYOUT_PLAN.md).
// export interface CardRegistrationInitResponse {
//   checkoutId: string
//   registrationRef: string
//   scriptUrl: string
//   shopperResultUrl: string
//   brands: string
// }
//
// export interface CardRegistrationFinalizeResponse {
//   hasCardRegistered: boolean
//   payoutCardBrand: 'VISA' | 'MASTER' | null
//   payoutCardLast4: string | null
// }

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
  // DISABLED — card-payout (OCT) registration. Replaced by manual IBAN collection via
  // updateSettings (see PAYIN_MANUAL_PAYOUT_PLAN.md). Kept on the `card-payout` branch.
  // initiateCardRegistration() { ... }
  // finalizeCardRegistration(input) { ... }
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
