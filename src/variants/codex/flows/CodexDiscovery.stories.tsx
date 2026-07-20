import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexAiMarketplace } from './CodexAiMarketplace'

const meta = {
  title: 'Codex Enterprise/11 AI Ürün Vizyonu/01 Doğal Dil Arama',
  component: CodexAiMarketplace,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true, defaultTheme: 'paper' },
    docs: { description: { component: 'Kullanıcı dilini açıklanabilir filtrelere dönüştüren; kaynak, güven ve manuel düzenleme kontrolünü koruyan uçtan uca ilan keşfi.' } },
  },
  args: { variant: 'discovery', state: 'ready' },
} satisfies Meta<typeof CodexAiMarketplace>

export default meta
type Story = StoryObj<typeof meta>

export const Hazir: Story = { name: 'Hazır · Kaynaklı sonuçlar' }
export const Yukleniyor: Story = { name: 'Yükleniyor · Aşamalı açıklama', args: { state: 'loading' } }
export const SonucYok: Story = { name: 'Boş · Güvenli gevşetme önerisi', args: { state: 'empty' } }
export const ServisHatasi: Story = { name: 'Hata · Standart aramaya dönüş', args: { state: 'error' } }
export const Mobil: Story = {
  name: 'Mobil · Hazır',
  globals: { designTheme: 'codex-paper', forceTier: 'fallback', viewport: 'mobile1' },
}
export const Graphite: Story = {
  name: 'Graphite · Düşük ışık',
  globals: { designTheme: 'codex-graphite', forceTier: 'fallback' },
}
