import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassSellerCard } from './GlassSellerCard'

const meta = {
  title: 'Components/GlassSellerCard',
  component: GlassSellerCard,
  tags: ['autodocs'],
  args: { onPhoneReveal: fn(), onMessage: fn() },
} satisfies Meta<typeof GlassSellerCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Mehmet Yılmaz',
    memberSince: 'Üyelik: Ocak 2019',
    phone: '0 (532) 123 45 67',
    verified: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '48px auto' }}>
      <GlassSellerCard {...args} />
    </div>
  ),
}

export const WithoutPhone: Story = {
  args: { name: 'Ayşe Demir', memberSince: 'Üyelik: Mart 2023' },
  render: Default.render,
}

export const Minimal: Story = {
  args: { name: 'Galeri Kaya Otomotiv', onMessage: undefined, phone: '0 (216) 348 22 11' },
  render: Default.render,
}
