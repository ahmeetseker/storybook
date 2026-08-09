import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmlakEndeksi } from './EmlakEndeksi'

const meta = {
  title: 'Sayfalar/Public/Emlak Endeksi',
  component: EmlakEndeksi,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EmlakEndeksi>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
