import { render, screen } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'
import { Route } from './karsilastir'

vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

function validate(search: Record<string, unknown>) {
  const validator = Route.options.validateSearch
  if (typeof validator !== 'function') {
    throw new Error('Comparison route search validator must be callable.')
  }
  return validator(search)
}

const rootRoute = createRootRoute({
  component: Outlet,
})
const comparisonRoute = Route.update({
  id: '/karsilastir',
  path: '/karsilastir',
  getParentRoute: () => rootRoute,
} as never)
const routeTree = rootRoute.addChildren([comparisonRoute])

function renderRoute(initialEntry: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  })

  render(<RouterProvider router={router} />)

  return router
}

describe('/karsilastir route', () => {
  it('normalizes, deduplicates, and caps selected listing ids in first-seen order', () => {
    expect(
      validate({
        ids: ' listing-1-2,listing-1-1,listing-1-2,unknown,overflow ',
      }),
    ).toEqual({
      ids: 'listing-1-2,listing-1-1,unknown',
    })
  })

  it('omits an empty ids parameter', () => {
    expect(validate({ ids: ' ,  , ' })).toEqual({})
  })

  it('keeps canonical decoded ids for the router to encode once', () => {
    expect(validate({ ids: 'ilan/1, ilan+2,ilan/1' })).toEqual({
      ids: 'ilan/1,ilan+2',
    })
  })

  it('keeps the demonstration only when the mounted route has no ids', async () => {
    renderRoute('/karsilastir')

    expect(
      await screen.findAllByText('Kozlu Fatih Sitesi 3+1'),
    ).not.toHaveLength(0)
    expect(
      screen.queryByText('Seçtiğiniz ilanlar artık bulunamıyor'),
    ).toBeNull()
  })

  it('renders stale explicit route selection instead of the demonstration', async () => {
    renderRoute('/karsilastir?ids=unknown%2Cretired-id')

    expect(
      await screen.findByText('Seçtiğiniz ilanlar artık bulunamıyor'),
    ).toBeTruthy()
    expect(screen.queryByText('Kozlu Fatih Sitesi 3+1')).toBeNull()
  })

  it('wires normalized route ids into the workbench in URL order', async () => {
    renderRoute(
      '/karsilastir?ids=listing-1-2%2Clisting-1-1%2Clisting-1-2',
    )

    expect(
      (await screen.findAllByRole('columnheader'))
        .slice(1)
        .map((header) => header.textContent),
    ).toEqual([
      '×Urla’da denize yakın, imarlı köşe parsel · 2. portföy',
      '×Urla’da denize yakın, imarlı köşe parsel',
    ])
    expect(screen.queryByText('Kozlu Fatih Sitesi 3+1')).toBeNull()
  })
})
