import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
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

  it('temsili görsel hata verince listing fallbackine yalnız bir kez geçer', () => {
    const fallbackListing: GlassCompareListing = {
      ...listings[0],
      image: 'representative-image.jpg',
      imageFallback: 'listing-fallback.jpg',
    }
    const { container } = render(
      <GlassCompareTable fields={fields} listings={[fallbackListing]} />,
    )
    const image = container.querySelector('img')

    expect(image).not.toBeNull()
    expect(image?.getAttribute('alt')).toBe('')
    fireEvent.error(image!)
    expect(image?.getAttribute('src')).toBe('listing-fallback.jpg')

    fireEvent.error(image!)
    expect(image?.getAttribute('src')).toBe('listing-fallback.jpg')
  })

  it('aynı id için görsel prop çifti değişince yeni temsili görseli yeniden dener', () => {
    const firstListing: GlassCompareListing = {
      ...listings[0],
      image: 'first-representative.jpg',
      imageFallback: 'first-listing.jpg',
    }
    const { container, rerender } = render(
      <GlassCompareTable fields={fields} listings={[firstListing]} />,
    )
    const image = container.querySelector('img')

    fireEvent.error(image!)
    expect(image?.getAttribute('src')).toBe('first-listing.jpg')

    rerender(
      <GlassCompareTable
        fields={fields}
        listings={[
          {
            ...firstListing,
            image: 'replacement-representative.jpg',
            imageFallback: 'replacement-listing.jpg',
          },
        ]}
      />,
    )
    expect(image?.getAttribute('src')).toBe('replacement-representative.jpg')
    fireEvent.error(image!)
    expect(image?.getAttribute('src')).toBe('replacement-listing.jpg')
  })

  it('yatay kaydırma kabı role="region" + aria-label taşır ve klavyeyle (tabIndex) odaklanabilir', () => {
    render(<GlassCompareTable fields={fields} listings={listings} aria-label="İlan karşılaştırması" />)
    const region = screen.getByRole('region', { name: 'İlan karşılaştırması' })
    expect(region.getAttribute('tabIndex')).toBe('0')
    region.focus()
    expect(document.activeElement).toBe(region)
  })

  it('aria-label verilmediğinde kaydırma kabı varsayılan "İlan karşılaştırma tablosu" adını kullanır', () => {
    render(<GlassCompareTable fields={fields} listings={listings} />)
    expect(screen.getByRole('region', { name: 'İlan karşılaştırma tablosu' })).toBeDefined()
  })

  it('kaldırılan sütunun odaklandığı buton silinince odak kalan ilk kaldır-butonuna geçer', () => {
    function KaldirilabilirWrapper() {
      const [current, setCurrent] = useState(listings)
      return (
        <GlassCompareTable
          fields={fields}
          listings={current}
          aria-label="İlan karşılaştırması"
          onRemove={(id) => setCurrent((prev) => prev.filter((l) => l.id !== id))}
        />
      )
    }
    render(<KaldirilabilirWrapper />)
    const firstButton = screen.getByRole('button', { name: /İzmir Urla/ })
    firstButton.focus()
    expect(document.activeElement).toBe(firstButton)
    fireEvent.click(firstButton)
    // İlk sütun kaldırıldı; odak artık kalan ilk kaldırma butonunda (Bodrum) olmalı.
    const nextRemaining = screen.getByRole('button', { name: /Muğla Bodrum/ })
    expect(document.activeElement).toBe(nextRemaining)
  })

  it('son ilan da kaldırılınca (kalan kaldır-butonu yokken) odak kaydırma kabına taşınır', () => {
    const tekListing = [listings[0]]
    function KaldirilabilirWrapper() {
      const [current, setCurrent] = useState(tekListing)
      return (
        <GlassCompareTable
          fields={fields}
          listings={current}
          aria-label="İlan karşılaştırması"
          onRemove={(id) => setCurrent((prev) => prev.filter((l) => l.id !== id))}
        />
      )
    }
    render(<KaldirilabilirWrapper />)
    const region = screen.getByRole('region', { name: 'İlan karşılaştırması' })
    const onlyButton = screen.getByRole('button', { name: /İzmir Urla/ })
    onlyButton.focus()
    fireEvent.click(onlyButton)
    expect(document.activeElement).toBe(region)
  })

  it('bir alanda değerler farklı gösterimlerle (sayı ile locale biçimli metin) aynı sayıyı temsil ediyorsa satır "farklı" işaretlenmez', () => {
    const sayisalFields: GlassCompareField[] = [{ key: 'aidat', label: 'Aidat (TL)' }]
    const ayniDegerFarkliBicim: GlassCompareListing[] = [
      { id: 'a', title: 'A İlanı', values: { aidat: 1000 } },
      { id: 'b', title: 'B İlanı', values: { aidat: '1.000' } },
    ]
    const { container } = render(<GlassCompareTable fields={sayisalFields} listings={ayniDegerFarkliBicim} />)
    const aidatRow = Array.from(container.querySelectorAll('tbody tr')).find((r) => r.textContent?.includes('Aidat'))
    expect(aidatRow?.hasAttribute('data-differs')).toBe(false)
  })

  it('bir alanda sayısal değerler gerçekten farklıysa (locale biçimlerinden bağımsız) satır "farklı" işaretlenir', () => {
    const sayisalFields: GlassCompareField[] = [{ key: 'aidat', label: 'Aidat (TL)' }]
    const farkliDegerler: GlassCompareListing[] = [
      { id: 'a', title: 'A İlanı', values: { aidat: 1000 } },
      { id: 'b', title: 'B İlanı', values: { aidat: '1.500' } },
    ]
    const { container } = render(<GlassCompareTable fields={sayisalFields} listings={farkliDegerler} />)
    const aidatRow = Array.from(container.querySelectorAll('tbody tr')).find((r) => r.textContent?.includes('Aidat'))
    expect(aidatRow?.hasAttribute('data-differs')).toBe(true)
  })
})
