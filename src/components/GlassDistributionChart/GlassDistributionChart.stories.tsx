import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassDistributionChart, type GlassDistributionBin } from './GlassDistributionChart'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassDistributionChart',
  component: GlassDistributionChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Fiyat dağılımı histogramı. GlassChart’ın `bar` türü yerine geçmez: o SON sütunu vurgular ' +
          '(zaman serisinde doğru), dağılımda ise son bant en pahalı banttır ve vurgulanması yanıltıcıdır. ' +
          'Burada vurgulanan medyanın düştüğü banttır. Altındaki persentil şeridi dağılımın tek sayıya ' +
          'indirgenmesini engeller.',
      },
    },
  },
  argTypes: {
    height: { control: { type: 'range', min: 120, max: 360, step: 20 } },
    countLabel: { control: 'text' },
    sampleSize: { control: 'number' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof GlassDistributionChart>

export default meta
type Story = StoryObj<typeof meta>

const BANTLAR: GlassDistributionBin[] = [
  { id: 'b1', label: '< 60 bin', count: 8 },
  { id: 'b2', label: '60–70 bin', count: 21 },
  { id: 'b3', label: '70–80 bin', count: 34 },
  { id: 'b4', label: '80–90 bin', count: 29, containsMedian: true },
  { id: 'b5', label: '90–100 bin', count: 17 },
  { id: 'b6', label: '100 bin +', count: 11 },
]

const PERSENTILLER = [
  { id: 'p10', label: 'P10', value: '64.200 TL/m²' },
  { id: 'p25', label: 'P25', value: '72.900 TL/m²' },
  { id: 'p50', label: 'Medyan', value: '82.500 TL/m²', prominent: true },
  { id: 'p75', label: 'P75', value: '91.400 TL/m²' },
  { id: 'p90', label: 'P90', value: '103.800 TL/m²' },
]

export const Default: Story = {
  args: {
    title: 'm² fiyatına göre ilan dağılımı',
    bins: BANTLAR,
    markers: PERSENTILLER,
    sampleSize: 120,
    countLabel: 'ilan',
  },
}

export const Playground: Story = {
  args: {
    title: 'm² fiyatına göre ilan dağılımı',
    bins: BANTLAR,
    markers: PERSENTILLER,
    sampleSize: 120,
    countLabel: 'ilan',
    height: 200,
  },
}

/** Persentil şeridi isteğe bağlıdır; yalnız histogram da geçerli bir kullanımdır. */
export const PersentilsizVarsayilan: Story = {
  name: 'Persentil şeridi olmadan',
  args: { title: 'Yalnız histogram', bins: BANTLAR, sampleSize: 120 },
}

/** Medyan bandı işaretlenmezse hiçbir sütun vurgulanmaz — keyfi vurgu yapılmaz. */
export const MedyansIz: Story = {
  name: 'Medyan bandı işaretsiz',
  args: {
    title: 'Vurgusuz dağılım',
    bins: BANTLAR.map((b) => ({ ...b, containsMedian: false })),
    sampleSize: 120,
  },
}

/** Çarpık dağılım — uzun sağ kuyruk; medyan sola kayar. */
export const CarpikDagilim: Story = {
  name: 'Çarpık dağılım',
  args: {
    title: 'Sağa çarpık: birkaç yüksek ilan ortalamayı yukarı çeker',
    bins: [
      { id: 'a', label: '< 60 bin', count: 44, containsMedian: true },
      { id: 'b', label: '60–80 bin', count: 31 },
      { id: 'c', label: '80–100 bin', count: 12 },
      { id: 'd', label: '100–150 bin', count: 5 },
      { id: 'e', label: '150 bin +', count: 2 },
    ],
    markers: [
      { id: 'p50', label: 'Medyan', value: '57.400 TL/m²', prominent: true },
      { id: 'ort', label: 'Ortalama', value: '71.900 TL/m²' },
    ],
    sampleSize: 94,
  },
}

/** Uzun TR bant etiketleri kırpılır (ellipsis); sütun genişliği bozulmaz. */
export const UzunIcerik: Story = {
  name: 'Uzun içerik',
  args: {
    title: 'Uzun bant etiketleriyle metrekare birim fiyat dağılımı — Kadıköy Feneryolu Mahallesi',
    bins: [
      { id: 'a', label: '60.000 TL altında', count: 8 },
      { id: 'b', label: '60.000 – 80.000 TL arası', count: 34, containsMedian: true },
      { id: 'c', label: '80.000 – 100.000 TL arası', count: 29 },
      { id: 'd', label: '100.000 TL ve üzeri', count: 11 },
    ],
    sampleSize: 82,
  },
}

/** Dar kapta sütunlar sıkışır, etiketler kırpılır; sayfa yatay taşmaz. */
export const Responsive: Story = {
  render: (args) => (
    <div style={{ width: 320, border: '1px dashed var(--lg-hairline)', padding: 8 }}>
      <GlassDistributionChart {...args} />
    </div>
  ),
  args: { title: 'Dar kap', bins: BANTLAR, markers: PERSENTILLER, sampleSize: 120 },
}

/** Boş bant listesi sessizce çökmez. */
export const VeriYok: Story = {
  name: 'Veri yok',
  args: { title: 'Boş', bins: [] },
}

/**
 * Erişilebilirlik: SVG `role="img"` + bant sayısı, toplam gözlem ve medyan
 * bandını içeren özet taşır; altında ekran okuyucuya açık tam veri tablosu
 * vardır ve medyan bandı satır başlığında "(medyan bandı)" olarak işaretlenir.
 * Medyan vurgusu renge ek olarak dikey kesikli işaretle de iletilir.
 */
export const Erisilebilirlik: Story = {
  args: { title: 'Erişilebilir özet ve veri tablosu', bins: BANTLAR, markers: PERSENTILLER, sampleSize: 120 },
}
