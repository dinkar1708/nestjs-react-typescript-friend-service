import { test, expect, request } from '@playwright/test'

const API_BASE = process.env.VITE_API_URL || 'http://localhost:4000/api/v1'
const DEMO_EMAIL = 'demo@nestconnect.dev'
const DEMO_PASSWORD = 'demopass123'
const DEMO_NAME = 'Demo'

test.describe('demo login against LIVE backend', () => {
  test.beforeAll(async () => {
    const api = await request.newContext()
    let apiUp = false
    for (let i = 0; i < 5; i++) {
      try {
        const res = await api.get(`${API_BASE}/friends`, { timeout: 2_000 })
        if (res.status() === 401 || res.status() === 200) {
          apiUp = true
          break
        }
      } catch {
        // retry
      }
      await new Promise((r) => setTimeout(r, 1_000))
    }

    test.skip(
      !apiUp,
      `Backend API not reachable at ${API_BASE}. Start it with:\n  cd backend-api && npm run start:dev`,
    )

    const signup = await api.post(`${API_BASE}/auth/signup`, {
      data: {
        name: DEMO_NAME,
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      },
    })
    const ok = signup.status() === 201 || signup.status() === 409
    expect(
      ok,
      `Signup returned ${signup.status()}: ${await signup.text()}`,
    ).toBe(true)
    await api.dispose()
  })

  test('Fill demo login (dev) hits real backend and lands on Home', async ({
    page,
  }) => {
    const signinRequestPromise = page.waitForRequest(
      (req) =>
        req.url().includes('/auth/signin') && req.method() === 'POST',
    )
    const signinResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('/auth/signin') && res.request().method() === 'POST',
    )

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible({
      timeout: 10_000,
    })

    await page.getByRole('button', { name: /Fill demo login \(dev\)/ }).click()

    const signinReq = await signinRequestPromise
    expect(signinReq.postDataJSON()).toEqual({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    const signinRes = await signinResponsePromise
    expect(
      signinRes.status(),
      'signin should succeed against live backend',
    ).toBeLessThan(300)

    const body = await signinRes.json()
    expect(body.user.email).toBe(DEMO_EMAIL)
    expect(typeof body.accessToken).toBe('string')
    expect(body.accessToken.length).toBeGreaterThan(20)

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
      timeout: 10_000,
    })

    const token = await page.evaluate(() =>
      localStorage.getItem('nestconnect_access_token'),
    )
    expect(token).toBe(body.accessToken)
  })
})
