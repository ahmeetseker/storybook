import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/* `/konseptler` seçim ekranı ve beş konsept rotası kaldırıldı; Harita Keşfi
   deneyimi artık doğrudan ana sayfadır (`/` → MapFirstHome). Buradaki
   kapsam da o yüzden tek rota üzerinden yürür. */
const HOME_HEADING = 'Hayal ettiğin arsa seni bekliyor.'

/* Kabuk gezinmesi burada DOĞRULANMAZ: `Site` landmark'ı dar ekranda menünün
   içine girdiği için görünürlük iddiası viewport'a bağlı olurdu. Kabuk
   gezinmesinin kendi kapsamı `shell.spec.ts`'tedir; burada sayfanın kendi
   sözleşmesi (tek h1, tek main) sınanır. */
async function expectHomeShell(page: Page) {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: HOME_HEADING }),
  ).toBeVisible()
  await expect(page.locator('main#main-content')).toHaveCount(1)
}

test('Harita Keşfi yoğun ve simetrik gerçek ana sayfa olarak çalışır', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: HOME_HEADING,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Ana sayfa konseptleri' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'Ana sayfa konseptleri' }),
  ).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'index, follow',
  )

  const regionNavigation = page.getByRole('navigation', {
    name: 'Bölge sonuçları',
  })
  const regionLinks = regionNavigation.getByRole('link')
  await expect(regionLinks).toHaveCount(8)

  const firstRowBoxes = await Promise.all(
    [0, 1, 2, 3].map((index) => regionLinks.nth(index).boundingBox()),
  )
  for (const box of firstRowBoxes) expect(box).not.toBeNull()
  const firstBox = firstRowBoxes[0]!
  for (const box of firstRowBoxes.slice(1)) {
    expect(Math.abs(box!.y - firstBox.y)).toBeLessThanOrEqual(1)
    expect(Math.abs(box!.width - firstBox.width)).toBeLessThanOrEqual(1)
    expect(Math.abs(box!.height - firstBox.height)).toBeLessThanOrEqual(1)
  }

  await expect(
    page
      .getByRole('region', { name: 'Öne çıkan arsa ilanları' })
      .getByRole('button'),
  ).toHaveCount(30)
  await expect(
    page
      .getByRole('region', { name: 'Yeni eklenen ilanlar' })
      .getByRole('button'),
  ).toHaveCount(18)

  const searchButton = page
    .locator('main#main-content')
    .getByRole('search')
    .getByRole('button', { name: 'Ara' })
  await searchButton.scrollIntoViewIfNeeded()
  await page.mouse.move(1400, 900)
  await page.waitForTimeout(200)
  const beforeHover = await searchButton.boundingBox()
  await searchButton.hover()
  await page.waitForTimeout(220)
  const afterHover = await searchButton.boundingBox()
  expect(beforeHover).not.toBeNull()
  expect(afterHover).not.toBeNull()
  expect(Math.abs(afterHover!.x - beforeHover!.x)).toBeLessThanOrEqual(0.5)
  expect(Math.abs(afterHover!.y - beforeHover!.y)).toBeLessThanOrEqual(0.5)
  expect(Math.abs(afterHover!.width - beforeHover!.width)).toBeLessThanOrEqual(
    0.5,
  )
  expect(
    Math.abs(afterHover!.height - beforeHover!.height),
  ).toBeLessThanOrEqual(0.5)

  const [searchButtonBox, searchIconBox, searchRayBox] = await Promise.all([
    searchButton.boundingBox(),
    searchButton
      .locator('svg[viewBox="0 0 16 16"]')
      .last()
      .boundingBox(),
    searchButton.locator('..').boundingBox(),
  ])
  expect(searchButtonBox).not.toBeNull()
  expect(searchIconBox).not.toBeNull()
  expect(searchRayBox).not.toBeNull()
  expect(
    Math.abs(searchButtonBox!.width - searchButtonBox!.height),
  ).toBeLessThanOrEqual(0.5)
  expect(
    Math.abs(
      searchButtonBox!.y +
        searchButtonBox!.height / 2 -
        (searchIconBox!.y + searchIconBox!.height / 2),
    ),
  ).toBeLessThanOrEqual(0.5)
  expect(
    Math.abs(
      searchRayBox!.y +
        searchRayBox!.height / 2 -
        (searchButtonBox!.y + searchButtonBox!.height / 2),
    ),
  ).toBeLessThanOrEqual(0.5)

  const agencies = page
    .getByRole('region', {
      name: 'Bölgesini bilen doğrulanmış ofisler',
    })
    .locator('section[data-variant="inline"]')
  await expect(agencies).toHaveCount(3)
  for (const part of ['identity', 'stats', 'actions']) {
    const boxes = await Promise.all(
      [0, 1, 2].map((index) =>
        agencies.nth(index).locator(`[data-part="${part}"]`).boundingBox(),
      ),
    )
    boxes.forEach((box) => expect(box).not.toBeNull())
    for (const box of boxes.slice(1)) {
      expect(Math.abs(box!.x - boxes[0]!.x), part).toBeLessThanOrEqual(1)
    }
  }

  const verificationDetail = agencies.first().getByRole('button', {
    name: 'Doğrulama ayrıntısı: Kurumsal kimlik arsam.net tarafından doğrulandı.',
  })
  await verificationDetail.focus()
  await expect(
    page.getByRole('tooltip', {
      name: 'Kurumsal kimlik arsam.net tarafından doğrulandı.',
    }),
  ).toBeVisible()

  const footer = page.getByRole('contentinfo')
  await expect(footer).toBeVisible()
  for (const title of ['Keşfet', 'Karar araçları', 'İlan ve hesap']) {
    await expect(footer.getByText(title, { exact: true })).toBeVisible()
  }
  await expect(
    footer.getByText('Arsayı konum, imar ve doğrulama verileriyle keşfet.'),
  ).toBeVisible()
  expect(
    await page.locator('main#main-content').evaluate((main, footerElement) => {
      return Boolean(
        footerElement &&
          main.compareDocumentPosition(footerElement) &
            Node.DOCUMENT_POSITION_FOLLOWING,
      )
    }, await footer.elementHandle()),
  ).toBe(true)

  await page.setViewportSize({ width: 784, height: 539 })
  await page.goto('/')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(784)

  const tabletHeading = await page
    .getByRole('heading', {
      level: 1,
      name: HOME_HEADING,
    })
    .boundingBox()
  const tabletMap = await page
    .getByRole('region', { name: 'Bölgesel arsa haritası' })
    .boundingBox()
  expect(tabletHeading).not.toBeNull()
  expect(tabletMap).not.toBeNull()
  expect(tabletMap!.x - tabletHeading!.x).toBeGreaterThan(200)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)

  const mobileFeaturedHeading = await page
    .getByRole('heading', { name: 'Öne çıkan arsa ilanları' })
    .boundingBox()
  expect(mobileFeaturedHeading).not.toBeNull()
  expect(mobileFeaturedHeading!.y).toBeLessThan(750)

  const mobileRegionLinks = page
    .getByRole('navigation', { name: 'Bölge sonuçları' })
    .getByRole('link')
  const [mobileRegionA, mobileRegionB] = await Promise.all([
    mobileRegionLinks.nth(0).boundingBox(),
    mobileRegionLinks.nth(1).boundingBox(),
  ])
  expect(mobileRegionA).not.toBeNull()
  expect(mobileRegionB).not.toBeNull()
  expect(Math.abs(mobileRegionA!.y - mobileRegionB!.y)).toBeLessThanOrEqual(1)
  expect(
    Math.abs(mobileRegionA!.width - mobileRegionB!.width),
  ).toBeLessThanOrEqual(1)
  expect(
    Math.abs(mobileRegionA!.height - mobileRegionB!.height),
  ).toBeLessThanOrEqual(1)
})

test('Harita Keşfi araması odakta yalnız bir focus göstergesi gösterir', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const search = page.locator('main#main-content').getByRole('search')
  const input = search.getByRole('searchbox', {
    name: 'Doğal dilde arama',
  })
  const ray = input.locator('..')
  const rayBorderBeforeFocus = await ray.evaluate(
    (element) => window.getComputedStyle(element).borderColor,
  )

  await input.click()

  const [inputFocus, rayFocus, rayBox] = await Promise.all([
    input.evaluate((element) => {
      const styles = window.getComputedStyle(element)
      return {
        outlineColor: styles.outlineColor,
        outlineStyle: styles.outlineStyle,
        outlineWidth: Number.parseFloat(styles.outlineWidth),
      }
    }),
    ray.evaluate((element) => {
      const styles = window.getComputedStyle(element)
      return {
        borderColor: styles.borderColor,
        outlineColor: styles.outlineColor,
        outlineStyle: styles.outlineStyle,
        outlineWidth: Number.parseFloat(styles.outlineWidth),
        borderRadius: Number.parseFloat(styles.borderRadius),
      }
    }),
    ray.boundingBox(),
  ])

  const hasVisibleOutline = (outline: {
    outlineColor: string
    outlineStyle: string
    outlineWidth: number
  }) =>
    outline.outlineStyle !== 'none' &&
    outline.outlineWidth > 0 &&
    outline.outlineColor !== 'transparent' &&
    !outline.outlineColor.endsWith(', 0)')

  const visibleFocusCueCount =
    Number(hasVisibleOutline(inputFocus)) +
    Number(hasVisibleOutline(rayFocus)) +
    Number(rayFocus.borderColor !== rayBorderBeforeFocus)

  expect(visibleFocusCueCount).toBe(1)
  expect(rayFocus.outlineStyle).toBe('solid')
  expect(rayFocus.outlineWidth).toBe(2)
  expect(rayBox).not.toBeNull()
  expect(rayFocus.borderRadius).toBeGreaterThanOrEqual(rayBox!.height / 2)
})

test('Harita Keşfi önerilerinin hero dışına taşan bölümü görünür ve tıklanabilir kalır', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const search = page.locator('main#main-content').getByRole('search')
  await search
    .getByRole('searchbox', { name: 'Doğal dilde arama' })
    .click()

  const lastSuggestion = search.getByRole('button', {
    name: 'Gölbaşı yol cepheli tarla',
  })
  const hero = page
    .locator('main#main-content section[data-variant="split"]')
    .first()
  const [heroBox, suggestionBox] = await Promise.all([
    hero.boundingBox(),
    lastSuggestion.boundingBox(),
  ])

  expect(heroBox).not.toBeNull()
  expect(suggestionBox).not.toBeNull()
  expect(suggestionBox!.y + suggestionBox!.height).toBeGreaterThan(
    heroBox!.y + heroBox!.height,
  )

  const bottomEdgeIsClickable = await lastSuggestion.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const target = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.bottom - 2,
    )
    return target === element || element.contains(target)
  })
  expect(bottomEdgeIsClickable).toBe(true)
})

test('ana sayfa CTA’ları mobilde erişilebilir ve gerçek rotalara gider', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const compareRegion = page.getByRole('region', {
    name: 'Konumu, fiyatı ve imarı yan yana koy',
  })
  const compareButton = compareRegion.getByRole('button', {
    name: 'Karşılaştırmaya geç',
    exact: true,
  })
  const agencyRegion = page.getByRole('region', {
    name: 'Bölgesini bilen doğrulanmış ofisler',
  })
  const agencyButton = agencyRegion.getByRole('button', {
    name: 'Tüm doğrulanmış ofisleri gör',
    exact: true,
  })

  await expect(compareButton).toBeVisible()
  await expect(agencyButton).toBeVisible()
  await expect(compareButton).toHaveAttribute('data-material', 'glass')
  await expect(agencyButton).toHaveAttribute('data-material', 'glass')

  const [regionBox, buttonBox, agencyRegionBox, agencyButtonBox, padding] =
    await Promise.all([
      compareRegion.boundingBox(),
      compareButton.boundingBox(),
      agencyRegion.boundingBox(),
      agencyButton.boundingBox(),
      compareRegion.evaluate((element) => {
        const styles = window.getComputedStyle(element)
        return {
          left:
            Number.parseFloat(styles.borderLeftWidth) +
            Number.parseFloat(styles.paddingLeft),
          right:
            Number.parseFloat(styles.borderRightWidth) +
            Number.parseFloat(styles.paddingRight),
        }
      }),
    ])

  expect(regionBox).not.toBeNull()
  expect(buttonBox).not.toBeNull()
  expect(agencyRegionBox).not.toBeNull()
  expect(agencyButtonBox).not.toBeNull()
  expect(
    Math.abs(
      buttonBox!.width - (regionBox!.width - padding.left - padding.right),
    ),
  ).toBeLessThanOrEqual(1)
  expect(
    Math.abs(agencyButtonBox!.width - agencyRegionBox!.width),
  ).toBeLessThanOrEqual(1)

  for (const selector of [
    '[aria-labelledby="map-compare-title"] button',
    '[aria-labelledby="map-agencies-title"] > button',
  ]) {
    const contrast = await new AxeBuilder({ page })
      .include(selector)
      .withRules(['color-contrast'])
      .analyze()
    expect(contrast.violations, selector).toEqual([])
  }

  await compareButton.click()
  await expect(page).toHaveURL(/\/karsilastir$/)
  await page.goBack()
  await expect(agencyButton).toBeVisible()
  await expect(agencyButton).toHaveAttribute('data-material', 'glass')
  await agencyButton.click()
  await expect(page).toHaveURL(/\/ofisler$/)
})

test('ana sayfa tek ana içerik ve ortak Glass kabuğu taşır', async ({
  page,
}) => {
  await expectHomeShell(page)
  await expect(
    page.getByRole('link', { name: 'arsam.net' }).first(),
  ).toBeVisible()
})

test('ana sayfa masaüstü ve mobilde yatay taşma üretmez', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await expectHomeShell(page)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport.width)
  }
})

test('ana sayfada critical veya serious Axe ihlali yoktur', async ({
  page,
}) => {
  test.slow()
  await expectHomeShell(page)
  // GlassHero'nun giriş opaklığı son değerine ulaşmadan Axe ara rengi
  // ölçmemeli; gerçek durumu sabitlenene kadar kısa bir görsel bekleme yap.
  await page.waitForTimeout(1_000)
  const accessibility = await new AxeBuilder({ page }).analyze()
  const blockingViolations = accessibility.violations.filter(
    (violation) =>
      violation.impact === 'critical' || violation.impact === 'serious',
  )
  expect(blockingViolations, '/').toEqual([])
})

test('JavaScript olmadan ana sayfa okunabilir kalır', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  try {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: HOME_HEADING }),
    ).toBeVisible()
    await expect(page.locator('main#main-content')).toHaveCount(1)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390)
  } finally {
    await context.close()
  }
})
