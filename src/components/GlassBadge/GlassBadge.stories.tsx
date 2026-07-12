import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassBadge } from './GlassBadge'

const meta = {
  title: 'Components/GlassBadge',
  component: GlassBadge,
  tags: ['autodocs'],
  argTypes: {
    tint: { control: 'color' },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof GlassBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'Yeni' } }
export const Urgent: Story = { args: { children: 'Acil', tint: '#ff453a' } }
export const Featured: Story = { args: { children: 'Öne Çıkan', tint: '#ff9f0a', size: 'md' } }
export const Sold: Story = { args: { children: 'Satıldı', tint: '#8e8e93' } }
