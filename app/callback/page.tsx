'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Auðkenni's pre-registered redirect URI is `/callback` (test client `esjaOidcTest`).
// All Rafræn handling lives in /host/onboarding/rafraen-callback — this page just preserves
// query params and forwards there. Keeps a single canonical handler instead of duplicating logic.
export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <CallbackForwarder />
    </Suspense>
  )
}

function CallbackForwarder() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const qs = params?.toString() ?? ''
    router.replace(`/host/onboarding/rafraen-callback${qs ? `?${qs}` : ''}`)
  }, [router, params])

  return <CallbackFallback />
}

function CallbackFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-md">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <h1 className="text-xl font-semibold">Finalizing identity verification…</h1>
      </div>
    </div>
  )
}
