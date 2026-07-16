import type { Meta, StoryObj } from '@storybook/react-vite'
import { HesapDogrula } from './HesapDogrula'

const meta = {
  title: 'Sayfalar/Public/Hesap Doğrula',
  component: HesapDogrula,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HesapDogrula>

export default meta
type Story = StoryObj<typeof meta>

/** "Doğrulanıyor" ile başlar, ~2 sn sonra başarıya geçer */
export const Default: Story = {}

export const Basarili: Story = {
  args: { baslangicDurumu: 'basarili' },
}

/** Yeniden gönder CTA'sı akışı baştan başlatır */
export const SuresiDoldu: Story = {
  args: { baslangicDurumu: 'suresi-doldu' },
}
