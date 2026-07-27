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
  await expect(page.locator('.shell-dock-variant')).toHaveCount(1)
}

test('desktop shell gerçek Glass Header ve Dock ile render edilir', async ({
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
  await expect(
    page.getByRole('navigation', { name: 'Ana gezinme' }).getByRole('link'),
  ).toHaveCount(10)
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

test('desktop Dock public-site LiquidDock büyütmesini ve Header camını kullanır', async ({
  page,
}) => {
  await page.goto('/bolgeler')
  await waitForHydratedShell(page)

  const dock = page.getByRole('navigation', { name: 'Ana gezinme' })
  await expect(dock).toHaveAttribute('data-behavior', 'fixed')
  await expect(dock.getByText('Şirket', { exact: true })).toHaveCount(0)
  await expect(dock.getByText('Hesap', { exact: true })).toHaveCount(0)

  const items = dock.getByRole('link')
  await expect(items).toHaveCount(10)
  const dockSurface = dock.locator('[data-material="glass"]')
  const headerSurface = page
    .getByRole('button', { name: 'Hızlı gezinme' })
    .locator('xpath=ancestor::*[@data-material][1]')
  const [dockBackdrop, headerBackdrop] = await Promise.all([
    dockSurface.evaluate((element) => {
      const style = window.getComputedStyle(element)
      return style.backdropFilter || style.webkitBackdropFilter
    }),
    headerSurface.evaluate((element) => {
      const style = window.getComputedStyle(element)
      return style.backdropFilter || style.webkitBackdropFilter
    }),
  ])
  expect(dockBackdrop).toBe(headerBackdrop)

  const beforeDock = await dock.boundingBox()
  const beforeItems = await Promise.all(
    Array.from({ length: 10 }, (_, index) => items.nth(index).boundingBox()),
  )
  const initialLens = dock.locator('[data-lq-lens="edge"]')
  await expect(initialLens).toHaveCount(1)

  await items.nth(1).hover()
  await expect
    .poll(async () => (await items.nth(1).boundingBox())?.width ?? 0)
    .toBeGreaterThan(55)
  await expect(
    items.nth(1).locator('[data-part="tooltip"]'),
  ).toBeVisible()

  const afterDock = await dock.boundingBox()
  const afterItems = await Promise.all(
    Array.from({ length: 10 }, (_, index) => items.nth(index).boundingBox()),
  )
  const afterLens = await initialLens.boundingBox()

  expect(beforeDock).not.toBeNull()
  expect(afterDock).not.toBeNull()
  const beforeCenter = beforeDock!.x + beforeDock!.width / 2
  const afterCenter = afterDock!.x + afterDock!.width / 2
  expect(Math.abs(afterCenter - beforeCenter)).toBeLessThanOrEqual(0.5)
  expect(afterDock!.width).toBeGreaterThan(beforeDock!.width)
  expect(beforeItems[1]?.width).toBeCloseTo(38, 0)
  expect(afterItems[1]?.width).toBeGreaterThan(55)
  expect(afterItems[0]?.width).toBeGreaterThan(38)
  expect(afterItems[0]?.width).toBeLessThan(afterItems[1]!.width)
  expect(afterLens).not.toBeNull()
  expect(afterLens!.x).toBeCloseTo(afterItems[1]!.x, 0)
  expect(afterLens!.y).toBeCloseTo(afterItems[1]!.y, 0)
  expect(afterLens!.width).toBeCloseTo(afterItems[1]!.width, 0)
  expect(afterLens!.height).toBeCloseTo(afterItems[1]!.height, 0)
  await expect(initialLens).toHaveCSS(
    'backdrop-filter',
    /blur\(6px\) saturate\(1\.8\)/,
  )

  await items.nth(0).focus()
  await expect(dock.locator('[data-part="tooltip"]')).toHaveCount(1)
  await expect(
    items.nth(0).locator('[data-part="tooltip"]'),
  ).toBeVisible()
  await items.nth(0).evaluate((element) => element.blur())

  await page.mouse.move(20, 250)
  await expect
    .poll(async () => (await items.nth(1).boundingBox())?.width ?? 0)
    .toBeLessThanOrEqual(38.5)
  await expect
    .poll(async () => (await dock.boundingBox())?.width ?? 0)
    .toBeLessThanOrEqual(beforeDock!.width + 0.5)
  await expect(dock).toBeVisible()
})

test('hareket azaltıldığında Dock tooltip kalırken 1x taban ölçüsünde durur', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/bolgeler')
  await waitForHydratedShell(page)
  expect(
    await page.evaluate(() =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  ).toBe(true)
  const dock = page.getByRole('navigation', { name: 'Ana gezinme' })
  const search = dock.getByRole('link', { name: 'Arama' })

  await search.hover()
  await page.waitForTimeout(250)

  const box = await search.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeLessThanOrEqual(38.5)
  await expect(search.locator('[data-part="tooltip"]')).toBeVisible()
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

test.describe('dokunmatik mobil shell', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })

  test('beş öncelikli Dock hedefi ve sürekli durum chip’i gösterir', async ({
    page,
  }) => {
    await page.goto('/ai-danisman')

    const status = page.getByLabel('Şu an: Anasayfa › AI danışman')
    await expect(status).toBeVisible()
    await expect(status.locator('..')).toHaveAttribute('data-visible', 'true')
    await expect(
      page.getByRole('navigation', { name: 'Ana gezinme' }).getByRole('link'),
    ).toHaveCount(5)
    const mobileDock = page.getByRole('navigation', { name: 'Ana gezinme' })
    const firstDockItem = mobileDock.getByRole('link').first()
    await mobileDock
      .locator('[data-part="track"]')
      .dispatchEvent('mousemove', { clientX: 19, clientY: 19 })
    await page.waitForTimeout(100)
    await expect(firstDockItem).toHaveAttribute(
      'data-magnification-scale',
      '1.000',
    )
    await expect(mobileDock.locator('[data-part="tooltip"]')).toHaveCount(0)
    await stabilizeClock(page)

    await expect(page).toHaveScreenshot('shell-mobile.png', {
      fullPage: true,
    })
  })
})

test('tablet ve en dar mobil görünüm yatay taşma üretmez', async ({ page }) => {
  await page.setViewportSize({ width: 784, height: 539 })
  await page.goto('/bolgeler')
  await expect(
    page.getByRole('navigation', { name: 'Ana gezinme' }).getByRole('link'),
  ).toHaveCount(8)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(784)

  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/hesabim/mesajlar')
  await expect(page.getByRole('link', { name: 'arsam.net' })).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Ana gezinme' }).getByRole('link'),
  ).toHaveCount(5)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320)
})

test('JavaScript olmadan SSR responsive Dock ve native linkler çalışır', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  try {
    await page.goto('/ai-danisman')
    await expect(
      page.getByLabel('Şu an: Anasayfa › AI danışman'),
    ).toBeVisible()
    const ssrStatusReveal = page
      .getByLabel('Şu an: Anasayfa › AI danışman')
      .locator('..')
    await expect(ssrStatusReveal).toHaveCSS('opacity', '1')
    await expect
      .poll(async () => (await ssrStatusReveal.boundingBox())?.width ?? 0)
      .toBeGreaterThan(100)
    await expect(
      page.getByRole('navigation', { name: 'Ana gezinme' }).getByRole('link'),
    ).toHaveCount(5)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390)

    await page
      .getByRole('navigation', { name: 'Ana gezinme' })
      .getByRole('link', { name: 'Arama' })
      .click()
    await expect(page).toHaveURL(/\/arsa-ara$/)
    await expect(page.getByRole('heading', { name: 'Arsa ara' })).toBeVisible()

    await page.setViewportSize({ width: 784, height: 539 })
    await expect(
      page.getByRole('navigation', { name: 'Ana gezinme' }).getByRole('link'),
    ).toHaveCount(8)

    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(
      page.getByRole('navigation', { name: 'Ana gezinme' }).getByRole('link'),
    ).toHaveCount(10)
  } finally {
    await context.close()
  }
})
