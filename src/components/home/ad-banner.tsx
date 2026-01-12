'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl transition-transform hover:scale-[1.01] duration-700 ${
            isSecondary ? 'bg-zinc-900 text-white' : 'bg-primary-600 text-white'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-stretch min-h-[300px] sm:min-h-[360px]">
            {/* Content Side */}
            <div className="flex-1 p-8 sm:p-10 lg:p-16 flex flex-col justify-center gap-6 sm:gap-8 z-10 transition-transform group">
              <div className="space-y-4 sm:space-y-6">
                <span
                  className={`inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-[0.2em] uppercase border ${
                    isSecondary
                      ? 'bg-white/5 text-white/60 border-white/10'
                      : 'bg-black/5 text-white/80 border-black/10'
                  }`}
                >
                  Sponsored Partnership
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                  {title}
                </h2>
                <p
                  className={`text-base sm:text-lg lg:text-xl font-light max-w-xl leading-relaxed ${isSecondary ? 'text-zinc-400' : 'text-primary-100'}`}
                >
                  {description}
                </p>
              </div>

              <div>
                <Link
                  href={link}
                  className={`inline-flex items-center gap-2 sm:gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 group ${
                    isSecondary
                      ? 'bg-white text-zinc-950 hover:bg-zinc-100'
                      : 'bg-zinc-950 text-white hover:bg-black shadow-xl shadow-black/20'
                  }`}
                >
                  {buttonText}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative flex-1 min-h-[300px] lg:min-h-auto overflow-hidden">
              <div
                className={`absolute inset-0 z-10 lg:block hidden bg-gradient-to-r ${
                  isSecondary ? 'from-zinc-900' : 'from-primary-600'
                } via-transparent to-transparent`}
              />
              <Image
                src={imageSrc}
                alt={title}
                fill
                className="object-cover object-center transition-transform hover:scale-110 duration-[3000ms]"
              />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-black/5 rounded-full blur-2xl pointer-events-none" />
        </motion.div>
      </div>
    </section>
  )
}
