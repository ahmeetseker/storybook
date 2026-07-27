import { describe, expect, it, vi } from 'vitest'
import { createPageHead } from '../config/routes'
import {
  DEFAULT_OFFICE_SEARCH_STATE,
  parseOfficeSearch,
  serializeOfficeSearch,
} from '../features/offices/domain/office-search-state'
import { searchOffices } from '../features/offices/data/office-adapter'
import * as OfficeRouteModule from './ofisler'

type OfficeRouteOptions = {
  validateSearch?: (search: Record<string, unknown>) => Record<string, string | number>
  loader?: (input: {
    context: { queryClient: { ensureQueryData: (options: unknown) => Promise<unknown> } }
    deps: { search: Record<string, string | number> }
  }) => Promise<unknown>
  head?: () => unknown
}

function options(): OfficeRouteOptions {
  return OfficeRouteModule.Route.options as OfficeRouteOptions
}

describe('/ofisler rotası', () => {
  it('URL aramasını düz canonical ofis sorgusuna dönüştürür', () => {
    expect(typeof options().validateSearch).toBe('function')
    expect(options().validateSearch?.({
      intent: 'sell',
      city: 'izmir',
      expertise: 'land, zoning',
      verified: '1',
      page: '0',
      unexpected: 'sil',
    })).toEqual({
      intent: 'sell',
      city: 'izmir',
      expertise: 'land,zoning',
      verified: '1',
    })
  })

  it('canonical sorgu anahtarıyla ofis verisini loader içinde önceden yükler', async () => {
    const ensureQueryData = vi.fn().mockResolvedValue({ items: [] })
    expect(typeof options().loader).toBe('function')

    await options().loader?.({
      context: { queryClient: { ensureQueryData } },
      deps: { search: { city: 'izmir' } },
    })

    expect(ensureQueryData).toHaveBeenCalledWith(expect.objectContaining({
      queryKey: ['offices', { city: 'izmir' }],
    }))
  })

  it('filtre güncellemesini ve AI önerisini canonical URL ile replace olarak hazırlar', () => {
    const createInstruction = (OfficeRouteModule as typeof OfficeRouteModule & {
      createOfficeNavigationInstruction?: (
        state: ReturnType<typeof parseOfficeSearch>,
        history: 'push' | 'replace',
      ) => { search: Record<string, string | number>; replace: boolean }
    }).createOfficeNavigationInstruction

    expect(typeof createInstruction).toBe('function')
    const filtered = parseOfficeSearch({ city: 'izmir', verified: '1' })
    expect(createInstruction?.(filtered, 'replace')).toEqual({
      search: serializeOfficeSearch(filtered),
      replace: true,
    })

    const aiApplied = {
      ...DEFAULT_OFFICE_SEARCH_STATE,
      intent: 'sell' as const,
      city: 'izmir',
      district: 'urla',
      propertyType: 'land',
      expertise: ['land', 'zoning'],
    }
    expect(createInstruction?.(aiApplied, 'replace')).toEqual({
      search: serializeOfficeSearch(aiApplied),
      replace: true,
    })
  })

  it('head bilgisini offices rota kaydından üretir', () => {
    expect(options().head?.()).toEqual(createPageHead('offices'))
  })

  it('AI promptunu literal q filtresine dönüştürmeden sonuç üreten canonical state uygular', async () => {
    const routeHelpers = OfficeRouteModule as typeof OfficeRouteModule & {
      createOfficeProposal?: (query: string) => {
        filters: Array<{ key: string; value: string }>
      }
      applyOfficeProposal?: (
        state: ReturnType<typeof parseOfficeSearch>,
        proposal: { filters: Array<{ key: string; value: string }> },
      ) => ReturnType<typeof parseOfficeSearch>
    }
    const applyProposal = routeHelpers.applyOfficeProposal

    expect(typeof routeHelpers.createOfficeProposal).toBe('function')
    expect(typeof applyProposal).toBe('function')
    const prompt = 'İzmir Urla’da arsa satışı için imar uzmanı arıyorum'
    const proposal = routeHelpers.createOfficeProposal?.(prompt)
    const next = proposal && applyProposal?.(parseOfficeSearch({ q: prompt }), proposal)

    expect(next).toMatchObject({
      query: '',
      intent: 'sell',
      city: 'izmir',
      district: 'urla',
      propertyType: 'land',
      expertise: ['land', 'zoning'],
    })
    expect(next && serializeOfficeSearch(next).q).toBeUndefined()
    const instruction = OfficeRouteModule.createOfficeNavigationInstruction(next!, 'replace')
    expect(instruction).toEqual({
      search: {
        intent: 'sell',
        propertyType: 'land',
        city: 'izmir',
        district: 'urla',
        expertise: 'land,zoning',
      },
      replace: true,
    })
    const response = await searchOffices({ state: next!, pageSize: 18 })
    expect(response.items.length).toBeGreaterThan(0)
  })

  it('AI özetinde doğrulanmış olmayan sonuçlar için doğrulama iddiası yapmaz', () => {
    const createProposal = (OfficeRouteModule as typeof OfficeRouteModule & {
      createOfficeProposal?: (query: string) => { summary: string }
    }).createOfficeProposal

    expect(typeof createProposal).toBe('function')
    expect(createProposal?.('İzmir’de arsa ofisi arıyorum').summary).not.toMatch(/doğrulanmış/i)
  })
})
