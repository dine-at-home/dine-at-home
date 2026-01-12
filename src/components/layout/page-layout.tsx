import { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

export function PageLayout({ children, className = '', fullWidth = false }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-background flex flex-col ${className}`}>
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">
        {fullWidth ? (
          children
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
        )}
      </main>
      <Footer />
    </div>
  )
}
