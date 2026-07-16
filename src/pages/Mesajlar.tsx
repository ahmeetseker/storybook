// Mesajlar — /hesabim/mesajlar
// Solda konuşma listesi, sağda aktif sohbet. Telefon numaraları sistem mesajıyla maskelenir.
import { useState, type CSSProperties } from 'react'
import { AccountShell } from './shared/shells'
import { StatusBadge, TextInput } from './shared/forms'
import { durumEtiketi, durumTonu, konusmalar } from './shared/data'
import { GlassIconButton } from '../components/GlassIconButton'
import { GlassButton } from '../components/GlassButton'

const noop = () => {}

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
)

const panel: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  boxSizing: 'border-box',
  overflow: 'hidden',
}

interface Mesaj {
  id: string
  kimden: 'ben' | 'karsi' | 'sistem'
  metin: string
  zaman?: string
}

/** Konuşma id → mesaj akışı; her akış data.ts'teki sonMesaj ile biter. */
const mesajAkislari: Record<string, Mesaj[]> = {
  k1: [
    { id: 'm1', kimden: 'karsi', metin: 'Merhaba, İzmir Urla ilanınız hâlâ satılık mı?', zaman: '13:58' },
    { id: 'm2', kimden: 'ben', metin: 'Merhaba, evet ilan güncel. Sorularınızı memnuniyetle yanıtlarım.', zaman: '14:05' },
    { id: 'm3', kimden: 'sistem', metin: 'Güvenliğiniz için telefon numaraları maskelenir.' },
    { id: 'm4', kimden: 'karsi', metin: 'İmar durumu belgesini görebilir miyim? Dilerseniz 0 5** *** ** ** numaramdan da ulaşabilirsiniz.', zaman: '14:18' },
    { id: 'm5', kimden: 'ben', metin: 'Belge hazır; parselin EİDS doğrulaması da tamamlandı, ilan sayfasındaki rozetten görebilirsiniz.', zaman: '14:26' },
    { id: 'm6', kimden: 'karsi', metin: 'Tapu fotokopisini paylaşabilir misiniz?', zaman: '14:32' },
  ],
  k2: [
    { id: 'm1', kimden: 'karsi', metin: 'Selamlar, Antalya Kaş ilanınızla ilgileniyorum.', zaman: 'Dün' },
    { id: 'm2', kimden: 'ben', metin: 'Merhaba, hoş geldiniz. Arsa deniz manzaralı ve turizm imarlıdır.', zaman: 'Dün' },
    { id: 'm3', kimden: 'sistem', metin: 'Güvenliğiniz için telefon numaraları maskelenir.' },
    { id: 'm4', kimden: 'karsi', metin: 'Fiyat konusunda esneklik düşünüyor musunuz?', zaman: 'Dün' },
    { id: 'm5', kimden: 'karsi', metin: 'Pazarlık payı var mı acaba?', zaman: 'Dün' },
  ],
  k3: [
    { id: 'm1', kimden: 'karsi', metin: 'Merhaba, Urla ilanınız için yazıyorum.', zaman: 'Pzt' },
    { id: 'm2', kimden: 'ben', metin: 'Merhaba, buyrun.', zaman: 'Pzt' },
    { id: 'm3', kimden: 'sistem', metin: 'Güvenliğiniz için telefon numaraları maskelenir.' },
    { id: 'm4', kimden: 'karsi', metin: 'Parsel köşe konumda mı? Fotoğraflardan tam anlaşılmıyor.', zaman: 'Pzt' },
    { id: 'm5', kimden: 'ben', metin: 'Evet, köşe parsel; iki cephesi de yola bakıyor.', zaman: 'Pzt' },
    { id: 'm6', kimden: 'karsi', metin: 'Hafta sonu yerinde görebilir miyiz?', zaman: 'Pzt' },
  ],
}

function Balon({ mesaj }: { mesaj: Mesaj }) {
  if (mesaj.kimden === 'sistem') {
    return (
      <div style={{ alignSelf: 'center', maxWidth: '85%' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '5px 12px',
            borderRadius: 'var(--lg-radius-capsule, 999px)',
            border: '1px solid var(--lg-hairline)',
            fontSize: 12,
            color: 'var(--lg-label-secondary)',
            textAlign: 'center',
          }}
        >
          {mesaj.metin}
        </span>
      </div>
    )
  }
  const benden = mesaj.kimden === 'ben'
  return (
    <div style={{ alignSelf: benden ? 'flex-end' : 'flex-start', maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: benden ? 'flex-end' : 'flex-start' }}>
      <span
        style={{
          padding: '9px 14px',
          borderRadius: 16,
          borderBottomRightRadius: benden ? 6 : 16,
          borderBottomLeftRadius: benden ? 16 : 6,
          background: benden ? 'var(--lg-accent)' : 'var(--lg-bg)',
          color: benden ? 'var(--lg-accent-contrast)' : 'var(--lg-label)',
          border: benden ? 'none' : '1px solid var(--lg-hairline)',
          fontSize: 'var(--lg-text-body, 15px)',
          lineHeight: 1.45,
        }}
      >
        {mesaj.metin}
      </span>
      {mesaj.zaman ? <span style={{ fontSize: 11, color: 'var(--lg-label-secondary)' }}>{mesaj.zaman}</span> : null}
    </div>
  )
}

export function Mesajlar({ bos = false }: { bos?: boolean }) {
  const [seciliId, setSeciliId] = useState(konusmalar[0]?.id)
  const secili = konusmalar.find((k) => k.id === seciliId) ?? konusmalar[0]

  if (bos) {
    return (
      <AccountShell selected="mesajlar" title="Mesajlar">
        <div style={{ ...panel, padding: 'var(--lg-space-7, 32px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--lg-space-3, 12px)', textAlign: 'center' }}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--lg-label-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.6a8.38 8.38 0 0 1-.9-3.9A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
          </svg>
          <span style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>Henüz mesajınız yok</span>
          <span style={{ fontSize: 'var(--lg-text-body, 15px)', color: 'var(--lg-label-secondary)', maxWidth: 380 }}>
            İlanlarınızla ilgilenen alıcılar size buradan ulaşır. İlanınız yayına girdiğinde gelen mesajlar bu listede görünecek.
          </span>
          <GlassButton prominent onClick={noop} style={{ marginTop: 8 }}>Yeni İlan Ver</GlassButton>
        </div>
      </AccountShell>
    )
  }

  const akis = mesajAkislari[secili.id] ?? []

  return (
    <AccountShell selected="mesajlar" title="Mesajlar">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) minmax(0, 1fr)', gap: 'var(--lg-space-4, 16px)', alignItems: 'stretch' }}>
        {/* Konuşma listesi */}
        <div style={{ ...panel, display: 'flex', flexDirection: 'column' }} role="list" aria-label="Konuşmalar">
          {konusmalar.map((k, i) => {
            const aktif = k.id === secili.id
            return (
              <button
                key={k.id}
                type="button"
                role="listitem"
                aria-current={aktif || undefined}
                onClick={() => setSeciliId(k.id)}
                style={{
                  font: 'inherit',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '14px 16px',
                  border: 'none',
                  borderTop: i === 0 ? 'none' : '1px solid var(--lg-hairline)',
                  background: aktif ? 'color-mix(in srgb, var(--lg-accent) 10%, transparent)' : 'transparent',
                  boxShadow: aktif ? 'inset 3px 0 0 var(--lg-accent)' : 'none',
                  color: 'var(--lg-label)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 'var(--lg-text-body, 15px)', fontWeight: 600 }}>{k.kisi}</span>
                  <span style={{ fontSize: 12, color: 'var(--lg-label-secondary)', flex: 'none' }}>{k.zaman}</span>
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--lg-label-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {k.ilan.baslik}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 'var(--lg-text-footnote, 13px)',
                      fontWeight: k.okunmadi > 0 ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {k.sonMesaj}
                  </span>
                  {k.okunmadi > 0 ? (
                    <span
                      style={{
                        flex: 'none',
                        minWidth: 18,
                        height: 18,
                        borderRadius: 999,
                        background: 'var(--lg-accent)',
                        color: 'var(--lg-accent-contrast)',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'grid',
                        placeItems: 'center',
                        padding: '0 5px',
                      }}
                    >
                      {k.okunmadi}
                    </span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>

        {/* Aktif sohbet */}
        <div style={{ ...panel, display: 'flex', flexDirection: 'column', minHeight: 520 }}>
          {/* İlan mini kartı */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--lg-hairline)' }}>
            <img
              src={secili.ilan.gorsel.src}
              alt={secili.ilan.gorsel.alt}
              width={56}
              height={42}
              style={{ flex: 'none', width: 56, height: 42, objectFit: 'cover', borderRadius: 'var(--lg-radius-chip, 10px)' }}
            />
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {secili.ilan.baslik}
              </span>
              <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-accent)', fontWeight: 700 }}>{secili.ilan.fiyat}</span>
            </div>
            <StatusBadge tone={durumTonu[secili.ilan.durum]}>{durumEtiketi[secili.ilan.durum]}</StatusBadge>
          </div>

          {/* Mesaj balonları */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
            {akis.map((m) => (
              <Balon key={m.id} mesaj={m} />
            ))}
          </div>

          {/* Mesaj yazma alanı */}
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 12, borderTop: '1px solid var(--lg-hairline)' }}
          >
            <TextInput placeholder={`${secili.kisi} kişisine yanıt yazın…`} aria-label="Mesajınız" style={{ flex: 1 }} />
            <GlassIconButton label="Gönder" type="submit" onClick={noop}>
              <SendIcon />
            </GlassIconButton>
          </form>
        </div>
      </div>
    </AccountShell>
  )
}
