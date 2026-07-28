import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlassListingDetailHeader } from './GlassListingDetailHeader'

const BASE = {
  title: "Ören'de 4.850 m² tarla",
  price: '8.750.000 ₺',
  priceUnit: '1.804 ₺/m²',
}

describe('GlassListingDetailHeader', () => {
  it('varsayılan olarak h1 render eder', () => {
    render(<GlassListingDetailHeader {...BASE} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain("Ören'de")
  })

  it('headingLevel ile başlık seviyesi ayarlanabilir', () => {
    render(<GlassListingDetailHeader {...BASE} headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2 })).toBeTruthy()
  })

  it('meta öğelerini etiket/değer çifti olarak dl içinde verir', () => {
    render(
      <GlassListingDetailHeader
        {...BASE}
        meta={[
          { id: 'no', label: 'İlan no', value: '2026-114-8207' },
          { id: 'updated', label: 'Güncelleme', value: '21 Tem 2026' },
        ]}
      />,
    )
    expect(screen.getByText('İlan no').tagName).toBe('DT')
    expect(screen.getByText('2026-114-8207').tagName).toBe('DD')
  })

  it('varsayılan malzeme flat — cam bütçesini tüketmez', () => {
    const { container } = render(<GlassListingDetailHeader {...BASE} />)
    expect(container.querySelectorAll('[data-material="glass"]').length).toBe(0)
  })

  it('fiyatı ve birim fiyatı ayrı okunabilir metinler olarak verir', () => {
    render(<GlassListingDetailHeader {...BASE} priceNote="4.850 m² beyan" />)
    expect(screen.getByText('8.750.000 ₺')).toBeTruthy()
    expect(screen.getByText('1.804 ₺/m²')).toBeTruthy()
    expect(screen.getByText('4.850 m² beyan')).toBeTruthy()
  })

  it('utilities slotunu başlık bölgesinde render eder', () => {
    render(<GlassListingDetailHeader {...BASE} utilities={<button type="button">Kaydet</button>} />)
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeTruthy()
  })

  it('durum metnini yalnız renkle değil metinle taşır', () => {
    render(<GlassListingDetailHeader {...BASE} status={{ label: 'Aktif ilan', tone: 'success' }} />)
    expect(screen.getByText('Aktif ilan')).toBeTruthy()
  })
})
