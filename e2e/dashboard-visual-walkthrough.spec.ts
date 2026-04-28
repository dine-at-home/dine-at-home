import { test, expect, type Page } from '@playwright/test'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api'

async function signupAsHost(): Promise<{ token: string; email: string; userId: string }> {
  const stamp = Date.now() + Math.floor(Math.random() * 1000)
  const email = `visual-${stamp}@datthome.test`

  const registerRes = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'TestPass123!',
      name: 'Visual Walkthrough Host',
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

const PAUSE = 1200

test.describe('Dashboard UX redesign — visual walkthrough', () => {
  test('host onboarding skip → dashboard tabs → payout setup', async ({ page }) => {
    const { token, email, userId } = await signupAsHost()
    await authenticate(page, token, {
      id: userId,
      email,
      name: 'Visual Walkthrough Host',
      role: 'host',
      emailVerified: true,
      kycStatus: 'UNVERIFIED',
    })

    // 1. Onboarding: location → terms → handoff step
    await page.goto('/host/onboarding')
    await page.getByLabel(/Street address/i).fill('Laugavegur 1')
    await page.getByLabel(/City/i).fill('Reykjavík')
    await page.getByLabel(/Region/i).fill('Capital Region')
    await page.getByRole('button', { name: /^Next$/ }).click()
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: /^Next$/ }).click()
    await expect(page.getByRole('heading', { name: /Almost there/i })).toBeVisible()
    await page.waitForTimeout(PAUSE)

    // 2. Click "I'll do this later" → land on dashboard?tab=earnings&setup=skipped
    await page.getByRole('button', { name: /I'll do this later/i }).click()
    await expect(page).toHaveURL(/\/host\/dashboard\?tab=earnings&setup=skipped/)
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
    await expect(page.getByText(/Finish payout setup/i).first()).toBeVisible()
    await page.waitForTimeout(PAUSE)

    // 3. Earnings tab is active and shows the highlighted setup checklist
    await expect(page.getByRole('heading', { name: /Your kitchen, your books/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Get paid for your dinners/i })).toBeVisible()
    await page.waitForTimeout(PAUSE)

    // 4. Walk every other tab — banner stays pinned
    for (const tabName of ['Overview', 'Dinners', 'Bookings', 'Account']) {
      await page.getByRole('tab', { name: tabName, exact: true }).click()
      await expect(page.getByText(/Finish payout setup/i).first()).toBeVisible()
      await page.waitForTimeout(800)
    }

    // 5. Back to Earnings, click the banner CTA → /host/payouts/settings
    await page.getByRole('tab', { name: 'Earnings', exact: true }).click()
    await page
      .getByRole('button', { name: /Set up payouts/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/host\/payouts\/settings/)
    await page.waitForTimeout(PAUSE)
  })

  test('legacy /host/payouts URL redirects into the dashboard', async ({ page }) => {
    const { token, email, userId } = await signupAsHost()
    await authenticate(page, token, {
      id: userId,
      email,
      name: 'Visual Walkthrough Host',
      role: 'host',
      emailVerified: true,
      kycStatus: 'UNVERIFIED',
    })
    await page.goto('/host/payouts')
    await expect(page).toHaveURL(/\/host\/dashboard\?tab=earnings/)
  })

  test('mobile width — tabs scroll, banner adapts', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const { token, email, userId } = await signupAsHost()
    await authenticate(page, token, {
      id: userId,
      email,
      name: 'Visual Walkthrough Host',
      role: 'host',
      emailVerified: true,
      kycStatus: 'UNVERIFIED',
    })
    await page.goto('/host/dashboard?tab=earnings&setup=skipped')
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
    await expect(page.getByText(/Finish payout setup/i).first()).toBeVisible()
    await page.waitForTimeout(PAUSE)
    for (const tabName of ['Overview', 'Dinners', 'Bookings', 'Account']) {
      await page.getByRole('tab', { name: tabName, exact: true }).click()
      await page.waitForTimeout(600)
    }
  })
})
