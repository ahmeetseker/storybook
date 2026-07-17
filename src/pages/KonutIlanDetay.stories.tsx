import type { Meta, StoryObj } from '@storybook/react-vite'
import { KonutIlanDetay } from './KonutIlanDetay'

const meta = {
  title: 'Sayfalar/Public/İlan Detay (Konut)',
  component: KonutIlanDetay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof KonutIlanDetay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
