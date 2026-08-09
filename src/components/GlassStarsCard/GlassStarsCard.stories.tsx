import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  GlassStarsCard,
  GlassStarsCardDescription,
  GlassStarsCardTitle,
} from './GlassStarsCard'

const meta = {
  title: 'Bileşenler/Vitrin ve Yerleşim/GlassStarsCard',
  component: GlassStarsCard,
  tags: ['autodocs'],
  argTypes: {
    as: { control: 'inline-radio', options: ['div', 'article', 'section'] },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '28rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassStarsCard>

export default meta
type Story = StoryObj<typeof meta>

/** Temel sözleşme: tam kaplayan yıldız fonu + buzlu okuma paneli. İmleç kartın üzerine
 * gelince (ya da içindeki bir aksiyona odaklanınca) tüm matris tutuşur. */
export const Default: Story = {
  render: (args) => (
    <GlassStarsCard {...args}>
      <GlassStarsCardTitle>Arsam AI Bölge Raporu</GlassStarsCardTitle>
      <GlassStarsCardDescription>
        Fiyat, arz ve imar sinyallerini tek gecelik gökyüzünde toplayan vitrin kartı.
      </GlassStarsCardDescription>
    </GlassStarsCard>
  ),
}

/** Yalnız public API — hover/focus kontrol değildir; tutuşma kendiliğindendir. */
export const Playground: Story = {
  render: (args) => (
    <GlassStarsCard {...args}>
      <GlassStarsCardTitle>Başlık</GlassStarsCardTitle>
      <GlassStarsCardDescription>Kısa açıklama metni.</GlassStarsCardDescription>
    </GlassStarsCard>
  ),
}

/** Bölge dizini kullanım örneği: serbest içerik (metrikler + sinyaller). */
export const BolgeKarti: Story = {
  args: { as: 'article' },
  render: (args) => (
    <GlassStarsCard {...args}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--lg-space-3)' }}>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--lg-text-caption)',
              color: 'color-mix(in srgb, var(--lg-bg) 68%, transparent)',
            }}
          >
            muğla · bodrum
          </p>
          <GlassStarsCardTitle>Bodrum</GlassStarsCardTitle>
        </div>
        <strong style={{ color: 'color-mix(in srgb, var(--lg-accent) 40%, var(--lg-bg))' }}>
          %68
        </strong>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 'var(--lg-space-2)',
        }}
      >
        {[
          ['38.200 ₺', 'm² fiyatı'],
          ['+21.1%', '12 aylık eğilim'],
          ['221', 'aktif ilan'],
        ].map(([value, label]) => (
          <div key={label} style={{ display: 'grid', gap: 'var(--lg-space-1)' }}>
            <strong style={{ fontSize: 'var(--lg-text-headline)' }}>{value}</strong>
            <span
              style={{
                fontSize: 'var(--lg-text-caption)',
                color: 'color-mix(in srgb, var(--lg-bg) 62%, transparent)',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <GlassStarsCardDescription>Gelişim eğilimi güçlü.</GlassStarsCardDescription>
    </GlassStarsCard>
  ),
}

/** Uzun içerik sarar; yıldız fonu kartla birlikte uzar, okuma paneli korur. */
export const UzunIcerik: Story = {
  render: (args) => (
    <GlassStarsCard {...args}>
      <GlassStarsCardTitle>
        Muğla kıyı şeridinde orta vadeli arsa yatırım fırsatları değerlendirmesi
      </GlassStarsCardTitle>
      <GlassStarsCardDescription>
        Değerlendirme; imar planı gelişimi, kıyı kullanım kısıtları, su stresi riski ve on iki
        aylık fiyat eğilimi gibi sinyallerin kaynak gösterilerek birleştirilmesiyle oluşturulur.
      </GlassStarsCardDescription>
    </GlassStarsCard>
  ),
}
