import { useId } from 'react'
import type { HTMLAttributes } from 'react'
import styles from './GlassAiAgentActivity.module.css'

export type GlassAgentActivityStatus =
  | 'queued'
  | 'running'
  | 'done'
  | 'needsApproval'
  | 'rejected'
  | 'error'

export interface GlassAgentActivityEntry {
  /** React key + benzersiz kimlik */
  id: string
  /** İşlem başlığı */
  title: string
  /** İşlemin durumu */
  status: GlassAgentActivityStatus
  /** Kısa açıklama */
  detail?: string
  /** Kullanılan aracın adı */
  toolLabel?: string
  /** Zaman etiketi */
  timeLabel?: string
  /** Katlanır teknik ayrıntı */
  technical?: string
}

export interface GlassAiAgentActivityProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Ajan işlem akışı (kronolojik) */
  entries: GlassAgentActivityEntry[]
  /** Görünür başlık */
  title?: string
  /** `needsApproval` girişte izin ver tetikleyicisi */
  onApprove?: (id: string) => void
  /** `needsApproval` girişte reddet tetikleyicisi */
  onReject?: (id: string) => void
  /** Çalışan işlem varken "durdur" tetikleyicisi */
  onStop?: () => void
  /** Kalıcı yetki/gizlilik notu */
  permissionNote?: string
}

const STATUS_LABELS: Record<GlassAgentActivityStatus, string> = {
  queued: 'Sırada',
  running: 'Çalışıyor',
  done: 'Tamamlandı',
  needsApproval: 'İzin bekliyor',
  rejected: 'Reddedildi',
  error: 'Hata',
}

const DEFAULT_PERMISSION =
  'Ajan siz izin vermeden ilan yayınlamaz, mesaj göndermez veya teklif oluşturmaz.'

/**
 * AI ajan denetim kaydı: kullandığı araçlar ve karar bekleyen adımlar canlı bir
 * `role="log"` akışında gösterilir. Yüksek etkili adımlar (`needsApproval`) açık
 * bir izin kapısı sunar; kullanıcı "İzin ver"/"Reddet" demeden ajan ilerlemez.
 * Kalıcı yetki notu, ajanın izinsiz eylem yapmayacağını belirtir.
 */
export function GlassAiAgentActivity({
  entries,
  title = 'AI ajan etkinliği',
  onApprove,
  onReject,
  onStop,
  permissionNote = DEFAULT_PERMISSION,
  className,
  ...rest
}: GlassAiAgentActivityProps) {
  const titleId = useId()
  const active = entries.some((entry) => entry.status === 'running' || entry.status === 'queued')
  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    // rest önce yayılır; yönetilen attribute'lar caller tarafından ezilemez
    <section {...rest} aria-labelledby={titleId} aria-busy={active || undefined} className={classes}>
      <header className={styles.header}>
        <div>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <span className={styles.badge} aria-label="Yapay zekâ üretimi">
            ✦ AI
          </span>
        </div>
        {active && onStop ? (
          <button type="button" className={styles.stop} onClick={onStop}>
            Çalışmayı durdur
          </button>
        ) : null}
      </header>

      {entries.length ? (
        <ol className={styles.list} role="log" aria-live="polite" aria-label="Ajan işlem günlüğü">
          {entries.map((entry) => (
            <li key={entry.id} className={styles.item} data-status={entry.status}>
              <span className={styles.mark} data-status={entry.status} aria-hidden />
              <div className={styles.body}>
                <div className={styles.itemHead}>
                  <strong className={styles.itemTitle}>{entry.title}</strong>
                  <span className={styles.status} data-status={entry.status}>
                    {STATUS_LABELS[entry.status]}
                  </span>
                </div>
                {entry.detail ? <p className={styles.detail}>{entry.detail}</p> : null}
                {entry.toolLabel || entry.timeLabel ? (
                  <div className={styles.meta}>
                    {entry.toolLabel ? <span>Araç: {entry.toolLabel}</span> : null}
                    {entry.timeLabel ? <time>{entry.timeLabel}</time> : null}
                  </div>
                ) : null}
                {entry.technical ? (
                  <details className={styles.technical}>
                    <summary>Teknik detay</summary>
                    <p>{entry.technical}</p>
                  </details>
                ) : null}
              </div>
              {entry.status === 'needsApproval' && (onApprove || onReject) ? (
                <div className={styles.actions}>
                  {onReject ? (
                    <button type="button" className={styles.reject} onClick={() => onReject(entry.id)}>
                      Reddet
                    </button>
                  ) : null}
                  {onApprove ? (
                    <button type="button" className={styles.approve} onClick={() => onApprove(entry.id)}>
                      İzin ver
                    </button>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty} role="status">
          Henüz bir ajan işlemi başlatılmadı. İlk işlem başladığında araç çağrıları burada görünecek.
        </p>
      )}

      <p className={styles.permission}>{permissionNote}</p>
    </section>
  )
}
