import { getApiUrl } from './api-config'

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export interface InitiatePaymentResponse {
  checkoutId: string
  scriptUrl: string
  shopperResultUrl: string
  brands: string
  amount: number
  currency: string
}

export interface FinalizePaymentResponse {
  status: 'SUCCEEDED' | 'PROCESSING' | 'FAILED'
  paymentId?: string
  amount?: number
  currency?: string
  reason?: string
}

async function callApi<T>(
  endpoint: string,
  body: unknown
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = getToken()
    if (!token) return { success: false, error: 'Authentication required' }

    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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

export const paymentService = {
  initiatePayment(bookingId: string, options?: { saveCard?: boolean }) {
    return callApi<InitiatePaymentResponse>('/payments/initiate', {
      bookingId,
      saveCard: !!options?.saveCard,
    })
  },
  finalizePayment(bookingId: string, resourcePath: string) {
    return callApi<FinalizePaymentResponse>('/payments/finalize', { bookingId, resourcePath })
  },
}

export interface SavedPaymentMethod {
  id: string
  brand: string
  last4: string
  holder?: string | null
  expiryMonth?: string | null
  expiryYear?: string | null
  isDefault: boolean
  createdAt: string
}

async function callJson<T>(
  endpoint: string,
  init: { method: 'GET' | 'DELETE' | 'PATCH' | 'POST'; body?: unknown }
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = getToken()
    if (!token) return { success: false, error: 'Authentication required' }
    const response = await fetch(getApiUrl(endpoint), {
      method: init.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
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

export const paymentMethodService = {
  list() {
    return callJson<SavedPaymentMethod[]>('/payment-methods', { method: 'GET' })
  },
  remove(id: string) {
    return callJson<{ id: string }>(`/payment-methods/${id}`, { method: 'DELETE' })
  },
  setDefault(id: string) {
    return callJson<{ id: string }>(`/payment-methods/${id}/default`, { method: 'PATCH' })
  },
}
