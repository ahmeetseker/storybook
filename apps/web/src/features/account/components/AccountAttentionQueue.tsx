import type { AccountAttentionItem } from '../domain/account-types'

import { AccountActionLink } from './AccountActionLink'

export interface AccountAttentionQueueProps {
  /** Kullanıcının önce görmesi gereken hesap gündemi. */
  items: AccountAttentionItem[]
}

function formatOccurredAt(occurredAt: string) {
  const date = new Date(occurredAt)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(date)
}

/** En çok üç maddelik, aksiyona yönlendiren hesap gündemi listesi. */
export function AccountAttentionQueue({ items }: AccountAttentionQueueProps) {
  const visibleItems = items.slice(0, 3)

  if (visibleItems.length === 0) return null

  return (
    <section data-account-section="attention" aria-labelledby="account-attention-title">
      <h2 id="account-attention-title">Gündem</h2>
      <ul data-part="attention-list">
        {visibleItems.map((item) => (
          <li key={item.id} data-part="attention-item">
            <h3 data-part="attention-title">{item.title}</h3>
            <p data-part="attention-reason">{item.reason}</p>
            {formatOccurredAt(item.occurredAt) ? (
              <time data-part="attention-time" dateTime={item.occurredAt}>
                {formatOccurredAt(item.occurredAt)}
              </time>
            ) : (
              <span data-part="attention-time">Tarih bilgisi kullanılamıyor</span>
            )}
            <p data-part="explanation-source">
              {item.explanationSource === 'ai' ? 'AI açıklaması' : 'Kural'}
            </p>
            <AccountActionLink action={item.action} variant="secondary" />
          </li>
        ))}
      </ul>
    </section>
  )
}
