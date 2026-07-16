import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassDrawer } from './GlassDrawer'
import { GlassButton } from '../GlassButton'

const meta = {
  title: 'Components/GlassDrawer',
  component: GlassDrawer,
  tags: ['autodocs'],
  args: { open: false, onClose: fn(), title: 'Başlık', children: 'İçerik' },
  argTypes: {
    side: { control: 'select', options: ['left', 'right', 'bottom'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    dismissible: { control: 'boolean' },
  },
} satisfies Meta<typeof GlassDrawer>

export default meta
type Story = StoryObj<typeof meta>

const filtreListesi = (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 'var(--lg-space-3, 12px)' }}>
    {['Fiyat: 900.000 – 1.400.000 TL', 'Yıl: 2018 ve üzeri', 'Yakıt: Hibrit', 'Vites: Otomatik', 'Hasar kaydı: Yok'].map(
      (f) => (
        <li key={f} style={{ borderBottom: '1px solid var(--lg-hairline)', paddingBottom: 'var(--lg-space-2, 8px)' }}>
          {f}
        </li>
      ),
    )}
  </ul>
)

/** Temel akış: sağdan kayan filtre çekmecesi, footer alta yapışır. */
export const Default: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <GlassButton onClick={() => setOpen(true)}>Filtreler</GlassButton>
        <GlassDrawer
          open={open}
          onClose={() => setOpen(false)}
          title="Arama filtreleri"
          description="Sonuçlar seçimlerinize göre daralır."
          footer={
            <>
              <GlassButton onClick={() => setOpen(false)}>Temizle</GlassButton>
              <GlassButton prominent onClick={() => setOpen(false)}>
                128 İlanı Göster
              </GlassButton>
            </>
          }
        >
          {filtreListesi}
        </GlassDrawer>
      </>
    )
  },
}

/** Kenar ekseni: left / right / bottom — panel kendi kenarından kayar. */
export const Sides: Story = {
  render: function Render() {
    const [side, setSide] = useState<'left' | 'right' | 'bottom' | null>(null)
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(['left', 'right', 'bottom'] as const).map((s) => (
          <GlassButton key={s} onClick={() => setSide(s)}>
            {s} drawer
          </GlassButton>
        ))}
        <GlassDrawer
          open={side !== null}
          onClose={() => setSide(null)}
          side={side ?? 'right'}
          title="Satıcı profili"
          footer={<GlassButton prominent onClick={() => setSide(null)}>Mesaj Gönder</GlassButton>}
        >
          Emlak Ofisi Yıldız — 4,8 puan, 126 değerlendirme. Üyelik: 2019’dan beri.
        </GlassDrawer>
      </div>
    )
  },
}

/** Boyut ekseni: yan panelde genişlik 320/400/560 (≥sm), bottom'da max-height %50/%70/%90. */
export const Sizes: Story = {
  render: function Render() {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | null>(null)
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <GlassButton key={s} onClick={() => setSize(s)}>
            {s} panel
          </GlassButton>
        ))}
        <GlassDrawer
          open={size !== null}
          onClose={() => setSize(null)}
          size={size ?? 'md'}
          title="İlan karşılaştır"
        >
          Seçtiğiniz 2 araç: Volvo XC60 (1.240.000 TL) · BMW X3 (1.390.000 TL). Donanım farkları listelenir.
        </GlassDrawer>
      </div>
    )
  },
}

/** dismissible=false: Escape/backdrop kapatmaz — kapanış yalnız footer aksiyonuyla. */
export const NonDismissible: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <GlassButton onClick={() => setOpen(true)}>Ödeme Adımı</GlassButton>
        <GlassDrawer
          open={open}
          onClose={() => setOpen(false)}
          dismissible={false}
          side="bottom"
          size="sm"
          title="Kapora ödemesi"
          footer={
            <>
              <GlassButton onClick={() => setOpen(false)}>İptal</GlassButton>
              <GlassButton prominent onClick={() => setOpen(false)}>
                50.000 TL Öde
              </GlassButton>
            </>
          }
        >
          Ödeme tamamlanana kadar bu panel açık kalır; işlem emanet hesabı üzerinden yürür.
        </GlassDrawer>
      </>
    )
  },
}

/**
 * Responsive davranış: bp-sm (640px) altında side=left/right çekmece tam genişlik
 * (%100) olur; ≥sm boyut token'ına göre 320/400/560px genişliğe döner.
 */
export const MobileFullWidth: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <GlassButton onClick={() => setOpen(true)}>Filtreler</GlassButton>
        <GlassDrawer
          open={open}
          onClose={() => setOpen(false)}
          side="right"
          title="Arama filtreleri"
          footer={
            <GlassButton prominent onClick={() => setOpen(false)}>
              Uygula
            </GlassButton>
          }
        >
          {filtreListesi}
        </GlassDrawer>
      </>
    )
  },
}
