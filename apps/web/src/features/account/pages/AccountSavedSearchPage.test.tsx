import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ACCOUNT_FIXTURES } from '../data/account-fixtures'
import type { AccountDashboardData } from '../domain/account-types'

import { AccountSavedSearchPage } from './AccountSavedSearchPage'
import { headingLevels, renderAccountPage } from './account-page-test-utils'

const baseData = ACCOUNT_FIXTURES.default

function withData(overrides: Partial<AccountDashboardData>): AccountDashboardData {
  return { ...baseData, ...overrides }
}

describe('AccountSavedSearchPage', () => {
  it('tek h1 ile açılır ve bölümleri h2 taşır', async () => {
    await renderAccountPage(<AccountSavedSearchPage data={baseData} />)

    const headings = screen.getAllByRole('heading')
    expect(headings[0].tagName).toBe('H1')
    expect(headings[0].textContent).toBe('Kayıtlı arama')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(headingLevels(headings)[1]).toBe(2)

    expect(screen.getByRole('heading', { level: 2, name: 'Arama ölçütleri' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Yeni eşleşmeler' })).toBeTruthy()
  })

  it('kayıtlı aramanın ölçütlerini ve eşleşme sayısını gösterir', async () => {
    await renderAccountPage(<AccountSavedSearchPage data={baseData} />)

    expect(
      screen.getByRole('heading', { level: 3, name: 'Urla ve Çeşme yatırım arsaları' }),
    ).toBeTruthy()
    expect(screen.getByText('İzmir')).toBeTruthy()
    expect(screen.getByText('Urla ve Çeşme')).toBeTruthy()
    expect(screen.getByText('Arsa')).toBeTruthy()

    const matches = document.querySelector('[data-part="saved-search-matches"]')
    expect(matches?.textContent).toContain('4')
    expect(matches?.textContent).toContain('yeni eşleşme incelemenizi bekliyor.')
  })

  it('devam aksiyonlarını gerçek bağlantı olarak sunar', async () => {
    await renderAccountPage(<AccountSavedSearchPage data={baseData} />)

    expect(
      screen.getByRole('link', { name: 'Eşleşmeleri aç' }).getAttribute('href'),
    ).toContain('/emlak')
    expect(
      screen.getByRole('link', { name: 'Favorilerinizi açın' }).getAttribute('href'),
    ).toContain('/favoriler')
  })

  it('kayıt yokken boş durumu ve aramaya başlama yönlendirmesini gösterir', async () => {
    await renderAccountPage(
      <AccountSavedSearchPage data={withData({ savedSearch: undefined })} />,
    )

    expect(screen.getByText('Kayıtlı aramanız yok')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Aramaya başlayın' })).toBeTruthy()
    expect(document.querySelector('[data-part="saved-search-matches"]')).toBeNull()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('bölüm hatasında kart yerine uyarı çizer', async () => {
    await renderAccountPage(
      <AccountSavedSearchPage
        data={withData({
          sectionErrors: [
            {
              section: 'saved-search',
              message: 'Kayıtlı arama güncellik bilgisi kullanılamıyor.',
            },
          ],
        })}
      />,
    )

    expect(screen.getByText('Kayıtlı arama yüklenemedi')).toBeTruthy()
    expect(document.querySelector('[data-part="saved-search-card"]')).toBeNull()
  })
})
