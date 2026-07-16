import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassPriceHeader } from './GlassPriceHeader'
import { GlassBadge } from '../GlassBadge'
import { GlassIconButton } from '../GlassIconButton'

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 21s-7.5-4.7-10-9.3C.5 8 2.4 4.5 6 4.5c2 0 3.4 1 4.5 2.6h3c1.1-1.6 2.5-2.6 4.5-2.6 3.6 0 5.5 3.5 4 7.2C19.5 16.3 12 21 12 21z" transform="scale(0.9) translate(1.3 1.3)" />
  </svg>
)

const meta = {
  title: 'Components/GlassPriceHeader',
  component: GlassPriceHeader,
  tags: ['autodocs'],
  argTypes: { priceTint: { control: 'color' } },
} satisfies Meta<typeof GlassPriceHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Volkswagen Golf 1.6 TDI Comfortline — İlk Sahibinden, Hatasız',
    price: '1.185.000 TL',
    meta: 'İstanbul, Kadıköy · İlan Tarihi: 12 Temmuz 2026 · İlan No: 1084526631',
  },
  render: (args) => (
    <div style={{ maxWidth: 520, margin: '48px auto' }}>
      <GlassPriceHeader {...args} />
    </div>
  ),
}

export const WithBadgesAndActions: Story = {
  args: {
    ...Default.args,
    priceTint: '#ffd60a',
    badges: (
      <>
        <GlassBadge tint="#ff453a">Acil</GlassBadge>
        <GlassBadge tint="#ff9f0a">Öne Çıkan</GlassBadge>
      </>
    ),
    actions: (
      <GlassIconButton label="Favorilere ekle" tint="#ff453a" onClick={fn()}>
        <HeartIcon />
      </GlassIconButton>
    ),
  },
  render: Default.render,
}

/**
 * Malzeme karşılaştırması: içerik sayfasında `material="flat"` önerilir (bkz. rules.md §12);
 * cam yalnız hero/medya üstünde kullanılmalı. İki malzeme yan yana.
 */
export const Materials: Story = {
  args: {
    title: 'Kadıköy Moda’da Deniz Manzaralı 3+1 Satılık Daire',
    price: '14.750.000 TL',
    meta: 'İstanbul, Kadıköy · İlan Tarihi: 8 Temmuz 2026 · İlan No: 1092337415',
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 560, margin: '48px auto' }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;glass&quot; — yalnız hero/medya üstü</p>
        <GlassPriceHeader {...args} material="glass" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;flat&quot; — içerik sayfası (önerilen)</p>
        <GlassPriceHeader {...args} material="flat" />
      </div>
    </div>
  ),
}

/**
 * Uzun içerik: başlık kırpılmaz, `overflow-wrap: anywhere` ile sarar — 2 satırı aşan
 * başlığı kısaltmak çağıranın işidir. Dar container'da heading daralır, actions sabit kalır.
 */
export const UzunIcerik: Story = {
  args: {
    title:
      'Sahibinden 2019 Volkswagen Golf 1.6 TDI Comfortline — Boyasız, Değişensiz, Tüm Bakımları Yetkili Serviste Yapılmış Garaj Arabası',
    price: '1.185.000 TL',
    meta: 'İstanbul, Kadıköy, Fenerbahçe Mahallesi · İlan Tarihi: 12 Temmuz 2026 · İlan No: 1084526631',
    actions: (
      <GlassIconButton label="Favorilere ekle" onClick={fn()}>
        <HeartIcon />
      </GlassIconButton>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 320, margin: '48px auto' }}>
      <GlassPriceHeader {...args} />
    </div>
  ),
}
