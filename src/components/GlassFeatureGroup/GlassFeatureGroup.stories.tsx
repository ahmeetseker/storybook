import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassFeatureGroup, type GlassFeatureGroupSection } from './GlassFeatureGroup'

// Gerçek ArsaPazar emlak verisi — sahibinden 'İç/Dış Özellikler' künyesi
const konutGroups: GlassFeatureGroupSection[] = [
  {
    title: 'İç Özellikler',
    items: [
      { label: 'Isıtma Tipi', value: 'Kombi (Doğalgaz)' },
      { label: 'Mutfak Tipi', value: 'Ankastre' },
      { label: 'Zemin', value: 'Laminat Parke' },
      { label: 'Klima', present: true },
      { label: 'Ankastre Fırın', present: true },
      { label: 'Duşakabin', present: true },
      { label: 'Jakuzi', present: false },
      { label: 'Şömine', present: false },
    ],
  },
  {
    title: 'Dış Özellikler',
    items: [
      { label: 'Otopark Tipi', value: 'Kapalı Otopark' },
      { label: 'Asansör', present: true },
      { label: '24 Saat Güvenlik', present: true },
      { label: 'Site İçerisinde', present: true },
      { label: 'Yüzme Havuzu', present: false },
      { label: 'Spor Alanı', present: false },
    ],
  },
]

const aracGroups: GlassFeatureGroupSection[] = [
  {
    title: 'Güvenlik',
    items: [
      { label: 'ABS', present: true },
      { label: 'ESP', present: true },
      { label: 'Yokuş Kalkış Desteği', present: true },
      { label: 'Şerit Takip Sistemi', present: false },
      { label: 'Kör Nokta İkazı', present: false },
    ],
  },
  {
    title: 'İç Donanım',
    items: [
      { label: 'Koltuk Döşemesi', value: 'Deri' },
      { label: 'Klima', value: 'Otomatik (Çift Bölgeli)' },
      { label: 'Elektrikli Cam', present: true },
      { label: 'Geri Görüş Kamerası', present: true },
      { label: 'Isıtmalı Koltuk', present: false },
    ],
  },
]

const meta = {
  title: 'Bileşenler/Vitrin ve Yerleşim/GlassFeatureGroup',
  component: GlassFeatureGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['accordion', 'checklist', 'columns'] },
    columns: { control: 'select', options: [1, 2], description: 'Yalnız variant="columns" için geçerli' },
  },
} satisfies Meta<typeof GlassFeatureGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { groups: konutGroups, variant: 'accordion' },
  render: (args) => (
    <div style={{ maxWidth: 460, margin: '48px auto' }}>
      <GlassFeatureGroup {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: { groups: konutGroups, variant: 'accordion', columns: 1 },
  render: (args) => (
    <div style={{ maxWidth: 460, margin: '48px auto' }}>
      <GlassFeatureGroup {...args} />
    </div>
  ),
}

/** Accordion: grup başlığı gerçek `<button aria-expanded>` + `role="region"`; ilk grup varsayılan açık. */
export const Accordion: Story = {
  args: { groups: konutGroups, variant: 'accordion' },
  render: Default.render,
}

/**
 * Checklist: yalnız `label`+`present` verilen item'lar ikonlu ızgarada (✓ mevcut / ✕ soluk),
 * `value` verilen item'lar (ör. "Isıtma Tipi") aynı grupta ayrıca etiket:değer satırı olarak render edilir.
 */
export const Checklist: Story = {
  args: { groups: konutGroups, variant: 'checklist' },
  render: (args) => (
    <div style={{ maxWidth: 620, margin: '48px auto' }}>
      <GlassFeatureGroup {...args} />
    </div>
  ),
}

/** Columns: GlassSpecTable görünümü — grup başlıkları kasıtlı olarak heading DEĞİL (küçük kicker etiket). */
export const Columns: Story = {
  args: { groups: aracGroups, variant: 'columns', columns: 2 },
  render: (args) => (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <GlassFeatureGroup {...args} />
    </div>
  ),
}

/**
 * Uzun içerik: label `nowrap`, value `overflow-wrap: anywhere` ile kırılır; checklist etiketleri
 * ızgara hücresi içinde sarar. Uzun TR bileşik kelimeler (ör. "Yokuş Kalkış Destek Sistemi") güvenlidir.
 */
export const UzunIcerik: Story = {
  args: {
    variant: 'checklist',
    groups: [
      {
        title: 'Konfor ve Sürüş Destek Sistemleri',
        items: [
          { label: 'Adaptif Hız Sabitleyici ve Şerit Takip Asistanı', present: true },
          { label: 'Elektrikli Katlanır Ayna ve Hafızalı Koltuk Sistemi', present: true },
          { label: 'Kör Nokta İzleme ve Geri Trafik Uyarı Sistemi', present: false },
          { label: 'Isıtmalı ve Havalandırmalı Ön Koltuk Döşemesi', value: '360° Kamera ile Birlikte, Fabrika Çıkışlı Orijinal Donanım Paketi' },
        ],
      },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '48px auto' }}>
      <GlassFeatureGroup {...args} />
    </div>
  ),
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { groups: konutGroups, variant: 'accordion' },
  render: Default.render,
  parameters: {
    docs: {
      description: {
        story:
          'Accordion başlığı `<h3>` içinde gerçek `<button aria-expanded aria-controls>`; açık grup ' +
          '`role="region" aria-labelledby` ile eşlenir. Checklist ikonları `role="img" aria-label` ile ' +
          '"mevcut"/"yok" durumunu ekran okuyucuya taşır (yalnız renk/opaklıkla bırakılmaz). ' +
          'Odak halkası yalnız `:focus-visible`; Tab ile gezinip sırayı doğrulayın.',
      },
    },
  },
}
