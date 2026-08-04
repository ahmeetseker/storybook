import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function stabilizeClock(page: Page) {
  const clock = page.getByText(/^\d{2}:\d{2}$/)
  if (!(await clock.isVisible())) return

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

/**
 * Hesap panosu kendi kabuğunu kurar: pazar yeri header'ı ve dock'u bu rotada
 * render edilmez, gezinme sol raydan ve üst şeritten gelir.
 */
async function waitForAccountShell(page: Page) {
  await expect(
    page.getByRole('navigation', { name: 'Hesap bölümleri' }),
  ).toBeVisible()
  await expect(page.locator('.shell-dock-variant')).toHaveCount(0)
  await expect(
    page.getByRole('navigation', { name: 'Ana gezinme' }),
  ).toHaveCount(0)
}

async function expectNoBlockingAxeViolations(page: Page) {
  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(
    accessibility.violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    ),
  ).toEqual([])
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true)
}

test('hesap merkezi masaüstünde erişilebilir ve cam bütçesine uyar', async ({
  page,
}) => {
  await page.goto('/hesabim')
  await waitForAccountShell(page)

  await expect(page.getByRole('heading', { name: 'Hesabım' })).toBeVisible()
  await expectNoBlockingAxeViolations(page)
  expect(
    await page.locator('main#main-content [data-material="glass"]').count(),
  ).toBeLessThanOrEqual(1)

  // Ray daraltılıp genişletilebilir; daraltılmışken erişilebilir adlar korunur
  const railToggle = page.getByRole('button', {
    name: 'Kenar çubuğunu daralt',
  })
  await railToggle.click()
  await expect(
    page.getByRole('button', { name: 'Kenar çubuğunu genişlet' }),
  ).toBeVisible()
  await expect(
    page
      .getByRole('navigation', { name: 'Hesap bölümleri' })
      .getByRole('button', { name: /Hesap özeti/ }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Kenar çubuğunu genişlet' }).click()

  expect(await page.locator('[data-variant="primary"]').count()).toBe(1)
  await expectNoHorizontalOverflow(page)
  await stabilizeClock(page)

  await expect(page).toHaveScreenshot('account-desktop.png', {
    fullPage: true,
  })
})

test('hesap merkezi mobilde bölümleri DOM sırası ile sunar ve gezinme çekmeceden gelir', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/hesabim')
  await waitForAccountShell(page)

  // Dar ekranda ray gizlidir; gezinme "Hesap menüsü" düğmesiyle açılan çekmecededir
  const menuButton = page.getByRole('button', { name: 'Hesap menüsünü aç' })
  await expect(menuButton).toBeVisible()
  await menuButton.click()
  const drawer = page.getByRole('dialog', { name: 'Hesabım' })
  await expect(drawer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)

  await expect(page.getByRole('heading', { name: 'Hesabım' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
  const sectionOrder = await page
    .locator('main#main-content [data-account-section]')
    .evaluateAll((sections) =>
      sections.map((section) => section.getAttribute('data-account-section')),
    )
  expect(sectionOrder).toEqual([
    'identity',
    'attention',
    'metrics',
    'listings',
    'security',
    'activity',
    'saved-search',
  ])

  const lastAccountLink = page.locator('main#main-content a').last()
  let focusedLastAccountLink = false
  for (let tabCount = 0; tabCount < 64; tabCount += 1) {
    await page.keyboard.press('Tab')
    if (await lastAccountLink.isFocused()) {
      focusedLastAccountLink = true
      break
    }
  }
  expect(
    focusedLastAccountLink,
    'Tab sırası son hesap bağlantısına ulaşmalı',
  ).toBe(true)
  await expect(lastAccountLink).toBeFocused()
  // Yüzen dock kalktığı için son odak viewport içinde ve kesilmeden görünür
  const lastFocusBox = await lastAccountLink.boundingBox()
  expect(lastFocusBox).not.toBeNull()
  const viewportHeight = page.viewportSize()!.height
  expect(lastFocusBox!.y + lastFocusBox!.height).toBeLessThanOrEqual(
    viewportHeight,
  )
  await stabilizeClock(page)

  await expect(page).toHaveScreenshot('account-mobile.png', {
    fullPage: true,
  })
})

test('hareket azaltıldığında hesap aksiyonları geçişsiz kalır', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/hesabim')
  await waitForAccountShell(page)

  expect(
    await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  ).toBe(true)
  const accountActions = page.locator('main#main-content [data-variant]')
  expect(await accountActions.count()).toBeGreaterThan(0)
  const transitionDurations = await page
    .locator('main#main-content [data-variant]')
    .evaluateAll((elements) =>
      elements.map(
        (element) => window.getComputedStyle(element).transitionDuration,
      ),
    )
  expect(transitionDurations.every((duration) => duration === '0s')).toBe(true)
})
