import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassContextMenu, type GlassContextMenuItem } from './GlassContextMenu'

const meta = {
  title: 'Components/GlassContextMenu',
  component: GlassContextMenu,
  tags: ['autodocs'],
  argTypes: {
    items: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof GlassContextMenu>

export default meta
type Story = StoryObj<typeof meta>

const ilanAlani = (
  <div
    style={{
      display: 'grid',
      placeItems: 'center',
      width: 'min(420px, 100%)',
      height: 180,
      borderRadius: 'var(--lg-radius-card)',
      border: '1px dashed var(--lg-hairline)',
      color: 'var(--lg-label-secondary)',
      userSelect: 'none',
    }}
  >
    İlan kartına sağ tıklayın — 2019 Passat 1.6 TDI, 1.150.000 TL
  </div>
)

const ilanMenusu: GlassContextMenuItem[] = [
  { label: 'İlanı Düzenle', icon: <span>✎</span>, onSelect: fn() },
  { label: 'Öne Çıkar', icon: <span>★</span>, onSelect: fn() },
  { label: 'Bağlantıyı Kopyala', icon: <span>⧉</span>, onSelect: fn() },
  { label: 'Karşılaştırmaya Ekle', disabled: true },
  { label: 'İlanı Sil', icon: <span>🗑</span>, destructive: true, separatorBefore: true, onSelect: fn() },
]

export const Default: Story = {
  args: { items: ilanMenusu, children: ilanAlani },
}

/** Disabled + destructive + separator eksenleri tek menüde. */
export const ItemStates: Story = {
  args: {
    children: ilanAlani,
    items: [
      { label: 'Normal öğe', onSelect: fn() },
      { label: 'Devre dışı öğe', disabled: true },
      { label: 'Ayraçlı yıkıcı öğe', destructive: true, separatorBefore: true, onSelect: fn() },
    ],
  },
}

/** İkonsuz sade menü — icon slotu opsiyoneldir, hizalama bozulmaz. */
export const WithoutIcons: Story = {
  args: {
    children: ilanAlani,
    items: [
      { label: 'Satıcıyı Görüntüle', onSelect: fn() },
      { label: 'Favorilere Ekle', onSelect: fn() },
      { label: 'Şikayet Et', destructive: true, separatorBefore: true, onSelect: fn() },
    ],
  },
}

/**
 * Responsive notu: ContextMenu masaüstü desenidir — mobilde davranış değişmez,
 * long-press desteği bilinçli olarak yoktur (bkz. rules.md). Dokunmatik alternatif
 * sunmak (ör. görünür "..." butonu + GlassMenu) çağıranın sorumluluğudur.
 * Panel yine de viewport'a clamp'lenir ve max-width: calc(100vw - 16px) alır.
 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { items: ilanMenusu, children: ilanAlani },
}
