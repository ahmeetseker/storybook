import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassBreadcrumb } from './GlassBreadcrumb'

const meta = {
  title: 'Components/GlassBreadcrumb',
  component: GlassBreadcrumb,
  tags: ['autodocs'],
} satisfies Meta<typeof GlassBreadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Vasıta', onClick: fn() },
      { label: 'Otomobil', onClick: fn() },
      { label: 'Volkswagen', onClick: fn() },
      { label: 'Golf 1.6 TDI' },
    ],
  },
}

export const TwoLevels: Story = {
  args: {
    items: [{ label: 'Emlak', onClick: fn() }, { label: 'Satılık Daire' }],
  },
}
