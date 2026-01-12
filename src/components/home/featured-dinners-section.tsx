'use client'

import { Button } from '@/components/ui/button'
import { DinnerCard } from '@/components/dinner/dinner-card'
import { ArrowRight, UtensilsCrossed, Sparkles } from 'lucide-react'
import { Dinner } from '@/types'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface FeaturedDinnersSectionProps {
  dinners: Dinner[]
}

export function FeaturedDinnersSection({ dinners }: FeaturedDinnersSectionProps) {
  const router = useRouter()
  const featuredDinners = [...dinners].reverse().slice(0, 3)

  const handleViewAll = () => {
    router.push('/search')
  }

  return (
    <section className="py-20 lg:py-32 bg-zinc-50/50">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 sm:mb-16 gap-6"
        >
          <div className="space-y-3 sm:space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Top Rated
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight leading-tight">
              Trending dinner <br className="hidden lg:block" />
              <span className="text-primary-600 font-extrabold">experiences near you</span>
            </h2>
            <p className="text-zinc-500 text-lg sm:text-xl max-w-xl font-light">
              Discover unique dining moments hosted by locals in your neighborhood this week.
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="hidden md:flex items-center gap-2 px-8 py-6 rounded-2xl border-2 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300 group"
            onClick={handleViewAll}
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {featuredDinners.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {featuredDinners.map((dinner, idx) => (
                <motion.div
                  key={dinner.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  viewport={{ once: true }}
                >
                  <DinnerCard dinner={dinner} className="h-full" />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16 text-center md:hidden"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2 py-6 rounded-2xl border-2 tracking-wide font-bold"
                onClick={handleViewAll}
              >
                <span>View All Experiences</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center py-24 bg-white rounded-[3rem] border border-zinc-100 shadow-sm"
          >
            <div className="flex flex-col items-center justify-center max-w-md mx-auto px-6">
              <div className="w-24 h-24 rounded-3xl bg-zinc-50 flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 duration-500">
                <UtensilsCrossed className="w-12 h-12 text-zinc-300" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-zinc-900">No dinners yet</h3>
              <p className="text-zinc-500 mb-10 text-lg leading-relaxed">
                We're bringing elite local chefs and hosts to your area soon. Check back later or
                expand your search.
              </p>
              <Button
                size="lg"
                className="items-center gap-2 px-10 py-6 rounded-2xl shadow-xl shadow-primary-500/20"
                onClick={handleViewAll}
              >
                <span>Browse All</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
