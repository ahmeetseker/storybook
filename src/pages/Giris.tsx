// /giris — e-posta + şifre ile giriş. PublicShell içinde dar, ortalanmış flat kart.
// Cam yalnız navigasyonda (kabuk hallediyor); bu sayfanın tamamı düz yüzey.
import type { CSSProperties, FormEvent } from 'react'
import { GlassButton } from '../components/GlassButton'
import { PublicShell } from './shared/shells'
import { Field, TextInput, CheckRow } from './shared/forms'

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

const engelle = (e: FormEvent) => e.preventDefault()

export function Giris({ hata = false }: { hata?: boolean }) {
  return (
    <PublicShell>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
        <div style={kart}>
          <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>Giriş Yap</h1>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
              İlanlarını yönet, mesajlarına ve arama alarmlarına ulaş.
            </p>
          </header>

          {hata ? (
            <div
              role="alert"
              style={{
                border: '1px solid var(--lg-danger)',
                borderRadius: 'var(--lg-radius-chip, 10px)',
                padding: '10px 14px',
                fontSize: 'var(--lg-text-footnote, 13px)',
                color: 'var(--lg-danger)',
              }}
            >
              E-posta veya şifre hatalı. Bilgilerinizi kontrol edip yeniden deneyin.
            </div>
          ) : null}

          <form onSubmit={engelle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="E-posta" error={hata ? 'Bu e-posta ile eşleşen bir hesap bulunamadı.' : undefined}>
              {(id) => (
                <TextInput
                  id={id}
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@eposta.com"
                  defaultValue={hata ? 'mehmet.yilmaz@eposta' : undefined}
                  invalid={hata}
                />
              )}
            </Field>
            <Field label="Şifre">
              {(id) => <TextInput id={id} type="password" autoComplete="current-password" placeholder="••••••••" invalid={hata} />}
            </Field>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <CheckRow label="Beni hatırla" defaultChecked />
              <a href="#sifre-sifirla" style={{ ...baglanti, fontSize: 'var(--lg-text-footnote, 13px)', whiteSpace: 'nowrap' }}>
                Şifremi unuttum
              </a>
            </div>

            <GlassButton type="submit" prominent size="lg" style={{ width: '100%' }}>
              Giriş Yap
            </GlassButton>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--lg-label-secondary)', fontSize: 12 }}>
            <span style={{ flex: 1, height: 1, background: 'var(--lg-hairline)' }} aria-hidden />
            veya
            <span style={{ flex: 1, height: 1, background: 'var(--lg-hairline)' }} aria-hidden />
          </div>

          <GlassButton size="lg" style={{ width: '100%' }}>
            Google ile devam et
          </GlassButton>

          <p style={{ margin: 0, textAlign: 'center', fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
            Hesabın yok mu?{' '}
            <a href="#kayit" style={baglanti}>
              Kayıt ol
            </a>
          </p>
        </div>
      </div>
    </PublicShell>
  )
}
