import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ACCOUNT_FIXTURES } from '../data/account-fixtures'
import { AccountPlanPage } from './AccountPlanPage'

const data = ACCOUNT_FIXTURES.default

/**
 * Künye satırının değeri. Paket adı hem künyede hem karşılaştırma
 * tablosundaki kartta geçer; metinle arama ikisini birden bulur, bu yüzden
 * `dt` etiketinden komşu `dd`'ye gidilir.
 */
function kunyeDegeri(etiket: string): string {
  const dt = screen.getByText(etiket)
  return dt.nextElementSibling?.textContent?.trim() ?? ''
}

describe('AccountPlanPage', () => {
  it('yürürlükteki paketi ve ek koltuk dökümünü künyede gösterir', () => {
    render(<AccountPlanPage data={data} currentPlanId="profesyonel" currentSeats={8} />)

    expect(screen.getByRole('heading', { name: 'Paketim', level: 1 })).toBeTruthy()
    expect(kunyeDegeri('Yürürlükteki paket')).toBe('Ofis Profesyonel')
    // 6 dahil + 2 ek
    expect(kunyeDegeri('Danışman koltuğu')).toBe('8 koltuk (6 dahil + 2 ek)')
    // 3900 + 2 × 290 = 4480
    expect(kunyeDegeri('Aylık tutar')).toBe('₺4.480')
  })

  it('koltuk sayısı pakete dahil olduğunda ek kalem yazmaz', () => {
    render(<AccountPlanPage data={data} currentPlanId="baslangic" />)
    expect(kunyeDegeri('Danışman koltuğu')).toBe('2 koltuk (pakete dahil)')
    expect(kunyeDegeri('Aylık tutar')).toBe('₺1.490')
  })

  it('mevcut paket satın alınabilir görünmez, diğerleri yükseltme/geçiş der', () => {
    render(<AccountPlanPage data={data} currentPlanId="profesyonel" />)

    const mevcut = screen
      .getByRole('heading', { name: 'Ofis Profesyonel', level: 3 })
      .closest('article') as HTMLElement
    expect(within(mevcut).getByRole('button', { name: 'Mevcut paketiniz' })).toBeTruthy()

    const ust = screen
      .getByRole('heading', { name: 'Ofis Kurumsal', level: 3 })
      .closest('article') as HTMLElement
    expect(within(ust).getByRole('button', { name: 'Bu pakete yükselt' })).toBeTruthy()

    const alt = screen
      .getByRole('heading', { name: 'Ofis Başlangıç', level: 3 })
      .closest('article') as HTMLElement
    expect(within(alt).getByRole('button', { name: 'Bu pakete geç' })).toBeTruthy()
  })

  it('paket değişimi seçilen paket ve koltuk adediyle bildirilir', async () => {
    const kullanici = userEvent.setup()
    const onPlanChange = vi.fn()
    render(
      <AccountPlanPage data={data} currentPlanId="baslangic" onPlanChange={onPlanChange} />,
    )

    const hedef = screen
      .getByRole('heading', { name: 'Ofis Kurumsal', level: 3 })
      .closest('article') as HTMLElement
    await kullanici.click(within(hedef).getByRole('button', { name: 'Bu pakete yükselt' }))

    expect(onPlanChange).toHaveBeenCalledWith('kurumsal', 20)
  })
})
