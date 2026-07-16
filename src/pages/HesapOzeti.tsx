// Hesap Özeti — /hesabim
// Cam yalnız kabuğun navigasyonunda (sidebar) ve aksiyon butonlarında; içerik flat.
import type { CSSProperties } from 'react'
import { AccountShell } from './shared/shells'
import { StatusBadge } from './shared/forms'
import { bildirimler, durumEtiketi, durumTonu, ilanlar, kayitliAramalar, konusmalar } from './shared/data'
import { GlassButton } from '../components/GlassButton'

const noop = () => {}

const card: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: 'var(--lg-space-4, 16px)',
  boxSizing: 'border-box',
}

const sectionTitle: CSSProperties = {
  margin: 0,
  fontSize: 'var(--lg-text-headline, 17px)',
  fontWeight: 600,
  letterSpacing: '-0.02em',
}

function StatCard({ label, value, tint }: { label: string; value: number; tint?: string }) {
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>{label}</span>
      <span style={{ fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em', color: tint ?? 'var(--lg-label)' }}>
        {value}
      </span>
    </div>
  )
}

export function HesapOzeti() {
  const yayindaSayisi = ilanlar.filter((i) => i.durum === 'yayinda').length
  const moderasyondaSayisi = ilanlar.filter((i) => i.durum === 'moderasyon-bekliyor').length
  const okunmamisMesaj = konusmalar.reduce((toplam, k) => toplam + k.okunmadi, 0)
  const aktifAlarm = kayitliAramalar.filter((a) => a.aktif).length
  const sonIlanlar = ilanlar.slice(0, 3)
  const sonBildirimler = bildirimler.slice(0, 3)

  return (
    <AccountShell selected="ozet" title="Hesap Özeti">
      {/* Hızlı aksiyonlar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--lg-space-3, 12px)' }}>
        <GlassButton prominent onClick={noop}>Yeni İlan Ver</GlassButton>
        <GlassButton onClick={noop}>İlanlarımı Yönet</GlassButton>
        <GlassButton onClick={noop}>Mesajlara Git</GlassButton>
      </div>

      {/* İstatistik kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--lg-space-4, 16px)' }}>
        <StatCard label="Yayında" value={yayindaSayisi} tint="var(--lg-success)" />
        <StatCard label="Moderasyonda" value={moderasyondaSayisi} tint="var(--lg-warning)" />
        <StatCard label="Okunmamış mesaj" value={okunmamisMesaj} tint="var(--lg-accent)" />
        <StatCard label="Aktif alarm" value={aktifAlarm} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--lg-space-4, 16px)', alignItems: 'start' }}>
        {/* Son ilanlar */}
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--lg-space-3, 12px)' }}>
          <h2 style={sectionTitle}>Son ilanlarınız</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sonIlanlar.map((ilan, i) => (
              <div
                key={ilan.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--lg-space-3, 12px)',
                  padding: '10px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--lg-hairline)',
                }}
              >
                <img
                  src={ilan.gorsel.src}
                  alt={ilan.gorsel.alt}
                  width={56}
                  height={42}
                  style={{ flex: 'none', width: 56, height: 42, objectFit: 'cover', borderRadius: 'var(--lg-radius-chip, 10px)' }}
                />
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  <span
                    style={{
                      fontSize: 'var(--lg-text-body, 15px)',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ilan.baslik}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge tone={durumTonu[ilan.durum]}>{durumEtiketi[ilan.durum]}</StatusBadge>
                    <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)' }}>{ilan.goruntulenme} görüntülenme</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Son bildirimler */}
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 'var(--lg-space-3, 12px)' }}>
          <h2 style={sectionTitle}>Son bildirimler</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sonBildirimler.map((b, i) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--lg-hairline)',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: 'none',
                    width: 8,
                    height: 8,
                    marginTop: 6,
                    borderRadius: 999,
                    background: b.okunmadi ? 'var(--lg-accent)' : 'var(--lg-hairline)',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', fontWeight: b.okunmadi ? 600 : 400, lineHeight: 1.45 }}>
                    {b.metin}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)' }}>{b.zaman}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AccountShell>
  )
}
