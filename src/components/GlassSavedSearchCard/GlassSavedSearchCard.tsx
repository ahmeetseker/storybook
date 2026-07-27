import type { HTMLAttributes } from 'react'
import { GlassButton } from '../GlassButton'
import { GlassSwitch } from '../GlassSwitch'
import styles from './GlassSavedSearchCard.module.css'

export interface GlassSavedSearchCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Kayıtlı aramanın adı */
  title: string
  /** Arama ölçütlerinin özet etiketleri */
  criteria: string[]
  /** Yeni eşleşme sayısı; >0 ise rozet gösterilir */
  newResultCount?: number
  /** Son çalıştırma etiketi (ör. "2 saat önce") */
  lastRunLabel?: string
  /** Bildirim sıklığı etiketi (ör. "Günlük") */
  frequencyLabel?: string
  /** Alarm açık mı — controlled */
  alertsEnabled?: boolean
  /** Alarm başlangıç değeri — uncontrolled */
  defaultAlertsEnabled?: boolean
  /** Alarm değişince çağrılır */
  onAlertsChange?: (enabled: boolean) => void
  /** Sonuçları açma tetikleyicisi; verilmezse buton yok */
  onOpen?: () => void
  /** Düzenleme tetikleyicisi; verilmezse buton yok */
  onEdit?: () => void
  /** Silme tetikleyicisi; verilmezse buton yok */
  onDelete?: () => void
  /** Başlığın heading seviyesi */
  headingAs?: 'h2' | 'h3' | 'h4'
}

/**
 * Kayıtlı arama / arama alarmı kartı. Kart bir `<article>`'dır (GlassListingCard'ın
 * "tümü tek button" hatasını tekrarlamaz); başlık gerçek bir heading'dir. Alarm
 * anahtarı controlled/uncontrolled deseni izler. Silme butonu bağlama duyarlı bir
 * erişilebilir ad taşır. Callback verilmeyen aksiyonlar için buton çizilmez.
 */
export function GlassSavedSearchCard({
  title,
  criteria,
  newResultCount = 0,
  lastRunLabel,
  frequencyLabel,
  alertsEnabled,
  defaultAlertsEnabled,
  onAlertsChange,
  onOpen,
  onEdit,
  onDelete,
  headingAs: Heading = 'h3',
  className,
  ...rest
}: GlassSavedSearchCardProps) {
  const hasNew = newResultCount > 0
  const showAlertSwitch =
    alertsEnabled !== undefined || defaultAlertsEnabled !== undefined || onAlertsChange !== undefined
  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    // rest önce yayılır; yönetilen className caller tarafından ezilemez
    <article {...rest} className={classes}>
      <header className={styles.header}>
        <div className={styles.headingBox}>
          <Heading className={styles.title}>{title}</Heading>
          {hasNew ? (
            <span className={styles.newBadge}>
              {newResultCount} yeni
              <span className={styles.srOnly}> eşleşme</span>
            </span>
          ) : null}
        </div>
        {showAlertSwitch ? (
          <GlassSwitch
            label="Arama alarmı"
            checked={alertsEnabled}
            defaultChecked={defaultAlertsEnabled}
            onChange={onAlertsChange}
          />
        ) : null}
      </header>

      {criteria.length ? (
        <ul className={styles.criteria} aria-label="Arama ölçütleri">
          {criteria.map((item) => (
            <li key={item} className={styles.chip}>
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {lastRunLabel || frequencyLabel ? (
        <p className={styles.meta}>
          {lastRunLabel ? <span>Son çalıştırma: {lastRunLabel}</span> : null}
          {lastRunLabel && frequencyLabel ? <span aria-hidden> · </span> : null}
          {frequencyLabel ? <span>Bildirim: {frequencyLabel}</span> : null}
        </p>
      ) : null}

      {onOpen || onEdit || onDelete ? (
        <footer className={styles.actions}>
          {onOpen ? (
            <GlassButton prominent size="sm" onClick={onOpen}>
              Sonuçları aç
            </GlassButton>
          ) : null}
          {onEdit ? (
            <GlassButton size="sm" onClick={onEdit}>
              Düzenle
            </GlassButton>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className={styles.quiet}
              onClick={onDelete}
              aria-label={`${title} aramasını sil`}
            >
              Sil
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  )
}
