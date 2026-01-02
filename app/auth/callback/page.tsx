'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getRedirectUrl } from '@/lib/auth-utils'
import { useAuth } from '@/contexts/auth-context'
import { authService } from '@/lib/auth-service'

function AuthCallbackContent() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checkingRole, setCheckingRole] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if this is a Google OAuth callback with code
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const token = searchParams.get('token')
    
    if (errorParam) {
      setError(errorParam)
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)
      return
    }

    // Handle Google OAuth code exchange
    if (code) {
      authService.exchangeGoogleCode(code).then((result) => {
        if (result.success && result.data?.user) {
          // Token and user are already stored by exchangeGoogleCode
          // If opened in a popup, close it and notify parent window
          if (window.opener) {
            // Notify parent window that authentication succeeded
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: result.data.user }, window.location.origin);
            // Close the popup
            window.close();
          } else {
            // Opened in new tab, redirect will happen in next useEffect
            // Redirect will happen in next useEffect
          }
        } else {
          setError(result.error || 'Google authentication failed')
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: result.error }, window.location.origin);
            setTimeout(() => {
              window.close();
            }, 2000)
          } else {
            setTimeout(() => {
              router.push('/auth/signin')
            }, 3000)
          }
        }
      }).catch((err) => {
        console.error('Error exchanging Google code:', err)
        setError('Failed to authenticate with Google')
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: err.message }, window.location.origin);
          setTimeout(() => {
            window.close();
          }, 2000)
        } else {
          setTimeout(() => {
            router.push('/auth/signin')
          }, 3000)
        }
      })
      return
    }

    // Handle legacy token-based callback
    if (token) {
      // Store token from Google OAuth
      authService.setToken(token)
      // Fetch user data
      refreshUser().then(() => {
        // User will be set by refreshUser, redirect will happen in next useEffect
      }).catch((err) => {
        console.error('Error refreshing user:', err)
        setError('Failed to authenticate')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      })
      return
    }

    // Existing callback logic for regular auth
    if (loading) {
      return
    }

    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }

    if (user) {
      checkUserRoleSelection()
    }
  }, [searchParams, loading, router, refreshUser])

  useEffect(() => {
    // Handle redirect after user is loaded
    if (loading || !user) {
      return
    }

    checkUserRoleSelection()
  }, [user, loading, isAuthenticated])

  const checkUserRoleSelection = () => {
    setCheckingRole(true)
    
    // Check if user needs role selection
    if (user?.needsRoleSelection) {
      console.log('User needs role selection, redirecting to role selection page')
      router.push('/auth/role-selection')
    } else {
      console.log('User role already set, redirecting normally')
      // Existing user or role already selected, redirect normally
      const redirectUrl = getRedirectUrl(user)
      router.push(redirectUrl)
    }
    
    setCheckingRole(false)
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-destructive mb-4">❌ {error}</div>
            <p className="text-muted-foreground">Redirecting to sign in...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {checkingRole ? 'Setting up your account...' : 'Redirecting...'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
