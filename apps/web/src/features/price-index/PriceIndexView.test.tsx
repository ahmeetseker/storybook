import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { loadPriceIndex, parsePriceIndexPath } from './data/price-index-adapter'
import { PriceIndexView } from './PriceIndexView'

async function renderView(splat: string) {
  const path = parsePriceIndexPath(splat)
  const result = await loadPriceIndex({ path })
  const rootRoute = createRootRoute({ component: Outlet })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/emlak-endeksi/$',
    component: () => <PriceIndexView result={result} path={path} />,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: [`/emlak-endeksi/${splat}`] }),
  })
  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { level: 1 })
  return router
}

describe('PriceIndexView (İpek)', () => {
  it('hero numerali medyan değeri erişilebilir adında taşır ve genişlik rezervasyonu yapar', async () => {
    await renderView('konut/satilik/istanbul/kadikoy')
    const numeral = screen.getByTestId('hero-medyan')
    expect(numeral.getAttribute('aria-label')).toBe('169.123')
    // Ghost katmanı count-up sırasında genişliği rezerve eder — layout shift olmaz.
    expect(numeral.querySelector('[data-part="ghost"]')?.textContent).toBe('169.123')
  })

  it('veri bandı dört tipografik noktayı tek bölümde toplar', async () => {
    await renderView('konut/satilik/istanbul/kadikoy')
    const band = screen.getByLabelText('Endeks özeti')
    for (const etiket of ['Medyan ilan fiyatı', 'Brüt kira getirisi', 'Veri güveni', 'Pazarlama süresi']) {
      expect(band.textContent).toContain(etiket)
    }
  })

  it('bölümler kicker + başlık ritmiyle numaralanır', async () => {
    await renderView('konut/satilik/istanbul/kadikoy')
    expect(screen.getByText('Bölüm I')).toBeTruthy()
    expect(screen.getByText('Bölüm II')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Fiyatın on iki aylık seyri' })).toBeTruthy()
  })

  it('yetersiz örneklemli bölgede numeral ve veri bandı yayımlanmaz', async () => {
    await renderView('konut/satilik/istanbul/adalar')
    expect(screen.queryByTestId('hero-medyan')).toBeNull()
    expect(screen.queryByLabelText('Endeks özeti')).toBeNull()
  })

  it('demografi bölümünü kaynak künyesiyle render eder', async () => {
    await renderView('konut/satilik/istanbul/kadikoy')
    expect(screen.getByRole('heading', { name: 'Bölgede kim yaşıyor?' })).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Yaş dağılımı' })).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Eğitim durumu' })).toBeTruthy()
    expect(screen.getByRole('list', { name: /nüfus dağılımı/ })).toBeTruthy()
    expect(screen.getByText(/TÜİK/)).toBeTruthy()
  })

  it('breadcrumb ataları tıklanabilir linktir', async () => {
    await renderView('konut/satilik/istanbul/kadikoy')
    const istanbul = screen.getByRole('link', { name: 'İstanbul' })
    expect(istanbul.getAttribute('href')).toBe('/emlak-endeksi/konut/satilik/istanbul')
  })

  it('işlem türü anahtarı kiralık endekse yönlendirir', async () => {
    const router = await renderView('konut/satilik/istanbul')
    fireEvent.click(screen.getByRole('radio', { name: 'Kiralık' }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/emlak-endeksi/konut/kiralik/istanbul')
    })
  })

  it('konut özelliği kırılımlarını oda ve bina yaşı sekmeleriyle gösterir', async () => {
    await renderView('konut/satilik/istanbul/kadikoy')
    expect(screen.getByRole('tab', { name: 'Oda sayısı' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Bina yaşı' })).toBeTruthy()
  })

  it('kiralık sayfada başlık ve numeral kira dilinde konuşur', async () => {
    await renderView('konut/kiralik/istanbul')
    expect(screen.getByTestId('hero-medyan').getAttribute('aria-label')).toBe('309')
    expect(screen.getAllByText('Medyan ilan kirası').length).toBeGreaterThan(0)
  })
})
