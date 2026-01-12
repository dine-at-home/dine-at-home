'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Mail, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { getApiUrl } from '@/lib/api-config'
import { getRedirectUrl } from '@/lib/auth-utils'

function VerifyOTPPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyOTP, resendOTP, user } = useAuth()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0) // Cooldown in seconds

  // If email not in URL, get from user context or localStorage
  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email)
    }
  }, [email, user])

  // Redirect if already verified
  useEffect(() => {
    if (user && user.emailVerified) {
      const callbackUrl = searchParams.get('callbackUrl')
      if (callbackUrl) {
        router.push(callbackUrl)
      } else {
        const redirectUrl = getRedirectUrl(user)
        router.push(redirectUrl)
      }
    }
  }, [user, router, searchParams])

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Automatically send OTP when page loads if user is not verified
  useEffect(() => {
    const sendOTPOnLoad = async () => {
      if (email && email.includes('@') && user && !user.emailVerified) {
        try {
          await resendOTP(email)
          // Start cooldown after sending OTP
          setResendCooldown(60)
        } catch (error) {
          console.error('Error sending OTP on load:', error)
        }
      }
    }

    sendOTPOnLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResendSuccess(false)

    // Validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code')
      setLoading(false)
      return
    }

    try {
      const result = await verifyOTP(email, otp)

      if (result.success) {
        setSuccess(true)
        // Redirect after 1 second
        setTimeout(() => {
          const callbackUrl = searchParams.get('callbackUrl')
          if (callbackUrl) {
            router.push(callbackUrl)
          } else if (result.data?.user) {
            const redirectUrl = getRedirectUrl(result.data.user)
            router.push(redirectUrl)
          } else {
            router.push('/')
          }
        }, 1000)
      } else {
        setError(result.error || 'Invalid or expired OTP')
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      return // Don't allow resend during cooldown
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setResending(true)
    setError('')
    setResendSuccess(false)

    try {
      const result = await resendOTP(email)

      if (result.success) {
        setResendSuccess(true)
        setOtp('') // Clear OTP field
        setResendCooldown(60) // Start 60-second cooldown
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        setError(result.error || 'Failed to resend OTP. Please try again.')
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setResending(false)
    }
  }

  // Determine if user is logged in (has user context but email not verified)
  const isLoggedIn = !!user && !user.emailVerified

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
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Right Side - Verify OTP Form */}
      <div className="flex-1 bg-muted h-screen overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 md:p-8">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-6 md:p-8">
            {/* Back Button - Only show for non-logged-in users */}
            {!isLoggedIn && (
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign Up
              </Link>
            )}

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight text-foreground mb-2">
                Verify Your Email
              </h2>
              <p className="text-muted-foreground">
                {isLoggedIn ? (
                  <>
                    We've sent a verification code to <strong>{email || 'your email'}</strong>.
                    Please enter the code below to continue.
                  </>
                ) : (
                  <>
                    We've sent a verification code to <strong>{email || 'your email'}</strong>.
                    Please enter the code below.
                  </>
                )}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Email verified successfully!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Redirecting you to your dashboard...
                  </p>
                </div>
              </div>
            )}

            {/* Resend Success Message */}
            {resendSuccess && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">New verification code sent!</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Please check your email for the new code.
                  </p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="text-destructive text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    placeholder="Enter your email"
                    required
                    disabled={!!user?.email} // Disable if email comes from user context
                  />
                </div>

                {/* OTP Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-base font-semibold leading-normal hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resending || resendCooldown > 0}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </span>
                    ) : resendCooldown > 0 ? (
                      `Resend Code (${resendCooldown}s)`
                    ) : (
                      'Resend Code'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Links - Only show for non-logged-in users */}
            {!success && !isLoggedIn && (
              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/signin"
                    className="text-primary-600 font-semibold hover:text-primary-700 transition"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyOTPPageContent />
    </Suspense>
  )
}
