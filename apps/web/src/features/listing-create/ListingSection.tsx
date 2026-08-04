import type { ReactNode } from 'react'
import styles from './ListingCreateWorkspace.module.css'

export interface ListingStepIntroProps {
  /** Odak hedefi: adım değişiminde workspace bu id'ye odaklanır. */
  headingId: string
  stepIndex: number
  stepCount: number
  title: string
  description: string
  /** Adıma özel tek satırlık uyarı/koşul rozeti. */
  note?: ReactNode
}

/**
 * Adım başlığı — sayfadaki tek `h1`. Adım numarası ve zorunluluk notu
 * başlığın etrafındaki meta satırında durur; başlığın kendisi tekrar etmez.
 */
export function ListingStepIntro({
  headingId,
  stepIndex,
  stepCount,
  title,
  description,
  note,
}: ListingStepIntroProps) {
  return (
    <header className={styles.stepIntro}>
      <div className={styles.stepIntroMeta}>
        <span className={styles.stepCounter}>
          Adım {stepIndex}/{stepCount}
        </span>
        {note ? <span className={styles.stepNote}>{note}</span> : null}
      </div>
      <h1 id={headingId} className={styles.stepTitle} tabIndex={-1}>
        {title}
      </h1>
      <p className={styles.stepDescription}>{description}</p>
    </header>
  )
}

export interface ListingGroupProps {
  /** Başlık id'si `${id}-group-title` olur; kart bu başlıkla etiketlenir. */
  id: string
  title: string
  description?: string
  /** Grup içindeki alanların tamamı zorunlu mu, isteğe bağlı mı. */
  requirement?: 'required' | 'optional'
  /** Başlık satırının sağındaki durum/sayaç alanı. */
  meta?: ReactNode
  children: ReactNode
}

/**
 * Alan grubu kartı — bir adım, tek odaklı gruplara bölünür. Kart FLAT'tır
 * (cam yok) ve `--lg-surface` kademesinde durur; içindeki kutular `--lg-bg`
 * kademesine iner. Hesap ekranındaki kart diliyle aynıdır.
 */
export function ListingGroup({
  id,
  title,
  description,
  requirement,
  meta,
  children,
}: ListingGroupProps) {
  return (
    <section className={styles.group} aria-labelledby={`${id}-group-title`}>
      <header className={styles.groupHead}>
        <div className={styles.groupHeadText}>
          <h2 id={`${id}-group-title`} className={styles.groupTitle}>
            {title}
          </h2>
          {description ? (
            <p className={styles.groupDescription}>{description}</p>
          ) : null}
        </div>
        {meta ?? null}
        {requirement ? (
          <span className={styles.groupBadge} data-requirement={requirement}>
            {requirement === 'required' ? 'Zorunlu' : 'İsteğe bağlı'}
          </span>
        ) : null}
      </header>
      <div className={styles.groupBody}>{children}</div>
    </section>
  )
}
