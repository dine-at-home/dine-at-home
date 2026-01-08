'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageLayout } from '@/components/layout/page-layout'
import { DinnerCard } from '@/components/dinner/dinner-card'
import { Button } from '@/components/ui/button'
import { Heart, ArrowLeft } from 'lucide-react'
import { favoriteService } from '@/lib/favorite-service'
import { transformDinner } from '@/lib/dinner-utils'
import { Dinner } from '@/types'
import { useAuth } from '@/contexts/auth-context'

export default function FavoritesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Dinner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    fetchFavorites()
  }, [user])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await favoriteService.getFavorites(1, 100) // Get all favorites

      if (result.success && result.data) {
        const transformedDinners = result.data.map((dinner: any) => transformDinner(dinner))
        setFavorites(transformedDinners)
      } else {
        setError(result.error || 'Failed to load favorites')
      }
    } catch (err: any) {
      console.error('Error fetching favorites:', err)
      setError('Failed to load favorites. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary fill-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
                <p className="text-muted-foreground mt-1">
                  {favorites.length > 0
                    ? `${favorites.length} saved ${favorites.length === 1 ? 'dinner' : 'dinners'}`
                    : 'Dinners you save will appear here'}
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading favorites...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchFavorites} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && favorites.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-4">
                Start exploring and save dinners you love
              </p>
              <Button onClick={() => router.push('/search')}>Explore Dinners</Button>
            </div>
          )}

          {/* Favorites Grid */}
          {!loading && !error && favorites.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {favorites.map((dinner) => (
                <DinnerCard key={dinner.id} dinner={dinner} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
