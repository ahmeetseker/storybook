import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassMap, type GlassMapPin } from './GlassMap'

const ARSA_PINS: GlassMapPin[] = [
  { id: 'p1', x: 0.22, y: 0.3, price: '4.250.000 TL' },
  { id: 'p2', x: 0.42, y: 0.18, price: '6.900.000 TL' },
  { id: 'p3', x: 0.58, y: 0.42, price: '1.850.000 TL' },
  { id: 'p4', x: 0.74, y: 0.28, count: 12 },
  { id: 'p5', x: 0.34, y: 0.62, price: '3.100.000 TL' },
  { id: 'p6', x: 0.66, y: 0.68, price: '980.000 TL' },
  { id: 'p7', x: 0.85, y: 0.6, count: 4 },
]

const ILAN_DETAY: Record<string, { title: string; location: string }> = {
  p1: { title: 'İzmir Urla İmarlı Köşe Parsel', location: 'İzmir, Urla · 850 m²' },
  p2: { title: 'Antalya Kaş Deniz Manzaralı Arsa', location: 'Antalya, Kaş · 1.200 m²' },
  p3: { title: 'Bursa Nilüfer Yatırımlık Tarla', location: 'Bursa, Nilüfer · 3.400 m²' },
  p5: { title: 'Tekirdağ Şarköy Villa İmarlı Arsa', location: 'Tekirdağ, Şarköy · 620 m²' },
  p6: { title: 'Eskişehir Tepebaşı Bağ Evi İzinli Tarla', location: 'Eskişehir, Tepebaşı · 5.100 m²' },
}

function popupFor(pinId: string) {
  const detay = ILAN_DETAY[pinId]
  if (!detay) return `${pinId} için 12 ilan — yakınlaştırıp listeyi görüntüleyin`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <strong style={{ fontSize: 13, fontWeight: 700 }}>{detay.title}</strong>
      <span style={{ color: 'var(--lg-label-secondary)', fontSize: 12 }}>{detay.location}</span>
    </div>
  )
}

const meta = {
  title: 'Bileşenler/Medya ve Harita/GlassMap',
  component: GlassMap,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    pins: ARSA_PINS,
    popupContent: popupFor,
    seed: 'urla-mah-42',
  },
} satisfies Meta<typeof GlassMap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default (Inline)',
  args: { variant: 'inline', label: 'Urla mahalle haritası', defaultSelectedId: 'p1' },
}

export const Playground: Story = {
  args: { variant: 'inline', label: 'Harita' },
}

export const Panel: Story = {
  name: 'Panel — dikey dolu',
  args: { variant: 'panel', label: 'İlan detay haritası' },
  decorators: [(Story) => <div style={{ height: 480 }}><Story /></div>],
}

export const UyduKatmani: Story = {
  name: 'Katman — Uydu',
  args: { variant: 'inline', layer: 'uydu', label: 'Uydu görünümü' },
}

export const Cluster: Story = {
  name: 'Cluster Rozetleri',
  args: {
    variant: 'inline',
    label: 'Bölge kümeleri',
    pins: [
      { id: 'c1', x: 0.3, y: 0.35, count: 24 },
      { id: 'c2', x: 0.62, y: 0.3, count: 7 },
      { id: 'c3', x: 0.45, y: 0.65, count: 3 },
      { id: 'c4', x: 0.78, y: 0.55, price: '2.400.000 TL' },
    ],
  },
}

export const PrivacyCircle: Story = {
  name: 'Yaklaşık Konum Dairesi',
  args: {
    variant: 'inline',
    label: 'Yaklaşık konum',
    pins: [],
    privacyCircle: { x: 0.5, y: 0.5, r: 0.22 },
  },
}

export const Controlled: Story = {
  name: 'Controlled',
  render: (args) => {
    function ControlledMap() {
      const [selectedId, setSelectedId] = useState<string | undefined>('p2')
      const [layer, setLayer] = useState<'yol' | 'uydu'>('yol')
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--lg-label-secondary)' }}>
            Seçili: {selectedId ?? '—'} · Katman: {layer}
          </p>
          <GlassMap
            {...args}
            selectedId={selectedId}
            onPinSelect={setSelectedId}
            layer={layer}
            onLayerChange={setLayer}
          />
        </div>
      )
    }
    return <ControlledMap />
  },
  args: { variant: 'inline', label: 'Kontrollü harita' },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    variant: 'inline',
    label: 'Uzun popup içeriği',
    defaultSelectedId: 'p1',
    popupContent: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <strong style={{ fontSize: 13, fontWeight: 700 }}>
          Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine Uzun Başlıklı Parsel
        </strong>
        <span style={{ color: 'var(--lg-label-secondary)', fontSize: 12 }}>
          İzmir, Urla · Zeytinlik + bağ evi izinli · Tapu devri hazır · 850 m² imarlı köşe parsel
        </span>
      </div>
    ),
  },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { variant: 'inline', label: 'Erişilebilirlik testi haritası', defaultSelectedId: 'p3' },
  parameters: {
    docs: {
      description: {
        story:
          'Pinler gerçek <button>; fiyat/adet metinleri erişilebilir adı oluşturur. Katman toggle\'ı ' +
          'role="radiogroup" ile radio semantiğini kullanır. Seçili pin `aria-pressed`; ok tuşlarıyla pinler ' +
          'arasında gezinilir, Escape popup\'ı kapatır. Odak halkası `:focus-visible` ile 2px amber.',
      },
    },
  },
}
