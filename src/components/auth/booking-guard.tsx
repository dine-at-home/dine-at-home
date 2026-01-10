'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  canBookDinners,
  getAccessDeniedMessage,
  getRoleBasedRedirect,
} from '../../lib/access-control'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuth } from '@/contexts/auth-context'
//add types
interface BookingGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function BookingGuard({ children, fallback }: BookingGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) {
      return
    }

    if (!isAuthenticated) {
      // Preserve the current URL as callback URL
      const currentUrl = window.location.pathname + (window.location.search || '')
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`)
      return
    }

    // We no longer automatically redirect here if user can't book.
    // Instead, we let the component render the specific access denied message below.
    // This allows users to see "Why" they can't book (e.g. missing phone number).
  }, [user, loading, isAuthenticated, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show fallback if user cannot book
  if (user && !canBookDinners(user)) {
    if (fallback) {
      return <>{fallback}</>
    }

    const needsPhone = user.role === 'guest' && (!user.phone || user.phone.trim().length === 0)
    const redirectUrl = getRoleBasedRedirect(user)

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert
            className={needsPhone ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}
          >
            <AlertCircle
              className={`h-4 w-4 ${needsPhone ? 'text-blue-600' : 'text-orange-600'}`}
            />
            <AlertDescription className={needsPhone ? 'text-blue-800' : 'text-orange-800'}>
              {getAccessDeniedMessage(user)}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            {needsPhone ? (
              <Button onClick={() => router.push('/profile?tab=overview')} className="mr-4">
                Add Phone Number
              </Button>
            ) : null}
            <Button
              onClick={() => router.push(redirectUrl)}
              variant="outline"
              className={needsPhone ? '' : 'mr-4'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If not authenticated, show loading (will redirect in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // Show children if user is authenticated and can book
  if (isAuthenticated && user && canBookDinners(user)) {
    return <>{children}</>
  }

  // Fallback for any other case (still loading or edge case)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
