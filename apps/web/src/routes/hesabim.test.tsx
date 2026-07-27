import { render, screen } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'
import { Route } from './hesabim'

vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

const rootRoute = createRootRoute({
  component: Outlet,
})
const accountRoute = Route.update({
  id: '/hesabim',
  path: '/hesabim',
  getParentRoute: () => rootRoute,
} as never)
const routeTree = rootRoute.addChildren([accountRoute])

function renderRoute(initialEntry: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  })

  render(<RouterProvider router={router} />)
}

describe('/hesabim rotası', () => {
  it('placeholder yerine enterprise hesap çalışma alanını bağlar', async () => {
    renderRoute('/hesabim')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hesabım' }),
    ).toBeTruthy()
    expect(screen.queryByText(/bu alana yerleşecek/i)).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Yeni ilan ver' }).getAttribute('href'),
    ).toBe('/ilan-ver')
  })

  it('hesap sayfası için noindex canonical head sözleşmesini korur', async () => {
    const head = await Route.options.head?.({} as never)

    expect(head?.meta).toEqual(
      expect.arrayContaining([
        { title: 'Hesabım | arsam.net' },
        { name: 'robots', content: 'noindex, nofollow' },
      ]),
    )
    expect(head?.links).toContainEqual({
      rel: 'canonical',
      href: 'https://arsam.net/hesabim',
    })
  })
})
