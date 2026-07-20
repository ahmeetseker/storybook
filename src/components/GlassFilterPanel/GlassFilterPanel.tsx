import type { HTMLAttributes, ReactNode } from 'react'
import styles from './GlassFilterPanel.module.css'

export interface GlassFilterPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Panelin erişilebilir adı (complementary landmark `aria-label`'i) */
  label?: string
  /** Görünür başlık; verilmezse `label` başlık olarak kullanılır */
  title?: ReactNode
  /** Sonuç sayısı — verilirse `aria-live="polite"` ile duyurulan özet satırı çizilir */
  resultCount?: number
  /** Sonuç metnini biçimlendirir; varsayılan `${n} sonuç` */
  resultLabel?: (count: number) => string
  /** Sıfırlama tetikleyicisi; verilmezse buton render edilmez (false affordance yok) */
  onReset?: () => void
  /** Sıfırlama butonunun erişilebilir metni */
  resetLabel?: string
  /** Filtre kontrolleri (checkbox, chip, slider...) */
  children?: ReactNode
  /** Panel altı slot (ör. "Uygula" butonu) */
  footer?: ReactNode
  /** Yüzey biçimi: içerik katmanı düz (`flat`) varsayılan; `glass` yalnız gerçek chrome bağlamı */
  material?: 'flat' | 'glass'
}

const defaultResultLabel = (count: number) => `${count} sonuç`

/**
 * Arama daraltma / filtre paneli — adlandırılmış `complementary` landmark.
 * Ekran okuyucu kullanıcıları "Filtreler" bölgesine doğrudan atlayabilir.
 * Sonuç sayısı `aria-live="polite"` ile duyurulur; filtre değişince güncel sonuç
 * sesli okunur. Sıfırlama yalnız `onReset` verildiğinde görünür.
 */
export function GlassFilterPanel({
  label = 'Filtreler',
  title,
  resultCount,
  resultLabel = defaultResultLabel,
  onReset,
  resetLabel = 'Filtreleri sıfırla',
  children,
  footer,
  material = 'flat',
  className,
  ...rest
}: GlassFilterPanelProps) {
  const heading = title ?? label
  const classes = [styles.root, material === 'glass' ? styles.glass : styles.flat, className]
    .filter(Boolean)
    .join(' ')

  return (
    // rest önce yayılır; yönetilen aria-label/className caller tarafından ezilemez
    <aside {...rest} aria-label={label} className={classes}>
      <div className={styles.header}>
        <div className={styles.headingBox}>
          <h2 className={styles.title}>{heading}</h2>
          {resultCount !== undefined ? (
            <p className={styles.result} aria-live="polite">
              {resultLabel(resultCount)}
            </p>
          ) : null}
        </div>
        {onReset ? (
          <button type="button" className={styles.reset} onClick={onReset}>
            {resetLabel}
          </button>
        ) : null}
      </div>
      {children ? <div className={styles.body}>{children}</div> : null}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </aside>
  )
}
