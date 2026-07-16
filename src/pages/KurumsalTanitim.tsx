// Kurumsal tanıtım (/kurumsal) — kurumsal hesap avantajları ve başvuru CTA'sı.
// Fiyatlandırma post-MVP olduğundan bilinçli olarak yoktur. İçerik düz token zemini.
import type { CSSProperties, ReactNode } from 'react'
import { GlassButton } from '../components/GlassButton'
import { PublicShell } from './shared/shells'

const noop = () => {}

const flatCard: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  boxSizing: 'border-box',
}

const StackIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </svg>
)

const TeamIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
    <circle cx="17.5" cy="9.5" r="2.5" />
    <path d="M16 15.2c2.6.2 4.6 1.7 5.5 4.3" />
  </svg>
)

const StorefrontIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 9l1.5-5h13L20 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M4 9h16" />
    <path d="M9 20v-6h6v6" />
  </svg>
)

function AvantajKarti({ ikon, baslik, aciklama, maddeler }: { ikon: ReactNode; baslik: string; aciklama: string; maddeler: string[] }) {
  return (
    <article style={{ ...flatCard, padding: 'var(--lg-space-6, 24px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span
        aria-hidden
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--lg-radius-chip, 10px)',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--lg-bg)',
          border: '1px solid var(--lg-hairline)',
          color: 'var(--lg-accent)',
        }}
      >
        {ikon}
      </span>
      <h3 style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>{baslik}</h3>
      <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>{aciklama}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {maddeler.map((m) => (
          <li key={m} style={{ display: 'flex', gap: 8, fontSize: 'var(--lg-text-footnote, 13px)', lineHeight: 1.45 }}>
            <span aria-hidden style={{ color: 'var(--lg-accent)', fontWeight: 700 }}>✓</span>
            {m}
          </li>
        ))}
      </ul>
    </article>
  )
}

export function KurumsalTanitim() {
  return (
    <PublicShell title="Kurumsal" cta="Başvur">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lg-space-7, 32px)' }}>
        {/* Giriş */}
        <section style={{ padding: '40px 0 0', maxWidth: 640, margin: '0 auto', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ alignSelf: 'center', padding: '4px 12px', borderRadius: 999, border: '1px solid var(--lg-hairline)', background: 'var(--lg-surface)', fontSize: 'var(--lg-text-caption, 12px)', fontWeight: 600, color: 'var(--lg-accent)' }}>
            Emlak ofisleri ve geliştiriciler için
          </span>
          <h1 style={{ margin: 0, fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em', lineHeight: 1.15 }}>
            Portföyünüzü ArsaPazar'da kurumsal kimliğinizle yönetin
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--lg-text-body, 15px)', color: 'var(--lg-label-secondary)', lineHeight: 1.55 }}>
            Doğrulanmış kurumsal rozet, toplu ilan araçları ve ekip yönetimiyle portföyünüzü tek
            hesaptan yayınlayın. Başvurular yetki belgesi kontrolünden sonra onaylanır.
          </p>
        </section>

        {/* Avantaj kartları */}
        <section aria-label="Kurumsal hesap avantajları" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <AvantajKarti
            ikon={<StackIcon />}
            baslik="Toplu ilan yönetimi"
            aciklama="Yüzlerce parseli tek panelden yayınlayın, güncelleyin ve yeniden yayına alın."
            maddeler={[
              'Excel/CSV ile toplu ilan aktarımı',
              'Süresi dolan ilanları tek tıkla yenileme',
              'Portföy genelinde toplu fiyat güncelleme',
            ]}
          />
          <AvantajKarti
            ikon={<TeamIcon />}
            baslik="Ekip yönetimi"
            aciklama="Danışmanlarınızı tek kurumsal çatı altında toplayın, yetkileri siz belirleyin."
            maddeler={[
              'Danışman bazında ilan ve mesaj yetkisi',
              'Gelen talepleri ekip üyelerine atama',
              'Danışman performans özeti',
            ]}
          />
          <AvantajKarti
            ikon={<StorefrontIcon />}
            baslik="Kurumsal vitrin"
            aciklama="Firmanıza özel vitrin sayfasında tüm portföyünüz ve iletişim bilgileriniz bir arada."
            maddeler={[
              'Logo ve firma profiliyle vitrin sayfası',
              'Aramada kurumsal doğrulama rozeti',
              'Vitrin bağlantısını dilediğiniz yerde paylaşma',
            ]}
          />
        </section>

        {/* Başvuru CTA */}
        <section
          aria-labelledby="kurumsal-cta-baslik"
          style={{ ...flatCard, padding: 'var(--lg-space-7, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260, flex: 1 }}>
            <h2 id="kurumsal-cta-baslik" style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
              Kurumsal hesabınızı bugün açın
            </h2>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
              Başvuru yaklaşık 5 dakika sürer. Ticaret unvanı, vergi numarası ve taşınmaz ticareti
              yetki belgesi yeterlidir; ekibimiz 2 iş günü içinde dönüş yapar.
            </p>
          </div>
          <GlassButton size="lg" prominent onClick={noop}>
            Kurumsal Başvuru Yap
          </GlassButton>
        </section>
      </div>
    </PublicShell>
  )
}
