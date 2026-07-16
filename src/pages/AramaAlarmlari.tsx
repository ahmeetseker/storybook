// /hesabim/arama-alarmlari — kayıtlı arama alarmları: sıklık seçimi, aktif/pasif durum,
// yeni ilan rozeti ve silme. Cam yalnız kabukta; içerik flat kartlardan oluşur.
import type { CSSProperties } from 'react'
import { AccountShell } from './shared/shells'
import { Select } from './shared/forms'
import { kayitliAramalar } from './shared/data'

type Alarm = (typeof kayitliAramalar)[number]

const card: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: 20,
  boxSizing: 'border-box',
}

const silBtn: CSSProperties = {
  minHeight: 'var(--lg-control-sm, 32px)',
  padding: '0 14px',
  borderRadius: 'var(--lg-radius-capsule, 999px)',
  border: '1px solid var(--lg-hairline)',
  background: 'var(--lg-surface)',
  color: 'var(--lg-danger)',
  font: 'inherit',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

function BilgiSeridi() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 'var(--lg-radius-media, 14px)',
        border: '1px solid var(--lg-hairline)',
        background: 'var(--lg-surface)',
        fontSize: 'var(--lg-text-footnote, 13px)',
        color: 'var(--lg-label-secondary)',
      }}
    >
      <span aria-hidden style={{ color: 'var(--lg-accent)', fontWeight: 700 }}>ⓘ</span>
      <span>
        Yeni alarm açmak için arama sonuçları sayfasında filtrelerinizi ayarlayıp{' '}
        <strong style={{ color: 'var(--lg-label)', fontWeight: 600 }}>“Aramayı Kaydet”</strong> deyin —
        alarm buradan yönetilir.
      </span>
    </div>
  )
}

function AlarmKarti({ alarm }: { alarm: Alarm }) {
  return (
    <div style={{ ...card, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
      <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6, opacity: alarm.aktif ? 1 : 0.55 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>{alarm.ad}</strong>
          {alarm.yeni > 0 ? (
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 'var(--lg-radius-capsule, 999px)',
                background: 'var(--lg-accent)',
                color: 'var(--lg-accent-contrast)',
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              {alarm.yeni} yeni ilan
            </span>
          ) : null}
          {!alarm.aktif ? (
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 'var(--lg-radius-capsule, 999px)',
                border: '1px solid var(--lg-hairline)',
                color: 'var(--lg-label-secondary)',
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Pasif
            </span>
          ) : null}
        </div>
        <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>{alarm.filtre}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--lg-label-secondary)' }}>
          Bildirim sıklığı
          <Select defaultValue={alarm.siklik} disabled={!alarm.aktif} style={{ width: 130 }} aria-label={`${alarm.ad} alarmı bildirim sıklığı`}>
            <option>Anlık</option>
            <option>Günlük</option>
            <option>Haftalık</option>
          </Select>
        </label>
        <button type="button" style={silBtn} onClick={() => {}}>
          Sil
        </button>
      </div>
    </div>
  )
}

function BosDurum() {
  return (
    <div style={{ ...card, textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg aria-hidden width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="var(--lg-label-secondary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2a4 4 0 0 0-4 4v2.5L2.8 11h10.4L12 8.5V6a4 4 0 0 0-4-4Z M6.5 13a1.5 1.5 0 0 0 3 0" />
      </svg>
      <strong style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>Henüz arama alarmınız yok</strong>
      <p style={{ margin: 0, maxWidth: 420, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
        Aradığınız kriterlerde yeni ilan yayınlandığında haber almak için arama sonuçları
        sayfasından aramanızı kaydedin.
      </p>
    </div>
  )
}

export function AramaAlarmlari({ alarmlar = kayitliAramalar }: { alarmlar?: Alarm[] }) {
  return (
    <AccountShell selected="alarmlar" title="Arama Alarmları">
      <BilgiSeridi />
      {alarmlar.length === 0 ? (
        <BosDurum />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {alarmlar.map((alarm) => (
            <AlarmKarti key={alarm.id} alarm={alarm} />
          ))}
        </div>
      )}
    </AccountShell>
  )
}
