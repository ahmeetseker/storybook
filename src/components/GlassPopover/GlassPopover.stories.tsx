import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassPopover } from './GlassPopover'
import { GlassButton } from '../GlassButton'

const meta = {
  title: 'Components/GlassPopover',
  component: GlassPopover,
  tags: ['autodocs'],
  args: { onOpenChange: fn() },
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    open: { control: false, description: 'Controlled kullanım — Controls yerine kod ile yönetin' },
  },
} satisfies Meta<typeof GlassPopover>

export default meta
type Story = StoryObj<typeof meta>

const fiyatIcerik = (
  <div style={{ display: 'grid', gap: 8 }}>
    <span>Bu ilan son 30 günde <strong>%4 değer kazandı</strong>.</span>
    <span style={{ color: 'var(--lg-label-secondary)', fontSize: 'var(--lg-text-footnote)' }}>
      Benzer 12 ilanın medyan fiyatı: 1.240.000 TL
    </span>
  </div>
)

export const Default: Story = {
  args: {
    trigger: <GlassButton size="sm">Fiyat Analizi</GlassButton>,
    title: 'Fiyat Analizi',
    children: fiyatIcerik,
  },
}

export const WithoutTitle: Story = {
  args: {
    trigger: <GlassButton size="sm">Kısayollar</GlassButton>,
    children: <span>İlanı kaydetmek için ⌘S, paylaşmak için ⌘P.</span>,
  },
}

/** Placement × align matrisi — panel, tetikleyiciyi saran relative wrapper'a göre konumlanır. */
export const Placements: Story = {
  args: { trigger: null },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, max-content)',
        gap: 96,
        padding: '160px 200px',
        justifyContent: 'center',
      }}
    >
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <GlassPopover
          key={placement}
          placement={placement}
          defaultOpen
          title={`placement=${placement}`}
          trigger={<GlassButton size="sm">{placement}</GlassButton>}
        >
          <span>Hizalama: center (default)</span>
        </GlassPopover>
      ))}
    </div>
  ),
}

/** Controlled kullanım: open + onOpenChange dışarıdan yönetilir. */
export const Controlled: Story = {
  args: { trigger: null },
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <GlassPopover
          open={open}
          onOpenChange={setOpen}
          title="Satıcıya Sor"
          trigger={<GlassButton size="sm">Satıcıya Sor</GlassButton>}
        >
          <span>Görüşme talebiniz satıcıya iletilir; yanıt ortalama 2 saat.</span>
        </GlassPopover>
        <span style={{ color: 'var(--lg-label-secondary)' }}>Durum: {open ? 'açık' : 'kapalı'}</span>
      </div>
    )
  },
}

/** Responsive: mobilde panel max-width calc(100vw - 32px) ile viewport'a sığar. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } }, // 320px viewport
  args: {
    trigger: <GlassButton size="sm">Krediyle Al</GlassButton>,
    title: 'Kredi Teklifi',
    defaultOpen: true,
    align: 'start',
    children: (
      <span>
        1.150.000 TL için 36 ay vadede aylık taksit 41.900 TL'den başlıyor. Ön onay 5 dakikada sonuçlanır.
      </span>
    ),
  },
}
