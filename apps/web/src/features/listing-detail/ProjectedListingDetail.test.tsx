import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { loadListingDetail } from './data/listing-detail-adapter'
import { ListingDetailWorkspace } from './ListingDetailWorkspace'

const NOW = '2026-07-27T09:00:00.000Z'

/** `listing-3-1` — Nilüfer'de konut, doğrulanmış, sahibinden. */
const VERIFIED_RESIDENTIAL = 'listing-3-1'
/** `listing-3-3` — aynı şablonun doğrulanmamış, emlak ofisi varyantı. */
const UNVERIFIED_RESIDENTIAL = 'listing-3-3'
/** `listing-1-1` — arsa kategorisinde, ama kanıt defteri olmayan arama ilanı. */
const PROJECTED_LAND = 'listing-1-1'

async function renderProjected(listingId = VERIFIED_RESIDENTIAL) {
  const result = await loadListingDetail({ listingId, now: NOW })
  if (!result) throw new Error(`${listingId} çözülemedi`)
  return render(<ListingDetailWorkspace result={result} />)
}

describe('yansıtılmış ilan detayı sayfası', () => {
  it('kendi başlığını, fiyatını ve konumunu yazar — referans defterin değerlerini değil', async () => {
    const { container } = await renderProjected()

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Nilüfer')
    expect(screen.getAllByText('6.750.000 ₺').length).toBeGreaterThan(0)
    expect(container.textContent).toContain('Bursa')

    expect(container.textContent).not.toContain('Ören')
    expect(container.textContent).not.toContain('214 ada / 7 parsel')
    expect(container.textContent).not.toContain('8.750.000 ₺')
  })

  it('konut ilanında parsel, imar ve tehlike bölümleri hiç render edilmez', async () => {
    const { container } = await renderProjected()
    for (const title of ['Parsel', 'İmar ve Hukuk', 'Altyapı ve Erişim', 'Arazi ve Tehlike', 'Piyasa']) {
      expect(screen.queryByRole('heading', { level: 2, name: title })).toBeNull()
    }
    expect(container.textContent).not.toContain('Ada / parsel')
    expect(container.querySelector('#parsel')).toBeNull()
    expect(container.querySelector('#imar')).toBeNull()
    expect(container.querySelector('#arazi')).toBeNull()
  })

  it('arsa kategorisindeki arama ilanı da arsa kanıt bölümlerini açmaz', async () => {
    const { container } = await renderProjected(PROJECTED_LAND)
    expect(container.querySelector('#parsel')).toBeNull()
    expect(container.textContent).not.toContain('Ada / parsel')
    expect(screen.getByRole('heading', { level: 2, name: 'Beyan Edilen Özellikler' })).toBeTruthy()
  })

  it('bölüm indeksi yalnız render edilen bölümleri bağlar ve hiçbir çapa boşta kalmaz', async () => {
    const { container } = await renderProjected()
    const nav = screen.getByRole('navigation', { name: 'Bölümler' })
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Özet',
      'Beyan Edilen Özellikler',
      'Belgeler',
    ])

    const anchors = Array.from(container.querySelectorAll('a[href^="#"]'))
    expect(anchors.length).toBeGreaterThan(0)
    for (const anchor of anchors) {
      const id = anchor.getAttribute('href')?.slice(1)
      expect(container.querySelector(`#${id}`), `#${id} hedefi yok`).toBeTruthy()
    }
  })

  it('bölüm indeksi etiketi ile bölüm başlığı birebir aynıdır', async () => {
    await renderProjected()
    const nav = screen.getByRole('navigation', { name: 'Bölümler' })
    for (const link of within(nav).getAllByRole('link')) {
      expect(
        screen.getByRole('heading', { level: 2, name: link.textContent ?? '' }),
      ).toBeTruthy()
    }
  })

  it('beyan edilen özellikler Türkçe etiketle ve beyan künyesiyle görünür', async () => {
    await renderProjected()
    const section = screen.getByRole('region', { name: 'Beyan Edilen Özellikler' })
    expect(within(section).getByText('Oda sayısı')).toBeTruthy()
    expect(within(section).getByText('3+1')).toBeTruthy()
    expect(within(section).getAllByText(/İlan sahibi beyanı/).length).toBeGreaterThan(0)
  })

  it('cevapsız alanlar tire yerine gerekçe cümlesi yazar', async () => {
    await renderProjected()
    const section = screen.getByRole('region', { name: 'Beyan Edilen Özellikler' })
    const missing = within(section).getAllByText(/Bilgi alınamadı/)
    expect(missing.length).toBeGreaterThan(0)

    for (const row of Array.from(section.querySelectorAll('[data-state="missing"]'))) {
      const value = row.querySelector('dd')?.textContent ?? ''
      expect(value.trim()).not.toBe('—')
      expect(value).toMatch(/Bilgi alınamadı/)
    }
  })

  it('doğrulanmamış ilanda EİDS satırı eksiktir ve olumlu cümleyi hiç kullanmaz', async () => {
    const { container } = await renderProjected(UNVERIFIED_RESIDENTIAL)
    expect(container.textContent).not.toContain('İlan verme yetkisi EİDS ile doğrulandı')
    expect(screen.getByText(/EİDS sorgusu bu kayıtta bulunmuyor/)).toBeTruthy()
    expect(screen.getAllByText('Eksik').length).toBeGreaterThan(0)
    expect(screen.queryByText('Doğrulandı')).toBeNull()
  })

  it('doğrulanmış ilanda EİDS cümlesi kapsam notuyla birlikte durur', async () => {
    await renderProjected()
    expect(screen.getByText('İlan verme yetkisi EİDS ile doğrulandı')).toBeTruthy()
    expect(
      screen.getByText(
        'Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.',
      ),
    ).toBeTruthy()
  })

  it('değerleme çekinir: uydurma aralık yerine gerekçe görünür', async () => {
    const { container } = await renderProjected()
    expect(screen.getByText('Üretilmedi')).toBeTruthy()
    expect(container.textContent).toMatch(/emsal kesiti/i)
  })

  it('karar özeti üretilmez; gerekçesi görünür kalır', async () => {
    await renderProjected()
    expect(screen.getByText(/kanıt defteri/i)).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Yapay zekâ karar özeti' })).toBeNull()
  })

  it('belge bölümü boşluğu gerekçesiyle yazar, olumsuzluk iddia etmez', async () => {
    await renderProjected()
    const section = screen.getByRole('region', { name: 'Belgeler' })
    expect(within(section).getByText(/belge bulunmuyor/i)).toBeTruthy()
    expect(within(section).getByText(/anlamına gelmez/i)).toBeTruthy()
    expect(within(section).queryByText('0 belgenin tamamı sunuldu.')).toBeNull()
  })

  it('emlak ofisi ilanında yetki belgesi kaydının bulunmadığı yazılır', async () => {
    await renderProjected(UNVERIFIED_RESIDENTIAL)
    const section = screen.getByRole('region', { name: 'Satıcı' })
    expect(within(section).getByText(/Yetki belgesi kaydı bulunamadı/)).toBeTruthy()
    expect(
      within(section).getByText(
        'TTBS, işletmenin faaliyet yetkisidir; ilan içeriğinin doğruluğunu göstermez.',
      ),
    ).toBeTruthy()
  })

  it('tek görünür h1 ve altı cam yüzey sınırı korunur', async () => {
    const { container } = await renderProjected()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(container.querySelectorAll('[data-material="glass"]').length).toBeLessThanOrEqual(6)
  })

  it('bağlanmamış eylemler yansıtılan ilanda da devre dışı ve gerekçelidir', async () => {
    await renderProjected()
    for (const name of ['Mesaj gönder', 'Satıcı bilgilerine git']) {
      expect(screen.getByRole('button', { name })).toHaveProperty('disabled', true)
    }
    expect(screen.getByText(/Mesaj gönderme bu sürümde bağlı değil/i)).toBeTruthy()
  })
})
