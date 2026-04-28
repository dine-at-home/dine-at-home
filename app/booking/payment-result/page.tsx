'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { paymentService } from '@/lib/payment-service'

type UIStatus = 'loading' | 'error'

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<UIStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const finalizedRef = useRef(false)

  useEffect(() => {
    if (finalizedRef.current) return
    finalizedRef.current = true

    const bookingId = searchParams.get('bookingId')
    const resourcePath = searchParams.get('resourcePath')

    if (!bookingId || !resourcePath) {
      setStatus('error')
      setError('Missing payment reference. Please contact support if you were charged.')
      return
    }

    void (async () => {
      const response = await paymentService.finalizePayment(bookingId, resourcePath)
      if (!response.success || !response.data) {
        setStatus('error')
        setError(response.error || 'Unable to confirm payment.')
        return
      }

      const data = response.data
      if (data.status === 'SUCCEEDED') {
        router.replace(`/booking/payment-success?bookingId=${encodeURIComponent(bookingId)}`)
        return
      }
      if (data.status === 'PROCESSING') {
        // Still processing — show success-ish (booking is authorized, just waiting on async confirmation).
        router.replace(
          `/booking/payment-success?bookingId=${encodeURIComponent(bookingId)}&pending=1`
        )
        return
      }
      router.replace(
        `/booking/payment-cancel?bookingId=${encodeURIComponent(bookingId)}&reason=${encodeURIComponent(
          data.reason || 'declined'
        )}`
      )
    })()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Confirming your payment…</h1>
            <p className="text-muted-foreground">This only takes a moment.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Payment confirmation issue
            </h1>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Back to home
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  )
}
