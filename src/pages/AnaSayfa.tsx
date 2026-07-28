// Ana sayfa (/) — hero + AI doğal dil araması, hızlı kategoriler, doğrulanmış
// ilanlar ve EİDS CTA şeridi. Cam yalnız kabuk ve butonlarda; içerik düz token zemini.
import type { CSSProperties } from 'react'
import { GlassButton } from '../components/GlassButton'
import { GlassListingCard } from '../components/GlassListingCard'
import { PublicShell } from './shared/shells'
import { EidsBadge } from './shared/forms'
import { ilanlar } from './shared/data'

const noop = () => {}

const flatCard: CSSProperties = {
  background: 'var(--lg-surface)',
  border: '1px solid var(--lg-hairline)',
  borderRadius: 'var(--lg-radius-card, 20px)',
  boxSizing: 'border-box',
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.8-3.8" />
  </svg>
)

const kategoriler = [
  { id: 'konut', ad: 'Konut İmarlı', aciklama: 'Ev ya da site yapımına uygun parseller', sayi: '12.480 ilan' },
  { id: 'tarla', ad: 'Tarla', aciklama: 'Tarım, bağ-bahçe ve yatırımlık araziler', sayi: '31.204 ilan' },
  { id: 'turizm', ad: 'Turizm', aciklama: 'Otel ve tesis yapımına uygun arsalar', sayi: '2.318 ilan' },
  { id: 'sanayi', ad: 'Sanayi', aciklama: 'Fabrika, depo ve OSB parselleri', sayi: '4.951 ilan' },
]

export function AnaSayfa() {
  const yayindakiler = ilanlar.filter((i) => i.durum === 'yayinda')

  return (
    <PublicShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lg-space-7, 32px)' }}>
        {/* Hero — düz zemin, arama odaklı */}
        <section style={{ padding: '40px 0 8px', maxWidth: 720, margin: '0 auto', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--lg-text-display, 28px)', fontWeight: 700, letterSpacing: '-0.022em', lineHeight: 1.15 }}>
            Türkiye'nin doğrulanmış arsa ilan platformu
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-body, 15px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
              Her ilanda, ilan verme yetkisi EİDS ile doğrulanır. Aradığınızı doğal dille yazın, filtreleri yapay zekâ kursun.
            </p>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
              Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.
            </p>
          </div>
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--lg-label-secondary)', display: 'flex' }} aria-hidden>
                <SearchIcon />
              </span>
              <input
                type="search"
                aria-label="Arsa ara"
                placeholder={'"İzmir\'de 3 milyon altı imarlı arsa" yazmanız yeterli'}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: 'var(--lg-control-xl, 56px)',
                  padding: '0 16px 0 44px',
                  borderRadius: 'var(--lg-radius-capsule, 999px)',
                  border: '1px solid var(--lg-hairline)',
                  background: 'var(--lg-surface)',
                  color: 'var(--lg-label)',
                  font: 'inherit',
                  fontSize: 'var(--lg-text-body, 15px)',
                  outline: 'none',
                }}
              />
            </div>
            <GlassButton type="submit" size="xl" prominent onClick={noop}>
              Ara
            </GlassButton>
          </form>
          <p style={{ margin: 0, fontSize: 'var(--lg-text-caption, 12px)', color: 'var(--lg-label-secondary)' }}>
            Örnekler: "Urla'da denize yakın köşe parsel" · "Gölbaşı yol cepheli tarla" · "Kaş turizm imarlı 500 m² üstü"
          </p>
        </section>

        {/* Hızlı kategoriler */}
        <section aria-labelledby="kategoriler-baslik" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 id="kategoriler-baslik" style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
            Kategorilere göz atın
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {kategoriler.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={noop}
                style={{
                  ...flatCard,
                  padding: 'var(--lg-space-5, 20px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  textAlign: 'left',
                  cursor: 'pointer',
                  font: 'inherit',
                  color: 'var(--lg-label)',
                }}
              >
                <span style={{ fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>{k.ad}</span>
                <span style={{ fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.45 }}>{k.aciklama}</span>
                <span style={{ marginTop: 4, fontSize: 'var(--lg-text-caption, 12px)', fontWeight: 600, color: 'var(--lg-accent)' }}>{k.sayi}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Doğrulanmış ilanlar */}
        <section aria-labelledby="dogrulanmis-baslik" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <h2 id="dogrulanmis-baslik" style={{ margin: 0, fontSize: 'var(--lg-text-title, 22px)', fontWeight: 700, letterSpacing: '-0.022em' }}>
              Doğrulanmış İlanlar
            </h2>
            <GlassButton size="sm" onClick={noop}>Tümünü Gör</GlassButton>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {yayindakiler.map((ilan) => (
              <GlassListingCard
                key={ilan.id}
                image={ilan.gorsel}
                title={ilan.baslik}
                price={ilan.fiyat}
                location={`${ilan.konum} · ${ilan.m2}`}
                badge={<EidsBadge dogrulandi={ilan.eidsDogrulandi} />}
                onClick={noop}
                material="flat"
              />
            ))}
          </div>
        </section>

        {/* EİDS CTA şeridi */}
        <section
          aria-labelledby="eids-cta-baslik"
          style={{
            ...flatCard,
            padding: 'var(--lg-space-6, 24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 260, flex: 1 }}>
            <h2 id="eids-cta-baslik" style={{ margin: 0, fontSize: 'var(--lg-text-headline, 17px)', fontWeight: 600 }}>
              İlanını EİDS ile doğrula
            </h2>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
              Taşınmaz numaranı gir, tapu kaydınla eşleşen ilanın "Doğrulanmış" rozeti alsın. Doğrulanmış ilanlar
              aramada öne çıkar ve alıcıya güven verir.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <EidsBadge dogrulandi />
            <GlassButton prominent onClick={noop}>Hemen Doğrula</GlassButton>
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
