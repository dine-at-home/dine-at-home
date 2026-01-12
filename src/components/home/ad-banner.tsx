import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface AdBannerProps {
  title: string
  description: string
  buttonText: string
  link: string
  imageSrc: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export function AdBanner({
  title,
  description,
  buttonText,
  link,
  imageSrc,
  variant = 'primary',
  className = '',
}: AdBannerProps) {
  const isSecondary = variant === 'secondary'

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative overflow-hidden rounded-3xl shadow-2xl transition-transform hover:scale-[1.01] duration-500 ${
            isSecondary ? 'bg-zinc-900 text-white' : 'bg-primary-600 text-white'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-stretch min-h-[320px]">
            {/* Content Side */}
            <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center gap-6 z-10">
              <div className="space-y-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                    isSecondary ? 'bg-white/10 text-white/80' : 'bg-black/10 text-white/90'
                  }`}
                >
                  Sponsored Partnership
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">{title}</h2>
                <p
                  className={`text-lg max-w-xl ${isSecondary ? 'text-zinc-400' : 'text-primary-100'}`}
                >
                  {description}
                </p>
              </div>

              <div>
                <Link
                  href={link}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 group ${
                    isSecondary
                      ? 'bg-white text-zinc-900 hover:bg-zinc-200'
                      : 'bg-zinc-900 text-white hover:bg-black'
                  }`}
                >
                  {buttonText}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative flex-1 min-h-[300px] lg:min-h-auto overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-inherit via-transparent to-transparent z-10 lg:block hidden" />
              <Image
                src={imageSrc}
                alt={title}
                fill
                className="object-cover object-center transition-transform hover:scale-110 duration-[2000ms]"
              />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -tranzinc-y-1/2 tranzinc-x-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 tranzinc-y-1/2 -tranzinc-x-1/4 w-64 h-64 bg-black/5 rounded-full blur-2xl" />
        </div>
      </div>
    </section>
  )
}
