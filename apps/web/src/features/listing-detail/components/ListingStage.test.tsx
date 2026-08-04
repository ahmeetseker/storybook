import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { loadListingDetail } from '../data/listing-detail-adapter'
import type { ListingDetail } from '../domain/listing-detail-types'
import { ListingStage } from './ListingStage'

const NOW = '2026-07-27T09:00:00.000Z'

/** Arama kaydından yansıtılmış ilan (arsa kategorisi). */
const PROJECTED = 'listing-1-4'
/** Yansıtılmış konut ilanı — havuzu ayrı bir kategoriden gelir. */
const PROJECTED_RESIDENTIAL = 'listing-3-1'
/** Elle yazılmış kanıt defteri — üç gerçek medya karesi taşır. */
const REFERENCE = 'arsa-214-7'

async function detailOf(listingId: string): Promise<ListingDetail> {
  const result = await loadListingDetail({ listingId, now: NOW })
  if (!result) throw new Error(`${listingId} çözülemedi`)
  return result.detail
}

describe('yansıtılmış ilanın foto bentosu', () => {
  it('tek kare yerine çoklu temsili kare çizilir', async () => {
    const detail = await detailOf(PROJECTED)
    const { container } = render(<ListingStage detail={detail} />)

    expect(detail.media.length).toBeGreaterThan(1)
    expect(container.querySelectorAll('img').length).toBe(detail.media.length)
    // Aynı kare iki kez gösterilmez: havuz tükenince kare sayısı kısalır.
    const sources = Array.from(container.querySelectorAll('img')).map((img) =>
      img.getAttribute('src'),
    )
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('kare başına künye uydurulmaz: hepsi aynı nötr etiketi taşır, çekim tarihi yoktur', async () => {
    const detail = await detailOf(PROJECTED)
    render(<ListingStage detail={detail} />)

    for (const item of detail.media) {
      expect(item.label).toBe('Temsili görsel')
      expect(item.capturedAt).toBeUndefined()
      expect(item.aiEdited).toBeUndefined()
    }
    // Uydurma çekim tarihi ekrana da sızmaz.
    expect(screen.queryByText(/Çekim:/)).toBeNull()
  })

  it('temsili görsel notu ve bildirilen sayı künye satırı olarak durur', async () => {
    const detail = await detailOf(PROJECTED)
    const { container } = render(<ListingStage detail={detail} />)

    expect(
      screen.getByText(
        'Görseller temsili fotoğraflardır; yüklenemezse mevcut ilan görseli gösterilir.',
      ),
    ).toBeTruthy()

    const declared = container.querySelector('[data-part="declared-count"]')
    expect(declared?.textContent).toContain(`İlanda ${detail.declaredMediaCount} görsel`)
    // Sayı bir kare değil: bildirilen sayı kadar görsel çizilmez.
    expect(declared?.textContent).toContain(`${detail.media.length} temsili kare`)
    expect(container.querySelectorAll('img').length).toBeLessThan(
      detail.declaredMediaCount as number,
    )
  })

  it('konut kategorisinde de bento kurulur', async () => {
    const detail = await detailOf(PROJECTED_RESIDENTIAL)
    const { container } = render(<ListingStage detail={detail} />)
    expect(container.querySelectorAll('img').length).toBeGreaterThan(1)
  })

  it('sahne fiyatı hiç yazmaz', async () => {
    const detail = await detailOf(PROJECTED)
    const { container } = render(<ListingStage detail={detail} />)
    expect(container.textContent).not.toContain('₺')
  })

  it('kare butonlarının erişilebilir adları ayırt edilebilir', async () => {
    const detail = await detailOf(PROJECTED)
    render(<ListingStage detail={detail} />)

    const names = screen
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label') ?? '')
      .filter((name) => name.startsWith('Görseli büyüt') || name.startsWith('Tüm görselleri'))
    expect(names.length).toBeGreaterThan(1)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('bento karesinden tam ekran galeri', () => {
  it('kare tıklanınca galeri açılır, ok tuşlarıyla gezinilir, Escape odağı geri verir', async () => {
    const user = userEvent.setup()
    const detail = await detailOf(PROJECTED)
    render(<ListingStage detail={detail} />)

    const trigger = screen.getAllByRole('button', { name: /Görseli büyüt/ })[0]
    await user.click(trigger)

    const dialog = await screen.findByRole('dialog')
    expect(dialog.textContent).toContain(`İlan görselleri (${detail.media.length})`)

    const shown = () => (dialog.querySelector('img') as HTMLImageElement).src

    // Ok butonu gezinir…
    const first = shown()
    await user.click(screen.getByRole('button', { name: 'Sonraki görsel' }))
    const second = shown()
    expect(second).not.toBe(first)

    // …ok TUŞLARI da gezinir: sağ ilerler, sol geri döner.
    await user.keyboard('{ArrowRight}')
    expect(shown()).not.toBe(second)
    await user.keyboard('{ArrowLeft}')
    expect(shown()).toBe(second)

    // Kapanış animasyonlu: panel çıkış geçişini bitirince DOM'dan düşer.
    await user.keyboard('{Escape}')
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
    // Kapanışta odak tetikleyiciye döner.
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('"Tümünü gör" karesi de aynı galeriyi açar', async () => {
    const user = userEvent.setup()
    const detail = await detailOf(PROJECTED)
    render(<ListingStage detail={detail} />)

    await user.click(screen.getByRole('button', { name: /Tüm görselleri gör/ }))
    expect(await screen.findByRole('dialog')).toBeTruthy()
  })
})

describe('tam kayıtlı ilan', () => {
  it('kendi kareleri ve künyeleriyle bento kurmaya devam eder', async () => {
    const detail = await detailOf(REFERENCE)
    const { container } = render(<ListingStage detail={detail} />)

    expect(container.querySelectorAll('img').length).toBeGreaterThan(1)
    // Gerçek künyeler korunur: kalem başlıkları ve çekim tarihleri durur.
    expect(screen.getByText('Parsel görünümü')).toBeTruthy()
    expect(screen.getAllByText(/Çekim:/).length).toBeGreaterThan(0)
    // Bildirilen sayı beyanı yalnız yansıtılmış kayıtta vardır.
    expect(container.querySelector('[data-part="declared-count"]')).toBeNull()
  })

  it('kareye tıklayınca galeri açılır', async () => {
    const user = userEvent.setup()
    const detail = await detailOf(REFERENCE)
    render(<ListingStage detail={detail} />)

    await user.click(screen.getAllByRole('button', { name: /Görseli büyüt/ })[0])
    expect(await screen.findByRole('dialog')).toBeTruthy()
  })
})
