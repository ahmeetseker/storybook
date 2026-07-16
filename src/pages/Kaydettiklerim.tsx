// Kaydettiklerim — /hesabim/kaydettiklerim
// GlassTabs (flat panel): Favori İlanlar grid'i + Kayıtlı Aramalar listesi.
import { useState, type CSSProperties } from 'react'
import { AccountShell } from './shared/shells'
import { ilanlar, kayitliAramalar } from './shared/data'
import { GlassTabs } from '../components/GlassTabs'
import { GlassListingCard } from '../components/GlassListingCard'
import { GlassIconButton } from '../components/GlassIconButton'

const noop = () => {}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

const listeSatiri: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--lg-space-4, 16px)',
  padding: '14px 0',
}

function FavoriIlanlar() {
  const favoriler = ilanlar.filter((i) => i.durum === 'yayinda')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 'var(--lg-space-4, 16px)' }}>
      {favoriler.map((ilan) => (
        <div key={ilan.id} style={{ position: 'relative' }}>
          <GlassListingCard
            material="flat"
            image={ilan.gorsel}
            title={ilan.baslik}
            price={ilan.fiyat}
            location={`${ilan.konum} · ${ilan.m2}`}
            onClick={noop}
            style={{ width: '100%' }}
          />
          <GlassIconButton
            label="Favorilerden kaldır"
            size="sm"
            onClick={noop}
            style={{ position: 'absolute', top: 10, right: 10 }}
          >
            <CloseIcon />
          </GlassIconButton>
        </div>
      ))}
    </div>
  )
}

function KayitliAramalar() {
  const [aktifler, setAktifler] = useState<Record<string, boolean>>(
    Object.fromEntries(kayitliAramalar.map((a) => [a.id, a.aktif])),
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {kayitliAramalar.map((arama, i) => {
        const aktif = aktifler[arama.id]
        return (
          <div key={arama.id} style={{ ...listeSatiri, borderTop: i === 0 ? 'none' : '1px solid var(--lg-hairline)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--lg-text-body, 15px)', fontWeight: 600 }}>{arama.ad}</span>
                {arama.yeni > 0 ? (
                  <span
                    style={{
                      padding: '2px 9px',
                      borderRadius: 999,
                      background: 'var(--lg-accent)',
                      color: 'var(--lg-accent-contrast)',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {arama.yeni} yeni
                  </span>
                ) : null}
              </span>
              <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>{arama.filtre}</span>
              <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)' }}>Bildirim sıklığı: {arama.siklik}</span>
            </div>
            <button
              type="button"
              aria-pressed={aktif}
              onClick={() => setAktifler((prev) => ({ ...prev, [arama.id]: !prev[arama.id] }))}
              style={{
                font: 'inherit',
                fontSize: 'var(--lg-text-footnote, 13px)',
                fontWeight: 600,
                padding: '7px 16px',
                borderRadius: 'var(--lg-radius-capsule, 999px)',
                border: aktif ? '1px solid var(--lg-success)' : '1px solid var(--lg-hairline)',
                background: aktif ? 'color-mix(in srgb, var(--lg-success) 14%, transparent)' : 'transparent',
                color: aktif ? 'var(--lg-success)' : 'var(--lg-label-secondary)',
                cursor: 'pointer',
                flex: 'none',
              }}
            >
              {aktif ? 'Aktif' : 'Pasif'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function Kaydettiklerim() {
  return (
    <AccountShell selected="kaydettiklerim" title="Kaydettiklerim">
      <GlassTabs
        material="flat"
        tabs={[
          { id: 'favoriler', label: 'Favori İlanlar', content: <FavoriIlanlar /> },
          { id: 'aramalar', label: 'Kayıtlı Aramalar', content: <KayitliAramalar /> },
        ]}
      />
    </AccountShell>
  )
}
