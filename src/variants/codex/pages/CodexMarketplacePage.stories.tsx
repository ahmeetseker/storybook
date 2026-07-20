import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexMarketplacePage } from './CodexMarketplacePage'

const meta = {
  title: 'Codex Enterprise/10 Sayfalar/00 Tasarım Yönleri',
  component: CodexMarketplacePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['workspace', 'editorial', 'intelligence'],
      description: 'Renkten bağımsız sayfa kompozisyonu ve bilgi yoğunluğu yönü.',
    },
  },
} satisfies Meta<typeof CodexMarketplacePage>

export default meta
type Story = StoryObj<typeof meta>

/** Önerilen başlangıç: tanıdık ürün düzeni, dengeli yoğunluk ve en az dekorasyon. */
export const PaperWorkspace: Story = {
  args: { variant: 'workspace' },
  globals: { designTheme: 'codex-paper', forceTier: 'fallback' },
}

/** Daha seçkisel ve içerik odaklı yön: büyük tipografi, asimetrik featured ilan ve bölge notu. */
export const MineralEditorial: Story = {
  args: { variant: 'editorial' },
  globals: { designTheme: 'codex-mineral', forceTier: 'fallback' },
}

/** Profesyonel kullanım yönü: koyu yüzey, liste + fiyat haritası + piyasa sinyalleri. */
export const GraphiteIntelligence: Story = {
  args: { variant: 'intelligence' },
  globals: { designTheme: 'codex-graphite', forceTier: 'fallback' },
}

/** Controls üzerinden sayfa yapısı ve tema kombinasyonlarını serbestçe karşılaştırın. */
export const Playground: Story = {
  args: { variant: 'workspace' },
  parameters: { codex: { fullCanvas: true, defaultTheme: 'paper' } },
}
