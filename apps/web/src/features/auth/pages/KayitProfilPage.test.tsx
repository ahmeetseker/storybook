import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
import { KayitProfilPage } from './KayitProfilPage'

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'uye-1',
  adSoyad: 'Yeni Kullanıcı',
  telefon: '5559998877',
  ePosta: 'yeni@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'yok',
}

function profilRouter(adapters: AuthAdapters) {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthSessionProvider adapters={adapters}>
        <Outlet />
      </AuthSessionProvider>
    ),
  })
  const arama = (search: Record<string, unknown>) => ({
    donus: typeof search.donus === 'string' ? search.donus : undefined,
  })
  const rotalar = [
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => <h1>Ana sayfa</h1> }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/kayit/profil',
      validateSearch: arama,
      component: KayitProfilPage,
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
    history: createMemoryHistory({ initialEntries: ['/kayit/profil'] }),
  })
}

describe('KayitProfilPage', () => {
  it('oturumsuz kullanıcıyı girişe yönlendirir', async () => {
    const adapters = sahteAuthAdapters({ oturumuGetir: () => null })
    render(<RouterProvider router={profilRouter(adapters)} />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })

  it('mevcut oturum değerleriyle ön doldurur', async () => {
    const adapters = sahteAuthAdapters({ oturumuGetir: () => ORNEK_OTURUM })
    render(<RouterProvider router={profilRouter(adapters)} />)
    const ad = (await screen.findByLabelText('Ad soyad')) as HTMLInputElement
    expect(ad.value).toBe('Yeni Kullanıcı')
    expect((screen.getByLabelText('E-posta') as HTMLInputElement).value).toBe('yeni@arsam.net')
  })

  it('güncellemeyi adapter’a iletir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAuthAdapters({
      oturumuGetir: () => ORNEK_OTURUM,
      profilTamamla: vi.fn(async () => ({ durum: 'basarili' as const, veri: ORNEK_OTURUM })),
    })
    render(<RouterProvider router={profilRouter(adapters)} />)
    const ad = await screen.findByLabelText('Ad soyad')
    await kullanici.clear(ad)
    await kullanici.type(ad, 'Güncel İsim')
    await kullanici.click(screen.getByRole('button', { name: 'Kaydet ve devam et' }))
    await waitFor(() =>
      expect(adapters.profilTamamla).toHaveBeenCalledWith('Güncel İsim', 'yeni@arsam.net'),
    )
  })

  it('adapter hatasını alert olarak gösterir', async () => {
    const kullanici = userEvent.setup()
    const adapters = sahteAuthAdapters({
      oturumuGetir: () => ORNEK_OTURUM,
      profilTamamla: vi.fn(async () => ({
        durum: 'hata' as const,
        kod: 'eksik-alan' as const,
        mesaj: 'Ad soyad ve e-posta zorunludur.',
      })),
    })
    render(<RouterProvider router={profilRouter(adapters)} />)
    await screen.findByLabelText('Ad soyad')
    await kullanici.click(screen.getByRole('button', { name: 'Kaydet ve devam et' }))
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('zorunludur'),
    )
  })
})
