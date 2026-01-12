'use client'

import { useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  canAccessHostDashboard,
  getAccessDeniedMessageForHostDashboard,
} from '@/lib/access-control'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '@/contexts/auth-context'

interface HostGuardProps {
  children: React.ReactNode
}

export function HostGuard({ children }: HostGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isAllowed = canAccessHostDashboard(user)
  const accessDeniedMessage = getAccessDeniedMessageForHostDashboard(user)

  useEffect(() => {
    if (loading) return

    // If user is not authenticated, redirect to sign in with callback URL
    if (!isAuthenticated) {
      const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      const signInUrl = `/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`
      router.replace(signInUrl)
      return
    }

    // Check email verification
    if (user && !user.emailVerified) {
      const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      const verifyOtpUrl = `/auth/verify-otp?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(currentUrl)}`
      router.replace(verifyOtpUrl)
      return
    }

    // If user is authenticated but not a host, show access denied message
    // (Don't redirect - let them see the message)
    if (!isAllowed) {
      // User is logged in but not a host - show message but don't redirect
    }
  }, [loading, isAuthenticated, isAllowed, user, router, pathname, searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirect is happening)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // If authenticated but not a host, show access denied
  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Alert className="max-w-md w-full p-6 rounded-lg shadow-lg">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <AlertDescription className="mt-4 text-center text-lg font-medium">
            {accessDeniedMessage}
          </AlertDescription>
          <div className="mt-6 text-center">
            <Button onClick={() => router.push('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
