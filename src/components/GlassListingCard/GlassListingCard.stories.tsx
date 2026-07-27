import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassListingCard } from './GlassListingCard'
import { GlassBadge } from '../GlassBadge'
import { placeholderImage } from '../../demo/placeholderImage'

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassListingCard',
  component: GlassListingCard,
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof GlassListingCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    image: { src: placeholderImage('Clio', '#3a5f8a', '#1f3a5f', 480, 360), alt: 'Renault Clio' },
    title: 'Renault Clio 1.0 TCe Touch — Boyasız, Değişensiz',
    price: '785.000 TL',
    location: 'İstanbul, Maltepe',
  },
}

export const WithBadge: Story = {
  args: {
    ...Default.args,
    badge: <GlassBadge tint="#ff453a">Acil</GlassBadge>,
  },
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
