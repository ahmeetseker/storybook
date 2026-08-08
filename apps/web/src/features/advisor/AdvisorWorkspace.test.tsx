import { StrictMode } from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createFixtureAdvisorSearchAdapter,
  type AdvisorSearchAdapter,
} from './data/advisor-search-adapter'
import { AdvisorWorkspace } from './AdvisorWorkspace'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('AdvisorWorkspace', () => {
  it('starts with one focused advisor composer and no premature decision panels', () => {
    const { container } = render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Size uygun ilanı birlikte netleştirelim.',
      }),
    ).toBeTruthy()
    expect(screen.getAllByRole('search')).toHaveLength(1)
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(
      container.querySelectorAll('[aria-live="polite"]'),
    ).toHaveLength(1)
    expect(screen.queryByText('Karar günlüğü')).toBeNull()
    expect(screen.queryByText('Bir arama başlatın')).toBeNull()
  })

  it('does not submit an empty or whitespace-only query', () => {
    const search = vi.fn<AdvisorSearchAdapter['search']>()
    render(<AdvisorWorkspace searchAdapter={{ search }} />)

    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(screen.getByRole('search'))

    expect(search).not.toHaveBeenCalled()
  })

  it('moves through one announced analyzing state to explainable results', async () => {
    vi.useFakeTimers()
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 20 })}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Urla’da 5 milyon TL altında imarlı arsa',
      }),
    )

    expect(screen.getAllByRole('search')).toHaveLength(1)
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status').textContent).toContain(
      'İlanlar analiz ediliyor',
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20)
    })

    expect(screen.getByText(/ilan eşleşti/)).toBeTruthy()
    expect(screen.getAllByRole('search')).toHaveLength(1)
    expect(screen.getByText('Arama profili')).toBeTruthy()
    expect(
      screen.getAllByText(/Konut imarı tercihinizle eşleşiyor/).length,
    ).toBeGreaterThan(0)
  })

  it('keeps visible and DOM order aligned in the results state', async () => {
    const { container } = render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    const ordered = [
      ...container.querySelectorAll('[data-flow-section]'),
    ].map((node) => node.getAttribute('data-flow-section'))

    expect(ordered).toEqual([
      'query',
      'profile',
      'featured',
      'alternatives',
      'actions',
    ])
    expect(
      [
        ...container.querySelectorAll<HTMLElement>(
          '[data-flow-section]',
        ),
      ].map((node) => node.tagName),
    ).toEqual(['HEADER', 'SECTION', 'SECTION', 'SECTION', 'ASIDE'])
  })

  it('keeps container ownership outside the padded page frame', () => {
    const { container } = render(<AdvisorWorkspace />)
    const page = container.querySelector('main#main-content')
    const frame = page?.querySelector(':scope > [data-advisor-page-frame]')

    expect(frame).toBeTruthy()
    expect(frame?.querySelector('[role="status"]')).toBeTruthy()
  })

  it('coordinates the wide sticky rail from the measured profile height', async () => {
    const observers = new Map<
      Element,
      {
        callback: ResizeObserverCallback
        observer: ResizeObserver
        disconnect: ReturnType<typeof vi.fn>
      }
    >()
    class ResizeObserverMock {
      readonly disconnect = vi.fn()
      readonly unobserve = vi.fn()
      readonly callback: ResizeObserverCallback

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }

      observe = vi.fn((target: Element) => {
        observers.set(target, {
          callback: this.callback,
          observer: this as unknown as ResizeObserver,
          disconnect: this.disconnect,
        })
      })
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)

    const { container, unmount } = render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    const workspace = container.querySelector<HTMLElement>(
      '[data-advisor-workspace]',
    )
    const profileRail = container.querySelector<HTMLElement>(
      '[data-advisor-profile-rail]',
    )
    expect(profileRail).toBeTruthy()
    const profileObserver = observers.get(profileRail!)
    expect(profileObserver).toBeTruthy()

    act(() => {
      profileObserver?.callback(
        [
          {
            target: profileRail,
            borderBoxSize: [{ blockSize: 312 }],
          } as unknown as ResizeObserverEntry,
        ],
        profileObserver.observer,
      )
    })

    const measuredBlockSize = workspace?.style.getPropertyValue(
      '--lg-advisor-profile-block-size',
    )
    expect(Number.parseFloat(measuredBlockSize ?? '')).toBe(312)
    expect(measuredBlockSize).toMatch(/px$/)

    unmount()
    expect(profileObserver?.disconnect).toHaveBeenCalledOnce()
  })

  it('supports IME composition without route persistence or search submission', () => {
    const search = vi.fn<AdvisorSearchAdapter['search']>()
    const onRouteStateChange = vi.fn()
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        onRouteStateChange={onRouteStateChange}
      />,
    )

    const input = screen.getByRole('searchbox', {
      name: 'Doğal dilde arama',
    })
    fireEvent.compositionStart(input)
    expect(
      fireEvent.keyDown(input, { key: 'Enter', isComposing: true }),
    ).toBe(false)
    expect(search).not.toHaveBeenCalled()
    expect(onRouteStateChange).not.toHaveBeenCalled()
  })

  it('keeps the query and retries after an error', async () => {
    const working = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const search = vi
      .fn<AdvisorSearchAdapter['search']>()
      .mockRejectedValueOnce(new Error('İlanlar şu anda hazırlanamadı.'))
      .mockImplementation((proposal, options) =>
        working.search(proposal, options),
      )
    render(<AdvisorWorkspace searchAdapter={{ search }} />)

    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, {
      target: { value: 'İzmir’de satılık emlak' },
    })
    fireEvent.submit(screen.getByRole('search'))

    expect(
      await screen.findByText('İlanlar şu anda hazırlanamadı.'),
    ).toBeTruthy()
    expect(
      (screen.getByRole('searchbox', {
        name: 'Doğal dilde arama',
      }) as HTMLInputElement).value,
    ).toBe('İzmir’de satılık emlak')

    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }))
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(await screen.findByText(/ilan eşleşti/)).toBeTruthy()
  })

  it('keeps the composer editable and cancels analysis without clearing it', async () => {
    const slow = createFixtureAdvisorSearchAdapter({ delayMs: 2_000 })
    let activeSignal: AbortSignal | undefined
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => {
        activeSignal = options?.signal
        return slow.search(proposal, options)
      },
    )
    render(<AdvisorWorkspace searchAdapter={{ search }} />)

    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, { target: { value: 'Urla’da arsa' } })
    fireEvent.submit(screen.getByRole('search'))

    expect((input as HTMLInputElement).disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))

    expect(
      (screen.getByRole('searchbox', {
        name: 'Doğal dilde arama',
      }) as HTMLInputElement).value,
    ).toBe('Urla’da arsa')
    expect(activeSignal?.aborted).toBe(true)
    expect(screen.getByRole('status').textContent).toContain(
      'Analiz durduruldu.',
    )
  })

  it('aborts an older analysis before submitting an edited query', async () => {
    const slow = createFixtureAdvisorSearchAdapter({ delayMs: 2_000 })
    const signals: AbortSignal[] = []
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => {
        if (options?.signal) signals.push(options.signal)
        return slow.search(proposal, options)
      },
    )
    render(<AdvisorWorkspace searchAdapter={{ search }} />)

    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, { target: { value: 'Urla’da arsa' } })
    fireEvent.submit(screen.getByRole('search'))
    fireEvent.change(input, { target: { value: 'Çeşme’de arsa' } })
    fireEvent.submit(screen.getByRole('search'))

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(signals[0]?.aborted).toBe(true)
    expect(signals[1]?.aborted).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))
  })

  it('asks iterative clarification questions without searching prematurely', async () => {
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      async (proposal) => ({
        proposal,
        matches: [],
        generatedAt: '2026-07-26T12:00:00.000Z',
      }),
    )
    const onRouteStateChange = vi.fn()
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Bütçeme uygun bir yer arıyorum"
        onRouteStateChange={onRouteStateChange}
      />,
    )

    expect(
      await screen.findByText('Hangi şehir veya bölgede arama yapalım?'),
    ).toBeTruthy()
    expect(search).not.toHaveBeenCalled()
    expect(screen.getAllByRole('search')).toHaveLength(1)

    const input = screen.getByRole('searchbox', { name: 'Doğal dilde arama' })
    fireEvent.change(input, { target: { value: 'İzmir' } })
    fireEvent.submit(screen.getByRole('search'))

    expect(
      await screen.findByText('Hangi tür taşınmazla ilgileniyorsunuz?'),
    ).toBeTruthy()
    expect(search).not.toHaveBeenCalled()
    expect(screen.queryByText('Hangi şehir veya bölgede arama yapalım?')).toBeNull()
    expect(onRouteStateChange).toHaveBeenLastCalledWith({
      query: 'Bütçeme uygun bir yer arıyorum İzmir',
      compareIds: [],
    })

    fireEvent.change(input, { target: { value: 'Arsa' } })
    fireEvent.submit(screen.getByRole('search'))

    await waitFor(() => expect(search).toHaveBeenCalledOnce())
    expect(search.mock.calls[0]?.[0].query).toBe(
      'Bütçeme uygun bir yer arıyorum İzmir Arsa',
    )
    expect(onRouteStateChange).toHaveBeenLastCalledWith({
      query: 'Bütçeme uygun bir yer arıyorum İzmir Arsa',
      compareIds: [],
    })
  })

  it('cancels a resolved clarification without reviving its stale question', async () => {
    const slow = createFixtureAdvisorSearchAdapter({ delayMs: 2_000 })
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => slow.search(proposal, options),
    )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Bütçeme uygun bir yer arıyorum"
      />,
    )

    expect(
      await screen.findByText('Hangi şehir veya bölgede arama yapalım?'),
    ).toBeTruthy()
    let input = screen.getByRole('searchbox', {
      name: 'Doğal dilde arama',
    })
    fireEvent.change(input, { target: { value: 'İzmir' } })
    fireEvent.submit(screen.getByRole('search'))

    expect(
      await screen.findByText('Hangi tür taşınmazla ilgileniyorsunuz?'),
    ).toBeTruthy()
    input = screen.getByRole('searchbox', {
      name: 'Doğal dilde arama',
    })
    fireEvent.change(input, { target: { value: 'Arsa' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(search).toHaveBeenCalledOnce())

    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))

    expect(screen.getByRole('status').textContent).toContain(
      'Analiz durduruldu.',
    )
    expect(
      screen.queryByText('Hangi tür taşınmazla ilgileniyorsunuz?'),
    ).toBeNull()
    input = screen.getByRole('searchbox', {
      name: 'Doğal dilde arama',
    })
    expect((input as HTMLInputElement).value).toBe(
      'Bütçeme uygun bir yer arıyorum İzmir Arsa',
    )

    fireEvent.change(input, { target: { value: 'Çeşme’de arsa' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))

    expect(search.mock.calls[1]?.[0].query).toBe('Çeşme’de arsa')
    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))
  })

  it('auto-runs a valid initial query once under StrictMode', async () => {
    const fixture = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => fixture.search(proposal, options),
    )

    render(
      <StrictMode>
        <AdvisorWorkspace
          searchAdapter={{ search }}
          initialQuery="Urla’da arsa"
        />
      </StrictMode>,
    )

    await waitFor(() => expect(search).toHaveBeenCalledOnce())
    expect(await screen.findByText(/ilan eşleşti/)).toBeTruthy()
  })

  it('explains an empty result through the single prioritized hard criterion', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({
          listings: [],
          delayMs: 0,
        })}
        initialQuery="Urla’da 1 milyon TL altında imarlı arsa"
      />,
    )

    expect(await screen.findByText(/eşleşme bulunamadı/i)).toBeTruthy()
    const emptyState = screen
      .getByRole('heading', {
        name: 'Bu ölçütlerle eşleşme bulunamadı',
      })
      .closest('section')
    expect(emptyState).toBeTruthy()
    expect(
      within(emptyState!).getByRole('button', {
        name: 'Kriteri kaldır: Zorunlu özellik — Konut imarlı',
      }),
    ).toBeTruthy()
    expect(
      within(emptyState!).queryByRole('button', {
        name: 'Kriteri kaldır: En yüksek bütçe — 1.000.000 TL',
      }),
    ).toBeNull()
  })

  it('removes the prioritized empty-state criterion and analyzes the edited proposal', async () => {
    vi.useFakeTimers()
    const fixture = createFixtureAdvisorSearchAdapter({
      listings: [],
      delayMs: 20,
    })
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => fixture.search(proposal, options),
    )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da 1 milyon TL altında imarlı arsa"
      />,
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20)
    })
    const emptyState = screen
      .getByRole('heading', {
        name: 'Bu ölçütlerle eşleşme bulunamadı',
      })
      .closest('section')
    expect(emptyState).toBeTruthy()

    fireEvent.click(
      within(emptyState!).getByRole('button', {
        name: 'Kriteri kaldır: Zorunlu özellik — Konut imarlı',
      }),
    )

    expect(screen.getByRole('status').textContent).toContain(
      'İlanlar analiz ediliyor',
    )
    expect(search).toHaveBeenCalledTimes(2)
    expect(search.mock.calls[1]?.[0].criteria.mustHave).toEqual([])
    expect(search.mock.calls[1]?.[0].criteria.budget.max).toBe(1_000_000)
    expect(search.mock.calls[1]?.[0].query).toBe(
      'Urla’da 1 milyon TL altında imarlı arsa',
    )
  })

  it('restores coherent prior results when replacement analysis is cancelled', async () => {
    const instant = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const slow = createFixtureAdvisorSearchAdapter({ delayMs: 2_000 })
    let replacementSignal: AbortSignal | undefined
    const search = vi
      .fn<AdvisorSearchAdapter['search']>()
      .mockImplementationOnce((proposal, options) =>
        instant.search(proposal, options),
      )
      .mockImplementation((proposal, options) => {
        replacementSignal = options?.signal
        return slow.search(proposal, options)
      })
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    const input = screen.getByRole('searchbox', {
      name: 'Doğal dilde arama',
    })
    fireEvent.change(input, { target: { value: 'Çeşme’de arsa' } })
    fireEvent.submit(screen.getByRole('search'))
    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))

    const profile = screen
      .getByRole('heading', { name: 'Arama profili' })
      .closest('section')
    expect(profile).toBeTruthy()
    expect(within(profile!).getByText('Urla')).toBeTruthy()
    expect(within(profile!).queryByText('Çeşme')).toBeNull()
    // Varyant kimliğine bağlanmaz: eşleştirici eşit puanlı varyantları m²
    // fiyatına göre sıralar, hangi portföyün başa geldiği demo verisinin
    // dağılımına bağlıdır. İddia, Urla arsasının listelendiğidir.
    expect(
      screen.getAllByText(/^Urla’da denize yakın, imarlı köşe parsel/).length,
    ).toBeGreaterThan(0)
    expect((input as HTMLInputElement).value).toBe('Çeşme’de arsa')
    expect(replacementSignal?.aborted).toBe(true)
    expect(screen.getByRole('status').textContent).toContain(
      'Analiz durduruldu.',
    )
  })

  it('restores the original error message when a retry is cancelled', async () => {
    const slow = createFixtureAdvisorSearchAdapter({ delayMs: 2_000 })
    const search = vi
      .fn<AdvisorSearchAdapter['search']>()
      .mockRejectedValueOnce(new Error('Özgün adapter hatası.'))
      .mockImplementation((proposal, options) =>
        slow.search(proposal, options),
      )
    render(<AdvisorWorkspace searchAdapter={{ search }} />)

    const input = screen.getByRole('searchbox', {
      name: 'Doğal dilde arama',
    })
    fireEvent.change(input, { target: { value: 'Urla’da arsa' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(await screen.findByText('Özgün adapter hatası.')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }))
    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))

    expect(screen.getByText('Özgün adapter hatası.')).toBeTruthy()
    expect(screen.queryByText('Beklenmeyen bir sorun oluştu.')).toBeNull()
    expect(screen.getByRole('status').textContent).toContain(
      'Analiz durduruldu.',
    )
  })

  it('shares comparison selection and opens the comparison route', async () => {
    const onRouteStateChange = vi.fn()
    const onOpenComparison = vi.fn()
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
        initialCompareIds={['listing-1-1']}
        onRouteStateChange={onRouteStateChange}
        onOpenComparison={onOpenComparison}
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getAllByRole('button', {
        name: 'Karşılaştırmaya ekle',
      })[0],
    )

    // Hangi VARYANTIN başa geldiği demo verisinin m² fiyatı dağılımına bağlı;
    // iddia, seçimin rotaya aynen taşındığıdır.
    const [routeState] = onRouteStateChange.mock.calls.at(-1) as [
      { query: string; compareIds: string[] },
    ]
    expect(routeState.query).toBe('Urla’da arsa')
    expect(routeState.compareIds[0]).toBe('listing-1-1')
    expect(routeState.compareIds).toHaveLength(2)
    expect(routeState.compareIds[1]).toMatch(/^listing-1-\d+$/)

    fireEvent.click(screen.getByRole('button', { name: 'Karşılaştır' }))
    expect(onOpenComparison).toHaveBeenCalledWith(routeState.compareIds)
  })

  it('submits a deterministic Turkish query for similar listings', async () => {
    const fixture = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => fixture.search(proposal, options),
    )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Benzer ilanları göster' })[0],
    )

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(search.mock.calls[1]?.[0].query).toBe(
      'İzmir Urla satılık arsa',
    )
  })

  it('announces local previews and the comparison limit in the shared status outlet', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
        initialCompareIds={[
          'listing-1-1',
          'listing-1-2',
          'listing-1-3',
        ]}
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(screen.getByRole('button', { name: 'Aramayı kaydet' }))
    expect(screen.getByRole('status').textContent).toContain(
      'Arama yalnız bu demo oturumu için kaydedildi.',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Bildirim oluştur' }))
    expect(screen.getByRole('status').textContent).toContain(
      'Alarm önizlemesi hazır. Bildirim gönderilmeyecek.',
    )

    fireEvent.click(
      screen.getAllByRole('button', {
        name: 'Karşılaştırmaya ekle',
      })[0],
    )
    expect(screen.getByRole('status').textContent).toContain(
      'En fazla 3 ilan karşılaştırabilirsiniz.',
    )
  })

  it('applies an immutable criteria draft through the shared adapter path', async () => {
    const fixture = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const proposals: Parameters<AdvisorSearchAdapter['search']>[0][] = []
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => {
        proposals.push(proposal)
        return fixture.search(proposal, options)
      },
    )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    const originalProposal = proposals[0]
    expect(originalProposal.criteria.budget.max).toBeUndefined()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Kriteri düzenle: Emlak türü — Arsa',
      }),
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Arama kriterlerini düzenle',
    })
    expect(
      within(dialog).getByRole('button', { name: 'Kapat' }),
    ).toBeTruthy()
    fireEvent.change(within(dialog).getByLabelText('Maksimum bütçe'), {
      target: { value: '3000000' },
    })
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Kriterleri uygula' }),
    )

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(proposals[1]).not.toBe(originalProposal)
    expect(proposals[1].criteria).not.toBe(originalProposal.criteria)
    expect(originalProposal.criteria.budget.max).toBeUndefined()
    expect(proposals[1].criteria.budget.max).toBe(3_000_000)
    expect(proposals[1].query).toBe('Urla’da arsa')
    expect(
      await screen.findByRole('heading', {
        name: 'Bu ölçütlerle eşleşme bulunamadı',
      }),
    ).toBeTruthy()
  })

  it('submits criteria once and focuses the persistent status after its opener leaves', async () => {
    const instant = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const slow = createFixtureAdvisorSearchAdapter({ delayMs: 2_000 })
    const search = vi
      .fn<AdvisorSearchAdapter['search']>()
      .mockImplementationOnce((proposal, options) =>
        instant.search(proposal, options),
      )
      .mockImplementation((proposal, options) =>
        slow.search(proposal, options),
      )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    const trigger = screen.getByRole('button', {
      name: 'Kriteri düzenle: Emlak türü — Arsa',
    })
    const status = screen.getByRole('status')
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', {
      name: 'Arama kriterlerini düzenle',
    })
    fireEvent.change(within(dialog).getByLabelText('Maksimum bütçe'), {
      target: { value: '3000000' },
    })
    const apply = within(dialog).getByRole('button', {
      name: 'Kriterleri uygula',
    })
    fireEvent.click(apply)
    fireEvent.click(apply)

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(trigger.isConnected).toBe(false)
    expect(status.textContent).toContain('İlanlar analiz ediliyor')
    await waitFor(() => expect(document.activeElement).toBe(status))
    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))
  })

  it('restores the prior coherent proposal and matches when a criteria analysis is cancelled', async () => {
    const instant = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const slow = createFixtureAdvisorSearchAdapter({ delayMs: 2_000 })
    const search = vi
      .fn<AdvisorSearchAdapter['search']>()
      .mockImplementationOnce((proposal, options) =>
        instant.search(proposal, options),
      )
      .mockImplementation((proposal, options) =>
        slow.search(proposal, options),
      )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Kriteri düzenle: Emlak türü — Arsa',
      }),
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Arama kriterlerini düzenle',
    })
    fireEvent.change(within(dialog).getByLabelText('Maksimum bütçe'), {
      target: { value: '3000000' },
    })
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Kriterleri uygula' }),
    )

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(search.mock.calls[1]?.[0].criteria.budget.max).toBe(3_000_000)
    fireEvent.click(screen.getByRole('button', { name: 'Analizi durdur' }))

    expect(
      screen.getAllByText(/^Urla’da denize yakın, imarlı köşe parsel/).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByRole('button', {
        name: 'Kriteri düzenle: En yüksek bütçe — 3.000.000 TL',
      }),
    ).toBeNull()
    expect(
      screen.getByRole('button', {
        name: 'Kriteri düzenle: Emlak türü — Arsa',
      }),
    ).toBeTruthy()
  })

  it('retries the revised criteria proposal directly after adapter failure', async () => {
    const fixture = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const search = vi
      .fn<AdvisorSearchAdapter['search']>()
      .mockImplementationOnce((proposal, options) =>
        fixture.search(proposal, options),
      )
      .mockRejectedValueOnce(new Error('Kriter analizi başarısız.'))
      .mockImplementation((proposal, options) =>
        fixture.search(proposal, options),
      )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Kriteri düzenle: Emlak türü — Arsa',
      }),
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Arama kriterlerini düzenle',
    })
    fireEvent.change(within(dialog).getByLabelText('Maksimum bütçe'), {
      target: { value: '3000000' },
    })
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Kriterleri uygula' }),
    )

    expect(await screen.findByText('Kriter analizi başarısız.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Yeniden dene' }))

    await waitFor(() => expect(search).toHaveBeenCalledTimes(3))
    expect(search.mock.calls[1]?.[0].criteria.budget.max).toBe(3_000_000)
    expect(search.mock.calls[2]?.[0]).toBe(search.mock.calls[1]?.[0])
    expect(search.mock.calls[2]?.[0].query).toBe('Urla’da arsa')
  })

  it('edits and removes a priority lifestyle feature without duplicating it', async () => {
    const fixture = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => fixture.search(proposal, options),
    )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da ulaşım şart arsa"
      />,
    )

    await screen.findByRole('heading', {
      name: 'Bu ölçütlerle eşleşme bulunamadı',
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Kriterleri düzenle' }),
    )
    let dialog = screen.getByRole('dialog', {
      name: 'Arama kriterlerini düzenle',
    })
    let requiredGroup = within(dialog).getByRole('group', {
      name: 'Zorunlu özellikler',
    })
    let preferenceGroup = within(dialog).getByRole('group', {
      name: 'Tercihler',
    })
    const requiredTransport = within(requiredGroup).getByRole('checkbox', {
      name: 'Ulaşıma yakınlık',
    })
    const preferredTransport = within(preferenceGroup).getByRole('checkbox', {
      name: 'Ulaşıma yakınlık',
    })
    expect((requiredTransport as HTMLInputElement).checked).toBe(true)
    expect((preferredTransport as HTMLInputElement).checked).toBe(false)

    fireEvent.click(preferredTransport)
    expect((requiredTransport as HTMLInputElement).checked).toBe(false)
    expect((preferredTransport as HTMLInputElement).checked).toBe(true)
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Kriterleri uygula' }),
    )

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(search.mock.calls[1]?.[0].criteria.mustHave).not.toContain(
      'transport',
    )
    expect(search.mock.calls[1]?.[0].criteria.preferences).toContain(
      'transport',
    )

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Kriteri düzenle: Tercih — Ulaşıma yakın',
      }),
    )
    dialog = screen.getByRole('dialog', {
      name: 'Arama kriterlerini düzenle',
    })
    requiredGroup = within(dialog).getByRole('group', {
      name: 'Zorunlu özellikler',
    })
    preferenceGroup = within(dialog).getByRole('group', {
      name: 'Tercihler',
    })
    expect(
      within(requiredGroup).getByRole('checkbox', {
        name: 'Ulaşıma yakınlık',
      }),
    ).toHaveProperty('checked', false)
    const movedPreference = within(preferenceGroup).getByRole('checkbox', {
      name: 'Ulaşıma yakınlık',
    })
    expect((movedPreference as HTMLInputElement).checked).toBe(true)
    fireEvent.click(movedPreference)
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Kriterleri uygula' }),
    )

    await waitFor(() => expect(search).toHaveBeenCalledTimes(3))
    expect(search.mock.calls[2]?.[0].criteria.mustHave).not.toContain(
      'transport',
    )
    expect(search.mock.calls[2]?.[0].criteria.preferences).not.toContain(
      'transport',
    )
  })

  it('blocks invalid numeric criteria with associated errors and keeps empty values undefined', async () => {
    const fixture = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) => fixture.search(proposal, options),
    )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Kriteri düzenle: Emlak türü — Arsa',
      }),
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Arama kriterlerini düzenle',
    })
    const budgetMin = within(dialog).getByLabelText('Minimum bütçe')
    const budgetMax = within(dialog).getByLabelText('Maksimum bütçe')
    const areaMin = within(dialog).getByLabelText('Minimum alan')
    const areaMax = within(dialog).getByLabelText('Maksimum alan')
    const apply = within(dialog).getByRole('button', {
      name: 'Kriterleri uygula',
    })
    const describedByText = (input: HTMLElement) => {
      const descriptionId = input.getAttribute('aria-describedby')
      return descriptionId
        ? document.getElementById(descriptionId)?.textContent
        : undefined
    }

    fireEvent.change(budgetMin, { target: { value: '-1' } })
    fireEvent.change(areaMax, { target: { value: '-1' } })
    expect(budgetMin.getAttribute('aria-invalid')).toBe('true')
    expect(describedByText(budgetMin)).toBe(
      'Değer sıfırdan küçük olamaz.',
    )
    expect(areaMax.getAttribute('aria-invalid')).toBe('true')
    expect(describedByText(areaMax)).toBe(
      'Değer sıfırdan küçük olamaz.',
    )
    expect((apply as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(apply)
    expect(search).toHaveBeenCalledOnce()

    fireEvent.change(budgetMin, { target: { value: '300' } })
    fireEvent.change(budgetMax, { target: { value: '200' } })
    fireEvent.change(areaMin, { target: { value: '300' } })
    fireEvent.change(areaMax, { target: { value: '200' } })
    expect(describedByText(budgetMin)).toBe(
      'Minimum bütçe maksimum bütçeyi aşamaz.',
    )
    expect(describedByText(budgetMax)).toBe(
      'Minimum bütçe maksimum bütçeyi aşamaz.',
    )
    expect(describedByText(areaMin)).toBe(
      'Minimum alan maksimum alanı aşamaz.',
    )
    expect(describedByText(areaMax)).toBe(
      'Minimum alan maksimum alanı aşamaz.',
    )
    expect((apply as HTMLButtonElement).disabled).toBe(true)
    expect(search).toHaveBeenCalledOnce()

    for (const input of [budgetMin, budgetMax, areaMin, areaMax]) {
      fireEvent.change(input, { target: { value: '' } })
    }
    expect((apply as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(apply)

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(search.mock.calls[1]?.[0].criteria.budget).toEqual({})
    expect(search.mock.calls[1]?.[0].criteria.area).toEqual({})
  })

  it('clears a district that is incompatible with the newly selected city', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Kriteri düzenle: Emlak türü — Arsa',
      }),
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Arama kriterlerini düzenle',
    })
    const city = within(dialog).getByLabelText('Şehir')
    const district = within(dialog).getByLabelText('İlçe')
    expect(city.textContent).toContain('İzmir')
    expect(district.textContent).toContain('Urla')

    fireEvent.click(city)
    fireEvent.click(screen.getByRole('option', { name: 'İstanbul' }))

    expect(district.textContent).toContain('Tüm ilçeler')
    fireEvent.click(district)
    expect(
      screen.queryByRole('option', { name: 'Urla' }),
    ).toBeNull()
    expect(
      screen.getByRole('option', { name: 'Kadıköy' }),
    ).toBeTruthy()
  })

  it('blocks an incompatible adapter-returned district until it is corrected', async () => {
    const fixture = createFixtureAdvisorSearchAdapter({ delayMs: 0 })
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      async (proposal, options) => {
        const result = await fixture.search(proposal, options)
        return {
          ...result,
          proposal: {
            ...result.proposal,
            criteria: {
              ...result.proposal.criteria,
              city: 'izmir',
              district: 'kadıköy',
            },
          },
        }
      },
    )
    render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Kriteri düzenle: Emlak türü — Arsa',
      }),
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Arama kriterlerini düzenle',
    })
    const district = within(dialog).getByLabelText('İlçe')
    const apply = within(dialog).getByRole('button', {
      name: 'Kriterleri uygula',
    })
    const errorId = district.getAttribute('aria-describedby')

    expect(district.getAttribute('aria-invalid')).toBe('true')
    expect(errorId).toBeTruthy()
    expect(document.getElementById(errorId!)?.textContent).toBe(
      'Seçilen ilçe şehirle uyumlu değil.',
    )
    expect((apply as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(apply)
    expect(search).toHaveBeenCalledOnce()

    fireEvent.click(district)
    fireEvent.click(screen.getByRole('option', { name: 'Urla' }))
    expect(district.getAttribute('aria-invalid')).toBeNull()
    expect((apply as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(apply)

    await waitFor(() => expect(search).toHaveBeenCalledTimes(2))
    expect(search.mock.calls[1]?.[0].criteria).toMatchObject({
      city: 'izmir',
      district: 'urla',
    })
  })

  it('distinguishes verified, review, and missing evidence as demo data', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        // Bütçe sınırı havuzu daraltır: doğrulanmış aday sayısı altı slotu
        // dolduramayınca inceleme bekleyen ilan da listeye girer. Eşleştirici
        // doğrulanmışı öne alır (bkz. advisor-matcher sıralaması), bu yüzden
        // üç kanıt durumunu birden görmek ancak daralan bir havuzda mümkün.
        initialQuery="Urla’da 5 milyon altında ulaşıma yakın arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getByRole('button', { name: 'Güven ayrıntıları' }),
    )

    const dialog = screen.getByRole('dialog', {
      name: 'Güven ve kaynaklar',
    })
    expect(dialog.textContent).toContain('İlan doğrulama kaydı')
    expect(dialog.textContent).toContain('Doğrulandı')
    expect(dialog.textContent).toContain('İnceleme gerekiyor')
    expect(dialog.textContent).toContain('Bilgi sağlanmadı')
    expect(dialog.textContent).toContain(
      'Ulaşım bilgisi ilan detaylarında belirtilmemiş.',
    )
    expect(dialog.textContent).toContain('Temsili demo verisi')
    // Varyant numarasına bağlanmaz: hangi portföyün listeye girdiği demo
    // verisinin dağılımına bağlıdır, iddia kanıt DURUMLARININ ayrıştığıdır.
    const evidenceItems = within(dialog)
      .getAllByText(/^Urla’da denize yakın, imarlı köşe parsel/)
      .map((title) => title.closest('li'))
    const verifiedEvidence = evidenceItems.find((item) =>
      item?.textContent?.includes('Doğrulandı'),
    )
    const reviewEvidence = evidenceItems.find((item) =>
      item?.textContent?.includes('İnceleme gerekiyor'),
    )
    const missingEvidence = within(dialog)
      .getAllByText('Bilgi sağlanmadı')[0]
      .closest('li')
    expect(verifiedEvidence).toBeTruthy()
    expect(reviewEvidence).toBeTruthy()
    expect(missingEvidence).toBeTruthy()
    expect(verifiedEvidence?.textContent).toContain('Doğrulandı')
    expect(reviewEvidence?.textContent).toContain('İnceleme gerekiyor')
    expect(missingEvidence?.textContent).toContain(
      'Urla’da denize yakın, imarlı köşe parsel',
    )
    expect(missingEvidence?.textContent).toContain(
      'Ulaşım bilgisi ilan detaylarında belirtilmemiş.',
    )
    expect(
      within(dialog).getByRole('button', { name: 'Kapat' }),
    ).toBeTruthy()
  })

  it('does not invent a missing evidence state when matcher data is complete', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getByRole('button', { name: 'Güven ayrıntıları' }),
    )

    const dialog = screen.getByRole('dialog', {
      name: 'Güven ve kaynaklar',
    })
    expect(dialog.textContent).toContain('Kayıtlı eksik alan yok.')
    expect(dialog.textContent).not.toContain('Bilgi sağlanmadı')
  })

  it('records explicit advisor rejection and returns focus to its trigger', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    const trigger = screen.getByRole('button', {
      name: 'İnsan danışmanla paylaş',
    })
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', {
      name: 'İnsan danışmanla paylaşım',
    })
    expect(dialog.textContent).toContain('Temsili demo verisi')
    expect(
      within(dialog).getByRole('button', { name: 'Kapat' }),
    ).toBeTruthy()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Vazgeç' }))
    expect(screen.getByRole('status').textContent).toContain(
      'Paylaşım yapılmadı.',
    )
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('keeps one live dialog and records one rejection during a rapid overlay transition', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    const historyTrigger = screen.getByRole('button', {
      name: 'Karar geçmişi',
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'İnsan danışmanla paylaş' }),
    )
    const consentDialog = screen.getByRole('dialog', {
      name: 'İnsan danışmanla paylaşım',
    })
    const reject = within(consentDialog).getByRole('button', {
      name: 'Vazgeç',
    })
    fireEvent.click(reject)
    fireEvent.click(reject)
    fireEvent.click(historyTrigger)

    expect(screen.getAllByRole('dialog').length).toBeLessThanOrEqual(1)
    const historyDialog = screen.getByRole('dialog', {
      name: 'Karar ve izin geçmişi',
    })
    expect(
      within(historyDialog)
        .getAllByRole('listitem')
        .filter((item) =>
          item.textContent?.includes('Paylaşım yapılmadı.'),
        ),
    ).toHaveLength(1)
  })

  it('records explicit advisor approval in truthful history', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    const compareControls = screen.getAllByRole('button', {
      name: 'Karşılaştırmaya ekle',
    })
    fireEvent.click(compareControls[0])
    fireEvent.click(compareControls[1])
    fireEvent.click(
      screen.getByRole('button', { name: 'İnsan danışmanla paylaş' }),
    )
    let dialog = screen.getByRole('dialog', {
      name: 'İnsan danışmanla paylaşım',
    })
    expect(dialog.textContent).toContain('Urla’da arsa')
    expect(dialog.textContent).toContain('İzmir')
    expect(dialog.textContent).toContain('Urla')
    expect(dialog.textContent).toContain('Arsa')
    // İki ilan da aynı Urla portföyünden; varyant numarası sıralamaya bağlı.
    expect(
      dialog.textContent?.match(/Urla’da denize yakın, imarlı köşe parsel/g)?.length,
    ).toBeGreaterThanOrEqual(2)
    const approve = within(dialog).getByRole('button', { name: 'Onayla' })
    fireEvent.click(approve)
    fireEvent.click(approve)
    expect(screen.getByRole('status').textContent).toContain(
      'Onay kaydedildi. Bu prototip dışarıya veri göndermedi.',
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Karar geçmişi' }),
    )
    dialog = screen.getByRole('dialog', {
      name: 'Karar ve izin geçmişi',
    })
    expect(dialog.textContent).toContain(
      'Onay kaydedildi. Bu prototip dışarıya veri göndermedi.',
    )
    expect(
      within(dialog)
        .getAllByRole('listitem')
        .filter((item) =>
          item.textContent?.includes(
            'Onay kaydedildi. Bu prototip dışarıya veri göndermedi.',
          ),
        ),
    ).toHaveLength(1)
    expect(
      within(dialog).getByRole('button', { name: 'Kapat' }),
    ).toBeTruthy()
  })

  it('does not hide a persisted comparison id outside current matches', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
        initialCompareIds={['listing-2-1']}
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getByRole('button', { name: 'İnsan danışmanla paylaş' }),
    )
    const dialog = screen.getByRole('dialog', {
      name: 'İnsan danışmanla paylaşım',
    })
    expect(dialog.textContent).toContain(
      'İlan kimliği listing-2-1 güncel sonuçlarda bulunamadı.',
    )
    expect(dialog.textContent).not.toContain('Seçili ilan yok')
  })

  it('keeps favorite and three distinct comparison selections visible', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Favoriye ekle' })[0],
    )
    expect(
      screen
        .getAllByRole('button', { name: 'Favoriden çıkar' })[0]
        .getAttribute('aria-pressed'),
    ).toBe('true')

    const compareControls = screen.getAllByRole('button', {
      name: 'Karşılaştırmaya ekle',
    })
    fireEvent.click(compareControls[0])
    fireEvent.click(compareControls[1])
    fireEvent.click(compareControls[2])
    expect(screen.getByText('3/3 ilan seçildi')).toBeTruthy()

    fireEvent.click(
      screen.getAllByRole('button', {
        name: 'Karşılaştırmaya ekle',
      })[0],
    )
    expect(screen.getByRole('status').textContent).toContain(
      'En fazla 3 ilan karşılaştırabilirsiniz.',
    )
    fireEvent.click(
      screen.getAllByRole('button', {
        name: 'Karşılaştırmadan çıkar',
      })[0],
    )
    expect(screen.getByText('2/3 ilan seçildi')).toBeTruthy()
  })

  it('uses the same final image fallback in the card and listing detail', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    const trigger = screen.getAllByRole('button', {
      name: 'İlanı incele',
    })[0]
    const article = trigger.closest('article')
    expect(article).toBeTruthy()
    const cardImage = within(article!).getByRole('img') as HTMLImageElement
    const primaryImageSrc = cardImage.src
    fireEvent.error(cardImage)
    await waitFor(() => expect(cardImage.src).not.toBe(primaryImageSrc))
    const fallbackImageSrc = cardImage.src
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: /ilan detayı/i })
    const detailImage = within(dialog).getByRole('img') as HTMLImageElement
    fireEvent.error(detailImage)
    await waitFor(() => expect(detailImage.src).toBe(fallbackImageSrc))
    expect(dialog.textContent).toContain('Temsili demo verisi')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Kapat' }),
    )
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('announces save and alert actions as local previews in history', async () => {
    render(
      <AdvisorWorkspace
        searchAdapter={createFixtureAdvisorSearchAdapter({ delayMs: 0 })}
        initialQuery="Urla’da arsa"
      />,
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(screen.getByRole('button', { name: 'Aramayı kaydet' }))
    expect(screen.getByRole('status').textContent).toContain(
      'Arama yalnız bu demo oturumu için kaydedildi.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Bildirim oluştur' }))
    expect(screen.getByRole('status').textContent).toContain(
      'Alarm önizlemesi hazır. Bildirim gönderilmeyecek.',
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Karar geçmişi' }),
    )
    const dialog = screen.getByRole('dialog', {
      name: 'Karar ve izin geçmişi',
    })
    expect(dialog.textContent).toContain(
      'Arama yalnız bu demo oturumu için kaydedildi.',
    )
    expect(dialog.textContent).toContain(
      'Alarm önizlemesi hazır. Bildirim gönderilmeyecek.',
    )
  })

  it('aborts the active adapter request on unmount', async () => {
    let activeSignal: AbortSignal | undefined
    const search = vi.fn<AdvisorSearchAdapter['search']>(
      (proposal, options) =>
        new Promise((resolve, reject) => {
          activeSignal = options?.signal
          options?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          )
          void resolve
          void proposal
        }),
    )
    const { unmount } = render(
      <AdvisorWorkspace
        searchAdapter={{ search }}
        initialQuery="Urla’da arsa"
      />,
    )

    await waitFor(() => expect(search).toHaveBeenCalledOnce())
    unmount()

    expect(activeSignal?.aborted).toBe(true)
  })

  it('provides the shell skip-link target', () => {
    const { container } = render(<AdvisorWorkspace />)
    expect(container.querySelector('main#main-content')).toBeTruthy()
  })
})
