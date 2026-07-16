// /hesabim/bildirimler — bildirim listesi: tür etiketi, çalışan chip filtresi,
// okunmamış vurgusu ve "tümünü okundu işaretle". İçerik flat; cam yalnız kabukta.
import { useState, type CSSProperties } from 'react'
import { AccountShell } from './shared/shells'
import { bildirimler } from './shared/data'

type Bildirim = (typeof bildirimler)[number]
type FiltreId = 'tumu' | 'moderasyon' | 'mesaj' | 'eids' | 'alarm'

const filtreler: { id: FiltreId; label: string }[] = [
  { id: 'tumu', label: 'Tümü' },
  { id: 'moderasyon', label: 'İlan' },
  { id: 'mesaj', label: 'Mesaj' },
  { id: 'eids', label: 'EİDS' },
  { id: 'alarm', label: 'Alarm' },
]

/** Tür → etiket + renk (durum renkleri semantic token'lardan, vurgu accent) */
const turBilgi: Record<string, { etiket: string; renk: string; ikon: string }> = {
  moderasyon: { etiket: 'İlan', renk: 'var(--lg-warning)', ikon: '▤' },
  mesaj: { etiket: 'Mesaj', renk: 'var(--lg-label-secondary)', ikon: '✉' },
  eids: { etiket: 'EİDS', renk: 'var(--lg-success)', ikon: '✓' },
  alarm: { etiket: 'Alarm', renk: 'var(--lg-accent)', ikon: '◷' },
}

const card: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  overflow: 'hidden',
}

function Chip({ label, secili, onClick }: { label: string; secili: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={secili}
      style={{
        minHeight: 'var(--lg-control-sm, 32px)',
        padding: '0 14px',
        borderRadius: 'var(--lg-radius-capsule, 999px)',
        border: secili ? '1px solid var(--lg-accent)' : '1px solid var(--lg-hairline)',
        background: secili ? 'var(--lg-accent)' : 'var(--lg-surface)',
        color: secili ? 'var(--lg-accent-contrast)' : 'var(--lg-label)',
        font: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function BildirimSatiri({ bildirim, okunmadi, ilk }: { bildirim: Bildirim; okunmadi: boolean; ilk: boolean }) {
  const tur = turBilgi[bildirim.tur] ?? turBilgi.mesaj
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '14px 20px',
        borderTop: ilk ? 'none' : '1px solid var(--lg-hairline)',
        background: okunmadi ? 'color-mix(in srgb, var(--lg-accent) 7%, var(--lg-surface))' : 'transparent',
      }}
    >
      <span
        aria-hidden
        style={{
          flex: 'none',
          width: 32,
          height: 32,
          borderRadius: 'var(--lg-radius-chip, 10px)',
          border: '1px solid var(--lg-hairline)',
          display: 'grid',
          placeItems: 'center',
          color: tur.renk,
          fontSize: 14,
          background: 'var(--lg-surface)',
        }}
      >
        {tur.ikon}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: tur.renk, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{tur.etiket}</span>
          <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)' }}>{bildirim.zaman}</span>
          {okunmadi ? (
            <span aria-label="Okunmadı" style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--lg-accent)', flex: 'none' }} />
          ) : null}
        </div>
        <span style={{ fontSize: 'var(--lg-text-body, 15px)', fontWeight: okunmadi ? 600 : 400, lineHeight: 1.45 }}>{bildirim.metin}</span>
      </div>
    </li>
  )
}

export function Bildirimler() {
  const [filtre, setFiltre] = useState<FiltreId>('tumu')
  const [okunanlar, setOkunanlar] = useState<string[]>([])

  const gorunen = bildirimler.filter((b) => filtre === 'tumu' || b.tur === filtre)
  const okunmadiMi = (b: Bildirim) => b.okunmadi && !okunanlar.includes(b.id)
  const okunmamisVar = bildirimler.some(okunmadiMi)

  return (
    <AccountShell selected="bildirimler" title="Bildirimler">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {filtreler.map((f) => (
          <Chip key={f.id} label={f.label} secili={filtre === f.id} onClick={() => setFiltre(f.id)} />
        ))}
        <button
          type="button"
          disabled={!okunmamisVar}
          onClick={() => setOkunanlar(bildirimler.map((b) => b.id))}
          style={{
            marginLeft: 'auto',
            minHeight: 'var(--lg-control-sm, 32px)',
            padding: '0 14px',
            borderRadius: 'var(--lg-radius-capsule, 999px)',
            border: '1px solid var(--lg-hairline)',
            background: 'var(--lg-surface)',
            color: okunmamisVar ? 'var(--lg-accent)' : 'var(--lg-label-secondary)',
            font: 'inherit',
            fontSize: 13,
            fontWeight: 600,
            cursor: okunmamisVar ? 'pointer' : 'default',
          }}
        >
          Tümünü okundu işaretle
        </button>
      </div>

      <div style={card}>
        {gorunen.length === 0 ? (
          <p style={{ margin: 0, padding: '32px 20px', textAlign: 'center', fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
            Bu türde bildirim yok.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            {gorunen.map((b, i) => (
              <BildirimSatiri key={b.id} bildirim={b} okunmadi={okunmadiMi(b)} ilk={i === 0} />
            ))}
          </ul>
        )}
      </div>
    </AccountShell>
  )
}
