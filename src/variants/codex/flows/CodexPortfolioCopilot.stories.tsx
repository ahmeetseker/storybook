import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexAiMarketplace } from './CodexAiMarketplace'

const meta = {
  title: 'Codex Enterprise/11 AI Ürün Vizyonu/03 Portföy Copilot',
  component: CodexAiMarketplace,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true, defaultTheme: 'paper' },
    docs: { description: { component: 'Kurumsal portföy performansını tarayan, araç kullanımını kayda alan ve dış etkili her işlemde açık insan onayı isteyen denetlenebilir AI ajanı.' } },
  },
  args: { variant: 'portfolio-copilot', state: 'ready' },
} satisfies Meta<typeof CodexAiMarketplace>

export default meta
type Story = StoryObj<typeof meta>

export const Hazir: Story = { name: 'Hazır · Onay bekleyen plan' }
export const Calisiyor: Story = { name: 'Çalışıyor · Canlı araç günlüğü', args: { state: 'loading' } }
export const PortfoyBos: Story = { name: 'Boş · İlk portföy', args: { state: 'empty' } }
export const ModelHatasi: Story = { name: 'Hata · Toplu işlem kapalı', args: { state: 'error' } }
export const Mobil: Story = {
  name: 'Mobil · Operasyon özeti',
  globals: { designTheme: 'codex-paper', forceTier: 'fallback', viewport: 'mobile1' },
}
export const Graphite: Story = {
  name: 'Graphite · Operasyon merkezi',
  globals: { designTheme: 'codex-graphite', forceTier: 'fallback' },
}
