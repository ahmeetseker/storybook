// /sifre-sifirla — e-posta girilir, bağlantı gönderilince başarı durumuna geçer.
// İki hâl tek component'te useState ile yönetilir; story başlangıç hâlini seçebilir.
import { useState, type CSSProperties, type FormEvent } from 'react'
import { GlassButton } from '../components/GlassButton'
import { PublicShell } from './shared/shells'
import { Field, TextInput } from './shared/forms'

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
  gap: 20,
}

const baglanti: CSSProperties = {
  color: 'var(--lg-accent)',
  fontWeight: 600,
  textDecoration: 'none',
}

export function SifreSifirla({ baslangicGonderildi = false }: { baslangicGonderildi?: boolean }) {
  const [gonderildi, setGonderildi] = useState(baslangicGonderildi)
  const [eposta, setEposta] = useState(baslangicGonderildi ? 'mehmet.yilmaz@eposta.com' : '')

  const gonder = (e: FormEvent) => {
    e.preventDefault()
    setGonderildi(true)
  }

  return (
    <PublicShell>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
        {gonderildi ? (
          <div style={{ ...kart, textAlign: 'center', alignItems: 'center' }}>
            <span
              aria-hidden
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                background: 'var(--lg-success)',
                color: '#fff',
                fontSize: 24,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              ✓
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
                Bağlantı gönderildi
              </h1>
              <p style={{ margin: 0, fontSize: 'var(--lg-text-body, 15px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--lg-label)', fontWeight: 600 }}>{eposta || 'e-posta adresinize'}</strong> adresine şifre
                sıfırlama bağlantısı gönderdik. Bağlantı 30 dakika geçerlidir; gelen kutunuzu ve spam klasörünüzü kontrol edin.
              </p>
            </div>
            <GlassButton prominent size="lg" style={{ width: '100%' }}>
              Girişe Dön
            </GlassButton>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
              E-posta gelmedi mi?{' '}
              <button
                type="button"
                onClick={() => setGonderildi(false)}
                style={{ ...baglanti, background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }}
              >
                Yeniden dene
              </button>
            </p>
          </div>
        ) : (
          <div style={kart}>
            <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h1 style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
                Şifreni Sıfırla
              </h1>
              <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
                Hesabına bağlı e-posta adresini gir; sana bir sıfırlama bağlantısı gönderelim.
              </p>
            </header>

            <form onSubmit={gonder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="E-posta">
                {(id) => (
                  <TextInput
                    id={id}
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="ornek@eposta.com"
                    value={eposta}
                    onChange={(e) => setEposta(e.target.value)}
                  />
                )}
              </Field>
              <GlassButton type="submit" prominent size="lg" style={{ width: '100%' }}>
                Sıfırlama Bağlantısı Gönder
              </GlassButton>
            </form>

            <p style={{ margin: 0, textAlign: 'center', fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
              Şifreni hatırladın mı?{' '}
              <a href="#giris" style={baglanti}>
                Giriş yap
              </a>
            </p>
          </div>
        )}
      </div>
    </PublicShell>
  )
}
