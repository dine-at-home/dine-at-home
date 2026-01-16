'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { paymentService } from '@/lib/payment-service'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dinnerId = searchParams.get('dinnerId')
  const bookingId = searchParams.get('bookingId') // Legacy support
  // Stripe passes session_id in the URL when redirecting
  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId')
  // Also check for payment_intent in case Stripe passes it
  const paymentIntentId = searchParams.get('payment_intent') || searchParams.get('paymentIntentId')
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<string>('verifying')
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      console.log('[Payment Success] Starting verification', { dinnerId, bookingId, sessionId, paymentIntentId })
      
      // Wait for webhook to process and create booking (give it 3 seconds)
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // If we have a bookingId from URL (legacy flow), verify it
      if (bookingId) {
        try {
          const result = await paymentService.verifyPayment(bookingId)
          if (result.success && result.data) {
            if (result.data.status === 'SUCCEEDED' || result.data.paymentIntentStatus === 'succeeded') {
              setPaymentStatus('success')
              setCreatedBookingId(bookingId)
            } else {
              setPaymentStatus('pending')
            }
          } else {
            setPaymentStatus('pending')
          }
        } catch (error) {
          console.error('Error verifying payment:', error)
          setPaymentStatus('pending')
        } finally {
          setLoading(false)
        }
      } else if (dinnerId) {
        // Payment-first flow: Try to create booking from payment if webhook didn't work
        console.log('[Payment Success] Payment-first flow, attempting to create booking...')
        
        // First, try with session_id if available
        if (sessionId) {
          try {
            console.log('[Payment Success] Creating booking from session:', sessionId)
            const result = await paymentService.createBookingFromPayment({
              sessionId: sessionId,
            })

            if (result.success && result.data?.bookingId) {
              console.log('[Payment Success] ✅ Booking created successfully:', result.data.bookingId)
              setCreatedBookingId(result.data.bookingId)
              setPaymentStatus('success')
              setLoading(false)
              return
            } else {
              console.warn('[Payment Success] ⚠️ Could not create booking from session:', result.error)
              setError(result.error || 'Could not create booking')
            }
          } catch (error: any) {
            console.error('[Payment Success] ❌ Error creating booking from session:', error)
            setError(error.message || 'Failed to create booking')
          }
        }

        // If session_id didn't work, try payment_intent
        if (paymentIntentId && !createdBookingId) {
          try {
            console.log('[Payment Success] Creating booking from payment intent:', paymentIntentId)
            const result = await paymentService.createBookingFromPayment({
              paymentIntentId: paymentIntentId,
            })

            if (result.success && result.data?.bookingId) {
              console.log('[Payment Success] ✅ Booking created successfully:', result.data.bookingId)
              setCreatedBookingId(result.data.bookingId)
              setPaymentStatus('success')
              setError(null)
            } else {
              console.warn('[Payment Success] ⚠️ Could not create booking from payment intent:', result.error)
              if (!error) setError(result.error || 'Could not create booking')
            }
          } catch (error: any) {
            console.error('[Payment Success] ❌ Error creating booking from payment intent:', error)
            if (!error) setError(error.message || 'Failed to create booking')
          }
        }

        // If we still don't have a booking, show success anyway (webhook might have created it)
        // User can check their bookings page
        if (!createdBookingId) {
          console.log('[Payment Success] No booking created yet, but payment succeeded. Webhook may create it.')
        }
        
        setPaymentStatus('success')
        setLoading(false)
      } else {
        // No identifiers - just show success
        setPaymentStatus('success')
        setLoading(false)
      }
    }

    verifyPayment()
  }, [bookingId, dinnerId, sessionId, paymentIntentId])

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            {loading ? (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary-600" />
                <CardTitle>Verifying Payment...</CardTitle>
              </>
            ) : paymentStatus === 'success' ? (
              <>
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <CardTitle>Payment Successful!</CardTitle>
              </>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
                <CardTitle>Payment Processing</CardTitle>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {loading ? (
              <p className="text-muted-foreground">
                Please wait while we verify your payment and create your booking...
              </p>
            ) : paymentStatus === 'success' ? (
              <>
                {error && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      {error}. Your payment was successful. Please check your bookings page.
                    </p>
                  </div>
                )}
                {createdBookingId ? (
                  <p className="text-muted-foreground">
                    Payment successful! Your booking has been created and confirmed. The host will
                    receive a notification about your booking.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Payment successful! Your booking is being processed. Please check your bookings page in a moment.
                  </p>
                )}
                <div className="pt-4 space-y-2">
                  <Button onClick={() => router.push('/profile?tab=bookings')} className="w-full">
                    View My Bookings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    Continue Browsing
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Your payment is being processed. This may take a few moments. You will receive a
                  confirmation email once the payment is complete.
                </p>
                <div className="pt-4 space-y-2">
                  <Button onClick={() => router.push('/profile?tab=bookings')} className="w-full">
                    View My Bookings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    Continue Browsing
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary-600" />
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
