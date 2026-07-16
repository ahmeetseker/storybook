import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ayarlar } from './Ayarlar'

const meta = {
  title: 'Sayfalar/Hesabım/Ayarlar',
  component: Ayarlar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Ayarlar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
