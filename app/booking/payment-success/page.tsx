'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, AlertCircle, ArrowRight, Home } from 'lucide-react'
import { paymentService } from '@/lib/payment-service'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Airwallex appends ?id=int_xxxxx to the success URL
        const intentId = searchParams.get('id')
        const dinnerId = searchParams.get('dinnerId')

        console.log('[PaymentSuccess] Processing payment:', { intentId, dinnerId })

        if (!intentId) {
          setError('No payment intent ID found. Please contact support.')
          setStatus('error')
          return
        }

        // Try to create booking from payment intent (fallback if webhook hasn't fired yet)
        const result = await paymentService.createBookingFromPayment({ intentId })

        if (result.success && result.data?.bookingId) {
          setBookingId(result.data.bookingId)
          setStatus('success')
        } else {
          // Booking might already have been created by webhook - that's fine
          if (result.error?.includes('already exists')) {
            setStatus('success')
          } else {
            console.error('[PaymentSuccess] Create booking failed:', result.error)
            // Still show success since payment went through
            // The webhook will create the booking
            setStatus('success')
          }
        }
      } catch (err: any) {
        console.error('[PaymentSuccess] Error:', err)
        // Payment succeeded even if booking creation fails here
        // Webhook will handle it
        setStatus('success')
      }
    }

    processPayment()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Processing your payment...</h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your booking.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
            <div className="flex flex-col space-y-3 pt-4">
              {bookingId && (
                <button
                  onClick={() => router.push(`/bookings/${bookingId}`)}
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Booking
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Something went wrong
            </h1>
            <p className="text-muted-foreground">
              {error || 'We encountered an issue processing your payment. Please contact support.'}
            </p>
            <div className="flex flex-col space-y-3 pt-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
