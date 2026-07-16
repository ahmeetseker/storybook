import type { HTMLAttributes, ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import styles from './GlassPriceHeader.module.css'

export interface GlassPriceHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string
  price: string
  /** Konum, tarih gibi ikincil bilgi satırı */
  meta?: string
  /** GlassBadge öğeleri */
  badges?: ReactNode
  /** Sağ üst aksiyon alanı (GlassIconButton öğeleri) */
  actions?: ReactNode
  /** Fiyat vurgu rengi */
  priceTint?: string
  tone?: 'light' | 'dark' | 'auto'
  material?: 'glass' | 'flat'
}

export function GlassPriceHeader({
  title,
  price,
  meta,
  badges,
  actions,
  priceTint,
  tone = 'auto',
  material,
  className,
  ...rest
}: GlassPriceHeaderProps) {
  return (
    <GlassSurface
      as="header"
      shape={20}
      tone={tone}
      material={material}
      thickness={0.45}
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className={styles.top}>
        <div className={styles.heading}>
          {badges ? <div className={styles.badges}>{badges}</div> : null}
          <h2 className={styles.title}>{title}</h2>
          {meta ? <p className={styles.meta}>{meta}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      <p className={styles.price} style={priceTint ? { color: priceTint } : undefined}>
        {price}
      </p>
    </GlassSurface>
  )
}
