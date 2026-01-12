import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export function HostCTASection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl group">
          {/* Decorative background gradients */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[500px]">
            {/* Content Side */}
            <div className="relative p-8 lg:p-16 flex flex-col justify-center z-10">
              <div className="space-y-6">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-500 text-sm font-bold tracking-wide uppercase">
                  Become a Host
                </span>

                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Earn up to <span className="text-primary-500">$500/week</span>
                  <br />
                  hosting dinners
                </h2>

                <p className="text-zinc-400 text-lg max-w-md">
                  Turn your kitchen into a community hub. Share your culinary heritage and get paid
                  doing what you love.
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4">
                  {[
                    'Share your passion for cooking',
                    'Set your own schedule',
                    'Meet interesting people',
                    'Get paid within 24 hours',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-8">
                  <Link
                    href="/host/onboarding"
                    className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-primary-600 text-white font-bold text-lg hover:bg-primary-500 transition-all duration-300 shadow-xl shadow-primary-900/20 group/btn"
                  >
                    Start Hosting Today
                    <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
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
