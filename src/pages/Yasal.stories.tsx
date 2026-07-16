import type { Meta, StoryObj } from '@storybook/react-vite'
import { Yasal } from './Yasal'

const meta = {
  title: 'Sayfalar/Public/Yasal',
  component: Yasal,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Yasal>

export default meta
type Story = StoryObj<typeof meta>

/** /yasal/kvkk — KVKK Aydınlatma Metni açık */
export const Default: Story = {}

export const IlanKurallari: Story = {
  args: { baslangicSayfa: 'ilan-kurallari' },
}
