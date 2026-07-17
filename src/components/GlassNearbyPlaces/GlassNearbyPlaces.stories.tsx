import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassNearbyPlaces, type GlassNearbyCategory } from './GlassNearbyPlaces'

const BusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="4" width="16" height="13" rx="2" />
    <path d="M4 12h16M7 17v2M17 17v2" />
    <circle cx="8" cy="17" r="0.5" />
    <circle cx="16" cy="17" r="0.5" />
  </svg>
)
const SchoolIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z" />
    <path d="M6 11.5v4.5c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.5" />
  </svg>
)
const HealthIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 12.5a8 8 0 1 1-8-8" />
    <path d="M12 9v7M8.5 12.5h7" />
  </svg>
)
const ShopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 9 5.5 4h13L20 9" />
    <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z" />
    <path d="M9 13a3 3 0 0 0 6 0" />
  </svg>
)
const ParkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3 6 12h3l-4 6h5v3h4v-3h5l-4-6h3L12 3Z" />
  </svg>
)

const nearbyCategories: GlassNearbyCategory[] = [
  {
    id: 'ulasim',
    label: 'Ulaşım',
    icon: <BusIcon />,
    places: [
      { name: 'Metrobüs Durağı', distance: '350 m', note: '4 dk yürüme' },
      { name: 'Otobüs Durağı (34, 34A)', distance: '120 m', note: '2 dk yürüme' },
      { name: 'Marmaray İstasyonu', distance: '900 m', note: '11 dk yürüme' },
    ],
  },
  {
    id: 'egitim',
    label: 'Eğitim',
    icon: <SchoolIcon />,
    places: [
      { name: 'Atatürk İlkokulu', distance: '450 m', note: '6 dk yürüme' },
      { name: 'Bahçeşehir Koleji', distance: '1,1 km' },
      { name: 'Semt Halk Kütüphanesi', distance: '700 m', note: '9 dk yürüme' },
    ],
  },
  {
    id: 'saglik',
    label: 'Sağlık',
    icon: <HealthIcon />,
    places: [
      { name: 'Medipol Hastanesi', distance: '1,8 km' },
      { name: 'Nöbetçi Eczane', distance: '300 m', note: '4 dk yürüme' },
    ],
  },
  {
    id: 'alisveris',
    label: 'Alışveriş',
    icon: <ShopIcon />,
    places: [
      { name: 'Migros', distance: '250 m', note: '3 dk yürüme' },
      { name: 'Carrefour AVM', distance: '2,3 km' },
    ],
  },
  {
    id: 'yesil-alan',
    label: 'Yeşil Alan',
    icon: <ParkIcon />,
    places: [{ name: 'Validebağ Korusu', distance: '600 m', note: '8 dk yürüme' }],
  },
]

const meta = {
  title: 'Components/GlassNearbyPlaces',
  component: GlassNearbyPlaces,
  tags: ['autodocs'],
  args: { categories: nearbyCategories, variant: 'chips', onActiveCategoryIdChange: fn() },
  argTypes: {
    variant: { control: 'select', options: ['chips', 'tabs'] },
    activeCategoryId: { control: false },
    defaultActiveCategoryId: { control: false },
    // Kategori/yer verisi Controls'ta düzenlenebilir ama pratik değil — story'ler sabit veri kullanır
    categories: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420, margin: '32px auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassNearbyPlaces>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = { args: { variant: 'tabs' } }

/** İki görsel biçim yan yana: `chips` tüm kategorileri alt alta açar, `tabs` sekmeyle tek kategori gösterir. */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;chips&quot;</p>
        <GlassNearbyPlaces categories={args.categories} variant="chips" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;tabs&quot;</p>
        <GlassNearbyPlaces categories={args.categories} variant="tabs" />
      </div>
    </div>
  ),
}

/** Controlled kullanım: `activeCategoryId` dışarıda tutulur, sekme tıklaması yalnız `onActiveCategoryIdChange` bildirir. */
export const Controlled: Story = {
  render: (args) => {
    function ControlledDemo() {
      const [activeId, setActiveId] = useState('egitim')
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, margin: 0 }}>
            Dışarıdaki aktif kategori: <strong>{activeId}</strong>
          </p>
          <GlassNearbyPlaces
            categories={args.categories}
            variant="tabs"
            activeCategoryId={activeId}
            onActiveCategoryIdChange={setActiveId}
          />
        </div>
      )
    }
    return <ControlledDemo />
  },
}

/**
 * Durumlar: solda `defaultActiveCategoryId` ile ilk seçim dışında bir sekme açık başlar,
 * sağda hiç yer içermeyen bir kategori — component hata fırlatmadan bilgilendirici satır gösterir.
 */
export const States: Story = {
  name: 'Durumlar',
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', maxWidth: 640 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Varsayılan olmayan sekme seçili (&quot;Sağlık&quot;)</p>
        <GlassNearbyPlaces categories={args.categories} variant="tabs" defaultActiveCategoryId="saglik" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Boş kategori</p>
        <GlassNearbyPlaces
          variant="chips"
          categories={[{ id: 'spor', label: 'Spor Tesisi', icon: <ParkIcon />, places: [] }]}
        />
      </div>
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: (args) => (
    <GlassNearbyPlaces
      variant="chips"
      categories={[
        {
          id: 'ulasim',
          label: 'Toplu Taşımaya Erişilebilirlik',
          icon: <BusIcon />,
          places: [
            {
              name: 'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmiş Metrobüs Aktarma Durağı',
              distance: '1,45 km',
              note: 'Yoğun saatlerde araç sıklığı azalabileceğinden yürüme süresi değişkenlik gösterebilir',
            },
            { name: 'Otobüs Durağı', distance: '120 m', note: '2 dk yürüme' },
          ],
        },
        args.categories[2],
      ]}
    />
  ),
}

/** Dar konteyner (320px): mesafe çipi gerektiğinde ayrı satıra düşer, sekmeler yatayda kayar, dokunmatikte 44px hedef. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { variant: 'tabs' },
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
  args: { variant: 'tabs' },
  parameters: {
    docs: {
      description: {
        story:
          '`variant="tabs"`: kategori sekmeleri `role="tablist"`/`role="tab"` ile WAI-ARIA tabs desenini ' +
          'izler — ok tuşları (sarmalı) + Home/End gezinir, seçim odağı takip eder (roving tabindex), ' +
          'panel `role="tabpanel"` aktif sekmeye `aria-labelledby` ile bağlıdır. `variant="chips"`: her ' +
          'kategori grubu gerçek bir heading DEĞİL — `role="group"` + `aria-labelledby` ile adlandırılmış ' +
          'paragraf etiketi kullanır (sayfa heading hiyerarşisine karışmaz). İkonlar her iki varyantta da ' +
          'dekoratif, `aria-hidden`; erişilebilir ad her zaman kategori/yer metninden gelir.',
      },
    },
  },
}
