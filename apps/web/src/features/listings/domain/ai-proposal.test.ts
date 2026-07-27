import { describe, expect, it } from 'vitest'
import { parseListingSearch } from './search-state'
import { applyAiProposal } from './ai-proposal'

describe('AI filter proposal application', () => {
  it('applies approved common and category filters and resets pagination', () => {
    const initial = parseListingSearch({ page: '4', sort: 'newest' })

    const next = applyAiProposal(initial, {
      confidence: 92,
      filters: [
        {
          key: 'category',
          label: 'Kategori',
          value: 'land',
          displayValue: 'Arsa',
        },
        {
          key: 'city',
          label: 'Şehir',
          value: 'izmir',
          displayValue: 'İzmir',
        },
        {
          key: 'salePriceMax',
          label: 'Azami fiyat',
          value: 5_000_000,
          displayValue: '5.000.000 TL',
        },
        {
          key: 'f_zoning',
          label: 'İmar',
          value: 'residential',
          displayValue: 'Konut imarlı',
        },
      ],
    })

    expect(next).toMatchObject({
      category: 'land',
      city: 'izmir',
      salePrice: { max: 5_000_000 },
      categoryFilters: { zoning: ['residential'] },
      sort: 'newest',
      page: 1,
    })
  })
})
