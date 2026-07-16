import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bildirimler } from './Bildirimler'

const meta = {
  title: 'Sayfalar/Hesabım/Bildirimler',
  component: Bildirimler,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Bildirimler>

export default meta
type Story = StoryObj<typeof meta>

/** Chip filtresi ve "tümünü okundu işaretle" butonu canlı state ile çalışır. */
export const Default: Story = {}
