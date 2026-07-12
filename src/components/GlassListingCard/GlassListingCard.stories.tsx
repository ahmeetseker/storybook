import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassListingCard } from './GlassListingCard'
import { GlassBadge } from '../GlassBadge'
import { placeholderImage } from '../../demo/placeholderImage'

const meta = {
  title: 'Components/GlassListingCard',
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
