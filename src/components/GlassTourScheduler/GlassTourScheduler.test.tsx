import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassTourScheduler, type GlassTourDay, type GlassTourSchedulerProps } from './GlassTourScheduler'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const days: GlassTourDay[] = [
  {
    date: '2026-07-18',
    label: 'Cum 18 Tem',
    slots: [
      { time: '10:00', available: true },
      { time: '11:00', available: false },
      { time: '14:00', available: true },
    ],
  },
  {
    date: '2026-07-19',
    label: 'Cmt 19 Tem',
    slots: [
      { time: '09:30', available: true },
      { time: '13:00', available: true },
    ],
  },
  {
    date: '2026-07-20',
    label: 'Paz 20 Tem',
    slots: [],
  },
]

const renderScheduler = (props: Partial<GlassTourSchedulerProps> = {}) =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassTourScheduler days={days} {...props} />
    </GlassTierProvider>,
  )

describe('GlassTourScheduler', () => {
  it('gün şeridi ve ilk günün saat ızgarasıyla render olur; ilk gün varsayılan seçili', () => {
    renderScheduler()
    expect(screen.getByRole('radiogroup', { name: 'Gün seç' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Cum 18 Tem/ }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('radio', { name: '10:00' })).toBeTruthy()
  })

  it('dolu slot disabled olur ve seçilemez', () => {
    renderScheduler()
    const fullSlot = screen.getByRole('radio', { name: '11:00' })
    expect(fullSlot.hasAttribute('disabled')).toBe(true)
    fireEvent.click(fullSlot)
    expect(fullSlot.getAttribute('aria-checked')).toBe('false')
  })

  it('gün değiştirince seçili saat sıfırlanır ve yeni günün slotları gösterilir', () => {
    renderScheduler()
    fireEvent.click(screen.getByRole('radio', { name: '10:00' }))
    expect(screen.getByRole('radio', { name: '10:00' }).getAttribute('aria-checked')).toBe('true')

    fireEvent.click(screen.getByRole('radio', { name: /Cmt 19 Tem/ }))
    expect(screen.getByRole('radio', { name: '09:30' })).toBeTruthy()
    expect(screen.queryByRole('radio', { name: '10:00' })).toBeNull()
  })

  it('boş slot içeren gün "uygun saat bulunmuyor" mesajını gösterir', () => {
    renderScheduler()
    fireEvent.click(screen.getByRole('radio', { name: /Paz 20 Tem/ }))
    expect(screen.getByText('Bu gün için uygun saat bulunmuyor.')).toBeTruthy()
  })

  it('saat seçilmeden "Randevu iste" disabled kalır, seçilince aktif olur', () => {
    renderScheduler()
    const submit = screen.getByRole('button', { name: 'Randevu iste' })
    expect(submit.hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('radio', { name: '14:00' }))
    expect(submit.hasAttribute('disabled')).toBe(false)
  })

  it('"Randevu iste" tıklanınca onRequest doğru payload ile çağrılır ve onay ekranına geçilir', () => {
    const onRequest = vi.fn()
    renderScheduler({ onRequest })
    fireEvent.click(screen.getByRole('radio', { name: '14:00' }))
    fireEvent.click(screen.getByRole('button', { name: 'Randevu iste' }))
    expect(onRequest).toHaveBeenCalledWith({ date: '2026-07-18', time: '14:00', type: 'Yerinde' })
    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.getByText(/Cum 18 Tem · 14:00 · Yerinde/)).toBeTruthy()
  })

  it('onay ekranında "Takvime ekle" butonu vardır ve tıklanınca onRequest tekrar çağrılmaz', () => {
    const onRequest = vi.fn()
    renderScheduler({ onRequest })
    fireEvent.click(screen.getByRole('radio', { name: '10:00' }))
    fireEvent.click(screen.getByRole('button', { name: 'Randevu iste' }))
    expect(onRequest).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Takvime ekle' }))
    expect(onRequest).toHaveBeenCalledTimes(1)
  })

  it('tur tipi seçenekleri varsayılan üç değerle render olur ve seçim değiştirilebilir', () => {
    renderScheduler()
    const group = screen.getByRole('radiogroup', { name: 'Tur tipi' })
    const typeGroup = within(group)
    expect(typeGroup.getByRole('radio', { name: 'Yerinde' }).getAttribute('aria-checked')).toBe('true')
    fireEvent.click(typeGroup.getByRole('radio', { name: 'Canlı video' }))
    expect(typeGroup.getByRole('radio', { name: 'Canlı video' }).getAttribute('aria-checked')).toBe('true')
  })

  it('özel tourTypes prop\'u ile farklı seçenekler render edilebilir', () => {
    renderScheduler({ tourTypes: ['Fiziksel Ziyaret', 'Görüntülü'] })
    const group = screen.getByRole('radiogroup', { name: 'Tur tipi' })
    expect(within(group).getByRole('radio', { name: 'Fiziksel Ziyaret' })).toBeTruthy()
  })

  it('variant="compact" kökte data-variant ile işaretlenir', () => {
    const { container } = renderScheduler({ variant: 'compact' })
    expect(container.querySelector('[data-variant="compact"]')).toBeTruthy()
  })
})
