import type { HTMLAttributes } from 'react'
import styles from './GlassRibbon.module.css'

export interface GlassRibbonProps extends HTMLAttributes<HTMLSpanElement> {
  /** Şerit üzerinde görünen kısa etiket; sm boyutta ~11 karakteri aşmamalıdır (bkz. rules.md §5). */
  label: string
  /** Ekran okuyucuya okunan, görsel olarak gizli ek bağlam; örneğin `Temsili görsel`. */
  note?: string
  /** Renk ekseni: `accent` doğrulama/vitrin vurgusu, `neutral` bilgilendirme. */
  tone?: 'accent' | 'neutral'
  /** Köşe ölçeği: `sm` liste kartları, `md` geniş vitrin yüzeyleri. */
  size?: 'xs' | 'sm' | 'md'
}

/**
 * Kart köşesini 45° çaprazlama saran ince vitrin şeridi. Konumlandırılmış
 * (`position: relative`) ve `overflow: hidden` bir medya kabının sol üst
 * köşesine yerleştirilir; köşe yuvarlaklığı ve kırpma kaptan gelir.
 * Etkileşimsizdir — durum bildirir, aksiyon taşımaz.
 */
export function GlassRibbon({ label, note, tone = 'accent', size = 'sm', className, ...rest }: GlassRibbonProps) {
  return (
    <span
      className={[styles.holder, styles[tone], styles[size], className].filter(Boolean).join(' ')}
      {...rest}
    >
      <span className={styles.band}>{label}</span>
      {note ? <span className={styles.note}>{note}</span> : null}
    </span>
  )
}
