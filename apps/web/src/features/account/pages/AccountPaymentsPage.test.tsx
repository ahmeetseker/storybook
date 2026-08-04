import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_FIXTURES } from '../data/account-fixtures'
import type { AccountDashboardData } from '../domain/account-types'

import { AccountPaymentsPage } from './AccountPaymentsPage'
import { headingLevels, renderAccountPage } from './account-page-test-utils'

const baseData = ACCOUNT_FIXTURES.default

function withData(overrides: Partial<AccountDashboardData>): AccountDashboardData {
  return { ...baseData, ...overrides }
}

describe('AccountPaymentsPage', () => {
  it('tek h1 ile açılır ve başlık sırası seviye atlamaz', async () => {
    await renderAccountPage(<AccountPaymentsPage data={baseData} />)

    const headings = screen.getAllByRole('heading')
    expect(headings[0].tagName).toBe('H1')
    expect(headings[0].textContent).toBe('Ödemeler')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)

    const levels = headingLevels(headings)
    expect(levels[1]).toBe(2)
    expect(Math.max(...levels)).toBe(2)
  })

  it('dönem özetini fixture toplamlarıyla gösterir', async () => {
    await renderAccountPage(<AccountPaymentsPage data={baseData} />)

    expect(
      document.querySelector('[data-part="payment-stat-paid"]')?.textContent,
    ).toContain('1.098,00 TL')
    expect(
      document.querySelector('[data-part="payment-stat-pending"]')?.textContent,
    ).toContain('129,00 TL')
    expect(
      document.querySelector('[data-part="payment-stat-pending-count"]')?.textContent,
    ).toContain('1')
  })

  it('kayıtlı yöntemleri maskeli etiketle ve varsayılan rozetiyle listeler', async () => {
    await renderAccountPage(<AccountPaymentsPage data={baseData} />)

    const methods = document.querySelectorAll('[data-part="payment-method"]')
    expect(methods).toHaveLength(2)

    const card = methods[0]
    expect(card.textContent).toContain('Kart')
    expect(card.textContent).toContain('Visa · 6411')
    expect(card.textContent).toContain('Son kullanma: 10/2028')
    expect(card.querySelector('[data-part="payment-method-default"]')).toBeTruthy()

    expect(methods[1].textContent).toContain('Havale / EFT')
    expect(methods[1].querySelector('[data-part="payment-method-default"]')).toBeNull()
  })

  it('başarısız ödeme varsa uyarı çizer', async () => {
    await renderAccountPage(<AccountPaymentsPage data={baseData} />)

    const alert = document.querySelector('[data-part="payment-failed-alert"]')
    expect(alert).toBeTruthy()
    expect(alert?.textContent).toContain('Başarısız ödeme var')
  })

  it('işlem geçmişi gerçek tablo semantiğiyle çizilir', async () => {
    await renderAccountPage(<AccountPaymentsPage data={baseData} />)

    const table = screen.getByRole('table')
    const headers = within(table).getAllByRole('columnheader')
    expect(headers.map((cell) => cell.textContent)).toEqual([
      'Tarih',
      'Açıklama',
      'Yöntem',
      'Tutar',
      'Durum',
    ])
    expect(headers.every((cell) => cell.getAttribute('scope') === 'col')).toBe(true)
    expect(within(table).getAllByRole('row')).toHaveLength(6)
  })

  it('ilişkili faturaya çapalı bağlantı verir', async () => {
    await renderAccountPage(<AccountPaymentsPage data={baseData} />)

    const link = screen.getByRole('link', { name: 'Faturayı gör (F-2026-0412)' })
    expect(link.getAttribute('href')).toBe('/hesabim/faturalarim#fatura-F-2026-0412')

    // Faturasız işlem için sahte bağlantı üretilmez.
    expect(screen.getAllByRole('link', { name: /^Faturayı gör/ })).toHaveLength(3)
    expect(screen.getAllByText('Bu işlem için fatura oluşmadı.')).toHaveLength(2)
  })

  it('durum filtresi radiogroup olarak sunulur ve listeyi daraltır', async () => {
    const user = userEvent.setup()
    await renderAccountPage(<AccountPaymentsPage data={baseData} />)

    const filter = screen.getByRole('radiogroup', { name: 'Ödeme durumu filtresi' })
    expect(
      within(filter).getByRole('radio', { name: 'Tümü (5)' }).getAttribute('aria-checked'),
    ).toBe('true')

    await user.click(within(filter).getByRole('radio', { name: 'Ödenen (2)' }))

    expect(document.querySelectorAll('[data-part="payment-row"]')).toHaveLength(2)
    expect(screen.queryByText('Ek ilan hakkı (1 ilan)')).toBeNull()

    await user.click(within(filter).getByRole('radio', { name: 'Başarısız (1)' }))
    expect(document.querySelectorAll('[data-part="payment-row"]')).toHaveLength(1)
  })

  it('sonuç vermeyen filtrede boş durumu ve sıfırlamayı gösterir', async () => {
    const user = userEvent.setup()
    const noRefund = withData({
      billing: baseData.billing
        ? {
            ...baseData.billing,
            payments: baseData.billing.payments.filter(
              (payment) => payment.status !== 'refunded',
            ),
          }
        : undefined,
    })

    await renderAccountPage(<AccountPaymentsPage data={noRefund} />)

    const filter = screen.getByRole('radiogroup', { name: 'Ödeme durumu filtresi' })
    await user.click(within(filter).getByRole('radio', { name: 'İade (0)' }))

    expect(screen.getByText('Bu filtrede işlem yok')).toBeTruthy()
    expect(screen.getByText('İade edilmiş ödemeniz yok.')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Tüm işlemleri göster' }))
    expect(document.querySelectorAll('[data-part="payment-row"]')).toHaveLength(4)
  })

  it('billing yokken anlamlı boş durumla açılır', async () => {
    await renderAccountPage(<AccountPaymentsPage data={withData({ billing: undefined })} />)

    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.getByText('Kayıtlı ödeme yönteminiz yok')).toBeTruthy()
    expect(screen.getByText('Henüz ödeme işleminiz yok')).toBeTruthy()
    expect(
      screen.getByText('Ödeme kaydınız oluştuğunda dönem toplamları burada özetlenir.'),
    ).toBeTruthy()
  })

  it('bölüm hatasında liste yerine uyarı çizer, diğer bölümler kalır', async () => {
    await renderAccountPage(
      <AccountPaymentsPage
        data={withData({
          sectionErrors: [
            { section: 'payments', message: 'Ödemeler şu anda yüklenemedi.' },
          ],
        })}
      />,
    )

    expect(screen.getByText('Ödemeler yüklenemedi')).toBeTruthy()
    expect(screen.getByText('Ödemeler şu anda yüklenemedi.')).toBeTruthy()
    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.queryByRole('table')).toBeNull()

    // Özet ve yöntemler bölümü çizilmeye devam eder.
    expect(document.querySelector('[data-part="payment-stat-paid"]')).toBeTruthy()
    expect(document.querySelectorAll('[data-part="payment-method"]')).toHaveLength(2)
  })

  it('sayfada birincil aksiyon kabuğa bırakılır', async () => {
    await renderAccountPage(<AccountPaymentsPage data={baseData} />)

    expect(document.querySelectorAll('[data-variant="primary"]')).toHaveLength(0)
  })
})
