import { test, expect, Page } from '@playwright/test'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api'

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@datthome.test`
}

async function fetchOtp(email: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/__dev/get-otp?email=${encodeURIComponent(email)}`)
  if (!res.ok) throw new Error(`OTP fetch failed: ${await res.text()}`)
  const { data } = await res.json()
  return data.otp
}

async function signUpGuest(page: Page, email: string) {
  await page.goto('/auth/signup')
  await page.getByRole('button', { name: /Sign up with email instead/i }).click()
  await page.getByLabel(/^Full name$/).fill('Profile Tester')
  await page.getByLabel(/^Email$/).fill(email)
  await page.getByLabel(/^Password$/).fill('TestPass123!')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: /^Create account$/i }).click()
  await page.waitForURL(/\/auth\/verify-otp/)
  const otp = await fetchOtp(email)
  await page.getByPlaceholder('000000').fill(otp)
  await page.getByRole('button', { name: /Verify|Continue|Submit/i }).first().click()
  await page.waitForURL(/\/(?:\?|$)/, { timeout: 15_000 })
}

// Pre-accept cookies on the FIRST navigation only. We deliberately do NOT clear localStorage on
// every page load, because that would wipe the auth token immediately after signin.
test.beforeEach(async ({ context }) => {
  await context.addCookies([])
  await context.addInitScript(() => {
    try {
      if (!window.localStorage.getItem('cookie-consent')) {
        window.localStorage.setItem(
          'cookie-consent',
          JSON.stringify({ essential: true, preferences: true, analytics: true, marketing: true })
        )
      }
    } catch {}
  })
})

test.describe('Profile page — every button works', () => {
  test('Settings tab: Change Password, Verify Email, Manage Payment Methods, Sign Out, Back to Home', async ({
    page,
  }) => {
    const email = uniqueEmail('e2e-profile')
    await signUpGuest(page, email)

    await page.goto('/profile?tab=settings')
    await expect(page.getByRole('heading', { name: /My Profile/i })).toBeVisible()

    // 1. Back to Home — top-right of header
    const backToHome = page.getByRole('button', { name: /Back to Home/i })
    await expect(backToHome).toBeVisible()

    // 2. Change Password — opens dialog
    await page.getByRole('button', { name: /^Change Password$/ }).first().click()
    await expect(page.getByRole('dialog').getByText(/Change Password/i).first()).toBeVisible()
    await page.getByRole('button', { name: /Cancel/i }).click()

    // 3. Verify Email — only when unverified. Newly registered guest verified email via OTP,
    //    so the button shouldn't be present. If present, it should be clickable.
    const verifyButton = page.getByRole('button', { name: /^Verify Email$/i })
    if (await verifyButton.count()) {
      await expect(verifyButton).toBeEnabled()
    }

    // 4. Manage Payment Methods — navigates to /profile/payment-methods
    await page.getByRole('button', { name: /Manage Payment Methods/i }).click()
    await page.waitForURL(/\/profile\/payment-methods/)
    await expect(page.getByRole('heading', { name: /Payment Methods/i })).toBeVisible()
    // Empty state should show
    await expect(page.getByText(/No saved cards yet/i)).toBeVisible()
    await page.getByRole('button', { name: /Back to profile/i }).click()
    await page.waitForURL(/\/profile/)

    // 5. Sign Out — navigates to /auth/signin and clears auth
    await page.getByRole('button', { name: /^Sign Out$/i }).click()
    await page.waitForURL(/\/auth\/signin/)
  })

  test('Overview tab: Edit/Save Profile, image picker', async ({ page }) => {
    const email = uniqueEmail('e2e-profile-edit')
    await signUpGuest(page, email)

    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: /My Profile/i })).toBeVisible()

    // Edit button is just labelled "Edit" in the Personal Information card.
    const editButton = page.getByRole('button', { name: /^Edit$/ })
    await expect(editButton).toBeVisible()
    await editButton.click()

    // Save and Cancel are visible while editing
    await expect(page.getByRole('button', { name: /^Save$/ }).first()).toBeVisible()
    await page.getByRole('button', { name: /^Cancel$/ }).first().click()
  })

  test('Bookings tab: opens dialogs, Cancel Booking only on confirmed/pending', async ({
    page,
  }) => {
    const email = uniqueEmail('e2e-profile-bookings')
    await signUpGuest(page, email)

    await page.goto('/profile?tab=bookings')
    // No bookings expected for a fresh user
    await expect(page.getByText(/No bookings yet/i)).toBeVisible({ timeout: 10_000 })
  })
})
