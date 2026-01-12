'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageLayout } from '@/components/layout/page-layout'
import { SearchResults } from '@/components/search/search-results'
import { BookingGuard } from '@/components/auth/booking-guard'
import { useAuth } from '@/contexts/auth-context'

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  // Redirect to OTP verification if user is authenticated but email is not verified
  useEffect(() => {
    if (!authLoading && user && !user.emailVerified) {
      const currentUrl = window.location.pathname + (window.location.search || '')
      const verifyOtpUrl = `/auth/verify-otp?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(currentUrl)}`
      router.push(verifyOtpUrl)
    }
  }, [authLoading, user, router, searchParams])

  // Parse search parameters from URL
  const location = searchParams.get('location') || ''
  const dateParam = searchParams.get('date')
  const guestsParam = searchParams.get('guests')

  const date = dateParam ? new Date(dateParam) : undefined
  const guests = guestsParam ? parseInt(guestsParam, 10) : 2

  const searchParamsObj = {
    location,
    date,
    guests,
  }

  // Show loading while checking auth or redirecting
  if (authLoading || (user && !user.emailVerified)) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {user && !user.emailVerified ? 'Redirecting to email verification...' : 'Loading...'}
            </p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <SearchResults searchParams={searchParamsObj} />
    </PageLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </PageLayout>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
