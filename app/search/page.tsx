'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PageLayout } from '@/components/layout/page-layout'
import { SearchResults } from '@/components/search/search-results'
import { BookingGuard } from '@/components/auth/booking-guard'

function SearchPageContent() {
	const searchParams = useSearchParams()
	
	// Parse search parameters from URL
	const location = searchParams.get('location') || ''
	const dateParam = searchParams.get('date')
	const guestsParam = searchParams.get('guests')
	
	const date = dateParam ? new Date(dateParam) : undefined
	const guests = guestsParam ? parseInt(guestsParam, 10) : 2
	
	const searchParamsObj = {
		location,
		date,
		guests
	}

	return (
		<PageLayout>
			<SearchResults searchParams={searchParamsObj} />
		</PageLayout>
	)
}

export default function SearchPage() {
	return (
		<Suspense fallback={
			<PageLayout>
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading...</p>
					</div>
				</div>
			</PageLayout>
		}>
			<SearchPageContent />
		</Suspense>
	)
}

