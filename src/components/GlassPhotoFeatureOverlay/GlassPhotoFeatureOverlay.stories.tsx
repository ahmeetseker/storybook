import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { placeholderImage } from '../../demo/placeholderImage'
import { GlassPhotoFeatureOverlay, type GlassPhotoFeatureOverlayFeature } from './GlassPhotoFeatureOverlay'

const mutfakGorseli = { src: placeholderImage('Mutfak', '#3a5f4a', '#1f3a2a'), alt: 'Ankastre mutfak ve yemek köşesi' }

const mutfakOzellikleri: GlassPhotoFeatureOverlayFeature[] = [
  { id: 'ankastre', label: 'Ankastre mutfak', x: 0.28, y: 0.55, confidence: 94 },
  { id: 'tezgah', label: 'Mermer tezgah', x: 0.62, y: 0.48, confidence: 88 },
  { id: 'davlumbaz', label: 'Davlumbaz', x: 0.5, y: 0.14, confidence: 76 },
  { id: 'yerdenisitma', label: 'Yerden ısıtma', x: 0.5, y: 0.92, confidence: 62 },
]

const meta = {
  title: 'Bileşenler/Medya ve Harita/GlassPhotoFeatureOverlay',
  component: GlassPhotoFeatureOverlay,
  tags: ['autodocs'],
  args: {
    image: mutfakGorseli,
    features: mutfakOzellikleri,
    onShowLabelsChange: fn(),
  },
  argTypes: {
    image: { control: false },
    features: { control: false },
    showLabels: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, margin: '32px auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassPhotoFeatureOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = { args: { defaultShowLabels: true } }

/**
 * Durumlar: solda etiketler kapalı (varsayılan, yalnız noktalar), sağda "Etiketleri göster"
 * ile tümü açık başlıyor. Her iki durumda da tek bir nokta tıklanarak kendi başına
 * açılıp/kapatılabilir — genel duruma bağlı kalmaz.
 */
export const States: Story = {
  name: 'Durumlar',
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>defaultShowLabels=false (varsayılan)</p>
        <GlassPhotoFeatureOverlay image={args.image} features={args.features} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>defaultShowLabels=true</p>
        <GlassPhotoFeatureOverlay image={args.image} features={args.features} defaultShowLabels />
      </div>
    </div>
  ),
}

/** Controlled kullanım: `showLabels` dışarıda tutulur, buton yalnız `onShowLabelsChange` bildirir. */
export const Controlled: Story = {
  render: (args) => {
    function ControlledDemo() {
      const [showLabels, setShowLabels] = useState(false)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, margin: 0 }}>
            Dışarıdaki durum: <strong>{showLabels ? 'etiketler açık' : 'etiketler kapalı'}</strong>
          </p>
          <GlassPhotoFeatureOverlay
            image={args.image}
            features={args.features}
            showLabels={showLabels}
            onShowLabelsChange={setShowLabels}
          />
        </div>
      )
    }
    return <ControlledDemo />
  },
}

/** Uzun Türkçe özellik adları balonda sarar; taşan koordinatlar (0-1 dışı/NaN) sessizce yok sayılır. */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    defaultShowLabels: true,
    image: { src: placeholderImage('Salon', '#3a4f8a', '#1f2a5f'), alt: 'Geniş salon ve balkon kapısı' },
    features: [
      {
        id: 'zemin',
        label: 'Isı ve ses yalıtımlı lamine parke zemin kaplaması',
        x: 0.5,
        y: 0.86,
        confidence: 81,
      },
      { id: 'balkon', label: 'Fransız balkon', x: 0.08, y: 0.4, confidence: 90 },
      { id: 'gunes', label: 'Güneybatı cephe gün ışığı', x: 0.92, y: 0.12, confidence: 55 },
      // Sonlu değil (NaN/Infinity): render EDİLMEZ — finite guard.
      { id: 'gecersiz-nan', label: 'Görünmemeli (NaN)', x: NaN, y: 0.5 },
      // Sonlu ama aralık dışı: [0,1]'e kenetlenir, görsel kenarında görünür (reddedilmez).
      { id: 'kenetlenmis', label: 'Kenetlenmiş konum', x: 1.4, y: -0.2, confidence: 70 },
    ],
  },
}

/** Dar konteyner (320px): nokta işaretleri dokunmatikte 44px'e büyür, balon köşelerde taşmadan hizalanır. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { defaultShowLabels: true },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, margin: '32px auto' }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { defaultShowLabels: false },
  parameters: {
    docs: {
      description: {
        story:
          'Görsel bölge `role="group"` ile adlandırılır. Her nokta gerçek bir `<button>`; ' +
          '`aria-label` doğrudan özellik adını taşır (accessible name), `aria-expanded` balonun ' +
          'açık/kapalı durumunu bildirir. Balonun görünür metni butonun adıyla aynı olduğundan ' +
          '`aria-hidden` ile tekrar okutulmaz — yalnız güven yüzdesi (verilmişse) ' +
          '`aria-describedby` ile ayrıca AT\'ye iletilir. "Etiketleri göster" butonu gerçek bir ' +
          'geri alınabilir `aria-pressed` toggle\'dır ve TÜM noktaların varsayılan görünürlüğünü ' +
          'değiştirir; bir noktaya tıklamak yalnız o noktayı bu varsayılandan bağımsız açar/kapatır. ' +
          'Zorunlu "✦ AI" rozeti her zaman görsel köşesinde, `aria-label="Yapay zekâ üretimi"` ile.',
      },
    },
  },
}
