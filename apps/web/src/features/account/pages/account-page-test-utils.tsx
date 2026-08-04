import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'

// TanStack Router her gezinmede scroll geri yüklemeyi dener; jsdom bunu
// uygulamaz. Uyarı gürültüsünü keser, davranışı etkilemez.
vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

/**
 * Alt sayfaların testlerinde ortak kabuk: sayfalar gerçek TanStack Router
 * bağlantıları kullandığı için render bir router bağlamı ister. Yalnız
 * `AccountActionLink`in hedeflediği rotalar tanımlanır.
 *
 * Router ilk eşleşmeyi bir tick sonra çizdiği için sayfanın `h1`i beklenir;
 * dönüşten sonra senkron sorgular güvenle kullanılabilir.
 */
export async function renderAccountPage(content: ReactNode) {
  const rootRoute = createRootRoute({ component: Outlet })
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <>{content}</>,
  })
  const listingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/emlak',
    component: () => <p>Emlak</p>,
  })
  const createListingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ilan-ver',
    component: () => <p>İlan ver</p>,
  })
  const favoritesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/favoriler',
    component: () => <p>Favoriler</p>,
  })

  const routeTree = rootRoute.addChildren([
    homeRoute,
    listingsRoute,
    createListingRoute,
    favoritesRoute,
  ])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  const result = render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { level: 1 })
  return result
}

/** Sayfadaki başlık sırasını (`h1`, `h2`, `h3` …) döndürür. */
export function headingLevels(headings: HTMLElement[]) {
  return headings.map((heading) => Number(heading.tagName.slice(1)))
}
