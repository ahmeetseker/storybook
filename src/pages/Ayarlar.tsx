// /hesabim/ayarlar — profil, telefon görünürlüğü, şifre, bildirim tercihleri ve
// hesabı kapatma (danger bölge). Bölümlenmiş flat kartlar; cam yalnız kabukta.
import type { CSSProperties, ReactNode } from 'react'
import { AccountShell } from './shared/shells'
import { CheckRow, Field, TextInput } from './shared/forms'

const card: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: 20,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

const kaydetBtn: CSSProperties = {
  alignSelf: 'flex-start',
  minHeight: 'var(--lg-control-md, 40px)',
  padding: '0 20px',
  borderRadius: 'var(--lg-radius-capsule, 999px)',
  border: '1px solid var(--lg-accent)',
  background: 'var(--lg-accent)',
  color: 'var(--lg-accent-contrast)',
  font: 'inherit',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

function Bolum({ baslik, aciklama, children, danger = false }: { baslik: string; aciklama?: string; children: ReactNode; danger?: boolean }) {
  return (
    <section style={{ ...card, borderColor: danger ? 'var(--lg-danger)' : 'var(--lg-hairline)' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600, color: danger ? 'var(--lg-danger)' : 'inherit' }}>{baslik}</h2>
        {aciklama ? <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>{aciklama}</p> : null}
      </header>
      {children}
    </section>
  )
}

/** Bildirim tercihleri matrisi — kanal başına CheckRow */
const bildirimTurleri = [
  { id: 'mesaj', label: 'Yeni mesaj', eposta: true, uygulama: true },
  { id: 'moderasyon', label: 'İlan moderasyon sonucu', eposta: true, uygulama: true },
  { id: 'alarm', label: 'Arama alarmı eşleşmesi', eposta: false, uygulama: true },
]

export function Ayarlar() {
  return (
    <AccountShell selected="ayarlar" title="Profil ve Ayarlar">
      <Bolum baslik="Profil" aciklama="İlanlarınızda ve mesajlaşmada görünen bilgiler.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Field label="Ad Soyad">{(id) => <TextInput id={id} defaultValue="Mehmet Yılmaz" autoComplete="name" />}</Field>
          <Field label="E-posta" hint="Doğrulama bağlantısı bu adrese gönderilir.">
            {(id) => <TextInput id={id} type="email" defaultValue="mehmet.yilmaz@example.com" autoComplete="email" />}
          </Field>
          <Field label="Telefon">{(id) => <TextInput id={id} type="tel" defaultValue="0 (532) 123 45 67" autoComplete="tel" />}</Field>
        </div>
        <button type="button" style={kaydetBtn} onClick={() => {}}>Kaydet</button>
      </Bolum>

      <Bolum baslik="Telefon Görünürlüğü" aciklama="Numaranızın ilan sayfalarında nasıl gösterileceğini seçin.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CheckRow
            type="radio"
            name="telefon-gorunurluk"
            defaultChecked
            label={
              <>
                <strong style={{ fontWeight: 600 }}>İlanlarımda maskelenmiş göster</strong>{' '}
                <span style={{ color: 'var(--lg-accent)', fontSize: 12, fontWeight: 700 }}>Önerilen</span>
                <br />
                <span style={{ color: 'var(--lg-label-secondary)', fontSize: 13 }}>
                  Numaranız 0 (5**) *** ** 67 biçiminde görünür; arayan platform üzerinden yönlendirilir.
                </span>
              </>
            }
          />
          <CheckRow
            type="radio"
            name="telefon-gorunurluk"
            label={
              <>
                <strong style={{ fontWeight: 600 }}>Numaramı açık göster</strong>
                <br />
                <span style={{ color: 'var(--lg-label-secondary)', fontSize: 13 }}>
                  Numaranız ilan sayfasında tam olarak görünür; istenmeyen aramalar alabilirsiniz.
                </span>
              </>
            }
          />
          <CheckRow
            type="radio"
            name="telefon-gorunurluk"
            label={
              <>
                <strong style={{ fontWeight: 600 }}>Yalnız mesajla iletişim</strong>
                <br />
                <span style={{ color: 'var(--lg-label-secondary)', fontSize: 13 }}>
                  Numaranız hiç gösterilmez; alıcılar yalnız platform mesajlarıyla ulaşır.
                </span>
              </>
            }
          />
        </div>
      </Bolum>

      <Bolum baslik="Şifre Değiştir">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Field label="Mevcut şifre">{(id) => <TextInput id={id} type="password" autoComplete="current-password" />}</Field>
          <Field label="Yeni şifre" hint="En az 8 karakter; harf ve rakam içermeli.">
            {(id) => <TextInput id={id} type="password" autoComplete="new-password" />}
          </Field>
          <Field label="Yeni şifre (tekrar)">{(id) => <TextInput id={id} type="password" autoComplete="new-password" />}</Field>
        </div>
        <button type="button" style={kaydetBtn} onClick={() => {}}>Şifreyi Güncelle</button>
      </Bolum>

      <Bolum baslik="Bildirim Tercihleri" aciklama="Hangi olaylarda hangi kanaldan haber verelim?">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 420 }}>
            <thead>
              <tr>
                {['Olay', 'E-posta', 'Uygulama içi'].map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    style={{
                      textAlign: i === 0 ? 'left' : 'center',
                      padding: '8px 12px 8px 0',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--lg-label-secondary)',
                      borderBottom: '1px solid var(--lg-hairline)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bildirimTurleri.map((t) => (
                <tr key={t.id}>
                  <th scope="row" style={{ textAlign: 'left', padding: '12px 12px 12px 0', fontSize: 14, fontWeight: 400 }}>
                    {t.label}
                  </th>
                  <td style={{ textAlign: 'center', padding: '12px 0' }}>
                    <input type="checkbox" defaultChecked={t.eposta} aria-label={`${t.label} — e-posta bildirimi`} style={{ accentColor: 'var(--lg-accent)' }} />
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 0' }}>
                    <input type="checkbox" defaultChecked={t.uygulama} aria-label={`${t.label} — uygulama içi bildirim`} style={{ accentColor: 'var(--lg-accent)' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bolum>

      <Bolum
        danger
        baslik="Hesabı Kapat"
        aciklama="Hesabınız kapatıldığında yayındaki tüm ilanlarınız kaldırılır, mesaj geçmişiniz ve EİDS doğrulama kayıtlarınız silinir. Bu işlem geri alınamaz."
      >
        <button
          type="button"
          onClick={() => {}}
          style={{
            alignSelf: 'flex-start',
            minHeight: 'var(--lg-control-md, 40px)',
            padding: '0 20px',
            borderRadius: 'var(--lg-radius-capsule, 999px)',
            border: '1px solid var(--lg-danger)',
            background: 'var(--lg-surface)',
            color: 'var(--lg-danger)',
            font: 'inherit',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Hesabımı kalıcı olarak kapat
        </button>
      </Bolum>
    </AccountShell>
  )
}
