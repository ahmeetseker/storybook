import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { HesapVarPage } from './kayitDurumSayfalari'

function durumRouter(Component: () => ReactElement) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })
  const rotalar = [
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: Component }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      component: () => <h1>Giriş yapın</h1>,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/parola-sifirla',
      component: () => <h1>Parola sıfırlama</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

describe('HesapVarPage', () => {
  it('bilgi tonunda çizilir — alert kullanmaz', async () => {
    render(<RouterProvider router={durumRouter(HesapVarPage)} />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('tek main landmark üretir', async () => {
    const { container } = render(<RouterProvider router={durumRouter(HesapVarPage)} />)
    await screen.findByRole('heading', { level: 1 })
    expect(container.querySelectorAll('main')).toHaveLength(1)
  })

  it('girişe dönüş yolu sunar', async () => {
    render(<RouterProvider router={durumRouter(HesapVarPage)} />)
    const baglanti = await screen.findByRole('link', { name: /giriş/i })
    expect(baglanti.getAttribute('href')).toBe('/giris')
  })
})
