import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassLightbox } from './GlassLightbox'
import { GlassButton } from '../GlassButton'
import { placeholderImage } from '../../demo/placeholderImage'

const images = [
  { src: placeholderImage('Salon', '#3a5f8a', '#1f3a5f'), alt: 'Dairenin salonu, geniş açıdan' },
  { src: placeholderImage('Mutfak', '#5f3a8a', '#3a1f5f'), alt: 'Ankastre mutfak' },
  { src: placeholderImage('Yatak Odası', '#3a8a5f', '#1f5f3a'), alt: 'Ebeveyn yatak odası' },
  { src: placeholderImage('Banyo', '#8a5f3a', '#5f3a1f'), alt: 'Banyo ve duşakabin' },
  { src: placeholderImage('Balkon', '#8a3a3a', '#5f1f1f'), alt: 'Balkondan manzara' },
]

const meta = {
  title: 'Bileşenler/Katmanlar/GlassLightbox',
  component: GlassLightbox,
  tags: ['autodocs'],
  args: { open: false, onClose: fn(), onIndexChange: fn(), images, thumbnails: true },
  argTypes: {
    thumbnails: { control: 'boolean' },
    label: { control: 'text' },
    note: { control: 'text' },
    // open/onClose bilinçli olarak controlled — story'ler kendi state'ini yönetir.
    // index verilirse component tamamen controlled olur; defaultIndex ile birlikte kullanılmaz.
  },
} satisfies Meta<typeof GlassLightbox>

export default meta
type Story = StoryObj<typeof meta>

/** Temel akış: tetikleyici buton → tam ekran görüntüleyici. Kapanınca focus tetikleyiciye döner. */
export const Default: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ padding: 48 }}>
        <GlassButton onClick={() => setOpen(true)}>Görselleri aç</GlassButton>
        <GlassLightbox {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
}

/** Playground: public API'nin tamamı Controls'tan sürülür (hover/focus control değildir). */
export const Playground: Story = {
  args: { label: 'İlan görselleri', note: 'Görseller temsili fotoğraflardır.' },
  render: Default.render,
}

/** Tek görsel: ok butonları, sayaç ve thumbnail şeridi çizilmez — yalnız kare + kapat. */
export const TekGorsel: Story = {
  args: { images: images.slice(0, 1) },
  render: Default.render,
}

/** `thumbnails={false}`: şerit kapanır, gezinme yalnız oklar ve klavyeyle yapılır. */
export const SeritsizGezinme: Story = {
  args: { thumbnails: false },
  render: Default.render,
}

/** Controlled indeks: kare dışarıdan sürülür; component kendi state'ini tutmaz. */
export const ControlledIndeks: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false)
    const [index, setIndex] = useState(2)
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 48 }}>
        <GlassButton onClick={() => setOpen(true)}>{`${index + 1}. kareden aç`}</GlassButton>
        <GlassButton onClick={() => setIndex((i) => (i + 1) % images.length)}>Sonraki kare</GlassButton>
        <GlassLightbox
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          index={index}
          onIndexChange={setIndex}
        />
      </div>
    )
  },
}

/** Uzun içerik: 20 kare (şerit yatay kayar, aktif kare görünürde tutulur) + uzun TR açıklama satırı. */
const odalar = [
  'Salon', 'Mutfak', 'Yatak Odası', 'Çocuk Odası', 'Banyo', 'Balkon', 'Antre', 'Çalışma Odası',
  'Ebeveyn Banyosu', 'Giyinme Odası', 'Kiler', 'Teras', 'Bahçe', 'Otopark', 'Bina Girişi',
  'Asansör', 'Site Havuzu', 'Spor Salonu', 'Manzara', 'Kat Planı',
]
const paletler: [string, string][] = [
  ['#3a5f8a', '#1f3a5f'],
  ['#5f3a8a', '#3a1f5f'],
  ['#3a8a5f', '#1f5f3a'],
  ['#8a5f3a', '#5f3a1f'],
  ['#8a3a3a', '#5f1f1f'],
]

export const UzunIcerik: Story = {
  args: {
    images: odalar.map((oda, i) => ({
      src: placeholderImage(oda, paletler[i % paletler.length][0], paletler[i % paletler.length][1]),
      alt: `Dairenin ${oda.toLocaleLowerCase('tr')} bölümünün geniş açıdan çekilmiş fotoğrafı`,
    })),
    defaultIndex: 8,
    label: 'İlan görselleri',
    note: 'Görseller temsili fotoğraflardır; yüklenemezse mevcut ilan görseli gösterilir ve kareler taşınmazın kendi fotoğrafları değildir.',
  },
  render: Default.render,
}

/**
 * Erişilebilirlik: dialog açılışta odağı alır, Tab kontroller arasında döner
 * (arka plana kaçmaz), Escape kapatır, ok tuşları gezinir ve kapanışta odak
 * tetikleyici butona döner. Şerit dokunmatikte 44px hedefe büyür.
 */
export const Erisilebilirlik: Story = {
  args: { label: 'İlan görselleri', defaultIndex: 1 },
  render: Default.render,
}
