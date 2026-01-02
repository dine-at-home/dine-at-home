'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { authService } from '@/lib/auth-service'

function GoogleCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Authenticating with Google...')

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    
    // Handle error from Google
    if (errorParam) {
      console.error('Google OAuth error:', errorParam)
      setStatus('error')
      setMessage('Authentication failed. Please try again.')
      
      // Notify parent window if opened in popup
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_ERROR', error: errorParam },
          window.location.origin
        )
        setTimeout(() => {
          window.close()
        }, 2000)
      } else {
        // If not in popup, redirect to sign in
        setTimeout(() => {
          window.location.href = '/auth/signin'
        }, 3000)
      }
      return
    }

    // Handle missing code
    if (!code) {
      console.error('No authorization code received from Google')
      setStatus('error')
      setMessage('No authorization code received. Please try again.')
      
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_ERROR', error: 'No authorization code received' },
          window.location.origin
        )
        setTimeout(() => {
          window.close()
        }, 2000)
      } else {
        setTimeout(() => {
          window.location.href = '/auth/signin'
        }, 3000)
      }
      return
    }

    // Exchange code for token
    console.log('Exchanging Google OAuth code for token...')
    authService.exchangeGoogleCode(code)
      .then((result) => {
        if (result.success && result.data?.user) {
          console.log('Google authentication successful')
          setStatus('success')
          setMessage('Authentication successful! Closing window...')
          
          // Notify parent window that authentication succeeded
          if (window.opener) {
            window.opener.postMessage(
              { 
                type: 'GOOGLE_AUTH_SUCCESS', 
                user: result.data.user,
                token: result.data.token
              },
              window.location.origin
            )
            
            // Close the popup after a short delay
            setTimeout(() => {
              window.close()
            }, 500)
          } else {
            // If not in popup, redirect to home or dashboard
            setTimeout(() => {
              window.location.href = '/'
            }, 1000)
          }
        } else {
          console.error('Google authentication failed:', result.error)
          setStatus('error')
          setMessage(result.error || 'Authentication failed. Please try again.')
          
          if (window.opener) {
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_ERROR', error: result.error || 'Authentication failed' },
              window.location.origin
            )
            setTimeout(() => {
              window.close()
            }, 2000)
          } else {
            setTimeout(() => {
              window.location.href = '/auth/signin'
            }, 3000)
          }
        }
      })
      .catch((err) => {
        console.error('Error exchanging Google code:', err)
        setStatus('error')
        setMessage('Failed to authenticate. Please try again.')
        
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_ERROR', error: err.message || 'Authentication failed' },
            window.location.origin
          )
          setTimeout(() => {
            window.close()
          }, 2000)
        } else {
          setTimeout(() => {
            window.location.href = '/auth/signin'
          }, 3000)
        }
      })
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center p-8 bg-card rounded-2xl shadow-lg max-w-md">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground font-medium">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-foreground font-medium">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-destructive text-5xl mb-4">✗</div>
            <p className="text-destructive font-medium mb-2">{message}</p>
            <p className="text-muted-foreground text-sm">This window will close automatically...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}

