'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Mail, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiUrl } from '@/lib/api-config'

function ForgotPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(getApiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        // Check if there was a service error
        if (result.data?.serviceError || result.data?.emailSent === false) {
          setError(
            result.data?.message ||
              result.message ||
              'The email service is currently experiencing issues. Please try again later or contact support.'
          )
          setSuccess(false) // Make sure success is false when there's a service error
        } else {
          setSuccess(true)
          setError('') // Clear any previous errors
        }
      } else {
        setError(result.error || result.message || 'Failed to send reset code')
        setSuccess(false)
      }
    } catch (error: any) {
      console.error('Forgot password error:', error)
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

      {/* Right Side - Forgot Password Form */}
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
                Forgot Password?
              </h2>
              <p className="text-muted-foreground">
                Enter your email address and we'll send you a code to reset your password.
              </p>
            </div>

            {/* Success Message */}
            {success && !error && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Reset code sent!</p>
                  <p className="text-sm text-green-700 mt-1">
                    If an account exists with this email, a password reset code has been sent. Check
                    your email and use the code to reset your password.
                  </p>
                  <Link
                    href="/auth/reset-password"
                    className="mt-3 inline-block text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    Go to Reset Password →
                  </Link>
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
                  />
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
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>
              </form>
            )}

            {/* Sign In Link */}
            <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
              Remember your password?{' '}
              <Link
                href="/auth/signin"
                className="text-primary-600 font-semibold hover:text-primary-700 transition"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
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
      <ForgotPasswordPageContent />
    </Suspense>
  )
}
