import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassTourPlanner, type GlassTourPlannerStop } from './GlassTourPlanner'

const stops: GlassTourPlannerStop[] = [
  { id: 'ilan-1', title: 'Kozlu Fatih Sitesi 3+1', time: '11:00', duration: '30 dk' },
  {
    id: 'ilan-2',
    title: 'Kılıç Mahallesi Deniz Manzaralı 2+1',
    time: '11:42',
    duration: '25 dk',
    travelNote: 'Önceki duraktan 12 dk araç',
  },
  {
    id: 'ilan-3',
    title: 'Zonguldak Merkez Ofis Katı',
    time: '12:30',
    travelNote: 'Önceki duraktan 18 dk araç',
  },
]

describe('GlassTourPlanner', () => {
  it('tarih başlığıyla region render eder, durak listesi role="list" + üç listitem taşır', () => {
    render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" />)
    const heading = screen.getByText('Cmt 18 Tem')
    const section = heading.closest('section')
    expect(section?.getAttribute('aria-labelledby')).toBe(heading.id)

    const list = screen.getByRole('list', { name: 'Cmt 18 Tem tur planı durakları' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toContain('Kozlu Fatih Sitesi 3+1')
    expect(items[0].textContent).toContain('11:00')
    expect(items[0].textContent).toContain('30 dk')
  })

  it('AI rozeti daima render edilir; confidence geçerliyse metin eklenir, sonlu değilse gizlenir', () => {
    const { unmount } = render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" confidence={87.6} />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.getByText('%88 güven')).toBeTruthy()
    unmount()

    render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" confidence={Infinity} />)
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    expect(screen.queryByText(/güven/)).toBeNull()
  })

  it('totalNote verilirse görünür metin olarak render edilir, verilmezse hiç yok', () => {
    const { unmount } = render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" totalNote="3 durak · ~1 sa 40 dk" />)
    expect(screen.getByText('3 durak · ~1 sa 40 dk')).toBeTruthy()
    unmount()

    render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" />)
    expect(screen.queryByText(/durak ·/)).toBeNull()
  })

  it('travelNote yalnız ikinci ve sonraki duraklarda render edilir; ilk durakta verilse bile gösterilmez', () => {
    const stopsWithFirstTravelNote: GlassTourPlannerStop[] = [
      { ...stops[0], travelNote: 'Bu görünmemeli — ilk durak' },
      stops[1],
      stops[2],
    ]
    render(<GlassTourPlanner stops={stopsWithFirstTravelNote} date="Cmt 18 Tem" />)
    expect(screen.queryByText('Bu görünmemeli — ilk durak')).toBeNull()
    expect(screen.getByText('Önceki duraktan 12 dk araç')).toBeTruthy()
    expect(screen.getByText('Önceki duraktan 18 dk araç')).toBeTruthy()
  })

  it('"Planı Onayla" butonu her zaman render edilir; onConfirm verilmezse disabled, verilirse tıklamada çağrılır', () => {
    const { unmount } = render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" />)
    const disabledButton = screen.getByRole('button', { name: 'Planı Onayla' }) as HTMLButtonElement
    expect(disabledButton.disabled).toBe(true)
    unmount()

    const onConfirm = vi.fn()
    render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" onConfirm={onConfirm} />)
    const button = screen.getByRole('button', { name: 'Planı Onayla' }) as HTMLButtonElement
    expect(button.disabled).toBe(false)
    fireEvent.click(button)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('loading=true iken durak listesi yerine skeleton + durum metni render edilir; AI rozeti ve onay butonu (disabled) yine görünür kalır', () => {
    const onConfirm = vi.fn()
    render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" confidence={90} onConfirm={onConfirm} loading />)
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.getByRole('status').textContent).toBe('Tur planı hazırlanıyor')
    expect(screen.getByLabelText('Yapay zekâ üretimi')).toBeTruthy()
    // Skor/plan henüz hesaplanmadığı için güven metni placeholder'da gösterilmez
    expect(screen.queryByText(/güven/)).toBeNull()
    const button = screen.getByRole('button', { name: 'Planı Onayla' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('role="status" düğümü loading=false iken de mount edilir ve açık bir "hazır" mesajı taşır — sonradan mount edilen canlı bölge ekran okuyucuda duyurulmaz', () => {
    const { rerender } = render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" loading={false} />)
    const status = screen.getByRole('status')
    expect(status.textContent).toBe('Tur planı hazır')

    // Parent loading=true'ya geçtiğinde AYNI düğüm güncellenir, yeni bir
    // status düğümü DOM'a sonradan eklenmez.
    rerender(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" loading />)
    expect(screen.getByRole('status')).toBe(status)
    expect(status.textContent).toBe('Tur planı hazırlanıyor')

    // regresyon: loading biterken metin BOŞALTILMAZ — açık bir tamamlandı/
    // hazır mesajı yayınlanır (aksi halde durum geçişi güvenilir duyurulmaz).
    rerender(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" loading={false} />)
    expect(screen.getByRole('status')).toBe(status)
    expect(status.textContent).toBe('Tur planı hazır')
  })

  it('regresyon: stops=[] iken canlı bölge "durak yok" mesajı yayınlar (boş metin bırakılmaz)', () => {
    render(<GlassTourPlanner stops={[]} date="Cmt 18 Tem" />)
    expect(screen.getByRole('status').textContent).toBe('Tur planında durak yok')
  })

  it('geri bildirim butonları onFeedback verilince görünür, tıklanan yönle çağrılır ve aria-pressed görsel seçimi işaretler', () => {
    const onFeedback = vi.fn()
    render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })
    const down = screen.getByRole('button', { name: 'Faydalı değil' })
    expect(up.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(up)
    expect(onFeedback).toHaveBeenCalledWith('up')
    expect(up.getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(down)
    expect(onFeedback).toHaveBeenCalledWith('down')
    expect(down.getAttribute('aria-pressed')).toBe('true')
    expect(up.getAttribute('aria-pressed')).toBe('false')
  })

  it('onFeedback verilmezse geri bildirim butonları hiç render edilmez', () => {
    render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" />)
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Faydalı değil' })).toBeNull()
  })

  it('regresyon: geri bildirim buton grubu görünür soruyla role="group" + aria-labelledby ile ilişkilendirilir', () => {
    render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" onFeedback={vi.fn()} />)
    const group = screen.getByRole('group', { name: 'Bu plan faydalı mıydı?' })
    const up = screen.getByRole('button', { name: 'Faydalı' })
    expect(group.contains(up)).toBe(true)
  })

  it('regresyon: aynı yöne tekrar tıklama seçimi geri alır (toggle)', () => {
    const onFeedback = vi.fn()
    render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })

    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('false')
    expect(onFeedback).toHaveBeenCalledTimes(2)
  })

  it('regresyon: date/stops içerik imzası GERÇEKTEN değişince geri bildirim seçimi sıfırlanır', () => {
    const onFeedback = vi.fn()
    const { rerender } = render(<GlassTourPlanner stops={stops} date="Cmt 18 Tem" onFeedback={onFeedback} />)
    const up = screen.getByRole('button', { name: 'Faydalı' })
    fireEvent.click(up)
    expect(up.getAttribute('aria-pressed')).toBe('true')

    rerender(<GlassTourPlanner stops={stops} date="Paz 19 Tem" onFeedback={onFeedback} />)
    expect(screen.getByRole('button', { name: 'Faydalı' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('boş stops dizisinde liste render edilmez, yerine sabit boş durum metni gösterilir', () => {
    render(<GlassTourPlanner stops={[]} date="Cmt 18 Tem" />)
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.getByText('Bu tur planında henüz durak eklenmemiş.')).toBeTruthy()
  })

  it('regresyon: stops=[] iken onConfirm verilmiş olsa bile "Planı Onayla" disabled kalır ve tıklama callback tetiklemez', () => {
    const onConfirm = vi.fn()
    render(<GlassTourPlanner stops={[]} date="Cmt 18 Tem" onConfirm={onConfirm} />)
    const button = screen.getByRole('button', { name: 'Planı Onayla' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('regresyon: stops=[] iken onFeedback verilse bile geri bildirim butonları render edilmez', () => {
    render(<GlassTourPlanner stops={[]} date="Cmt 18 Tem" onFeedback={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Faydalı' })).toBeNull()
  })
})
