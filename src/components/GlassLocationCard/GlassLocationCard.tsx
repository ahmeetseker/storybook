import type { HTMLAttributes } from 'react'
import { GlassSurface } from '../GlassSurface'
import { GlassButton } from '../GlassButton'
import styles from './GlassLocationCard.module.css'

export interface GlassLocationCardProps extends HTMLAttributes<HTMLElement> {
  address: string
  /** Ör. "Konum yaklaşıktır" gibi dipnot */
  note?: string
  /** "Haritada Aç" aksiyonu; verilmezse buton gösterilmez */
  onOpenMap?: () => void
  tone?: 'light' | 'dark' | 'auto'
  material?: 'glass' | 'flat'
}

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
)

export function GlassLocationCard({ address, note, onOpenMap, tone = 'auto', material, className, ...rest }: GlassLocationCardProps) {
  return (
    <GlassSurface
      as="section"
      shape={20}
      tone={tone}
      material={material}
      thickness={0.45}
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className={styles.map} aria-hidden>
        <span className={styles.pin}>
          <PinIcon />
        </span>
      </div>
      <div className={styles.info}>
        <p className={styles.address}>{address}</p>
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>
      {onOpenMap ? (
        <GlassButton size="sm" tone={tone} onClick={onOpenMap}>
          Haritada Aç
        </GlassButton>
      ) : null}
    </GlassSurface>
  )
}
