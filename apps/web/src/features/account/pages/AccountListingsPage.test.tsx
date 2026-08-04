import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_FIXTURES } from '../data/account-fixtures'
import type { AccountDashboardData } from '../domain/account-types'

import { AccountListingsPage } from './AccountListingsPage'
import { headingLevels, renderAccountPage } from './account-page-test-utils'

const baseData = ACCOUNT_FIXTURES.default
const [liveListing, changesListing] = baseData.listings

function withData(overrides: Partial<AccountDashboardData>): AccountDashboardData {
  return { ...baseData, ...overrides }
}

describe('AccountListingsPage', () => {
  it('tek h1 ile açılır ve başlık sırası seviye atlamaz', async () => {
    await renderAccountPage(<AccountListingsPage data={baseData} />)

    const headings = screen.getAllByRole('heading')
    expect(headings[0].tagName).toBe('H1')
    expect(headings[0].textContent).toBe('İlanlarım')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)

    const levels = headingLevels(headings)
    expect(levels[1]).toBe(2)
    expect(Math.max(...levels)).toBe(3)
  })

  it('özet karolarında durum sayaçlarını gösterir', async () => {
    await renderAccountPage(<AccountListingsPage data={baseData} />)

    expect(screen.getByRole('heading', { level: 2, name: 'İlan özeti' })).toBeTruthy()

    const total = document.querySelector('[data-part="listing-stat-all"]')
    expect(total?.textContent).toContain('2')
    const action = document.querySelector('[data-part="listing-stat-action"]')
    expect(action?.textContent).toContain('1')
  })

  it('durum filtresi radiogroup olarak sunulur ve listeyi daraltır', async () => {
    const user = userEvent.setup()
    await renderAccountPage(<AccountListingsPage data={baseData} />)

    const filter = screen.getByRole('radiogroup', { name: 'İlan durumu filtresi' })
    expect(
      within(filter).getByRole('radio', { name: 'Tümü (2)' }).getAttribute('aria-checked'),
    ).toBe('true')

    expect(screen.getByRole('heading', { name: liveListing.title })).toBeTruthy()
    expect(screen.getByRole('heading', { name: changesListing.title })).toBeTruthy()

    await user.click(within(filter).getByRole('radio', { name: 'Yayında (1)' }))

    expect(screen.getByRole('heading', { name: liveListing.title })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: changesListing.title })).toBeNull()

    await user.click(within(filter).getByRole('radio', { name: 'İşlem gereken (1)' }))

    expect(screen.getByRole('heading', { name: changesListing.title })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: liveListing.title })).toBeNull()
  })

  it('klavyede ok tuşu bir sonraki filtreye geçirir', async () => {
    const user = userEvent.setup()
    await renderAccountPage(<AccountListingsPage data={baseData} />)

    const filter = screen.getByRole('radiogroup', { name: 'İlan durumu filtresi' })
    within(filter).getByRole('radio', { name: 'Tümü (2)' }).focus()
    await user.keyboard('{ArrowRight}')

    expect(
      within(filter)
        .getByRole('radio', { name: 'Yayında (1)' })
        .getAttribute('aria-checked'),
    ).toBe('true')
    expect(screen.queryByRole('heading', { name: changesListing.title })).toBeNull()
  })

  it('sonuç vermeyen filtrede boş durumu ve sıfırlama düğmesini gösterir', async () => {
    const user = userEvent.setup()
    await renderAccountPage(<AccountListingsPage data={baseData} />)

    const filter = screen.getByRole('radiogroup', { name: 'İlan durumu filtresi' })
    await user.click(within(filter).getByRole('radio', { name: 'Taslak (0)' }))

    expect(screen.getByText('Bu filtrede ilan yok')).toBeTruthy()
    expect(screen.getByText('Kaydedilmiş taslak ilanınız yok.')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Tüm ilanları göster' }))

    expect(screen.getByRole('heading', { name: liveListing.title })).toBeTruthy()
    expect(screen.queryByText('Bu filtrede ilan yok')).toBeNull()
  })

  it('hiç ilan yokken filtre yerine ilk ilan yönlendirmesini gösterir', async () => {
    await renderAccountPage(<AccountListingsPage data={withData({ listings: [] })} />)

    expect(screen.queryByRole('radiogroup')).toBeNull()
    expect(screen.getByText('İlk ilanınızı hazırlayın')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'İlan vermeye başla' })).toBeTruthy()
  })

  it('bölüm hatasında liste yerine uyarı çizer', async () => {
    await renderAccountPage(
      <AccountListingsPage
        data={withData({
          sectionErrors: [
            { section: 'listings', message: 'İlanlar şu anda yüklenemedi.' },
          ],
        })}
      />,
    )

    expect(screen.getByText('İlanlar yüklenemedi')).toBeTruthy()
    expect(screen.getByText('İlanlar şu anda yüklenemedi.')).toBeTruthy()
    expect(screen.queryByRole('radiogroup')).toBeNull()
  })
})
