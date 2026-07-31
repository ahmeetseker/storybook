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
  it('içeriği main landmark içinde gösterir', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    const main = await screen.findByRole('main')
    expect(main.querySelector('h1')?.textContent).toBe('Giriş')
  })

  it('içeriğe geç bağlantısının hedefi olan main-content kimliğini taşır', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    const main = await screen.findByRole('main')
    expect(main.id).toBe('main-content')
  })

  it('markayı ana sayfaya bağlar', async () => {
    render(<RouterProvider router={shellIleRouter()} />)
    const marka = await screen.findByRole('link', { name: 'arsam.net' })
    expect(marka.getAttribute('href')).toBe('/')
  })
})
