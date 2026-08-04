/* oxlint-disable react/only-export-components -- TanStack file routes export Route beside route-local components. */
import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createPageHead } from '@/config/routes'
import { useAuthSession, useKorumaliRota } from '@/features/auth'
import {
  MessagesWorkspace,
  createMessagesFixtureDataSource,
  type MessagesDataSource,
} from '@/features/messages'
import {
  conversationInfiniteQueryOptions,
  threadInfiniteQueryOptions,
} from '@/features/messages/data/messages-query'
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
    const dataSource = createMessagesFixtureDataSource()
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

function MessagesRoutePage() {
  useKorumaliRota()
  const { girisYapildi } = useAuthSession()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [dataSource] = useState<MessagesDataSource>(
    createMessagesFixtureDataSource,
  )
  const routeState = parseMessagesRouteSearch(search)
  const currentSearch = serializeMessagesRouteSearch(routeState)

  if (!girisYapildi) return null

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
