import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassBadge } from './GlassBadge'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassBadge',
  component: GlassBadge,
  tags: ['autodocs'],
  argTypes: {
    tint: { control: 'color', description: 'Semantik vurgu (danger/warning/success) — tema rengi verme' },
    size: { control: 'select', options: ['sm', 'md'] },
    material: { control: 'select', options: ['glass', 'flat'] },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
  },
} satisfies Meta<typeof GlassBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'Yeni' } }
export const Urgent: Story = { args: { children: 'Acil', tint: '#ff453a' } }
export const Featured: Story = { args: { children: 'Öne Çıkan', tint: '#ff9f0a', size: 'md' } }
export const Sold: Story = { args: { children: 'Satıldı', tint: '#8e8e93' } }

/** Boyut ekseni tek bakışta: sm rozet liste kartlarında, md vitrin/başlık yanında kullanılır. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassBadge size="sm" tint="#ff9f0a">
        Öne Çıkan — sm
      </GlassBadge>
      <GlassBadge size="md" tint="#ff9f0a">
        Öne Çıkan — md
      </GlassBadge>
    </div>
  ),
}

/**
 * Materyal ekseni: glass'ta tint yarı saydamdır (arka planla karışır); flat'te opak tam renge
 * döner — içerik katmanındaki (flat kart üstü) rozetlerde bu yüzden `material="flat"` verin.
 */
export const Materials: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <GlassBadge tint="#ff453a">Acil — glass</GlassBadge>
      <GlassBadge material="flat" tint="#ff453a">
        Acil — flat
      </GlassBadge>
      <GlassBadge>Yeni — glass</GlassBadge>
      <GlassBadge material="flat">Yeni — flat</GlassBadge>
    </div>
  ),
}

/**
 * Uzun içerik: rozet kırpmaz ve satır atlamaz (white-space: nowrap), tek satırda büyür.
 * Rozet cümle taşımaz — metni kısaltmak çağıranın işi (bkz. rules.md Do/Don't).
 */
export const UzunIcerik: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <GlassBadge tint="#30d158">Fiyatı Düştü</GlassBadge>
      <GlassBadge tint="#30d158">Son 24 Saatte Fiyatı Güncellenen İlan</GlassBadge>
    </div>
  ),
}
