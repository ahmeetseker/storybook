// Konut ilan detayı (/ilan/{id}) — Dalga 1 component'lerinin bağlamda birleşimi:
// MediaGallery (foto/video/plan/tur), FeatureGroup künye, Map, LoanCalculator,
// TourScheduler, ScoreMeter, Chart. Cam yalnız kabuk/kontrollerde; içerik flat.
import { useState, type CSSProperties } from 'react'
import { GlassBreadcrumb } from '../components/GlassBreadcrumb'
import { GlassMediaGallery } from '../components/GlassMediaGallery'
import { GlassPriceHeader } from '../components/GlassPriceHeader'
import { GlassIconButton } from '../components/GlassIconButton'
import { GlassTabs } from '../components/GlassTabs'
import { GlassFeatureGroup } from '../components/GlassFeatureGroup'
import { GlassMap } from '../components/GlassMap'
import { GlassLoanCalculator } from '../components/GlassLoanCalculator'
import { GlassTourScheduler } from '../components/GlassTourScheduler'
import { GlassScoreMeter } from '../components/GlassScoreMeter'
import { GlassChart } from '../components/GlassChart'
import { GlassSellerCard } from '../components/GlassSellerCard'
import { GlassNearbyPlaces } from '../components/GlassNearbyPlaces'
import { GlassClimateRiskPanel } from '../components/GlassClimateRiskPanel'
import { GlassRating } from '../components/GlassRating'
import { GlassReviewCard } from '../components/GlassReviewCard'
import { GlassListingCard } from '../components/GlassListingCard'
import { GlassCarousel } from '../components/GlassCarousel'
import { placeholderImage } from '../demo/placeholderImage'
import { PublicShell } from './shared/shells'
import { EidsBadge } from './shared/forms'

const noop = () => {}

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.4 4.5 6 4.5c2 0 3.4 1 4.5 2.6h3c1.1-1.6 2.5-2.6 4.5-2.6 3.6 0 5.5 3.5 4 7.2C19.5 16.3 12 21 12 21z" transform="scale(0.9) translate(1.3 1.3)" />
  </svg>
)

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
  </svg>
)

/* ── Demo verisi — konut (Kozlu Fatih Sitesi tarzı 3+1) ─────────────── */

const medya = [
  { type: 'image' as const, src: placeholderImage('Salon', '#7a5a3a', '#4a331c', 960, 640), alt: 'Geniş salon, gün ışığı alan cephe', label: 'Salon' },
  { type: 'image' as const, src: placeholderImage('Mutfak', '#3a6f5f', '#1f4a3a', 960, 640), alt: 'Ankastre mutfak', label: 'Mutfak' },
  { type: 'image' as const, src: placeholderImage('Yatak Odası', '#3a5f8a', '#1f3a5f', 960, 640), alt: 'Ebeveyn yatak odası', label: 'Ebeveyn odası' },
  { type: 'image' as const, src: placeholderImage('Banyo', '#6f3a5f', '#4a1f3a', 960, 640), alt: 'Ana banyo', label: 'Banyo' },
  { type: 'video' as const, src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', poster: placeholderImage('Video Tur', '#2e5f50', '#12312a', 960, 640), label: 'Video tur' },
  { type: 'floorPlan' as const, src: placeholderImage('Kat Planı', '#8a6f3a', '#5f4a1f', 960, 640), alt: '3+1 kat planı — 128 m² net', label: 'Kat planı' },
]

const kunye = [
  {
    title: 'Genel',
    items: [
      { label: 'İlan No', value: '2417803356' },
      { label: 'Oda Sayısı', value: '3+1' },
      { label: 'Brüt / Net m²', value: '145 / 128 m²' },
      { label: 'Bulunduğu Kat', value: '4 / 8' },
      { label: 'Bina Yaşı', value: '6' },
      { label: 'Isıtma', value: 'Doğalgaz Kombi' },
      { label: 'Aidat', value: '1.450 TL' },
      { label: 'Tapu Durumu', value: 'Kat Mülkiyetli' },
      { label: 'Krediye Uygun', value: 'Evet' },
      { label: 'Kimden', value: 'Sahibinden' },
    ],
  },
]

const icOzellikler = {
  title: 'İç Özellikler',
  items: [
    { label: 'Ankastre Mutfak', present: true },
    { label: 'Klima', present: true },
    { label: 'Ebeveyn Banyosu', present: true },
    { label: 'Giyinme Odası', present: true },
    { label: 'Balkon', present: true },
    { label: 'Şömine', present: false },
    { label: 'Akıllı Ev', present: true },
    { label: 'Beyaz Eşya', present: false },
  ],
}

const disOzellikler = {
  title: 'Dış Özellikler',
  items: [
    { label: 'Asansör', present: true },
    { label: 'Kapalı Otopark', present: true },
    { label: 'Güvenlik', present: true },
    { label: 'Yüzme Havuzu', present: false },
    { label: 'Çocuk Parkı', present: true },
    { label: 'Jeneratör', present: true },
    { label: 'Spor Salonu', present: false },
    { label: 'Kamelya', present: true },
  ],
}

const fiyatGecmisi = [
  { x: 'Şub 26', y: 5450000 },
  { x: 'Mar 26', y: 5450000 },
  { x: 'Nis 26', y: 5650000 },
  { x: 'May 26', y: 5650000 },
  { x: 'Haz 26', y: 5490000 },
  { x: 'Tem 26', y: 5490000 },
]

const bolgeM2 = [
  { x: 'Şub 26', y: 38400 },
  { x: 'Mar 26', y: 39100 },
  { x: 'Nis 26', y: 40600 },
  { x: 'May 26', y: 41200 },
  { x: 'Haz 26', y: 42000 },
  { x: 'Tem 26', y: 42350 },
]

const randevuGunleri = [
  { date: '2026-07-18', label: 'Cmt 18 Tem', slots: [
    { time: '11:00', available: true }, { time: '13:00', available: false },
    { time: '15:00', available: true }, { time: '17:00', available: true },
  ] },
  { date: '2026-07-19', label: 'Paz 19 Tem', slots: [
    { time: '11:00', available: true }, { time: '13:00', available: true },
    { time: '15:00', available: false }, { time: '17:00', available: false },
  ] },
  { date: '2026-07-20', label: 'Pzt 20 Tem', slots: [
    { time: '10:00', available: true }, { time: '12:00', available: true },
    { time: '14:00', available: true }, { time: '16:00', available: true },
  ] },
]

const benzerler = [
  { id: 'k2', baslik: 'Aynı Sitede 2+1 Ara Kat', fiyat: '4.150.000 TL', konum: 'Zonguldak, Kozlu · 98 m²', renk: ['#3a6f5f', '#1f4a3a'] as const },
  { id: 'k3', baslik: 'Deniz Manzaralı 3+1 Yüksek Kat', fiyat: '6.200.000 TL', konum: 'Zonguldak, Merkez · 140 m²', renk: ['#3a7a8a', '#1f4a5f'] as const },
  { id: 'k4', baslik: 'Site İçinde 4+1 Dubleks', fiyat: '7.900.000 TL', konum: 'Zonguldak, Kozlu · 185 m²', renk: ['#8a6f3a', '#5f4a1f'] as const },
  { id: 'k5', baslik: 'Yeni Bina 1+1 Yatırımlık', fiyat: '2.850.000 TL', konum: 'Zonguldak, Merkez · 62 m²', renk: ['#6f3a5f', '#4a1f3a'] as const },
]

const columnStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 }

const skorlar = [
  { label: 'Yürünebilirlik', value: 78, description: 'Günlük işler yürüyerek' },
  { label: 'Ulaşım', value: 66, description: 'Durak 350 m' },
  { label: 'Okullar', value: 84, description: '3 okul 1 km içinde' },
  { label: 'Sessizlik', value: 58, description: 'Ana cadde yakın' },
]

const yakinCevre = [
  { id: 'ulasim', label: 'Ulaşım', places: [
    { name: 'Kozlu Dolmuş Durağı', distance: '350 m', note: '5 dk yürüme' },
    { name: 'Zonguldak Garı', distance: '4,2 km', note: '9 dk araç' },
    { name: 'Sahil Yolu Çıkışı', distance: '900 m' },
  ] },
  { id: 'egitim', label: 'Eğitim', places: [
    { name: 'Fatih İlkokulu', distance: '450 m', note: '6 dk yürüme' },
    { name: 'Kozlu Anadolu Lisesi', distance: '1,1 km' },
    { name: 'BEÜ Merkez Kampüs', distance: '6,8 km' },
  ] },
  { id: 'yasam', label: 'Yaşam', places: [
    { name: 'Migros', distance: '280 m', note: '4 dk yürüme' },
    { name: 'Kozlu Devlet Hastanesi', distance: '1,9 km' },
    { name: 'Sahil Yürüyüş Parkuru', distance: '750 m' },
  ] },
]

const riskler = [
  { id: 'deprem', label: 'Deprem', level: 3 as const, levelLabel: 'Orta', description: 'Bina 2020 yönetmeliğine uygun; zemin etüdü mevcut.', source: 'AFAD 2025' },
  { id: 'sel', label: 'Sel / Taşkın', level: 2 as const, levelLabel: 'Düşük', description: 'Dere yatağına 1,4 km; tarihsel taşkın kaydı yok.', source: 'DSİ 2024' },
  { id: 'yangin', label: 'Orman Yangını', level: 1 as const, levelLabel: 'Çok Düşük', description: 'Orman sınırına 3 km üzeri mesafe.', source: 'OGM 2025' },
  { id: 'zemin', label: 'Zemin', level: 2 as const, levelLabel: 'Düşük', description: 'Kaya zemin; sıvılaşma riski düşük.', source: 'Zemin Etüdü 2020' },
]

const yorumlar = [
  { author: 'Murat Kaya', rating: 5, date: '2 Temmuz 2026', text: 'Pelin Hanım gösterimde çok yardımcı oldu; daire ilandaki gibi, site sakin ve bakımlı.', verified: true, helpfulCount: 14 },
  { author: 'Zeynep Arslan', rating: 4, date: '19 Haziran 2026', text: 'Konum ve kat planı harika. Otopark girişi biraz dar, onun dışında beklediğim gibiydi.', verified: true, helpfulCount: 6 },
]

export function KonutIlanDetay() {
  const [favori, setFavori] = useState(false)

  return (
    <PublicShell title="İlan Detayı" onBack={noop}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', margin: 0 }}>
          Pelin'den Kozlu Fatih Sitesi'nde 3+1 Masrafsız Daire — 5.490.000 TL
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <GlassBreadcrumb
            items={[
              { label: 'Emlak', onClick: noop },
              { label: 'Konut', onClick: noop },
              { label: 'Zonguldak', onClick: noop },
              { label: 'Kozlu' },
            ]}
          />
          <GlassIconButton label="İlanı paylaş" onClick={noop}>
            <ShareIcon />
          </GlassIconButton>
        </div>

        {/* Dar ekranda sağ kolon alta düşer — sabit kolon yatay taşma yaratmasın */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
          {/* Sol kolon */}
          <div style={{ ...columnStyle, flex: '10 1 560px', minWidth: 0 }}>
            <GlassMediaGallery items={medya} variant="stage" label="İlan medyası" />

            <GlassTabs
              material="flat"
              tabs={[
                {
                  id: 'aciklama',
                  label: 'Açıklama',
                  content: (
                    <>
                      <p style={{ margin: '0 0 12px' }}>
                        Fatih Sitesi'nde, güney cepheli ve gün boyu ışık alan 3+1 daire. Ankastre
                        mutfak, ebeveyn banyosu ve giyinme odasıyla masrafsız; kombi ve klimalar
                        yeni değişti. Site içinde kapalı otopark, güvenlik ve çocuk parkı mevcut.
                      </p>
                      <p style={{ margin: 0 }}>
                        Okullara ve sahil yürüyüş yoluna yürüme mesafesinde. Tapu kat mülkiyetli,
                        krediye uygun; ekspertiz eşliğinde yerinde gösterim yapılır.
                      </p>
                    </>
                  ),
                },
                {
                  id: 'ozellikler',
                  label: 'Özellikler',
                  content: <GlassFeatureGroup groups={[icOzellikler, disOzellikler]} variant="checklist" />,
                },
                {
                  id: 'konum',
                  label: 'Konum',
                  content: (
                    <div style={columnStyle}>
                      <GlassMap
                        pins={[{ id: 'ilan', x: 0.46, y: 0.42, price: '5.49M' }]}
                        defaultSelectedId="ilan"
                        popupContent={() => <span>Fatih Sitesi — Kozlu</span>}
                        privacyCircle={{ x: 0.46, y: 0.42, r: 0.09 }}
                        variant="inline"
                        aria-label="İlan konumu haritası"
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                        {skorlar.map((s) => (
                          <GlassScoreMeter key={s.label} value={s.value} label={s.label} description={s.description} variant="bar" />
                        ))}
                      </div>
                      <GlassNearbyPlaces categories={yakinCevre} variant="tabs" aria-label="Yakın çevre" />
                    </div>
                  ),
                },
                {
                  id: 'fiyat-analizi',
                  label: 'Fiyat Analizi',
                  content: (
                    <div style={columnStyle}>
                      <GlassChart
                        type="area"
                        points={fiyatGecmisi}
                        valueSuffix=" TL"
                        aria-label="İlan fiyat geçmişi: 5.45M'den 5.49M'ye"
                      />
                      <GlassChart
                        type="line"
                        points={bolgeM2}
                        valueSuffix=" TL/m²"
                        height={160}
                        aria-label="Bölge ortalama m² fiyatı: 38.400'den 42.350'ye"
                      />
                      <span style={{ fontSize: 13, color: 'var(--lg-label-secondary)' }}>
                        Bu ilan bölge ortalamasının m² başına %1,2 altında listeleniyor.
                      </span>
                    </div>
                  ),
                },
              ]}
            />

            <GlassFeatureGroup groups={kunye} variant="columns" columns={2} />

            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Yerinde Görme Randevusu</h2>
              <GlassTourScheduler
                days={randevuGunleri}
                onRequest={noop}
                onAddToCalendar={noop}
                variant="grid"
              />
            </section>

            <GlassClimateRiskPanel hazards={riskler} variant="detailed" title="Bölge Risk Değerlendirmesi" />

            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Satıcı Değerlendirmeleri</h2>
              <GlassRating variant="summary" value={4.6} distribution={[18, 6, 2, 1, 0]} />
              {yorumlar.map((y) => (
                <GlassReviewCard key={y.author} {...y} onHelpful={noop} />
              ))}
            </section>
          </div>

          {/* Sağ kolon */}
          <div style={{ ...columnStyle, flex: '1 1 320px', maxWidth: 480 }}>
            <GlassPriceHeader
              material="flat"
              title="Pelin'den Kozlu Fatih Sitesi'nde 3+1 Masrafsız Daire"
              price="5.490.000 TL"
              priceTint="var(--lg-accent, #b45309)"
              meta="Zonguldak, Kozlu · 145 m² brüt · 4. kat · 16 Temmuz 2026 · 2.417 görüntülenme"
              badges={<EidsBadge dogrulandi />}
              actions={
                <GlassIconButton
                  label={favori ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  active={favori}
                  tint="#ff453a"
                  onClick={() => setFavori((f) => !f)}
                >
                  <HeartIcon />
                </GlassIconButton>
              }
            />
            <GlassSellerCard
              name="Pelin Aydın"
              memberSince="Üyelik: Mart 2021"
              phone="0 (534) 210 98 76"
              verified
              onMessage={noop}
              material="flat"
            />
            <GlassLoanCalculator
              variant="compact"
              defaultPrice={5490000}
              defaultDownPaymentPercent={25}
              defaultTermYears={10}
              ctaLabel="Kredi Tekliflerini Gör"
              onCtaClick={noop}
            />
          </div>
        </div>

        <section style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.022em' }}>Benzer Konutlar</h2>
          <GlassCarousel label="Benzer konut ilanları">
            {benzerler.map((b) => (
              <GlassListingCard
                key={b.id}
                image={{ src: placeholderImage(b.baslik.split(' ')[0], b.renk[0], b.renk[1], 480, 360), alt: '' }}
                title={b.baslik}
                price={b.fiyat}
                location={b.konum}
                onClick={noop}
                material="flat"
              />
            ))}
          </GlassCarousel>
        </section>
      </div>
    </PublicShell>
  )
}
