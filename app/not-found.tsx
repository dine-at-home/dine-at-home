import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-6">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-500"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8 11h6" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved. Let's get you back to
        discovering great dinners.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Browse dinners
        </Link>
      </div>
    </div>
  )
}
