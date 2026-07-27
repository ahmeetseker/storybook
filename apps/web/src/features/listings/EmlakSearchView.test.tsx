import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { parseListingSearch } from './domain/search-state'
import { searchListings } from './data/listing-adapter'
import { EmlakSearchView } from './EmlakSearchView'

async function renderSearch(raw: Record<string, string> = {}) {
  const state = parseListingSearch(raw)
  const response = await searchListings({ state, pageSize: 24 })
  const onStateChange = vi.fn()

  render(
    <EmlakSearchView
      state={state}
      response={response}
      status="success"
      onStateChange={onStateChange}
      onAiSearch={vi.fn()}
      onSaveSearch={vi.fn()}
    />,
  )

  return { state, response, onStateChange }
}

describe('EmlakSearchView', () => {
  it('renders the all-property result workspace with detailed row cards', async () => {
    const { response } = await renderSearch()

    expect(
      screen.getByRole('heading', { name: 'Tüm Emlak' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: `${response.total} ilan`,
        level: 2,
      }),
    ).toBeTruthy()
    expect(
      screen.getAllByRole('article', { name: /ilanı$/ }),
    ).toHaveLength(24)
  })

  it('shows land-specialist filter groups for the land category', async () => {
    await renderSearch({ category: 'land' })

    expect(screen.getAllByText('İmar ve tapu').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Altyapı ve konum').length).toBeGreaterThan(0)
  })

  it('emits an updated state when a desktop filter changes', async () => {
    const { onStateChange } = await renderSearch()

    fireEvent.click(
      screen.getAllByRole('checkbox', {
        name: 'Yalnız doğrulanmış ilanlar',
      })[0],
    )

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ verified: true, page: 1 }),
      expect.objectContaining({ history: 'replace' }),
    )
  })

  it('uses the themed listbox for location selection', async () => {
    const { onStateChange } = await renderSearch()
    const citySelect = screen.getAllByLabelText('Şehir')[0]

    expect(citySelect.tagName).toBe('BUTTON')
    fireEvent.click(citySelect)
    expect(screen.getByRole('listbox', { name: 'Şehir' })).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'İzmir' }))
    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'izmir',
        district: undefined,
        page: 1,
      }),
      expect.objectContaining({ history: 'replace' }),
    )
    expect(document.querySelector('select')).toBeNull()
  })

  it('opens the mobile filter dialog with draft apply actions', async () => {
    await renderSearch()

    fireEvent.click(screen.getByRole('button', { name: 'Filtreleri aç' }))

    expect(
      screen.getByRole('dialog', { name: 'Emlak filtreleri' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /ilanı göster$/ }),
    ).toBeTruthy()
  })

  it('keeps AI-derived filters as an explicit proposal until approved', async () => {
    const state = parseListingSearch({})
    const response = await searchListings({ state, pageSize: 24 })
    const onApplyAiProposal = vi.fn()

    render(
      <EmlakSearchView
        state={state}
        response={response}
        status="success"
        onStateChange={vi.fn()}
        onAiSearch={vi.fn()}
        onSaveSearch={vi.fn()}
        aiProposal={{
          confidence: 88,
          filters: [
            {
              key: 'category',
              label: 'Kategori',
              value: 'land',
              displayValue: 'Arsa',
            },
          ],
        }}
        onApplyAiProposal={onApplyAiProposal}
      />,
    )

    expect(screen.getByText('AI önerisi')).toBeTruthy()
    fireEvent.click(
      screen.getByRole('button', { name: 'Önerilen filtreleri uygula' }),
    )
    expect(onApplyAiProposal).toHaveBeenCalledOnce()
  })
})
