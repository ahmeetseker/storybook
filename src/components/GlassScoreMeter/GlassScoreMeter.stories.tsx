import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassScoreMeter } from './GlassScoreMeter'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassScoreMeter',
  component: GlassScoreMeter,
  tags: ['autodocs'],
  args: {
    value: 72,
    label: 'Yürünebilirlik',
    description: 'Günlük işler yürüyerek hallediliyor',
    variant: 'ring',
  },
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 100 } },
    label: { control: 'text' },
    description: { control: 'text' },
    variant: { control: 'select', options: ['ring', 'bar', 'badge'] },
    tone: {
      control: 'select',
      options: [undefined, 'success', 'accent', 'danger'],
      description: 'Otomatik eşiği geçersiz kılar (verilmezse value’dan hesaplanır)',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(360px, 90vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassScoreMeter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = { args: { value: 58, label: 'Ulaşım', description: 'Otobüs durağı 3 dk yürüyüş' } }

/** Üç görsel biçim yan yana — ring/bar/badge aynı skoru farklı yoğunlukta gösterir. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <GlassScoreMeter variant="ring" value={81} label="Yürünebilirlik" description="Günlük işler yürüyerek hallediliyor" />
      <GlassScoreMeter variant="bar" value={81} label="Yürünebilirlik" description="Günlük işler yürüyerek hallediliyor" />
      <div style={{ width: 220, borderRadius: 'var(--lg-radius-card)', border: '1px solid var(--lg-hairline)', padding: 16 }}>
        <GlassScoreMeter variant="badge" value={81} label="Yürünebilirlik" />
      </div>
    </div>
  ),
}

/** Renk eşiği otomatik: ≥70 success, 40-69 accent, <40 danger. `tone` prop'uyla geçersiz kılınabilir. */
export const ToneEsigi: Story = {
  name: 'Ton Eşiği',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <GlassScoreMeter variant="bar" value={92} label="Yürünebilirlik — yüksek" description="Otomatik: success" />
      <GlassScoreMeter variant="bar" value={55} label="Ulaşım — orta" description="Otomatik: accent" />
      <GlassScoreMeter variant="bar" value={24} label="Sessizlik — düşük" description="Otomatik: danger" />
      <GlassScoreMeter variant="bar" value={92} label="Manuel override" tone="danger" description="tone=danger ile zorlandı" />
    </div>
  ),
}

/** Walk Score deseni: bir ilan sayfasında dört yaşanabilirlik metriği bir arada. */
export const GridKompozisyon: Story = {
  name: '4lü Grid Kompozisyon',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 28,
        width: 420,
      }}
    >
      <GlassScoreMeter value={81} label="Yürünebilirlik" description="Günlük işler yürüyerek hallediliyor" />
      <GlassScoreMeter value={64} label="Ulaşım" description="Otobüs durağı 3 dk yürüyüş" />
      <GlassScoreMeter value={47} label="Okullar" description="En yakın ilkokul 1,2 km" />
      <GlassScoreMeter value={38} label="Sessizlik" description="Ana cadde trafiğine yakın" />
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: 280 }}>
      <GlassScoreMeter
        variant="ring"
        value={68}
        label="Toplu Taşımaya Erişilebilirlik"
        description="Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine uzak bir metrobüs durağı üzerinden şehir merkezine bağlanıyor"
      />
      <GlassScoreMeter
        variant="bar"
        value={68}
        label="Toplu Taşımaya Erişilebilirlik"
        description="Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine uzak bir metrobüs durağı üzerinden şehir merkezine bağlanıyor"
      />
      <div style={{ width: 180, borderRadius: 'var(--lg-radius-card)', border: '1px solid var(--lg-hairline)', padding: 16 }}>
        <GlassScoreMeter variant="badge" value={68} label="Toplu Taşımaya Erişilebilirlik Skoru" />
      </div>
    </div>
  ),
}

/** Dar konteyner + dokunmatik bağlam: bar tam genişliğe uyar, ring/badge sabit kalır. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { variant: 'bar', value: 74, label: 'Yürünebilirlik', description: 'Günlük işler yürüyerek hallediliyor' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { variant: 'ring', value: 47, label: 'Okullar', description: 'En yakın ilkokul 1,2 km' },
  parameters: {
    docs: {
      description: {
        story:
          'Kök `role="meter"` + `aria-valuemin/max/now` taşır; accessible name görünür etiketten ' +
          '`aria-labelledby` ile gelir (çift okuma olmasın diye `aria-label` yerine bu kullanılır). ' +
          'Açıklama verilince `aria-describedby` ile bağlanır — `badge` varyantında yer olmadığından ' +
          'açıklama hem görsel hem AT\'den gizlenir. Sayı düğümleri `aria-hidden` (bilgi zaten `aria-valuenow`\'da).',
      },
    },
  },
}
