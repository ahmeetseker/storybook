// /hesabim/ilanlar/{id} — tek ilanın yönetim sayfası (AccountShell içinde).
// Özet kartı, durum makinesi zaman çizelgesi, aksiyon butonları ve moderasyon notu; içerik flat.
import type { CSSProperties } from 'react'
import { GlassButton } from '../components/GlassButton'
import { AccountShell } from './shared/shells'
import { EidsBadge, StatusBadge } from './shared/forms'
import { durumEtiketi, durumTonu, ilanlar, type ArsaIlan, type IlanDurumu } from './shared/data'

const noop = () => {}

const card: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: 20,
  boxSizing: 'border-box',
}

/* ---------- Durum makinesi zaman çizelgesi ---------- */

const asamalar = ['Taslak', 'EİDS', 'Moderasyon', 'Yayında'] as const

/** İlan durumundan çizelge konumu: kaç aşama geçildi + aktif aşamanın tonu */
function asamaDurumu(durum: IlanDurumu): { gecilen: number; ton: 'success' | 'warning' | 'danger' } {
  switch (durum) {
    case 'taslak':
      return { gecilen: 1, ton: 'warning' }
    case 'eids-bekliyor':
      return { gecilen: 1, ton: 'warning' }
    case 'eids-basarisiz':
      return { gecilen: 1, ton: 'danger' }
    case 'eids-dogrulandi':
      return { gecilen: 2, ton: 'success' }
    case 'moderasyon-bekliyor':
    case 'degisiklik-istendi':
      return { gecilen: 2, ton: 'warning' }
    case 'reddedildi':
      return { gecilen: 2, ton: 'danger' }
    default:
      // yayinda, suresi-doldu, kaldirildi, satildi → tüm aşamalar geçildi
      return { gecilen: 4, ton: 'success' }
  }
}

function ZamanCizelgesi({ durum }: { durum: IlanDurumu }) {
  const { gecilen, ton } = asamaDurumu(durum)
  const tonRengi = ton === 'danger' ? 'var(--lg-danger)' : ton === 'warning' ? 'var(--lg-warning)' : 'var(--lg-success)'

  return (
    <section aria-label="İlan durumu zaman çizelgesi" style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>Yayın süreci</h2>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', alignItems: 'flex-start' }}>
        {asamalar.map((asama, i) => {
          const tamamlandi = i < gecilen
          const aktif = i === gecilen // sıradaki aşama
          const renk = tamamlandi ? 'var(--lg-success)' : aktif ? tonRengi : 'var(--lg-hairline)'
          return (
            <li key={asama} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
              {i > 0 ? (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: '50%',
                    width: '100%',
                    height: 2,
                    background: i < gecilen || (i === gecilen && aktif) ? 'var(--lg-success)' : 'var(--lg-hairline)',
                    zIndex: 0,
                  }}
                />
              ) : null}
              <span
                aria-hidden
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  background: tamamlandi ? 'var(--lg-success)' : aktif ? tonRengi : 'var(--lg-surface)',
                  color: tamamlandi || aktif ? '#fff' : 'var(--lg-label-secondary)',
                  border: tamamlandi || aktif ? 'none' : `2px solid ${renk}`,
                  boxSizing: 'border-box',
                }}
              >
                {tamamlandi ? '✓' : aktif ? '•' : ''}
              </span>
              <span
                style={{
                  fontSize: 'var(--lg-text-footnote, 13px)',
                  fontWeight: tamamlandi || aktif ? 600 : 400,
                  color: tamamlandi || aktif ? 'var(--lg-label)' : 'var(--lg-label-secondary)',
                  textAlign: 'center',
                }}
              >
                {asama}
              </span>
            </li>
          )
        })}
      </ol>
      <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
        Güncel durum: <strong style={{ color: 'var(--lg-label)' }}>{durumEtiketi[durum]}</strong>
      </span>
    </section>
  )
}

/* ---------- Sayfa ---------- */

export interface IlanYonetimiProps {
  ilan?: ArsaIlan
  /** "Değişiklik istendi" senaryosunda moderatör notu */
  moderasyonNotu?: string
}

function Istatistik({ deger, etiket }: { deger: number; etiket: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 90 }}>
      <strong style={{ fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
        {deger.toLocaleString('tr-TR')}
      </strong>
      <span style={{ fontSize: 'var(--lg-text-caption, 12px)', fontWeight: 500, color: 'var(--lg-label-secondary)' }}>{etiket}</span>
    </div>
  )
}

export function IlanYonetimi({ ilan = ilanlar[0], moderasyonNotu }: IlanYonetimiProps) {
  return (
    <AccountShell selected="ilanlar" title="İlan Yönetimi">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Özet kartı */}
        <section style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          <img
            src={ilan.gorsel.src}
            alt={ilan.gorsel.alt}
            style={{ width: 220, maxWidth: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 'var(--lg-radius-media, 14px)', flex: 'none' }}
          />
          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <StatusBadge tone={durumTonu[ilan.durum]}>{durumEtiketi[ilan.durum]}</StatusBadge>
              <EidsBadge dogrulandi={ilan.eidsDogrulandi} />
            </div>
            <h2 style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600, lineHeight: 1.35 }}>{ilan.baslik}</h2>
            <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
              İlan No: {ilan.id} · {ilan.konum} · {ilan.m2} · {ilan.tarih}
            </span>
            <strong style={{ fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, color: 'var(--lg-accent)', letterSpacing: '-0.022em' }}>
              {ilan.fiyat} <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', fontWeight: 400, color: 'var(--lg-label-secondary)' }}>({ilan.m2Fiyat})</span>
            </strong>
            <div style={{ display: 'flex', gap: 24, marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--lg-hairline)' }}>
              <Istatistik deger={ilan.goruntulenme} etiket="Görüntülenme" />
              <Istatistik deger={ilan.favori} etiket="Favori" />
              <Istatistik deger={ilan.mesaj} etiket="Mesaj" />
            </div>
          </div>
        </section>

        {/* Moderasyon notu */}
        {moderasyonNotu ? (
          <section
            role="alert"
            aria-label="Moderasyon notu"
            style={{
              borderRadius: 'var(--lg-radius-card, 20px)',
              border: '1px solid color-mix(in srgb, var(--lg-warning) 40%, transparent)',
              background: 'color-mix(in srgb, var(--lg-warning) 9%, var(--lg-surface))',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <strong style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600, color: 'var(--lg-warning)' }}>
              Değişiklik istendi
            </strong>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-body, 15px)', lineHeight: 1.55 }}>{moderasyonNotu}</p>
            <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
              Düzenlemeyi tamamlayıp yeniden gönderdiğinde ilan moderasyon kuyruğuna öncelikli alınır.
            </span>
          </section>
        ) : null}

        {/* Zaman çizelgesi */}
        <ZamanCizelgesi durum={ilan.durum} />

        {/* Aksiyonlar */}
        <section aria-label="İlan aksiyonları" style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <GlassButton size="sm" prominent onClick={noop}>
            Düzenle
          </GlassButton>
          <GlassButton size="sm" onClick={noop}>
            Önizle
          </GlassButton>
          <GlassButton size="sm" onClick={noop}>
            Süre Uzat
          </GlassButton>
          <GlassButton size="sm" onClick={noop}>
            Satıldı İşaretle
          </GlassButton>
          <GlassButton size="sm" tint="var(--lg-danger, #ff3b30)" onClick={noop}>
            Yayından Kaldır
          </GlassButton>
        </section>
      </div>
    </AccountShell>
  )
}
