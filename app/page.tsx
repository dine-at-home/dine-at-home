'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { HeroSection } from '@/components/home/hero-section'
import { SocialProofSection } from '@/components/home/social-proof-section'
import { FeaturedDinnersSection } from '@/components/home/featured-dinners-section'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { HostCTASection } from '@/components/home/host-cta-section'
import { getApiUrl } from '@/lib/api-config'
import { transformDinner } from '@/lib/dinner-utils'
import { Dinner } from '@/types'

export default function HomePage() {
	const [dinners, setDinners] = useState<Dinner[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchDinners = async () => {
			try {
				setLoading(true)
				setError(null)

				const response = await fetch(getApiUrl('/dinners?limit=20&page=1'), {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				})

				const result = await response.json()

				if (result.success && result.data) {
					const transformedDinners = result.data.map(transformDinner)
					setDinners(transformedDinners)
				} else {
					setError(result.error || 'Failed to load dinners')
					setDinners([])
				}
			} catch (err: any) {
				console.error('Error fetching dinners:', err)
				setError('Failed to load dinners. Please try again later.')
				setDinners([])
			} finally {
				setLoading(false)
			}
		}

		fetchDinners()
	}, [])

	return (
		<MainLayout>
			<HeroSection />
			<SocialProofSection />
			{loading ? (
				<div className="py-16 text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading dinners...</p>
				</div>
			) : error ? (
				<div className="py-16 text-center">
					<p className="text-destructive mb-4">{error}</p>
					<p className="text-muted-foreground">Please refresh the page to try again.</p>
				</div>
			) : (
				<FeaturedDinnersSection dinners={dinners} />
			)}
			<HowItWorksSection />
			<HostCTASection />
		</MainLayout>
	)
}

