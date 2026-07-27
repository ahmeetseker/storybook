import { GlassAlert, GlassTimeline } from '@repo/ui'

import type { AccountActivity, AccountSectionError } from '../domain/account-types'

export interface AccountActivityListProps {
  /** En yeniden eskiye sıralanmış hesap hareketleri. */
  activities: AccountActivity[]
  /** Bu bölüme ait yerel yükleme hatası. */
  error?: AccountSectionError
}

/** Son dört hesap hareketini kompakt zaman çizelgesinde sunar. */
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
    >
      <h2 id="account-activity-title">Son etkinlik</h2>
      {error ? (
        <GlassAlert severity="warning" title="Etkinlikler yüklenemedi">
          {error.message}
        </GlassAlert>
      ) : (
        <GlassTimeline
          data-part="activity-timeline"
          events={events}
          variant="compact"
          emptyState="Henüz etkinlik kaydı yok."
          aria-label="Son etkinlik"
        />
      )}
    </section>
  )
}
