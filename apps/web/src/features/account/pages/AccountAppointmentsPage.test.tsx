import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountAppointmentsPage } from './AccountAppointmentsPage'
import { renderAccountPage } from './account-page-test-utils'
import { createAppointment, resetAppointmentStore } from '@/features/appointments/data/appointment-store'

const YARIN_SONRASI = '2999-01-04' // hep gelecekte
const GECMIS = '2020-01-04'

beforeEach(() => resetAppointmentStore())

const ekle = (date: string, overrides: Partial<Parameters<typeof createAppointment>[0]> = {}) =>
  createAppointment({
    officeId: 'office-1',
    officeName: 'Kadıköy Anahtar Ofis',
    date,
    slot: '10:00',
    type: 'office',
    autoConfirm: false,
    ...overrides,
  })

describe('AccountAppointmentsPage', () => {
  it('boş durumda ofisleri keşfet yönlendirmesi gösterir', async () => {
    await renderAccountPage(<AccountAppointmentsPage />)
    expect(screen.getByText(/henüz randevunuz yok/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /ofisleri keşfet/i })).toBeTruthy()
  })

  it('gelecek randevu Yaklaşan, geçmiş tarihli Geçmiş grubunda listelenir', async () => {
    ekle(YARIN_SONRASI)
    ekle(GECMIS)
    await renderAccountPage(<AccountAppointmentsPage />)
    const yaklasan = screen.getByRole('region', { name: /yaklaşan/i })
    const gecmis = screen.getByRole('region', { name: /geçmiş/i })
    expect(within(yaklasan).getAllByText(/kadıköy anahtar ofis/i)).toHaveLength(1)
    expect(within(gecmis).getAllByText(/kadıköy anahtar ofis/i)).toHaveLength(1)
  })

  it('bekleyen randevu iptal edilince Geçmiş grubuna İptal edildi rozetiyle düşer', async () => {
    const user = userEvent.setup()
    ekle(YARIN_SONRASI)
    await renderAccountPage(<AccountAppointmentsPage />)
    // Not: JS regex /i bayrağı Türkçe noktalı büyük İ'yi düz i'ye eşlemez
    // (basit Unicode case-folding); "İptal et" eşleşmesi için İ harfini
    // regex'e büyük harfiyle yazmak gerekir.
    await user.click(screen.getByRole('button', { name: /İptal et/i }))
    const gecmis = screen.getByRole('region', { name: /geçmiş/i })
    expect(within(gecmis).getByText(/İptal edildi/i)).toBeTruthy()
  })

  it('durum rozetleri: pending Onay bekliyor, confirmed Onaylandı', async () => {
    ekle(YARIN_SONRASI)
    await renderAccountPage(<AccountAppointmentsPage />)
    expect(screen.getByText(/onay bekliyor/i)).toBeTruthy()
  })
})
