'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Lock, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiUrl } from '@/lib/api-config'

function ResetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [otp, setOtp] = useState(searchParams.get('otp') || '')
  const [resetToken, setResetToken] = useState('') // Token from OTP verification
  const [step, setStep] = useState<'verify' | 'reset'>('verify') // Two-step flow
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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
      const response = await fetch(getApiUrl('/auth/verify-reset-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      })

      const result = await response.json()

      if (result.success && result.data?.resetToken) {
        setResetToken(result.data.resetToken)
        setStep('reset') // Move to password reset step
        setError('') // Clear any previous errors
      } else {
        setError(result.error || result.message || 'Invalid or expired OTP')
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!resetToken) {
      setError('Reset token is missing. Please verify your OTP again.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(getApiUrl('/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          router.push('/auth/signin?message=Password reset successfully')
        }, 2000)
      } else {
        setError(result.error || result.message || 'Failed to reset password')
      }
    } catch (error: any) {
      console.error('Reset password error:', error)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setLoading(false)
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
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 bg-muted h-screen overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4 md:p-8">
          <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-6 md:p-8">
            {/* Back Button */}
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight text-foreground mb-2">
                Reset Password
              </h2>
              <p className="text-muted-foreground">
                {step === 'verify'
                  ? 'Enter the code sent to your email to verify your identity.'
                  : 'Create a new password for your account.'}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Password reset successful!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your password has been reset. Redirecting to sign in...
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

            {/* Step 1: Verify OTP */}
            {step === 'verify' && !success && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
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
                  />
                </div>

                {/* OTP Field */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reset Code
                  </label>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
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
                    'Verify Code'
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Reset Password */}
            {step === 'reset' && !success && (
              <div>
                {/* OTP Verified Success */}
                <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      Code verified successfully!
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Now create a new password for {email}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition pr-12"
                        placeholder="Enter new password (min. 8 characters)"
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

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition pr-12"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md p-1"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
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
                        Resetting...
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>

                  {/* Back to Verify */}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('verify')
                      setResetToken('')
                      setError('')
                    }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition"
                  >
                    ← Back to code verification
                  </button>
                </form>
              </div>
            )}

            {/* Links */}
            {step === 'verify' && (
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Don't have a code?{' '}
                  <Link
                    href="/auth/forgot-password"
                    className="text-primary-600 font-semibold hover:text-primary-700 transition"
                  >
                    Request a new one
                  </Link>
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  Remember your password?{' '}
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

export default function ResetPasswordPage() {
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
      <ResetPasswordPageContent />
    </Suspense>
  )
}
