import type { Meta, StoryObj } from '@storybook/react-vite'
import { Giris } from './Giris'

const meta = {
  title: 'Sayfalar/Public/Giriş',
  component: Giris,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Giris>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Yanlış kimlik bilgisi girildiğinde: banner + geçersiz alanlar + alan hatası */
export const HataDurumu: Story = {
  args: { hata: true },
}
