import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { GlassCompareTable, type GlassCompareField, type GlassCompareListing } from './GlassCompareTable'

const fields: GlassCompareField[] = [
  { key: 'fiyat', label: 'Fiyat (TL)', higherIsBetter: false },
  { key: 'm2', label: 'Alan (m²)', higherIsBetter: true },
  { key: 'imar', label: 'İmar Durumu' },
]

const listings: GlassCompareListing[] = [
  {
    id: 'ilan-urla',
    title: 'İzmir Urla, deniz manzaralı imarlı arsa',
    values: { fiyat: 4250000, m2: 850, imar: 'Konut İmarlı' },
  },
  {
    id: 'ilan-bodrum',
    title: 'Muğla Bodrum, zeytinlikli tarla',
    values: { fiyat: 3100000, m2: 1200, imar: 'Tarla' },
  },
  {
    id: 'ilan-kas',
    title: 'Antalya Kaş, deniz manzaralı köşe arsa',
    values: { fiyat: 5400000, m2: 700, imar: 'Konut İmarlı' },
  },
]

describe('GlassCompareTable', () => {
  it('sütun başlıklarını scope="col", satır başlıklarını scope="row" ile render eder', () => {
    render(<GlassCompareTable fields={fields} listings={listings} aria-label="İlan karşılaştırması" />)
    const table = screen.getByRole('table', { name: 'İlan karşılaştırması' })
    expect(table).toBeDefined()
    expect(screen.getByRole('columnheader', { name: /İzmir Urla/ })).toBeDefined()
    expect(screen.getByRole('rowheader', { name: 'Fiyat (TL)' })).toBeDefined()
  })

  it('her ilanın değerlerini ilgili satır/sütun kesişiminde render eder', () => {
    render(<GlassCompareTable fields={fields} listings={listings} />)
    expect(screen.getByText('Tarla')).toBeDefined()
    // Sayısal değer tr-TR gruplamasıyla gösterilir
    expect(screen.getByText('3.100.000')).toBeDefined()
  })

  it('higherIsBetter=false alanda en düşük sayısal değer "(en iyi değer)" ile işaretlenir', () => {
    render(<GlassCompareTable fields={fields} listings={listings} />)
    const bestFiyatCell = screen.getByText('3.100.000').closest('td')
    expect(bestFiyatCell?.textContent).toContain('en iyi değer')
    const worstFiyatCell = screen.getByText('5.400.000').closest('td')
    expect(worstFiyatCell?.textContent).not.toContain('en iyi değer')
  })

  it('higherIsBetter=true alanda en yüksek sayısal değer işaretlenir', () => {
    render(<GlassCompareTable fields={fields} listings={listings} />)
    const bestAlanCell = screen.getByText('1.200').closest('td')
    expect(bestAlanCell?.textContent).toContain('en iyi değer')
  })

  it('higherIsBetter verilmeyen (string) alanda hiçbir hücre en iyi olarak işaretlenmez', () => {
    render(<GlassCompareTable fields={fields} listings={listings} />)
    const table = screen.getByRole('table')
    const imarRow = screen.getByRole('rowheader', { name: 'İmar Durumu' }).closest('tr')
    expect(imarRow).not.toBeNull()
    const cells = within(imarRow as HTMLElement).getAllByRole('cell')
    cells.forEach((cell) => expect(cell.textContent).not.toContain('en iyi değer'))
    expect(table).toBeDefined()
  })

  it('highlightDifferences=false verildiğinde farklı satırlar data-differs taşımaz', () => {
    const { container } = render(
      <GlassCompareTable fields={fields} listings={listings} highlightDifferences={false} />,
    )
    const differingRows = container.querySelectorAll('tr[data-differs]')
    expect(differingRows.length).toBe(0)
  })

  it('highlightDifferences (varsayılan) açıkken değeri farklı olan satır data-differs taşır, aynı olan taşımaz', () => {
    const sabitFields: GlassCompareField[] = [{ key: 'tapu', label: 'Tapu Durumu' }]
    const ayniDegerliListings: GlassCompareListing[] = listings.map((l) => ({
      ...l,
      values: { ...l.values, tapu: 'Müstakil Tapulu' },
    }))
    const { container } = render(<GlassCompareTable fields={[...fields, ...sabitFields]} listings={ayniDegerliListings} />)
    const rows = container.querySelectorAll('tbody tr')
    const tapuRow = Array.from(rows).find((r) => r.textContent?.includes('Tapu Durumu'))
    expect(tapuRow?.hasAttribute('data-differs')).toBe(false)
    const fiyatRow = Array.from(rows).find((r) => r.textContent?.includes('Fiyat'))
    expect(fiyatRow?.hasAttribute('data-differs')).toBe(true)
  })

  it('onRemove verildiğinde her sütun başlığında erişilebilir isimli kaldırma butonu render eder ve tıklanınca ilgili id ile çağrılır', () => {
    const onRemove = vi.fn()
    render(<GlassCompareTable fields={fields} listings={listings} onRemove={onRemove} />)
    const button = screen.getByRole('button', { name: 'Karşılaştırmadan çıkar: Muğla Bodrum, zeytinlikli tarla' })
    button.click()
    expect(onRemove).toHaveBeenCalledWith('ilan-bodrum')
  })

  it('onRemove verilmediğinde hiçbir kaldırma butonu render edilmez', () => {
    render(<GlassCompareTable fields={fields} listings={listings} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('4\'ten fazla ilan verilirse fazlası sessizce kırpılır — yalnız ilk 4 sütun render edilir', () => {
    const besInci: GlassCompareListing = { id: 'ilan-5', title: 'Beşinci İlan', values: { fiyat: 1, m2: 1, imar: 'x' } }
    const dorduncu: GlassCompareListing = { id: 'ilan-4', title: 'Dördüncü İlan', values: { fiyat: 1, m2: 1, imar: 'x' } }
    render(<GlassCompareTable fields={fields} listings={[...listings, dorduncu, besInci]} />)
    expect(screen.getByRole('columnheader', { name: /Dördüncü İlan/ })).toBeDefined()
    expect(screen.queryByRole('columnheader', { name: /Beşinci İlan/ })).toBeNull()
  })

  it('eksik değer içeren hücrede "—" gösterir', () => {
    const eksikListings: GlassCompareListing[] = [
      { id: 'a', title: 'A İlanı', values: { fiyat: 100, m2: 10 } },
      { id: 'b', title: 'B İlanı', values: { fiyat: 200, m2: 20, imar: 'Tarla' } },
    ]
    render(<GlassCompareTable fields={fields} listings={eksikListings} />)
    const imarRow = screen.getByRole('rowheader', { name: 'İmar Durumu' }).closest('tr')
    expect(within(imarRow as HTMLElement).getByText('—')).toBeDefined()
  })
})
