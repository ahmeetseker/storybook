import type { ReactNode } from 'react'

import styles from './EvidenceState.module.css'

/**
 * Durumun görsel tonu.
 *
 * `neutral` bilinçli olarak vardır: bir satırın durumu olumlu/olumsuz/eksik
 * üçlüsüne girmiyorsa renksiz nokta ile yazılır — uydurulmuş bir ton verilmez.
 */
export type EvidenceTone = 'positive' | 'negative' | 'unknown' | 'neutral'

export interface EvidenceStateProps {
  tone: EvidenceTone
  /**
   * Durumun kelimesi. Zorunludur: renk tek başına bilgi taşımaz (WCAG 1.4.1),
   * bu yüzden component kelimesiz bir durum işareti üretemez.
   */
  children: ReactNode
  /**
   * `inline` bandın akışındaki satırlar için (varsayılan), `chip` yalnız dar
   * kartlar için. Karar kolonu 340px'tir; orada işaret kapsül içinde durur.
   */
  variant?: 'inline' | 'chip'
  className?: string
}

/**
 * Bandın tek durum işareti — nokta + kelime.
 *
 * Daha önce aynı üç durum üç ayrı yerde üç ayrı geometriyle çiziliyordu:
 * defterde cümle içinde bir kelime, Belgeler'de ayrı bir blok, karar kartında
 * kapsül. Göz her bölümde işareti yeniden aramak zorunda kalıyordu. Artık tek
 * kaynak burasıdır; değişen yalnız `variant`tır.
 *
 * Kelime **tek bir elemanın doğrudan metin çocuğudur**: nokta `aria-hidden`
 * olduğu için kökün erişilebilir metni yalnız kelimedir ve ekran okuyucu ile
 * test sorgusu aynı tek düğümü görür.
 */
export function EvidenceState({
  tone,
  children,
  variant = 'inline',
  className,
}: EvidenceStateProps) {
  const classes = [styles.state, variant === 'chip' ? styles.chip : undefined, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} data-tone={tone}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  )
}
