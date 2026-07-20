import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexAiMarketplace } from './CodexAiMarketplace'

const meta = {
  title: 'Codex Enterprise/11 AI Ürün Vizyonu/02 İlan Intelligence',
  component: CodexAiMarketplace,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true, defaultTheme: 'paper' },
    docs: { description: { component: 'İlan, görsel, tapu, imar, fiyat, konum ve satıcı güven sinyallerini tek karar yüzeyinde birleştiren intelligence deneyimi.' } },
  },
  args: { variant: 'listing-intelligence', state: 'ready' },
} satisfies Meta<typeof CodexAiMarketplace>

export default meta
type Story = StoryObj<typeof meta>

export const Hazir: Story = { name: 'Hazır · Tam intelligence' }
export const AnalizEdiliyor: Story = { name: 'Yükleniyor · Görsel ve kaynak analizi', args: { state: 'loading' } }
export const VeriEksik: Story = { name: 'Boş · Yeni ilan', args: { state: 'empty' } }
export const KaynakHatasi: Story = { name: 'Hata · Son doğrulanmış veri', args: { state: 'error' } }
export const Mobil: Story = {
  name: 'Mobil · Karar özeti',
  globals: { designTheme: 'codex-paper', forceTier: 'fallback', viewport: 'mobile1' },
}
export const Mineral: Story = {
  name: 'Mineral · Kurumsal görünüm',
  globals: { designTheme: 'codex-mineral', forceTier: 'fallback' },
}
