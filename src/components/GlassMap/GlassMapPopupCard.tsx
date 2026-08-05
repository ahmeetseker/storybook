// Harita popup'ının gövdesi — iniş zincirinin son halkası. GlassMap yalnız
// kabuğu (konum, yön, kapatma düğmesi) çizer; ilanın nasıl özetleneceği
// tüketiciye aittir. Bu kart o özetin ortak biçimidir: her haritada aynı
// sıra — başlık, konum/oda, fiyat + durum, tek birincil eylem.
//
// İçerik katmanı FLAT: cam yok (bkz. GenelBakis.mdx katman modeli — popup
// zaten cam olmayan bir yüzeyin üstünde yaşar).
import type { ReactNode } from 'react'
import styles from './GlassMapPopupCard.module.css'
import type { GlassMapPinTone } from './GlassMap'

export interface GlassMapPopupCardProps {
  /** İlan başlığı — kartın tek h-seviyesi olmayan, görsel olarak baskın satırı */
  title: ReactNode
  /** İkincil satır: ilçe/il, oda sayısı, alan gibi ayırt edici bilgi */
  meta?: ReactNode
  /** Biçimlenmiş fiyat — tabular-nums ile hizalanır */
  price?: ReactNode
  /** Durum rozeti; tonu pin tonuyla aynı ölçekten okunur */
  status?: { label: ReactNode; tone?: GlassMapPinTone }
  /** Birincil eylemin metni. Varsayılan "Detayı aç" */
  actionLabel?: ReactNode
  /**
   * Eylem bir gezinme ise `href` verilir (bağlantı olarak render edilir —
   * yeni sekmede açılabilir, kopyalanabilir); yan etki ise `onAction`.
   * İkisi de verilirse `href` kazanır.
   */
  href?: string
  onAction?: () => void
}

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
)

export function GlassMapPopupCard({
  title,
  meta,
  price,
  status,
  actionLabel = 'Detayı aç',
  href,
  onAction,
}: GlassMapPopupCardProps) {
  const actionContent = (
    <>
      {actionLabel}
      <ArrowIcon />
    </>
  )
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      {meta ? <p className={styles.meta}>{meta}</p> : null}
      {price !== undefined || status ? (
        <div className={styles.row}>
          {price !== undefined ? <span className={styles.price}>{price}</span> : null}
          {status ? (
            <span className={styles.badge} data-tone={status.tone ?? 'accent'}>
              {status.label}
            </span>
          ) : null}
        </div>
      ) : null}
      {href ? (
        <a className={styles.action} href={href}>
          {actionContent}
        </a>
      ) : onAction ? (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionContent}
        </button>
      ) : null}
    </div>
  )
}
