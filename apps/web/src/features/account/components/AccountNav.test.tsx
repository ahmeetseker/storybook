import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'

import { ACCOUNT_FIXTURES } from '../data/account-fixtures'
import { accountNavEntries } from '../domain/account-navigation'
import { AccountNav } from './AccountNav'

// TanStack Router her gezinmede scroll geri yüklemeyi dener; jsdom bunu
// uygulamaz. Uyarı gürültüsünü keser, davranışı etkilemez.
vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

/**
 * Bu dosya var oluş nedeni: "Randevularım" `accountNavEntries`e eklendi ama
 * GÖRÜNEN ray ikinci, elle yazılmış bir `GlassSidebar.Item` listesinden
 * (burası) çiziliyordu — o listeye eklenmediği için oturum açmış kullanıcı
 * hiçbir yerden randevu sayfasına gidemiyordu. Bu test, ray listesini
 * `accountNavEntries` tek kaynağıyla karşılaştırarak aynı boşluğu bir daha
 * sessizce açmaz.
 */

function renderNav() {
  const rootRoute = createRootRoute({ component: Outlet })
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <AccountNav data={ACCOUNT_FIXTURES.default} />,
  })
  const randevularimRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/hesabim/randevularim',
    component: () => <h1>Randevularım sayfası</h1>,
  })
  const routeTree = rootRoute.addChildren([homeRoute, randevularimRoute])
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const router = createRouter({ routeTree, history })
  const rendered = render(<RouterProvider router={router} />)
  return { ...rendered, history }
}

// Router ilk eşleşmeyi bir tick sonra çizer (account-page-test-utils.tsx'teki
// notla aynı sebep); ray hazır olana kadar beklenir.
async function renderNavReady() {
  const result = renderNav()
  await screen.findByRole('navigation', { name: 'Hesap bölümleri' })
  return result
}

describe('AccountNav', () => {
  it('accountNavEntries listesindeki her öğe için görünen bir ray düğmesi çizer', async () => {
    await renderNavReady()
    for (const entry of accountNavEntries) {
      // Rozet/varsa ekran-okuyucu eki ada eklenebilir; kısmi eşleşme yeterli.
      expect(
        screen.getByRole('button', { name: new RegExp(entry.label) }),
      ).toBeTruthy()
    }
  })

  it('iletişim üçlüsü sıralı durur: Mesajlar → Bildirimler → Randevularım', async () => {
    await renderNavReady()
    const labels = screen.getAllByRole('button').map((button) => button.textContent ?? '')
    const mesajlarIndex = labels.findIndex((text) => text.includes('Mesajlar'))
    const bildirimlerIndex = labels.findIndex((text) => text.includes('Bildirimler'))
    const randevularimIndex = labels.findIndex((text) => text.includes('Randevularım'))

    expect(mesajlarIndex).toBeGreaterThanOrEqual(0)
    expect(bildirimlerIndex).toBe(mesajlarIndex + 1)
    expect(randevularimIndex).toBe(bildirimlerIndex + 1)
  })

  it('Randevularım öğesine tıklanınca /hesabim/randevularim rotasına gider', async () => {
    const { history } = await renderNavReady()

    fireEvent.click(screen.getByRole('button', { name: 'Randevularım' }))

    await waitFor(() => expect(history.location.pathname).toBe('/hesabim/randevularim'))
    expect(await screen.findByRole('heading', { name: 'Randevularım sayfası' })).toBeTruthy()
  })
})
