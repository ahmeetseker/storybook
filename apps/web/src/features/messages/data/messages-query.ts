import { infiniteQueryOptions, type InfiniteData } from '@tanstack/react-query'

import type {
  ConversationFilter,
  ConversationPage,
  MarketplaceMessage,
  MessagePage,
  MessagesDataSource,
} from '../domain/message-types'
import { normalizeMessageSearch } from './message-fixtures'

const CONVERSATION_PAGE_SIZE = 20
const THREAD_PAGE_SIZE = 30

export const messagesQueryKeys = {
  all: ['messages'] as const,
  conversations: (input: { filter: ConversationFilter; query: string }) =>
    [...messagesQueryKeys.all, 'conversations', input.filter, normalizeMessageSearch(input.query)] as const,
  thread: (conversationId: string) =>
    [...messagesQueryKeys.all, 'thread', conversationId] as const,
}

type ConversationQueryKey = ReturnType<typeof messagesQueryKeys.conversations>
type ThreadQueryKey = ReturnType<typeof messagesQueryKeys.thread>
type Cursor = string | undefined

export function conversationInfiniteQueryOptions(
  dataSource: MessagesDataSource,
  input: { filter: ConversationFilter; query: string },
) {
  const query = normalizeMessageSearch(input.query)
  return infiniteQueryOptions<
    ConversationPage,
    Error,
    InfiniteData<ConversationPage, Cursor>,
    ConversationQueryKey,
    Cursor
  >({
    queryKey: messagesQueryKeys.conversations({ ...input, query }),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      dataSource.listConversations(
        { filter: input.filter, query, cursor: pageParam, limit: CONVERSATION_PAGE_SIZE },
        { signal },
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    maxPages: 5,
  })
}

export function threadInfiniteQueryOptions(
  dataSource: MessagesDataSource,
  conversationId: string,
) {
  return infiniteQueryOptions<
    MessagePage,
    Error,
    InfiniteData<MessagePage, Cursor>,
    ThreadQueryKey,
    Cursor
  >({
    queryKey: messagesQueryKeys.thread(conversationId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      dataSource.listMessages(
        { conversationId, before: pageParam, limit: THREAD_PAGE_SIZE },
        { signal },
      ),
    getNextPageParam: () => undefined,
    getPreviousPageParam: (firstPage) => firstPage.nextCursor,
    maxPages: 8,
  })
}

export function flattenConversationPages(data: InfiniteData<ConversationPage>) {
  return data.pages.flatMap((page) => page.items)
}

export function flattenMessagePages(data: InfiniteData<MessagePage>) {
  return data.pages
    .flatMap((page) => page.items)
    .sort((left: MarketplaceMessage, right: MarketplaceMessage) =>
      left.sentAt.localeCompare(right.sentAt) || (left.sequence ?? 0) - (right.sequence ?? 0),
    )
}
