import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import {
  BaglantiGecersizPage,
  BaglantiGonderildiPage,
  GirisHataPage,
} from './girisDurumSayfalari'

function durumRouter(Component: () => ReactElement) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })
  const durumRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Component,
  })
  const girisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris',
    component: () => <h1>Giriş</h1>,
  })
  return createRouter({
    routeTree: rootRoute.addChildren([durumRoute, girisRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
}

describe('giriş durum sayfaları', () => {
  it('bağlantı gönderildi bilgi tonunda çizilir ve alert kullanmaz', async () => {
    render(<RouterProvider router={durumRouter(BaglantiGonderildiPage)} />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('geçersiz bağlantı hata tonunda alert olarak duyurulur', async () => {
    render(<RouterProvider router={durumRouter(BaglantiGecersizPage)} />)
    expect(await screen.findByRole('alert')).toBeTruthy()
  })

  it('genel hata sayfası girişe dönüş yolu sunar', async () => {
    render(<RouterProvider router={durumRouter(GirisHataPage)} />)
    const baglanti = await screen.findByRole('link', { name: /giriş/i })
    expect(baglanti.getAttribute('href')).toBe('/giris')
  })
})
