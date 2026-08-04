import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createPageHead } from '@/config/routes'
import { AuthSessionProvider } from '@/features/auth'
import type { AuthAdapters, Oturum } from '@/features/auth'
import type { MessagesWorkspaceProps } from '@/features/messages/domain/message-types'
import type { RouterContext } from '@/router-context'

import { Route } from './hesabim.mesajlar'

vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

const routeSeams = vi.hoisted(() => ({
  createdSources: [] as unknown[],
  workspaceSources: [] as unknown[],
}))

vi.mock('@/features/messages/data/messages-adapter', () => ({
  createMessagesFixtureDataSource: () => {
    const source = {
      listConversations: async () => ({ items: [] }),
      listMessages: async () => ({ items: [] }),
      sendMessage: async () => {
        throw new Error('Bu route testinde gönderim beklenmiyor.')
      },
      archiveConversation: async () => {
        throw new Error('Bu route testinde arşivleme beklenmiyor.')
      },
      markConversationRead: async () => {
        throw new Error('Bu route testinde okundu işareti beklenmiyor.')
      },
    }
    routeSeams.createdSources.push(source)
    return source
  },
}))

vi.mock('@/features/messages/MessagesWorkspace', () => ({
  MessagesWorkspace: ({
    dataSource,
    conversationId,
    onConversationChange,
  }: MessagesWorkspaceProps) => {
    routeSeams.workspaceSources.push(dataSource)

    return (
      <main id="main-content" data-conversation-id={conversationId ?? ''}>
        <h1>Mesajlar</h1>
        <button
          type="button"
          onClick={() => onConversationChange?.('conversation-urla-ayse')}
        >
          Konuşmayı seç
        </button>
        <button
          type="button"
          onClick={() => onConversationChange?.(conversationId)}
        >
          Aynı konuşmayı seç
        </button>
        <button
          type="button"
          onClick={() => onConversationChange?.(undefined)}
        >
          Mesajlara dön
        </button>
      </main>
    )
  },
}))

type MessagesSearch = { konusma?: string }

type MessagesRouteOptions = {
  validateSearch?: (
    search: Record<string, unknown>,
  ) => MessagesSearch
  loaderDeps?: (input: { search: MessagesSearch }) => {
    conversationId?: string
  }
  loader?: (input: {
    context: {
      queryClient: {
        ensureInfiniteQueryData: (options: {
          queryKey: readonly unknown[]
        }) => Promise<unknown>
      }
    }
    deps: { conversationId?: string }
  }) => Promise<unknown>
  head?: () => unknown
}

function routeOptions() {
  return Route.options as MessagesRouteOptions
}

function freshQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Number.POSITIVE_INFINITY,
      },
      mutations: { retry: false },
    },
  })
}

const ORNEK_OTURUM: Oturum = {
  kullaniciId: 'test-1',
  adSoyad: 'Ayşe Kaya',
  telefon: '5551112233',
  ePosta: 'ayse@arsam.net',
  hesapTipi: 'bireysel',
  eidsDurumu: 'dogrulandi',
}

function adapters(oturum: Oturum | null): AuthAdapters {
  return {
    girisBaslat: vi.fn(),
    koduDogrula: vi.fn(),
    parolaIleGiris: vi.fn(),
    kayitYap: vi.fn(),
    profilTamamla: vi.fn(),
    kurumsalBasvuruGonder: vi.fn(),
    eidsDogrulamaBaslat: vi.fn(),
    oturumuGetir: () => oturum,
    cikisYap: vi.fn(),
  } as AuthAdapters
}

function renderRoute(initialEntry: string, oturum: Oturum | null = ORNEK_OTURUM) {
  const queryClient = freshQueryClient()
  const rootRoute = createRootRouteWithContext<RouterContext>()({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider adapters={adapters(oturum)}>
          <Outlet />
        </AuthSessionProvider>
      </QueryClientProvider>
    ),
  })
  const messagesRoute = Route.update({
    id: '/hesabim/mesajlar',
    path: '/hesabim/mesajlar',
    getParentRoute: () => rootRoute,
  } as never)
  const girisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/giris',
    validateSearch: (search: Record<string, unknown>) => ({
      donus: typeof search.donus === 'string' ? search.donus : undefined,
    }),
    component: () => <h1>Giriş yapın</h1>,
  })
  const history = createMemoryHistory({ initialEntries: [initialEntry] })
  const push = vi.spyOn(history, 'push')
  const replace = vi.spyOn(history, 'replace')
  const router = createRouter({
    routeTree: rootRoute.addChildren([messagesRoute, girisRoute]),
    history,
    context: { queryClient },
  })

  const view = render(<RouterProvider router={router} />)

  return {
    history,
    push,
    queryClient,
    replace,
    router,
    unmount: view.unmount,
  }
}

beforeEach(() => {
  routeSeams.createdSources.length = 0
  routeSeams.workspaceSources.length = 0
})

describe('/hesabim/mesajlar route', () => {
  it('canonical searchte yalnız kırpılmış opaque konuşma kimliğini tutar', () => {
    expect(
      routeOptions().validateSearch?.({
        konusma: '  conversation-urla-ayse  ',
        kisi: 'Ayşe Kaya',
        ilan: 'Urla taş ev',
        mesaj: 'Özel mesaj içeriği',
        q: 'PII araması',
      }),
    ).toEqual({ konusma: 'conversation-urla-ayse' })

    expect(
      routeOptions().validateSearch?.({
        konusma: 'unsafe/id',
        kisi: 'Ayşe Kaya',
      }),
    ).toEqual({})
    expect(
      routeOptions().loaderDeps?.({
        search: { konusma: 'conversation-urla-ayse' },
      }),
    ).toEqual({ conversationId: 'conversation-urla-ayse' })
  })

  it('fazla, PII ve geçersiz raw search alanlarını replace ile gerçekten temizler', async () => {
    const valid = renderRoute(
      '/hesabim/mesajlar?konusma=%20conversation-urla-ayse%20&kisi=Ay%C5%9Fe&mesaj=%C3%B6zel&q=telefon',
    )

    await screen.findByRole('heading', { level: 1, name: 'Mesajlar' })
    await waitFor(() =>
      expect(valid.history.location.search).toBe(
        '?konusma=conversation-urla-ayse',
      ),
    )
    expect(valid.replace).toHaveBeenCalled()
    valid.unmount()

    const invalid = renderRoute(
      '/hesabim/mesajlar?konusma=unsafe%2Fid&kisi=Ay%C5%9Fe',
    )

    await screen.findByRole('heading', { level: 1, name: 'Mesajlar' })
    await waitFor(() => expect(invalid.history.location.search).toBe(''))
    expect(invalid.replace).toHaveBeenCalled()
  })

  it('zaten canonical searchte replace yönlendirme döngüsü başlatmaz', async () => {
    const { replace } = renderRoute(
      '/hesabim/mesajlar?konusma=conversation-urla-ayse',
    )

    await screen.findByRole('heading', { level: 1, name: 'Mesajlar' })
    await new Promise((resolve) => window.setTimeout(resolve, 0))

    expect(replace).not.toHaveBeenCalled()
  })

  it('liste ve opaque thread prefetchlerini bağımsız yürütüp iki hatayı da route dışında tutar', async () => {
    const loader = routeOptions().loader
    expect(typeof loader).toBe('function')

    const listFailure = {
      ensureInfiniteQueryData: vi
        .fn()
        .mockRejectedValueOnce(new Error('Liste alınamadı.'))
        .mockResolvedValueOnce({ pages: [], pageParams: [] }),
    }
    await expect(
      loader?.({
        context: { queryClient: listFailure },
        deps: { conversationId: 'opaque-missing-id' },
      }),
    ).resolves.toBeUndefined()
    expect(listFailure.ensureInfiniteQueryData).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryKey: ['messages', 'conversations', 'all', ''],
      }),
    )
    expect(listFailure.ensureInfiniteQueryData).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: ['messages', 'thread', 'opaque-missing-id'],
      }),
    )

    const threadFailure = {
      ensureInfiniteQueryData: vi
        .fn()
        .mockResolvedValueOnce({ pages: [], pageParams: [] })
        .mockRejectedValueOnce(new Error('Thread alınamadı.')),
    }
    await expect(
      loader?.({
        context: { queryClient: threadFailure },
        deps: { conversationId: 'opaque-missing-id' },
      }),
    ).resolves.toBeUndefined()
    expect(threadFailure.ensureInfiniteQueryData).toHaveBeenCalledTimes(2)
  })

  it('seçim yokken yalnız konuşma listesini prefetch eder', async () => {
    const ensureInfiniteQueryData = vi
      .fn()
      .mockResolvedValue({ pages: [], pageParams: [] })

    await routeOptions().loader?.({
      context: { queryClient: { ensureInfiniteQueryData } },
      deps: {},
    })

    expect(ensureInfiniteQueryData).toHaveBeenCalledTimes(1)
    expect(ensureInfiniteQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['messages', 'conversations', 'all', ''],
      }),
    )
  })

  it('her loader çağrısına yeni, component ömrüne stabil bir veri kaynağı verir', async () => {
    const ensureInfiniteQueryData = vi
      .fn()
      .mockResolvedValue({ pages: [], pageParams: [] })
    const loader = routeOptions().loader

    await loader?.({
      context: { queryClient: { ensureInfiniteQueryData } },
      deps: {},
    })
    await loader?.({
      context: { queryClient: { ensureInfiniteQueryData } },
      deps: {},
    })

    expect(routeSeams.createdSources).toHaveLength(2)
    expect(routeSeams.createdSources[0]).not.toBe(
      routeSeams.createdSources[1],
    )

    routeSeams.createdSources.length = 0
    renderRoute('/hesabim/mesajlar')
    await screen.findByRole('heading', { level: 1, name: 'Mesajlar' })
    const componentSource = routeSeams.workspaceSources.at(-1)
    const loaderSource = routeSeams.createdSources[0]
    expect(componentSource).not.toBe(loaderSource)

    fireEvent.click(screen.getByRole('button', { name: 'Konuşmayı seç' }))
    await waitFor(() =>
      expect(
        screen
          .getByRole('main')
          .getAttribute('data-conversation-id'),
      ).toBe('conversation-urla-ayse'),
    )

    expect(routeSeams.workspaceSources.length).toBeGreaterThan(1)
    expect(
      routeSeams.workspaceSources.every(
        (source) => source === componentSource,
      ),
    ).toBe(true)
  })

  it('opaque eksik kimliği seçili tutar ve ilk konuşmaya yeniden eşlemez', async () => {
    const { history, replace } = renderRoute(
      '/hesabim/mesajlar?konusma=opaque-missing-id',
    )

    expect(
      (await screen.findByRole('main')).getAttribute(
        'data-conversation-id',
      ),
    ).toBe('opaque-missing-id')
    expect(history.location.search).toBe(
      '?konusma=opaque-missing-id',
    )
    expect(replace).not.toHaveBeenCalled()
  })

  it('yeni seçimi push eder, aynı seçimi yok sayar ve compact geri dönüşünü replace eder', async () => {
    const { history, push, replace } = renderRoute(
      '/hesabim/mesajlar',
    )
    await screen.findByRole('heading', { level: 1, name: 'Mesajlar' })

    fireEvent.click(screen.getByRole('button', { name: 'Konuşmayı seç' }))
    await waitFor(() =>
      expect(history.location.search).toBe(
        '?konusma=conversation-urla-ayse',
      ),
    )
    expect(push).toHaveBeenCalledTimes(1)
    expect(replace).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', { name: 'Aynı konuşmayı seç' }),
    )
    await new Promise((resolve) => window.setTimeout(resolve, 0))
    expect(push).toHaveBeenCalledTimes(1)
    expect(replace).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Mesajlara dön' }))
    await waitFor(() => expect(history.location.search).toBe(''))
    expect(push).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledTimes(1)
  })

  it('messages head sözleşmesinin noindex ve canonical değerlerini korur', () => {
    expect(routeOptions().head?.()).toEqual(createPageHead('messages'))
  })

  it('placeholder yerine messages feature çalışma alanını bağlar', async () => {
    renderRoute('/hesabim/mesajlar')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mesajlar' }),
    ).toBeTruthy()
    expect(screen.queryByText(/bu alana yerleşecek/i)).toBeNull()
  })

  it('oturumsuz erişimde girişe yönlendirir', async () => {
    renderRoute('/hesabim/mesajlar', null)

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Giriş yapın' })).toBeTruthy(),
    )
  })
})
