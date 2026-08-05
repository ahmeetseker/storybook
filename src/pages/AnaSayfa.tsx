// Ana sayfa (/) — hero (Arsam yerleşimi: eyebrow + vurgulu başlık + yapılandırılmış
// arama kartı + istatistik şeridi), hızlı kategoriler, doğrulanmış ilanlar ve EİDS
// CTA şeridi. Cam yalnız kabuk ve kontrollerde; içerik düz token zemini.
import type { CSSProperties, ReactNode } from 'react'
import { GlassButton } from '../components/GlassButton'
import { GlassHero } from '../components/GlassHero'
import { GlassListingCard } from '../components/GlassListingCard'
import { GlassSegmentedControl } from '../components/GlassSegmentedControl'
import { GlassSelect } from '../components/GlassSelect'
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

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const CityIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 21h18M5 21V7l7-4v18M12 21V11l7 4v6" />
  </svg>
)

const GridIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3Z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const konumSecenekleri = [
  { value: 'tumu', label: 'Tüm Türkiye' },
  { value: 'izmir', label: 'İzmir' },
  { value: 'ankara', label: 'Ankara' },
  { value: 'bursa', label: 'Bursa' },
  { value: 'antalya', label: 'Antalya' },
  { value: 'tekirdag', label: 'Tekirdağ' },
  { value: 'eskisehir', label: 'Eskişehir' },
]

const metrekareSecenekleri = [
  { value: 'tumu', label: 'Tüm m² aralıkları' },
  { value: '0-500', label: "500 m²'ye kadar" },
  { value: '500-1000', label: '500 – 1.000 m²' },
  { value: '1000-5000', label: '1.000 – 5.000 m²' },
  { value: '5000+', label: '5.000 m² üzeri' },
]

const heroIstatistikleri: { ikon: ReactNode; metin: string }[] = [
  { ikon: <PinIcon />, metin: '50.900+ ilan' },
  { ikon: <CityIcon />, metin: '81 il' },
  { ikon: <GridIcon />, metin: '4 kategori' },
  { ikon: <ShieldIcon />, metin: 'EİDS yetki kontrolü' },
]

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
        {/* Hero — Arsam yerleşimi: eyebrow + vurgulu başlık + arama kartı + istatistikler */}
        <GlassHero
          variant="search"
          titleAs="h1"
          ambient
          eyebrow={
            <span
              style={{
                fontSize: 'var(--lg-text-caption, 12px)',
                fontWeight: 600,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--lg-label-secondary)',
              }}
            >
              Türkiye'nin Arsa Rehberi
            </span>
          }
          title={
            <>
              Hayal ettiğin{' '}
              <span
                style={{
                  display: 'inline-block',
                  padding: '0 0.22em',
                  borderRadius: 'var(--lg-radius-chip, 10px)',
                  background: 'var(--lg-label)',
                  color: 'var(--lg-bg)',
                }}
              >
                arsa
              </span>{' '}
              seni bekliyor.
            </>
          }
          subtitle="Türkiye genelinde 50.900+ ilan, kategori ve konum filtreleri. Her ilanda, ilan verme yetkisi EİDS ile doğrulanır."
          search={
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              style={{
                ...flatCard,
                padding: 'var(--lg-space-4, 16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                textAlign: 'start',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <GlassSegmentedControl
                  label="Kategori"
                  options={[
                    { value: 'tumu', label: 'Tümü' },
                    { value: 'konut', label: 'Konut İmarlı' },
                    { value: 'tarla', label: 'Tarla' },
                    { value: 'turizm', label: 'Turizm' },
                    { value: 'sanayi', label: 'Sanayi' },
                  ]}
                  defaultValue="tumu"
                  size="sm"
                />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 170 }}>
                  <GlassSelect
                    aria-label="Konum"
                    options={konumSecenekleri}
                    defaultValue="tumu"
                    material="flat"
                    size="lg"
                  />
                </div>
                <div style={{ flex: 1, minWidth: 170 }}>
                  <GlassSelect
                    aria-label="Metrekare aralığı"
                    options={metrekareSecenekleri}
                    placeholder="m² aralığı"
                    material="flat"
                    size="lg"
                  />
                </div>
                <GlassButton type="submit" size="lg" prominent onClick={noop}>
                  <SearchIcon />
                  İlanları Gör
                </GlassButton>
              </div>
            </form>
          }
          quickLinks={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '8px 20px',
                  fontSize: 'var(--lg-text-footnote, 13px)',
                  color: 'var(--lg-label-secondary)',
                }}
              >
                {heroIstatistikleri.map((stat) => (
                  <span key={stat.metin} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'flex' }} aria-hidden>{stat.ikon}</span>
                    {stat.metin}
                  </span>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: 'var(--lg-text-caption, 12px)', color: 'var(--lg-label-secondary)' }}>
                Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.
              </p>
            </div>
          }
        />

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 320px))', gap: 16 }}>
            {yayindakiler.map((ilan) => (
              <GlassListingCard
                key={ilan.id}
                image={ilan.gorsel}
                title={ilan.baslik}
                price={ilan.fiyat}
                pricePrefix="Liste:"
                location={ilan.konum}
                metrics={[{ value: ilan.m2, label: 'Alan' }, { value: ilan.imar, label: 'İmar' }]}
                seller="Arsam ilanı"
                listedAt={ilan.tarih}
                variant="propertyOverlay"
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
              İlan verme yetkini EİDS ile doğrula
            </h2>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote, 13px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
              Taşınmaz numaranı gir, bu taşınmazı ilan etme yetkin Ticaret Bakanlığı EİDS kaydından
              kontrol edilsin. İlanında hangi kontrolün yapıldığı kaynağıyla birlikte görünür.
            </p>
            <p style={{ margin: 0, fontSize: 'var(--lg-text-caption, 12px)', color: 'var(--lg-label-secondary)', lineHeight: 1.5 }}>
              Bu kontrol tapu niteliğini, takyidatı, imar bilgisini, fiziksel durumu veya fiyatı doğrulamaz.
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
