import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentSchedulerModal } from './AppointmentSchedulerModal'
import { listAppointments, resetAppointmentStore } from '../data/appointment-store'

const OFIS = { id: 'office-1', name: 'Kadıköy Anahtar Ofis', responseMinutes: 9 }

beforeEach(() => resetAppointmentStore())

describe('AppointmentSchedulerModal', () => {
  it('office null iken hiçbir şey çizmez', () => {
    const { container } = render(
      <AppointmentSchedulerModal office={null} onClose={() => {}} />,
    )
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('ilk müsait günü seçili açar ve o günün saat dilimlerini listeler', () => {
    render(<AppointmentSchedulerModal office={OFIS} onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: /görüşme planla/i })).toBeTruthy()
    // Saat çipleri listelenir; en az bir müsait saat butonu vardır.
    expect(screen.getByRole('group', { name: /saat dilimi/i })).toBeTruthy()
  })

  it('saat seçilmeden gönderilemez; saat seçilince talep store\'a düşer', async () => {
    const user = userEvent.setup()
    const onScheduled = vi.fn()
    render(
      <AppointmentSchedulerModal office={OFIS} onClose={() => {}} onScheduled={onScheduled} />,
    )
    const gonder = screen.getByRole('button', { name: /randevu talep et/i })
    expect(gonder).toHaveProperty('disabled', true)

    const grup = screen.getByRole('group', { name: /saat dilimi/i })
    const ilkSaat = grup.querySelector<HTMLElement>('[aria-pressed="false"]:not([aria-disabled="true"])')
    expect(ilkSaat).toBeTruthy()
    await user.click(ilkSaat!)

    await user.click(screen.getByRole('button', { name: /randevu talep et/i }))
    const kayitlar = listAppointments()
    expect(kayitlar).toHaveLength(1)
    expect(kayitlar[0].officeId).toBe('office-1')
    expect(kayitlar[0].slot).toMatch(/^\d{2}:00$/)
    expect(onScheduled).toHaveBeenCalledWith(kayitlar[0])
  })

  it('hızlı yanıtlı ofiste (responseMinutes <= 10) talep autoConfirm ile oluşur', async () => {
    // NOT: userEvent + fake timers, Glass bileşenlerinin motion tabanlı basma
    // animasyonlarıyla (useGlassPress → requestAnimationFrame) kilitleniyor —
    // bu proje genelinde aynı sebeple (bkz. GirisKodPage.test.tsx,
    // AdvisorWorkspace.test.tsx) fireEvent + vi.advanceTimersByTimeAsync
    // kalıbı kullanılıyor. Davranış aynı: müsait ilk saat tıklanır, ardından
    // gönder butonu tıklanır.
    vi.useFakeTimers()
    try {
      render(<AppointmentSchedulerModal office={OFIS} onClose={() => {}} />)
      const grup = screen.getByRole('group', { name: /saat dilimi/i })
      fireEvent.click(grup.querySelector<HTMLElement>('[aria-pressed="false"]:not([aria-disabled="true"])')!)
      fireEvent.click(screen.getByRole('button', { name: /randevu talep et/i }))
      await vi.advanceTimersByTimeAsync(10_000)
      expect(listAppointments()[0].status).toBe('confirmed')
    } finally {
      vi.useRealTimers()
    }
  })

  it('hafta sonu seçilince yalnız "ofis kapalı" mesajı görünür; "dolu" mesajıyla çakışmaz', async () => {
    // Regresyon: officeAvailability hafta içi günü asla tümüyle dolu
    // bırakmaz (Task 1 sözleşmesi) — yani "gün dolu" ipucu yalnız hafta
    // sonu (slots === []) tetiklenebiliyordu ve "ofis kapalı" mesajıyla
    // aynı anda render oluyordu. Burada takvimden gerçek bir hafta sonu
    // günü seçilip yalnız tek mesajın çizildiği doğrulanıyor.
    const user = userEvent.setup()
    render(<AppointmentSchedulerModal office={OFIS} onClose={() => {}} />)

    const weekend = new Date()
    weekend.setDate(weekend.getDate() + 1)
    while (weekend.getDay() !== 0 && weekend.getDay() !== 6) {
      weekend.setDate(weekend.getDate() + 1)
    }
    const weekendKey = `${weekend.getFullYear()}-${weekend.getMonth() + 1}-${weekend.getDate()}`

    await user.click(screen.getByRole('combobox'))
    const cell = document.querySelector<HTMLElement>(`[data-date="${weekendKey}"]`)
    expect(cell).toBeTruthy()
    await user.click(cell!)

    expect(screen.queryByText(/bu gün dolu/i)).toBeNull()
    expect(screen.getByText(/bu gün ofis kapalı/i)).toBeTruthy()
  })
})
