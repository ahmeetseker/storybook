import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlassDistributionChart, type GlassDistributionBin } from './GlassDistributionChart'

const bins: GlassDistributionBin[] = [
  { id: 'a', label: '< 60 bin', count: 8 },
  { id: 'b', label: '60–70 bin', count: 21 },
  { id: 'c', label: '80–90 bin', count: 34, containsMedian: true },
  { id: 'd', label: '100 bin +', count: 11 },
]

describe('GlassDistributionChart', () => {
  it('her bant için bir sütun çizer', () => {
    const { container } = render(<GlassDistributionChart bins={bins} />)
    expect(container.querySelectorAll('[data-part="bin"]')).toHaveLength(4)
  })

  it('son bandı değil MEDYAN bandını vurgular', () => {
    const { container } = render(<GlassDistributionChart bins={bins} />)
    const vurgulu = container.querySelectorAll('[data-median="true"]')
    expect(vurgulu).toHaveLength(1)
    // Vurgulanan üçüncü bant (medyan), dördüncü (son) değil.
    const hepsi = Array.from(container.querySelectorAll('[data-part="bin"]'))
    expect(hepsi.indexOf(vurgulu[0])).toBe(2)
  })

  it('medyan bandına renkten bağımsız dikey işaret koyar', () => {
    const { container } = render(<GlassDistributionChart bins={bins} />)
    expect(container.querySelector('[data-part="median-mark"]')).toBeTruthy()
  })

  it('medyan bandı yoksa hiçbir sütun vurgulanmaz', () => {
    const { container } = render(<GlassDistributionChart bins={bins.map((b) => ({ ...b, containsMedian: false }))} />)
    expect(container.querySelectorAll('[data-median="true"]')).toHaveLength(0)
    expect(container.querySelector('[data-part="median-mark"]')).toBeNull()
  })

  it('örneklem büyüklüğünü künyede gösterir', () => {
    render(<GlassDistributionChart bins={bins} sampleSize={121} countLabel="ilan" />)
    expect(screen.getByText('n = 121 ilan')).toBeTruthy()
  })

  it('persentil şeridini tanım listesi olarak verir', () => {
    render(
      <GlassDistributionChart
        bins={bins}
        markers={[
          { id: 'p25', label: 'P25', value: '72.900 TL/m²' },
          { id: 'p50', label: 'Medyan', value: '82.500 TL/m²', prominent: true },
        ]}
      />,
    )
    expect(screen.getByText('Medyan')).toBeTruthy()
    expect(screen.getByText('82.500 TL/m²')).toBeTruthy()
  })

  it('erişilebilir veri tablosu medyan bandını işaretler', () => {
    render(<GlassDistributionChart bins={bins} title="Dağılım" countLabel="ilan" />)
    const tablo = screen.getByRole('table')
    expect(within(tablo).getByRole('rowheader', { name: '80–90 bin (medyan bandı)' })).toBeTruthy()
  })

  it('boş bant listesinde "Veri yok" gösterir', () => {
    render(<GlassDistributionChart bins={[]} />)
    expect(screen.getByText('Veri yok')).toBeTruthy()
  })
})
