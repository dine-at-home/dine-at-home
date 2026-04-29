/**
 * Admin-panel probe: log into the admin (port 3002) as a seeded admin user, navigate every
 * new payout/transaction/log page, and assert no JS errors and the right UI rendered.
 *
 * Prerequisites (handled by the harness):
 *  - Backend running on :3001
 *  - Admin panel running on :3002
 *  - An admin user seeded via backend/src/scripts/seed-admin-and-token.ts
 *
 * The spec injects the JWT directly into the admin's localStorage (`admin_token` /
 * `admin_user`) so we don't need to drive the email/password login form.
 */
import { test, expect, Page, ConsoleMessage } from '@playwright/test'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3002'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001/api'

interface Seed {
  adminId: string
  email: string
  token: string
}

let seed: Seed

test.beforeAll(() => {
  // Run the backend's seed-admin-and-token helper. It prints JSON to stdout.
  // Use import.meta.url (ESM) — falling back to cwd-relative if needed.
  let backendDir: string
  try {
    const here = path.dirname(fileURLToPath(import.meta.url))
    backendDir = path.resolve(here, '../../backend')
  } catch {
    backendDir = path.resolve(process.cwd(), '../backend')
  }
  const out = execSync('npx tsx src/scripts/seed-admin-and-token.ts', {
    cwd: backendDir,
    encoding: 'utf8',
    env: { ...process.env, ADMIN_EMAIL: 'admin-e2e@datthome.test' },
  })
  // The helper writes informational lines to stderr and the JSON line to stdout.
  // Take the last non-empty line of stdout, which is the JSON payload.
  const lines = out.trim().split('\n').filter(Boolean)
  const jsonLine = lines[lines.length - 1]
  seed = JSON.parse(jsonLine)
})

const consoleErrors: string[] = []

async function authenticateAdmin(page: Page) {
  consoleErrors.length = 0
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err: Error) => {
    consoleErrors.push(`pageerror: ${err.message}`)
  })

  await page.addInitScript(
    ({ token, email, adminId }) => {
      localStorage.setItem('admin_token', token)
      localStorage.setItem(
        'admin_user',
        JSON.stringify({ id: adminId, email, role: 'admin' })
      )
    },
    seed
  )
}

test.describe('Admin payout & transaction UI probe', () => {
  test('overview, transactions, payouts, logs all render', async ({ page }) => {
    test.setTimeout(300_000) // Next.js dev compiles each new route lazily — be patient.

    // Detect a stale admin server: if the build was rebuilt while `next start` was already
    // running, the in-memory build manifest references chunk hashes that no longer exist
    // on disk and every page renders blank. Skip with a clear message so the user knows
    // to restart the admin server, instead of a confusing "selector not found" failure.
    const failures: string[] = []
    page.on('response', (r) => {
      if (r.status() === 404 && r.url().includes('/_next/static/')) failures.push(r.url())
    })
    await authenticateAdmin(page)

    // The admin layout renders the sidebar (with our new "Audit log" nav item) on every
    // dashboard route. Asserting that proves auth worked + the route mounted, even when
    // page-level fetches are still in flight.
    const expectAdminShell = async (route: string) => {
      // Next.js dev compiles new routes on first request — bump goto timeout accordingly.
      await page.goto(`${ADMIN_URL}${route}`, {
        waitUntil: 'load',
        timeout: 45_000,
      })
      const tokenSeen = await page.evaluate(() => localStorage.getItem('admin_token'))
      expect(tokenSeen, `localStorage admin_token should be set on ${route}`).toBeTruthy()
      expect(
        page.url(),
        `should not be redirected to /login on ${route}`
      ).not.toContain('/login')
      // Wait for React to hydrate and the layout's sidebar to mount.
      await expect(page.locator('aside')).toBeVisible({ timeout: 30_000 })
    }

    // Navigate the first page; if static chunks 404, the admin server is stale — skip the
    // rest of the suite with a clear message rather than spamming "element not found".
    await page.goto(`${ADMIN_URL}/dashboard`, { waitUntil: 'load', timeout: 45_000 })
    await page.waitForTimeout(1500)
    if (failures.length > 0) {
      test.skip(
        true,
        `Admin server (\`next start\` on :3002) is serving stale chunks (404s on ${failures[0]}). ` +
          `Run \`npm run build && pkill -f "next-server" && npm start\` in admin-panel-datthome ` +
          `to refresh, then re-run this spec.`
      )
      return
    }

    await expectAdminShell('/dashboard')
    await expectAdminShell('/dashboard/transactions')
    await expectAdminShell('/dashboard/payouts')
    await expectAdminShell('/dashboard/logs')
    await expectAdminShell('/dashboard/users')
    await expectAdminShell('/dashboard/dinners')
    await expectAdminShell('/dashboard/bookings')

    // Filter out the noisy "Failed to fetch" caused by transient backend hiccups during
    // navigation; we only care about real React/JS errors.
    const realErrors = consoleErrors.filter(
      (e) => !/Failed to fetch|NetworkError|AbortError/i.test(e)
    )
    expect(realErrors, 'no React/JS errors during navigation').toEqual([])
  })

  test('admin endpoints are protected (401) without token, allow with token', async () => {
    // No token → 401 across all new admin endpoints
    const noAuth = async (path: string, method: 'GET' | 'POST' = 'GET'): Promise<number> => {
      const res = await fetch(`${BACKEND_URL}${path}`, { method })
      return res.status
    }
    expect(await noAuth('/admin/logs')).toBe(401)
    expect(await noAuth('/admin/transactions/all')).toBe(401)
    expect(await noAuth('/admin/payouts/limits')).toBe(401)
    expect(await noAuth('/admin/payouts/eligible')).toBe(401)
    expect(
      await noAuth('/admin/payouts/000000000000000000000000/disburse', 'POST')
    ).toBe(401)
    expect(
      await noAuth('/admin/transactions/000000000000000000000000/refund', 'POST')
    ).toBe(401)

    // With admin token → 200 for list endpoints
    const auth = async (path: string): Promise<{ status: number; body: unknown }> => {
      const res = await fetch(`${BACKEND_URL}${path}`, {
        headers: { Authorization: `Bearer ${seed.token}` },
      })
      const body = await res.json().catch(() => ({}))
      return { status: res.status, body }
    }
    const logs = await auth('/admin/logs')
    expect(logs.status).toBe(200)

    const txns = await auth('/admin/transactions/all')
    expect(txns.status).toBe(200)

    const limits = await auth('/admin/payouts/limits')
    expect(limits.status).toBe(200)

    const eligible = await auth('/admin/payouts/eligible')
    expect(eligible.status).toBe(200)
  })

  test('mutating endpoints validate input', async () => {
    const post = async (path: string, body: unknown): Promise<{ status: number; body: { error?: string } }> => {
      const res = await fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${seed.token}`,
        },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => ({}))
      return { status: res.status, body: json as { error?: string } }
    }

    // Bad ObjectId → 400 BAD_REQUEST (not 500)
    const badId = await post('/admin/payouts/not-an-id/hold', { reason: 'test' })
    expect(badId.status).toBe(400)
    expect(badId.body.error).toMatch(/Invalid|payoutId/i)

    // Missing reason → 400
    const missingReason = await post(
      '/admin/payouts/000000000000000000000000/hold',
      {}
    )
    expect(missingReason.status).toBe(400)
    expect(missingReason.body.error).toMatch(/reason/i)

    // Refund with no reason → 400
    const refundNoReason = await post(
      '/admin/transactions/000000000000000000000000/refund',
      { amount: 100 }
    )
    expect(refundNoReason.status).toBe(400)
    expect(refundNoReason.body.error).toMatch(/reason/i)

    // Refund with NaN amount → 400 (after our fix)
    const refundNaN = await post(
      '/admin/transactions/000000000000000000000000/refund',
      { amount: 'not-a-number', reason: 'testing input' }
    )
    expect(refundNaN.status).toBe(400)
    expect(refundNaN.body.error).toMatch(/amount|positive/i)

    // Refund with negative amount → 400
    const refundNeg = await post(
      '/admin/transactions/000000000000000000000000/refund',
      { amount: -50, reason: 'testing input' }
    )
    expect(refundNeg.status).toBe(400)
    expect(refundNeg.body.error).toMatch(/amount|positive/i)

    // Refund 0 amount → 400
    const refundZero = await post(
      '/admin/transactions/000000000000000000000000/refund',
      { amount: 0, reason: 'testing input' }
    )
    expect(refundZero.status).toBe(400)

    // Cancel booking with bad id → 400
    const cancelBad = await post(
      '/admin/bookings/not-an-id/cancel',
      { reason: 'testing' }
    )
    expect(cancelBad.status).toBe(400)
  })

  test('audit log records admin batch run', async () => {
    // Trigger the payout batch (idempotent — logs an admin action even if no payouts were created).
    const runRes = await fetch(`${BACKEND_URL}/admin/payouts/run-batch`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seed.token}` },
    })
    expect(runRes.status).toBe(200)

    // Verify a corresponding audit log entry exists.
    const logsRes = await fetch(`${BACKEND_URL}/admin/logs?action=payout.batch_run&limit=5`, {
      headers: { Authorization: `Bearer ${seed.token}` },
    })
    const logs = (await logsRes.json()) as {
      data?: Array<{ action: string; actorType: string; actorId?: string }>
    }
    expect(logs.data?.length || 0).toBeGreaterThan(0)
    const latest = logs.data![0]
    expect(latest.action).toBe('payout.batch_run')
    expect(latest.actorType).toBe('ADMIN')
    expect(latest.actorId).toBe(seed.adminId)
  })
})
