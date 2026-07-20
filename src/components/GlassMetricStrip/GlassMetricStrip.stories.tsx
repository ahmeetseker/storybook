import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassMetricStrip } from './GlassMetricStrip'

const meta = {
  title: 'Components/GlassMetricStrip',
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
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, padding: 24 }}>
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
          '("Yükseliş:" / "Düşüş:" / "Yatay:") ekran okuyuculara yönü ayrı kanaldan iletir.',
      },
    },
  },
}
