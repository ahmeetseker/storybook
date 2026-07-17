import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassMediaGallery, type GlassMediaGalleryItem } from './GlassMediaGallery'
import { placeholderImage } from '../../demo/placeholderImage'

const SAMPLE_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
const SAMPLE_TOUR = 'https://tur.arsapazar.com/ilan/34521/360'

const konakDairesi: GlassMediaGalleryItem[] = [
  { type: 'image', src: placeholderImage('Salon', '#3a5f8a', '#1f3a5f'), alt: 'Deniz manzaralı geniş salon', label: 'Salon' },
  { type: 'image', src: placeholderImage('Mutfak', '#5f3a8a', '#3a1f5f'), alt: 'Ankastre mutfak', label: 'Mutfak' },
  { type: 'image', src: placeholderImage('Yatak Odası', '#3a8a5f', '#1f5f3a'), alt: 'Ebeveyn yatak odası', label: 'Yatak Odası' },
  { type: 'image', src: placeholderImage('Banyo', '#8a5f3a', '#5f3a1f'), alt: 'Banyo', label: 'Banyo' },
  { type: 'image', src: placeholderImage('Balkon', '#8a3a3a', '#5f1f1f'), alt: 'Deniz manzaralı balkon', label: 'Balkon' },
  {
    type: 'video',
    src: SAMPLE_VIDEO,
    poster: placeholderImage('Tanıtım Videosu', '#2b2b2b', '#0f0f0f'),
    label: 'Daire Tanıtım Videosu',
  },
  { type: 'floorPlan', src: placeholderImage('Kat Planı', '#4a4a4a', '#232323'), alt: '3+1 daire kat planı, 145 m²', label: 'Kat Planı (145 m²)' },
  { type: 'tour360', src: SAMPLE_TOUR, alt: 'Dairenin 360° sanal turu', label: 'Sanal Tur' },
]

const meta = {
  title: 'Components/GlassMediaGallery',
  component: GlassMediaGallery,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'İlan detay sayfası için medya tipli galeri. `stage` varyantı tek şerit + büyük sahne sunar; ' +
          '`tabbed` varyantı medyayı türe göre (Fotoğraflar/Video/Kat Planı/Sanal Tur) ayrı sekmelerde gruplar ' +
          '— yalnız dolu tipler sekme olarak görünür. İçerik katmanı tamamen düz (`--lg-surface` + `--lg-hairline`); ' +
          'cam malzeme kullanılmaz.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['stage', 'tabbed'] },
  },
} satisfies Meta<typeof GlassMediaGallery>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { items: konakDairesi },
  render: (args) => (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <GlassMediaGallery {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: { items: konakDairesi, variant: 'stage', label: 'Konak, İzmir ilanı medya galerisi' },
  render: Default.render,
}

/**
 * `tabbed` varyantı: medya türüne göre Fotoğraflar/Video/Kat Planı/Sanal Tur sekmelerine
 * ayrılır. Sekmeler `GlassTabs` KULLANILMAZ — kendi `role="tablist"` yapısı vardır. Her
 * sekme panelinde yalnız o türün öğeleri sahne+thumbnail ile gösterilir.
 */
export const Tabbed: Story = {
  args: { items: konakDairesi, variant: 'tabbed' },
  render: Default.render,
}

/**
 * Tek tür eksikse (ör. bu ilanda sanal tur yok) o sekme hiç görünmez — "yalnız dolu
 * tipler görünür" kuralı.
 */
export const EksikTurler: Story = {
  args: { items: konakDairesi.filter((item) => item.type !== 'tour360'), variant: 'tabbed' },
  render: Default.render,
}

/**
 * Tek görsel: thumbnail şeridi ve sayaç otomatik gizlenir — gezinecek ikinci öğe yoktur.
 */
export const TekMedya: Story = {
  args: { items: [konakDairesi[0]] },
  render: Default.render,
}

/**
 * Uzun içerik: 14 karışık türde öğe — thumbnail şeridi yatay kaydırmaya düşer
 * (`scrollbar-width: none`), uzun etiketler sahne altyazısında ve thumbnail erişilebilir
 * adında kesintisiz kalır.
 */
export const UzunIcerik: Story = {
  args: {
    items: [
      ...konakDairesi,
      { type: 'image', src: placeholderImage('Antre', '#3a5f8a', '#1f3a5f'), alt: 'Antre ve vestiyer alanı', label: 'Antre' },
      { type: 'image', src: placeholderImage('Çocuk Odası', '#5f3a8a', '#3a1f5f'), alt: 'Çocuk odası', label: 'Çocuk Odası' },
      {
        type: 'image',
        src: placeholderImage('Ortak Alan', '#3a8a5f', '#1f5f3a'),
        alt: 'Site içi ortak yaşam alanı, yüzme havuzu ve çocuk oyun parkı',
        label: 'Site içindeki ortak kullanım alanları — yüzme havuzu, çocuk oyun parkı ve yürüyüş yolu',
      },
      { type: 'image', src: placeholderImage('Otopark', '#8a5f3a', '#5f3a1f'), alt: 'Kapalı otopark', label: 'Kapalı Otopark' },
      { type: 'image', src: placeholderImage('Asansör', '#8a3a3a', '#5f1f1f'), alt: 'Bina asansörü', label: 'Asansör' },
      { type: 'image', src: placeholderImage('Giriş', '#4a4a4a', '#232323'), alt: 'Bina girişi ve lobi', label: 'Bina Girişi' },
    ],
    variant: 'stage',
  },
  render: (args) => (
    <div style={{ maxWidth: 420, margin: '48px auto' }}>
      <GlassMediaGallery {...args} />
    </div>
  ),
}

/**
 * Erişilebilirlik: kök `role="region"` ile adlandırılır; `stage` sahnesi `role="group"`
 * ile sayaç bilgisini taşır. Thumbnail butonları `aria-current`, sekmeler `aria-selected`
 * kullanır. Video `controls` ile native klavye erişimine sahiptir, autoplay yoktur.
 * 360° tur `<iframe>` `sandbox` ile kısıtlıdır ve zorunlu `title` alır. Odak halkası
 * tüm etkileşimli öğelerde `:focus-visible` ile `--lg-accent` rengindedir.
 */
export const Erisilebilirlik: Story = {
  args: { items: konakDairesi, variant: 'tabbed', label: 'Konak, İzmir — 3+1 daire medya galerisi' },
  parameters: {
    docs: {
      description: {
        story:
          'Klavye ile: Tab thumbnail/sekme butonları arasında native sırayla gezinir (ok tuşu ' +
          'gezinmesi kasıtlı olarak eklenmemiştir — Tab akışı yeterli kabul edilmiştir). ' +
          'Ekran okuyucu: sekme geçişinde panel içeriği `aria-labelledby` ile sekmeye bağlanır.',
      },
    },
  },
  render: Default.render,
}
