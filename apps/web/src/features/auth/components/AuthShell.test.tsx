import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthShell } from './AuthShell'

function shellIleRouter() {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
      <AuthShell>
        <h1>Giriş</h1>
      </AuthShell>
    ),
  })
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

describe('AuthShell', () => {
  it('çocuklarını çizer', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    expect(await screen.findByRole('heading', { name: 'Giriş' })).toBeTruthy()
  })

  it('kendi main landmark öğesini üretmez — o sayfanın sorumluluğudur', async () => {
    const { container } = render(<RouterProvider router={shellIleRouter()} />)
    await screen.findByRole('heading', { name: 'Giriş' })
    expect(container.querySelectorAll('main')).toHaveLength(0)
  })

  it('markayı ana sayfaya bağlar', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    const marka = await screen.findByRole('link', { name: 'arsam.net' })
    expect(marka.getAttribute('href')).toBe('/')
  })
})
