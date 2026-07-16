// /yardim — yardım merkezi: arama, 4 rehber kategorisi, sık sorulan sorular.
// İçerik katmanı tamamen flat; aç-kapa yerleşik details/summary ile.
import type { CSSProperties, FormEvent } from 'react'
import { PublicShell } from './shared/shells'
import { TextInput } from './shared/forms'

const kart: CSSProperties = {
  boxSizing: 'border-box',
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  padding: 'var(--lg-space-5, 20px)',
}

const kategoriler = [
  {
    baslik: 'İlan Verme',
    aciklama: '13 adımlı ilan sihirbazı, fotoğraf kuralları, fiyatlandırma ve yayın süresi.',
    makale: 14,
  },
  {
    baslik: 'EİDS Doğrulama',
    aciklama: 'Taşınmaz numarası bulma, doğrulama süreci ve başarısız doğrulama çözümleri.',
    makale: 8,
  },
  {
    baslik: 'Hesap ve Güvenlik',
    aciklama: 'Şifre işlemleri, iki adımlı doğrulama, dolandırıcılıktan korunma ipuçları.',
    makale: 11,
  },
  {
    baslik: 'Kurumsal Hesaplar',
    aciklama: 'Emlak ofisi doğrulaması, çoklu ilan yönetimi ve kurumsal rozet başvurusu.',
    makale: 6,
  },
]

const sorular = [
  {
    soru: 'İlanım neden hâlâ moderasyonda görünüyor?',
    cevap:
      'EİDS doğrulaması tamamlanan ilanlar moderasyon ekibimizce en geç 24 saat içinde incelenir. Fotoğraf, açıklama veya fiyat bilgisinde düzeltme gerekirse "Değişiklik İstendi" durumuna geçer ve size bildirim gönderilir.',
  },
  {
    soru: 'EİDS taşınmaz numaramı nereden bulabilirim?',
    cevap:
      'Taşınmaz numaranızı e-Devlet üzerindeki "Tapu Bilgileri Sorgulama" hizmetinden veya tapu senedinizin üst bölümünden öğrenebilirsiniz. İlan sihirbazının 3. adımında bu numara EİDS üzerinden otomatik doğrulanır.',
  },
  {
    soru: 'İlan verme ücreti ne kadar?',
    cevap:
      'Bireysel kullanıcılar ayda 1 ilanı ücretsiz yayınlayabilir. Ek ilanlar ve "Öne Çıkan" gibi doping ürünleri ücretlidir; güncel fiyat listesini ilan sihirbazının fiyat adımında görebilirsiniz.',
  },
  {
    soru: 'Hisseli tapulu arsa için ilan verebilir miyim?',
    cevap:
      'Evet. Tapu tipini "Hisseli" olarak seçmeniz ve kendi hisse oranınızı açıklamada belirtmeniz gerekir. EİDS doğrulaması hisseli taşınmazlarda da zorunludur; ilan kartında tapu tipi alıcılara açıkça gösterilir.',
  },
  {
    soru: 'Telefon numaram ilanda görünsün istemiyorum, ne yapmalıyım?',
    cevap:
      'İlan sihirbazının "İletişim tercihleri" adımında "Yalnızca mesajla ulaşılsın" seçeneğini işaretleyin. Bu durumda alıcılar size sadece platform içi mesajlaşma üzerinden ulaşabilir.',
  },
]

const engelle = (e: FormEvent) => e.preventDefault()

export function YardimMerkezi() {
  return (
    <PublicShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 16 }}>
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h1 style={{ margin: 0, fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
              Size nasıl yardımcı olabiliriz?
            </h1>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-body, 15px)', color: 'var(--lg-label-secondary)' }}>
              Rehberlerde arayın veya aşağıdaki kategorilerden birine göz atın.
            </p>
          </div>
          <form onSubmit={engelle} role="search" style={{ width: '100%', maxWidth: 560 }}>
            <TextInput
              type="search"
              aria-label="Yardım merkezinde ara"
              placeholder="Soru veya anahtar kelime arayın — ör. EİDS doğrulama"
              style={{ minHeight: 'var(--lg-control-lg, 48px)' }}
            />
          </form>
        </header>

        <section aria-label="Rehber kategorileri" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          {kategoriler.map((k) => (
            <a
              key={k.baslik}
              href={`#yardim-${k.baslik.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`}
              style={{ ...kart, display: 'flex', flexDirection: 'column', gap: 8, color: 'inherit', textDecoration: 'none' }}
            >
              <h2 style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>{k.baslik}</h2>
              <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5, flex: 1 }}>
                {k.aciklama}
              </p>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lg-accent)' }}>{k.makale} makale</span>
            </a>
          ))}
        </section>

        <section aria-label="Sık sorulan sorular" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Sık Sorulan Sorular</h2>
          <div style={{ ...kart, padding: '4px 20px' }}>
            {sorular.map((s, i) => (
              <details key={s.soru} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--lg-hairline)', padding: '14px 0' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    fontSize: 'var(--lg-text-body, 15px)',
                    fontWeight: 600,
                    listStyle: 'revert',
                  }}
                >
                  {s.soru}
                </summary>
                <p style={{ margin: '10px 0 0', fontSize: 'var(--lg-text-body, 15px)', color: 'var(--lg-label-secondary)', lineHeight: 1.6 }}>
                  {s.cevap}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
