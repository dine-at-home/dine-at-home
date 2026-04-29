import { test, type Page } from '@playwright/test'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api'

async function signupAsHost(): Promise<{ token: string; email: string; userId: string }> {
  const stamp = Date.now() + Math.floor(Math.random() * 1000)
  const email = `shot-${stamp}@datthome.test`
  const registerRes = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'TestPass123!',
      name: 'Visual Host',
      role: 'host',
      phone: '+3545551234',
      gender: 'other',
      country: 'Iceland',
      languages: ['en'],
    }),
  })
  if (!registerRes.ok) throw new Error(`signup ${registerRes.status}`)
  const otpRes = await fetch(`${BACKEND_URL}/auth/__dev/get-otp?email=${encodeURIComponent(email)}`)
  const { data } = await otpRes.json()
  const otp = data?.otp as string
  const verifyRes = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })
  const verifyJson = await verifyRes.json()
  return { token: verifyJson.data.token, email, userId: verifyJson.data.user.id }
}

async function authenticate(page: Page, token: string, user: Record<string, unknown>) {
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('auth_token', token as string)
      localStorage.setItem('auth_user', JSON.stringify(user))
    },
    { token, user },
  )
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem(
        'cookie-consent',
        JSON.stringify({ essential: true, preferences: true, analytics: true, marketing: true }),
      )
    } catch {}
  })
})

test('capture dashboard screenshots — desktop, every tab', async ({ page }) => {
  const { token, email, userId } = await signupAsHost()
  await authenticate(page, token, {
    id: userId,
    email,
    name: 'Visual Host',
    role: 'host',
    emailVerified: true,
    kycStatus: 'UNVERIFIED',
  })
  await page.setViewportSize({ width: 1440, height: 900 })

  const tabs = ['overview', 'dinners', 'bookings', 'earnings', 'account'] as const
  for (const tab of tabs) {
    await page.goto(`/host/dashboard?tab=${tab}${tab === 'earnings' ? '&setup=skipped' : ''}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(900)
    await page.screenshot({
      path: `test-results/screens/desktop-${tab}.png`,
      fullPage: true,
    })
  }
})

test('capture dashboard screenshots — mobile, every tab', async ({ page }) => {
  const { token, email, userId } = await signupAsHost()
  await authenticate(page, token, {
    id: userId,
    email,
    name: 'Visual Host',
    role: 'host',
    emailVerified: true,
    kycStatus: 'UNVERIFIED',
  })
  await page.setViewportSize({ width: 390, height: 844 })

  const tabs = ['overview', 'dinners', 'bookings', 'earnings', 'account'] as const
  for (const tab of tabs) {
    await page.goto(`/host/dashboard?tab=${tab}${tab === 'earnings' ? '&setup=skipped' : ''}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(900)
    await page.screenshot({
      path: `test-results/screens/mobile-${tab}.png`,
      fullPage: true,
    })
  }
})
