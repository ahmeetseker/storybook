import type { Meta, StoryObj } from '@storybook/react-vite'
import { Mesajlar } from './Mesajlar'

const meta = {
  title: 'Sayfalar/Hesabım/Mesajlar',
  component: Mesajlar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Mesajlar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Hiç konuşma yokken gösterilen boş durum. */
export const BosDurum: Story = {
  args: { bos: true },
}
