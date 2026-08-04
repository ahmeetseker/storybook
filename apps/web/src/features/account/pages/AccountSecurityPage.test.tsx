import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_FIXTURES } from '../data/account-fixtures'
import type { AccountDashboardData } from '../domain/account-types'

import { AccountSecurityPage } from './AccountSecurityPage'
import { headingLevels, renderAccountPage } from './account-page-test-utils'

const baseData = ACCOUNT_FIXTURES.default

function withData(overrides: Partial<AccountDashboardData>): AccountDashboardData {
  return { ...baseData, ...overrides }
}

describe('AccountSecurityPage', () => {
  it('tek h1 ile açılır ve bölümleri h2 taşır', async () => {
    await renderAccountPage(<AccountSecurityPage data={baseData} />)

    const headings = screen.getAllByRole('heading')
    expect(headings[0].tagName).toBe('H1')
    expect(headings[0].textContent).toBe('Güvenlik ve doğrulama')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(headingLevels(headings)[1]).toBe(2)

    expect(screen.getByRole('heading', { level: 2, name: 'Doğrulama durumu' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Sonraki adımlar' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Son oturum' })).toBeTruthy()
  })

  it('her kanalın durumunu metinle yazar', async () => {
    await renderAccountPage(<AccountSecurityPage data={baseData} />)

    const email = document.querySelector('[data-part="verification-email"]')
    expect(email?.textContent).toContain('Doğrulandı')
    const eids = document.querySelector('[data-part="verification-eids"]')
    expect(eids?.textContent).toContain('Beklemede')
  })

  it('tamamlanmamış doğrulama için ne yapılacağını gösterir', async () => {
    await renderAccountPage(<AccountSecurityPage data={baseData} />)

    const steps = document.querySelectorAll('[data-part^="security-step-"]')
    expect(steps).toHaveLength(1)
    expect(document.querySelector('[data-part="security-step-eids"]')?.textContent).toContain(
      'EİDS başvurunuz inceleniyor',
    )
    expect(screen.getByRole('link', { name: 'İlan verme akışını aç' })).toBeTruthy()
  })

  it('tüm kanallar doğrulandığında adım listesi yerine boş durumu gösterir', async () => {
    await renderAccountPage(
      <AccountSecurityPage
        data={withData({
          verification: { email: 'verified', phone: 'verified', eids: 'verified' },
        })}
      />,
    )

    expect(screen.getByText('Bekleyen doğrulama yok')).toBeTruthy()
    expect(document.querySelectorAll('[data-part^="security-step-"]')).toHaveLength(0)
  })

  it('son oturumu cihaz, konum ve zamanla ayrıştırır', async () => {
    await renderAccountPage(<AccountSecurityPage data={baseData} />)

    const loginTime = document
      .querySelector('[data-part="last-login-time"]')
      ?.querySelector('time')
    expect(loginTime?.tagName).toBe('TIME')
    expect(loginTime?.getAttribute('datetime')).toBe('2026-07-27T08:15:00.000Z')
    expect(loginTime?.textContent).toContain('27 Tem 2026')
    expect(loginTime?.textContent).toContain('11:15')

    expect(
      document.querySelector('[data-part="last-login-device"]')?.textContent,
    ).toContain('Safari · macOS')
    expect(
      document.querySelector('[data-part="last-login-location"]')?.textContent,
    ).toContain('İzmir, Türkiye')
  })

  it('veri güncellenme zamanını bildirir; yoksa açıkça yazar', async () => {
    const { unmount } = await renderAccountPage(<AccountSecurityPage data={baseData} />)

    expect(
      document.querySelector('[data-part="security-freshness"]')?.textContent,
    ).toContain('Veriler son güncelleme')

    unmount()

    await renderAccountPage(<AccountSecurityPage data={withData({ security: {} })} />)

    expect(
      document.querySelector('[data-part="security-freshness"]')?.textContent,
    ).toBe('Veri güncellik bilgisi kullanılamıyor')
    expect(screen.getByText('Son giriş bilgisi kullanılamıyor')).toBeTruthy()
  })

  it('bölüm hatasında doğrulama listesi yerine uyarı çizer', async () => {
    await renderAccountPage(
      <AccountSecurityPage
        data={withData({
          sectionErrors: [
            { section: 'security', message: 'Güvenlik bilgileri alınamadı.' },
          ],
        })}
      />,
    )

    expect(screen.getByText('Güvenlik bilgileri yüklenemedi')).toBeTruthy()
    expect(document.querySelector('[data-part="verification-summary"]')).toBeNull()
  })
})
