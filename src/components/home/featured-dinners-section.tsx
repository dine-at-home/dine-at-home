'use client'

import { Button } from '@/components/ui/button'
import { DinnerCard } from '@/components/dinner/dinner-card'
import { ArrowRight, UtensilsCrossed } from 'lucide-react'
import { Dinner } from '@/types'
import { useRouter } from 'next/navigation'

interface FeaturedDinnersSectionProps {
  dinners: Dinner[]
}

export function FeaturedDinnersSection({ dinners }: FeaturedDinnersSectionProps) {
  const router = useRouter()
  const featuredDinners = dinners.slice(0, 3)

  const handleViewAll = () => {
    router.push('/search')
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4">
              Trending dinner experiences near you
            </h2>
            <p className="text-muted-foreground text-lg">
              Discover unique dining experiences hosted by locals
            </p>
          </div>
          <Button 
            variant="outline" 
            className="hidden md:flex items-center space-x-2"
            onClick={handleViewAll}
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        {featuredDinners.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDinners.map((dinner) => (
                <DinnerCard 
                  key={dinner.id}
                  dinner={dinner}
                />
              ))}
            </div>

            <div className="mt-12 text-center md:hidden">
              <Button 
                variant="outline" 
                className="items-center space-x-2"
                onClick={handleViewAll}
              >
                <span>View All Experiences</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 lg:py-24">
            <div className="flex flex-col items-center justify-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <UtensilsCrossed className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">No dinners available yet</h3>
              <p className="text-muted-foreground mb-6 text-center">
                We're working on bringing you amazing dining experiences. Check back soon or explore our search to find hosts in your area.
              </p>
              <Button 
                variant="outline" 
                className="items-center space-x-2"
                onClick={handleViewAll}
              >
                <span>Explore All Experiences</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
