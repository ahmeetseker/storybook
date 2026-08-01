import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { AuthSessionProvider } from '../AuthSessionProvider'
import { sahteAuthAdapters } from '../test-utils'
import type { AuthAdapters } from '../data/auth-adapters'
import type { Oturum } from '../domain/auth-types'
import { KorumaliSayfa } from './KorumaliSayfa'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'yok',
}

const arama = (search: Record<string, unknown>) => ({
  donus: typeof search.donus === 'string' ? search.donus : undefined,
})

function korumaliSayfaRouter(adapters: AuthAdapters, baslangicYolu = '/korumali') {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const rotalar = [
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/korumali',
      component: () => (
        <KorumaliSayfa>
          <h1>Korumalı içerik</h1>
        </KorumaliSayfa>
      ),
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/giris',
      validateSearch: arama,
      component: () => <h1>Giriş yapın</h1>,
    }),
  ]
  return createRouter({
    routeTree: rootRoute.addChildren(rotalar),
    history: createMemoryHistory({ initialEntries: [baslangicYolu] }),
  })
}

describe('KorumaliSayfa', () => {
  it('oturumluyken hidrasyon sonrası çocuklarını gösterir', async () => {
    const adapters = sahteAuthAdapters({ oturumuGetir: () => ORNEK_OTURUM })
    render(<RouterProvider router={korumaliSayfaRouter(adapters)} />)
    expect(await screen.findByRole('heading', { name: 'Korumalı içerik' })).toBeTruthy()
  })

  it('oturumsuzken içeriği hiç göstermeden /girise yönlendirir', async () => {
    const adapters = sahteAuthAdapters({ oturumuGetir: () => null })
    const router = korumaliSayfaRouter(adapters)
    render(<RouterProvider router={router} />)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy())
    expect(screen.queryByRole('heading', { name: 'Korumalı içerik' })).toBeNull()
    expect(router.state.location.pathname).toBe('/giris')
    expect(router.state.location.search).toEqual({ donus: '/korumali' })
  })
})
