import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LISTING_FIXTURES } from '../../listings/data/listing-adapter'
import type {
  AdvisorCriteria,
  AdvisorCriterionRemoval,
  AdvisorMatch,
  AdvisorProposal,
} from '../domain/advisor-types'
import { AdvisorComposer } from './AdvisorComposer'
import { AdvisorDecisionRail } from './AdvisorDecisionRail'
import { AdvisorResults } from './AdvisorResults'
import { AdvisorSearchProfile } from './AdvisorSearchProfile'
import { AdvisorWelcome } from './AdvisorWelcome'

const proposalFixture: AdvisorProposal = {
  query: 'Urla’da 5 milyon TL altında imarlı arsa',
  criteria: {
    intent: 'buy',
    city: 'izmir',
    district: 'urla',
    propertyTypes: ['land'],
    budget: { min: 3_000_000, max: 5_000_000 },
    area: { min: 400, max: 800 },
    rooms: '3+1',
    mustHave: ['zoning'],
    preferences: ['sea'],
  },
  summary: 'Urla içinde kriterlerinize uyan ilanları hazırladım.',
  interpretationConfidence: 92,
}

const createMatch = (listingIndex: number): AdvisorMatch => ({
  listing: LISTING_FIXTURES[listingIndex],
  score: 92 - listingIndex,
  reasons: ['Konut imarı tercihinizle eşleşiyor.'],
  criteria: [
    {
      key: 'zoning',
      label: 'Konut imarlı',
      kind: 'required',
      matched: true,
      detail: 'İlan bilgisinde mevcut.',
    },
  ],
  evidence: [],
  missingData: [],
})

const matches = [createMatch(0), createMatch(1)]

const createEmptyProposal = (
  criteria: Partial<AdvisorCriteria>,
): AdvisorProposal => ({
  ...proposalFixture,
  criteria: {
    intent: 'buy',
    propertyTypes: [],
    budget: {},
    area: {},
    mustHave: [],
    preferences: [],
    ...criteria,
  },
})

const removableCriterionCases: Array<{
  name: string
  criteria: Partial<AdvisorCriteria>
  actionName: string
  removal: AdvisorCriterionRemoval
}> = [
  {
    name: 'zorunlu özellik',
    criteria: { mustHave: ['zoning'] },
    actionName: 'Kriteri kaldır: Zorunlu özellik — Konut imarlı',
    removal: { key: 'mustHave', feature: 'zoning' },
  },
  {
    name: 'ilçe',
    criteria: { district: 'urla' },
    actionName: 'Kriteri kaldır: İlçe — Urla',
    removal: { key: 'district' },
  },
  {
    name: 'şehir',
    criteria: { city: 'izmir' },
    actionName: 'Kriteri kaldır: Şehir — İzmir',
    removal: { key: 'city' },
  },
  {
    name: 'emlak türü',
    criteria: { propertyTypes: ['land'] },
    actionName: 'Kriteri kaldır: Emlak türü — Arsa',
    removal: { key: 'propertyTypes' },
  },
  {
    name: 'en yüksek bütçe',
    criteria: { budget: { max: 5_000_000 } },
    actionName: 'Kriteri kaldır: En yüksek bütçe — 5.000.000 TL',
    removal: { key: 'budgetMax' },
  },
  {
    name: 'en düşük bütçe',
    criteria: { budget: { min: 3_000_000 } },
    actionName: 'Kriteri kaldır: En düşük bütçe — 3.000.000 TL',
    removal: { key: 'budgetMin' },
  },
  {
    name: 'en düşük alan',
    criteria: { area: { min: 400 } },
    actionName: 'Kriteri kaldır: En düşük alan — 400 m²',
    removal: { key: 'areaMin' },
  },
  {
    name: 'en yüksek alan',
    criteria: { area: { max: 800 } },
    actionName: 'Kriteri kaldır: En yüksek alan — 800 m²',
    removal: { key: 'areaMax' },
  },
  {
    name: 'oda sayısı',
    criteria: { rooms: '3+1' },
    actionName: 'Kriteri kaldır: Oda sayısı — 3+1',
    removal: { key: 'rooms' },
  },
  {
    name: 'tercih',
    criteria: { preferences: ['sea'] },
    actionName: 'Kriteri kaldır: Tercih — Denize yakın',
    removal: { key: 'preferences', feature: 'sea' },
  },
]

describe('advisor panels', () => {
  it('offers one query surface and three native flat examples on first use', () => {
    const onSubmit = vi.fn()
    const { container } = render(
      <AdvisorWelcome
        query=""
        onQueryChange={() => undefined}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getAllByRole('search')).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(container.querySelectorAll('[data-advisor-example]')).toHaveLength(3)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Urla’da 5 milyon TL altında imarlı arsa',
      }),
    )
    expect(onSubmit).toHaveBeenCalledWith(
      'Urla’da 5 milyon TL altında imarlı arsa',
    )
  })

  it('keeps the composer editable and exposes a flat cancel action while analyzing', () => {
    const onQueryChange = vi.fn()
    const onCancel = vi.fn()

    render(
      <AdvisorComposer
        query="Urla arsa"
        status="analyzing"
        onQueryChange={onQueryChange}
        onSubmit={() => undefined}
        onCancel={onCancel}
      />,
    )

    const search = screen.getByRole('search')
    const input = screen.getByRole('searchbox') as HTMLInputElement
    expect(search.getAttribute('aria-busy')).toBe('true')
    expect(input.disabled).toBe(false)
    fireEvent.change(input, { target: { value: 'Urla tarla' } })
    expect(onQueryChange).toHaveBeenCalledWith('Urla tarla')
    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('delegates composer announcements instead of mounting a second live region', () => {
    const { container } = render(
      <AdvisorComposer
        query="Urla arsa"
        status="analyzing"
        onQueryChange={() => undefined}
        onSubmit={() => undefined}
      />,
    )

    expect(
      container.querySelectorAll('[aria-live="polite"]'),
    ).toHaveLength(0)
  })

  it('does not submit Enter while an IME composition is active', () => {
    const onSubmit = vi.fn()
    render(
      <AdvisorComposer
        query="Urla"
        status="idle"
        onQueryChange={() => undefined}
        onSubmit={onSubmit}
      />,
    )

    const accepted = fireEvent.keyDown(screen.getByRole('searchbox'), {
      key: 'Enter',
      isComposing: true,
    })

    expect(accepted).toBe(false)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders every interpreted criterion as an editable flat row', () => {
    const onEditCriteria = vi.fn()
    const onRemoveCriterion = vi.fn()
    render(
      <AdvisorSearchProfile
        proposal={proposalFixture}
        onEditCriteria={onEditCriteria}
        onRemoveCriterion={onRemoveCriterion}
      />,
    )

    expect(screen.getByText('Satılık')).toBeTruthy()
    expect(screen.getByText('İzmir')).toBeTruthy()
    expect(screen.getByText('Urla')).toBeTruthy()
    expect(screen.getByText('Arsa')).toBeTruthy()
    expect(screen.getByText('3.000.000 TL')).toBeTruthy()
    expect(screen.getByText('5.000.000 TL')).toBeTruthy()
    expect(screen.getByText('400 m²')).toBeTruthy()
    expect(screen.getByText('800 m²')).toBeTruthy()
    expect(screen.getByText('3+1')).toBeTruthy()
    expect(screen.getByText('Konut imarlı')).toBeTruthy()
    expect(screen.getByText('Denize yakın')).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Kriteri düzenle: İlçe — Urla',
      }),
    )
    expect(onEditCriteria).toHaveBeenCalledOnce()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Kriteri kaldır: İlçe — Urla',
      }),
    )
    expect(onRemoveCriterion).toHaveBeenCalledWith({ key: 'district' })
  })

  it('shows a geometry-matched visual-only skeleton while analyzing', () => {
    const { container } = render(
      <AdvisorResults
        status="analyzing"
        proposal={proposalFixture}
        matches={[]}
        favoriteIds={[]}
        compareIds={[]}
        error={undefined}
        onRetry={() => undefined}
        onEditCriteria={() => undefined}
        onRemoveCriterion={() => undefined}
        onOpenListing={() => undefined}
        onToggleFavorite={() => undefined}
        onToggleCompare={() => undefined}
        onExplainListing={() => undefined}
        onShowSimilar={() => undefined}
      />,
    )

    expect(screen.queryByRole('status')).toBeNull()
    expect(
      container
        .querySelector('[data-advisor-results-state="analyzing"]')
        ?.getAttribute('aria-hidden'),
    ).toBe('true')
    expect(container.querySelectorAll('[data-advisor-skeleton]')).toHaveLength(3)
    expect(
      container.querySelector('[data-advisor-skeleton][data-featured="true"]'),
    ).toBeTruthy()

    const expectedSections = [
      'media',
      'identity',
      'metrics',
      'match',
      'highlights',
      'actions',
    ]
    container
      .querySelectorAll<HTMLElement>('[data-advisor-skeleton]')
      .forEach((skeleton) => {
        expect(
          Array.from(
            skeleton.querySelectorAll<HTMLElement>('[data-skeleton-section]'),
          ).map((section) => section.dataset.skeletonSection),
        ).toEqual(expectedSections)
      })
  })

  it('keeps error recovery inline with retry and criteria editing', () => {
    const onRetry = vi.fn()
    const onEditCriteria = vi.fn()
    render(
      <AdvisorResults
        status="error"
        proposal={proposalFixture}
        matches={[]}
        favoriteIds={[]}
        compareIds={[]}
        error="İlanlar alınamadı."
        onRetry={onRetry}
        onEditCriteria={onEditCriteria}
        onRemoveCriterion={() => undefined}
        onOpenListing={() => undefined}
        onToggleFavorite={() => undefined}
        onToggleCompare={() => undefined}
        onExplainListing={() => undefined}
        onShowSimilar={() => undefined}
      />,
    )

    expect(screen.getByRole('alert').textContent).toContain('İlanlar alınamadı.')
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }))
    fireEvent.click(screen.getByRole('button', { name: 'Kriterleri düzenle' }))
    expect(onRetry).toHaveBeenCalledOnce()
    expect(onEditCriteria).toHaveBeenCalledOnce()
  })

  it.each(removableCriterionCases)(
    'offers the typed $name removal when no listings match',
    ({ criteria, actionName, removal }) => {
      const onRemoveCriterion = vi.fn()
      render(
        <AdvisorResults
          status="empty"
          proposal={createEmptyProposal(criteria)}
          matches={[]}
          favoriteIds={[]}
          compareIds={[]}
          error={undefined}
          onRetry={() => undefined}
          onEditCriteria={() => undefined}
          onRemoveCriterion={onRemoveCriterion}
          onOpenListing={() => undefined}
          onToggleFavorite={() => undefined}
          onToggleCompare={() => undefined}
          onExplainListing={() => undefined}
          onShowSimilar={() => undefined}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: actionName }))
      expect(onRemoveCriterion).toHaveBeenCalledWith(removal)
    },
  )

  it('renders one featured listing and the remaining alternatives', () => {
    const onOpenListing = vi.fn()
    render(
      <AdvisorResults
        status="results"
        proposal={proposalFixture}
        matches={matches}
        favoriteIds={[]}
        compareIds={[]}
        error={undefined}
        onRetry={() => undefined}
        onEditCriteria={() => undefined}
        onRemoveCriterion={() => undefined}
        onOpenListing={onOpenListing}
        onToggleFavorite={() => undefined}
        onToggleCompare={() => undefined}
        onExplainListing={() => undefined}
        onShowSimilar={() => undefined}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Öne çıkan ilan' })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Güçlü alternatifler' }),
    ).toBeTruthy()
    expect(screen.getAllByRole('article')).toHaveLength(2)

    fireEvent.click(
      screen.getByRole('button', { name: matches[0].listing.title }),
    )
    expect(onOpenListing).toHaveBeenCalledWith(matches[0].listing.id)
  })

  it('shows compare progress and enables the single comparison action at two ids', () => {
    const onOpenCompare = vi.fn()
    render(
      <AdvisorDecisionRail
        compareIds={['listing-1-1', 'listing-1-2']}
        onOpenCompare={onOpenCompare}
        onSaveSearch={() => undefined}
        onCreateAlert={() => undefined}
        onOpenTrust={() => undefined}
        onOpenHistory={() => undefined}
        onOpenAdvisorConsent={() => undefined}
      />,
    )

    expect(screen.getByText('2/3 ilan seçildi')).toBeTruthy()
    const compareButton = screen.getByRole('button', {
      name: 'Karşılaştır',
    }) as HTMLButtonElement
    expect(compareButton.disabled).toBe(false)
    fireEvent.click(compareButton)
    expect(onOpenCompare).toHaveBeenCalledOnce()
  })

  it('disables comparison below two ids and wires flat decision actions', () => {
    const onSaveSearch = vi.fn()
    const onCreateAlert = vi.fn()
    const onOpenTrust = vi.fn()
    const onOpenHistory = vi.fn()
    const onOpenAdvisorConsent = vi.fn()

    render(
      <AdvisorDecisionRail
        compareIds={['listing-1-1']}
        onOpenCompare={() => undefined}
        onSaveSearch={onSaveSearch}
        onCreateAlert={onCreateAlert}
        onOpenTrust={onOpenTrust}
        onOpenHistory={onOpenHistory}
        onOpenAdvisorConsent={onOpenAdvisorConsent}
      />,
    )

    expect(
      (
        screen.getByRole('button', {
          name: 'Karşılaştır',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Aramayı kaydet' }))
    fireEvent.click(screen.getByRole('button', { name: 'Bildirim oluştur' }))
    fireEvent.click(screen.getByRole('button', { name: 'Güven ayrıntıları' }))
    fireEvent.click(screen.getByRole('button', { name: 'Karar geçmişi' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'İnsan danışmanla paylaş' }),
    )

    expect(onSaveSearch).toHaveBeenCalledOnce()
    expect(onCreateAlert).toHaveBeenCalledOnce()
    expect(onOpenTrust).toHaveBeenCalledOnce()
    expect(onOpenHistory).toHaveBeenCalledOnce()
    expect(onOpenAdvisorConsent).toHaveBeenCalledOnce()
  })
})
