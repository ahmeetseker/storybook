import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassLocationCard } from './GlassLocationCard'

const meta = {
  title: 'Components/GlassLocationCard',
  component: GlassLocationCard,
  tags: ['autodocs'],
} satisfies Meta<typeof GlassLocationCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    address: 'İstanbul, Kadıköy — Fenerbahçe Mah.',
    note: 'Güvenlik nedeniyle konum yaklaşık gösterilir.',
    onOpenMap: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '48px auto' }}>
      <GlassLocationCard {...args} />
    </div>
  ),
}

export const WithoutButton: Story = {
  args: { address: 'Ankara, Çankaya — Bahçelievler Mah.' },
  render: Default.render,
}
