// Emlak Endeksi mahalle sayfası sözleşmesi — üç kural sayfanın varlık sebebidir:
// (1) reel değişim nominalle birlikte görünür, (2) yetersiz örneklemli mahallede
// hiçbir fiyat metriği yayımlanmaz, (3) fiyatın ilan fiyatı olduğu açıkça yazar.
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EmlakEndeksi } from './EmlakEndeksi'

describe('Emlak Endeksi — mahalle sayfası', () => {
  it('başlık, breadcrumb ve veri dönemi künyesi görünür', () => {
    render(<EmlakEndeksi />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveProperty(
      'textContent',
      'Feneryolu Mahallesi satılık konut fiyatları ve emlak endeksi',
    )
    expect(screen.getByText(/İlan verilerine göre · Temmuz 2026/)).toBeTruthy()
    const kirintili = screen.getByRole('navigation', { name: 'Kategori yolu' })
    expect(within(kirintili).getByText('Kadıköy')).toBeTruthy()
    expect(within(kirintili).getByText('Feneryolu')).toHaveProperty('ariaCurrent', 'page')
  })

  it('KPI şeridinde nominal değişimin yanında reel değişim de yazar', () => {
    render(<EmlakEndeksi />)
    const serit = screen.getByLabelText('Feneryolu endeks özeti')
    expect(within(serit).getByText('Medyan ilan m² fiyatı')).toBeTruthy()
    expect(within(serit).getByText('82.500 TL')).toBeTruthy()
    // Nominal tek başına gösterilmez — reel karşılığı ipucu satırındadır.
    expect(within(serit).getByText('reel −%2,2')).toBeTruthy()
  })

  it('güven bandı etkin örneklemi ve güven aralığını KPI’ların hemen altında verir', () => {
    render(<EmlakEndeksi />)
    const bant = screen.getByRole('region', { name: 'Bu sonuç ne kadar güvenilir?' })
    expect(within(bant).getByText(/etkin örneklem 94/)).toBeTruthy()
    expect(within(bant).getByText(/79\.800 – 85\.100 TL/)).toBeTruthy()
  })

  it('yetersiz örneklemli mahallede fiyat metrikleri yayımlanmaz', () => {
    render(<EmlakEndeksi />)
    const tablo = screen.getByRole('table', { name: 'Kadıköy mahalleleri endeks karşılaştırması' })
    const satir = within(tablo).getByRole('row', { name: /Dumlupınar/ })
    expect(within(satir).getByText('14 ilan · yetersiz')).toBeTruthy()
    // Fiyat, trend, değişim, getiri ve süre hücrelerinin hepsi bastırılmış olmalı.
    expect(within(satir).getAllByText('—')).toHaveLength(5)
    // Trend serisi de yayımlanmaz: sparkline çizmez, gerekçesini söyler.
    expect(within(satir).getByText(/Dumlupınar .*trend için yeterli veri yok/)).toBeTruthy()
  })

  it('yeterli örneklemli satırlar trend sparkline’ı taşır', () => {
    render(<EmlakEndeksi />)
    const tablo = screen.getByRole('table', { name: 'Kadıköy mahalleleri endeks karşılaştırması' })
    const satir = within(tablo).getByRole('row', { name: /Göztepe/ })
    expect(within(satir).getByRole('img', { name: /Göztepe · son 12 ay medyan m² fiyatı: yükseliş/ })).toBeTruthy()
  })

  it('eğilim grafiği ilçe ve resmî endeksi referans serisi olarak taşır', () => {
    render(<EmlakEndeksi />)
    expect(screen.getByText('TCMB Konut Fiyat Endeksi')).toBeTruthy()
    // "referans" rozeti iki benchmark serisi için de basılır.
    expect(screen.getAllByText('referans')).toHaveLength(2)
  })

  it('dağılım histogramı son bandı değil medyan bandını vurgular', () => {
    // Recharts geçişi sonrası sütunlar Cell path'leridir; vurgu CSS modül
    // sınıfından okunur (bkz. GlassDistributionChart.test.tsx ile aynı desen).
    const { container } = render(<EmlakEndeksi />)
    const hepsi = Array.from(container.querySelectorAll('.recharts-bar-rectangle path'))
    const vurgulu = hepsi.filter((p) => (p.getAttribute('class') ?? '').includes('binMedian'))
    expect(vurgulu).toHaveLength(1)
    expect(hepsi.indexOf(vurgulu[0])).toBe(3)
    expect(hepsi).toHaveLength(6)
  })

  it('fiyat bazı reele çevrilince grafik başlığı da değişir', async () => {
    const user = userEvent.setup()
    render(<EmlakEndeksi />)
    expect(screen.getByRole('heading', { name: 'Medyan ilan m² fiyatı — nominal' })).toBeTruthy()
    await user.click(screen.getByRole('radio', { name: 'Reel (TÜFE arındırılmış)' }))
    expect(
      screen.getByRole('heading', { name: /Medyan ilan m² fiyatı — reel/ }),
    ).toBeTruthy()
  })

  it('ilan fiyatı ile satış fiyatı ayrımı metodoloji künyesinde açıkça yazar', async () => {
    const user = userEvent.setup()
    render(<EmlakEndeksi />)
    // Künye varsayılan kapalıdır; sınırlamalar açılınca görünür.
    await user.click(screen.getByRole('button', { name: /ArsaPazar hesabı/ }))
    expect(
      screen.getByText(/İlan \(talep edilen\) fiyatıdır — gerçekleşen satış fiyatı değildir\./),
    ).toBeTruthy()
  })

  it('iç linkleme rafı gerçek href taşır', () => {
    render(<EmlakEndeksi />)
    const link = screen.getByRole('link', { name: /Göztepe konut fiyatları/ })
    expect(link.getAttribute('href')).toBe(
      '/emlak-endeksi/konut/satilik/istanbul/kadikoy/goztepe',
    )
  })
})
