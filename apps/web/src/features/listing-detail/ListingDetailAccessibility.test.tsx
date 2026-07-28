import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { loadListingDetail } from './data/listing-detail-adapter'
import { ListingDetailWorkspace } from './ListingDetailWorkspace'

const NOW = '2026-07-27T09:00:00.000Z'

async function renderPage(onRevealPhone?: () => Promise<string>) {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', now: NOW })
  if (!result) throw new Error('fixture bulunamadı')
  return render(<ListingDetailWorkspace result={result} onRevealPhone={onRevealPhone} />)
}

describe('ilan detayı erişilebilirlik geçidi', () => {
  it('başlık hiyerarşisi tek h1 ve h2 bölümlerinden oluşur', async () => {
    await renderPage()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(7)
  })

  it('her bölüm indeksi bağlantısının hedefi sayfada mevcuttur', async () => {
    const { container } = await renderPage()
    const nav = screen.getByRole('navigation', { name: 'Bölümler' })
    for (const link of Array.from(nav.querySelectorAll('a'))) {
      const id = link.getAttribute('href')?.slice(1)
      expect(container.querySelector(`#${id}`)).toBeTruthy()
    }
  })

  it('kanıt bölümlerine bağlanan her dayanak bağlantısının hedefi mevcuttur', async () => {
    const { container } = await renderPage()
    const anchors = Array.from(container.querySelectorAll('a[href^="#"]'))
    expect(anchors.length).toBeGreaterThan(0)
    for (const anchor of anchors) {
      const id = anchor.getAttribute('href')?.slice(1)
      expect(container.querySelector(`#${id}`)).toBeTruthy()
    }
  })

  // Durum kelimeleri sayfada birden çok satırda geçer (doğrulama vektörünün her
  // satırı kendi durumunu yazar), bu yüzden `getAllByText` kullanılır: aranan
  // şey tekillik değil, durumun renk dışında metinle de taşınıyor olmasıdır.
  it('durum yalnız renkle değil metinle de taşınır', async () => {
    await renderPage()
    expect(screen.getAllByText('Çelişkili').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Eksik').length).toBeGreaterThan(0)
  })

  it('etiket/değer çiftleri dl, kıyaslar table kullanır', async () => {
    const { container } = await renderPage()
    expect(container.querySelectorAll('dl').length).toBeGreaterThan(0)
    expect(screen.getByRole('table', { name: /Emsal/ })).toBeTruthy()
  })

  it('numara açma kontrolü açıkken de cam bütçesi altıyı aşmaz', async () => {
    const { container } = await renderPage(async () => '0 (252) 000 00 00')
    expect(screen.getByRole('button', { name: 'Numarayı göster' })).toBeTruthy()
    expect(container.querySelectorAll('[data-material="glass"]').length).toBeLessThanOrEqual(6)
  })

  it('numara açılmadan önce sayfa kaynağında telefon numarası bulunmaz', async () => {
    const { container } = await renderPage(async () => '0 (252) 000 00 00')
    expect(container.textContent).not.toMatch(/\d{3}\s?\d{2}\s?\d{2}\s?\d{2}/)
  })
})
