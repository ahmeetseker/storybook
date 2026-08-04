import { useMemo } from 'react'
import { GlassAlert, GlassEmptyState, GlassTimeline } from '@repo/ui'

import { AccountActionLink } from '../components/AccountActionLink'
import sectionStyles from '../components/AccountSections.module.css'
import type { AccountActivity, AccountDashboardData } from '../domain/account-types'

import styles from './AccountPages.module.css'

type ActivityTone = AccountActivity['tone']

const TONE_ORDER: readonly ActivityTone[] = ['default', 'success', 'warning', 'danger']

/** Ton etiketleri GlassTimeline'ın ekran okuyucuya yazdığı metinlerle hizalıdır. */
const TONE_LABELS: Record<ActivityTone, string> = {
  default: 'Bilgi',
  success: 'Tamamlandı',
  warning: 'Dikkat gerekiyor',
  danger: 'Sorun',
}

const dayKeyFormatter = new Intl.DateTimeFormat('tr-TR', {
  timeZone: 'Europe/Istanbul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const dayHeadingFormatter = new Intl.DateTimeFormat('tr-TR', {
  timeZone: 'Europe/Istanbul',
  dateStyle: 'long',
})

const timeFormatter = new Intl.DateTimeFormat('tr-TR', {
  timeZone: 'Europe/Istanbul',
  hour: '2-digit',
  minute: '2-digit',
})

interface ActivityGroup {
  key: string
  heading: string
  items: AccountActivity[]
}

/**
 * Hareketleri güne göre kümeler. Sıra bozulmaz: gruplar ilk görüldükleri
 * sırayla, grup içi öğeler de geldikleri sırayla kalır — sıralama verinin
 * sorumluluğudur. Geçersiz tarihler tek bir "Tarihi belirsiz" grubunda toplanır.
 */
function groupByDay(activities: AccountActivity[]): ActivityGroup[] {
  const groups = new Map<string, ActivityGroup>()

  for (const activity of activities) {
    const date = new Date(activity.occurredAt)
    const valid = !Number.isNaN(date.getTime())
    const key = valid ? dayKeyFormatter.format(date) : 'unknown'
    const heading = valid ? dayHeadingFormatter.format(date) : 'Tarihi belirsiz'

    const existing = groups.get(key)
    if (existing) {
      existing.items.push(activity)
      continue
    }
    groups.set(key, { key, heading, items: [activity] })
  }

  return [...groups.values()]
}

/** Grup içindeki tek satırın zaman etiketi; tarih zaten grup başlığındadır. */
function timeLabel(activity: AccountActivity) {
  const date = new Date(activity.occurredAt)
  if (Number.isNaN(date.getTime())) return activity.dateLabel
  return timeFormatter.format(date)
}

export interface AccountActivityPageProps {
  /** Hesap panelinin normalize edilmiş verisi. */
  data: AccountDashboardData
}

/**
 * "Hesap hareketleri" alt sayfası: tüm hareketler tarihe göre gruplanmış bir
 * zaman çizelgesinde, tonlarına göre işaretli olarak listelenir. Ton yalnız
 * renkle taşınmaz — GlassTimeline her `default` dışı ton için durum metnini
 * ekran okuyucuya da yazar, özet karolarında ise ton adı görünür metindir.
 *
 * Sayfa yalnız içeriği döndürür — `main`/kapsayıcı kabuktan gelir.
 */
export function AccountActivityPage({ data }: AccountActivityPageProps) {
  const error = data.sectionErrors.find((item) => item.section === 'activity')
  const activities = data.activities

  const groups = useMemo(() => groupByDay(activities), [activities])

  const toneCounts = useMemo(() => {
    const result = {} as Record<ActivityTone, number>
    for (const tone of TONE_ORDER) {
      result[tone] = activities.filter((activity) => activity.tone === tone).length
    }
    return result
  }, [activities])

  return (
    <>
      <h1 className={styles.pageTitle}>Hesap hareketleri</h1>

      <section
        data-account-section="activity-summary"
        aria-labelledby="account-activity-summary-title"
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-activity-summary-title" className={sectionStyles.cardTitle}>
              Hareket özeti
            </h2>
            <p className={styles.subtitle}>
              Hesabınızda kaydedilen hareketlerin tona göre dağılımı.
            </p>
          </div>
          <p className={styles.meta}>{activities.length} kayıt</p>
        </div>

        <dl data-part="activity-stats" className={styles.statGrid}>
          {TONE_ORDER.map((tone) => (
            <div key={tone} data-part={`activity-stat-${tone}`} className={styles.statTile}>
              <dt className={styles.statLabel}>{TONE_LABELS[tone]}</dt>
              <dd className={styles.statValue}>{toneCounts[tone]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        data-account-section="activity"
        aria-labelledby="account-activity-title"
        data-part={error ? 'section-error' : undefined}
        className={sectionStyles.card}
      >
        <div className={sectionStyles.cardHead}>
          <div className={styles.headText}>
            <h2 id="account-activity-title" className={sectionStyles.cardTitle}>
              Zaman çizelgesi
            </h2>
            <p className={styles.subtitle}>
              Hareketler en yeniden eskiye, güne göre gruplanmış olarak listelenir.
            </p>
          </div>
        </div>

        {error ? (
          <GlassAlert severity="warning" title="Hesap hareketleri yüklenemedi">
            {error.message}
          </GlassAlert>
        ) : groups.length > 0 ? (
          <div data-part="activity-groups" className={styles.groupList}>
            {groups.map((group) => (
              <div key={group.key} data-part="activity-group" className={styles.group}>
                <div className={styles.groupHead}>
                  <h3 className={styles.groupHeading}>{group.heading}</h3>
                  <p className={styles.meta}>{group.items.length} hareket</p>
                </div>
                <GlassTimeline
                  className={styles.groupTimeline}
                  aria-label={`${group.heading} hareketleri`}
                  variant="line"
                  events={group.items.map((activity) => ({
                    id: activity.id,
                    date: timeLabel(activity),
                    title: activity.title,
                    description: activity.description,
                    tone: activity.tone,
                  }))}
                />
              </div>
            ))}
          </div>
        ) : (
          <div data-part="empty-state" className={styles.emptyState}>
            <GlassEmptyState
              size="sm"
              title="Henüz hesap hareketi yok"
              description="Giriş, ilan ve alarm hareketleriniz kaydedildikçe burada tarih sırasıyla listelenir."
              action={
                <AccountActionLink
                  action={{ kind: 'route', label: 'İlanları keşfedin', to: '/emlak' }}
                  variant="text"
                />
              }
            />
          </div>
        )}
      </section>
    </>
  )
}
