'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageLayout } from '@/components/layout/page-layout'
import { DinnerDetail } from '@/components/dinner/dinner-detail'
import { getApiUrl } from '@/lib/api-config'
import { transformDinner } from '@/lib/dinner-utils'
import { NavigationParams, Dinner } from '@/types'

export default function DinnerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string)
  const [dinner, setDinner] = useState<Dinner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDinner = async () => {
      if (!id) {
        setError('Invalid dinner ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(getApiUrl(`/dinners/${id}`), {
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
  }, [id])

  const handleNavigation = (page: string, navParams?: NavigationParams) => {
    if (page === 'booking' && navParams?.dinner) {
      // Build URL with dinner ID and guests parameter
      const guests = navParams.guests || 2
      router.push(`/booking?dinner=${navParams.dinner.id}&guests=${guests}`)
      // Message host feature - commented out for now
      // } else if (page === 'chat' && navParams?.host) {
      // 	// Handle chat navigation if needed
      // 	console.log('Chat navigation:', navParams)
    } else if (page === 'booking-confirmed') {
      router.push('/profile?tab=bookings')
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dinner...</p>
        </div>
      </PageLayout>
    )
  }

  if (error || !dinner) {
    return (
      <PageLayout>
        <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Dinner Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The dinner experience you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-primary-600 hover:text-primary-700 underline"
          >
            Go back to home
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <DinnerDetail dinner={dinner} onNavigate={handleNavigation} />
    </PageLayout>
  )
}
