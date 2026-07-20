import { useId } from 'react'
import type { HTMLAttributes } from 'react'
import styles from './GlassAiRiskReview.module.css'

export type GlassAiRiskSeverity = 'low' | 'medium' | 'high' | 'blocking'
export type GlassAiRiskStatus = 'open' | 'resolved' | 'accepted'
export type GlassAiRiskDecision = 'pending' | 'approved' | 'rejected'

export interface GlassAiRiskItem {
  /** React key + benzersiz kimlik */
  id: string
  /** Riskin başlığı */
  title: string
  /** Risk açıklaması */
  description?: string
  /** Önem derecesi */
  severity: GlassAiRiskSeverity
  /** Riskin durumu */
  status?: GlassAiRiskStatus
  /** Bağlı dayanakların özet etiketi (ör. "3 dayanak") */
  evidenceLabel?: string
}

export interface GlassAiRiskReviewProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** İncelenecek riskler */
  items: GlassAiRiskItem[]
  /** İnsan karar durumu */
  decision?: GlassAiRiskDecision
  /** Kararı veren kişi */
  reviewer?: string
  /** Onay tetikleyicisi; verilmezse buton yok */
  onApprove?: () => void
  /** Red tetikleyicisi; verilmezse buton yok */
  onReject?: () => void
  /** Bir riski çözüldü/detay için işaretleme */
  onItemToggle?: (id: string) => void
  /** Görünür başlık */
  title?: string
  /** Bölümün erişilebilir adı (title verilmezse) */
  label?: string
}

const SEVERITY_LABELS: Record<GlassAiRiskSeverity, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  blocking: 'Engelleyici',
}

const STATUS_LABELS: Record<GlassAiRiskStatus, string> = {
  open: 'Açık',
  resolved: 'Çözüldü',
  accepted: 'Kabul edildi',
}

const DECISION_LABELS: Record<GlassAiRiskDecision, string> = {
  pending: 'Onay bekliyor',
  approved: 'İncelendi ve onaylandı',
  rejected: 'Reddedildi',
}

/**
 * AI risk/moderasyon incelemesi + insan karar kapısı. AI karar vermez, yalnız
 * riskleri önceliklendirir; nihai onay insana bırakılır. Açık "Yüksek" veya
 * "Engelleyici" risk varken onay butonu kilitlenir ve nedeni görünür metinle
 * açıklanır — böylece ağır riskler görmezden gelinerek onaylanamaz.
 */
export function GlassAiRiskReview({
  items,
  decision = 'pending',
  reviewer,
  onApprove,
  onReject,
  onItemToggle,
  title = 'Risk incelemesi',
  label,
  className,
  ...rest
}: GlassAiRiskReviewProps) {
  const titleId = useId()
  const openItems = items.filter((item) => (item.status ?? 'open') === 'open')
  const severeOpen = openItems.filter((item) => item.severity === 'high' || item.severity === 'blocking')
  const approveLocked = severeOpen.length > 0

  const classes = [styles.root, className].filter(Boolean).join(' ')

  return (
    // rest önce yayılır; yönetilen attribute'lar caller tarafından ezilemez
    <section
      {...rest}
      aria-labelledby={titleId}
      aria-label={label}
      data-decision={decision}
      className={classes}
    >
      <header className={styles.header}>
        <div>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.summary}>
            {openItems.length} açık risk · {severeOpen.length} yüksek/engelleyici
          </p>
        </div>
        <span className={styles.badge} aria-label="Yapay zekâ üretimi">
          ✦ AI
        </span>
      </header>

      {items.length ? (
        <ul className={styles.list}>
          {items.map((item) => {
            const status = item.status ?? 'open'
            return (
              <li key={item.id} className={styles.item} data-severity={item.severity} data-status={status}>
                <div className={styles.itemHead}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <span className={styles.severity} data-severity={item.severity}>
                    {SEVERITY_LABELS[item.severity]}
                  </span>
                  <span className={styles.status} data-status={status}>
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                {item.description ? <p className={styles.itemBody}>{item.description}</p> : null}
                <div className={styles.itemFoot}>
                  {item.evidenceLabel ? <span className={styles.evidence}>{item.evidenceLabel}</span> : null}
                  {onItemToggle && status === 'open' ? (
                    <button type="button" className={styles.itemAction} onClick={() => onItemToggle(item.id)}>
                      Çözüldü işaretle
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className={styles.empty} role="note">
          İncelenecek risk bulunamadı. Yine de resmî kayıtları kontrol edin.
        </p>
      )}

      <footer className={styles.decision}>
        <div className={styles.decisionInfo}>
          <span className={styles.decisionLabel}>İnsan kararı</span>
          <strong className={styles.decisionValue}>{DECISION_LABELS[decision]}</strong>
          {reviewer ? <span className={styles.reviewer}>İnceleyen: {reviewer}</span> : null}
        </div>

        {decision === 'pending' && (onApprove || onReject) ? (
          <div className={styles.actions}>
            {onReject ? (
              <button type="button" className={styles.reject} onClick={onReject}>
                Reddet
              </button>
            ) : null}
            {onApprove ? (
              <button
                type="button"
                className={styles.approve}
                onClick={onApprove}
                disabled={approveLocked}
                aria-describedby={approveLocked ? `${titleId}-lock` : undefined}
              >
                İncelemeyi onayla
              </button>
            ) : null}
          </div>
        ) : (
          <span className={styles.decisionBadge} data-decision={decision} role="status">
            {decision === 'pending' ? 'Bekliyor' : decision === 'approved' ? 'Onaylandı' : 'Reddedildi'}
          </span>
        )}
      </footer>

      {decision === 'pending' && onApprove && approveLocked ? (
        <p id={`${titleId}-lock`} className={styles.lockNote} role="status">
          {severeOpen.length} ağır risk açıkken onaylanamaz. Önce riskleri çözün veya kabul edin.
        </p>
      ) : null}
    </section>
  )
}
