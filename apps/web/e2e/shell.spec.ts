import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function stabilizeClock(page: Page) {
  const clock = page.getByText(/^\d{2}:\d{2}$/)
  await expect(clock).toBeVisible()
  await clock.evaluate((element) => {
    element.setAttribute('data-visual-clock', '12:56')
    element.style.color = 'transparent'
    element.style.position = 'relative'
  })
  await page.addStyleTag({
    content:
      '[data-visual-clock]::after { color: var(--lg-label-secondary); content: attr(data-visual-clock); inset: 0; position: absolute; }',
  })
}

async function waitForHydratedShell(page: Page) {
  await expect(page.getByRole('link', { name: 'arsam.net' })).toBeVisible()
}

test('desktop shell gerçek Glass Header ile render edilir', async ({
  page,
}) => {
  const hydrationMessages: string[] = []
  page.on('console', (message) => {
    if (
      (message.type() === 'warning' || message.type() === 'error') &&
      /hydration|server rendered|did not match/i.test(message.text())
    ) {
      hydrationMessages.push(message.text())
    }
  })

  await page.goto('/bolgeler')
  await waitForHydratedShell(page)

  await expect(page.getByRole('link', { name: 'arsam.net' })).toBeVisible()
  const headerTrigger = page.getByRole('button', { name: 'Hızlı gezinme' })
  const statusChip = page.getByLabel('Şu an: Anasayfa › Bölgeler')
  const statusReveal = statusChip.locator('..')
  await expect(statusReveal).toHaveAttribute('data-visible', 'false')
  await expect
    .poll(async () => (await headerTrigger.boundingBox())?.width ?? 0)
    .toBeLessThanOrEqual(265)

  await expect(page).toHaveScreenshot('shell-header-collapsed-desktop.png', {
    animations: 'allow',
    fullPage: true,
  })

  await headerTrigger.hover()
  await expect
    .poll(async () => (await headerTrigger.boundingBox())?.width ?? 0)
    .toBeGreaterThanOrEqual(490)
  await expect(statusReveal).toHaveAttribute('data-visible', 'true')
  await expect(statusChip).toBeVisible()
  const statusBreadcrumb = statusChip.locator(
    '[data-part="status-breadcrumb"]',
  )
  const statusLive = statusChip.locator('[data-part="status-live"]')
  const [headerBox, statusBox, breadcrumbBox, liveBox, brandBox] = await Promise.all([
    headerTrigger.boundingBox(),
    statusReveal.boundingBox(),
    statusBreadcrumb.boundingBox(),
    statusLive.boundingBox(),
    page.getByRole('link', { name: 'arsam.net' }).boundingBox(),
  ])
  expect(headerBox).not.toBeNull()
  expect(statusBox).not.toBeNull()
  expect(breadcrumbBox).not.toBeNull()
  expect(liveBox).not.toBeNull()
  expect(brandBox).not.toBeNull()
  expect(
    Math.abs(
      headerBox!.x +
        headerBox!.width / 2 -
        (statusBox!.x + statusBox!.width / 2),
    ),
  ).toBeLessThanOrEqual(1)
  expect(liveBox!.x - statusBox!.x).toBeLessThanOrEqual(20)
  expect(statusBox!.width - breadcrumbBox!.width).toBeLessThanOrEqual(100)
  expect(statusBox!.x).toBeGreaterThanOrEqual(brandBox!.x + brandBox!.width)
  const headerSurface = headerTrigger.locator(
    'xpath=ancestor::*[@data-material][1]',
  )
  await expect
    .poll(() =>
      headerSurface.evaluate((element) => {
        const style = window.getComputedStyle(element)
        return style.backdropFilter || style.webkitBackdropFilter
      }),
    )
    .toContain('blur(')
  await expect(headerSurface.locator('filter')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Bölgeler' })).toBeVisible()
  await stabilizeClock(page)

  await expect(headerSurface).toHaveScreenshot('shell-header-hover-desktop.png', {
    animations: 'allow',
  })

  const accessibility = await new AxeBuilder({ page }).analyze()
  const blockingViolations = accessibility.violations.filter(
    (violation) =>
      violation.impact === 'critical' || violation.impact === 'serious',
  )
  expect(blockingViolations).toEqual([])
  expect(hydrationMessages).toEqual([])
})



test('uzun header yolu ortada kalır ve ara basamakları üç noktayla sıkıştırır', async ({
  page,
}) => {
  await page.goto('/hesabim/mesajlar')
  await waitForHydratedShell(page)

  const headerTrigger = page.getByRole('button', { name: 'Hızlı gezinme' })
  await expect(headerTrigger).toBeVisible()
  await headerTrigger.hover()
  await expect
    .poll(async () => (await headerTrigger.boundingBox())?.width ?? 0)
    .toBeGreaterThanOrEqual(490)

  const statusChip = page.getByLabel(
    'Şu an: Anasayfa › Hesabım › Mesajlar',
  )
  const statusReveal = statusChip.locator('..')
  await expect(statusReveal).toHaveAttribute('data-visible', 'true')
  await expect(statusChip.getByText('…')).toBeVisible()
  await expect(statusChip.getByText('Hesabım', { exact: true })).toHaveCount(0)

  const statusBreadcrumb = statusChip.locator(
    '[data-part="status-breadcrumb"]',
  )
  const statusLive = statusChip.locator('[data-part="status-live"]')
  const [headerBox, statusBox, breadcrumbBox, liveBox, brandBox] = await Promise.all([
    headerTrigger.boundingBox(),
    statusReveal.boundingBox(),
    statusBreadcrumb.boundingBox(),
    statusLive.boundingBox(),
    page.getByRole('link', { name: 'arsam.net' }).boundingBox(),
  ])
  expect(headerBox).not.toBeNull()
  expect(statusBox).not.toBeNull()
  expect(breadcrumbBox).not.toBeNull()
  expect(liveBox).not.toBeNull()
  expect(brandBox).not.toBeNull()
  expect(
    Math.abs(
      headerBox!.x +
        headerBox!.width / 2 -
        (statusBox!.x + statusBox!.width / 2),
    ),
  ).toBeLessThanOrEqual(1)
  expect(liveBox!.x - statusBox!.x).toBeLessThanOrEqual(20)
  expect(statusBox!.x).toBeGreaterThanOrEqual(brandBox!.x + brandBox!.width)
})

test.describe('hareket tercihi açıkken header morph’u', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('kapalı ve hover genişlikleri arasında akıcı ara kare üretir', async ({
    page,
  }) => {
    await page.goto('/bolgeler')
    await waitForHydratedShell(page)
    const headerTrigger = page.getByRole('button', { name: 'Hızlı gezinme' })
    await expect(headerTrigger).toBeVisible()
    await expect
      .poll(async () => (await headerTrigger.boundingBox())?.width ?? 0)
      .toBeLessThanOrEqual(265)

    const collapsedBox = await headerTrigger.boundingBox()
    expect(collapsedBox).not.toBeNull()
    const collapsedCenter =
      collapsedBox!.x + collapsedBox!.width / 2
    await page.mouse.move(
      collapsedCenter,
      collapsedBox!.y + collapsedBox!.height / 2,
    )
    const samples: Array<{ center: number; width: number }> = []
    for (let index = 0; index < 6; index += 1) {
      const sample = await headerTrigger.boundingBox()
      samples.push({
        center: sample ? sample.x + sample.width / 2 : 0,
        width: sample?.width ?? 0,
      })
      await page.waitForTimeout(25)
    }
    expect(
      samples.some(({ width }) => width > 265 && width < 549),
    ).toBe(true)
    for (const { center } of samples) {
      expect(Math.abs(center - collapsedCenter)).toBeLessThanOrEqual(1)
    }
    await expect
      .poll(async () => (await headerTrigger.boundingBox())?.width ?? 0)
      .toBeGreaterThanOrEqual(549)
  })
})

test('Header açılır paneli ve progressive navigation çalışır', async ({
  page,
}) => {
  await page.goto('/bolgeler')
  await waitForHydratedShell(page)
  const headerTrigger = page.getByRole('button', { name: 'Hızlı gezinme' })
  await headerTrigger.hover()
  await expect
    .poll(async () => (await headerTrigger.boundingBox())?.width ?? 0)
    .toBeGreaterThanOrEqual(540)
  await headerTrigger.click()

  const dialog = page.getByRole('dialog', {
    name: 'Nereye gitmek istersin?',
  })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-modal', 'true')
  const closeButton = dialog.getByRole('button', { name: 'Kapat' })
  await expect(closeButton).toBeFocused()
  await expect(dialog.getByRole('link', { name: 'Arsa ara' })).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Ofisler' })).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Bölgeler' })).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Blog' })).toBeVisible()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Ara' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(closeButton).toBeFocused()
  await stabilizeClock(page)

  await expect(page).toHaveScreenshot('shell-header-open-desktop.png', {
    fullPage: true,
  })

  const accessibility = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .analyze()
  expect(
    accessibility.violations.filter(
      (violation) =>
        violation.impact === 'critical' || violation.impact === 'serious',
    ),
  ).toEqual([])

  const main = page.locator('main')
  const previousMinHeight = await main.evaluate((element) => {
    const value = element.style.minHeight
    element.style.minHeight = '3000px'
    return value
  })
  const scrollBefore = await page.evaluate(() => window.scrollY)
  await page.mouse.move(20, 400)
  await page.mouse.wheel(0, 600)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBe(scrollBefore)
  await main.evaluate((element, value) => {
    element.style.minHeight = value
  }, previousMinHeight)

  await dialog.getByRole('link', { name: 'Ofisler' }).click()
  await expect(page).toHaveURL(/\/ofisler$/)
  await expect(
    page.getByRole('heading', { name: 'Emlak ofisleri' }),
  ).toBeVisible()
})


test('tablet ve en dar mobil görünüm yatay taşma üretmez', async ({ page }) => {
  await page.setViewportSize({ width: 784, height: 539 })
  await page.goto('/bolgeler')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(784)

  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/hesabim/mesajlar')
  await expect(page.getByRole('link', { name: 'arsam.net' })).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320)
})

