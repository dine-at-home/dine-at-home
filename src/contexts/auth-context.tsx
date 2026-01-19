'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService, User, AuthResponse } from '@/lib/auth-service'
import { getApiUrl } from '@/lib/api-config'
import { BlockedModal } from '@/components/auth/blocked-modal'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (data: {
    email: string
    password: string
    name: string
    role?: 'guest' | 'host'
    phone?: string
    gender?: string
    country?: string
    languages?: string[]
  }) => Promise<AuthResponse>
  verifyOTP: (email: string, otp: string) => Promise<AuthResponse>
  resendOTP: (email: string) => Promise<{ success: boolean; error?: string }>
  updateRole: (role: 'guest' | 'host' | 'admin') => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)
  const router = useRouter()

  // Load user on mount
  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      // First check localStorage
      const storedUser = authService.getUser()
      if (storedUser) {
        if (storedUser.blocked) {
          setIsBlocked(true)
        }
        setUser(storedUser)
      }

      // Then verify with backend
      const response = await fetch(getApiUrl('/auth/current-user'), {
        headers: authService.getAuthHeader()
      })

      if (response.status === 403) {
        const data = await response.json()
        if (data.code === 'USER_BLOCKED' || data.error?.includes('blocked')) {
          setIsBlocked(true)
          setUser(null)
          authService.logout()
          return
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout()
          setUser(null)
        }
        return
      }

      const result = await response.json()
      if (result.success && result.data) {
        const currentUser = result.data
        if (currentUser.blocked) {
          setIsBlocked(true)
          setUser(null)
          authService.logout()
        } else {
          setUser(currentUser)
          authService.setUser(currentUser)
        }
      }
    } catch (error) {
      console.error('Error loading user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password)
      if (result.success && result.data?.user) {
        if (result.data.user.blocked) {
          setIsBlocked(true)
          setUser(null)
          authService.logout()
          return {
            success: false,
            error: 'Your account has been blocked. Please contact info@datthome.com.',
          }
        }
        setUser(result.data.user)
      } else if (!result.success && result.error?.toLowerCase().includes('blocked')) {
        setIsBlocked(true)
      }
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      }
    }
  }

  const register = async (data: {
    email: string
    password: string
    name: string
    role?: 'guest' | 'host'
    phone?: string
    gender?: string
    country?: string
    languages?: string[]
  }) => {
    try {
      const result = await authService.register(data)
      // Store token and user if registration successful (user is automatically verified)
      if (result.success && result.data?.token && result.data?.user) {
        setUser(result.data.user)
      }
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      }
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const result = await authService.verifyOTP(email, otp)
      if (result.success && result.data?.user) {
        setUser(result.data.user)
      }
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'OTP verification failed',
      }
    }
  }

  const resendOTP = async (email: string) => {
    return authService.resendOTP(email)
  }

  const signInWithGoogle = async () => {
    try {
      await authService.signInWithGoogle()
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      throw error
    }
  }

  const updateRole = async (role: 'guest' | 'host' | 'admin') => {
    try {
      const result = await authService.updateRole(role)
      if (result.success) {
        // Refresh user data
        await refreshUser()
      }
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update role',
      }
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    router.push('/auth/signin')
  }

  const refreshUser = async () => {
    try {
      const response = await fetch(getApiUrl('/auth/current-user'), {
        headers: authService.getAuthHeader()
      })

      if (response.status === 403) {
        const data = await response.json()
        if (data.code === 'USER_BLOCKED') {
          setIsBlocked(true)
          setUser(null)
          authService.logout()
          return
        }
      }

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          if (result.data.blocked) {
            setIsBlocked(true)
            setUser(null)
            authService.logout()
          } else {
            setUser(result.data)
            authService.setUser(result.data)
          }
        }
      } else if (response.status === 401) {
        setUser(null)
        authService.logout()
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    verifyOTP,
    resendOTP,
    updateRole,
    logout,
    refreshUser,
    signInWithGoogle,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <BlockedModal isOpen={isBlocked} onClose={() => setIsBlocked(false)} />
    </AuthContext.Provider>
  )
}
