'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Clock, Loader2, ArrowRight, Home } from 'lucide-react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setBookingId(searchParams.get('bookingId'))
    setIsPending(searchParams.get('pending') === '1')
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {isPending ? (
          <>
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              Payment Processing
            </h1>
            <p className="text-muted-foreground">
              Your payment is being processed. You will receive a confirmation email once your booking is confirmed.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Your payment has been authorized. You will receive a confirmation email once the host accepts your booking.
            </p>
          </>
        )}
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
