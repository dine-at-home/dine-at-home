import { Metadata } from 'next'
import HostOnboardingClient from '@/components/host/host-onboarding-client'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Become a Host | Share Your Culinary Passion | Dine at Home',
  description:
    'Join our community of local hosts. Share your home-cooked meals, meet new people, and earn money doing what you love. Sign up to start hosting today.',
  keywords: [
    'become a host',
    'host a dinner',
    'earn money cooking',
    'chef at home',
    'food entrepreneur',
  ],
}

export default function HostOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <HostOnboardingClient />
    </Suspense>
  )
}
