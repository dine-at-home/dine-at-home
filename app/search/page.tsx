import { Metadata } from 'next'
import SearchPageContent from '@/components/search/search-page-client'
import { Suspense } from 'react'
import { PageLayout } from '@/components/layout/page-layout'

export const metadata: Metadata = {
  title: 'Search Dinners | Find Authentic Home-Cooked Meals',
  description:
    'Search for unique social dining experiences near you. Filter by location, cuisine, and date to find the perfect home-cooked meal.',
  keywords: ['search dinners', 'find food events', 'local dining search', 'book home meals'],
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading search...</p>
            </div>
          </div>
        </PageLayout>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
