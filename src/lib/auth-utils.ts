import { User } from './auth-service'

export function getRedirectUrl(user: User | null): string {
  if (!user) {
    return '/'
  }

  // If profile needs completion, redirect to profile completion page
  if (user.needsProfileCompletion) {
    return '/auth/complete-profile'
  }

  // If role needs selection, redirect to role selection page
  if (user.needsRoleSelection) {
    return '/auth/role-selection'
  }

  // Redirect hosts to their dashboard
  if (user.role === 'host') {
    return '/host/dashboard'
  }

  // Redirect guests to home page
  return '/'
}

export function shouldRedirectToDashboard(user: User | null): boolean {
  return user?.role === 'host'
}
