import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/search',
  '/dinners',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/auth/forgot-password',
  '/auth/callback',
  '/auth/google/callback',
  '/auth/role-selection',
  '/terms-of-use',
  '/privacy-policy',
  '/help-center',
  '/how-it-works',
]

// Protected routes that require authentication
const protectedRoutes = ['/profile', '/booking', '/host']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.includes('/dinners')) {
      return pathname.startsWith('/dinners')
    }
    return pathname === route || pathname.startsWith(route)
  })

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Check for JWT token in cookies or Authorization header
    const token =
      request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // Redirect to sign in if no token
      // Preserve the full URL including query parameters as callback
      const fullUrl = request.nextUrl.pathname + request.nextUrl.search
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', fullUrl)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
}
