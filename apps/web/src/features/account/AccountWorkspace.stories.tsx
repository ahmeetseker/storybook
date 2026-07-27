import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { expect, userEvent, within } from 'storybook/test'

import { AccountWorkspace } from './AccountWorkspace'
import { ACCOUNT_FIXTURES } from './data/account-fixtures'

const withMemoryRouter: Decorator = (Story) => {
  const rootRoute = createRootRoute({ component: Outlet })
  const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/hesabim',
    component: Story,
  })
  const listingCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ilan-ver',
    component: () => <p>İlan verme rotası</p>,
  })
  const favoritesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/favoriler',
    component: () => <p>Favoriler rotası</p>,
  })
  const listingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/emlak',
    component: () => <p>Emlak rotası</p>,
  })
  const routeTree = rootRoute.addChildren([
    accountRoute,
    listingCreateRoute,
    favoritesRoute,
    listingsRoute,
  ])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/hesabim'] }),
  })

  return <RouterProvider router={router} />
}

const needsActionData = {
  ...ACCOUNT_FIXTURES.default,
  attentionCandidates: ACCOUNT_FIXTURES.default.attentionCandidates.map(
    (item, index) =>
      index === 0
        ? {
            ...item,
            severity: 'critical' as const,
            title: 'Bugün tamamlanması gereken hesap işlemi',
          }
        : item,
  ),
}

const longContentData = {
  ...ACCOUNT_FIXTURES.default,
  identity: {
    ...ACCOUNT_FIXTURES.default.identity,
    displayName: 'Mehmet Can Yılmaz Karadeniz',
    organizationLabel:
      'Urla, Çeşme ve Seferihisar Bölgesi Yatırım Danışmanlığı ve Gayrimenkul Hizmetleri',
  },
  attentionCandidates: ACCOUNT_FIXTURES.default.attentionCandidates.map(
    (item) => ({
      ...item,
      reason:
        `${item.reason} Bu açıklama, uzun Türkçe içeriklerin sakin hesap merkezi ritmini bozmadan sarılmasını doğrular.`,
    }),
  ),
  listings: ACCOUNT_FIXTURES.default.listings.map((listing) => ({
    ...listing,
    title:
      `${listing.title} · Uzun açıklamalı yatırım fırsatı ve ayrıntılı konum bilgisi`,
  })),
}

const meta = {
  title: 'Sayfalar/Hesabım/Enterprise Genel Bakış',
  component: AccountWorkspace,
  tags: ['autodocs'],
  decorators: [withMemoryRouter],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Kimlik, gündem, göstergeler, ilanlar ve güvenliği tek aksiyon-öncelikli hesap çalışma alanında birleştirir.',
      },
    },
  },
  argTypes: {
    data: { control: false },
    mode: {
      control: 'select',
      options: [
        'loading',
        'ready',
        'new-account',
        'restricted',
        'session-expired',
      ],
    },
  },
} satisfies Meta<typeof AccountWorkspace>

export default meta
type Story = StoryObj<typeof meta>

/** Hibrit hesap için kimlik → gündem → metrik → operasyon sırası. */
export const Default: Story = {
  args: { data: ACCOUNT_FIXTURES.default },
}

/** Alıcı rolü, keşif rotasını tek primary aksiyon olarak kullanır. */
export const AliciHesabi: Story = {
  args: { data: ACCOUNT_FIXTURES.buyer },
}

/** Kritik gündem maddesi, durumunu metin ve gerçek rota ile açıklar. */
export const IslemGerekiyor: Story = {
  args: { data: needsActionData },
}

/** Faaliyeti olmayan alıcıya role uygun başlangıç boş durumu gösterir. */
export const YeniHesap: Story = {
  args: { data: ACCOUNT_FIXTURES.newAccount, mode: 'new-account' },
}

/** Kişisel veri göstermeyen ve ana çalışma alanını busy işaretleyen iskelet. */
export const Loading: Story = {
  args: { data: ACCOUNT_FIXTURES.default, mode: 'loading' },
}

/** İlan hatası yerel kalırken güvenlik, etkinlik ve kayıtlı arama görünürdür. */
export const PartialError: Story = {
  args: { data: ACCOUNT_FIXTURES.partialError },
}

/** Kısıtlı erişim, hazır içerik yerine tek açıklayıcı durum sunar. */
export const Restricted: Story = {
  args: { data: ACCOUNT_FIXTURES.restricted, mode: 'restricted' },
}

/** Uzun ad, kurum, ilan ve açıklamaların sarma davranışı. */
export const UzunIcerik: Story = {
  args: { data: longContentData },
}

/** Dar container, aynı DOM sırasını tek kolonda korur. */
export const Mobile390: Story = {
  args: { data: ACCOUNT_FIXTURES.default },
  parameters: { viewport: { defaultViewport: 'mobile390' } },
}

/** Tablet container, iki kolonlu grupları tek akışa indirir. */
export const Tablet768: Story = {
  args: { data: ACCOUNT_FIXTURES.default },
  parameters: { viewport: { defaultViewport: 'tablet768' } },
}

/** Kağıt tema mevcut Storybook token bağlamıyla gösterilir. */
export const Kagit: Story = {
  args: { data: ACCOUNT_FIXTURES.default },
  globals: { backgroundKey: 'light' },
}

/** Grafit tema aynı semantik tokenlarla gösterilir. */
export const Grafit: Story = {
  args: { data: ACCOUNT_FIXTURES.default },
  globals: { backgroundKey: 'dark' },
}

/** Klavye odağı primary linke ulaşır ve tek h1 sözleşmesi korunur. */
export const Erisilebilirlik: Story = {
  args: { data: ACCOUNT_FIXTURES.default },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { level: 1, name: 'Hesabım' })
    const primaryLink = await canvas.findByRole('link', {
      name: 'Yeni ilan ver',
    })

    await userEvent.tab()
    await expect(primaryLink).toHaveFocus()
    expect(window.getComputedStyle(primaryLink).outlineStyle).not.toBe('none')
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  },
}

/** Yalnız demo: üretimdeki `/hesabim` rotası bu modu üretmez. */
export const SessionExpired: Story = {
  args: {
    data: ACCOUNT_FIXTURES.sessionExpired,
    mode: 'session-expired',
  },
}
