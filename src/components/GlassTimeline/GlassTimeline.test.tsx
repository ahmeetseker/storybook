import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { GlassTimeline, type GlassTimelineEvent } from './GlassTimeline'

// Tip seviyesinde regresyon (rules.md §3: "Children kabul edilmez"): bu fonksiyon
// hiçbir zaman çağrılmaz, yalnızca `tsc -b` sırasında children'ın GlassTimeline
// prop tipine artık sızmadığını doğrular — @ts-expect-error kullanılmayan bir
// hata bastırırsa derleme (ts 2578) başarısız olur. Önceden `HTMLAttributes`tan
// yalnız 'title' omit ediliyordu; children spread yoluyla sızıp `{...rest}` ile
// div'e geçebiliyordu (JSX açık children'ı sessizce ezerdi — veri kaybı riski).
function _typeOnly_childrenReddedilir() {
  // @ts-expect-error — GlassTimelineProps children'ı Omit eder (HTMLAttributes üzerinden sızmamalı)
  // oxlint-disable-next-line react/no-children-prop -- kasıtlı: yasak kullanımın derlemede reddedildiğini doğrular
  return <GlassTimeline events={[]} children="sızıntı" />
}
void _typeOnly_childrenReddedilir

const events: GlassTimelineEvent[] = [
  { id: 'yayin', date: '2 Haz 2026', title: 'İlan Yayınlandı', description: "ArsaPazar'da yayına alındı." },
  { id: 'ekspertiz', date: '18 Haz 2026', title: 'Ekspertiz Tamamlandı', tone: 'success' },
  { id: 'kredi', date: '30 Haz 2026', title: 'Kredi Başvurusu Beklemede', tone: 'warning' },
  { id: 'red', date: '5 Tem 2026', title: 'Kredi Başvurusu Reddedildi', tone: 'danger' },
]

describe('GlassTimeline', () => {
  it('role="list" ve her olay için role="listitem" render eder, başlık/tarih metniyle', () => {
    render(<GlassTimeline events={events} aria-label="İlan süreci" />)
    const list = screen.getByRole('list', { name: 'İlan süreci' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(within(items[0]).getByText('İlan Yayınlandı')).toBeTruthy()
    expect(within(items[0]).getByText('2 Haz 2026')).toBeTruthy()
  })

  it('variant="line" (varsayılan) açıklamayı gösterir', () => {
    render(<GlassTimeline events={events} />)
    expect(screen.getByText("ArsaPazar'da yayına alındı.")).toBeTruthy()
  })

  it('variant="compact" açıklamayı render ETMEZ, yalnız tarih+başlık kalır', () => {
    render(<GlassTimeline events={events} variant="compact" />)
    expect(screen.queryByText("ArsaPazar'da yayına alındı.")).toBeNull()
    expect(screen.getByText('İlan Yayınlandı')).toBeTruthy()
  })

  it('tone="default" (belirtilmeyen) olayda sr-only durum metni EKLENMEZ', () => {
    render(<GlassTimeline events={events} />)
    expect(screen.getAllByText(/Durum:/).length).toBe(3) // yalnız tone'lu 3 event'te var
    const items = screen.getAllByRole('listitem')
    expect(within(items[0]).queryByText(/Durum:/)).toBeNull()
  })

  it('tone verilen event\'lerde renk yanında sr-only durum metni duyurulur (success/warning/danger)', () => {
    render(<GlassTimeline events={events} />)
    const items = screen.getAllByRole('listitem')
    expect(within(items[1]).getByText(/Durum: Tamamlandı/)).toBeTruthy()
    expect(within(items[2]).getByText(/Durum: Dikkat gerekiyor/)).toBeTruthy()
    expect(within(items[3]).getByText(/Durum: Sorun/)).toBeTruthy()
  })

  it('ray/nokta/bağlantı çizgisi dekoratif — aria-hidden taşır, erişilebilir isim üretmez', () => {
    const { container } = render(<GlassTimeline events={events} />)
    const hiddenEls = container.querySelectorAll('[aria-hidden="true"]')
    expect(hiddenEls.length).toBeGreaterThan(0)
    // Listede yalnız 4 listitem'in erişilebilir adı başlık metninden gelir, ray katkı vermez
    const list = screen.getByRole('list')
    const items = within(list).getAllByRole('listitem')
    expect(items[0].textContent).toContain('İlan Yayınlandı')
  })

  it('boş events dizisi hata fırlatmaz, bilgilendirici metin gösterir', () => {
    render(<GlassTimeline events={[]} />)
    expect(screen.getByText('Henüz zaman çizelgesi kaydı yok.')).toBeTruthy()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('boş events dizisinde özel emptyState render edilir', () => {
    render(<GlassTimeline events={[]} emptyState="Bu ilan için kayıt bulunmuyor." />)
    expect(screen.getByText('Bu ilan için kayıt bulunmuyor.')).toBeTruthy()
  })

  it('aria-label bileşeni adlandırır', () => {
    render(<GlassTimeline events={events} aria-label="Bina geçmişi" />)
    expect(screen.getByRole('list', { name: 'Bina geçmişi' })).toBeTruthy()
  })

  it('ham event id\'si DOM id özniteliğine yazılmaz', () => {
    const { container } = render(<GlassTimeline events={events} />)
    expect(container.querySelector('#yayin')).toBeNull()
    expect(container.querySelector('#ekspertiz')).toBeNull()
  })

  it('ton işaretleri (marker/compactDot) her data-tone için ham semantik renk yerine --lg-label ile koyulaştırılmış color-mix kullanır (3:1 kontrast regresyonu)', async () => {
    // jsdom, vitest'te CSS modüllerini gerçekten uygulamaz (getComputedStyle
    // güvenilir değil); bu yüzden regresyonu kaynak CSS'te statik olarak
    // doğruluyoruz. Ham `background: var(--lg-success)` gibi bir kullanım
    // açık temada ~2.2:1 kontrastla WCAG non-text 3:1 eşiğini kaçırıyordu
    // (bkz. rules.md §9 ve Codex dalga4 raporu). Fix: her data-tone kuralı
    // `color-mix(in srgb, var(--lg-<tone>) …%, var(--lg-label))` kullanmalı.
    const fs = await import('node:fs')
    const path = await import('node:path')
    const cssPath = path.join(__dirname, 'GlassTimeline.module.css')
    const css = fs.readFileSync(cssPath, 'utf-8')

    for (const tone of ['success', 'warning', 'danger']) {
      const markerRule = new RegExp(`\\.marker\\[data-tone='${tone}'\\]\\s*\\{[^}]*\\}`)
      const compactRule = new RegExp(`\\.compactDot\\[data-tone='${tone}'\\]\\s*\\{[^}]*\\}`)
      const iconMarkerRule = new RegExp(`\\.marker\\[data-has-icon\\]\\[data-tone='${tone}'\\]\\s*\\{[^}]*\\}`)

      const markerMatch = css.match(markerRule)?.[0] ?? ''
      const compactMatch = css.match(compactRule)?.[0] ?? ''
      const iconMatch = css.match(iconMarkerRule)?.[0] ?? ''

      expect(markerMatch, `.marker[data-tone='${tone}']`).toContain('color-mix')
      expect(markerMatch, `.marker[data-tone='${tone}'] ham renk regresyonu`).not.toMatch(
        new RegExp(`background:\\s*var\\(--lg-${tone}\\)\\s*;`),
      )
      expect(compactMatch, `.compactDot[data-tone='${tone}']`).toContain('color-mix')
      expect(compactMatch, `.compactDot[data-tone='${tone}'] ham renk regresyonu`).not.toMatch(
        new RegExp(`background:\\s*var\\(--lg-${tone}\\)\\s*;`),
      )
      // İkonlu marker'da anlam taşıyan grafik ikonun kendisi — `color` koyulaştırılmış olmalı,
      // zemin (background) yalnız dekoratif tint olduğu için ham semantik renk kalabilir.
      expect(iconMatch, `.marker[data-has-icon][data-tone='${tone}']`).toMatch(
        new RegExp(`color:\\s*color-mix\\(in srgb, var\\(--lg-${tone}\\)`),
      )
    }
  })
})
