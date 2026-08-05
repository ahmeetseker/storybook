import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type {
  ListingApproximateGeo,
  ListingLocation,
  ListingNearbyPlace,
} from '../domain/listing-detail-types'
import { ListingLocationSection, formatDistance } from './ListingLocationSection'

const LOCATION: ListingLocation = {
  city: 'Muğla',
  district: 'Milas',
  neighbourhood: 'Ören',
}

const GEO: ListingApproximateGeo = {
  kind: 'geographic',
  lat: 37.2984,
  lng: 27.4321,
  radiusMeters: 250,
  sourceLabel: 'İlan sahibi beyanı · yaklaşık alan',
}

/** Coğrafi olmayan varyant: arama kaydının şematik yerleşimi. */
const SCHEMATIC_GEO: ListingApproximateGeo = {
  kind: 'schematic',
  x: 0.42,
  y: 0.61,
  sourceLabel: 'Arama kaydının şematik yerleşimi',
}

const NEARBY: ListingNearbyPlace[] = [
  { id: 'okul', label: 'Ören İlkokulu', kind: 'school', distanceMeters: 1400 },
  { id: 'durak', label: 'Milas–Ören dolmuş durağı', kind: 'transit', distanceMeters: 650 },
  { id: 'sahil', label: 'Ören sahili', kind: 'coast', distanceMeters: 900 },
]

describe('formatDistance', () => {
  it('1 km altını metre, üstünü tek ondalıklı kilometre yazar', () => {
    expect(formatDistance(650)).toBe('650 m')
    expect(formatDistance(900)).toBe('900 m')
    expect(formatDistance(1400)).toBe('1,4 km')
    expect(formatDistance(2000)).toBe('2 km')
    expect(formatDistance(12_500)).toBe('12,5 km')
  })

  it('geçersiz değerde mesafe uydurmaz', () => {
    expect(formatDistance(Number.NaN)).toBe('Bilinmiyor')
    expect(formatDistance(Number.POSITIVE_INFINITY)).toBe('Bilinmiyor')
    expect(formatDistance(-10)).toBe('Bilinmiyor')
  })
})

describe('ListingLocationSection', () => {
  it('bölümü işaretler ve idari konumu yazar', () => {
    const { container } = render(<ListingLocationSection location={LOCATION} geo={GEO} />)
    const section = container.querySelector('[data-listing-section="location"]')
    expect(section).toBeTruthy()
    expect(section?.id).toBe('konum')
    expect(screen.getByText('Muğla')).toBeTruthy()
    expect(screen.getByText('Milas')).toBeTruthy()
    expect(screen.getByText('Ören')).toBeTruthy()
  })

  it('başlık seviyeleri: bölüm h2, blokları h3', () => {
    render(<ListingLocationSection location={LOCATION} geo={GEO} nearby={NEARBY} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Konum ve çevresi' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Yaklaşık konum' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Çevredeki noktalar' })).toBeTruthy()
  })

  it('geo varken haritayı çizer ve yaklaşıklık ile kaynağı görünür yazar', () => {
    render(<ListingLocationSection location={LOCATION} geo={GEO} />)
    const map = screen.getByRole('group', { name: 'Yaklaşık konum haritası' })
    expect(map).toBeTruthy()

    // Harita dekoratif değil: erişilebilir metin karşılığı DOM'da ve haritaya bağlı.
    const describedBy = map.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const summary = document.getElementById(describedBy as string)
    expect(summary?.textContent).toMatch(/Yaklaşık konum/)
    expect(summary?.textContent).toMatch(/250 m yarıçaplı alan/)
    expect(summary?.textContent).toMatch(/kaynak: İlan sahibi beyanı · yaklaşık alan/)
  })

  // Coğrafi varyantta zemin artık GERÇEK haritadır; mahremiyet iddiası
  // dairenin kendisiyle taşınır ve metin bunu ölçüyle birlikte söyler.
  it('dairenin tam yeri göstermediğini ve zeminin gerçek olduğunu söyler', () => {
    render(<ListingLocationSection location={LOCATION} geo={GEO} />)
    expect(screen.getByText(/parselin tam yerini göstermez/i)).toBeTruthy()
    expect(screen.getByText(/zemin\s+gerçek haritadır/i)).toBeTruthy()
  })

  it('geo yokken harita hiç çizilmez, gerekçe metni kalır', () => {
    render(<ListingLocationSection location={LOCATION} nearby={NEARBY} />)
    expect(screen.queryByRole('group', { name: 'Yaklaşık konum haritası' })).toBeNull()
    expect(screen.getByText(/haritada gösterilebilecek bir koordinat yok/i)).toBeTruthy()
    // İdari konum yine de durur.
    expect(screen.getByText('Milas')).toBeTruthy()
  })

  it('mahalle yoksa yokluğu kelimeyle yazar, boş ayraç bırakmaz', () => {
    const { container } = render(
      <ListingLocationSection location={{ city: 'Muğla', district: 'Milas' }} geo={GEO} />,
    )
    expect(screen.getByText('Mahalle bilgisi bu kayıtta yok.')).toBeTruthy()
    expect(container.textContent).not.toMatch(/undefined/)
    expect(container.textContent).not.toMatch(/Milas · ·/)
  })

  it('çevredeki noktaları kuş uçuşu etiketiyle ve mesafeye göre sıralı listeler', () => {
    render(<ListingLocationSection location={LOCATION} geo={GEO} nearby={NEARBY} />)
    expect(screen.getByText(/Mesafeler kuş uçuşudur/i)).toBeTruthy()

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toMatch(/Ulaşım/)
    expect(items[0].textContent).toMatch(/Milas–Ören dolmuş durağı/)
    expect(items[0].textContent).toMatch(/650 m/)
    expect(items[1].textContent).toMatch(/Ören sahili/)
    expect(items[2].textContent).toMatch(/1,4 km/)
    // Tür bilgisi renge/ikona değil kelimeye bağlıdır.
    expect(items[1].textContent).toMatch(/Sahil/)
    expect(items[2].textContent).toMatch(/Eğitim/)
  })

  it('şematik geo ile çizim gelir ama koordinat kaydı olmadığı açıkça yazılır', () => {
    render(<ListingLocationSection location={LOCATION} geo={SCHEMATIC_GEO} />)

    // Çizim var: bölüm haritasız/çıplak kalmaz.
    const map = screen.getByRole('group', { name: 'Şematik konum yerleşimi' })
    expect(map).toBeTruthy()

    // Ama coğrafi bir iddia yok — ve bu erişilebilir özet metnindedir.
    const summary = document.getElementById(map.getAttribute('aria-describedby') as string)
    expect(summary?.textContent).toMatch(/Şematik yerleşim/)
    expect(summary?.textContent).toMatch(/coğrafi koordinat kaydı yok/)
    expect(summary?.textContent).toMatch(/Arama kaydının şematik yerleşimi/)

    expect(screen.getByRole('heading', { level: 3, name: 'Şematik yerleşim' })).toBeTruthy()
    expect(screen.getByText(/Bu çizim bir harita değildir/)).toBeTruthy()
  })

  it('şematik varyant yaklaşık konum ve mahremiyet dilini hiç kullanmaz', () => {
    const { container } = render(
      <ListingLocationSection location={LOCATION} geo={SCHEMATIC_GEO} />,
    )
    // Mahremiyet dairesi ancak gerçek bir koordinat gizlenirken anlamlıdır.
    expect(container.textContent).not.toMatch(/mahremiyet/i)
    expect(container.textContent).not.toMatch(/yarıçaplı alan/)
    expect(container.textContent).not.toMatch(/parselin tam merkezi değildir/i)
    expect(screen.queryByRole('heading', { level: 3, name: 'Yaklaşık konum' })).toBeNull()
    expect(screen.queryByRole('group', { name: 'Yaklaşık konum haritası' })).toBeNull()
    // Koordinat yokluğu cümlesi de yazılmaz: çizim gerçekten gösteriliyor.
    expect(screen.queryByText(/haritada gösterilebilecek bir koordinat yok/i)).toBeNull()
  })

  it('coğrafi varyant şematik metinlerden etkilenmez', () => {
    const { container } = render(<ListingLocationSection location={LOCATION} geo={GEO} />)
    expect(container.textContent).not.toMatch(/Şematik yerleşim/)
    expect(container.textContent).not.toMatch(/coğrafi koordinat kaydı yok/)
    expect(screen.getByRole('heading', { level: 3, name: 'Yaklaşık konum' })).toBeTruthy()
    expect(screen.getByText(/parselin tam yerini göstermez/i)).toBeTruthy()
  })

  it('nearby boş ya da yokken liste yerine yokluk cümlesi durur', () => {
    const { rerender } = render(<ListingLocationSection location={LOCATION} geo={GEO} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText(/çevredeki noktalar derlenmedi/i)).toBeTruthy()

    rerender(<ListingLocationSection location={LOCATION} geo={GEO} nearby={[]} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText(/çevredeki noktalar derlenmedi/i)).toBeTruthy()
  })
})
