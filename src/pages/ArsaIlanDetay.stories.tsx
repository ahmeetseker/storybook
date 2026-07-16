import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArsaIlanDetay } from './ArsaIlanDetay'

const meta = {
  title: 'Sayfalar/Public/İlan Detay (Arsa)',
  component: ArsaIlanDetay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ArsaIlanDetay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
