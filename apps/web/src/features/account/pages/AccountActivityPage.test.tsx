import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_FIXTURES } from '../data/account-fixtures'
import type { AccountDashboardData } from '../domain/account-types'

import { AccountActivityPage } from './AccountActivityPage'
import { headingLevels, renderAccountPage } from './account-page-test-utils'

const baseData = ACCOUNT_FIXTURES.default

function withData(overrides: Partial<AccountDashboardData>): AccountDashboardData {
  return { ...baseData, ...overrides }
}

describe('AccountActivityPage', () => {
  it('tek h1 ile açılır, bölümler h2, grup başlıkları h3 taşır', async () => {
    await renderAccountPage(<AccountActivityPage data={baseData} />)

    const headings = screen.getAllByRole('heading')
    expect(headings[0].tagName).toBe('H1')
    expect(headings[0].textContent).toBe('Hesap hareketleri')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)

    const levels = headingLevels(headings)
    expect(levels[1]).toBe(2)
    expect(Math.max(...levels)).toBe(3)
    expect(screen.getByRole('heading', { level: 2, name: 'Zaman çizelgesi' })).toBeTruthy()
  })

  it('hareketleri güne göre gruplar', async () => {
    await renderAccountPage(<AccountActivityPage data={baseData} />)

    const groups = document.querySelectorAll('[data-part="activity-group"]')
    // Fixture'da 27, 26 ve 25 Temmuz'a ait birer hareket var.
    expect(groups).toHaveLength(3)

    const groupHeadings = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)
    expect(groupHeadings[0]).toContain('27 Temmuz 2026')
    expect(groupHeadings[2]).toContain('25 Temmuz 2026')
  })

  it('aynı güne düşen hareketleri tek grupta toplar', async () => {
    await renderAccountPage(
      <AccountActivityPage
        data={withData({
          activities: [
            {
              id: 'a',
              occurredAt: '2026-07-27T08:15:00.000Z',
              dateLabel: 'Bugün, 11:15',
              title: 'Giriş yapıldı',
              tone: 'success',
            },
            {
              id: 'b',
              occurredAt: '2026-07-27T12:00:00.000Z',
              dateLabel: 'Bugün, 15:00',
              title: 'İlan güncellendi',
              tone: 'default',
            },
          ],
        })}
      />,
    )

    expect(document.querySelectorAll('[data-part="activity-group"]')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('27 Temmuz 2026')
  })

  it('tonlara göre sayaç gösterir ve ton adını metinle yazar', async () => {
    await renderAccountPage(<AccountActivityPage data={baseData} />)

    expect(
      document.querySelector('[data-part="activity-stat-success"]')?.textContent,
    ).toContain('Tamamlandı')
    expect(
      document.querySelector('[data-part="activity-stat-warning"]')?.textContent,
    ).toContain('1')
    expect(
      document.querySelector('[data-part="activity-stat-danger"]')?.textContent,
    ).toContain('0')
  })

  it('hareket yokken boş durumu gösterir', async () => {
    await renderAccountPage(<AccountActivityPage data={withData({ activities: [] })} />)

    expect(screen.getByText('Henüz hesap hareketi yok')).toBeTruthy()
    expect(document.querySelectorAll('[data-part="activity-group"]')).toHaveLength(0)
  })

  it('bölüm hatasında zaman çizelgesi yerine uyarı çizer', async () => {
    await renderAccountPage(
      <AccountActivityPage
        data={withData({
          sectionErrors: [
            { section: 'activity', message: 'Hareketler şu anda yüklenemedi.' },
          ],
        })}
      />,
    )

    expect(screen.getByText('Hesap hareketleri yüklenemedi')).toBeTruthy()
    expect(document.querySelector('[data-part="activity-groups"]')).toBeNull()
  })
})
