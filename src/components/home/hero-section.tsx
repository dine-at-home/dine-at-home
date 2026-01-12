'use client'

import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { SearchWidget } from '@/components/search/search-widget'
import { Star, ShieldCheck, Users } from 'lucide-react'

export function HeroSection() {
  const { user } = useAuth()
  const isHost = user?.role === 'host'

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <section className="relative min-h-screen lg:h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background with subtle zoom effect */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="https://plus.unsplash.com/premium_photo-1677666509899-7c8cbc69ddc5?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Elegant dinner table"
          fill
          sizes="100vw"
          className="object-cover opacity-60"
          priority
        />
        {/* Advanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 via-transparent to-zinc-950/40" />
      </motion.div>

      {/* Hero Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 text-center text-white max-w-6xl mx-auto px-6 sm:px-6 lg:px-8 py-20"
      >
        {isHost ? (
          <div className="space-y-6 sm:space-y-8">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary-600/20 border border-primary-600/30 text-primary-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-primary-400" />
                Featured Host
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                Welcome back,
                <br />
                <span className="text-primary-500">{user?.name}</span>
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-lg lg:text-2xl font-light leading-relaxed max-w-2xl mx-auto text-zinc-300"
            >
              Your kitchen is the heart of the community. Ready to host another unforgettable
              evening?
            </motion.p>

            <motion.div variants={itemVariants} className="pt-4">
              <a
                href="/host/dashboard"
                className="group inline-flex items-center gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-white text-zinc-950 font-bold rounded-2xl hover:bg-primary-500 hover:text-white transition-all duration-300 text-lg sm:text-xl shadow-2xl shadow-white/5"
              >
                Go to Dashboard
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </a>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <motion.div variants={itemVariants}>
              <h1 className="text-[2.5rem] sm:text-5xl lg:text-8xl font-bold leading-[1.05] tracking-tighter">
                Dine in the <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
                  Heart of Homes
                </span>
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-xl lg:text-2xl font-light leading-relaxed max-w-2xl mx-auto text-white/80"
            >
              Unforgettable communal dining experiences hosted by passionate locals in your
              neighborhood.
            </motion.p>

            {/* Search Widget Container */}
            <motion.div variants={itemVariants} className="max-w-4xl mx-auto pt-2 sm:pt-6">
              <div className="p-2 sm:p-4 rounded-3xl sm:rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                <SearchWidget variant="hero" />
              </div>
            </motion.div>

            {/* Micro Benefits Social Proof */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-12 pt-8 sm:pt-12 text-white/60 text-[11px] sm:text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                Verified Hosts
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                12k+ Guests
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 fill-primary-500" />
                4.9/5 Rating
              </span>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-primary-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[128px] pointer-events-none" />
    </section>
  )
}
