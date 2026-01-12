'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function HostCTASection() {
  const { user } = useAuth()
  const router = useRouter()
  const isHost = user?.role === 'host'
  const isGuest = user?.role === 'guest'

  const handleBecomeHost = (e: React.MouseEvent) => {
    if (isGuest) {
      e.preventDefault()
      router.push('/host/restricted')
    }
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="relative bg-zinc-900 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl group">
          {/* Decorative background gradients */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[450px] sm:min-h-[500px]">
            {/* Content Side */}
            <div className="relative p-8 sm:p-12 lg:p-16 flex flex-col justify-center z-10">
              <div className="space-y-6 sm:space-y-8">
                <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                  Become a Host
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                  Share your <span className="text-primary-500">culinary passion</span>
                  <br />
                  and host memorable dinners
                </h2>

                <p className="text-zinc-400 text-base sm:text-lg max-w-md font-light leading-relaxed">
                  Turn your kitchen into a community hub. Share your culinary heritage and meet
                  wonderful people while doing what you love.
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 sm:gap-y-4 pt-2">
                  {[
                    'Share your passion for cooking',
                    'Set your own schedule',
                    'Meet interesting people',
                    'Get paid within 24 hours',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 sm:gap-3 text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {!isHost && (
                  <div className="pt-4 sm:pt-6">
                    <Link
                      href="/host/onboarding"
                      onClick={handleBecomeHost}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl bg-primary-600 text-white font-bold text-base sm:text-lg hover:bg-primary-500 transition-all duration-300 shadow-xl shadow-primary-900/20 group/btn w-full sm:w-auto text-center"
                    >
                      Start Hosting Today
                      <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Image Side */}
            <div className="relative min-h-[400px] lg:min-h-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/40 to-transparent z-10 lg:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10 lg:hidden block" />
              <Image
                src="/images/host-cta.png"
                alt="Hosting a dinner party"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[3000ms] group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
