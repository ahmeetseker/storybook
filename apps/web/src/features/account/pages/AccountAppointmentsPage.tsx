import { GlassBadge, GlassButton, GlassEmptyState } from '@repo/ui'

import type { Appointment } from '@/features/appointments'
import { cancelAppointment, useAppointments } from '@/features/appointments'

import { AccountActionLink } from '../components/AccountActionLink'
import sectionStyles from '../components/AccountSections.module.css'

import styles from './AccountPages.module.css'

const STATUS_LABELS: Record<Appointment['status'], string> = {
  pending: 'Onay bekliyor',
  confirmed: 'Onaylandı',
  cancelled: 'İptal edildi',
}

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })

/** '2026-08-14' → yerel Date; saat slot'tan ayrı gösterilir */
function parseDay(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function todayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * "Randevularım" alt sayfası: hesap panelinin fixture'lı `data` prop'unu
 * almaz — randevu sistemi ayrı bir özellik store'unda yaşar
 * (`@/features/appointments`), bu sayfa doğrudan ondan okur. Randevular
 * bugüne göre Yaklaşan/Geçmiş ikiye ayrılır; iptal edilenler tarihine
 * bakılmaksızın Geçmiş'e düşer — iptal geri alınamaz bir "artık aktif değil"
 * durumudur.
 */
export function AccountAppointmentsPage() {
  const appointments = useAppointments()
  const bugun = todayKey()
  // ISO gün anahtarları sözlüksel karşılaştırılabilir; ayrı tarih kütüphanesi gerekmez.
  const yaklasan = appointments.filter((item) => item.status !== 'cancelled' && item.date >= bugun)
  const gecmis = appointments.filter((item) => item.status === 'cancelled' || item.date < bugun)

  if (appointments.length === 0) {
    return (
      <>
        <h1 className={styles.pageTitle}>Randevularım</h1>
        <div data-part="empty-state" className={styles.emptyState}>
          <GlassEmptyState
            title="Henüz randevunuz yok"
            description="Ofisler sayfasından uygun bir gün ve saat seçerek görüşme talep edebilirsiniz."
            action={
              <AccountActionLink
                action={{ kind: 'route', label: 'Ofisleri keşfet', to: '/ofisler' }}
                variant="secondary"
              />
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Randevularım</h1>
      <AppointmentGroup title="Yaklaşan" items={yaklasan} cancellable />
      <AppointmentGroup title="Geçmiş" items={gecmis} />
    </>
  )
}

function AppointmentGroup({
  title,
  items,
  cancellable = false,
}: {
  title: string
  items: Appointment[]
  cancellable?: boolean
}) {
  if (items.length === 0) return null
  return (
    <section aria-label={title} className={sectionStyles.card}>
      <div className={sectionStyles.cardHead}>
        <div className={styles.headText}>
          <h2 className={sectionStyles.cardTitle}>{title}</h2>
        </div>
        <p className={styles.meta}>{items.length} randevu</p>
      </div>
      <ul className={styles.appointmentList}>
        {items.map((item) => (
          <li key={item.id} className={styles.appointmentRow}>
            <div>
              <strong>{item.officeName}</strong>
              <p className={styles.muted}>
                {dateFmt.format(parseDay(item.date))} · {item.slot} ·{' '}
                {item.type === 'office' ? 'Ofiste' : 'Video görüşme'}
              </p>
              {item.note ? <p className={styles.appointmentNote}>{item.note}</p> : null}
            </div>
            <div className={styles.appointmentActions}>
              <GlassBadge>{STATUS_LABELS[item.status]}</GlassBadge>
              {cancellable && item.status !== 'cancelled' ? (
                <GlassButton size="sm" onClick={() => cancelAppointment(item.id)}>
                  İptal et
                </GlassButton>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
