import { expect, test, type Locator, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const FEATURE_TEXT_SIZE_TOKENS = [
  '--lg-text-badge',
  '--lg-text-caption',
  '--lg-text-footnote',
  '--lg-text-body',
  '--lg-text-headline',
  '--lg-text-title',
  '--lg-text-display',
]

async function waitForHydratedMessagesRoute(page: Page) {
  await expect(page.locator('.shell-dock-variant')).toHaveCount(1)
  await expect(page.locator('main#main-content')).toHaveCount(1)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Mesajlar' }),
  ).toBeVisible()
}

async function stabilizeClock(page: Page) {
  const clocks = page.getByText(/^\d{2}:\d{2}$/)
  if ((await clocks.count()) === 0) return

  const clock = clocks.first()
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

async function expectNoBlockingAxeViolations(page: Page) {
  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(
    accessibility.violations.filter(
      ({ impact }) => impact === 'critical' || impact === 'serious',
    ),
  ).toEqual([])
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(0)
}

function remoteListingImages(page: Page) {
  return page.locator(
    'main#main-content img[src^="https://images.unsplash.com/"]',
  )
}

async function computedFontSize(locator: Locator) {
  return locator.evaluate((element) =>
    Number.parseFloat(window.getComputedStyle(element).fontSize),
  )
}

async function firstVisibleMessage(log: Locator) {
  return log.evaluate((element) => {
    const viewport = element.getBoundingClientRect()
    return Array.from(
      element.querySelectorAll<HTMLElement>('[data-message-key]'),
    )
      .map((message) => {
        const box = message.getBoundingClientRect()
        return {
          key: message.dataset.messageKey ?? '',
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          bottom: box.bottom,
        }
      })
      .filter(
        ({ bottom, y }) => bottom > viewport.top && y < viewport.bottom,
      )
      .sort((left, right) => left.y - right.y)[0] ?? null
  })
}

test('mesaj merkezi masaüstünde gerçek route, URL seçimi ve gönderim sonucunu doğrular', async ({
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

  await page.goto('/hesabim/mesajlar')
  await waitForHydratedMessagesRoute(page)

  await expect(page.locator('main#main-content h1')).toHaveCount(1)
  await expect(
    page.locator(
      'main#main-content [data-messages-content-surface][data-material="glass"]',
    ),
  ).toHaveCount(0)
  await expect(
    page.locator(
      'main#main-content [data-messages-content-surface][data-material="flat"]',
    ),
  ).toHaveCount(2)

  const conversationLink = page
    .getByRole('navigation', { name: 'Konuşmalar' })
    .getByRole('link')
    .filter({ hasText: 'Urla İskele’de Taş Ev' })
  await expect(conversationLink).toHaveCount(1)
  await conversationLink.click()
  await expect(page).toHaveURL(
    /\/hesabim\/mesajlar\?konusma=conversation-urla-ayse$/,
  )

  const thread = page.getByRole('region', {
    name: 'Ayşe Kaya ile konuşma',
  })
  await expect(
    thread.getByRole('heading', { level: 2, name: 'Ayşe Kaya' }),
  ).toBeVisible()
  await expect(
    thread.getByText('Urla İskele’de Taş Ev', { exact: true }),
  ).toBeVisible()
  await expect(
    thread.getByText('İlan Urla 1001', { exact: true }),
  ).toBeVisible()
  await expect(thread.getByText('₺18.500.000', { exact: true })).toBeVisible()

  const body = 'Yarın saat 14.00 için uygunum.'
  const composer = thread.getByRole('form', { name: 'Mesaj yaz' })
  const textarea = composer.getByRole('textbox', { name: 'Mesaj' })
  await textarea.fill(body)
  await composer.getByRole('button', { name: 'Mesajı gönder' }).click()

  const sentMessage = thread.locator('article').filter({ hasText: body })
  await expect(sentMessage).toHaveCount(1)
  await expect(
    sentMessage.getByText('Gönderildi', { exact: true }),
  ).toBeVisible()
  await expect(textarea).toHaveValue('')

  await expectNoBlockingAxeViolations(page)
  await expectNoHorizontalOverflow(page)
  expect(hydrationMessages).toEqual([])
  await stabilizeClock(page)

  await expect(page).toHaveScreenshot('messages-desktop.png', {
    fullPage: true,
    mask: [remoteListingImages(page)],
  })
})

test('compact master-detail Back sonrası rail state’ini korur ve Dock composer’ı örtmez', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/hesabim/mesajlar')
  await waitForHydratedMessagesRoute(page)

  const railPane = page.getByRole('region', { name: 'Konuşma listesi' })
  const threadPane = page.getByRole('region', { name: 'Aktif konuşma' })
  await expect(railPane).toBeVisible()
  await expect(threadPane).toBeHidden()
  await stabilizeClock(page)
  await expect(page).toHaveScreenshot('messages-compact-list.png', {
    fullPage: true,
    mask: [remoteListingImages(page)],
  })

  const search = railPane.getByRole('searchbox', {
    name: 'Konuşmalarda ara',
  })
  await search.fill('a')
  const unreadFilter = railPane.getByRole('radio', { name: 'Okunmamış' })
  await unreadFilter.click()
  await expect(railPane.getByText('4 sonuç bulundu', { exact: true })).toBeVisible()

  const scrollArea = railPane.locator('.conversationRail__scrollArea')
  const scrollState = await scrollArea.evaluate((element) => {
    const maximum = element.scrollHeight - element.clientHeight
    const requested = Math.min(48, maximum)
    element.scrollTo({ top: requested, behavior: 'auto' })
    return { maximum, requested }
  })
  expect(scrollState.maximum).toBeGreaterThan(0)
  await expect
    .poll(() => scrollArea.evaluate((element) => element.scrollTop))
    .toBeCloseTo(scrollState.requested, 0)

  const targetConversation = railPane.locator(
    '[data-conversation-id="conversation-cesme-mert"] a',
  )
  await expect(targetConversation).toBeVisible()
  await targetConversation.click()
  await expect(page).toHaveURL(
    /\/hesabim\/mesajlar\?konusma=conversation-cesme-mert$/,
  )
  await expect(railPane).toBeHidden()
  await expect(threadPane).toBeVisible()
  await expect(
    threadPane.getByText('Çeşme Ilıca’da Yazlık', { exact: true }),
  ).toBeVisible()
  await expect(page).toHaveScreenshot('messages-compact-thread.png', {
    fullPage: true,
    mask: [remoteListingImages(page)],
  })

  const composer = threadPane.getByRole('form', { name: 'Mesaj yaz' })
  const textarea = composer.getByRole('textbox', { name: 'Mesaj' })
  await textarea.fill('Compact taslak')
  const sendButton = composer.getByRole('button', { name: 'Mesajı gönder' })
  await sendButton.focus()
  await expect(sendButton).toBeFocused()
  await sendButton.scrollIntoViewIfNeeded()

  const [composerBox, focusedActionBox, dockBox] = await Promise.all([
    composer.boundingBox(),
    sendButton.boundingBox(),
    page
      .getByRole('navigation', { name: 'Ana gezinme' })
      .boundingBox(),
  ])
  expect(composerBox).not.toBeNull()
  expect(focusedActionBox).not.toBeNull()
  expect(dockBox).not.toBeNull()
  expect(composerBox!.y + composerBox!.height).toBeLessThanOrEqual(dockBox!.y)
  expect(
    focusedActionBox!.y + focusedActionBox!.height,
  ).toBeLessThanOrEqual(dockBox!.y)

  await page.goBack()
  await expect
    .poll(() => new URL(page.url()).searchParams.has('konusma'))
    .toBe(false)
  await expect(railPane).toBeVisible()
  await expect(threadPane).toBeHidden()
  await expect(search).toHaveValue('a')
  await expect(unreadFilter).toHaveAttribute('aria-checked', 'true')
  await expect
    .poll(() => scrollArea.evaluate((element) => element.scrollTop))
    .toBeCloseTo(scrollState.requested, 0)
  await expectNoHorizontalOverflow(page)
})

test('uzun gerçek route eski geçmişi prepend eder, anchorı korur ve en yeni mesaja döner', async ({
  page,
}) => {
  await page.goto(
    '/hesabim/mesajlar?konusma=conversation-seferihisar-cem',
  )
  await waitForHydratedMessagesRoute(page)

  const thread = page.getByRole('region', {
    name: 'Cem Akın ile konuşma',
  })
  const log = thread.getByRole('log', {
    name: 'Cem Akın ile mesajlar',
  })
  const olderButton = thread.getByRole('button', {
    name: 'Daha eski mesajları yükle',
  })
  await expect(olderButton).toBeVisible()
  await olderButton.scrollIntoViewIfNeeded()

  await log.evaluate((element) => {
    element.scrollTo({ top: 0, behavior: 'auto' })
    element.dispatchEvent(new Event('scroll', { bubbles: true }))
  })
  await expect
    .poll(() => log.evaluate((element) => element.scrollTop))
    .toBeLessThanOrEqual(1)
  const latestButton = thread.getByRole('button', {
    name: 'En yeni mesaja dön',
  })
  await expect(latestButton).toBeVisible()

  await expect
    .poll(async () => (await firstVisibleMessage(log))?.key)
    .toBe('message-seferihisar-history-37')
  const anchorBefore = await firstVisibleMessage(log)
  if (!anchorBefore) throw new Error('İlk görünür mesaj bulunamadı.')

  const spacer = log.locator(':scope > div').first()
  const heightBefore = await spacer.evaluate((element) =>
    Number.parseFloat((element as HTMLElement).style.height),
  )
  await olderButton.click()
  await expect
    .poll(() =>
      spacer.evaluate((element) =>
        Number.parseFloat((element as HTMLElement).style.height),
      ),
    )
    .toBeGreaterThan(heightBefore)

  await expect
    .poll(async () => (await firstVisibleMessage(log))?.key)
    .toBe(anchorBefore.key)
  const anchorMessage = log.locator(
    `[data-message-key="${anchorBefore.key}"]`,
  )
  await expect(anchorMessage).toBeVisible()
  await expect
    .poll(async () => {
      const box = await anchorMessage.boundingBox()
      return box ? Math.abs(box.y - anchorBefore.y) : Number.POSITIVE_INFINITY
    })
    .toBeLessThanOrEqual(4)

  await latestButton.click()
  await expect
    .poll(() =>
      log.evaluate((element) =>
        Math.max(
          0,
          element.scrollHeight -
            element.scrollTop -
            element.clientHeight,
        ),
      ),
    )
    .toBeLessThanOrEqual(48)
  await expect(
    log.locator('[data-message-key="message-seferihisar-1"]'),
  ).toBeVisible()
  await expect(latestButton).toBeHidden()
})

test('gerçek route reduced motion, 320px reflow ve yüzde 200 metin zoom altında işlevini korur', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 844 })
  await page.goto('/hesabim/mesajlar')
  await waitForHydratedMessagesRoute(page)

  expect(
    await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  ).toBe(true)
  await expectNoHorizontalOverflow(page)

  const conversationLink = page
    .getByRole('navigation', { name: 'Konuşmalar' })
    .getByRole('link')
    .filter({ hasText: 'Urla İskele’de Taş Ev' })
  await conversationLink.click()
  const thread = page.getByRole('region', { name: 'Aktif konuşma' })
  await expect(thread).toBeVisible()
  await expectNoHorizontalOverflow(page)

  const nonZeroTransitions = await page
    .locator('main#main-content *')
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const duration = window.getComputedStyle(element).transitionDuration
        return duration
          .split(',')
          .every((value) => value.trim() === '0s')
          ? []
          : [`${element.tagName.toLowerCase()}:${duration}`]
      }),
    )
  expect(nonZeroTransitions).toEqual([])

  await page.setViewportSize({ width: 390, height: 844 })

  await expect(
    page.getByRole('heading', { level: 1, name: 'Mesajlar' }),
  ).toBeVisible()
  const composer = thread.getByRole('form', { name: 'Mesaj yaz' })
  const textarea = composer.getByRole('textbox', { name: 'Mesaj' })
  const sendButton = composer.getByRole('button', {
    name: 'Mesajı gönder',
  })
  const existingMessage = thread
    .locator('[data-message-key="message-urla-1"] > p')
    .filter({ hasText: 'Evi yarın görebilir miyiz?' })
  await expect(existingMessage).toHaveCount(1)

  const [baselineMessageFontSize, baselineSendFontSize] = await Promise.all([
    computedFontSize(existingMessage),
    computedFontSize(sendButton),
  ])
  expect(baselineMessageFontSize).toBeGreaterThan(0)
  expect(baselineSendFontSize).toBeGreaterThan(0)

  await page.locator('main#main-content').evaluate(
    (element, tokenNames) => {
      const rootStyles = window.getComputedStyle(document.documentElement)
      for (const tokenName of tokenNames) {
        const baseline = Number.parseFloat(
          rootStyles.getPropertyValue(tokenName),
        )
        if (!Number.isFinite(baseline) || baseline <= 0) {
          throw new Error(`Geçersiz metin tokenı: ${tokenName}`)
        }
        ;(element as HTMLElement).style.setProperty(
          tokenName,
          `${baseline * 2}px`,
        )
      }
    },
    FEATURE_TEXT_SIZE_TOKENS,
  )

  const [zoomedMessageFontSize, zoomedSendFontSize] = await Promise.all([
    computedFontSize(existingMessage),
    computedFontSize(sendButton),
  ])
  expect(zoomedMessageFontSize / baselineMessageFontSize).toBeCloseTo(2, 1)
  expect(zoomedSendFontSize / baselineSendFontSize).toBeCloseTo(2, 1)

  const zoomMessage = 'Yakınlaştırma altında gönderilen mesaj.'
  await textarea.fill(zoomMessage)
  await expect(sendButton).toBeEnabled()
  await sendButton.scrollIntoViewIfNeeded()
  await expect(sendButton).toBeVisible()

  const [composerBox, sendButtonBox, dockBox] = await Promise.all([
    composer.boundingBox(),
    sendButton.boundingBox(),
    page
      .getByRole('navigation', { name: 'Ana gezinme' })
      .boundingBox(),
  ])
  expect(composerBox).not.toBeNull()
  expect(sendButtonBox).not.toBeNull()
  expect(dockBox).not.toBeNull()
  expect(composerBox!.y + composerBox!.height).toBeLessThanOrEqual(dockBox!.y)
  expect(
    sendButtonBox!.y + sendButtonBox!.height,
  ).toBeLessThanOrEqual(dockBox!.y)

  await sendButton.click()
  const sentMessage = thread.locator('article').filter({
    hasText: zoomMessage,
  })
  await expect(sentMessage).toHaveCount(1)
  await expect(
    sentMessage.getByText('Gönderildi', { exact: true }),
  ).toBeVisible()
  await expect(textarea).toHaveValue('')
  await expectNoHorizontalOverflow(page)
})
