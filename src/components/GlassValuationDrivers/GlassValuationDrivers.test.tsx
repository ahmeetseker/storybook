import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassValuationDrivers, type GlassValuationDriver } from './GlassValuationDrivers'
import styles from './GlassValuationDrivers.module.css'

const drivers: GlassValuationDriver[] = [
  { id: 'manzara', label: 'Deniz manzarası', impact: 320000, impactText: '+320.000 TL' },
  { id: 'yas', label: 'Bina yaşı', impact: -180000, impactText: '-180.000 TL', note: 'Bölge ortalamasının üzerinde' },
  { id: 'notr', label: 'Cephe yönü', impact: 0, impactText: '0 TL' },
]

describe('GlassValuationDrivers', () => {
  it('varsayılan başlıkla role="list" + aria-labelledby ile render olur', () => {
    render(<GlassValuationDrivers drivers={drivers} />)
    const list = screen.getByRole('list', { name: 'Değerlemeyi Etkileyenler' })
    expect(list).toBeTruthy()
    expect(within(list).getAllByRole('listitem').length).toBe(3)
  })

  it('baseText verilince listeye aria-describedby ile bağlanır; verilmezse hiç eklenmez', () => {
    const { unmount } = render(<GlassValuationDrivers drivers={drivers} baseText="Bölge medyanı: 5,1M" />)
    const list = screen.getByRole('list')
    const descId = list.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    expect(document.getElementById(descId as string)?.textContent).toBe('Bölge medyanı: 5,1M')
    unmount()

    render(<GlassValuationDrivers drivers={drivers} />)
    expect(screen.getByRole('list').getAttribute('aria-describedby')).toBeNull()
  })

  it('her satırda görünen impactText + görsel-gizli yön metni birlikte yer alır', () => {
    render(<GlassValuationDrivers drivers={drivers} />)
    const items = screen.getAllByRole('listitem')
    const positive = items.find((li) => li.textContent?.includes('Deniz manzarası'))
    const negative = items.find((li) => li.textContent?.includes('Bina yaşı'))
    const neutral = items.find((li) => li.textContent?.includes('Cephe yönü'))
    expect(positive?.textContent).toContain('+320.000 TL')
    expect(positive?.textContent).toContain('değeri artırıyor')
    expect(negative?.textContent).toContain('-180.000 TL')
    expect(negative?.textContent).toContain('değeri azaltıyor')
    expect(neutral?.textContent).toContain('değeri etkilemiyor')
  })

  it('note verilen satırda görünür, verilmeyende hiç render edilmez', () => {
    render(<GlassValuationDrivers drivers={drivers} />)
    expect(screen.getByText('Bölge ortalamasının üzerinde')).toBeTruthy()
    const items = screen.getAllByRole('listitem')
    const withNote = items.find((li) => li.textContent?.includes('Bina yaşı'))
    const withoutNote = items.find((li) => li.textContent?.includes('Deniz manzarası'))
    expect(withNote?.querySelector(`.${styles.note}`)).toBeTruthy()
    expect(withoutNote?.querySelector(`.${styles.note}`)).toBeNull()
  })

  it('bar genişliği listedeki en büyük |impact|e normalize edilir; sonlu olmayan impact 0 genişlik üretir', () => {
    const mixed: GlassValuationDriver[] = [
      { id: 'a', label: 'A', impact: 100, impactText: '+100' },
      { id: 'b', label: 'B', impact: -50, impactText: '-50' },
      { id: 'c', label: 'C', impact: NaN, impactText: '±0' },
    ]
    const { container } = render(<GlassValuationDrivers drivers={mixed} />)
    const bars = container.querySelectorAll(`[data-tone="success"], [data-tone="danger"]`)
    // Bar %100 genişlikte çizilir, doluluk oranı scaleX ile uygulanır (genişlik
    // animasyonu yasak). A: pozitif, max'e göre scaleX(1); B: negatif,
    // scaleX(0.5); C: NaN → scaleX(0) iki taraf da
    const transforms = Array.from(bars).map((el) => (el as HTMLElement).style.transform)
    expect(transforms).toContain('scaleX(1)')
    expect(transforms).toContain('scaleX(0.5)')
    expect(transforms.filter((t) => t === 'scaleX(0)').length).toBeGreaterThanOrEqual(1)
  })

  it('drivers boş dizi bilgilendirici metinle gösterir, hata fırlatmaz', () => {
    render(<GlassValuationDrivers drivers={[]} />)
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.getByText('Değerlemeyi etkileyen bir faktör bulunamadı.')).toBeTruthy()
  })

  it('AI rozeti daima render edilir; confidence geçerliyse metin eklenir, sonlu değilse gizlenir', () => {
    const { unmount } = render(<GlassValuationDrivers drivers={drivers} confidence={83.6} />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.getByText('%84 güven')).toBeTruthy()
    unmount()

    render(<GlassValuationDrivers drivers={drivers} confidence={Infinity} />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.queryByText(/güven/)).toBeNull()
  })

  it('geri bildirim butonları onFeedback\'i doğru yönle çağırır, aria-pressed görsel seçimi işaretler ve aynı yöne tekrar tıklama toggle-off yapar', () => {
    const onFeedback = vi.fn()
    render(<GlassValuationDrivers drivers={drivers} onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })
    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(up.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(up)
    expect(onFeedback).toHaveBeenNthCalledWith(1, 'up')
    expect(up.getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(down)
    expect(onFeedback).toHaveBeenNthCalledWith(2, 'down')
    expect(down.getAttribute('aria-pressed')).toBe('true')
    expect(up.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(down)
    expect(onFeedback).toHaveBeenNthCalledWith(3, 'down')
    expect(down.getAttribute('aria-pressed')).toBe('false')
  })

  it('onFeedback verilmezse geri bildirim butonları hiç render edilmez', () => {
    render(<GlassValuationDrivers drivers={drivers} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('regresyon: drivers içeriği GERÇEKTEN değişince geri bildirim seçimi sıfırlanır; aynı içerikle yeni referans seçimi korur', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(<GlassValuationDrivers drivers={drivers} onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })
    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')

    // Aynı içerikle yeni dizi referansı — seçim korunmalı
    rerender(<GlassValuationDrivers drivers={[...drivers]} onFeedback={onFeedback} />)
    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('true')

    // Gerçek içerik değişikliği (yeni bir ilan) — seçim sıfırlanmalı
    const nextDrivers: GlassValuationDriver[] = [{ id: 'yeni', label: 'Yeni faktör', impact: 50000, impactText: '+50.000 TL' }]
    rerender(<GlassValuationDrivers drivers={nextDrivers} onFeedback={onFeedback} />)
    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('loading=true iken liste/feedback yerine role="status" durum metni render edilir; zorunlu AI rozeti yine görünür kalır', () => {
    render(<GlassValuationDrivers title="Değerleme" drivers={drivers} confidence={90} onFeedback={vi.fn()} loading />)
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByText('Deniz manzarası')).toBeNull()
    expect(screen.getByRole('status').textContent).toBe('Değerleme hesaplanıyor')
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    // Skor/veri henüz hesaplanmadığı için güven metni placeholder'da gösterilmez
    expect(screen.queryByText(/güven/)).toBeNull()
  })

  it('regresyon: role="status" düğümü loading geçişinde unmount/remount OLMAZ ve tamamlanınca duyuru yapar', () => {
    const { rerender, unmount } = render(<GlassValuationDrivers title="Değerleme" drivers={drivers} loading />)
    const statusNode = screen.getByRole('status')
    expect(statusNode.textContent).toBe('Değerleme hesaplanıyor')

    // loading -> false: AYNI DOM düğümü canlı kalmalı (yeniden mount edilmemeli),
    // yalnız içeriği "hazır" duyurusuna güncellenmeli.
    rerender(<GlassValuationDrivers title="Değerleme" drivers={drivers} />)
    expect(screen.getByRole('status')).toBe(statusNode)
    expect(statusNode.textContent).toBe('Değerleme hazır')
    unmount()

    // İlk mount loading=false ile yapılırsa sahte bir "hazır" duyurusu olmamalı
    render(<GlassValuationDrivers title="Değerleme" drivers={drivers} />)
    expect(screen.getByRole('status').textContent).toBe('')
  })

  it('regresyon: children prop tip düzeyinde omit edilir; yine de zorla geçirilirse (rest\'ten) sessizce yutulmaz — hiç render edilmez', () => {
    // GlassValuationDriversProps, HTMLAttributes'tan 'children'ı da omit eder
    // (tip yolu) — normal kullanımda TS derlemesi children geçirimini
    // reddeder. Bir çağıran yine de `as any` ile zorlarsa (tip korumasını
    // atlarsa) component'in JSX'inde açık children YER ALDIĞI için ...rest
    // üzerinden gelen children hiçbir zaman DOM'a yansımaz — davranış
    // sözleşmesi ("tamamen prop güdümlü", rules.md §3) korunur.
    const props = { drivers, children: 'BEKLENMEYEN_ÇOCUK_İÇERİK' } as unknown as Parameters<
      typeof GlassValuationDrivers
    >[0]
    const { container } = render(<GlassValuationDrivers {...props} />)
    expect(container.textContent).not.toContain('BEKLENMEYEN_ÇOCUK_İÇERİK')
  })

  it('regresyon: geri bildirim sorusu role="group" + aria-labelledby ile buton grubuna programatik bağlanır', () => {
    render(<GlassValuationDrivers drivers={drivers} onFeedback={vi.fn()} />)
    const group = screen.getByRole('group', { name: 'Bu değerlendirme faydalı mıydı?' })
    expect(group).toBeTruthy()
    expect(within(group).getByRole('button', { name: 'Faydalı' })).toBeTruthy()
    expect(within(group).getByRole('button', { name: 'Faydalı değil' })).toBeTruthy()
  })

  it('regresyon: aynı loading durumunda title değişirse canlı bölge metni güncel başlığı kullanır', () => {
    const { rerender, getByRole } = render(
      <GlassValuationDrivers title="İlan A" drivers={drivers} loading />,
    )
    expect(getByRole('status').textContent).toBe('İlan A hesaplanıyor')

    // loading SABİT true, yalnız title değişiyor — eski başlık asılı kalmamalı
    rerender(<GlassValuationDrivers title="İlan B" drivers={drivers} loading />)
    expect(getByRole('status').textContent).toBe('İlan B hesaplanıyor')

    // loading false'a döner: "hazır" duyurusu da güncel başlığı kullanmalı
    rerender(<GlassValuationDrivers title="İlan B" drivers={drivers} />)
    expect(getByRole('status').textContent).toBe('İlan B hazır')

    // "hazır" duyurusundan SONRA title değişirse bu da güncellenmeli
    rerender(<GlassValuationDrivers title="İlan C" drivers={drivers} />)
    expect(getByRole('status').textContent).toBe('İlan C hazır')
  })

  it('regresyon: hiç yüklenmemiş (statusText hâlâ boş) durumda yalnız title değişimi sahte "hazır" duyurusu üretmez', () => {
    const { rerender, getByRole } = render(<GlassValuationDrivers title="İlan A" drivers={drivers} />)
    expect(getByRole('status').textContent).toBe('')

    rerender(<GlassValuationDrivers title="İlan B" drivers={drivers} />)
    expect(getByRole('status').textContent).toBe('')
  })
})
