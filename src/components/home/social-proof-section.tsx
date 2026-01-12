'use client'

import { Shield, CreditCard, Headphones, Trophy, CheckCircle, Users } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

export function SocialProofSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const features = [
    {
      icon: Shield,
      title: 'Verified Hosts',
      desc: 'Rigorous background checks and home inspections.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      desc: 'Encrypted transactions with guest protection.',
      color: 'text-success-500',
      bgColor: 'bg-success-500/10',
    },
    {
      icon: Headphones,
      title: '24/7 Concierge',
      desc: 'Dedicated support for any dining queries.',
      color: 'text-warning-500',
      bgColor: 'bg-warning-500/10',
    },
  ]

  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 tracking-tight text-zinc-900 leading-tight">
            Trusted by the world's most <br className="hidden md:block" />
            <span className="text-primary-600">passionate food lovers</span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-zinc-400">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary-500" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
                Top Rated Platform
              </span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-200" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary-500" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
                Certified Safe
              </span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-200" />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
                100k+ Global Members
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative p-8 rounded-3xl border border-zinc-100 bg-white shadow-sm transition-all hover:shadow-xl hover:border-primary-100 group"
            >
              <div
                className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}
              >
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-zinc-900">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-base sm:text-lg">{feature.desc}</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-3xl" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
