import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { GlassTaxHistoryTable, type GlassTaxHistoryTableRow } from './GlassTaxHistoryTable'

const rows: GlassTaxHistoryTableRow[] = [
  { year: '2026', amount: '18.450 TL', changePercent: 14.2 },
  { year: '2025', amount: '16.160 TL', changePercent: -2.1 },
  { year: '2024', amount: '15.040 TL', changePercent: 0 },
  { year: '2023', amount: '15.040 TL' },
]

describe('GlassTaxHistoryTable', () => {
  it('varsayılan başlığı gösterir ve tabloyu ona bağlar (aria-labelledby)', () => {
    render(<GlassTaxHistoryTable rows={rows} />)
    const heading = screen.getByRole('heading', { name: 'Vergi ve Aidat Geçmişi' })
    const table = screen.getByRole('table')
    expect(table.getAttribute('aria-labelledby')).toBe(heading.id)
  })

  it('özel title prop\'unu gösterir', () => {
    render(<GlassTaxHistoryTable rows={rows} title="Aidat Ödeme Geçmişi" />)
    expect(screen.getByRole('heading', { name: 'Aidat Ödeme Geçmişi' })).toBeDefined()
  })

  it('her satırın yıl ve tutarını render eder', () => {
    render(<GlassTaxHistoryTable rows={rows} />)
    expect(screen.getByText('18.450 TL')).toBeDefined()
    expect(screen.getByText('16.160 TL')).toBeDefined()
  })

  it('yalnız ilk satır (en yeni yıl) "Güncel" etiketiyle vurgulanır', () => {
    render(<GlassTaxHistoryTable rows={rows} />)
    const dataRows = screen.getAllByRole('row').slice(1) // ilk satır thead
    expect(within(dataRows[0]).getByText('Güncel')).toBeDefined()
    expect(within(dataRows[1]).queryByText('Güncel')).toBeNull()
    expect(dataRows[0].getAttribute('data-latest')).toBe('true')
    expect(dataRows[1].hasAttribute('data-latest')).toBe(false)
  })

  it('artış: ▲ ok ikonu (aria-hidden) + işaretsiz yüzde metni + "Artış:" ekran okuyucu metni gösterir', () => {
    render(<GlassTaxHistoryTable rows={rows} />)
    const dataRows = screen.getAllByRole('row').slice(1)
    const changeCell = within(dataRows[0])
    expect(changeCell.getByText('Artış:')).toBeDefined()
    expect(changeCell.getByText('%14,2')).toBeDefined()
    const arrow = dataRows[0].querySelector('[aria-hidden="true"]')
    expect(arrow?.textContent).toBe('▲')
  })

  it('azalış: ▼ ok ikonu + "Azalış:" ekran okuyucu metni gösterir', () => {
    render(<GlassTaxHistoryTable rows={rows} />)
    const dataRows = screen.getAllByRole('row').slice(1)
    const changeCell = within(dataRows[1])
    expect(changeCell.getByText('Azalış:')).toBeDefined()
    expect(changeCell.getByText('%2,1')).toBeDefined()
    const arrow = dataRows[1].querySelector('[aria-hidden="true"]')
    expect(arrow?.textContent).toBe('▼')
  })

  it('changePercent 0 ise ok ikonu göstermez, nötr "Değişim yok:" metniyle %0,0 render eder', () => {
    render(<GlassTaxHistoryTable rows={rows} />)
    const dataRows = screen.getAllByRole('row').slice(1)
    const zeroCell = within(dataRows[2])
    expect(zeroCell.getByText('Değişim yok:')).toBeDefined()
    expect(zeroCell.getByText('%0,0')).toBeDefined()
    expect(dataRows[2].querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('changePercent verilmemişse veya sonlu değilse (NaN/Infinity) "—" gösterir ve "Değişim bilgisi yok" ekran okuyucu metni taşır', () => {
    render(<GlassTaxHistoryTable rows={rows} />)
    const dataRows = screen.getAllByRole('row').slice(1)
    expect(within(dataRows[3]).getByText('Değişim bilgisi yok')).toBeDefined()
    const dash = dataRows[3].querySelector('[aria-hidden="true"]')
    expect(dash?.textContent).toBe('—')

    // Sonlu olmayan (NaN) değer de aynı veri-yok durumuna düşer, ham NaN asla ekrana yazılmaz
    const withInfinite: GlassTaxHistoryTableRow[] = [{ year: '2026', amount: '1.000 TL', changePercent: Number.NaN }]
    const { unmount } = render(<GlassTaxHistoryTable rows={withInfinite} title="NaN testi" />)
    expect(screen.getAllByText('Değişim bilgisi yok')).toHaveLength(2)
    expect(screen.queryByText('NaN')).toBeNull()
    unmount()
  })

  it('boş rows verildiğinde varsayılan boş durum metnini gösterir', () => {
    render(<GlassTaxHistoryTable rows={[]} />)
    expect(screen.getByText('Kayıt bulunamadı.')).toBeDefined()
  })

  it('caption verilirse gösterir, verilmezse hiç render edilmez', () => {
    const { rerender } = render(<GlassTaxHistoryTable rows={rows} caption="Kaynak: Belediye kayıtları" />)
    expect(screen.getByText('Kaynak: Belediye kayıtları')).toBeDefined()

    rerender(<GlassTaxHistoryTable rows={rows} />)
    expect(screen.queryByText('Kaynak: Belediye kayıtları')).toBeNull()
  })

  it('children prop tip düzeyinde kabul edilmez ve JSX yayılımında sessizce yutulmaz (regresyon: children spread ile override edilen kök section)', () => {
    // Props tipi artık HTMLAttributes'tan 'children'ı açıkça omit ediyor (bkz. rules.md §4);
    // bu test, tip korumasını bypass edecek bir çağıranın bile (ör. any-cast) DOM'da
    // beklenmedik bir children sızıntısı yaratmadığını doğruluyor — kök <section> JSX'te
    // her zaman kendi sabit alt ağacını render eder, spread edilen {...rest} children'ı
    // ezemez.
    const props = { rows, children: 'Dışarıdan gelen metin sızmamalı' } as unknown as Parameters<typeof GlassTaxHistoryTable>[0]
    render(<GlassTaxHistoryTable {...props} />)
    expect(screen.queryByText('Dışarıdan gelen metin sızmamalı')).toBeNull()
  })

  it('ok ikonu (artış/azalış) ham semantik renk yerine --lg-label ile koyulaştırılmış color-mix kullanır (3:1 anlamlı-grafik kontrast regresyonu)', async () => {
    // jsdom, vitest'te CSS modüllerini gerçekten uygulamaz (getComputedStyle güvenilir
    // değil); bu yüzden regresyonu kaynak CSS'te statik olarak doğruluyoruz. Ham
    // `color: var(--lg-success)` açık temada ~2.2:1 kontrastla WCAG non-text 3:1 eşiğini
    // kaçırıyordu (bkz. Codex dalga4 raporu). Fix: her iki yön kuralı da
    // `color-mix(in srgb, var(--lg-<tone>) …%, var(--lg-label))` kullanmalı.
    const fs = await import('node:fs')
    const path = await import('node:path')
    const cssPath = path.join(__dirname, 'GlassTaxHistoryTable.module.css')
    const css = fs.readFileSync(cssPath, 'utf-8')

    for (const [direction, tone] of [
      ['up', 'danger'],
      ['down', 'success'],
    ] as const) {
      const rule = new RegExp(`\\.change\\[data-direction='${direction}'\\] \\.arrow\\s*\\{[^}]*\\}`)
      const match = css.match(rule)?.[0] ?? ''
      expect(match, `.change[data-direction='${direction}'] .arrow`).toMatch(
        new RegExp(`color:\\s*color-mix\\(in srgb, var\\(--lg-${tone}\\)`),
      )
      expect(match, `.change[data-direction='${direction}'] .arrow ham renk regresyonu`).not.toMatch(
        new RegExp(`color:\\s*var\\(--lg-${tone}\\)\\s*;`),
      )
    }
  })
})
