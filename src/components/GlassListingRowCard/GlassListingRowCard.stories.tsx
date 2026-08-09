import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassListingRowCard } from './GlassListingRowCard'
import { GlassBadge } from '../GlassBadge'
import { placeholderImage } from '../../demo/placeholderImage'

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassListingRowCard',
  component: GlassListingRowCard,
  tags: ['autodocs'],
  args: {
    onOpen: fn(),
    onMenuOpen: fn(),
    onFavoriteChange: fn(),
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'Yoğunluk ekseni — `sm` daha ince satır.',
    },
    rating: { control: { type: 'range', min: 0, max: 5, step: 0.1 } },
    href: {
      control: 'text',
      description: '`onOpen` ile birlikte verilirse `href` kazanır (başlık `<a>` olur).',
    },
  },
} satisfies Meta<typeof GlassListingRowCard>

export default meta
type Story = StoryObj<typeof meta>

const strokeIcon = (path: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden focusable="false">
    <path d={path} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const BedIcon = () => strokeIcon('M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 18v-8m18 8v-2M7 11V8h5v3')
const BathIcon = () => strokeIcon('M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM7 12V6a2 2 0 0 1 3.4-1.4M6 19l-1 2m14-2 1 2')
const AreaIcon = () => strokeIcon('M3 8h18v8H3zM7 8v3m5-3v5m5-5v3')
const VisitIcon = () => strokeIcon('M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1zM9.5 12l1.6 1.6 3.4-3.4')
const PhoneIcon = () => strokeIcon('M6.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 6.1 6.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z')
const MailIcon = () => strokeIcon('M3.5 6.5h17v11h-17zM3.5 7l8.5 6 8.5-6')
const ChatIcon = () => strokeIcon('M4 5.5h16v11H9l-5 3.5V5.5ZM8.5 11h.01M12 11h.01M15.5 11h.01')

const image = {
  src: placeholderImage('Villa', '#2f5d8a', '#7fc7d9'),
  alt: 'Havuzlu villanın bahçeden görünümü',
}

const referenceArgs = {
  image,
  title: 'Water Elysian, Villa',
  price: '₺2.200.000',
  priceSuffix: '/yıl',
  rating: 4.9,
  location: 'Çeşme, İzmir',
  mediaCount: 5,
  activeMediaIndex: 1,
  badge: <GlassBadge material="flat">Yeni İlan</GlassBadge>,
  features: [
    { label: '4 Oda', icon: <BedIcon /> },
    { label: '3 Banyo', icon: <BathIcon /> },
    { label: '1.400 m²', icon: <AreaIcon /> },
  ],
  note: { text: 'Danışman bu konutu 12 Haziran’da gezdi', icon: <VisitIcon /> },
  agent: { name: 'Zara Balogun' },
  listedAt: '1 gün önce eklendi',
  actions: [
    { id: 'call', label: 'Danışmanı ara', icon: <PhoneIcon />, href: 'tel:+902321112233' },
    { id: 'mail', label: 'E-posta gönder', icon: <MailIcon />, href: 'mailto:zara@ornek.com' },
    { id: 'chat', label: 'WhatsApp’tan yaz', icon: <ChatIcon /> },
  ],
} satisfies Partial<Meta<typeof GlassListingRowCard>['args']>

/** Referans düzenin birebir karşılığı — rozet, favori, puan, özellik rozetleri ve iletişim ayağı. */
export const Default: Story = {
  args: { ...referenceArgs, defaultFavorite: false },
}

export const Playground: Story = {
  args: { ...referenceArgs, size: 'md', defaultFavorite: false },
}

/** Yoğunluk ekseni — `sm` liste yoğun ekranlarda satırı inceltir. */
export const Sizes: Story = {
  args: referenceArgs,
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <GlassListingRowCard {...args} size="md" />
      <GlassListingRowCard {...args} size="sm" />
    </div>
  ),
}

/**
 * Slot varyasyonları — arama sonucu düzeni (fotoğraf sayısı etiketi, birim
 * fiyat ve metin eylemi), ardından sade/favorisiz kart.
 */
export const Variants: Story = {
  args: referenceArgs,
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <GlassListingRowCard
        {...args}
        rating={undefined}
        note={undefined}
        mediaCount={undefined}
        mediaCaption="8 fotoğraf"
        footerMeta="8.301 TL/m²"
        actions={[{ id: 'compare', label: 'Karşılaştır' }]}
      />
      <GlassListingRowCard
        {...args}
        note={undefined}
        actions={undefined}
        agent={undefined}
        listedAt="3 saat önce eklendi"
      />
      <GlassListingRowCard
        {...args}
        badge={undefined}
        rating={undefined}
        note={undefined}
        mediaCount={undefined}
        onFavoriteChange={undefined}
        defaultFavorite={undefined}
        onMenuOpen={undefined}
      />
    </div>
  ),
}

/** State — favori basılı, menüsüz ve tetikleyicisiz (statik başlık) kart. */
export const States: Story = {
  args: referenceArgs,
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <GlassListingRowCard {...args} favorite onFavoriteChange={fn()} />
      <GlassListingRowCard {...args} onOpen={undefined} href={undefined} onMenuOpen={undefined} />
    </div>
  ),
}

/** Uzun içerik — TR uzun kelimeler, taşan fiyat ve çok sayıda özellik rozeti. */
export const UzunIcerik: Story = {
  args: {
    ...referenceArgs,
    title: 'Kahramanmaraşlılaştıramadıklarımızdan Deniz Manzaralı Müstakil Villa',
    price: '₺12.750.000.000',
    priceSuffix: '/yıl + KDV',
    location: 'Muvakkithane Caddesi, Kuzguncuk Mahallesi, Üsküdar, İstanbul',
    features: [
      { label: '9 Oda', icon: <BedIcon /> },
      { label: '5 Banyo', icon: <BathIcon /> },
      { label: '1.400 m² brüt', icon: <AreaIcon /> },
      { label: '2 Salon' },
      { label: 'Eşyalı' },
    ],
    note: {
      text: 'Danışman bu konutu 12 Haziran’da gezdi ve tapu bilgilerini kurum kaydıyla doğruladı',
      icon: <VisitIcon />,
    },
    agent: { name: 'Zeynep Kahramanmaraşlıoğlu' },
  },
}

/** Responsive — kart dar bir kapsayıcıda medyayı üste alarak dikey düzene döner. */
export const Responsive: Story = {
  args: referenceArgs,
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr', maxWidth: 360 }}>
      <GlassListingRowCard {...args} />
    </div>
  ),
}

/**
 * Erişilebilirlik — kart `<article>`'dır ve başlığından adlandırılır. Odak sırası:
 * favori → başlık → diğer işlemler → iletişim eylemleri. İkon-tek kontrollerin
 * hepsinde `label`/`aria-label` vardır.
 */
export const Erisilebilirlik: Story = {
  args: referenceArgs,
  parameters: {
    docs: {
      description: {
        story:
          'Puan satırında görünen rakam `aria-hidden`; sesli okuyucu değeri GlassRating’in `role="img"` etiketinden alır, böylece puan iki kez okunmaz.',
      },
    },
  },
}
