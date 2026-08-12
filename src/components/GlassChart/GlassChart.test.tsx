import type { ComponentProps } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { GlassChart } from './GlassChart'

// Recharts jsdom notu: kap genişliği ölçülemediği için component 600px
// fallback'iyle çizer — geometri deterministiktir. Hover/tooltip etkileşimi
// Recharts'ın kendi sözleşmesidir (upstream test edilir); burada yalnız
// bizim kurduğumuz yapı sınanır.
const points = [
  { x: 'Oca 26', y: 100000 },
  { x: 'Şub 26', y: 130000 },
  { x: 'Mar 26', y: 90000 },
  { x: 'Nis 26', y: 175000 },
  { x: 'May 26', y: 150000 },
]

const renderChart = (props: Partial<ComponentProps<typeof GlassChart>> = {}) =>
  render(<GlassChart points={points} {...props} />)

describe('GlassChart', () => {
  it('çizim alanı role="img" + aria-label özet taşır (ilk ve son değerin kısa biçimi)', () => {
    renderChart({ title: 'Fiyat geçmişi' })
    const plot = screen.getByRole('img')
    expect(plot.getAttribute('aria-label')).toBe("Fiyat geçmişi: 100K'den 150K'ye")
  })

  it('görsel gizli veri tablosu tüm noktaları içerir', () => {
    const { container } = renderChart()
    const table = container.querySelector('[data-part="data-table"]') as HTMLElement
    expect(table).toBeTruthy()
    const rows = within(table).getAllByRole('row')
    // 1 başlık satırı + 5 veri satırı
    expect(rows).toHaveLength(6)
    expect(within(table).getByText('Mar 26')).toBeTruthy()
    expect(within(table).getByText('90.000 TL')).toBeTruthy()
  })

  it('son nokta değer etiketi ve dolu daire yalnız son noktada render edilir', () => {
    const { container } = renderChart()
    const labels = container.querySelectorAll('[data-part="last-label"]')
    expect(labels).toHaveLength(1)
    expect(labels[0].textContent).toBe('150.000 TL')
    expect(container.querySelectorAll('[data-part="last-point"]')).toHaveLength(1)
  })

  it('y ekseni kısa biçimli tikler çizer (Recharts YAxis)', () => {
    const { container } = renderChart()
    const ticks = container.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick')
    expect(ticks.length).toBeGreaterThanOrEqual(2)
  })

  it('showGrid=false grid çizgilerini kaldırır', () => {
    const { container: withGrid } = renderChart({ showGrid: true })
    expect(withGrid.querySelectorAll('.recharts-cartesian-grid-horizontal line').length).toBeGreaterThan(0)

    const { container: withoutGrid } = renderChart({ showGrid: false })
    expect(withoutGrid.querySelectorAll('.recharts-cartesian-grid-horizontal line')).toHaveLength(0)
  })

  it("type='bar' her nokta için bir sütun render eder, yalnız son sütun tam opak", () => {
    const { container } = renderChart({ type: 'bar' })
    const bars = container.querySelectorAll('.recharts-bar-rectangle path')
    expect(bars).toHaveLength(5)
    const opacities = Array.from(bars).map((b) => b.getAttribute('opacity'))
    expect(opacities[4]).toBe('1')
    expect(opacities.slice(0, 4).every((o) => o === '0.5')).toBe(true)
  })

  it("type='area' gradyanlı dolgu + linearGradient render eder", () => {
    const { container } = renderChart({ type: 'area' })
    expect(container.querySelector('.recharts-area')).toBeTruthy()
    expect(container.querySelector('linearGradient')).toBeTruthy()
  })

  it('x ekseni tikleri render edilir (metin ölçümü jsdom dışı — yalnız yapı sınanır)', () => {
    const { container } = renderChart()
    const ticks = container.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick')
    expect(ticks.length).toBeGreaterThanOrEqual(2)
  })

  it('valueSuffix özelleştirilebilir (ör. TL/m²)', () => {
    const { container } = renderChart({ valueSuffix: ' TL/m²' })
    expect(container.querySelector('[data-part="last-label"]')?.textContent).toBe('150.000 TL/m²')
  })

  it('boş points dizisinde grafik yerine "Veri yok" mesajı gösterir', () => {
    renderChart({ points: [] })
    expect(screen.getByText('Veri yok')).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('points kısalınca yeniden render hatasız olur (stale state yok)', () => {
    const { rerender, container } = renderChart()
    expect(() => rerender(<GlassChart points={points.slice(0, 2)} />)).not.toThrow()
    expect(container.querySelector('[data-part="last-label"]')?.textContent).toBe('130.000 TL')
  })

  it("type='bar' tek değerli (eşit) seride sütunlar kaybolmaz", () => {
    const equalPoints = [
      { x: 'Oca 26', y: 150000 },
      { x: 'Şub 26', y: 150000 },
      { x: 'Mar 26', y: 150000 },
    ]
    const { container } = renderChart({ type: 'bar', points: equalPoints })
    expect(container.querySelectorAll('.recharts-bar-rectangle path')).toHaveLength(3)
  })

  it("type='line' tek değerli (eşit) seride son nokta plot içinde durur", () => {
    const equalPoints = [
      { x: 'Oca 26', y: 150000 },
      { x: 'Şub 26', y: 150000 },
      { x: 'Mar 26', y: 150000 },
    ]
    const { container } = renderChart({ type: 'line', points: equalPoints })
    const cy = Number(container.querySelector('[data-part="last-point"]')?.getAttribute('cy'))
    expect(cy).toBeGreaterThan(0)
    expect(cy).toBeLessThan(220)
  })
})
