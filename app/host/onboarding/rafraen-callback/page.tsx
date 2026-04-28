'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, BadgeCheck, AlertCircle } from 'lucide-react'
import { getApiUrl } from '@/lib/api-config'

export default function RafraenCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ranRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const code = searchParams?.get('code')
    const state = searchParams?.get('state')

    if (!code || !state) {
      router.replace('/host/payouts/settings?rafraen=error&reason=' + encodeURIComponent('Missing code or state'))
      return
    }

    const run = async () => {
      try {
        const url = `${getApiUrl('/auth/rafraen/callback')}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        const response = await fetch(url, { method: 'GET' })
        const json = await response.json().catch(() => null)
        if (!response.ok || !json?.success) {
          const reason = json?.error || json?.message || 'Verification failed'
          setError(reason)
          setTimeout(() => {
            router.replace('/host/payouts/settings?rafraen=error&reason=' + encodeURIComponent(reason))
          }, 1500)
          return
        }
        router.replace('/host/payouts/settings?rafraen=success')
      } catch (err: any) {
        const reason = err?.message || 'Network error'
        setError(reason)
        setTimeout(() => {
          router.replace('/host/payouts/settings?rafraen=error&reason=' + encodeURIComponent(reason))
        }, 1500)
      }
    }
    run()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-md">
        {error ? (
          <>
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold">Verification failed</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <div className="relative mx-auto w-10 h-10">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <BadgeCheck className="w-5 h-5 text-primary absolute inset-0 m-auto" />
            </div>
            <h1 className="text-xl font-semibold">Finalizing identity verification…</h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your Rafræn skilríki.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
