import { test, expect } from '@playwright/test'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api'

// Helper — sign up a brand-new host through the backend so we don't fight the OTP UI.
// We hit /auth/register with role=host (auto-verified in dev) and grab the JWT.
async function signupAsHost(): Promise<{ token: string; email: string; userId: string }> {
  const stamp = Date.now() + Math.floor(Math.random() * 1000)
  const email = `e2e-host-${stamp}@datthome.test`

  const registerRes = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'TestPass123!',
      name: 'Mock Test User',
      role: 'host',
      phone: '+3545551234',
      gender: 'other',
      country: 'Iceland',
      languages: ['en'],
    }),
  })
  if (!registerRes.ok) {
    throw new Error(`Signup failed (${registerRes.status}): ${await registerRes.text()}`)
  }

  // Pull the OTP that was just sent (dev-only helper).
  const otpRes = await fetch(`${BACKEND_URL}/auth/__dev/get-otp?email=${encodeURIComponent(email)}`)
  if (!otpRes.ok) {
    throw new Error(`Could not fetch OTP (${otpRes.status}): ${await otpRes.text()}`)
  }
  const { data } = await otpRes.json()
  const otp = data?.otp as string
  if (!otp) throw new Error('Dev OTP helper returned no code')

  // Verify the OTP — this is what hands us a JWT.
  const verifyRes = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })
  const verifyJson = await verifyRes.json()
  if (!verifyJson.success || !verifyJson.data?.token) {
    throw new Error(`OTP verify failed: ${JSON.stringify(verifyJson)}`)
  }
  return { token: verifyJson.data.token, email, userId: verifyJson.data.user.id }
}

// Inject the JWT into localStorage before any page script runs so the AuthContext picks it up.
async function authenticate(page: import('@playwright/test').Page, token: string, user: any) {
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
    },
    { token, user }
  )
}

// Pre-accept the cookie-consent modal so it doesn't intercept clicks on inputs and CTAs.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem(
        'cookie-consent',
        JSON.stringify({ essential: true, preferences: true, analytics: true, marketing: true })
      )
    } catch {}
  })
})

test.describe('Host payout verification — unified flow', () => {
  test('post-signup redirect lands on /host/onboarding, handoff routes to settings', async ({
    page,
  }) => {
    const { token, email } = await signupAsHost()
    await authenticate(page, token, {
      email,
      name: 'Mock Test User',
      role: 'host',
      emailVerified: true,
      kycStatus: 'UNVERIFIED',
    })

    await page.goto('/host/onboarding')
    await expect(page.getByRole('heading', { name: 'Become a Host' })).toBeVisible()

    // Step 1 — location.
    await expect(page.getByRole('heading', { name: /Where will you be hosting/i })).toBeVisible()
    await page.getByLabel(/Street address/i).fill('Laugavegur 1')
    await page.getByLabel(/City/i).fill('Reykjavík')
    await page.getByLabel(/Region/i).fill('Capital Region')
    const next = () => page.getByRole('button', { name: /^Next$/ })
    await expect(next()).toBeEnabled()
    await next().click()

    // Step 2 — terms.
    await expect(page.getByRole('heading', { name: /Host responsibilities/i })).toBeVisible()
    await page.getByRole('checkbox').check()
    await next().click()

    // Step 3 — handoff.
    await expect(page.getByRole('heading', { name: 'Almost there' })).toBeVisible()
    await page.getByRole('button', { name: /Set up payouts/i }).click()
    await expect(page).toHaveURL(/\/host\/payouts\/settings(?:\?|$)/)
    await expect(page.getByRole('heading', { name: 'Get paid' })).toBeVisible()
  })

  test('settings page shows three required steps for a fresh host', async ({ page }) => {
    const { token, email } = await signupAsHost()
    await authenticate(page, token, {
      email,
      name: 'Mock Test User',
      role: 'host',
      emailVerified: true,
      kycStatus: 'UNVERIFIED',
    })

    await page.goto('/host/payouts/settings')
    await expect(page.getByRole('heading', { name: 'Get paid' })).toBeVisible()
    await expect(page.getByText('0 of 3 complete')).toBeVisible()

    // Three numbered cards.
    await expect(page.getByRole('heading', { name: 'Identity' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Payout card' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Recipient details' })).toBeVisible()

    // Cardholder name should be prefilled from signup name.
    const cardholder = page.getByLabel('Cardholder name')
    await expect(cardholder).toHaveValue('Mock Test User')
  })

  test('mock Rafræn flow flips Identity to Verified', async ({ page }) => {
    test.skip(
      !process.env.RAFRAEN_MOCK_MODE_ON,
      'Set RAFRAEN_MOCK_MODE_ON=1 when the backend has RAFRAEN_MOCK_MODE=true'
    )
    const { token, email } = await signupAsHost()
    await authenticate(page, token, {
      email,
      name: 'Mock Test User',
      role: 'host',
      emailVerified: true,
      kycStatus: 'UNVERIFIED',
    })

    await page.goto('/host/payouts/settings')
    await page.getByRole('button', { name: /Start verification/i }).click()
    // The mock authorizeUrl bounces back through /host/onboarding/rafraen-callback which calls
    // the backend then redirects to /host/payouts/settings?rafraen=success.
    await page.waitForURL(/\/host\/payouts\/settings\?rafraen=success/, { timeout: 30_000 })

    // The Identity card should now show a "Verified" pill (the small status badge in the header).
    const identityCard = page.locator('section[data-step="1"]')
    await expect(identityCard).toHaveAttribute('data-done', 'true', { timeout: 10_000 })
    await expect(identityCard.getByText('Verified', { exact: true })).toBeVisible()
    await expect(page.getByText(/1 of 3 complete/)).toBeVisible()
  })

  test('recipient details autosave flips that card to Saved', async ({ page }) => {
    const { token, email } = await signupAsHost()
    await authenticate(page, token, {
      email,
      name: 'Mock Test User',
      role: 'host',
      emailVerified: true,
      kycStatus: 'UNVERIFIED',
    })

    await page.goto('/host/payouts/settings')

    // Make sure cardholder is prefilled, then set address to trigger autosave (debounced 600ms).
    await expect(page.getByLabel('Cardholder name')).toHaveValue('Mock Test User')
    await page.getByLabel('Registered address').fill('Laugavegur 1, 101 Reykjavík')

    // Wait for the saved indicator (autosave fires ~600ms after change).
    await expect(page.getByText('✓ Saved')).toBeVisible({ timeout: 5_000 })
  })

  test('Onboarding step persists across reload (resumes mid-flow)', async ({ page }) => {
    const { token, email, userId } = await signupAsHost()
    await authenticate(page, token, {
      id: userId,
      email,
      name: 'Mock Test User',
      role: 'host',
      emailVerified: true,
      kycStatus: 'UNVERIFIED',
      hostOnboardingStep: 1,
    })

    await page.goto('/host/onboarding')
    await expect(page.getByRole('heading', { name: /Where will you be hosting/i })).toBeVisible()

    // Fill step 1 + advance — the wizard should PATCH the user with hostOnboardingStep=2.
    await page.getByLabel(/Street address/i).fill('Laugavegur 1')
    await page.getByLabel(/City/i).fill('Reykjavík')
    await page.getByLabel(/Region/i).fill('Capital Region')
    await page.getByRole('button', { name: /^Next$/ }).click()
    await expect(page.getByRole('heading', { name: /Host responsibilities/i })).toBeVisible()

    // Verify the backend actually persisted hostOnboardingStep=2.
    const me = await fetch(`${BACKEND_URL}/auth/current-user`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json())
    expect(me?.data?.hostOnboardingStep).toBe(2)

    // Reload the page — the wizard should resume on step 2, not restart at 1.
    await page.reload()
    await expect(page.getByRole('heading', { name: /Host responsibilities/i })).toBeVisible({
      timeout: 15_000,
    })
  })
})
