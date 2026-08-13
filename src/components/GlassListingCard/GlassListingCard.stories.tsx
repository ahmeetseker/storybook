import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassListingCard } from './GlassListingCard'
import { GlassBadge } from '../GlassBadge'
import { GlassRibbon } from '../GlassRibbon'
import { placeholderImage } from '../../demo/placeholderImage'

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassListingCard',
  component: GlassListingCard,
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof GlassListingCard>

export default meta
type Story = StoryObj<typeof meta>

const amenityIcon = (path: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d={path} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PrimePickBadge = () => (
  <GlassBadge material="flat" tone="dark">
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" strokeLinejoin="round" />
    </svg>
    Öne Çıkan
  </GlassBadge>
)

const referenceAmenities = [
  { label: 'Wifi', icon: amenityIcon('M4 9a12 12 0 0 1 16 0M7 13a7.5 7.5 0 0 1 10 0M10.5 17a2.4 2.4 0 0 1 3 0M12 20h.01') },
  { label: 'Mutfak', icon: amenityIcon('M5 3v7m3-7v7M3 7h7m-3 3v11m7-18v18m0-11h4a3 3 0 0 0 0-6h-4') },
  { label: 'Spor', icon: amenityIcon('M3 10v4m3-6v8m12-8v8m3-6v4M6 12h12') },
  { label: 'Otopark', icon: amenityIcon('M5 21V5h8a4 4 0 0 1 0 8H9m0-4h4') },
] as const

const referenceArgs = {
  title: 'Modern Urban Loft – NYC',
  price: '$210',
  priceSuffix: '/Ay',
  location: 'Manhattan, New York',
  reviewCount: '2 bin değerlendirme',
  amenities: referenceAmenities,
  actionLabel: 'Detayları Gör',
} as const

export const Default: Story = {
  args: {
    image: { src: placeholderImage('Clio', '#3a5f8a', '#1f3a5f', 480, 360), alt: 'Renault Clio' },
    title: 'Renault Clio 1.0 TCe Touch — Boyasız, Değişensiz',
    price: '785.000 TL',
    location: 'İstanbul, Maltepe',
  },
}

export const Playground: Story = {
  args: {
    ...referenceArgs,
    variant: 'details',
    image: { src: '/images/listings/organic-loft.png', alt: 'Organik formlu modern loft yatak odası' },
  },
}

/** Kullanıcının verdiği referanstaki açık içerik ve görsel-üstü düzenlerin birebir karşılaştırması. */
export const ReferansVaryantlar: Story = {
  args: {
    ...referenceArgs,
    image: { src: '/images/listings/organic-loft.png', alt: 'Organik formlu modern loft yatak odası' },
  },
  parameters: { layout: 'fullscreen', backgrounds: { disable: true } },
  render: (args) => (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 56,
        flexWrap: 'wrap',
        padding: 64,
        background: 'linear-gradient(135deg, #e8e5df, #d9deea)',
      }}
    >
      <GlassListingCard {...args} variant="details" material="flat" />
      <GlassListingCard
        {...args}
        variant="overlay"
        material="flat"
        image={{ src: '/images/listings/urban-office-pod.png', alt: 'Manhattan manzaralı koyu metal çalışma podu' }}
      />
    </div>
  ),
}

/** İkinci referanstaki sağ kart: tek parça görsel, koyu alt bilgi yüzeyi ve ilan metrikleri. */
export const SagKartReferansi: Story = {
  args: {
    variant: 'propertyOverlay',
    material: 'flat',
    image: { src: '/images/listings/nordic-farmhouse.png', alt: 'Çayır içindeki beyaz İskandinav kır evi' },
    badge: <PrimePickBadge />,
    pricePrefix: 'Liste:',
    price: '$250.000',
    title: 'Harry Koningsbergstr.,',
    location: '1063 AG Guillaume Briard',
    metrics: [
      { value: '29 m²', label: 'Yaşam' },
      { value: '2', label: 'Oda' },
    ],
    seller: 'Waleed Sabir',
    listedAt: '2 gün önce',
    'aria-label': 'Öne çıkan ilan. Liste fiyatı 250 bin dolar. 29 metrekare, 2 oda. Waleed Sabir tarafından 2 gün önce yayınlandı.',
  },
  parameters: { layout: 'fullscreen', backgrounds: { disable: true } },
  decorators: [
    (Story) => (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 64,
          background: '#eeeeee',
        }}
      >
        <Story />
      </div>
    ),
  ],
}

export const WithBadge: Story = {
  args: {
    ...Default.args,
    badge: <GlassBadge tint="#ff453a">Acil</GlassBadge>,
  },
}

/**
 * Statü sunumu standardı (2026-08-13): doğrulama köşe KURDELESİDİR
 * (`badge` + `badgePlacement="corner"`), diğer tüm statüler sol üstte opak
 * kapsül istifi (`statuses`). Kurdeleyle birlikte istif kurdele penceresinin
 * altından başlar — çakışma/kırpılma olmaz.
 */
export const StatuKapsulleri: Story = {
  name: 'Statü kapsülleri',
  args: { ...Default.args },
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>Yalnız statü</p>
        <GlassListingCard
          {...args}
          statuses={[{ label: 'Yetki bekliyor · Temsili', tone: 'warning' }]}
        />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>Kurdele + statü istifi</p>
        <GlassListingCard
          {...args}
          badge={<GlassRibbon label="Doğrulanmış" note="Temsili görsel" />}
          badgePlacement="corner"
          statuses={[
            { label: 'Fiyat düştü', tone: 'success' },
            { label: 'İnceleniyor', tone: 'warning' },
          ]}
        />
      </div>
    </div>
  ),
}

/** Malzeme ekseni yan yana: içerik listelerinde `flat` önerilir, cam navigasyon katmanına aittir (bkz. rules.md Do/Don't). */
export const Materials: Story = {
  args: { ...Default.args },
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: 32 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>material="glass" (default)</p>
        <GlassListingCard {...args} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>material="flat"</p>
        <GlassListingCard {...args} material="flat" />
      </div>
    </div>
  ),
}

export const Variants: Story = {
  args: { ...Default.args },
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: 32 }}>
      <GlassListingCard {...Default.args!} variant="compact" />
      <GlassListingCard {...referenceArgs} variant="details" image={{ src: '/images/listings/organic-loft.png', alt: '' }} />
      <GlassListingCard {...referenceArgs} variant="overlay" image={{ src: '/images/listings/urban-office-pod.png', alt: '' }} />
      <GlassListingCard
        variant="propertyOverlay"
        image={{ src: '/images/listings/nordic-farmhouse.png', alt: '' }}
        badge={<PrimePickBadge />}
        pricePrefix="Liste:"
        price="$250.000"
        title="Harry Koningsbergstr.,"
        location="1063 AG Guillaume Briard"
        metrics={[{ value: '29 m²', label: 'Yaşam' }, { value: '2', label: 'Oda' }]}
        seller="Waleed Sabir"
        listedAt="2 gün önce"
      />
    </div>
  ),
}

/** Görsel state matrisi: default · disabled (opacity .45, tıklama + basınç animasyonu kapalı) · flat + disabled. */
export const States: Story = {
  args: { ...Default.args },
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: 32 }}>
      <GlassListingCard {...args} />
      <GlassListingCard {...args} disabled />
      <GlassListingCard {...args} material="flat" disabled />
    </div>
  ),
}

/** Uzun başlık 2 satırda clamp'lenir, sonrası kırpılır — tam metin detay sayfasının işidir. Fiyat/konum yerinden oynamaz. */
export const UzunBaslik: Story = {
  args: {
    image: { src: placeholderImage('Passat', '#5f3a8a', '#3a1f5f', 480, 360) },
    title:
      'Volkswagen Passat 1.5 TSI Elegance — İlk Sahibinden, Boyasız, Değişensiz, Tramersiz, Bakımları Yetkili Serviste Yapılmış, Garaj Arabası',
    price: '1.875.000 TL',
    location: 'İstanbul, Beşiktaş',
  },
}

/** Carousel dışında grid kullanımı: kart genişliği sabit 240px olduğundan grid kolonları karta göre dizilir, kart esnemez. */
export const GridKullanimi: Story = {
  args: { ...Default.args },
  render: () => {
    const ilanlar = [
      { title: 'Renault Clio 1.0 TCe Touch — Boyasız, Değişensiz', price: '785.000 TL', location: 'İstanbul, Maltepe', label: 'Clio', from: '#3a5f8a', to: '#1f3a5f' },
      { title: 'Ford Focus 1.5 EcoBlue Titanium', price: '1.050.000 TL', location: 'Ankara, Çankaya', label: 'Focus', from: '#5f3a8a', to: '#3a1f5f' },
      { title: 'Toyota Corolla 1.8 Hybrid Dream', price: '1.320.000 TL', location: 'İzmir, Bornova', label: 'Corolla', from: '#3a8a5f', to: '#1f5f3a' },
      { title: 'Honda Civic 1.5 VTEC Executive', price: '1.410.000 TL', location: 'Bursa, Nilüfer', label: 'Civic', from: '#8a5f3a', to: '#5f3a1f' },
      { title: 'Peugeot 308 1.2 PureTech Allure', price: '960.000 TL', location: 'Antalya, Muratpaşa', label: '308', from: '#8a3a3a', to: '#5f1f1f' },
      { title: 'Fiat Egea 1.4 Fire Urban', price: '690.000 TL', location: 'Konya, Selçuklu', label: 'Egea', from: '#3a7a8a', to: '#1f4a5f' },
    ]
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 240px)',
          gap: 16,
          justifyContent: 'center',
          maxWidth: 800,
          margin: '48px auto',
        }}
      >
        {ilanlar.map((ilan) => (
          <GlassListingCard
            key={ilan.title}
            image={{ src: placeholderImage(ilan.label, ilan.from, ilan.to, 480, 360), alt: ilan.title }}
            title={ilan.title}
            price={ilan.price}
            location={ilan.location}
            material="flat"
            onClick={fn()}
          />
        ))}
      </div>
    )
  },
}

export const Responsive: Story = {
  args: {
    ...referenceArgs,
    variant: 'overlay',
    image: { src: '/images/listings/urban-office-pod.png', alt: 'Manhattan manzaralı çalışma podu' },
  },
  parameters: { viewport: { defaultViewport: 'mobile360' } },
  decorators: [(Story) => <div style={{ padding: 16 }}><Story /></div>],
}

export const Erisilebilirlik: Story = {
  args: {
    ...referenceArgs,
    variant: 'details',
    image: { src: '/images/listings/organic-loft.png', alt: '' },
    'aria-label': 'Modern Urban Loft, Manhattan New York; aylık 210 dolar. Detayları gör',
  },
}
