import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexAiMarketplace } from './CodexAiMarketplace'

const meta = {
  title: 'Codex Enterprise/11 AI Ürün Vizyonu/04 İnsan Kontrollü Moderasyon',
  component: CodexAiMarketplace,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true, defaultTheme: 'paper' },
    docs: { description: { component: 'AI risk sıralamasını, belge ve görsel dayanaklarıyla sunan; yayın veya yaptırım kararını yetkili insanda tutan güven operasyonu.' } },
  },
  args: { variant: 'moderation', state: 'ready' },
} satisfies Meta<typeof CodexAiMarketplace>

export default meta
type Story = StoryObj<typeof meta>

export const Hazir: Story = { name: 'Hazır · Öncelikli vaka' }
export const AnalizEdiliyor: Story = { name: 'Yükleniyor · Kuyruk ve görsel analiz', args: { state: 'loading' } }
export const KuyrukBos: Story = { name: 'Boş · Kuyruk temiz', args: { state: 'empty' } }
export const BelgeHatasi: Story = { name: 'Hata · Manuel inceleme', args: { state: 'error' } }
export const Mobil: Story = {
  name: 'Mobil · Vaka özeti',
  globals: { designTheme: 'codex-paper', forceTier: 'fallback', viewport: 'mobile1' },
}
export const Graphite: Story = {
  name: 'Graphite · Güven operasyonu',
  globals: { designTheme: 'codex-graphite', forceTier: 'fallback' },
}
