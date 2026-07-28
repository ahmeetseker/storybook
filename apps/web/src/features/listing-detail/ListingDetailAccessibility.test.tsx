import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  loadListingDetail,
  type ListingDetailScenario,
} from './data/listing-detail-adapter'
import { ListingDetailWorkspace } from './ListingDetailWorkspace'

const NOW = '2026-07-27T09:00:00.000Z'

async function renderPage(
  onRevealPhone?: () => Promise<string>,
  scenario?: ListingDetailScenario,
) {
  const result = await loadListingDetail({ listingId: 'arsa-214-7', scenario, now: NOW })
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

  it('karar rayının ikincil eylemi odağı satıcı bölümündeki numara kontrolüne taşır', async () => {
    const user = userEvent.setup()
    const { container } = await renderPage(async () => '0 (252) 000 00 00')

    const control = screen.getByRole('button', { name: 'Numarayı göster' })
    await user.click(screen.getByRole('button', { name: 'Satıcı bilgilerine git' }))

    expect(document.activeElement).toBe(control)
    // Odak taşımak tek başına numarayı açmaz.
    expect(container.textContent).not.toMatch(/\d{3}\s?\d{2}\s?\d{2}\s?\d{2}/)
    expect(screen.getByRole('button', { name: 'Numarayı göster' })).toBeTruthy()
  })

  // Numara sağlayıcısı bağlı değil → satıcı bölümünde kontrol yok → ray da
  // eylemi göstermez. Render edilip işlevsiz kalan buton yok.
  it('numara sağlayıcısı yokken rayın ikincil eylemi hiç render edilmez', async () => {
    await renderPage()
    expect(screen.queryByRole('button', { name: 'Satıcı bilgilerine git' })).toBeNull()
  })

  it('iletişim kapalıyken rayın ikincil eylemi hiç render edilmez', async () => {
    await renderPage(async () => '0 (252) 000 00 00', 'inactive')
    expect(screen.queryByRole('button', { name: 'Satıcı bilgilerine git' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Numarayı göster' })).toBeNull()
  })

  it('numara açılmadan önce sayfa kaynağında telefon numarası bulunmaz', async () => {
    const { container } = await renderPage(async () => '0 (252) 000 00 00')
    expect(container.textContent).not.toMatch(/\d{3}\s?\d{2}\s?\d{2}\s?\d{2}/)
  })
})
