import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassPriceRange, type GlassPriceRangeValue } from './GlassPriceRange'

// Sağa çarpık gerçekçi kira dağılımı: yoğunluk ortada, kuyruk sağda
const BANTLAR = [
  3, 6, 11, 18, 27, 38, 52, 66, 78, 86, 91, 88, 79, 68, 57, 46, 36, 28, 21, 16, 12, 9, 7, 5, 4, 3, 2, 2, 1, 1,
]

const TL = (v: number) => `${v.toLocaleString('tr-TR')} ₺`

const meta = {
  title: 'Bileşenler/Form/GlassPriceRange',
  component: GlassPriceRange,
  tags: ['autodocs'],
  args: {
    min: 300,
    max: 12000,
    step: 50,
    defaultValue: [850, 7400],
    label: 'Fiyat aralığı',
    hint: 'Ortalama 1.200 ₺',
    bins: BANTLAR,
    countLabel: 'ilan',
    formatValue: TL,
    onChange: fn(),
  },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    minGap: { control: 'number', description: 'İki kol arası en küçük mesafe; varsayılan `step`' },
    label: { control: 'text' },
    countLabel: { control: 'text' },
    disabled: { control: 'boolean' },
    value: { control: false, description: 'Controlled değer — verilirse `defaultValue` yok sayılır' },
    formatValue: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassPriceRange>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  parameters: {
    docs: { description: { story: 'Tüm public API burada; `hover`/`focus` control değildir (CSS state).' } },
  },
}

/** Histogram yoksa component düz bir aralık seçicidir — sütunlar ve dağılım özeti çizilmez. */
export const HistogramsIz: Story = {
  name: 'Histogramsız',
  args: { bins: undefined, hint: undefined },
}

/** Kollar yaklaşınca iki pil üst üste binerdi: tek pile birleşir, sınır etiketleri sönmez. */
export const BirlesikPil: Story = {
  name: 'Birleşik Pil',
  args: { defaultValue: [5200, 6100] },
}

/** Uçlara yapışan seçim: pil kaptan taşmaz, altındaki alan sınırı söner. */
export const UclardaSecim: Story = {
  name: 'Uçlarda Seçim',
  args: { defaultValue: [300, 12000] },
}

const ControlledDemo = (args: React.ComponentProps<typeof GlassPriceRange>) => {
  const [aralik, setAralik] = useState<GlassPriceRangeValue>([1500, 5000])
  const sonuc = BANTLAR.reduce((sum, count, i) => {
    const bant = 300 + i * ((12000 - 300) / BANTLAR.length)
    return bant >= aralik[0] && bant <= aralik[1] ? sum + count : sum
  }, 0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <GlassPriceRange {...args} value={aralik} onChange={setAralik} />
      <p style={{ margin: 0, fontSize: 'var(--lg-text-footnote)', color: 'var(--lg-label-secondary)' }}>
        Seçim: {TL(aralik[0])} – {TL(aralik[1])} · {sonuc} ilan
      </p>
    </div>
  )
}

/** Dışarıdan sürülen değer + yanında canlı sonuç sayısı (referans akışın özü). */
export const ControlledDeger: Story = {
  name: 'Controlled Değer',
  render: (args) => <ControlledDemo {...args} />,
}

/** Uzun içerik: 8 haneli değerler + uzun ikincil not; pil sarmalanmaz, kap taşmaz. */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    min: 250000,
    max: 48500000,
    step: 50000,
    defaultValue: [3750000, 28900000],
    hint: 'Kadıköy Feneryolu Mahallesi ortalaması 6.480.000 ₺',
    label: 'Satılık daire fiyat aralığı',
  },
}

/** Dar kap + dokunmatik: kol 28px’e büyür, dokunma hedefi 44px kalır. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export const States: Story = {
  name: 'Durumlar',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <GlassPriceRange {...args} label="Etkin" />
      <GlassPriceRange {...args} label="Kapalı" disabled />
    </div>
  ),
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  parameters: {
    docs: {
      description: {
        story:
          'Kök `role="group"` görünen başlıkla adlandırılır. İki kol native `<input type="range">` — ' +
          'ok tuşları `step`, Home/End alan uçları, PageUp/PageDown 10 adım. Kollar `minGap` kadar ' +
          'mesafeyi korur; sol kol sağı geçemez. Histogram ve skala satırı `aria-hidden`: taşıdıkları ' +
          'bilgi kolların `aria-valuemin/max/now/valuetext` değerlerinde ve dağılımın sr-only ' +
          'özetinde zaten var. Odak halkası yalnız `:focus-visible`’da çizilir.',
      },
    },
  },
}
