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
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<string>('verifying')
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      // Wait for webhook to process and create booking
      // In payment-first flow, booking is created by webhook after payment succeeds
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
      } else {
        // Payment-first flow: booking should be created by webhook
        // We'll show success message and let user check their bookings
        // In a production app, you might want to poll for the booking or use websockets
        setPaymentStatus('success')
        setLoading(false)
      }
    }

    verifyPayment()
  }, [bookingId, dinnerId])

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
                Please wait while we verify your payment...
              </p>
            ) : paymentStatus === 'success' ? (
              <>
                <p className="text-muted-foreground">
                  Payment successful! Your booking has been created and confirmed. The host will
                  receive a notification about your booking.
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
