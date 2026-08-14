import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassBarList } from './GlassBarList'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassBarList',
  component: GlassBarList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Kategorik payları satır satır okutan yatay bar listesi — yaş dağılımı, eğitim durumu, alt bölge ' +
          'nüfusu gibi demografik kırılımlar için. Bilgi tamamen metinde taşınır (etiket + değer); bar salt ' +
          'görsel orandır ve erişilebilirlik ağacına girmez. Histogram ve medyan bandı gerekiyorsa ' +
          '`GlassDistributionChart` kullanılır.',
      },
    },
  },
  argTypes: {
    scale: { control: 'inline-radio', options: ['total', 'max'] },
    tint: { control: 'color' },
  },
} satisfies Meta<typeof GlassBarList>

export default meta
type Story = StoryObj<typeof meta>

const YAS_DAGILIMI = [
  { id: '0-14', label: '0–14 yaş', value: 18 },
  { id: '15-24', label: '15–24 yaş', value: 15 },
  { id: '25-44', label: '25–44 yaş', value: 34 },
  { id: '45-64', label: '45–64 yaş', value: 22 },
  { id: '65+', label: '65 yaş +', value: 11 },
]

const EGITIM = [
  { id: 'uni', label: 'Üniversite', value: 42 },
  { id: 'lise', label: 'Lise', value: 31 },
  { id: 'orta', label: 'Ortaokul', value: 12 },
  { id: 'ilk', label: 'İlkokul', value: 11 },
  { id: 'yok', label: 'Öğrenim görmemiş', value: 4 },
]

const ILCE_NUFUS = [
  { id: 'kadikoy', label: 'Kadıköy', value: 467_919, prominent: true },
  { id: 'uskudar', label: 'Üsküdar', value: 524_452 },
  { id: 'besiktas', label: 'Beşiktaş', value: 175_190 },
  { id: 'atasehir', label: 'Ataşehir', value: 427_217 },
  { id: 'maltepe', label: 'Maltepe', value: 515_021 },
]

export const Default: Story = {
  args: { label: 'Yaş dağılımı', items: YAS_DAGILIMI },
}

export const Playground: Story = {
  args: { label: 'Eğitim durumu', items: EGITIM, scale: 'total' },
}

/** Mutlak sayılarda `scale="max"` sıralamayı okutur; vurgulu satır sayfanın kendi bölgesidir. */
export const MutlakDegerVeVurgu: Story = {
  name: 'Mutlak değer + vurgulu satır',
  args: {
    label: 'İlçe nüfus dağılımı',
    items: ILCE_NUFUS,
    scale: 'max',
    formatValue: (v: number) => v.toLocaleString('tr-TR'),
  },
}

/** Tek öğede `valueLabel` görünür metni ezer — bastırılmış veri gizlenmez, gerekçesiyle görünür. */
export const VeriYokSatiri: Story = {
  name: 'Veri yok satırı',
  args: {
    label: 'Eğitim durumu',
    items: [...EGITIM.slice(0, 3), { id: 'gizli', label: 'Diğer', value: 0, valueLabel: 'veri yok' }],
  },
}

export const UzunEtiketler: Story = {
  name: 'Uzun içerik',
  args: {
    label: 'Uzun etiketli kırılım',
    items: [
      { id: 'a', label: 'Yükseköğretim ve lisansüstü mezunları toplamı', value: 46 },
      { id: 'b', label: 'Genel ve mesleki-teknik ortaöğretim', value: 33 },
      { id: 'c', label: 'Temel eğitim', value: 21 },
    ],
  },
  parameters: { layout: 'padded' },
}

export const Responsive: Story = {
  args: { label: 'Yaş dağılımı', items: YAS_DAGILIMI },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

/** İki liste yan yana — endeks sayfasındaki demografi düzeni. */
export const YanYana: Story = {
  name: 'Gerçek bağlam: yan yana',
  args: { label: 'Yaş dağılımı', items: YAS_DAGILIMI },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, maxWidth: 640 }}>
      <GlassBarList label="Yaş dağılımı" items={YAS_DAGILIMI} />
      <GlassBarList label="Eğitim durumu" items={EGITIM} tint="var(--lg-warning)" />
    </div>
  ),
}
