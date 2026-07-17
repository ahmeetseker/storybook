import type { ComponentProps } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassChart } from './GlassChart'

// 5 nokta: index0..4, x-ekseni yalnız ilk/orta(idx2)/son(idx4) gösterir.
const points = [
  { x: 'Oca 26', y: 100000 },
  { x: 'Şub 26', y: 130000 },
  { x: 'Mar 26', y: 90000 },
  { x: 'Nis 26', y: 175000 },
  { x: 'May 26', y: 150000 },
]

const renderChart = (props: Partial<ComponentProps<typeof GlassChart>> = {}) =>
  render(<GlassChart points={points} {...props} />)

// Plot kutusunu 600px genişliğe sabitler ki pointer→index eşlemesi deterministik olsun.
const mockPlotRect = (plot: HTMLElement, width = 600) => {
  plot.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: width, bottom: 220, width, height: 220, x: 0, y: 0, toJSON: () => {} }) as DOMRect
}

describe('GlassChart', () => {
  it('svg role="img" + aria-label özet taşır (ilk ve son değerin kısa biçimi)', () => {
    renderChart({ title: 'Fiyat geçmişi' })
    const svg = screen.getByRole('img')
    expect(svg.getAttribute('aria-label')).toBe("Fiyat geçmişi: 100K'den 150K'ye")
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

  it('son nokta değer etiketi formatlanmış değeri gösterir', () => {
    const { container } = renderChart()
    const lastLabel = container.querySelector('[data-part="last-label"]')
    expect(lastLabel?.textContent).toBe('150.000 TL')
  })

  it('y max/min etiketleri tabular formatlanmış değerleri gösterir', () => {
    const { container } = renderChart()
    expect(container.querySelector('[data-part="y-max"]')?.textContent).toBe('175.000 TL')
    expect(container.querySelector('[data-part="y-min"]')?.textContent).toBe('90.000 TL')
  })

  it('showGrid=false grid çizgilerini kaldırır', () => {
    const { container: withGrid } = renderChart({ showGrid: true })
    expect(withGrid.querySelectorAll('[data-part="grid"]')).toHaveLength(4)

    const { container: withoutGrid } = renderChart({ showGrid: false })
    expect(withoutGrid.querySelectorAll('[data-part="grid"]')).toHaveLength(0)
  })

  it("type='bar' her nokta için bir sütun render eder, son sütun işaretlidir", () => {
    const { container } = renderChart({ type: 'bar' })
    const bars = container.querySelectorAll('[data-part="bar"]')
    expect(bars).toHaveLength(5)
    expect(bars[4].getAttribute('data-last')).toBe('true')
    expect(bars[0].getAttribute('data-last')).toBeNull()
  })

  it("type='area' gradyanlı path + linearGradient render eder", () => {
    const { container } = renderChart({ type: 'area' })
    expect(container.querySelector('[data-part="area"]')).toBeTruthy()
    expect(container.querySelector('linearGradient')).toBeTruthy()
  })

  it('x ekseni yalnız ilk/orta/son etiketleri gösterir', () => {
    const { container } = renderChart()
    const spans = container.querySelectorAll('[data-part="x-labels"] > span')
    expect(Array.from(spans).map((s) => s.textContent)).toEqual(['Oca 26', 'Mar 26', 'May 26'])
  })

  it('pointermove en yakın noktaya kılavuz + değer balonu gösterir, pointerleave gizler', () => {
    const { container } = renderChart()
    const svg = screen.getByRole('img')
    const plot = svg.parentElement as HTMLElement
    mockPlotRect(plot)

    expect(container.querySelector('[data-part="tooltip"]')).toBeNull()

    // fraction 150/600 = 0.25 * (5-1) = 1 → index 1 ('Şub 26', 130000)
    fireEvent.pointerMove(plot, { clientX: 150, pointerId: 1 })
    const tooltip = container.querySelector('[data-part="tooltip"]') as HTMLElement
    expect(tooltip).toBeTruthy()
    expect(within(tooltip).getByText('Şub 26')).toBeTruthy()
    expect(within(tooltip).getByText('130.000 TL')).toBeTruthy()

    fireEvent.pointerLeave(plot)
    expect(container.querySelector('[data-part="tooltip"]')).toBeNull()
  })

  it('dokunmatikte pointerdown (tap) aynı işi yapar', () => {
    const { container } = renderChart()
    const svg = screen.getByRole('img')
    const plot = svg.parentElement as HTMLElement
    mockPlotRect(plot)

    // fraction 600/600 = 1 * 4 → index 4 ('May 26', 150000)
    fireEvent.pointerDown(plot, { clientX: 600, pointerId: 1 })
    const tooltip = container.querySelector('[data-part="tooltip"]') as HTMLElement
    expect(within(tooltip).getByText('May 26')).toBeTruthy()
    expect(within(tooltip).getByText('150.000 TL')).toBeTruthy()
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

  it('hover açıkken points kısalırsa sınır dışı index TypeError atmadan clamp edilir', () => {
    const { container, rerender } = renderChart()
    const svg = screen.getByRole('img')
    const plot = svg.parentElement as HTMLElement
    mockPlotRect(plot)

    // fraction 600/600 = 1 * 4 → index 4 (son nokta, dizinin son elemanı)
    fireEvent.pointerMove(plot, { clientX: 600, pointerId: 1 })
    const initialTooltip = container.querySelector('[data-part="tooltip"]') as HTMLElement
    expect(within(initialTooltip).getByText('May 26')).toBeTruthy()

    // points 2 elemana düşürülür — eski hoverIndex (4) artık sınır dışı; crash beklenmez.
    const shortPoints = points.slice(0, 2)
    expect(() =>
      rerender(<GlassChart points={shortPoints} />),
    ).not.toThrow()

    // Clamp edilmiş index (yeni son eleman: idx1, 'Şub 26') ile tooltip/kılavuz tutarlı kalır.
    const tooltip = container.querySelector('[data-part="tooltip"]') as HTMLElement
    expect(tooltip).toBeTruthy()
    expect(within(tooltip).getByText('Şub 26')).toBeTruthy()
  })

  it("type='bar' tek değerli (eşit) seride sütunlar sıfır yükseklikte kaybolmaz", () => {
    const equalPoints = [
      { x: 'Oca 26', y: 150000 },
      { x: 'Şub 26', y: 150000 },
      { x: 'Mar 26', y: 150000 },
    ]
    const { container } = renderChart({ type: 'bar', points: equalPoints })
    const bars = container.querySelectorAll('[data-part="bar"]')
    expect(bars).toHaveLength(3)
    bars.forEach((bar) => {
      const barHeight = Number(bar.getAttribute('height'))
      expect(barHeight).toBeGreaterThan(0)
    })
  })

  it("type='line' tek değerli (eşit) seride çizgi dejenere olmadan ortada durur", () => {
    const equalPoints = [
      { x: 'Oca 26', y: 150000 },
      { x: 'Şub 26', y: 150000 },
      { x: 'Mar 26', y: 150000 },
    ]
    const { container } = renderChart({ type: 'line', points: equalPoints })
    const lastPoint = container.querySelector('[data-part="last-point"]')
    // Dejenere durumda yapay aralık sayesinde nokta plot alanının üst/alt sınırına
    // yapışmaz — plotTop(16) ile plotBottom(220-16=204) arasında bir yerde durur.
    const cy = Number(lastPoint?.getAttribute('cy'))
    expect(cy).toBeGreaterThan(16)
    expect(cy).toBeLessThan(204)
  })
})
