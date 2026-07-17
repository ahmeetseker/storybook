import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassFloorPlanViewer, type GlassFloorPlanPlan } from './GlassFloorPlanViewer'
import { placeholderImage } from '../../demo/placeholderImage'

const villaPlans: GlassFloorPlanPlan[] = [
  {
    label: 'Bahçe Katı',
    src: placeholderImage('Bahçe Katı', '#7a8f6f', '#4a5f3f', 800, 600),
    hotspots: [
      { x: 0.28, y: 0.55, label: 'Çok Amaçlı Salon' },
      { x: 0.62, y: 0.3, label: 'Depo' },
      { x: 0.78, y: 0.72, label: 'Bahçeye Çıkış' },
    ],
  },
  {
    label: 'Zemin Kat',
    src: placeholderImage('Zemin Kat', '#c9b28a', '#8f7a56', 800, 600),
    hotspots: [
      { x: 0.22, y: 0.35, label: 'Salon' },
      { x: 0.68, y: 0.28, label: 'Mutfak' },
      { x: 0.72, y: 0.7, label: 'Misafir Tuvaleti' },
      { x: 0.4, y: 0.75, label: 'Giriş Holü' },
    ],
  },
  {
    label: '1. Kat',
    src: placeholderImage('1. Kat', '#8aa7bf', '#3f5f7a', 800, 600),
    hotspots: [
      { x: 0.3, y: 0.3, label: 'Ebeveyn Yatak Odası' },
      { x: 0.7, y: 0.3, label: 'Çocuk Odası' },
      { x: 0.5, y: 0.65, label: 'Banyo' },
    ],
  },
  {
    label: 'Çatı Katı',
    src: placeholderImage('Çatı Katı', '#a78abf', '#5f3f7a', 800, 600),
    hotspots: [{ x: 0.5, y: 0.5, label: 'Teras' }],
  },
]

const meta = {
  title: 'Components/GlassFloorPlanViewer',
  component: GlassFloorPlanViewer,
  tags: ['autodocs'],
  args: { plans: villaPlans, onActiveIndexChange: fn() },
  argTypes: {
    activeIndex: { control: 'number' },
    defaultActiveIndex: { control: 'number' },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
    // Kat/hotspot verisi Controls'ta düzenlenebilir ama pratik değil — story'ler sabit veri kullanır
    plans: { control: false },
  },
} satisfies Meta<typeof GlassFloorPlanViewer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 480, margin: '48px auto' }}>
      <GlassFloorPlanViewer {...args} />
    </div>
  ),
}

export const Playground: Story = { render: Default.render }

/**
 * Controlled kullanım: `activeIndex` sabittir, sekme tıklaması yalnız
 * `onActiveIndexChange` bildirir — görsel dışarıdan yönetilir.
 */
export const Controlled: Story = {
  args: { activeIndex: 2 },
  render: Default.render,
}

/**
 * States: `disabled` bir prop değil, dahili `scale` sınırından türer — 1x'te
 * "Uzaklaştır" her zaman kilitli açılır (solda görünür, gerçek başlangıç
 * durumu). Sağdaki örnekte bir hotspot'a tıklayıp balonu, "Yakınlaştır"a art
 * arda tıklayıp 4x kilidini deneyin — ikisi de yalnız etkileşimle görünür.
 */
export const States: Story = {
  args: { plans: villaPlans.slice(0, 2) },
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', maxWidth: 860 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Varsayılan açılış (1x) — &quot;Uzaklaştır&quot; kilitli</p>
        <GlassFloorPlanViewer plans={villaPlans.slice(0, 1)} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Hotspot&apos;a tıklayın — etiket balonu açılır</p>
        <GlassFloorPlanViewer plans={villaPlans.slice(1, 2)} />
      </div>
    </div>
  ),
}

/**
 * Uzun içerik: 6 kat sekmesi (uzun TR etiketlerle) yatayda kayar; hotspot
 * etiketleri uzun oda adlarında da balon tek satırda taşmadan görünür.
 */
export const UzunIcerik: Story = {
  args: {
    plans: [
      ...villaPlans,
      {
        label: 'Çatı Arası Depolama Katı',
        src: placeholderImage('Çatı Arası', '#8a8a3a', '#5f5f1f', 800, 600),
        hotspots: [{ x: 0.5, y: 0.5, label: 'Genel Depolama ve Tesisat Alanı' }],
      },
      {
        label: 'Bodrum Kat',
        src: placeholderImage('Bodrum Kat', '#6f6f6f', '#3f3f3f', 800, 600),
        hotspots: [
          { x: 0.3, y: 0.4, label: 'Otopark' },
          { x: 0.7, y: 0.4, label: 'Sığınak / Teknik Hacim' },
        ],
      },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 340, margin: '48px auto' }}>
      <GlassFloorPlanViewer {...args} />
    </div>
  ),
}

/**
 * Dar container (dokunmatik genişlik varsayımıyla 300px): kat sekmeleri ve
 * hotspot pin'leri `pointer: coarse`'ta 44px dokunma hedefine büyür.
 */
export const Responsive: Story = {
  args: { plans: villaPlans },
  render: (args) => (
    <div style={{ maxWidth: 300, margin: '48px auto' }}>
      <GlassFloorPlanViewer {...args} />
    </div>
  ),
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { plans: villaPlans },
  parameters: {
    docs: {
      description: {
        story:
          'Kat sekmeleri `role="tablist"`/`role="tab"` ile WAI-ARIA tabs desenini izler: ' +
          'ok tuşları (sarmalı) + Home/End gezinir, seçim odağı takip eder (roving tabindex). ' +
          'Görüntü alanı `role="tabpanel"`, aktif sekmeye `aria-labelledby` ile bağlıdır. ' +
          'Yakınlaştırma butonlarında zorunlu erişilebilir isim var: "Yakınlaştır" / "Uzaklaştır"; ' +
          'sınırda (1x/4x) `disabled` olur. Hotspot pin\'leri gerçek `<button>`, `aria-label` odadan ' +
          'gelir; açıkken `aria-expanded="true"` ve balona `aria-describedby` ile bağlanır. ' +
          'Zoom yüzdesi `aria-live="polite"` ile ekran okuyucuya bildirilir.',
      },
    },
  },
  render: (args) => (
    <div style={{ maxWidth: 480, margin: '48px auto' }}>
      <GlassFloorPlanViewer {...args} />
    </div>
  ),
}
