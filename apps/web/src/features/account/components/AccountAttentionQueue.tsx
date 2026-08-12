import type { AccountAttentionItem } from '../domain/account-types'

import { AccountActionLink } from './AccountActionLink'
import styles from './AccountSections.module.css'

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

/**
 * En çok üç maddelik gündem. Her satır sol kenarda önem şeridi, okuma
 * ölçüsünde bir gerekçe ve zamanın yanında açıklama kaynağı etiketi taşır;
 * aksiyon bağlantısı gövde metninin hemen sağında dikey ortalanır (kartın
 * uzak sağ kenarına savrulmaz), dar kartta alta iner.
 */
export function AccountAttentionQueue({ items }: AccountAttentionQueueProps) {
  const visibleItems = items.slice(0, 3)

  if (visibleItems.length === 0) return null

  return (
    <section
      data-account-section="attention"
      aria-labelledby="account-attention-title"
      className={styles.card}
    >
      <div className={styles.cardHead}>
        <div className={styles.cardHeadText}>
          <h2 id="account-attention-title" className={styles.cardTitle}>
            Gündem
          </h2>
        </div>
        <p className={styles.cardMeta}>{visibleItems.length} madde</p>
      </div>
      <ul data-part="attention-list" className={styles.attentionList}>
        {visibleItems.map((item) => {
          const occurredAtLabel = formatOccurredAt(item.occurredAt)

          return (
            <li
              key={item.id}
              data-part="attention-item"
              data-severity={item.severity}
              className={styles.attentionItem}
            >
              <div className={styles.attentionBody}>
                <h3 data-part="attention-title" className={styles.attentionTitle}>
                  {item.title}
                </h3>
                <p data-part="attention-reason" className={styles.attentionReason}>
                  {item.reason}
                </p>
                <div className={styles.attentionFooter}>
                  {occurredAtLabel ? (
                    <time
                      data-part="attention-time"
                      className={styles.attentionTime}
                      dateTime={item.occurredAt}
                    >
                      {occurredAtLabel}
                    </time>
                  ) : (
                    <span data-part="attention-time" className={styles.attentionTime}>
                      Tarih bilgisi kullanılamıyor
                    </span>
                  )}
                  <span
                    data-part="explanation-source"
                    data-source={item.explanationSource}
                    className={styles.sourceChip}
                  >
                    {item.explanationSource === 'ai' ? 'AI açıklaması' : 'Kural'}
                  </span>
                </div>
              </div>
              <AccountActionLink action={item.action} variant="secondary" />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
