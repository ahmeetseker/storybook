import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties, ReactNode } from 'react'
import { GlassRibbon } from './GlassRibbon'

/** Şerit konumlandırılmış bir medya kabı ister; story'ler kartı taklit eden bir çerçeve kullanır. */
function MediaMock({ children, width = 280 }: { children: ReactNode; width?: number }) {
  const style: CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width,
    aspectRatio: '4 / 3',
    borderRadius: 'var(--lg-radius-media)',
    background: 'linear-gradient(160deg, #b9cf93, #55772f)',
    containerType: 'inline-size',
  }
  return <div style={style}>{children}</div>
}

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassRibbon',
  component: GlassRibbon,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    note: { control: 'text', description: 'Yalnız ekran okuyucuya okunan ek bağlam' },
    tone: { control: 'select', options: ['accent', 'neutral'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  decorators: [
    (Story) => (
      <MediaMock>
        <Story />
      </MediaMock>
    ),
  ],
} satisfies Meta<typeof GlassRibbon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { label: 'Doğrulanmış' } }

export const Playground: Story = {
  args: { label: 'Doğrulanmış', note: 'Temsili görsel', tone: 'accent', size: 'sm' },
}

/** Ton ekseni: accent doğrulama/vitrin vurgusu, neutral bilgilendirme etiketi. */
export const Tonlar: Story = {
  args: { label: 'Doğrulanmış' },
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <MediaMock width={220}>
        <GlassRibbon label="Doğrulanmış" tone="accent" />
      </MediaMock>
      <MediaMock width={220}>
        <GlassRibbon label="Yeni ilan" tone="neutral" />
      </MediaMock>
    </div>
  ),
}

/** Boyut ekseni: sm liste kartlarında, md geniş vitrin yüzeylerinde. */
export const Boyutlar: Story = {
  args: { label: 'Doğrulanmış' },
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <MediaMock width={220}>
        <GlassRibbon label="Doğrulanmış" size="sm" />
      </MediaMock>
      <MediaMock width={320}>
        <GlassRibbon label="Doğrulanmış" size="md" />
      </MediaMock>
    </div>
  ),
}

/**
 * Responsive davranış: kap `container-type: inline-size` tanımladığında md şerit,
 * 260px'ten dar kartlarda sm geometrisine iner — mobil grid'de köşeyi boğmaz.
 */
export const Responsive: Story = {
  args: { label: 'Doğrulanmış' },
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <MediaMock width={320}>
        <GlassRibbon label="Doğrulanmış" size="md" />
      </MediaMock>
      <MediaMock width={230}>
        <GlassRibbon label="Doğrulanmış" size="md" />
      </MediaMock>
    </div>
  ),
}

/**
 * Etiket sözleşmesi: sm şeridin görünür penceresi ~72px'tir; uzun metnin uçları
 * köşe karesince kırpılır. Uzun durumlar için md kullanın veya metni kısaltın.
 */
export const UzunEtiket: Story = {
  args: { label: 'Yetki bekliyor' },
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <MediaMock width={220}>
        <GlassRibbon label="Yetki bekliyor" size="sm" />
      </MediaMock>
      <MediaMock width={320}>
        <GlassRibbon label="Yetki bekliyor" size="md" />
      </MediaMock>
    </div>
  ),
}

/** `note` yalnız ekran okuyucuya okunur: "Doğrulanmış" + "Temsili görsel". */
export const Erisilebilirlik: Story = {
  args: { label: 'Doğrulanmış', note: 'Temsili görsel' },
}
