import { useId, type HTMLAttributes, type LiHTMLAttributes, type MouseEventHandler, type ReactNode } from 'react'
import styles from './GlassList.module.css'

export interface GlassListProps extends HTMLAttributes<HTMLDivElement> {
  /** Grup başlığı — footnote, uppercase, secondary (iOS Settings kalıbı) */
  header?: string
  /** Grup altı açıklama metni */
  footer?: string
  /** true (default): radius'lu inset kart görünümü; false: kenardan kenara */
  inset?: boolean
  /** GlassListItem'lar */
  children: ReactNode
}

export function GlassList({ header, footer, inset = true, className, children, ...rest }: GlassListProps) {
  const rawId = useId()
  const headerId = `lg-list-${rawId.replace(/[^a-zA-Z0-9-]/g, '')}`

  return (
    <div
      className={[styles.root, inset ? styles.inset : styles.plain, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {header ? (
        <span id={headerId} className={styles.header}>
          {header}
        </span>
      ) : null}
      {/* list-style: none Safari'de liste semantiğini düşürür → role="list" açıkça verilir */}
      <ul role="list" className={styles.list} aria-labelledby={header ? headerId : undefined}>
        {children}
      </ul>
      {footer ? <span className={styles.footer}>{footer}</span> : null}
    </div>
  )
}

export interface GlassListItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title' | 'onClick'> {
  /** Solda ikon/emoji/görsel — dekoratiftir (aria-hidden) */
  icon?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  /** Sağda ikincil değer (ör. "2019", "İstanbul") */
  detail?: ReactNode
  /** Sağda › işareti — satırın bir sayfaya götürdüğünü ima eder */
  chevron?: boolean
  /** Verilirse satır tam genişlik <button> olur */
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  /** Yıkıcı aksiyon: başlık --lg-danger olur */
  destructive?: boolean
}

export function GlassListItem({
  icon,
  title,
  subtitle,
  detail,
  chevron = false,
  onClick,
  disabled = false,
  destructive = false,
  className,
  ...rest
}: GlassListItemProps) {
  const rowClasses = [styles.row, destructive ? styles.destructive : ''].filter(Boolean).join(' ')

  const inner = (
    <>
      {icon ? (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      ) : null}
      {/* Ayraç .inner'ın üstündedir → ikon hizasından inset başlar (iOS kalıbı) */}
      <span className={styles.inner}>
        <span className={styles.body}>
          <span className={styles.title}>{title}</span>
          {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
        </span>
        {detail ? <span className={styles.detail}>{detail}</span> : null}
        {chevron ? <span className={styles.chevron} aria-hidden /> : null}
      </span>
    </>
  )

  return (
    <li className={[styles.item, className].filter(Boolean).join(' ')} {...rest}>
      {onClick ? (
        // Basınç animasyonu bilinçli yok (useGlassPress kullanma) —
        // liste satırında hafif zemin değişimi yeterli, jöle abartı olur.
        <button type="button" className={rowClasses} onClick={onClick} disabled={disabled}>
          {inner}
        </button>
      ) : (
        <div className={[rowClasses, disabled ? styles.rowDisabled : ''].filter(Boolean).join(' ')}>{inner}</div>
      )}
    </li>
  )
}
