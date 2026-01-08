'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { getRedirectUrl } from '@/lib/auth-utils'

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login, user, signInWithGoogle, loading } = useAuth()

  // Redirect if already logged in (wait for loading to complete)
  useEffect(() => {
    if (!loading && user) {
      const redirectUrl = getRedirectUrl(user)
      router.push(redirectUrl)
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      setFormLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setFormLoading(false)
      return
    }

    try {
      const result = await login(email, password)

      if (!result.success) {
        // Display specific error message from backend
        const errorMessage = result.error || 'Invalid email or password. Please try again.'
        setError(errorMessage)
      } else {
        // Redirect based on user role
        // Use user from result if available, otherwise use user from context (which should be updated)
        const userForRedirect = result.data?.user || user
        const redirectUrl = getRedirectUrl(userForRedirect || null)
        router.push(redirectUrl)
        router.refresh()
      }
    } catch (error: any) {
      // Handle unexpected errors
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side - Image (Desktop only) */}
      <div className="hidden md:flex md:w-1/2 relative h-screen">
        <Image
          src="/assets/sign.jpeg"
          alt="European street dining scene"
          fill
          className="object-cover"
          priority
        />
        {/* Optional overlay for better text contrast if needed */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 bg-muted h-screen overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 md:p-8">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-6 md:p-8">
            {/* Form Header */}
            <h2 className="text-2xl md:text-3xl font-bold leading-tight text-foreground mb-6 text-center">
              Sign in to DineWithUs
            </h2>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary/50"
                  />
                  <span className="text-sm font-medium text-foreground">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-muted-foreground hover:text-primary-600 transition"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={formLoading || loading}
                className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-base font-semibold leading-normal hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
              >
                {formLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-muted text-muted-foreground">Or login with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    setFormLoading(true)
                    setError('')

                    // Listen for Google auth errors from popup
                    const errorHandler = (event: Event) => {
                      const customEvent = event as CustomEvent<{ error: string }>
                      setError(
                        customEvent.detail?.error ||
                          'Failed to sign in with Google. Please try again.'
                      )
                      setFormLoading(false)
                      window.removeEventListener('googleAuthError', errorHandler)
                    }
                    window.addEventListener('googleAuthError', errorHandler)

                    await signInWithGoogle()
                    // signInWithGoogle opens popup, success will be handled via page reload
                    // Keep loading state until popup closes or error occurs
                  } catch (err: any) {
                    console.error('Google sign-in error:', err)
                    setError(err.message || 'Failed to sign in with Google. Please try again.')
                    setFormLoading(false)
                  }
                }}
                disabled={formLoading || loading}
                className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {formLoading ? 'Redirecting to Google...' : 'Continue with Google'}
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-primary-600 font-semibold hover:text-primary-700 transition"
              >
                Sign Up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
