import { render, screen, within } from '@testing-library/react'
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
  // Başlık sahnenin cam plakasındadır; bölümler h2 taşır. Soru omurgasının
  // satırları başlık DEĞİLDİR — onlar açılır kontrollerdir ve h2 sayısını
  // şişirip başlık listesini gezinilmez hale getirmezler.
  it('başlık hiyerarşisi tek h1 ve h2 bölümlerinden oluşur', async () => {
    await renderPage()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    const level2 = screen.getAllByRole('heading', { level: 2 })
    expect(level2.length).toBeGreaterThanOrEqual(2)
    expect(level2.map((node) => node.textContent)).toContain('Alıcıların sorduğu sırayla')
    expect(level2.map((node) => node.textContent)).toContain('Neyi, ne zaman doğruladık')
  })

  // Sayfa içi çapa gezinmesi yerini soru omurgasına bıraktı; yine de sayfada
  // duran her `#` bağlantısının hedefi bulunmalıdır — kırık çapa kalmaz.
  it('sayfa içi bağlantıların hedefi mevcuttur', async () => {
    const { container } = await renderPage()
    for (const anchor of Array.from(container.querySelectorAll('a[href^="#"]'))) {
      const id = anchor.getAttribute('href')?.slice(1)
      if (!id) continue
      expect(container.querySelector(`#${CSS.escape(id)}`)).toBeTruthy()
    }
  })

  // Her soru kapalıyken de cevaplıdır ve açılır kontrol olarak duyurulur.
  it('soru omurgası aria-expanded taşır ve kapalıyken de cevaplıdır', async () => {
    await renderPage()
    const spine = screen.getByRole('heading', { name: 'Alıcıların sorduğu sırayla' })
      .parentElement!
    const triggers = Array.from(spine.querySelectorAll('[aria-expanded]'))
    expect(triggers.length).toBeGreaterThanOrEqual(5)
    for (const trigger of triggers) {
      // Kapalı satır da metin taşır: cevap açılır katmanda saklanmaz.
      expect(trigger.textContent?.trim().length ?? 0).toBeGreaterThan(20)
    }
  })

  // Durum kelimeleri sayfada birden çok satırda geçer (doğrulama vektörünün her
  // satırı kendi durumunu yazar), bu yüzden `getAllByText` kullanılır: aranan
  // şey tekillik değil, durumun renk dışında metinle de taşınıyor olmasıdır.
  it('durum yalnız renkle değil metinle de taşınır', async () => {
    await renderPage()
    expect(screen.getAllByText('Olumlu').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Olumsuz').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Eksik').length).toBeGreaterThan(0)
  })

  // Doğrulama vektörü çıplak "Doğrulandı" damgası vurmaz: olumlu satırların
  // hepsi doğrulama değildir (ör. platform moderasyonu). Çelişki kelimesi
  // yalnız çelişkinin gerçekten bildirildiği künyede kalır.
  it('olumlu doğrulama satırına çıplak "Doğrulandı" damgası vurmaz', async () => {
    await renderPage()
    const moderation = screen.getByText('Platform moderasyonu tamamlandı')
    const row = moderation.closest('li')
    expect(row).toBeTruthy()
    expect(within(row!).getByText('Olumlu')).toBeTruthy()
    expect(within(row!).queryByText('Doğrulandı')).toBeNull()
    expect(screen.queryByText('Çelişkili')).toBeNull()
    expect(screen.getAllByText(/Kaynaklar çelişiyor/).length).toBeGreaterThan(0)
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

  // Numara sağlayıcısı bağlı değil → satıcı bölümünde kontrol yok → rayın
  // ikincil eylemi devre dışı kalır ve nedeni yazılır (rules.md §4).
  it('numara sağlayıcısı yokken rayın ikincil eylemi devre dışı ve gerekçeli kalır', async () => {
    await renderPage()
    expect(screen.getByRole('button', { name: 'Satıcı bilgilerine git' })).toHaveProperty(
      'disabled',
      true,
    )
    expect(screen.getByText(/açılabilecek bir numara kontrolü yok/i)).toBeTruthy()
  })

  it('iletişim kapalıyken rayın ikincil eylemi devre dışı kalır', async () => {
    await renderPage(async () => '0 (252) 000 00 00', 'inactive')
    expect(screen.getByRole('button', { name: 'Satıcı bilgilerine git' })).toHaveProperty(
      'disabled',
      true,
    )
    expect(screen.queryByRole('button', { name: 'Numarayı göster' })).toBeNull()
  })

  it('numara açılmadan önce sayfa kaynağında telefon numarası bulunmaz', async () => {
    const { container } = await renderPage(async () => '0 (252) 000 00 00')
    expect(container.textContent).not.toMatch(/\d{3}\s?\d{2}\s?\d{2}\s?\d{2}/)
  })
})
