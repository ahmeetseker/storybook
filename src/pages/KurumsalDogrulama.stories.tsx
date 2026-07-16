import type { Meta, StoryObj } from '@storybook/react-vite'
import { KurumsalDogrulama } from './KurumsalDogrulama'

const meta = {
  title: 'Sayfalar/Hesabım/Kurumsal Doğrulama',
  component: KurumsalDogrulama,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof KurumsalDogrulama>

export default meta
type Story = StoryObj<typeof meta>

/** İnceleme sürerken: eksik belge uyarısı (amber) + zaman çizelgesi. */
export const Default: Story = {}

/** Moderasyon düzeltme istedi: danger kutu — "Yetki belgesi okunaksız — yeniden yükleyin". */
export const DuzeltmeTalebi: Story = {
  args: { duzeltmeTalebi: true },
}
