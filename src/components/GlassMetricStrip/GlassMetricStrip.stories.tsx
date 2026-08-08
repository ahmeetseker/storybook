import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassMetricStrip } from './GlassMetricStrip'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassMetricStrip',
  component: GlassMetricStrip,
  tags: ['autodocs'],
  args: {
    label: 'Portföy göstergeleri',
    size: 'md',
    items: [
      { id: 'views', label: 'Görüntülenme', value: '12.480', change: '%12', trend: 'up', hint: 'Son 7 gün' },
      { id: 'leads', label: 'Talep', value: '318', change: '%4', trend: 'down', hint: 'Geçen haftaya göre' },
      { id: 'time', label: 'Ortalama süre', value: '3g 4s', change: 'sabit', trend: 'steady' },
      { id: 'active', label: 'Aktif ilan', value: '54' },
    ],
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    variant: { control: 'inline-radio', options: ['plain', 'gradient'] },
    label: { control: 'text' },
  },
  decorators: [
    // Çerçeve genişliği story'den ayarlanabilir: `gradient` varyantı container
    // query ile kırıldığı için kırılımları görebilmek gerçek genişlik ister.
    (Story, context) => (
      <div style={{ maxWidth: (context.parameters.frameWidth as number | undefined) ?? 640, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassMetricStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Yön anlamı üç kanalda: renk + ok glifi + sr-only metin. */
export const TrendYonleri: Story = {
  name: 'Trend Yönleri',
  args: {
    items: [
      { id: 'up', label: 'Yükselen', value: '9.240', change: '%18', trend: 'up' },
      { id: 'down', label: 'Düşen', value: '1.120', change: '%6', trend: 'down' },
      { id: 'flat', label: 'Yatay', value: '540', change: 'değişmedi', trend: 'steady' },
    ],
  },
}

/** Değişimsiz metrikler — trend göstergesi çizilmez. */
export const DegisimsizDegerler: Story = {
  name: 'Değişimsiz Değerler',
  args: {
    items: [
      { id: 'a', label: 'Aktif ilan', value: '54' },
      { id: 'b', label: 'Bekleyen', value: '7' },
      { id: 'c', label: 'Arşiv', value: '210' },
    ],
  },
}

/** Kompakt yoğunluk — toolbar/dashboard başlığı bağlamı. */
export const Kompakt: Story = { args: { size: 'sm' } }

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    items: [
      {
        id: 'x',
        label: 'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimiz göstergesi',
        value: '128.940',
        change: '%12',
        trend: 'up',
        hint: 'Bu metrik uzun etiket ve açıklama ile taşma davranışını sınar.',
      },
      { id: 'y', label: 'Talep', value: '318', change: '%4', trend: 'down' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  parameters: {
    docs: {
      description: {
        story:
          'Kök `<dl>` + `aria-label` ile adlandırılır; her metrik `dt`/`dd` çiftidir. Trend yönü ' +
          'yalnız renge bırakılmaz: görünür ok glifi `aria-hidden`, yanında sr-only bir yön metni ' +
          '("Yükseliş:" / "Düşüş:" / "Yatay:") ekran okuyuculara yönü ayrı kanaldan iletir. ' +
          '`gradient` varyantında motif `aria-hidden`, rozet noktası dekoratiftir; bağlantının ' +
          'erişilebilir adı görünür metni içerir (WCAG 2.5.3).',
      },
    },
  },
}

/** Anasayfa "Pazarın hızlı özeti" bandının gerçek verisi. */
const pazarOzeti = [
  {
    id: 'listing-count',
    label: 'Aktif ilan',
    value: '48',
    hint: 'Ana sayfa portföyü',
    tone: 'accent' as const,
    motif: 'parcels' as const,
    action: { label: 'Portföyü gör', href: '#ilanlar' },
  },
  {
    id: 'verified-count',
    label: 'EİDS işaretli',
    value: '35',
    hint: 'Kaynağı görünür',
    tone: 'success' as const,
    motif: 'seal' as const,
    action: { label: 'Doğrulanmışları süz', href: '#dogrulanmis' },
  },
  {
    id: 'region-count',
    label: 'Bölge',
    value: '8',
    hint: 'Hızlı keşif bağlantısı',
    tone: 'neutral' as const,
    motif: 'pins' as const,
    action: { label: 'Bölgeleri keşfet', href: '#bolgeler' },
  },
  {
    id: 'featured-count',
    label: 'Vitrin ilanı',
    value: '5',
    hint: 'Öne çıkan seçim',
    tone: 'warning' as const,
    motif: 'star' as const,
    action: { label: 'Vitrini gör', href: '#vitrin' },
  },
]

/**
 * Degrade kart varyantı — her metrik kendi semantik tonunda. Ton `--lg-accent`,
 * `--lg-success`, `--lg-warning`, `--lg-danger` ve `--lg-label` token'larının
 * düşük oranlı karışımıdır; cam yüzey değildir.
 */
export const Degrade: Story = {
  parameters: { frameWidth: 960 },
  args: { variant: 'gradient', label: 'Arsa pazarı göstergeleri', items: pazarOzeti },
}

/** Degrade varyantı `action` olmadan — bağlantı çizilmez, şerit etkileşimsiz kalır. */
export const DegradeAksiyonsuz: Story = {
  name: 'Degrade · Aksiyonsuz',
  parameters: { frameWidth: 960 },
  args: {
    variant: 'gradient',
    items: pazarOzeti.map(({ action: _action, ...rest }) => rest),
  },
}

/** Tablet kırılımı — container 860px altına inince dört kart 2×2 olur. */
export const DegradeTablet: Story = {
  name: 'Degrade · Tablet',
  parameters: { frameWidth: 704 },
  args: { variant: 'gradient', items: pazarOzeti },
}

/**
 * Mobil kırılımı — container 560px altında kartlar alt alta yığılmaz;
 * `scroll-snap`'li yatay şeride döner ve sonraki kart kırpılarak görünür.
 */
export const DegradeMobil: Story = {
  name: 'Degrade · Mobil',
  parameters: { frameWidth: 382 },
  args: { variant: 'gradient', items: pazarOzeti },
}
