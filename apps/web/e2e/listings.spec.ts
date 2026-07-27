import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('enterprise emlak araması filtreleri URL ile senkronize eder', async ({
  page,
}) => {
  await page.goto('/emlak')

  await expect(
    page.getByRole('heading', { name: 'Tüm Emlak', level: 1 }),
  ).toBeVisible()
  await expect(page.getByRole('article', { name: /ilanı$/ })).toHaveCount(24)

  await page
    .getByRole('checkbox', { name: 'Yalnız doğrulanmış ilanlar' })
    .check()

  await expect(page).toHaveURL(/verified=1/)
  await expect(page.getByText('Doğrulanmış', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: '48 ilan' })).toBeVisible()
})

test('eski arsa arama adresi arsa seçili emlak rotasına yönlenir', async ({
  page,
}) => {
  await page.goto('/arsa-ara')

  await expect(page).toHaveURL(/\/emlak\?category=land/)
  await expect(
    page.getByRole('heading', { name: 'Arsa', level: 1 }),
  ).toBeVisible()
  await expect(page.getByText('İmar ve tapu').first()).toBeVisible()
})

test('mobil filtre drawer değişiklikleri Uygula aksiyonuna kadar taslakta tutar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/emlak')

  await page.getByRole('button', { name: 'Filtreleri aç' }).click()
  const dialog = page.getByRole('dialog', { name: 'Emlak filtreleri' })
  await expect(dialog).toBeVisible()

  await dialog
    .getByRole('checkbox', { name: 'Yalnız doğrulanmış ilanlar' })
    .check()
  await expect(page).not.toHaveURL(/verified=1/)

  await dialog.getByRole('button', { name: /ilanı göster$/ }).click()
  await expect(page).toHaveURL(/verified=1/)
  await expect(dialog).toBeHidden()
})

test('emlak aramasında ciddi erişilebilirlik ihlali yoktur', async ({ page }) => {
  await page.goto('/emlak?category=land&map=split')
  await expect(page.getByRole('heading', { name: 'Arsa' })).toBeVisible()

  const accessibility = await new AxeBuilder({ page }).analyze()
  const blocking = accessibility.violations.filter(
    (violation) =>
      violation.impact === 'critical' || violation.impact === 'serious',
  )

  expect(blocking).toEqual([])
})
