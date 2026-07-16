import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassCarousel } from './GlassCarousel'
import { GlassListingCard } from '../GlassListingCard'
import { GlassBadge } from '../GlassBadge'
import { placeholderImage } from '../../demo/placeholderImage'

const cars = [
  { title: 'Renault Clio 1.0 TCe Touch', price: '785.000 TL', location: 'İstanbul, Maltepe', from: '#3a5f8a', to: '#1f3a5f' },
  { title: 'Ford Focus 1.5 EcoBlue Titanium', price: '1.050.000 TL', location: 'Ankara, Çankaya', from: '#5f3a8a', to: '#3a1f5f' },
  { title: 'Toyota Corolla 1.8 Hybrid Dream', price: '1.320.000 TL', location: 'İzmir, Bornova', from: '#3a8a5f', to: '#1f5f3a' },
  { title: 'Honda Civic 1.5 VTEC Executive', price: '1.410.000 TL', location: 'Bursa, Nilüfer', from: '#8a5f3a', to: '#5f3a1f' },
  { title: 'Peugeot 308 1.2 PureTech Allure', price: '960.000 TL', location: 'Antalya, Muratpaşa', from: '#8a3a3a', to: '#5f1f1f' },
  { title: 'Fiat Egea 1.4 Fire Urban', price: '690.000 TL', location: 'Konya, Selçuklu', from: '#3a7a8a', to: '#1f4a5f' },
]

const meta = {
  title: 'Components/GlassCarousel',
  component: GlassCarousel,
  tags: ['autodocs'],
} satisfies Meta<typeof GlassCarousel>

export default meta
type Story = StoryObj<typeof meta>

/** Yalın çocuk: carousel görünmez iskelettir, çocuk kendi sabit genişliğini getirir (`flex: none` zorlar). */
const KategoriKarti = ({ ad, from, to }: { ad: string; from: string; to: string }) => (
  <div
    style={{
      width: 180,
      height: 110,
      borderRadius: 16,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      color: 'rgba(255,255,255,.92)',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 14,
      fontSize: 15,
      fontWeight: 600,
      boxSizing: 'border-box',
    }}
  >
    {ad}
  </div>
)

const kategoriler = [
  { ad: 'Otomobil', from: '#3a5f8a', to: '#1f3a5f' },
  { ad: 'Emlak', from: '#5f3a8a', to: '#3a1f5f' },
  { ad: 'İkinci El Eşya', from: '#3a8a5f', to: '#1f5f3a' },
  { ad: 'Elektronik', from: '#8a5f3a', to: '#5f3a1f' },
  { ad: 'Yedek Parça', from: '#8a3a3a', to: '#5f1f1f' },
  { ad: 'Bahçe & Yapı Market', from: '#3a7a8a', to: '#1f4a5f' },
  { ad: 'Giyim & Aksesuar', from: '#6a8a3a', to: '#3f5f1f' },
]

export const Default: Story = {
  args: { label: 'Kategoriler' },
  render: (args) => (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <GlassCarousel {...args}>
        {kategoriler.map((k) => (
          <KategoriKarti key={k.ad} {...k} />
        ))}
      </GlassCarousel>
    </div>
  ),
}

const listingCards = (list: typeof cars) =>
  list.map((car, i) => (
    <GlassListingCard
      key={`${car.title}-${i}`}
      image={{ src: placeholderImage(car.title.split(' ')[0], car.from, car.to, 480, 360), alt: car.title }}
      title={car.title}
      price={car.price}
      location={car.location}
      badge={i === 0 ? <GlassBadge tint="#ff9f0a">Öne Çıkan</GlassBadge> : undefined}
      onClick={fn()}
    />
  ))

export const SimilarListings: Story = {
  args: { label: 'Benzer ilanlar' },
  render: (args) => (
    <div style={{ maxWidth: 780, margin: '48px auto' }}>
      <GlassCarousel {...args}>{listingCards(cars)}</GlassCarousel>
    </div>
  ),
}

/** Tek kart: içerik container'a sığar; oklar yine render olur ama tıklama etkisizdir (bkz. rules.md Açık Kararlar). */
export const TekKart: Story = {
  args: { label: 'Benzer ilanlar' },
  render: (args) => (
    <div style={{ maxWidth: 780, margin: '48px auto' }}>
      <GlassCarousel {...args}>{listingCards(cars.slice(0, 1))}</GlassCarousel>
    </div>
  ),
}

/** Çok sayıda kart (18): şerit uzar, ok tıklaması görünür genişliğin %80'i kadar kaydırır, uçlarda sarma yoktur. */
export const CokKart: Story = {
  args: { label: 'Vitrindeki ilanlar' },
  render: (args) => (
    <div style={{ maxWidth: 780, margin: '48px auto' }}>
      <GlassCarousel {...args}>{listingCards([...cars, ...cars, ...cars])}</GlassCarousel>
    </div>
  ),
}

/** Dar container (320px, telefon genişliği): kart kısmen taşar, snap `start` hizalar, oklar kenarda kalır. */
export const DarContainer: Story = {
  args: { label: 'Benzer ilanlar' },
  render: (args) => (
    <div style={{ maxWidth: 320, margin: '48px auto' }}>
      <GlassCarousel {...args}>{listingCards(cars)}</GlassCarousel>
    </div>
  ),
}
