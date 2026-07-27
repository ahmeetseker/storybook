import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassChart, type GlassChartPoint } from './GlassChart'

// İlan fiyat geçmişi — 9 aylık artan trend (spec özet örneğiyle birebir: 3.9M'den 4.25M'ye)
const fiyatGecmisi: GlassChartPoint[] = [
  { x: 'Kas 25', y: 3900000 },
  { x: 'Ara 25', y: 3950000 },
  { x: 'Oca 26', y: 4000000 },
  { x: 'Şub 26', y: 4050000 },
  { x: 'Mar 26', y: 4100000 },
  { x: 'Nis 26', y: 4150000 },
  { x: 'May 26', y: 4180000 },
  { x: 'Haz 26', y: 4220000 },
  { x: 'Tem 26', y: 4250000 },
]

// Aylık m² birim fiyat trendi — bölge ortalaması, düzenli artış
const m2Trendi: GlassChartPoint[] = [
  { x: 'Şub 26', y: 42500 },
  { x: 'Mar 26', y: 43100 },
  { x: 'Nis 26', y: 44000 },
  { x: 'May 26', y: 45200 },
  { x: 'Haz 26', y: 46800 },
  { x: 'Tem 26', y: 48000 },
]

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassChart',
  component: GlassChart,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['line', 'area', 'bar'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Saf SVG veri grafiği (kütüphane yok) — içerik katmanı flat kart. `type`: ' +
          "'line' (yalnız çizgi), 'area' (üstte %26→şeffaf dikey gradyanlı dolgu), 'bar' (sütun). " +
          'Son nokta her türde dolu daire + değer etiketiyle vurgulanır; pointer/tap ile en yakın ' +
          'noktaya dikey kılavuz + değer balonu belirir. role="img" + aria-label özet, altta görsel ' +
          'gizli tam veri tablosu.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, margin: '48px auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'line',
    title: 'Fiyat Geçmişi',
    points: fiyatGecmisi,
  },
}

export const Playground: Story = {
  args: {
    type: 'area',
    title: 'İlan Fiyat Geçmişi',
    points: fiyatGecmisi,
    tint: 'var(--lg-accent)',
    height: 220,
    valueSuffix: ' TL',
    showGrid: true,
  },
}

/**
 * Tür ekseni: `type='line'` (yalnız çizgi), `'area'` (gradyanlı dolgu), `'bar'` (sütun) —
 * aynı veri, üç render stratejisi. Son nokta vurgusu (dolu daire + etiket) her türde ortaktır.
 */
export const Turler: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassChart {...args} type="line" title="line" />
      <GlassChart {...args} type="area" title="area" />
      <GlassChart {...args} type="bar" title="bar" />
    </div>
  ),
  args: { points: fiyatGecmisi, height: 160 },
}

/** İkinci gerçek kullanım örneği: aylık m² birim fiyat trendi, sütun grafik + özel birim (TL/m²). */
export const AylikM2FiyatTrendi: Story = {
  args: {
    type: 'bar',
    title: 'Aylık m² Fiyat Trendi',
    points: m2Trendi,
    valueSuffix: ' TL/m²',
  },
}

/**
 * Uzun içerik: 24 aylık geçmiş (sık nokta, x ekseni yine yalnız ilk/orta/son gösterir — taşma
 * yok), geniş değer aralığı (villa fiyatı, milyon TL) tabular hizanın büyük rakamlarda da
 * bozulmadığını test eder.
 */
export const UzunIcerik: Story = {
  args: {
    type: 'area',
    title: 'Boğaz Manzaralı Villa — 24 Aylık Fiyat Geçmişi',
    points: Array.from({ length: 24 }, (_, i) => {
      const ay = new Date(2024, 7 + i, 1)
      const label = ay.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }).replace('.', '')
      const y = 38500000 + i * 425000 + (i % 3 === 0 ? -300000 : 0)
      return { x: label.charAt(0).toUpperCase() + label.slice(1), y }
    }),
  },
}

/**
 * Erişilebilirlik: `<svg>` `role="img"` + `aria-label` özeti (ilk ve son değerin kısa biçimi,
 * ör. "3.9M'den 4.25M'ye") taşır — ekran okuyucu tek satırda trend yönünü alır. Altında görsel
 * gizli (`sr-only`) `<table>` her noktayı tam değeriyle listeler (gerçek erişilebilir veri kaynağı).
 * Pointer/tap kılavuzu ve değer balonu dekoratiftir (`aria-hidden`) — screen reader kullanıcısı
 * zaten tabloya erişir. Giriş animasyonu yoktur; `prefers-reduced-motion` etkisiz kalır çünkü
 * zaten animasyon üretilmez.
 */
export const Erisilebilirlik: Story = {
  args: {
    type: 'area',
    title: 'Fiyat Geçmişi',
    points: fiyatGecmisi,
  },
  parameters: {
    docs: {
      description: {
        story:
          'role="img" + aria-label özet + sr-only tam veri tablosu; kılavuz/tooltip aria-hidden. ' +
          'Klavye odağı grafiğe girmez (etkileşimsiz görsel) — veri her zaman tablo üzerinden erişilebilir.',
      },
    },
  },
}
