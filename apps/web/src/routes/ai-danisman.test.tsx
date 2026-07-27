import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Route as ComparisonRoute } from './karsilastir'
import { Route } from './ai-danisman'

const { advisorSearch } = vi.hoisted(() => ({
  advisorSearch: vi.fn(),
}))

vi.mock(
  '@/features/advisor/data/advisor-search-adapter',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/features/advisor/data/advisor-search-adapter')
      >()

    return {
      ...actual,
      createFixtureAdvisorSearchAdapter: () => {
        const adapter = actual.createFixtureAdvisorSearchAdapter({
          delayMs: 0,
        })

        return {
          search: (...args: Parameters<typeof adapter.search>) => {
            advisorSearch(...args)
            return adapter.search(...args)
          },
        }
      },
    }
  },
)

vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

function validate(search: Record<string, unknown>) {
  const validator = Route.options.validateSearch
  if (typeof validator !== 'function') {
    throw new Error('Advisor route search validator must be callable.')
  }
  return validator(search)
}

const rootRoute = createRootRoute({
  component: Outlet,
})
const advisorRoute = Route.update({
  id: '/ai-danisman',
  path: '/ai-danisman',
  getParentRoute: () => rootRoute,
} as never)
const comparisonRoute = ComparisonRoute.update({
  id: '/karsilastir',
  path: '/karsilastir',
  getParentRoute: () => rootRoute,
} as never)
const routeTree = rootRoute.addChildren([
  advisorRoute,
  comparisonRoute,
])

function renderRoute(initialEntry: string) {
  const history = createMemoryHistory({
    initialEntries: [initialEntry],
  })
  const replace = vi.spyOn(history, 'replace')
  const push = vi.spyOn(history, 'push')
  const router = createRouter({ routeTree, history })

  render(<RouterProvider router={router} />)

  return { history, push, replace, router }
}

beforeEach(() => {
  advisorSearch.mockClear()
})

describe('/ai-danisman route', () => {
  it('trims the query and keeps the first three unique comparison ids', () => {
    expect(
      validate({
        q: '  Urla’da arsa  ',
        compare:
          ' listing-1-2,listing-1-1,listing-1-2,unknown,overflow ',
      }),
    ).toEqual({
      q: 'Urla’da arsa',
      compare: 'listing-1-2,listing-1-1,unknown',
    })
  })

  it('omits empty query and comparison parameters', () => {
    expect(
      validate({
        q: '   ',
        compare: ' ,  , ',
      }),
    ).toEqual({})
  })

  it('keeps canonical decoded values for the router to encode once', () => {
    expect(
      validate({
        q: ' Urla % arsa ',
        compare: 'ilan/1,ilan+2',
      }),
    ).toEqual({
      q: 'Urla % arsa',
      compare: 'ilan/1,ilan+2',
    })
  })

  it('persists a first query with one replace and does not auto-run it again', async () => {
    const { history, push, replace } = renderRoute('/ai-danisman')

    fireEvent.change(
      await screen.findByRole('searchbox', {
        name: 'Doğal dilde arama',
      }),
      {
        target: { value: '  Urla’da arsa  ' },
      },
    )
    fireEvent.submit(screen.getByRole('search'))

    await screen.findByText(/ilan eşleşti/)

    expect(advisorSearch).toHaveBeenCalledTimes(1)
    expect(
      (
        advisorSearch.mock.calls[0]?.[1] as
          | { signal?: AbortSignal }
          | undefined
      )?.signal?.aborted,
    ).toBe(false)
    expect(history.location.pathname).toBe('/ai-danisman')
    expect(new URLSearchParams(history.location.search).get('q')).toBe(
      'Urla’da arsa',
    )
    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it('does not rewrite canonical initial advisor state during its auto-run', async () => {
    const { push, replace } = renderRoute(
      '/ai-danisman?q=Urla%E2%80%99da%20arsa',
    )

    await screen.findByText(/ilan eşleşti/)

    expect(advisorSearch).toHaveBeenCalledTimes(1)
    expect(replace).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('opens the comparison route with the selected ids from the mounted route container', async () => {
    const { history, push } = renderRoute(
      '/ai-danisman?q=Urla%E2%80%99da%20arsa&compare=listing-1-1%2Clisting-1-2',
    )

    await screen.findByText(/ilan eşleşti/)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Karşılaştır',
      }),
    )

    await waitFor(() =>
      expect(history.location.pathname).toBe('/karsilastir'),
    )
    expect(new URLSearchParams(history.location.search).get('ids')).toBe(
      'listing-1-1,listing-1-2',
    )
    expect(push).toHaveBeenCalledTimes(1)
    expect(
      await screen.findAllByText(
        'Urla’da denize yakın, imarlı köşe parsel',
      ),
    ).not.toHaveLength(0)
  })
})
