import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { GlassTimeline, type GlassTimelineEvent } from './GlassTimeline'

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
})
