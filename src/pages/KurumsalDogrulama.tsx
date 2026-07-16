// /hesabim/kurumsal-dogrulama — kurumsal hesap başvuru akışı: durum zaman çizelgesi,
// yüklü belge listesi, eksik belge uyarısı ve düzeltme talebi. İçerik flat.
import type { CSSProperties } from 'react'
import { AccountShell } from './shared/shells'

const card: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: 20,
  boxSizing: 'border-box',
}

type AdimDurumu = 'tamam' | 'aktif' | 'bekliyor'

const adimlar: { baslik: string; detay: string; durum: AdimDurumu; tarih?: string }[] = [
  { baslik: 'Belgeler Yüklendi', detay: 'Yetki belgesi ve vergi levhası sisteme alındı.', durum: 'tamam', tarih: '10 Temmuz 2026' },
  { baslik: 'İncelemede', detay: 'Belgeleriniz moderasyon ekibi tarafından kontrol ediliyor.', durum: 'aktif', tarih: '11 Temmuz 2026' },
  { baslik: 'Onay', detay: 'Onay sonrası hesabınız "Kurumsal" rozetiyle işaretlenir.', durum: 'bekliyor' },
]

const adimRenk: Record<AdimDurumu, string> = {
  tamam: 'var(--lg-success)',
  aktif: 'var(--lg-warning)',
  bekliyor: 'var(--lg-label-secondary)',
}

const adimIkon: Record<AdimDurumu, string> = { tamam: '✓', aktif: '…', bekliyor: '•' }

const belgeler = [
  { ad: 'Yetki Belgesi.pdf', boyut: '1,2 MB', tarih: '10 Temmuz 2026' },
  { ad: 'Vergi Levhası.pdf', boyut: '640 KB', tarih: '10 Temmuz 2026' },
]

function ZamanCizelgesi() {
  return (
    <section style={card}>
      <h2 style={{ margin: '0 0 16px', fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>Başvuru Durumu</h2>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
        {adimlar.map((adim, i) => (
          <li key={adim.baslik} style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
              <span
                aria-hidden
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  border: `2px solid ${adimRenk[adim.durum]}`,
                  color: adim.durum === 'tamam' ? '#fff' : adimRenk[adim.durum],
                  background: adim.durum === 'tamam' ? 'var(--lg-success)' : 'var(--lg-surface)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {adimIkon[adim.durum]}
              </span>
              {i < adimlar.length - 1 ? (
                <span aria-hidden style={{ width: 2, flex: 1, minHeight: 24, background: adim.durum === 'tamam' ? 'var(--lg-success)' : 'var(--lg-hairline)' }} />
              ) : null}
            </div>
            <div style={{ paddingBottom: i < adimlar.length - 1 ? 20 : 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 15, fontWeight: 600, color: adim.durum === 'bekliyor' ? 'var(--lg-label-secondary)' : 'var(--lg-label)' }}>
                  {adim.baslik}
                  {adim.durum === 'aktif' ? ' — onay bekliyor' : ''}
                </strong>
                {adim.tarih ? <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)' }}>{adim.tarih}</span> : null}
              </div>
              <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>{adim.detay}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function BelgeListesi() {
  return (
    <section style={{ ...card, padding: 0, overflow: 'hidden' }}>
      <h2 style={{ margin: 0, padding: '16px 20px 12px', fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>Yüklü Belgeler</h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {belgeler.map((belge) => (
          <li key={belge.ad} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--lg-hairline)' }}>
            <span aria-hidden style={{ flex: 'none', width: 32, height: 32, borderRadius: 'var(--lg-radius-chip, 10px)', border: '1px solid var(--lg-hairline)', display: 'grid', placeItems: 'center', fontSize: 13, color: 'var(--lg-label-secondary)' }}>
              PDF
            </span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{belge.ad}</span>
              <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)' }}>{belge.boyut} · {belge.tarih}</span>
            </div>
            <span style={{ flex: 'none', color: 'var(--lg-success)', fontSize: 13, fontWeight: 700 }}>✓ Alındı</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function EksikBelgeUyarisi() {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        borderRadius: 'var(--lg-radius-media, 14px)',
        border: '1px solid var(--lg-warning)',
        background: 'color-mix(in srgb, var(--lg-warning) 8%, var(--lg-surface))',
      }}
    >
      <span aria-hidden style={{ color: 'var(--lg-warning)', fontWeight: 700 }}>⚠</span>
      <span style={{ flex: '1 1 260px', fontSize: 'var(--lg-text-footnote, 13px)', lineHeight: 1.5 }}>
        <strong style={{ fontWeight: 600 }}>Eksik belge:</strong> İmza sirküleri henüz yüklenmedi.
        Başvurunuzun sonuçlanması için gereklidir.
      </span>
      <button
        type="button"
        onClick={() => {}}
        style={{
          flex: 'none',
          minHeight: 'var(--lg-control-sm, 32px)',
          padding: '0 16px',
          borderRadius: 'var(--lg-radius-capsule, 999px)',
          border: '1px solid var(--lg-accent)',
          background: 'var(--lg-accent)',
          color: 'var(--lg-accent-contrast)',
          font: 'inherit',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Belge Yükle
      </button>
    </div>
  )
}

function DuzeltmeTalebiKutusu() {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        borderRadius: 'var(--lg-radius-media, 14px)',
        border: '1px solid var(--lg-danger)',
        background: 'color-mix(in srgb, var(--lg-danger) 8%, var(--lg-surface))',
      }}
    >
      <span aria-hidden style={{ color: 'var(--lg-danger)', fontWeight: 700 }}>✕</span>
      <span style={{ flex: '1 1 260px', fontSize: 'var(--lg-text-footnote, 13px)', lineHeight: 1.5 }}>
        <strong style={{ fontWeight: 600 }}>Düzeltme talebi:</strong> Yetki belgesi okunaksız —
        belgeyi taratıp yeniden yükleyin. Başvurunuz yeni belge gelene kadar bekletilir.
      </span>
      <button
        type="button"
        onClick={() => {}}
        style={{
          flex: 'none',
          minHeight: 'var(--lg-control-sm, 32px)',
          padding: '0 16px',
          borderRadius: 'var(--lg-radius-capsule, 999px)',
          border: '1px solid var(--lg-danger)',
          background: 'var(--lg-surface)',
          color: 'var(--lg-danger)',
          font: 'inherit',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Yeniden Yükle
      </button>
    </div>
  )
}

export function KurumsalDogrulama({ duzeltmeTalebi = false }: { duzeltmeTalebi?: boolean }) {
  return (
    <AccountShell selected="kurumsal" title="Kurumsal Doğrulama">
      {duzeltmeTalebi ? <DuzeltmeTalebiKutusu /> : <EksikBelgeUyarisi />}
      <ZamanCizelgesi />
      <BelgeListesi />
    </AccountShell>
  )
}
