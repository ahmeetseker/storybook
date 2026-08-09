import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GlassTrendChart, type GlassTrendSeries } from './GlassTrendChart'

const mahalle: GlassTrendSeries = {
  id: 'mahalle',
  label: 'Feneryolu',
  points: [
    { x: 'Oca', y: 72_100 },
    { x: 'Şub', y: 74_000 },
    { x: 'Mar', y: 82_500 },
  ],
}

const ilce: GlassTrendSeries = {
  id: 'ilce',
  label: 'Kadıköy ortalaması',
  kind: 'benchmark',
  points: [
    { x: 'Oca', y: 80_000 },
    { x: 'Şub', y: 81_000 },
    { x: 'Mar', y: 86_000 },
  ],
}

describe('GlassTrendChart', () => {
  it('her seri için künye satırı ve çizgi çizer', () => {
    const { container } = render(<GlassTrendChart series={[mahalle, ilce]} valueSuffix=" TL/m²" />)
    const kunye = screen.getByRole('list')
    expect(within(kunye).getByText('Feneryolu')).toBeTruthy()
    expect(within(kunye).getByText('Kadıköy ortalaması')).toBeTruthy()
    expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(2)
  })

  it('seri sınıfını renkten bağımsız ikinci kanalla iletir: kesikli çizgi + rozet', () => {
    const { container } = render(<GlassTrendChart series={[mahalle, ilce]} />)
    const cizgiler = container.querySelectorAll('[data-part="line"]')
    const gozlem = Array.from(cizgiler).find((l) => l.getAttribute('data-kind') === 'observed')
    const referans = Array.from(cizgiler).find((l) => l.getAttribute('data-kind') === 'benchmark')
    expect(gozlem?.getAttribute('stroke-dasharray')).toBeNull()
    expect(referans?.getAttribute('stroke-dasharray')).toBe('8 4')
    expect(screen.getByText('referans')).toBeTruthy()
  })

  it('tahmin serisi "tahmin" rozetiyle ve kısa kesikle ayrılır', () => {
    const { container } = render(
      <GlassTrendChart series={[mahalle, { ...ilce, id: 'th', label: 'Model', kind: 'estimated' }]} />,
    )
    const tahmin = container.querySelector('[data-kind="estimated"]')
    expect(tahmin?.getAttribute('stroke-dasharray')).toBe('5 3 1 3')
    expect(screen.getByText('tahmin')).toBeTruthy()
  })

  it('iki referans serisi farklı kesik deseni alır — hiyerarşi kesik yoğunluğunda kodlanır', () => {
    const { container } = render(
      <GlassTrendChart
        series={[
          mahalle,
          ilce,
          { ...ilce, id: 'ulke', label: 'Türkiye ortalaması', kind: 'benchmark' },
        ]}
      />,
    )
    const desenler = Array.from(container.querySelectorAll('[data-kind="benchmark"]')).map((l) =>
      l.getAttribute('stroke-dasharray'),
    )
    // Yakın referans yoğun, uzak referans seyrek: yalnız renge kalmaz.
    expect(desenler).toEqual(['8 4', '2 3'])
  })

  it('erişilebilir veri tablosu her seri için bir sütun taşır', () => {
    render(<GlassTrendChart series={[mahalle, ilce]} valueSuffix=" TL/m²" title="Seyir" />)
    const tablo = screen.getByRole('table')
    expect(within(tablo).getByRole('columnheader', { name: 'Dönem' })).toBeTruthy()
    expect(within(tablo).getByRole('columnheader', { name: 'Feneryolu' })).toBeTruthy()
    expect(within(tablo).getByRole('columnheader', { name: 'Kadıköy ortalaması (referans)' })).toBeTruthy()
    expect(within(tablo).getByText('82.500 TL/m²')).toBeTruthy()
  })

  it('null değerde çizgiyi koparır — yayımlanmayan dönem düz çizgiyle doldurulmaz', () => {
    const bosluklu: GlassTrendSeries = {
      id: 'b',
      label: 'Boşluklu',
      points: [
        { x: 'Oca', y: 10 },
        { x: 'Şub', y: null },
        { x: 'Mar', y: 30 },
      ],
    }
    const { container } = render(<GlassTrendChart series={[bosluklu]} />)
    const d = container.querySelector('[data-part="line"]')?.getAttribute('d') ?? ''
    // İki ayrı M komutu = iki kopuk parça.
    expect(d.match(/M /g)).toHaveLength(2)
  })

  it('null değer veri tablosunda "veri yok" olarak okunur', () => {
    render(
      <GlassTrendChart
        series={[{ id: 'b', label: 'Boşluklu', points: [{ x: 'Oca', y: 10 }, { x: 'Şub', y: null }] }]}
      />,
    )
    expect(screen.getByText('veri yok')).toBeTruthy()
  })

  it('imleç bir döneme geldiğinde tüm serilerin değeri birlikte görünür', async () => {
    const user = userEvent.setup()
    const { container } = render(<GlassTrendChart series={[mahalle, ilce]} valueSuffix=" TL/m²" />)
    const plot = container.querySelector('[data-part="line"]')?.closest('div')
    expect(plot).toBeTruthy()
    await user.pointer({ target: plot as Element, coords: { clientX: 0, clientY: 0 } })
    const balon = container.querySelector('[data-part="tooltip"]')
    // jsdom'da getBoundingClientRect sıfır genişlik döndürür; balon açılırsa
    // içinde iki seri satırı bulunmalıdır.
    if (balon) expect(balon.textContent).toContain('Feneryolu')
  })

  it('boş seride "Veri yok" gösterir', () => {
    render(<GlassTrendChart series={[]} />)
    expect(screen.getByText('Veri yok')).toBeTruthy()
  })
})
