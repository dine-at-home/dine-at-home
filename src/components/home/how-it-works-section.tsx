'use client'

import { Search, Calendar, ChefHat, Star, ArrowRight } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

export function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      title: 'Discover',
      desc: 'Explore curated dinners by location, cuisine, or date.',
      color: 'bg-orange-500/10 text-orange-600',
    },
    {
      icon: Calendar,
      title: 'Reserve',
      desc: 'Instant booking or request a spot with one click.',
      color: 'bg-primary-500/10 text-primary-600',
    },
    {
      icon: ChefHat,
      title: 'Experience',
      desc: 'Dine in an authentic home setting with new friends.',
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      icon: Star,
      title: 'Review',
      desc: 'Share your story and help the community grow.',
      color: 'bg-purple-500/10 text-purple-600',
    },
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <section className="py-20 lg:py-32 bg-zinc-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 sm:mb-24 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl text-center lg:text-left"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-6 sm:mb-8">
              Simple & Seamless
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
              A new way to <span className="text-primary-500">experience</span> dining
            </h2>
            <p className="text-zinc-400 text-lg sm:text-xl font-light leading-relaxed">
              We've bridged the gap between home cooking and luxury hospitality. Here is how you
              start your journey.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block"
          >
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live activity: 142 people browsing
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="w-64 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: i === 1 ? '70%' : '40%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative"
        >
          {steps.map((step, idx) => (
            <motion.div key={idx} variants={itemVariants} className="relative group pt-8">
              <div className="absolute top-0 left-0 text-7xl font-black text-white/5 group-hover:text-primary-500/10 transition-colors duration-500 -translate-y-4">
                0{idx + 1}
              </div>
              <div
                className={`w-20 h-20 ${step.color} rounded-3xl flex items-center justify-center mb-8 relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500`}
              >
                <step.icon className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-2xl mb-4 group-hover:text-primary-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed text-lg">{step.desc}</p>

              {idx < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 translate-x-1/2 -translate-y-12">
                  <ArrowRight className="w-8 h-8 text-white/10 group-hover:text-primary-500/30 transition-colors" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
