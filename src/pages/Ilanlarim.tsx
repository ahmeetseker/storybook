// İlanlarım — /hesabim/ilanlar
// Üstte çalışan durum filtresi (chip satırı, GlassTabs değil); satırlar tablo benzeri flat kartlar.
import { useState, type CSSProperties } from 'react'
import { AccountShell } from './shared/shells'
import { EidsBadge, StatusBadge } from './shared/forms'
import { durumEtiketi, durumTonu, ilanlar, type IlanDurumu } from './shared/data'

const noop = () => {}

interface Filtre {
  id: string
  label: string
  /** null → tümü */
  durumlar: IlanDurumu[] | null
}

const filtreler: Filtre[] = [
  { id: 'tumu', label: 'Tümü', durumlar: null },
  { id: 'taslak', label: 'Taslak', durumlar: ['taslak'] },
  { id: 'dogrulama', label: 'Doğrulama', durumlar: ['eids-bekliyor', 'eids-basarisiz', 'eids-dogrulandi'] },
  { id: 'moderasyon', label: 'Moderasyonda', durumlar: ['moderasyon-bekliyor', 'degisiklik-istendi', 'reddedildi'] },
  { id: 'yayinda', label: 'Yayında', durumlar: ['yayinda'] },
  { id: 'suresi-dolan', label: 'Süresi Dolan', durumlar: ['suresi-doldu', 'kaldirildi'] },
  { id: 'satilan', label: 'Satılan', durumlar: ['satildi'] },
]

const satirAksiyon: CSSProperties = {
  font: 'inherit',
  fontSize: 'var(--lg-text-footnote, 13px)',
  fontWeight: 600,
  padding: '6px 14px',
  borderRadius: 'var(--lg-radius-capsule, 999px)',
  border: '1px solid var(--lg-hairline)',
  background: 'transparent',
  color: 'var(--lg-label)',
  cursor: 'pointer',
}

function IstatistikHucre({ deger, etiket }: { deger: number; etiket: string }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 72 }}>
      <span style={{ fontSize: 'var(--lg-text-body, 15px)', fontWeight: 600 }}>{deger}</span>
      <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)' }}>{etiket}</span>
    </span>
  )
}

export function Ilanlarim() {
  const [aktifFiltre, setAktifFiltre] = useState('tumu')
  const filtre = filtreler.find((f) => f.id === aktifFiltre) ?? filtreler[0]
  const gorunenler = filtre.durumlar ? ilanlar.filter((i) => filtre.durumlar!.includes(i.durum)) : ilanlar

  const sayi = (f: Filtre) => (f.durumlar ? ilanlar.filter((i) => f.durumlar!.includes(i.durum)).length : ilanlar.length)

  return (
    <AccountShell selected="ilanlar" title="İlanlarım">
      {/* Durum filtresi — chip satırı */}
      <div role="group" aria-label="Durum filtresi" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {filtreler.map((f) => {
          const aktif = f.id === aktifFiltre
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={aktif}
              onClick={() => setAktifFiltre(f.id)}
              style={{
                font: 'inherit',
                fontSize: 'var(--lg-text-footnote, 13px)',
                fontWeight: 600,
                padding: '7px 14px',
                borderRadius: 'var(--lg-radius-capsule, 999px)',
                border: aktif ? '1px solid var(--lg-accent)' : '1px solid var(--lg-hairline)',
                background: aktif ? 'var(--lg-accent)' : 'var(--lg-surface)',
                color: aktif ? 'var(--lg-accent-contrast)' : 'var(--lg-label)',
                cursor: 'pointer',
              }}
            >
              {f.label} · {sayi(f)}
            </button>
          )
        })}
      </div>

      {/* İlan satırları */}
      {gorunenler.length === 0 ? (
        <div
          style={{
            background: 'var(--lg-surface)',
            border: '1px solid var(--lg-hairline)',
            borderRadius: 'var(--lg-radius-card, 20px)',
            padding: 'var(--lg-space-7, 32px)',
            textAlign: 'center',
            color: 'var(--lg-label-secondary)',
            fontSize: 'var(--lg-text-body, 15px)',
          }}
        >
          Bu durumda ilanınız bulunmuyor.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lg-space-3, 12px)' }}>
          {gorunenler.map((ilan) => (
            <article
              key={ilan.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '112px minmax(0, 1fr) auto',
                gap: 'var(--lg-space-4, 16px)',
                alignItems: 'center',
                background: 'var(--lg-surface)',
                border: '1px solid var(--lg-hairline)',
                borderRadius: 'var(--lg-radius-card, 20px)',
                padding: 'var(--lg-space-3, 12px) var(--lg-space-4, 16px)',
                boxSizing: 'border-box',
              }}
            >
              <img
                src={ilan.gorsel.src}
                alt={ilan.gorsel.alt}
                width={112}
                height={84}
                style={{ width: 112, height: 84, objectFit: 'cover', borderRadius: 'var(--lg-radius-media, 14px)' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
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
                <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
                  {ilan.konum} · {ilan.m2} · {ilan.tarih} · İlan No: {ilan.id}
                </span>
                <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  <StatusBadge tone={durumTonu[ilan.durum]}>{durumEtiketi[ilan.durum]}</StatusBadge>
                  <EidsBadge dogrulandi={ilan.eidsDogrulandi} />
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                <span style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 700, color: 'var(--lg-accent)' }}>{ilan.fiyat}</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  <IstatistikHucre deger={ilan.goruntulenme} etiket="Görüntülenme" />
                  <IstatistikHucre deger={ilan.favori} etiket="Favori" />
                  <IstatistikHucre deger={ilan.mesaj} etiket="Mesaj" />
                </span>
                <span style={{ display: 'flex', gap: 8 }}>
                  <button type="button" style={satirAksiyon} onClick={noop}>Düzenle</button>
                  <button type="button" style={satirAksiyon} onClick={noop}>Yönet</button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountShell>
  )
}
