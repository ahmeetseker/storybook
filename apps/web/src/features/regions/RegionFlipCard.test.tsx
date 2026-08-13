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

  it('harita ilk çevirmeye kadar mount edilmez, çevirince bölge haritası gelir', () => {
    renderCard()
    expect(screen.queryByRole('group', { name: 'Urla ilan haritası' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Haritada gör' }))
    expect(screen.getByRole('group', { name: 'Urla ilan haritası' })).toBeTruthy()
  })

  it('hover kartı çevirir, ayrılınca geri döner', () => {
    const { container } = renderCard()
    const root = container.firstElementChild as HTMLElement
    fireEvent.mouseEnter(root)
    expect(root.dataset.flipped).toBe('true')
    fireEvent.mouseLeave(root)
    expect(root.dataset.flipped).toBe('false')
  })

  it('pindeki ilana popup üzerinden gidilir', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'İlana git' }))
    expect(props.onOpenListing).toHaveBeenCalledTimes(1)
    expect(props.onOpenListing).toHaveBeenCalledWith(expect.stringMatching(/^listing-/))
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
