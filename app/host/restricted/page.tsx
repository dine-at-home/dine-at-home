'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { PageLayout } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat, LogOut, ArrowLeft, ShieldAlert } from 'lucide-react'

export default function RestrictedHostPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/signup?role=host')
  }

  return (
    <PageLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50/50">
        <Card className="max-w-xl w-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-12 pb-6 text-center bg-zinc-900 border-none">
            <div className="w-20 h-20 bg-primary-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-600/20">
              <ChefHat className="w-10 h-10 text-primary-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-white tracking-tight">
              Host Account Restricted
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 sm:p-12 space-y-8 bg-white">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 italic">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800 text-sm leading-relaxed">
                "It looks like you're currently registered as a guest. To maintain the security and
                integrity of our community, we require separate accounts for hosting and guest
                activities."
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-zinc-900">How to start hosting:</h3>
              <div className="grid gap-4">
                {[
                  { step: 1, text: 'Log out of your current guest account.' },
                  {
                    step: 2,
                    text: 'Sign up or log in with a different email address to begin your hosting journey.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4 group">
                    <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-sm group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                      {item.step}
                    </span>
                    <p className="text-zinc-600 font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleLogout}
                className="flex-1 h-14 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-lg shadow-lg shadow-primary-900/10"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Log Out & Switch
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex-1 h-14 rounded-2xl border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Maybe Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
