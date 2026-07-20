import { useId } from 'react'
import type { HTMLAttributes } from 'react'
import styles from './GlassAiEvidenceList.module.css'

/** AI cevabını destekleyen kaynağın türü. */
export type GlassAiEvidenceSource = 'official' | 'listing' | 'market' | 'document' | 'user'

export interface GlassAiEvidenceItem {
  /** React key + benzersiz kimlik */
  id: string
  /** Kaynağın başlığı */
  title: string
  /** Kaynak türü — görünür etiketle gösterilir */
  sourceType: GlassAiEvidenceSource
  /** Kaynağın doğrulanma durumu */
  verified?: boolean
  /** İlgi/uygunluk yüzdesi (0-100, clamp) */
  relevance?: number
  /** Kısa alıntı/bağlam */
  excerpt?: string
  /** Verilirse kaynak gerçek bir `<a>` olarak açılır */
  href?: string
  /** Verilirse kaynak `<button>` olarak açılır (href yoksa) */
  onOpen?: (id: string) => void
}

export interface GlassAiEvidenceListProps extends HTMLAttributes<HTMLElement> {
  /** Kaynak/dayanak listesi */
  evidence: GlassAiEvidenceItem[]
  /** Bölüm başlığı */
  title?: string
  /** Liste boşken gösterilen güvenli mesaj */
  emptyMessage?: string
  /** Alıntıları gizleyen kompakt biçim */
  compact?: boolean
}

const SOURCE_LABELS: Record<GlassAiEvidenceSource, string> = {
  official: 'Resmî kayıt',
  listing: 'İlan verisi',
  market: 'Piyasa verisi',
  document: 'Belge',
  user: 'Kullanıcı içeriği',
}

const DEFAULT_EMPTY =
  'Bu cevap için gösterilebilir bir kaynak bulunamadı. Karar vermeden önce bilgileri bağımsız olarak doğrulayın.'

function clampRelevance(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.round(Math.min(Math.max(value, 0), 100))
}

/**
 * AI cevaplarının kaynak/dayanak (citation) listesi — AI şeffaflık katmanının
 * çekirdeği. Her kaynak numaralandırılır; türü, doğrulanma durumu ve ilgi oranı
 * renk dışında metinle de iletilir. Kaynak yoksa otomatik bir eylem tetiklemeden
 * "önce doğrulayın" güvenli mesajı gösterilir (alert DEĞİL — sakin bilgilendirme).
 */
export function GlassAiEvidenceList({
  evidence,
  title = 'Kaynaklar',
  emptyMessage = DEFAULT_EMPTY,
  compact = false,
  className,
  ...rest
}: GlassAiEvidenceListProps) {
  const titleId = useId()
  const classes = [styles.root, compact ? styles.compact : '', className].filter(Boolean).join(' ')

  return (
    // rest önce yayılır; yönetilen aria-labelledby/className caller tarafından ezilemez
    <section {...rest} aria-labelledby={titleId} className={classes}>
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
        <span className={styles.badge} aria-label="Yapay zekâ üretimi">
          ✦ AI
        </span>
        <span className={styles.count}>{evidence.length} kaynak</span>
      </div>

      {evidence.length ? (
        <ol className={styles.list}>
          {evidence.map((item, index) => {
            const relevance = clampRelevance(item.relevance)
            const body = (
              <>
                <span className={styles.index} aria-hidden>
                  {index + 1}
                </span>
                <span className={styles.body}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.meta}>{SOURCE_LABELS[item.sourceType]}</span>
                  {item.excerpt && !compact ? <span className={styles.excerpt}>{item.excerpt}</span> : null}
                </span>
                <span className={styles.state}>
                  <span className={styles.verify} data-verified={item.verified ? 'true' : 'false'}>
                    {item.verified ? 'Doğrulandı' : 'Doğrulanmalı'}
                  </span>
                  {relevance !== null ? <span className={styles.relevance}>İlgi %{relevance}</span> : null}
                </span>
              </>
            )

            return (
              <li key={item.id}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={styles.item}
                    onClick={item.onOpen ? () => item.onOpen?.(item.id) : undefined}
                  >
                    {body}
                  </a>
                ) : item.onOpen ? (
                  <button type="button" className={styles.item} onClick={() => item.onOpen?.(item.id)}>
                    {body}
                  </button>
                ) : (
                  <div className={styles.item}>{body}</div>
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        <p className={styles.empty} role="note">
          {emptyMessage}
        </p>
      )}
    </section>
  )
}
