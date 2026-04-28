import { User } from './auth-service'

export function getRedirectUrl(user: User | null): string {
  if (!user) {
    return '/'
  }

  // If role needs selection, redirect to role selection page.
  // Demographic fields (gender/country/languages) are no longer required at signup —
  // they live on the profile page if/when the user wants to fill them in.
  if (user.needsRoleSelection) {
    return '/auth/role-selection'
  }

  // Hosts: until KYC is verified, send them through onboarding (which hands off to payout settings).
  // Once verified, land on the dashboard.
  if (user.role === 'host') {
    if (user.kycStatus && user.kycStatus !== 'VERIFIED') {
      return '/host/onboarding'
    }
    return '/host/dashboard'
  }

  // Redirect guests to home page
  return '/'
}

export function shouldRedirectToDashboard(user: User | null): boolean {
  return user?.role === 'host'
}
