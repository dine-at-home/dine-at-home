'use client'

import { useState, useEffect, Suspense } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { HeroSection } from '@/components/home/hero-section'
import { SocialProofSection } from '@/components/home/social-proof-section'
import { FeaturedDinnersSection } from '@/components/home/featured-dinners-section'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { HostCTASection } from '@/components/home/host-cta-section'
import { getApiUrl } from '@/lib/api-config'
import { transformDinner } from '@/lib/dinner-utils'
import { shouldShowInListings } from '@/lib/dinner-filters'
import { Dinner } from '@/types'
import { useSearchParams } from 'next/navigation'

function HomePageContent() {
  const searchParams = useSearchParams()
  const [dinners, setDinners] = useState<Dinner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBookingSuccess, setShowBookingSuccess] = useState(false)

  // Check if user was redirected after booking
  useEffect(() => {
    if (searchParams.get('booking') === 'success') {
      setShowBookingSuccess(true)
      // Hide banner after 5 seconds
      const timer = setTimeout(() => {
        setShowBookingSuccess(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Get booked dinnerId from URL to filter out immediately
  const bookedDinnerIdFromUrl = searchParams.get('bookedDinnerId')

  useEffect(() => {
    const fetchDinners = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(getApiUrl('/dinners?limit=20&page=1'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const result = await response.json()

        if (result.success && result.data) {
          const transformedDinners = result.data.map(transformDinner)
          // Filter out booked and past dinners
          const availableDinners = transformedDinners.filter((dinner: Dinner) => {
            // If we have a bookedDinnerId in URL, filter it out immediately
            if (bookedDinnerIdFromUrl && dinner.id === bookedDinnerIdFromUrl) {
              console.log('🟡 Filtering out booked dinner from URL:', dinner.id)
              return false
            }
            return shouldShowInListings(dinner)
          })
          setDinners(availableDinners)
        } else {
          setError(result.error || 'Failed to load dinners')
          setDinners([])
        }
      } catch (err: any) {
        console.error('Error fetching dinners:', err)
        setError('Failed to load dinners. Please try again later.')
        setDinners([])
      } finally {
        setLoading(false)
      }
    }

    fetchDinners()
  }, [bookedDinnerIdFromUrl])

  return (
    <MainLayout>
      {showBookingSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Booking created successfully! Your reservation is pending host approval.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                className="inline-flex text-green-500 hover:text-green-700"
                onClick={() => setShowBookingSuccess(false)}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <HeroSection />
      <SocialProofSection />
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dinners...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <p className="text-muted-foreground">Please refresh the page to try again.</p>
        </div>
      ) : (
        <FeaturedDinnersSection dinners={dinners} />
      )}
      <HowItWorksSection />
      <HostCTASection />
    </MainLayout>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </MainLayout>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}
