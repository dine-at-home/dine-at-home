import { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'

// Validate environment variables in production
if (process.env.NODE_ENV === 'production') {
  try {
    require('@/lib/env-check').validateEnvironment()
  } catch (error) {
    console.error('Environment validation failed:', error)
  }
}

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <Footer />
    </div>
  )
}
