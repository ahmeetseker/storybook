import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PricingPage } from './PricingPage'
import { OFFICE_PLANS, officePlanById, toPricingPlans } from './data/office-plans'

/** `/paketler` → `/kayit/kurumsal` geçişini gerçek yönlendiriciyle kurar. */
function sayfayiKur() {
  const rootRoute = createRootRoute({ component: Outlet })
  const paketlerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/paketler',
    component: PricingPage,
  })
  const basvuruRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/kayit/kurumsal',
    component: function Basvuru() {
      const arama = basvuruRoute.useSearch() as { paket?: string }
      return <p>{`Başvuru · paket=${arama.paket ?? 'yok'}`}</p>
    },
    validateSearch: (search: Record<string, unknown>) => ({
      paket: typeof search.paket === 'string' ? search.paket : undefined,
    }),
  })
  const ofislerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ofisler',
    component: () => <p>Ofis dizini</p>,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([paketlerRoute, basvuruRoute, ofislerRoute]),
    history: createMemoryHistory({ initialEntries: ['/paketler'] }),
  })

  return render(<RouterProvider router={router} />)
}

describe('PricingPage', () => {
  it('üç ofis paketini ve yıllık indirimi gösterir', async () => {
    sayfayiKur()
    await screen.findByRole('heading', { name: 'Ofisiniz büyüdükçe ölçeklenen paketler', level: 1 })

    for (const plan of OFFICE_PLANS) {
      expect(screen.getByRole('heading', { name: plan.name, level: 3 })).toBeTruthy()
    }
    // 1490 × 12 = 17.880 → 14.300 ⇒ %20
    expect(screen.getByText('%20 indirim')).toBeTruthy()
  })

  it('paket eylemi başvuruyu seçilen paketle açar', async () => {
    const kullanici = userEvent.setup()
    sayfayiKur()
    await screen.findByRole('heading', { level: 1 })

    const kurumsalKarti = screen
      .getByRole('heading', { name: 'Ofis Kurumsal', level: 3 })
      .closest('article') as HTMLElement
    await kullanici.click(within(kurumsalKarti).getByRole('button', { name: 'Bu paketle başvur' }))

    await waitFor(() => expect(screen.getByText('Başvuru · paket=kurumsal')).toBeTruthy())
  })

  it('sık sorulanlar bölümü paket sözleşmesini açıklar', async () => {
    sayfayiKur()
    await screen.findByRole('heading', { level: 1 })
    expect(screen.getByRole('heading', { name: 'Sık sorulanlar', level: 2 })).toBeTruthy()
    // SSS rafı kesintisiz döngü için kartları iki kez basar; rol sorgusu
    // aria-hidden kopyayı dışlar ve soruyu tek görür.
    expect(screen.getByRole('heading', { name: 'Koltuk ne demek?', level: 3 })).toBeTruthy()
  })
})

describe('ofis paket verisi', () => {
  it('her pakette yıllık tutar aylığın 12 katından %20 ucuzdur', () => {
    for (const plan of OFFICE_PLANS) {
      const oran = 1 - plan.yearly / (plan.monthly * 12)
      expect(Math.round(oran * 100), plan.name).toBe(20)
    }
  })

  it('ek koltuk yıllık ücreti de aynı indirimi taşır', () => {
    for (const plan of OFFICE_PLANS) {
      const oran = 1 - plan.seats.extraYearly / (plan.seats.extraMonthly * 12)
      expect(Math.round(oran * 100), plan.name).toBe(20)
    }
  })

  it('paketler ucuzdan pahalıya sıralıdır ve koltuk kademesi büyür', () => {
    for (let i = 1; i < OFFICE_PLANS.length; i++) {
      expect(OFFICE_PLANS[i].monthly).toBeGreaterThan(OFFICE_PLANS[i - 1].monthly)
      expect(OFFICE_PLANS[i].seats.included).toBeGreaterThan(OFFICE_PLANS[i - 1].seats.included)
    }
  })

  it('yalnız bir paket vurgulanır — ikincisi hiyerarşiyi düzler', () => {
    expect(OFFICE_PLANS.filter((plan) => plan.prominent)).toHaveLength(1)
  })

  it('mevcut paketin eylemi satın alınabilir görünmez', () => {
    const plans = toPricingPlans({ actionLabel: 'Bu pakete geç', hideActionFor: 'profesyonel' })
    const mevcut = plans.find((plan) => plan.id === 'profesyonel')!
    expect(mevcut.action.label).toBe('Mevcut paketiniz')
    expect(mevcut.action.onSelect).toBeUndefined()
  })

  it('bilinmeyen paket kimliği hata fırlatır', () => {
    expect(() => officePlanById('yok' as never)).toThrow()
  })
})
