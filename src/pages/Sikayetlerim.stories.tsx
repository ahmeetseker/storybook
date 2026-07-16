import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sikayetlerim } from './Sikayetlerim'

const meta = {
  title: 'Sayfalar/Hesabım/Şikâyetlerim',
  component: Sikayetlerim,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sikayetlerim>

export default meta
type Story = StoryObj<typeof meta>

/** Üç durum bir arada: İncelemede (warning), Sonuçlandı (success), Reddedildi (neutral). */
export const Default: Story = {}

/** Hiç şikâyet gönderilmemişken gösterilen boş durum. */
export const BosDurum: Story = {
  args: { sikayetler: [] },
}
