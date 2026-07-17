import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassCompareTable, type GlassCompareField, type GlassCompareListing } from './GlassCompareTable'
import { placeholderImage } from '../../demo/placeholderImage'

const fields: GlassCompareField[] = [
  { key: 'fiyat', label: 'Fiyat (TL)', higherIsBetter: false },
  { key: 'm2', label: 'Alan (m²)', higherIsBetter: true },
  { key: 'm2Fiyat', label: 'm² Birim Fiyat (TL)', higherIsBetter: false },
  { key: 'imar', label: 'İmar Durumu' },
  { key: 'tapu', label: 'Tapu Durumu' },
  { key: 'mesafe', label: 'Sahile Uzaklık (km)', higherIsBetter: false },
]

const listings: GlassCompareListing[] = [
  {
    id: 'ilan-urla',
    title: 'İzmir Urla, deniz manzaralı imarlı arsa',
    image: placeholderImage('Urla', '#0f766e', '#134e4a', 480, 360),
    values: { fiyat: 4250000, m2: 850, m2Fiyat: 5000, imar: 'Konut İmarlı', tapu: 'Müstakil Tapulu', mesafe: 1.2 },
  },
  {
    id: 'ilan-bodrum',
    title: 'Muğla Bodrum, zeytinlikli tarla',
    image: placeholderImage('Bodrum', '#92400e', '#78350f', 480, 360),
    values: { fiyat: 3100000, m2: 1200, m2Fiyat: 2583, imar: 'Tarla', tapu: 'Hisseli Tapulu', mesafe: 3.5 },
  },
  {
    id: 'ilan-kas',
    title: 'Antalya Kaş, deniz manzaralı köşe arsa',
    image: placeholderImage('Kaş', '#155e75', '#164e63', 480, 360),
    values: { fiyat: 5400000, m2: 700, m2Fiyat: 7714, imar: 'Konut İmarlı', tapu: 'Müstakil Tapulu', mesafe: 0.5 },
  },
]

const dorduncuIlan: GlassCompareListing = {
  id: 'ilan-ayvalik',
  title: 'Balıkesir Ayvalık, imarlı köşe parsel',
  image: placeholderImage('Ayvalık', '#7c2d12', '#431407', 480, 360),
  values: { fiyat: 2900000, m2: 500, m2Fiyat: 5800, imar: 'Konut İmarlı', tapu: 'Müstakil Tapulu', mesafe: 2.1 },
}

const besinciIlan: GlassCompareListing = {
  id: 'ilan-cesme',
  title: 'İzmir Çeşme, denize sıfır arsa',
  image: placeholderImage('Çeşme', '#1d4ed8', '#1e3a8a', 480, 360),
  values: { fiyat: 6800000, m2: 900, m2Fiyat: 7556, imar: 'Konut İmarlı', tapu: 'Müstakil Tapulu', mesafe: 0.1 },
}

const meta = {
  title: 'Components/GlassCompareTable',
  component: GlassCompareTable,
  tags: ['autodocs'],
  args: {
    fields,
    listings,
    'aria-label': 'İlan karşılaştırması',
  },
  argTypes: {
    highlightDifferences: { control: 'boolean' },
    onRemove: { control: false },
  },
} satisfies Meta<typeof GlassCompareTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 780, margin: '48px auto' }}>
      <GlassCompareTable {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: { onRemove: fn() },
  render: Default.render,
}

/** `onRemove` verilince her sütun başlığında kaldırma butonu görünür; kaldırılan ilan listeden düşer. */
function KaldirilabilirDemo() {
  const [current, setCurrent] = useState(listings)
  return (
    <div style={{ maxWidth: 780, margin: '48px auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--lg-label-secondary)' }}>{current.length} ilan karşılaştırılıyor</p>
      <GlassCompareTable
        fields={fields}
        listings={current}
        aria-label="İlan karşılaştırması — kaldırılabilir"
        onRemove={(id) => setCurrent((prev) => prev.filter((l) => l.id !== id))}
      />
    </div>
  )
}

export const Kaldirilabilir: Story = {
  render: () => <KaldirilabilirDemo />,
}

/**
 * `highlightDifferences=false`: satırlar arasındaki değer farkları hafif
 * vurgu almaz, yalnız `higherIsBetter` en iyi değer işaretlemesi kalır.
 */
export const VurgusuzKarsilastirma: Story = {
  args: { highlightDifferences: false },
  render: Default.render,
}

/** 4 ilan — desteklenen üst sınır; yan yana dört sütun. */
export const DortIlan: Story = {
  args: { listings: [...listings, dorduncuIlan] },
  render: Default.render,
}

/**
 * 4'ten fazla ilan verilirse fazlası sessizce (console uyarısı olmadan)
 * kırpılır — burada 5 ilan verilir, yalnız ilk 4'ü render edilir.
 */
export const BesIlanKirpilir: Story = {
  args: { listings: [...listings, dorduncuIlan, besinciIlan] },
  render: (args) => (
    <div style={{ maxWidth: 780, margin: '48px auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--lg-label-secondary)' }}>
        5 ilan gönderildi, yalnız ilk 4'ü gösterilir (bkz. rules.md §12).
      </p>
      <GlassCompareTable {...args} />
    </div>
  ),
}

/** Uzun başlık ve uzun metin değerleri: başlık 2 satırda kırpılır, hücre metni serbestçe kırılır. */
export const UzunIcerik: Story = {
  args: {
    listings: [
      {
        id: 'ilan-uzun-1',
        title: 'Muğla Milas Selimiye mevkii, zeytinlik ve bağ arasında deniz manzaralı büyük tarla imarlı arsa',
        image: placeholderImage('Milas', '#4d7c0f', '#365314', 480, 360),
        values: {
          fiyat: 7250000,
          m2: 2100,
          m2Fiyat: 3452,
          imar: 'Kısmen Konut İmarlı, kısmen Tarım Arazisi',
          tapu: 'Hisseli Tapulu, ifrazı yapılabilir',
          mesafe: 4.8,
        },
      },
      {
        id: 'ilan-uzun-2',
        title: 'Aydın Kuşadası, otoyola yakın ticari imarlı köşe parsel',
        image: placeholderImage('Kuşadası', '#a21caf', '#701a75', 480, 360),
        values: {
          fiyat: 9100000,
          m2: 1800,
          m2Fiyat: 5056,
          imar: 'Ticari İmarlı',
          tapu: 'Müstakil Tapulu',
          mesafe: 6.2,
        },
      },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 480, margin: '48px auto' }}>
      <GlassCompareTable {...args} />
    </div>
  ),
}

/** Dar ekran: kapsayıcı `overflow-x: auto` ile yatay kayar, ilk kolon sabit kalır, sayfa gövdesi kaymaz. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '24px auto' }}>
      <GlassCompareTable {...args} />
    </div>
  ),
}

/**
 * Erişilebilirlik: ilk kolon `th scope="row"`, sütun başlıkları `th
 * scope="col"`; kaldırma butonunun erişilebilir ismi "Karşılaştırmadan
 * çıkar: {ilan başlığı}" biçimindedir. En iyi değer yalnız renkle değil,
 * görsel olarak gizli "(en iyi değer)" metniyle de işaretlenir.
 */
export const Erisilebilirlik: Story = {
  args: { onRemove: fn() },
  parameters: {
    docs: {
      description: {
        story:
          'Gerçek `<table>` semantiği: ilk kolon `th scope="row"` ve yatay kaydırmada sabit kalır (`position: sticky`), sütun başlıkları `th scope="col"`. `higherIsBetter` verilen alanlarda en iyi değer yalnız `--lg-success` rengiyle değil, ekran okuyucular için görsel olarak gizli "(en iyi değer)" metniyle de işaretlenir.',
      },
    },
  },
  render: Default.render,
}
