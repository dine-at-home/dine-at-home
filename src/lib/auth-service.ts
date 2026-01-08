/**
 * JWT-based Authentication Service
 * Handles authentication with backend API using JWT tokens
 */

import { API_CONFIG, getApiUrl } from './api-config'

export interface User {
  id: string
  email: string
  name: string | null
  phone?: string | null
  gender?: string | null
  country?: string | null
  languages?: string[] | null
  role: 'guest' | 'host' | 'admin'
  image: string | null
  emailVerified: boolean
  needsRoleSelection?: boolean
  needsProfileCompletion?: boolean
  createdAt?: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User
    token: string
  }
  message?: string
  error?: string
}

class AuthService {
  private tokenKey = 'auth_token'
  private userKey = 'auth_user'

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.tokenKey)
  }

  /**
   * Store JWT token
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.tokenKey, token)
  }

  /**
   * Remove JWT token
   */
  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(this.userKey)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  /**
   * Store user data
   */
  setUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  /**
   * Register new user
   */
  async register(data: {
    email: string
    password: string
    name: string
    role?: 'guest' | 'host'
    phone?: string
    gender?: string
    country?: string
    languages?: string[]
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle different error types
        let errorMessage = result.error || 'Registration failed'

        // Handle validation errors
        if (result.details && Array.isArray(result.details)) {
          const validationErrors = result.details
            .map((detail: any) => detail.message || `${detail.path.join('.')}: ${detail.message}`)
            .join(', ')
          errorMessage = validationErrors || errorMessage
        }

        // Handle specific error codes
        if (result.code === 'EMAIL_ALREADY_EXISTS') {
          errorMessage =
            'This email is already registered. Please use a different email or sign in.'
        } else if (result.code === 'BAD_REQUEST') {
          errorMessage = result.error || 'Please check your input and try again.'
        }

        return {
          success: false,
          error: errorMessage,
        }
      }

      // Store token and user if registration successful (user is automatically verified)
      if (result.data?.token && result.data?.user) {
        this.setToken(result.data.token)
        this.setUser(result.data.user)
      }

      return result
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Unable to connect to the server. Please check your internet connection.',
        }
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      }
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await fetch(getApiUrl('/auth/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const result = await response.json()

      if (!response.ok) {
        let errorMessage = result.error || 'OTP verification failed'

        // Handle specific error codes
        if (result.code === 'INVALID_OTP') {
          errorMessage =
            'Invalid or expired OTP. Please check the code and try again, or request a new one.'
        } else if (result.code === 'BAD_REQUEST') {
          errorMessage = 'Please enter a valid 6-digit OTP code.'
        }

        return {
          success: false,
          error: errorMessage,
        }
      }

      // Store token and user
      if (result.data?.token && result.data?.user) {
        this.setToken(result.data.token)
        this.setUser(result.data.user)
      }

      return result
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Unable to connect to the server. Please check your internet connection.',
        }
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      }
    }
  }

  /**
   * Get Google OAuth URL from backend
   */
  async getGoogleAuthUrl(): Promise<{
    success: boolean
    data?: { authUrl: string }
    error?: string
  }> {
    try {
      const response = await fetch(getApiUrl('/auth/google/url'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to get Google OAuth URL',
        }
      }

      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      }
    }
  }

  /**
   * Initiate Google OAuth sign-in (opens in new tab/popup)
   */
  async signInWithGoogle(): Promise<void> {
    try {
      const result = await this.getGoogleAuthUrl()
      if (result.success && result.data?.authUrl) {
        // Open Google OAuth in a popup window
        const width = 500
        const height = 600
        const left = (window.screen.width - width) / 2
        const top = (window.screen.height - height) / 2

        const newWindow = window.open(
          result.data.authUrl,
          'google-oauth',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
        )

        if (!newWindow) {
          throw new Error('Popup blocked. Please allow popups for this site and try again.')
        }

        // Store reference to message listener for cleanup
        let messageListener: ((event: MessageEvent) => void) | null = null

        // Listen for messages from the popup
        messageListener = (event: MessageEvent) => {
          // Verify origin for security
          if (event.origin !== window.location.origin) {
            return
          }

          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            // Authentication succeeded, refresh the page
            if (messageListener) {
              window.removeEventListener('message', messageListener)
            }
            // Store user data if provided
            if (event.data.user) {
              this.setUser(event.data.user)
            }
            if (event.data.token) {
              this.setToken(event.data.token)
            }
            // Reload to update the UI
            window.location.reload()
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            // Authentication failed - dispatch custom event for error handling
            if (messageListener) {
              window.removeEventListener('message', messageListener)
            }
            const errorEvent = new CustomEvent('googleAuthError', {
              detail: { error: event.data.error || 'Google authentication failed' },
            })
            window.dispatchEvent(errorEvent)
          }
        }

        window.addEventListener('message', messageListener)

        // Monitor the popup window for closure (fallback)
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageListener)
            // Check if user is authenticated after popup closes
            setTimeout(() => {
              // Refresh user data in case authentication succeeded
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }, 500)
          }
        }, 500)
      } else {
        throw new Error(result.error || 'Failed to get Google OAuth URL')
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }

  /**
   * Exchange Google OAuth code for JWT token
   */
  async exchangeGoogleCode(code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(getApiUrl('/auth/google/exchange'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const result = await response.json()

      if (!response.ok) {
        let errorMessage = result.error || 'Google authentication failed'

        // Handle specific error codes
        if (result.code === 'GOOGLE_AUTH_ERROR') {
          errorMessage = 'Google authentication failed. Please try again.'
        } else if (result.code === 'BAD_REQUEST') {
          errorMessage = 'Invalid authorization code. Please try signing in again.'
        }

        return {
          success: false,
          error: errorMessage,
        }
      }

      // Store token and user
      if (result.data?.token && result.data?.user) {
        this.setToken(result.data.token)
        this.setUser(result.data.user)
      }

      return result
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Unable to connect to the server. Please check your internet connection.',
        }
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      }
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(getApiUrl('/auth/resend-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        let errorMessage = result.error || 'Failed to resend OTP'

        // Handle specific error codes
        if (result.code === 'NOT_FOUND') {
          errorMessage = 'Email not found. Please check your email address.'
        } else if (result.code === 'BAD_REQUEST') {
          errorMessage = 'Please enter a valid email address.'
        }

        return {
          success: false,
          error: errorMessage,
        }
      }

      return { success: true }
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Unable to connect to the server. Please check your internet connection.',
        }
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      }
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle different error types
        let errorMessage = result.error || 'Login failed'

        // Handle specific error codes
        if (result.code === 'INVALID_CREDENTIALS') {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (result.code === 'BAD_REQUEST') {
          errorMessage = 'Please enter both email and password.'
        } else if (response.status === 401) {
          errorMessage = 'Invalid email or password.'
        }

        return {
          success: false,
          error: errorMessage,
        }
      }

      // Store token and user
      if (result.data?.token && result.data?.user) {
        this.setToken(result.data.token)
        this.setUser(result.data.user)
      }

      return result
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Unable to connect to the server. Please check your internet connection.',
        }
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.',
      }
    }
  }

  /**
   * Get current user from backend
   */
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await fetch(getApiUrl('/auth/current-user'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // Token invalid, remove it
        if (response.status === 401) {
          this.removeToken()
        }
        return null
      }

      const result = await response.json()
      if (result.success && result.data) {
        this.setUser(result.data)
        return result.data
      }

      return null
    } catch (error) {
      console.error('Error fetching current user:', error)
      return null
    }
  }

  /**
   * Update user role
   */
  async updateRole(
    role: 'guest' | 'host' | 'admin'
  ): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken()
    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const response = await fetch(getApiUrl('/auth/update-role'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to update role',
        }
      }

      // Update stored user
      const user = this.getUser()
      if (user) {
        this.setUser({ ...user, role, needsRoleSelection: false })
      }

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  /**
   * Logout
   */
  logout(): void {
    this.removeToken()
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}

export const authService = new AuthService()
