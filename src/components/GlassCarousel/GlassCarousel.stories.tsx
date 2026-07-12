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

export const SimilarListings: Story = {
  args: { label: 'Benzer ilanlar' },
  render: (args) => (
    <div style={{ maxWidth: 780, margin: '48px auto' }}>
      <GlassCarousel {...args}>
        {cars.map((car, i) => (
          <GlassListingCard
            key={car.title}
            image={{ src: placeholderImage(car.title.split(' ')[0], car.from, car.to, 480, 360), alt: car.title }}
            title={car.title}
            price={car.price}
            location={car.location}
            badge={i === 0 ? <GlassBadge tint="#ff9f0a">Öne Çıkan</GlassBadge> : undefined}
            onClick={fn()}
          />
        ))}
      </GlassCarousel>
    </div>
  ),
}
