// /ilan-ver — public başlangıç sayfası: sihirbaz özeti, bilgi kartları, CTA'lar.
// Cam yalnız navigasyon/CTA katmanında; tüm içerik kartları flat (token tabanlı).
import type { CSSProperties, ReactNode } from 'react'
import { GlassButton } from '../components/GlassButton'
import { PublicShell } from './shared/shells'
import { sihirbazAdimlari } from './shared/data'

const noop = () => {}

const card: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: 20,
  boxSizing: 'border-box',
}

function BilgiKarti({ baslik, ikon, children }: { baslik: string; ikon: ReactNode; children: ReactNode }) {
  return (
    <article style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span
        aria-hidden
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--lg-radius-chip, 10px)',
          background: 'color-mix(in srgb, var(--lg-accent) 12%, transparent)',
          color: 'var(--lg-accent)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {ikon}
      </span>
      <h3 style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>{baslik}</h3>
      <div style={{ margin: 0, fontSize: 'var(--lg-text-body, 15px)', lineHeight: 1.55, color: 'var(--lg-label-secondary)' }}>
        {children}
      </div>
    </article>
  )
}

export function IlanVer() {
  return (
    <PublicShell title="ArsaPazar" cta={null}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Hero */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px 0 0', maxWidth: 720 }}>
          <span
            style={{
              alignSelf: 'flex-start',
              padding: '3px 10px',
              borderRadius: 999,
              border: '1px solid var(--lg-hairline)',
              background: 'var(--lg-surface)',
              fontSize: 'var(--lg-text-caption, 12px)',
              fontWeight: 500,
              color: 'var(--lg-label-secondary)',
            }}
          >
            Yalnızca EİDS doğrulamalı arsa ilanları
          </span>
          <h1 style={{ margin: 0, fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
            İlanını 13 adımda yayınla
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--lg-text-body, 15px)', lineHeight: 1.6, color: 'var(--lg-label-secondary)' }}>
            Taşınmaz numaranı gir, EİDS ile doğrula, fotoğraflarını yükle. Sihirbaz seni adım adım yönlendirir;
            yarım kalan ilan taslak olarak saklanır, kaldığın yerden devam edersin.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
            <GlassButton prominent size="lg" onClick={noop}>
              Sihirbaza Başla
            </GlassButton>
            <GlassButton size="lg" onClick={noop}>
              Giriş Yap
            </GlassButton>
          </div>
          <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
            İlan vermek için bireysel hesap yeterlidir; kurumsal hesaplar toplu ilan yükleyebilir.
          </span>
        </section>

        {/* Adım özeti */}
        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>Sihirbazdaki adımlar</h2>
          <ol
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 8,
            }}
          >
            {sihirbazAdimlari.map((adim, i) => (
              <li key={adim} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--lg-text-footnote, 13px)' }}>
                <span
                  aria-hidden
                  style={{
                    flex: 'none',
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: '1px solid var(--lg-hairline)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--lg-label-secondary)',
                  }}
                >
                  {i + 1}
                </span>
                {adim}
              </li>
            ))}
          </ol>
        </section>

        {/* Bilgi kartları */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <BilgiKarti baslik="EİDS doğrulama nedir?" ikon="✓">
            Elektronik İlan Doğrulama Sistemi, ilanındaki taşınmaz numarasını tapu kayıtlarıyla eşleştirir.
            Doğrulama tamamlanmadan ilan yayına alınmaz; doğrulanan ilanlar arama sonuçlarında
            "EİDS Doğrulandı" rozetiyle öne çıkar.
          </BilgiKarti>
          <BilgiKarti baslik="Gerekli belgeler" ikon="≡">
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Tapu senedindeki taşınmaz numarası</li>
              <li>Ada / parsel bilgisi</li>
              <li>Yetki belgesi (vekâleten veya emlak ofisi adına veriliyorsa)</li>
              <li>Güncel arsa fotoğrafları (en az 3 adet)</li>
            </ul>
          </BilgiKarti>
          <BilgiKarti baslik="Moderasyon süreci" ikon="⏱">
            Gönderilen ilan ortalama 4 iş saati içinde incelenir. Eksik bilgi varsa "Değişiklik istendi"
            notuyla sana geri döner; düzeltip yeniden gönderebilirsin. Onaylanan ilan 60 gün süreyle yayında kalır.
          </BilgiKarti>
        </section>
      </div>
    </PublicShell>
  )
}
