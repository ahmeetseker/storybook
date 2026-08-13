import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RegionFlipCard } from './RegionFlipCard'
import { REGIONS } from './data/region-adapter'

// Zemin (Leaflet) testte bilinçli olarak kurulamaz: GlassMap hata dalına düşer
// ve pinler şematik x/y yüzeyinde senkron render edilir (bkz. GlassMap rules §7).
vi.mock('leaflet', () => {
  throw new Error('test ortamında tile zemini yok')
})

const urla = REGIONS.find((region) => region.id === 'izmir-urla')!
const konyaalti = REGIONS.find((region) => region.id === 'antalya-konyaalti')!

function renderCard(overrides: Partial<Parameters<typeof RegionFlipCard>[0]> = {}) {
  const props = {
    region: urla,
    match: { ...urla, score: 68, reasons: ['Gelişim eğilimi güçlü.'] },
    compared: false,
    onSelect: vi.fn(),
    onToggleCompare: vi.fn(),
    onOpenListing: vi.fn(),
    ...overrides,
  }
  return { ...render(<RegionFlipCard {...props} />), props }
}

describe('RegionFlipCard', () => {
  it('ön yüzde bölge kimliğini, metrikleri ve aksiyonları gösterir', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: 'Urla' })).toBeTruthy()
    expect(screen.getByText('m² fiyatı')).toBeTruthy()
    expect(screen.getByText('aktif ilan')).toBeTruthy()
    expect(screen.getByText('%68')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Bölgeyi incele' })).toBeTruthy()
  })

  it('ön yüzde 12 aylık fiyat grafiği durur', () => {
    renderCard()
    expect(screen.getAllByText('Son 12 ay m² fiyatı').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
  })

  it('harita ilk çevirmeye kadar mount edilmez, çevirince bölge haritası gelir', () => {
    renderCard()
    expect(screen.queryByRole('group', { name: 'Urla ilan haritası' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Haritada gör' }))
    expect(screen.getByRole('group', { name: 'Urla ilan haritası' })).toBeTruthy()
  })

  it('kartın üstüne gelmek çevirmez; yalnız Haritada gör butonu çevirir', () => {
    const { container } = renderCard()
    const root = container.firstElementChild as HTMLElement
    fireEvent.mouseEnter(root)
    expect(root.dataset.flipped).toBe('false')
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Haritada gör' }))
    expect(root.dataset.flipped).toBe('true')
    fireEvent.mouseLeave(root)
    expect(root.dataset.flipped).toBe('false')
  })

  it('pine tıklayınca harita içine sabit önizleme açılır; İlana git yönlendirir', async () => {
    const { props } = renderCard()
    fireEvent.click(screen.getByRole('button', { name: 'Haritada gör' }))
    const pinButton = await waitFor(() => {
      const found = screen
        .getAllByRole('button')
        .find((button) => /^₺/.test(button.textContent ?? ''))
      expect(found).toBeTruthy()
      return found!
    })
    fireEvent.click(pinButton!)
    // Tıklama henüz yönlendirmez: önce harita içinde önizleme kartı açılır.
    expect(props.onOpenListing).not.toHaveBeenCalled()
    // Önizleme bilgilendiricidir: ilan görseli, güven rozeti ve AI değerlendirmesi taşır.
    expect(screen.getByRole('img', { name: /ilan görseli/ })).toBeTruthy()
    expect(screen.getByText(/AI uyum/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'İlana git' }))
    expect(props.onOpenListing).toHaveBeenCalledTimes(1)
    expect(props.onOpenListing).toHaveBeenCalledWith(expect.stringMatching(/^listing-/))
  })

  it('önizleme kapatma ile kapanır', async () => {
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: 'Haritada gör' }))
    const pinButton = await waitFor(() => {
      const found = screen
        .getAllByRole('button')
        .find((button) => /^₺/.test(button.textContent ?? ''))
      expect(found).toBeTruthy()
      return found!
    })
    fireEvent.click(pinButton!)
    fireEvent.click(screen.getByRole('button', { name: 'Önizlemeyi kapat' }))
    expect(screen.queryByRole('button', { name: 'İlana git' })).toBeNull()
  })

  it('İncele mobil sayfayı (sheet) açar: sinyaller, grafik ve harita orada', async () => {
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: 'İncele' }))
    const sheet = await screen.findByRole('dialog', { name: /Çeşme|Urla/ })
    expect(sheet).toBeTruthy()
    expect(screen.getAllByText('Son 12 ay m² fiyatı').length).toBeGreaterThan(1)
    await waitFor(() => expect(screen.getByRole('group', { name: 'Urla ilan haritası' })).toBeTruthy())
  })

  it('ilanı olmayan bölgede harita yerine boş durum anlatılır', () => {
    renderCard({
      region: konyaalti,
      match: { ...konyaalti, score: 55, reasons: [] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Haritada gör' }))
    expect(screen.getByText('Bu bölgede haritalanmış ilan yok')).toBeTruthy()
    expect(screen.queryByRole('group', { name: 'Konyaaltı ilan haritası' })).toBeNull()
  })
})
