import { User } from './auth-service'

export function canBookDinners(user: User | null): boolean {
  return user?.role === 'guest'
}

export function canCreateDinners(user: User | null): boolean {
  // Only hosts can create dinners
  return user?.role === 'host'
}

export function getAccessDeniedMessage(user: User | null): string {
  if (user?.role === 'host') {
    return "Host accounts cannot book dinners. Switch to a guest account to make bookings."
  }
  return "You must be logged in as a guest to book dinners."
}

export function canAccessHostDashboard(user: User | null): boolean {
  // Only hosts can access the host dashboard
  return user?.role === 'host'
}

export function getAccessDeniedMessageForHostDashboard(user: User | null): string {
  if (user?.role === 'guest') {
    return "Guest accounts cannot access the host dashboard. Switch to a host account or sign up as a host."
  }
  return "You must be logged in as a host to access the dashboard."
}

export function getRoleBasedRedirect(user: User | null): string {
  if (user?.role === 'host') {
    return '/host/dashboard'
  }
  return '/auth/signin'
}
