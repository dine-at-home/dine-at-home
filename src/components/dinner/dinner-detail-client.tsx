'use client'

import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/layout/page-layout'
import { DinnerDetail } from '@/components/dinner/dinner-detail'
import { Dinner, NavigationParams } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'

export default function DinnerDetailClient({ dinner }: { dinner: Dinner }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect to OTP verification if user is authenticated but email is not verified
  useEffect(() => {
    if (!authLoading && user && !user.emailVerified) {
      const currentUrl = window.location.pathname + (window.location.search || '')
      const verifyOtpUrl = `/auth/verify-otp?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(currentUrl)}`
      router.push(verifyOtpUrl)
    }
  }, [authLoading, user, router])

  const handleNavigation = (page: string, navParams?: NavigationParams) => {
    if (page === 'booking' && navParams?.dinner) {
      const guests = navParams.guests || 2
      router.push(`/booking?dinner=${navParams.dinner.id}&guests=${guests}`)
    } else if (page === 'booking-confirmed') {
      router.push('/profile?tab=bookings')
    }
  }

  return (
    <PageLayout fullWidth={true}>
      <DinnerDetail dinner={dinner} onNavigate={handleNavigation} />
    </PageLayout>
  )
}
