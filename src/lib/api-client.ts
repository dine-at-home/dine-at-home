/**
 * API Client for backend communication
 */

import { getApiUrl } from './api-config'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
  details?: any
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint)

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available (for client-side calls)
    if (typeof window !== 'undefined') {
      // JWT token is stored in localStorage by auth-service
      const token = localStorage.getItem('auth_token')
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          code: data.code,
          details: data.details,
        }
      }

      return data as ApiResponse<T>
    } catch (error) {
      console.error('API request error:', error)
      return {
        success: false,
        error: 'Network error',
        code: 'NETWORK_ERROR',
      }
    }
  }

  // Auth endpoints
  async register(data: {
    email: string
    password: string
    name: string
    role?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRole(role: string, token?: string): Promise<ApiResponse<any>> {
    return this.request('/auth/update-role', {
      method: 'POST',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      body: JSON.stringify({ role }),
    })
  }

  async getCurrentUser(token?: string): Promise<ApiResponse<any>> {
    return this.request('/auth/current-user', {
      method: 'GET',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    })
  }
}

export const apiClient = new ApiClient()
