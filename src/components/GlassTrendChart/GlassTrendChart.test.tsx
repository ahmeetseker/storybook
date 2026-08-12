import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlassTrendChart, type GlassTrendSeries } from './GlassTrendChart'

// Recharts jsdom notu: genişlik ölçülemediği için 600px fallback ile çizilir.
// Çizgiler Line sırasıyla render edilir — seri sırası = path sırası; kesik
// desenleri path'in stroke-dasharray'inden okunur. Hover/tooltip etkileşimi
// Recharts'ın kendi sözleşmesidir (upstream test edilir).
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

const curves = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<SVGPathElement>('.recharts-line-curve'))

describe('GlassTrendChart', () => {
  it('her seri için künye satırı ve çizgi çizer', () => {
    const { container } = render(<GlassTrendChart series={[mahalle, ilce]} valueSuffix=" TL/m²" />)
    const kunye = screen.getByRole('list')
    expect(within(kunye).getByText('Feneryolu')).toBeTruthy()
    expect(within(kunye).getByText('Kadıköy ortalaması')).toBeTruthy()
    expect(curves(container)).toHaveLength(2)
  })

  it('seri sınıfını renkten bağımsız ikinci kanalla iletir: kesikli çizgi + rozet', () => {
    const { container } = render(<GlassTrendChart series={[mahalle, ilce]} />)
    const [gozlem, referans] = curves(container)
    expect(gozlem.getAttribute('stroke-dasharray')).toBeNull()
    expect(referans.getAttribute('stroke-dasharray')).toBe('8 4')
    expect(screen.getByText('referans')).toBeTruthy()
  })

  it('tahmin serisi "tahmin" rozetiyle ve kısa kesikle ayrılır', () => {
    const { container } = render(
      <GlassTrendChart series={[mahalle, { ...ilce, id: 'th', label: 'Model', kind: 'estimated' }]} />,
    )
    const [, tahmin] = curves(container)
    expect(tahmin.getAttribute('stroke-dasharray')).toBe('5 3 1 3')
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
    const desenler = curves(container)
      .slice(1)
      .map((l) => l.getAttribute('stroke-dasharray'))
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
    const d = curves(container)[0]?.getAttribute('d') ?? ''
    // İki ayrı M komutu = iki kopuk parça (connectNulls kapalı).
    expect(d.match(/M/g)).toHaveLength(2)
  })

  it('null değer veri tablosunda "veri yok" olarak okunur', () => {
    render(
      <GlassTrendChart
        series={[{ id: 'b', label: 'Boşluklu', points: [{ x: 'Oca', y: 10 }, { x: 'Şub', y: null }] }]}
      />,
    )
    expect(screen.getByText('veri yok')).toBeTruthy()
  })

  it('çizim alanı role="img" + seri adlarını içeren aria özet taşır', () => {
    render(<GlassTrendChart series={[mahalle, ilce]} title="Seyir" />)
    const plot = screen.getByRole('img')
    expect(plot.getAttribute('aria-label')).toBe('Seyir: Feneryolu, Kadıköy ortalaması — 3 dönem')
  })

  it('boş seride "Veri yok" gösterir', () => {
    render(<GlassTrendChart series={[]} />)
    expect(screen.getByText('Veri yok')).toBeTruthy()
  })
})
