import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

export const metadata = {
  title: 'DineWithUs',
  description: 'Find your next authentic dining experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Get BASE_URL from environment (server-side only)
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001/api'

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__BASE_URL__ = ${JSON.stringify(baseUrl)};`,
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
