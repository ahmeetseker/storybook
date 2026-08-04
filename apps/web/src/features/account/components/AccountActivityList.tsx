import { GlassAlert, GlassTimeline } from '@repo/ui'

import type { AccountActivity, AccountSectionError } from '../domain/account-types'

import styles from './AccountSections.module.css'

export interface AccountActivityListProps {
  /** En yeniden eskiye sıralanmış hesap hareketleri. */
  activities: AccountActivity[]
  /** Bu bölüme ait yerel yükleme hatası. */
  error?: AccountSectionError
}

/**
 * Son dört hesap hareketini rayları tonlanmış bir zaman çizelgesinde sunar.
 * Ton yalnız renkle taşınmaz: GlassTimeline her `default` dışı ton için
 * ekran okuyucuya durum metnini de yazar.
 */
export function AccountActivityList({ activities, error }: AccountActivityListProps) {
  const events = activities.slice(0, 4).map((activity) => ({
    id: activity.id,
    date: activity.dateLabel,
    title: activity.title,
    description: activity.description,
    tone: activity.tone,
  }))

  return (
    <section
      data-account-section="activity"
      aria-labelledby="account-activity-title"
      data-part={error ? 'section-error' : undefined}
      className={styles.card}
    >
      <div className={styles.cardHead}>
        <div className={styles.cardHeadText}>
          <h2 id="account-activity-title" className={styles.cardTitle}>
            Son etkinlik
          </h2>
        </div>
      </div>
      {error ? (
        <GlassAlert severity="warning" title="Etkinlikler yüklenemedi">
          {error.message}
        </GlassAlert>
      ) : (
        <GlassTimeline
          data-part="activity-timeline"
          events={events}
          variant="line"
          emptyState="Henüz etkinlik kaydı yok."
          aria-label="Son etkinlik"
        />
      )}
    </section>
  )
}
