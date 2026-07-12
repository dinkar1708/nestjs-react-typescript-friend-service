import { test, expect } from '@playwright/test'

const DEMO_EMAIL = 'demo@nestconnect.dev'
const DEMO_PASSWORD = 'demopass123'

const FAKE_AUTH_RESPONSE = {
  user: {
    id: 'demo-user-id',
    name: 'Demo User',
    email: DEMO_EMAIL,
  },
  accessToken: 'fake-access-token',
  refreshToken: 'fake-refresh-token',
}

test('Fill demo login (dev) button appears, populates fields, submits, lands on Home', async ({
  page,
}) => {
  let signinBody: { email?: string; password?: string } | undefined

  await page.route('**/api/v1/auth/signin', async (route) => {
    signinBody = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_AUTH_RESPONSE),
    })
  })

  await page.route('**/api/v1/friends**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.goto('/')

  // Splash auto-forwards to login after ~2s
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible({
    timeout: 10_000,
  })

  const demoBtn = page.getByRole('button', { name: /Fill demo login \(dev\)/ })
  await expect(demoBtn).toBeVisible()

  const emailInput = page.getByRole('textbox', { name: 'Email' })
  const passwordInput = page.locator('input[type="password"]')
  await expect(emailInput).toHaveValue('')
  await expect(passwordInput).toHaveValue('')

  await demoBtn.click()

  await expect(emailInput).toHaveValue(DEMO_EMAIL)
  await expect(passwordInput).toHaveValue(DEMO_PASSWORD)

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({
    timeout: 10_000,
  })

  expect(signinBody).toEqual({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })

  const token = await page.evaluate(() =>
    localStorage.getItem('nestconnect_access_token'),
  )
  expect(token).toBe(FAKE_AUTH_RESPONSE.accessToken)
})

test('demo login shows error banner when API rejects', async ({ page }) => {
  await page.route('**/api/v1/auth/signin', (route) => {
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid credentials' }),
    })
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible({
    timeout: 10_000,
  })

  await page.getByRole('button', { name: /Fill demo login \(dev\)/ }).click()

  await expect(page.locator('.auth-error')).toContainText('Invalid credentials')
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible()
})
