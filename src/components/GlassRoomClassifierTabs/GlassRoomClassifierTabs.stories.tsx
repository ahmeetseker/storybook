import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassRoomClassifierTabs, type GlassRoomClassifierRoom } from './GlassRoomClassifierTabs'

const listingRooms: GlassRoomClassifierRoom[] = [
  { id: 'salon', label: 'Salon', count: 14 },
  { id: 'mutfak', label: 'Mutfak', count: 9 },
  { id: 'yatak-odasi-1', label: 'Yatak Odası 1', count: 6 },
  { id: 'yatak-odasi-2', label: 'Yatak Odası 2', count: 5 },
  { id: 'banyo', label: 'Banyo', count: 4 },
  { id: 'balkon', label: 'Balkon', count: 7 },
]

const meta = {
  title: 'Components/GlassRoomClassifierTabs',
  component: GlassRoomClassifierTabs,
  tags: ['autodocs'],
  args: { rooms: listingRooms, onActiveRoomIdChange: fn() },
  argTypes: {
    rooms: { control: false },
    activeRoomId: { control: false },
    defaultActiveRoomId: { control: false },
    confidence: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    loading: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, margin: '32px auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassRoomClassifierTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = { args: { confidence: 92 } }

/** Controlled kullanım: `activeRoomId` dışarıda tutulur, sekme tıklaması/ok tuşu yalnız `onActiveRoomIdChange` bildirir. */
export const Controlled: Story = {
  render: (args) => {
    function ControlledDemo() {
      const [activeId, setActiveId] = useState('mutfak')
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, margin: 0 }}>
            Galeri şu an gösteriyor: <strong>{activeId}</strong>
          </p>
          <GlassRoomClassifierTabs
            rooms={args.rooms}
            activeRoomId={activeId}
            onActiveRoomIdChange={setActiveId}
          />
        </div>
      )
    }
    return <ControlledDemo />
  },
}

/**
 * Durumlar: solda yüksek güven skoruyla tamamlanmış sınıflandırma, ortada
 * güven skoru verilmeden (rozet yine görünür, yalnız güven metni yok), sağda
 * sınıflandırma sürerken `loading` placeholder'ı — zorunlu "✦ AI" rozeti
 * yükleme sırasında da kaybolmaz.
 */
export const States: Story = {
  name: 'Durumlar',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Yüksek güven skoruyla</p>
        <GlassRoomClassifierTabs rooms={args.rooms} confidence={96} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Güven skoru verilmedi</p>
        <GlassRoomClassifierTabs rooms={args.rooms} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Sınıflandırma sürüyor (loading)</p>
        <GlassRoomClassifierTabs rooms={args.rooms} loading />
      </div>
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: (args) => (
    <GlassRoomClassifierTabs
      rooms={[
        { id: 'cok-amacli-oturma-alani', label: 'Çok Amaçlı Oturma ve Aile Yaşam Alanı', count: 23 },
        { id: 'ebeveyn-banyosu', label: 'Ebeveyn Yatak Odası Banyosu (Ensuite)', count: 11 },
        ...args.rooms.slice(0, 3),
      ]}
      confidence={88}
    />
  ),
}

/** Dar konteyner (320px): sekmeler yatayda kayar, dokunmatikte 44px hedef. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
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
  args: { confidence: 92 },
  parameters: {
    docs: {
      description: {
        story:
          'Sekme çipleri `role="radiogroup"`/`role="radio"` ile WAI-ARIA radiogroup desenini izler (tab ' +
          'DEĞİL — bu component galeri panelini hiç render etmediğinden `tab`/`tabpanel` ilişkisini ' +
          'kuramaz; davranış zaten tek-seçimli bir filtre olduğundan radiogroup semantik olarak doğru ' +
          'eşlemedir) — yalnız yatay ok tuşları (`ArrowLeft`/`ArrowRight`, sarmalı) + `Home`/`End` gezinir, ' +
          'seçim odağı yalnız kullanıcı etkileşiminde takip eder (roving tabindex). Bu yüzden ' +
          '`aria-controls` bilinçli olarak hiç verilmez (var olmayan bir panel id\'sine işaret etmek ' +
          'gerçek bir ARIA IDREF ihlali olurdu; panel ile eşleme çağıranın kompozisyon sorumluluğundadır, ' +
          'bkz. rules.md §2). "✦ AI" rozeti (`aria-label="Yapay zekâ üretimi"`) başlık satırında koşulsuz ' +
          'görünür, ' +
          '`loading` sırasında da kaybolmaz; `confidence` verilirse yalnız renkle değil görünür "%N güven" ' +
          'metniyle de iletilir. Her sekmenin erişilebilir adı oda adı + fotoğraf adedini birlikte taşır (ör. ' +
          '"Mutfak 9 fotoğraf").',
      },
    },
  },
}
