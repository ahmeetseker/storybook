// /hesap-dogrula — e-posta doğrulama bağlantısına tıklanınca açılan sayfa.
// Üç durum (doğrulanıyor → başarılı / süresi dolmuş) tek component'te useState ile;
// "doğrulanıyor" kısa bir bekleme sonrası başarıya geçer, süresi dolmuşta yeniden
// gönder CTA'sı akışı baştan başlatır.
import { useEffect, useState, type CSSProperties } from 'react'
import { GlassButton } from '../components/GlassButton'
import { PublicShell } from './shared/shells'

export type DogrulamaDurumu = 'dogrulaniyor' | 'basarili' | 'suresi-doldu'

const kart: CSSProperties = {
  width: '100%',
  maxWidth: 420,
  boxSizing: 'border-box',
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: 'var(--lg-space-6, 24px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: 16,
}

const baslikStil: CSSProperties = {
  margin: 0,
  fontSize: 'var(--lg-text-title, 22px)',
  fontWeight: 700,
  letterSpacing: '-0.022em',
}

const metinStil: CSSProperties = {
  margin: 0,
  fontSize: 'var(--lg-text-body, 15px)',
  color: 'var(--lg-label-secondary)',
  lineHeight: 1.5,
}

function DurumRozeti({ arkaplan, isaret }: { arkaplan: string; isaret: string }) {
  return (
    <span
      aria-hidden
      style={{
        width: 48,
        height: 48,
        borderRadius: 999,
        background: arkaplan,
        color: '#fff',
        fontSize: 24,
        fontWeight: 700,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {isaret}
    </span>
  )
}

export function HesapDogrula({ baslangicDurumu = 'dogrulaniyor' }: { baslangicDurumu?: DogrulamaDurumu }) {
  const [durum, setDurum] = useState<DogrulamaDurumu>(baslangicDurumu)

  // Demo: doğrulama isteği ~2 sn sürer, ardından başarıya geçer.
  useEffect(() => {
    if (durum !== 'dogrulaniyor') return
    const zamanlayici = setTimeout(() => setDurum('basarili'), 2200)
    return () => clearTimeout(zamanlayici)
  }, [durum])

  return (
    <PublicShell>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        {durum === 'dogrulaniyor' ? (
          <div style={kart} aria-busy="true">
            <h1 style={baslikStil}>Hesabın doğrulanıyor…</h1>
            <p style={metinStil}>
              E-posta bağlantındaki doğrulama kodu denetleniyor. Bu işlem birkaç saniye sürebilir; lütfen sayfayı kapatma.
            </p>
          </div>
        ) : durum === 'basarili' ? (
          <div style={kart}>
            <DurumRozeti arkaplan="var(--lg-success)" isaret="✓" />
            <h1 style={baslikStil}>E-posta adresin doğrulandı</h1>
            <p style={metinStil}>
              Hesabın kullanıma hazır. Artık giriş yapıp EİDS doğrulamalı ilan verebilir, satıcılara mesaj gönderebilirsin.
            </p>
            <GlassButton prominent size="lg" style={{ width: '100%' }}>
              Giriş Yap
            </GlassButton>
          </div>
        ) : (
          <div style={kart}>
            <DurumRozeti arkaplan="var(--lg-warning)" isaret="!" />
            <h1 style={baslikStil}>Bağlantının süresi doldu</h1>
            <p style={metinStil}>
              Doğrulama bağlantıları güvenlik nedeniyle 24 saat geçerlidir. Yeni bir bağlantı isteyebilirsin; e-posta birkaç
              dakika içinde ulaşır.
            </p>
            <GlassButton prominent size="lg" style={{ width: '100%' }} onClick={() => setDurum('dogrulaniyor')}>
              Doğrulama Bağlantısını Yeniden Gönder
            </GlassButton>
            <p style={{ ...metinStil, fontSize: 'var(--lg-text-footnote, 13px)' }}>
              Sorun devam ederse{' '}
              <a href="#yardim" style={{ color: 'var(--lg-accent)', fontWeight: 600, textDecoration: 'none' }}>
                Yardım Merkezi
              </a>
              &apos;ne göz at.
            </p>
          </div>
        )}
      </div>
    </PublicShell>
  )
}
