import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassIconButton } from './GlassIconButton'

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.4 4.5 6 4.5c2 0 3.4 1 4.5 2.6h3c1.1-1.6 2.5-2.6 4.5-2.6 3.6 0 5.5 3.5 4 7.2C19.5 16.3 12 21 12 21z" transform="scale(0.9) translate(1.3 1.3)" />
  </svg>
)

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
  </svg>
)

const meta = {
  title: 'Bileşenler/Eylemler/GlassIconButton',
  component: GlassIconButton,
  tags: ['autodocs'],
  args: { onClick: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    tint: { control: 'color', description: 'Kalıcı aktif durumun vurgu rengi — active=true olmadan görünmez' },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
    // hover/focus/basılı-anı control değildir — CSS state'idir; `active` yalnız kalıcı durumu taşır (bkz. rules.md)
  },
} satisfies Meta<typeof GlassIconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { label: 'Paylaş', children: <ShareIcon /> } }
export const FavoriteOff: Story = { args: { label: 'Favorilere ekle', active: false, tint: '#ff453a', children: <HeartIcon /> } }
export const FavoriteOn: Story = { args: { label: 'Favorilerden çıkar', active: true, tint: '#ff453a', children: <HeartIcon /> } }
export const Large: Story = { args: { label: 'Paylaş', size: 'lg', children: <ShareIcon /> } }
export const Disabled: Story = { args: { label: 'Paylaş', disabled: true, children: <ShareIcon /> } }

/** Boyut ekseni tek bakışta — üç boyut da dokunmatik hedef kurallarına uyar. */
export const Sizes: Story = {
  args: { label: 'Paylaş', children: <ShareIcon /> },
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassIconButton size="sm" label="Paylaş (sm)">
        <ShareIcon />
      </GlassIconButton>
      <GlassIconButton size="md" label="Paylaş (md)">
        <ShareIcon />
      </GlassIconButton>
      <GlassIconButton size="lg" label="Paylaş (lg)">
        <ShareIcon />
      </GlassIconButton>
    </div>
  ),
}

/**
 * Görsel state matrisi: default · kalıcı aktif (tint'li, aria-pressed=true) · aktif değil · disabled.
 * Hover/focus/basılı-anı burada zorlanmaz — bunlar CSS state'idir (bkz. rules.md).
 */
export const States: Story = {
  args: { label: 'Favorilere ekle', children: <HeartIcon /> },
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassIconButton label="Paylaş">
        <ShareIcon />
      </GlassIconButton>
      <GlassIconButton label="Favorilerden çıkar" active tint="#ff453a">
        <HeartIcon />
      </GlassIconButton>
      <GlassIconButton label="Favorilere ekle" active={false} tint="#ff453a">
        <HeartIcon />
      </GlassIconButton>
      <GlassIconButton label="Paylaş" disabled>
        <ShareIcon />
      </GlassIconButton>
    </div>
  ),
}

/**
 * Uzun etiket: ikon tek başına anlam taşımaz; uzun `label` ekranda görünmez ama
 * tooltip (title) ve ekran okuyucu (aria-label) üzerinden aynen aktarılır — kırpılmaz.
 */
export const UzunEtiket: Story = {
  args: {
    label: 'Bu ilanı favorilere ekle ve fiyat değişikliklerinde bildirim al',
    tint: '#ff453a',
    active: false,
    children: <HeartIcon />,
  },
}
