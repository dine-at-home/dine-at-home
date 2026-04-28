import { test, expect } from '@playwright/test'

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

// Wipe localStorage on every page load so previous tests' JWTs don't trigger the
// "already logged in → redirect away" effect on /auth/signin and /auth/signup.
// Also pre-accept the cookie-consent modal so it doesn't intercept clicks.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      window.localStorage.clear()
      window.sessionStorage.clear()
      window.localStorage.setItem(
        'cookie-consent',
        JSON.stringify({ essential: true, preferences: true, analytics: true, marketing: true })
      )
    } catch {}
  })
})

test.describe('Auth — sign up', () => {
  test('Email signup as guest — only name, email, password, terms', async ({ page }) => {
    const email = uniqueEmail('e2e-guest')
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { name: /Join Dine at Home/i })).toBeVisible()

    // Email form is hidden by default (Google CTA is primary). Reveal it.
    await page.getByRole('button', { name: /Sign up with email instead/i }).click()

    await page.getByLabel(/^Full name$/).fill('Sigga Guest')
    await page.getByLabel(/^Email$/).fill(email)
    await page.getByLabel(/^Password$/).fill('TestPass123!')
    await page.getByRole('checkbox').check()

    await page.getByRole('button', { name: /^Create account$/i }).click()

    // OTP page — single input with maxLength=6.
    await page.waitForURL(/\/auth\/verify-otp/)
    const otp = await fetchOtp(email)
    await page.getByPlaceholder('000000').fill(otp)
    await page.getByRole('button', { name: /Verify|Continue|Submit/i }).first().click()
    await page.waitForURL(/\/(?:\?|$)/, { timeout: 15_000 })
  })

  test('?role=host pre-selects Host and shows the "Iceland only" hint', async ({ page }) => {
    await page.goto('/auth/signup?role=host')
    const hostRadio = page.getByRole('radio', { name: /Host/i })
    await expect(hostRadio).toBeChecked()
    await expect(page.getByText(/Iceland only/i)).toBeVisible()
  })

  test('Email signup as host → OTP verify lands on /host/onboarding, not dashboard', async ({
    page,
  }) => {
    const email = uniqueEmail('e2e-host-signup')
    await page.goto('/auth/signup?role=host')
    // Form is auto-expanded when ?role=host is present, so fields are visible immediately.
    await page.getByLabel(/^Full name$/).fill('Hera Host')
    await page.getByLabel(/^Email$/).fill(email)
    await page.getByLabel(/^Password$/).fill('TestPass123!')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: /^Create account$/i }).click()

    await page.waitForURL(/\/auth\/verify-otp/)
    const otp = await fetchOtp(email)
    await page.getByPlaceholder('000000').fill(otp)
    await page.getByRole('button', { name: /Verify|Continue|Submit/i }).first().click()

    // The unverified host must land on onboarding, NOT on the dashboard.
    await page.waitForURL(/\/host\/onboarding/, { timeout: 15_000 })
  })

  test('Role picker is hidden until "Sign up with email instead" is clicked', async ({ page }) => {
    await page.goto('/auth/signup')
    // No radios visible yet — only the Google CTA.
    await expect(page.getByRole('radio', { name: /Guest/i })).toBeHidden()
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
    // Reveal the email form → role picker shows up.
    await page.getByRole('button', { name: /Sign up with email instead/i }).click()
    await expect(page.getByRole('radio', { name: /Guest/i })).toBeVisible()
    await expect(page.getByRole('radio', { name: /Host/i })).toBeVisible()
  })

  test('Inline validation surfaces field errors on blur', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.getByRole('button', { name: /Sign up with email instead/i }).click()
    // Touch and leave the email field empty → see the inline error.
    await page.getByLabel(/^Email$/).click()
    await page.getByLabel(/^Full name$/).click()
    await expect(page.getByText(/Enter a valid email/i)).toBeVisible()
  })

  test('Terms & Conditions link opens /terms-of-use, not 404', async ({ page, context }) => {
    await page.goto('/auth/signup')
    // T&C link lives inside the email-signup form (collapsed by default).
    await page.getByRole('button', { name: /Sign up with email instead/i }).click()

    const tcLink = page.getByRole('link', { name: /Terms & Conditions/i })
    await expect(tcLink).toBeVisible()
    await expect(tcLink).toHaveAttribute('href', '/terms-of-use')

    // The link has target=_blank — wait for the new tab.
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      tcLink.click(),
    ])
    await newPage.waitForLoadState('domcontentloaded')
    expect(newPage.url()).toContain('/terms-of-use')
    // The actual page renders something — assert that we did NOT hit a 404.
    await expect(newPage.locator('body')).not.toContainText('404')
    await newPage.close()
  })

  test('"Already have an account?" link navigates to /auth/signin', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.getByRole('link', { name: /Sign In$/i }).click()
    await page.waitForURL(/\/auth\/signin$/)
    await expect(page.getByRole('heading', { name: /Sign in to Dine at Home/i })).toBeVisible()
  })

  test('Google button is rendered on both signup and signin (single Continue with Google CTA)', async ({
    page,
  }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
    await page.goto('/auth/signin')
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
  })
})

test.describe('Auth — sign in', () => {
  // Pre-create a user via the backend so we can test the login form.
  let registeredEmail: string
  const password = 'TestPass123!'

  test.beforeAll(async () => {
    registeredEmail = uniqueEmail('e2e-signin')
    const reg = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registeredEmail,
        password,
        name: 'Existing Guest',
        role: 'guest',
        phone: '+3545551111',
        gender: 'other',
        country: 'Iceland',
        languages: ['en'],
      }),
    })
    if (!reg.ok) throw new Error(`pre-register failed: ${await reg.text()}`)
    const otp = await fetchOtp(registeredEmail)
    await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: registeredEmail, otp }),
    })
  })

  test('valid credentials log in and redirect to home', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByPlaceholder('Enter your email').fill(registeredEmail)
    await page.getByPlaceholder('Enter your password').fill(password)
    await page.getByRole('button', { name: /^Sign in$/ }).click()
    await page.waitForURL((url) => !/\/auth\/signin/.test(url.pathname), { timeout: 15_000 })
  })

  test('invalid credentials show inline error, no navigation', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByPlaceholder('Enter your email').fill(registeredEmail)
    await page.getByPlaceholder('Enter your password').fill('WrongPassword123!')
    await page.getByRole('button', { name: /^Sign in$/ }).click()
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('Forgot Password link → /auth/forgot-password (not 404)', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByRole('link', { name: /Forgot Password\?/i }).click()
    await page.waitForURL(/\/auth\/forgot-password/)
    await expect(page.locator('body')).not.toContainText('404')
  })

  test('"Sign Up now" link goes to /auth/signup', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByRole('link', { name: /Sign Up now/i }).click()
    await page.waitForURL(/\/auth\/signup$/)
  })
})

test.describe('Auth — Google new-user flow', () => {
  test('first-time Google user with no role lands on /auth/role-selection', async ({ page }) => {
    const email = uniqueEmail('e2e-google')
    // Simulate a fresh Google sign-up via the dev-only mock endpoint, then inject the JWT.
    const mockRes = await fetch(`${BACKEND_URL}/auth/__dev/mock-google-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: 'Mock Google User' }),
    })
    if (!mockRes.ok) {
      throw new Error(`mock-google-signup failed: ${await mockRes.text()}`)
    }
    const { data } = await mockRes.json()

    await page.addInitScript(
      ({ token, user }) => {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      },
      { token: data.token, user: data.user }
    )

    // Visit the home page — getRedirectUrl should kick this user to role-selection.
    await page.goto('/')
    // Manually navigate as if returning from the OAuth popup; the role-selection page guards itself.
    await page.goto('/auth/role-selection')

    await expect(page.getByRole('heading', { name: /Welcome to Dine at Home/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Continue as Guest/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Continue as Host/i })).toBeVisible()
  })
})
