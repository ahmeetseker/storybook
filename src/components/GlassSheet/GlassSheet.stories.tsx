import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassSheet } from './GlassSheet'
import { GlassButton } from '../GlassButton'
import { GlassList, GlassListItem } from '../GlassList'

const meta = {
  title: 'Components/GlassSheet',
  component: GlassSheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { open: false, onClose: fn(), title: 'Filtreler', children: 'İçerik' },
  argTypes: {
    detents: { control: 'object', description: 'Viewport oranları, küçükten büyüğe' },
    open: { control: false },
  },
} satisfies Meta<typeof GlassSheet>

export default meta
type Story = StoryObj<typeof meta>

function DemoContent() {
  return (
    <GlassList inset={false}>
      <GlassListItem title="Fiyat aralığı" detail="500.000 – 1.200.000 TL" />
      <GlassListItem title="Yıl" detail="2018 ve üzeri" />
      <GlassListItem title="Yakıt" detail="Dizel · Hibrit" />
      <GlassListItem title="Vites" detail="Otomatik" />
      <GlassListItem title="Konum" detail="İstanbul (Anadolu)" />
      <GlassListItem title="Boyasız · Değişensiz" />
      <GlassListItem title="Garanti süresi devam eden" />
      <GlassListItem title="Satıcı" detail="Doğrulanmış hesap" />
    </GlassList>
  )
}

function SheetHarness(props: { detents?: number[]; dismissible?: boolean; defaultDetent?: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ minHeight: 480, display: 'grid', placeItems: 'center' }}>
      <GlassButton onClick={() => setOpen(true)}>Filtreleri Aç</GlassButton>
      <GlassSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filtreler"
        description="Tutamaçtan yukarı çek — panel büyür ve kalınlaşır."
        onDetentChange={fn()}
        {...props}
      >
        <DemoContent />
      </GlassSheet>
    </div>
  )
}

/** Tutamaçtan sürükle: duraklar arasında büyür; en altın 80px altına çekince kapanır. */
export const Default: Story = { render: () => <SheetHarness /> }

/** Üç duraklı: kısa özet · yarım · tam sayfaya yakın. */
export const ThreeDetents: Story = {
  render: () => <SheetHarness detents={[0.25, 0.5, 0.92]} defaultDetent={1} />,
}

/** Büyük durakta açılır — cam en kalın halinde. */
export const OpensLarge: Story = {
  render: () => <SheetHarness defaultDetent={1} />,
}

/** dismissible=false: backdrop, Escape ve aşağı çekme kapatmaz. */
export const NonDismissible: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ minHeight: 480, display: 'grid', placeItems: 'center' }}>
        <GlassButton onClick={() => setOpen(true)}>Zorunlu Adımı Aç</GlassButton>
        <GlassSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Telefonunu doğrula"
          dismissible={false}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0 }}>İlan verebilmek için telefon doğrulaması gerekli.</p>
            <GlassButton prominent onClick={() => setOpen(false)}>Doğrula ve Kapat</GlassButton>
          </div>
        </GlassSheet>
      </div>
    )
  },
}

/** Responsive: dar ekranda kenardan kenara; ≥640px'te 560px genişlikte ortalanır. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' }, layout: 'fullscreen' },
  render: () => <SheetHarness />,
}
