import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_FIXTURES } from '../data/account-fixtures'
import type { AccountDashboardData } from '../domain/account-types'

import { AccountInvoicesPage } from './AccountInvoicesPage'
import { headingLevels, renderAccountPage } from './account-page-test-utils'

const baseData = ACCOUNT_FIXTURES.default

function withData(overrides: Partial<AccountDashboardData>): AccountDashboardData {
  return { ...baseData, ...overrides }
}

describe('AccountInvoicesPage', () => {
  it('tek h1 ile açılır ve başlık sırası seviye atlamaz', async () => {
    await renderAccountPage(<AccountInvoicesPage data={baseData} />)

    const headings = screen.getAllByRole('heading')
    expect(headings[0].tagName).toBe('H1')
    expect(headings[0].textContent).toBe('Faturalarım')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)

    const levels = headingLevels(headings)
    expect(levels[1]).toBe(2)
    expect(Math.max(...levels)).toBe(3)
  })

  it('faturaları döneme göre kümeler ve dönem toplamını yazar', async () => {
    await renderAccountPage(<AccountInvoicesPage data={baseData} />)

    const groups = document.querySelectorAll('[data-part="invoice-group"]')
    expect(groups).toHaveLength(2)

    expect(
      within(groups[0] as HTMLElement).getByRole('heading', { level: 3 }).textContent,
    ).toBe('Temmuz 2026')
    // İptal edilen fatura toplama girmez.
    expect(groups[0].textContent).toContain('Dönem toplamı: 1.227,00 TL')
    expect(groups[1].textContent).toContain('Dönem toplamı: 0,00 TL')
  })

  it('her fatura satırı `fatura-<id>` çapasını taşır', async () => {
    await renderAccountPage(<AccountInvoicesPage data={baseData} />)

    const items = document.querySelectorAll('[data-part="invoice-item"]')
    expect(items).toHaveLength(4)
    expect([...items].map((item) => item.id)).toEqual([
      'fatura-F-2026-0412',
      'fatura-F-2026-0398',
      'fatura-F-2026-0431',
      'fatura-F-2026-0361',
    ])

    const first = document.getElementById('fatura-F-2026-0412')
    expect(first?.textContent).toContain('Fatura no: F-2026-0412')
    expect(first?.textContent).toContain('349,00 TL')
    expect(first?.textContent).toContain('KDV %20 dahil · 58,17 TL')
    expect(first?.textContent).toContain('Kesildi')
  })

  it('yalnız downloadHref taşıyan faturalarda PDF bağlantısı verir', async () => {
    await renderAccountPage(<AccountInvoicesPage data={baseData} />)

    const links = screen.getAllByRole('link', { name: /^PDF indir/ })
    expect(links).toHaveLength(3)
    expect(
      screen.getByRole('link', { name: 'PDF indir (F-2026-0412)' }).getAttribute('href'),
    ).toBe('#fatura-F-2026-0412')

    const pending = document.getElementById('fatura-F-2026-0431') as HTMLElement
    expect(within(pending).queryByRole('link')).toBeNull()
  })

  it('fatura bilgileri kartını gösterir', async () => {
    await renderAccountPage(<AccountInvoicesPage data={baseData} />)

    const profile = document.querySelector('[data-part="billing-profile"]')
    expect(profile?.textContent).toContain('Mehmet Yılmaz (Bireysel)')
    expect(profile?.textContent).toContain('Konak Vergi Dairesi')
    expect(profile?.textContent).toContain('1234567890')
    expect(profile?.textContent).toContain('Alsancak Mah.')
  })

  it('fatura bilgisi yoksa boş durumu gösterir', async () => {
    const noProfile = withData({
      billing: baseData.billing ? { ...baseData.billing, profile: undefined } : undefined,
    })

    await renderAccountPage(<AccountInvoicesPage data={noProfile} />)

    expect(screen.getByText('Fatura bilgisi eklenmemiş')).toBeTruthy()
    expect(document.querySelector('[data-part="billing-profile"]')).toBeNull()
  })

  it('billing yokken anlamlı boş durumla açılır', async () => {
    await renderAccountPage(<AccountInvoicesPage data={withData({ billing: undefined })} />)

    expect(document.querySelectorAll('[data-part="invoice-item"]')).toHaveLength(0)
    expect(screen.getByText('Henüz faturanız yok')).toBeTruthy()
    expect(screen.getByText('Fatura bilgisi eklenmemiş')).toBeTruthy()
  })

  it('bölüm hatasında liste yerine uyarı çizer, fatura bilgileri kalır', async () => {
    await renderAccountPage(
      <AccountInvoicesPage
        data={withData({
          sectionErrors: [
            { section: 'invoices', message: 'Faturalar şu anda yüklenemedi.' },
          ],
        })}
      />,
    )

    expect(screen.getByText('Faturalar yüklenemedi')).toBeTruthy()
    expect(screen.getByText('Faturalar şu anda yüklenemedi.')).toBeTruthy()
    expect(document.querySelectorAll('[data-part="invoice-item"]')).toHaveLength(0)
    expect(document.querySelector('[data-part="billing-profile"]')).toBeTruthy()
  })

  it('sayfada birincil aksiyon kabuğa bırakılır', async () => {
    await renderAccountPage(<AccountInvoicesPage data={baseData} />)

    expect(document.querySelectorAll('[data-variant="primary"]')).toHaveLength(0)
  })
})
