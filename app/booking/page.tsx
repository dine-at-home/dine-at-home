'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageLayout } from '@/components/layout/page-layout'
import { Booking } from '@/components/booking/booking'
import { BookingGuard } from '@/components/auth/booking-guard'
import { getApiUrl } from '@/lib/api-config'
import { transformDinner } from '@/lib/dinner-utils'
import { NavigationParams, Dinner } from '@/types'

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dinnerId = searchParams.get('dinner')
  const guestsParam = searchParams.get('guests')
  const [dinner, setDinner] = useState<Dinner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDinner = async () => {
      if (!dinnerId) {
        setError('Dinner ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(getApiUrl(`/dinners/${dinnerId}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const result = await response.json()

        if (result.success && result.data) {
          const transformedDinner = transformDinner(result.data)
          setDinner(transformedDinner)
        } else {
          setError(result.error || 'Dinner not found')
          setDinner(null)
        }
      } catch (err: any) {
        console.error('Error fetching dinner:', err)
        setError('Failed to load dinner. Please try again later.')
        setDinner(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDinner()
  }, [dinnerId])

  const handleNavigation = (page: string, params?: NavigationParams) => {
    // Handle navigation based on page type
    if (page === 'dinner-detail' && params?.dinner) {
      router.push(`/dinners/${params.dinner.id}`)
    } else if (page === 'booking-confirmed') {
      router.push('/profile?tab=bookings')
    }
    // Message host feature - commented out for now
    // else if (page === 'chat') {
    // 	// Handle chat navigation if needed
    // 	console.log('Chat navigation:', params)
    // }
  }

  const guests = guestsParam ? parseInt(guestsParam, 10) : 2
  const dinnerDate = dinner ? new Date(dinner.date) : new Date()

  if (loading) {
    return (
      <BookingGuard>
        <PageLayout fullWidth={true}>
          <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </PageLayout>
      </BookingGuard>
    )
  }

  if (error || !dinner) {
    return (
      <BookingGuard>
        <PageLayout fullWidth={true}>
          <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-semibold mb-4">Booking Error</h1>
            <p className="text-muted-foreground mb-4">
              {error || "The dinner you're trying to book doesn't exist."}
            </p>
            <button
              onClick={() => router.push('/')}
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Go back to home
            </button>
          </div>
        </PageLayout>
      </BookingGuard>
    )
  }

  return (
    <BookingGuard>
      <PageLayout fullWidth={true}>
        <Booking dinner={dinner} date={dinnerDate} guests={guests} onNavigate={handleNavigation} />
      </PageLayout>
    </BookingGuard>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <BookingGuard>
          <PageLayout fullWidth={true}>
            <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading booking details...</p>
            </div>
          </PageLayout>
        </BookingGuard>
      }
    >
      <BookingPageContent />
    </Suspense>
  )
}
