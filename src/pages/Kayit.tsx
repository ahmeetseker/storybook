// /kayit — üyelik oluşturma: kimlik bilgileri + KVKK açık rıza onayları.
// PublicShell içinde dar, ortalanmış flat kart; cam yalnız navigasyonda.
import type { CSSProperties, FormEvent } from 'react'
import { GlassButton } from '../components/GlassButton'
import { PublicShell } from './shared/shells'
import { Field, TextInput, CheckRow } from './shared/forms'

const kart: CSSProperties = {
  width: '100%',
  maxWidth: 460,
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

export function Kayit() {
  return (
    <PublicShell>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
        <div style={kart}>
          <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>Hesap Oluştur</h1>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
              EİDS doğrulamalı arsa ilanları vermek ve satıcılarla iletişime geçmek için ücretsiz üye ol.
            </p>
          </header>

          <form onSubmit={engelle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Ad Soyad">
              {(id) => <TextInput id={id} autoComplete="name" placeholder="Mehmet Yılmaz" />}
            </Field>
            <Field label="E-posta">
              {(id) => <TextInput id={id} type="email" autoComplete="email" placeholder="ornek@eposta.com" />}
            </Field>
            <Field label="Telefon" hint="Doğrulama SMS'i bu numaraya gönderilir.">
              {(id) => <TextInput id={id} type="tel" autoComplete="tel" placeholder="0 (5__) ___ __ __" />}
            </Field>
            <Field label="Şifre" hint="En az 8 karakter; büyük harf ve rakam içermeli.">
              {(id) => <TextInput id={id} type="password" autoComplete="new-password" placeholder="••••••••" />}
            </Field>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4, borderTop: '1px solid var(--lg-hairline)' }}>
              <CheckRow
                label={
                  <>
                    <a href="#yasal-kvkk" style={baglanti}>KVKK Aydınlatma Metni</a>&apos;ni ve{' '}
                    <a href="#yasal-kosullar" style={baglanti}>Kullanım Koşulları</a>&apos;nı okudum, kabul ediyorum. (Zorunlu)
                  </>
                }
              />
              <CheckRow
                label={
                  <>
                    Kişisel verilerimin <a href="#yasal-acik-riza" style={baglanti}>Açık Rıza Metni</a> kapsamında işlenmesine
                    açık rıza veriyorum. (Zorunlu)
                  </>
                }
              />
              <CheckRow label="Kampanya ve yeni ilan duyurularından e-posta ile haberdar olmak istiyorum. (İsteğe bağlı)" />
            </div>

            <GlassButton type="submit" prominent size="lg" style={{ width: '100%' }}>
              Hesap Oluştur
            </GlassButton>
          </form>

          <p style={{ margin: 0, textAlign: 'center', fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)' }}>
            Zaten hesabın var mı?{' '}
            <a href="#giris" style={baglanti}>
              Giriş yap
            </a>
          </p>
        </div>
      </div>
    </PublicShell>
  )
}
