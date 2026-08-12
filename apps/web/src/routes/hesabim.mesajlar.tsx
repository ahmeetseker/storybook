/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { useEffect, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { createPageHead } from '@/config/routes'
import {
  MessagesWorkspace,
  createMessagesFixtureDataSource,
  type MessagesDataSource,
} from '@/features/messages'
import {
  conversationInfiniteQueryOptions,
  messagesQueryKeys,
  threadInfiniteQueryOptions,
} from '@/features/messages/data/messages-query'
import {
  officeThreadCount,
  withOfficeConversations,
} from '@/features/messages/data/office-message-store'
import {
  parseMessagesRouteSearch,
  serializeMessagesRouteSearch,
  type MessagesRouteSearch,
} from '@/features/messages/domain/message-route-search'

function isCanonicalMessagesSearch(
  raw: Record<string, unknown>,
  canonical: MessagesRouteSearch,
) {
  const rawKeys = Object.keys(raw).filter(
    (key) => raw[key] !== undefined,
  )
  const canonicalKeys = Object.keys(canonical)

  return (
    rawKeys.length === canonicalKeys.length
    && raw.konusma === canonical.konusma
  )
}

export const Route = createFileRoute('/hesabim/mesajlar')({
  validateSearch: (search) =>
    serializeMessagesRouteSearch(
      parseMessagesRouteSearch(search as Record<string, unknown>),
    ),
  beforeLoad: ({ location }) => {
    const rawSearch = location.search as Record<string, unknown>
    const canonicalSearch = serializeMessagesRouteSearch(
      parseMessagesRouteSearch(rawSearch),
    )

    if (isCanonicalMessagesSearch(rawSearch, canonicalSearch)) return

    throw redirect({
      to: '/hesabim/mesajlar',
      search: canonicalSearch as never,
      replace: true,
    })
  },
  loaderDeps: ({ search }) =>
    parseMessagesRouteSearch(search as Record<string, unknown>),
  loader: async ({ context, deps }) => {
    // Sunucuda sessionStorage yoktur → ofis sohbetleri boş döner; istemci
    // mount sonrası cache'i tazeleyip kendi birleşimini gösterir (aşağıda).
    const dataSource = createMessagesFixtureDataSource(withOfficeConversations())
    const prefetches: Array<() => Promise<unknown>> = [
      () =>
        context.queryClient.ensureInfiniteQueryData(
          conversationInfiniteQueryOptions(dataSource, {
            filter: 'all',
            query: '',
          }),
        ),
      ...(deps.conversationId
        ? [
            () =>
              context.queryClient.ensureInfiniteQueryData(
                threadInfiniteQueryOptions(
                  dataSource,
                  deps.conversationId as string,
                ),
              ),
          ]
        : []),
    ]

    await Promise.allSettled(
      prefetches.map((prefetch) => Promise.resolve().then(prefetch)),
    )
  },
  head: () => createPageHead('messages'),
  component: MessagesRoutePage,
})

/**
 * Koruma BURADA YOKTUR ve olmamalıdır: bu rota `/hesabim` layout rotasının
 * çocuğudur; oturum kontrolü orada `beforeLoad` guard'ı + `KorumaliSayfa`
 * ile bir kez yapılır. Bu dosya eskiden aynı kalıbın kendi kopyasını
 * taşıyordu (rules.md §14 ihlali) ve `hidrasyonTamam` bayrağı olmadığı için
 * aynı hidrasyon hatasını ikinci kez üretiyordu.
 */
function MessagesRoutePage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [dataSource] = useState<MessagesDataSource>(() =>
    createMessagesFixtureDataSource(withOfficeConversations()),
  )
  const queryClient = useQueryClient()
  // SSR prefetch'i ofis sohbetlerini bilemez (sessionStorage sunucuda yok);
  // hidrasyon bittikten SONRA cache tazelenir ki HTML uyuşmazlığı doğmadan
  // /ofisler'den yazılan mesajlar listede görünsün.
  useEffect(() => {
    if (officeThreadCount() > 0) {
      void queryClient.invalidateQueries({ queryKey: messagesQueryKeys.all })
    }
  }, [queryClient])
  const routeState = parseMessagesRouteSearch(search)
  const currentSearch = serializeMessagesRouteSearch(routeState)

  return (
    <MessagesWorkspace
      dataSource={dataSource}
      conversationId={routeState.conversationId}
      onConversationChange={(conversationId) => {
        const nextSearch = serializeMessagesRouteSearch({ conversationId })
        if (currentSearch.konusma === nextSearch.konusma) return

        void navigate({
          search: nextSearch as never,
          replace: conversationId === undefined,
        })
      }}
    />
  )
}
