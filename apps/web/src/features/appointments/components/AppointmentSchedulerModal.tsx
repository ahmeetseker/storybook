import { useMemo, useState } from 'react'
import {
  GlassButton,
  GlassChip,
  GlassDatePicker,
  GlassModal,
  GlassSegmentedControl,
  GlassTextarea,
} from '@repo/ui'
import type { Appointment, AppointmentType } from '../domain/appointment-types'
import {
  firstAvailableDay,
  officeAvailability,
  toDateKey,
} from '../data/appointment-availability'
import { createAppointment } from '../data/appointment-store'
import styles from './AppointmentSchedulerModal.module.css'

export interface AppointmentSchedulerModalProps {
  /** null → modal kapalı. Ofis değişince seçim sıfırdan kurulur (key ile). */
  office: { id: string; name: string; responseMinutes: number } | null
  onClose(): void
  onScheduled?(appointment: Appointment): void
}

const TYPE_OPTIONS = [
  { value: 'office', label: 'Ofiste' },
  { value: 'video', label: 'Video görüşme' },
]

/** Bu eşikten hızlı yanıtlayan ofisin talebi mock akışta kendiliğinden onaylanır */
const AUTO_CONFIRM_RESPONSE_MINUTES = 10

const summaryFmt = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
})

export function AppointmentSchedulerModal({ office, onClose, onScheduled }: AppointmentSchedulerModalProps) {
  if (!office) return null
  // Ofis değiştiğinde iç durum sıfırlansın diye içerik ayrı bileşende, key'li.
  return <SchedulerContent key={office.id} office={office} onClose={onClose} onScheduled={onScheduled} />
}

function SchedulerContent({ office, onClose, onScheduled }: {
  office: NonNullable<AppointmentSchedulerModalProps['office']>
  onClose(): void
  onScheduled?(appointment: Appointment): void
}) {
  const today = useMemo(() => new Date(), [])
  const maxDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 30)
    return d
  }, [today])
  const [date, setDate] = useState<Date | null>(() => firstAvailableDay(office.id, today)?.date ?? null)
  const [slot, setSlot] = useState<string | null>(null)
  const [type, setType] = useState<AppointmentType>('office')
  const [note, setNote] = useState('')

  const slots = date ? officeAvailability(office.id, date) : []
  // Task 1'in officeAvailability sözleşmesi gereği hafta içi gün asla tümüyle
  // dolu görünmez (en az bir müsait saat garanti) — `slots` boşsa (hafta
  // sonu, ofis kapalı) bu "dolu gün" dalı hiç tetiklenmemeli; aksi halde
  // "Bu gün dolu" ve "Bu gün ofis kapalı" mesajları hafta sonu için birlikte
  // render olur ve birbiriyle çelişir.
  const nextOpen = date && slots.length > 0 && !slots.some((s) => s.available)
    ? firstAvailableDay(office.id, date)
    : undefined

  const summary = date && slot
    ? `${summaryFmt.format(date)} ${slot} · ${type === 'office' ? 'Ofiste' : 'Video görüşme'} · ${office.name}`
    : 'Gün ve saat seçin.'

  const submit = () => {
    if (!date || !slot) return
    const appointment = createAppointment({
      officeId: office.id,
      officeName: office.name,
      date: toDateKey(date),
      slot,
      type,
      note: note.trim() || undefined,
      autoConfirm: office.responseMinutes <= AUTO_CONFIRM_RESPONSE_MINUTES,
    })
    onScheduled?.(appointment)
    onClose()
  }

  return (
    <GlassModal
      open
      onClose={onClose}
      title={`Görüşme planla · ${office.name}`}
      description="Uygun bir gün ve saat dilimi seçin; talebiniz ofise iletilecek."
      size="lg"
      footer={
        <div className={styles.footer}>
          <p className={styles.summary}>{summary}</p>
          <div className={styles.footerActions}>
            <GlassButton onClick={onClose}>Vazgeç</GlassButton>
            <GlassButton prominent disabled={!date || !slot} onClick={submit}>
              Randevu talep et
            </GlassButton>
          </div>
        </div>
      }
    >
      <div className={styles.panels}>
        <div className={styles.datePanel}>
          <GlassDatePicker
            value={date}
            onChange={(next) => {
              setDate(next)
              setSlot(null)
            }}
            min={today}
            max={maxDate}
            placeholder="Gün seç"
          />
          {nextOpen ? (
            <p className={styles.fullDayHint}>
              Bu gün dolu; ilk uygun gün {summaryFmt.format(nextOpen.date)}.
            </p>
          ) : null}
        </div>
        <div className={styles.detailPanel}>
          <div role="group" aria-label="Saat dilimi" className={styles.slotGrid}>
            {slots.length === 0 ? (
              <p className={styles.slotEmpty}>Bu gün ofis kapalı; hafta içi bir gün seçin.</p>
            ) : (
              slots.map((item) => (
                <GlassChip
                  key={item.time}
                  selected={slot === item.time}
                  onSelectedChange={item.available ? (next) => setSlot(next ? item.time : null) : undefined}
                  aria-disabled={item.available ? undefined : true}
                  className={item.available ? undefined : styles.slotFull}
                >
                  {item.time}
                </GlassChip>
              ))
            )}
          </div>
          <GlassSegmentedControl
            options={TYPE_OPTIONS}
            value={type}
            onChange={(next) => setType(next as AppointmentType)}
            variant="track"
            label="Görüşme türü"
          />
          <GlassTextarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            minRows={2}
            placeholder="Not (isteğe bağlı): hangi ilan ya da bölge için görüşmek istiyorsunuz?"
            aria-label="Görüşme notu"
          />
        </div>
      </div>
    </GlassModal>
  )
}
