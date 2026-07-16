// Kurumsal başvuru formu (/kurumsal-basvuru) — firma bilgileri, yetki belgesi
// yükleme placeholder'ı, beyan ve gönderim sonrası "başvurunuz alındı" durumu.
import { useState, type CSSProperties } from 'react'
import { GlassButton } from '../components/GlassButton'
import { PublicShell } from './shared/shells'
import { CheckRow, Field, Select, TextInput } from './shared/forms'

const noop = () => {}

const flatCard: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  boxSizing: 'border-box',
}

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 16V4m0 0L7 9m5-5l5 5" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
)

function BolumBaslik({ no, baslik }: { no: string; baslik: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--lg-accent)',
          color: 'var(--lg-accent-contrast)',
          fontSize: 12,
          fontWeight: 700,
          flex: 'none',
        }}
      >
        {no}
      </span>
      <h2 style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>{baslik}</h2>
    </div>
  )
}

function BasvuruAlindi({ onYeni }: { onYeni: () => void }) {
  return (
    <section
      role="status"
      style={{ ...flatCard, maxWidth: 560, margin: '48px auto 0', padding: 'var(--lg-space-7, 32px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}
    >
      <span style={{ color: 'var(--lg-success)', display: 'flex' }} aria-hidden>
        <CheckCircleIcon />
      </span>
      <h1 style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
        Başvurunuz alındı
      </h1>
      <p style={{ margin: 0, fontSize: 'var(--lg-text-body, 15px)', color: 'var(--lg-label-secondary)', lineHeight: 1.55 }}>
        Başvuru numaranız <strong style={{ color: 'var(--lg-label)' }}>KB-2026-48210</strong>. Yetki belgeniz
        kontrol edildikten sonra sonuç, 2 iş günü içinde e-posta ile bildirilecek. Süreci
        "Hesabım → Kurumsal Doğrulama" sayfasından izleyebilirsiniz.
      </p>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <GlassButton onClick={noop}>Başvuru Durumunu Gör</GlassButton>
        <GlassButton size="md" onClick={onYeni}>Yeni Başvuru</GlassButton>
      </div>
    </section>
  )
}

export function KurumsalBasvuru() {
  const [gonderildi, setGonderildi] = useState(false)

  if (gonderildi) {
    return (
      <PublicShell title="Kurumsal Başvuru" onBack={noop} cta={null}>
        <BasvuruAlindi onYeni={() => setGonderildi(false)} />
      </PublicShell>
    )
  }

  return (
    <PublicShell title="Kurumsal Başvuru" onBack={noop} cta={null}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setGonderildi(true)
        }}
        style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0 0' }}>
          <h1 style={{ margin: 0, fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
            Kurumsal hesap başvurusu
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
            Bilgiler yetki belgesi üzerindeki kayıtlarla eşleşmelidir. Tüm alanlar zorunludur.
          </p>
        </header>

        {/* Firma bilgileri */}
        <section style={{ ...flatCard, padding: 'var(--lg-space-6, 24px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <BolumBaslik no="1" baslik="Firma bilgileri" />
          <Field label="Ticaret ünvanı" hint="Vergi levhasında yazdığı şekliyle">
            {(id) => <TextInput id={id} placeholder="Örn. Ege Arsa Gayrimenkul Dan. Tic. Ltd. Şti." />}
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Vergi numarası">
              {(id) => <TextInput id={id} inputMode="numeric" maxLength={10} placeholder="10 haneli" />}
            </Field>
            <Field label="Vergi dairesi">
              {(id) => <TextInput id={id} placeholder="Örn. Konak V.D." />}
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="İl">
              {(id) => (
                <Select id={id} defaultValue="">
                  <option value="" disabled>Seçin</option>
                  <option value="izmir">İzmir</option>
                  <option value="istanbul">İstanbul</option>
                  <option value="ankara">Ankara</option>
                  <option value="bursa">Bursa</option>
                  <option value="antalya">Antalya</option>
                </Select>
              )}
            </Field>
            <Field label="İlçe">
              {(id) => (
                <Select id={id} defaultValue="">
                  <option value="" disabled>Seçin</option>
                  <option value="konak">Konak</option>
                  <option value="bornova">Bornova</option>
                  <option value="urla">Urla</option>
                  <option value="cesme">Çeşme</option>
                </Select>
              )}
            </Field>
          </div>
          <Field
            label="Taşınmaz ticareti yetki belgesi"
            hint="PDF veya fotoğraf — belge numarası okunur olmalıdır"
          >
            {(id) => (
              <button
                id={id}
                type="button"
                onClick={noop}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  minHeight: 'var(--lg-control-lg, 48px)',
                  borderRadius: 'var(--lg-radius-chip, 10px)',
                  border: '1px dashed var(--lg-label-secondary)',
                  background: 'var(--lg-bg)',
                  color: 'var(--lg-label-secondary)',
                  font: 'inherit',
                  fontSize: 'var(--lg-text-footnote, 13px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <UploadIcon />
                Dosya yükle veya buraya sürükleyin
              </button>
            )}
          </Field>
        </section>

        {/* İletişim */}
        <section style={{ ...flatCard, padding: 'var(--lg-space-6, 24px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <BolumBaslik no="2" baslik="Yetkili iletişim bilgileri" />
          <Field label="Yetkili adı soyadı">
            {(id) => <TextInput id={id} placeholder="Örn. Elif Şahin" autoComplete="name" />}
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="E-posta">
              {(id) => <TextInput id={id} type="email" placeholder="ornek@firma.com" autoComplete="email" />}
            </Field>
            <Field label="Telefon">
              {(id) => <TextInput id={id} type="tel" placeholder="0 (5__) ___ __ __" autoComplete="tel" />}
            </Field>
          </div>
        </section>

        {/* Beyan ve gönderim */}
        <section style={{ ...flatCard, padding: 'var(--lg-space-6, 24px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <BolumBaslik no="3" baslik="Beyan ve gönderim" />
          <CheckRow
            required
            label={
              <>
                Verdiğim bilgilerin doğru olduğunu, firmamın 5 No.lu Taşınmaz Ticareti Yönetmeliği
                kapsamında geçerli yetki belgesine sahip olduğunu beyan ediyor;{' '}
                <a href="#kurumsal-sozlesme" style={{ color: 'var(--lg-accent)' }}>Kurumsal Üyelik Sözleşmesi</a>'ni
                kabul ediyorum.
              </>
            }
          />
          <CheckRow label={<>Kampanya ve ürün duyurularının e-posta ile gönderilmesine izin veriyorum. (İsteğe bağlı)</>} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--lg-text-caption, 12px)', color: 'var(--lg-label-secondary)' }}>
              Başvurunuz 2 iş günü içinde sonuçlandırılır.
            </span>
            <GlassButton type="submit" size="lg" prominent onClick={noop}>
              Başvuruyu Gönder
            </GlassButton>
          </div>
        </section>
      </form>
    </PublicShell>
  )
}
