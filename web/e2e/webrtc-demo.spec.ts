import { test, expect } from '@playwright/test'

const FAKE_USER = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
}
const FAKE_TOKEN = 'fake-jwt-for-e2e'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ user, token }) => {
      localStorage.setItem('nestconnect_access_token', token)
      localStorage.setItem('nestconnect_refresh_token', token)
      localStorage.setItem('nestconnect_user', JSON.stringify(user))
    },
    { user: FAKE_USER, token: FAKE_TOKEN },
  )

  await page.route('**/api/v1/friends**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })
})

test('WebRTC loopback demo: getUserMedia → offer/answer → connected', async ({
  page,
}) => {
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('[webrtc-demo]')) {
      console.log('  ' + text)
    }
  })

  await page.goto('/')

  const dashboard = page.getByRole('heading', { name: 'Dashboard' })
  await expect(dashboard).toBeVisible({ timeout: 10_000 })

  await page.getByRole('button', { name: 'WebRTC Demo' }).click()
  await expect(
    page.getByRole('heading', { name: 'WebRTC Demo' }),
  ).toBeVisible()

  await expect(page.locator('.rtc-phase')).toHaveText('idle')

  await page.getByRole('button', { name: '1. Start camera' }).click()

  await expect(page.locator('.rtc-phase')).toHaveText('ready', {
    timeout: 10_000,
  })

  await page.getByRole('button', { name: '2. Connect peers' }).click()

  await expect(page.locator('.rtc-phase')).toHaveText('connected', {
    timeout: 15_000,
  })

  const log = page.locator('.rtc-log-body')
  await expect(log).toContainText('getUserMedia')
  await expect(log).toContainText('pc1.createOffer')
  await expect(log).toContainText('pc2.createAnswer')
  await expect(log).toContainText('SDP offer:')
  await expect(log).toContainText('SDP answer:')
  await expect(log).toContainText('ICE:')
  await expect(log).toContainText('pc1 state: connected')

  const remoteVideo = page.locator('.rtc-video-wrap').nth(1).locator('video')
  await expect(remoteVideo).toHaveJSProperty('readyState', 4, {
    timeout: 10_000,
  })

  await page.getByRole('button', { name: 'Hang up' }).click()
  await expect(page.locator('.rtc-phase')).toHaveText('ended')
})

test('mute mic and camera toggles use track.enabled', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Dashboard' }),
  ).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: 'WebRTC Demo' }).click()

  await page.getByRole('button', { name: '1. Start camera' }).click()
  await expect(page.locator('.rtc-phase')).toHaveText('ready')
  await page.getByRole('button', { name: '2. Connect peers' }).click()
  await expect(page.locator('.rtc-phase')).toHaveText('connected', {
    timeout: 15_000,
  })

  await page.getByRole('button', { name: 'Mute mic' }).click()
  await expect(page.getByRole('button', { name: 'Unmute mic' })).toBeVisible()

  await page.getByRole('button', { name: 'Camera off' }).click()
  await expect(page.getByRole('button', { name: 'Camera on' })).toBeVisible()
})
