'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2 } from 'lucide-react'

function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dinnerId = searchParams.get('dinnerId')

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <CardTitle>Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your payment was cancelled. No booking has been created. You can try booking again
              when you're ready.
            </p>
            <div className="pt-4 space-y-2">
              {dinnerId && (
                <Button
                  onClick={() => router.push(`/dinner/${dinnerId}`)}
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                Continue Browsing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary-600" />
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}
