import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassValuationDrivers, type GlassValuationDriver } from './GlassValuationDrivers'

// Gerçek ArsaPazar emlak verisi — bir ilanın AI değerlemesini etkileyen faktörler
const denizManzaraliDurumEvi: GlassValuationDriver[] = [
  { id: 'manzara', label: 'Deniz manzarası', impact: 320000, impactText: '+320.000 TL', note: 'Bölgedeki eş değerli ilanlara göre nadir bir özellik' },
  { id: 'kat', label: 'Yüksek kat (12/14)', impact: 140000, impactText: '+140.000 TL' },
  { id: 'metro', label: 'Metroya 5 dk yürüme', impact: 95000, impactText: '+95.000 TL' },
  { id: 'yas', label: 'Bina yaşı (18 yıl)', impact: -180000, impactText: '-180.000 TL', note: 'Bölge ortalamasının üzerinde bina yaşı' },
  { id: 'asansor', label: 'Asansörsüz apartman', impact: -60000, impactText: '-60.000 TL' },
]

const dusukEtkiliOrnek: GlassValuationDriver[] = [
  { id: 'balkon', label: 'Balkon', impact: 25000, impactText: '+25.000 TL' },
  { id: 'otopark', label: 'Kapalı otopark', impact: 18000, impactText: '+18.000 TL' },
  { id: 'cephe', label: 'Kuzey cephe', impact: -12000, impactText: '-12.000 TL' },
]

const meta = {
  title: 'Components/GlassValuationDrivers',
  component: GlassValuationDrivers,
  tags: ['autodocs'],
  args: {
    drivers: denizManzaraliDurumEvi,
    baseText: 'Bölge medyanı: 5.100.000 TL',
    title: 'Değerlemeyi Etkileyenler',
    confidence: 84,
  },
  argTypes: {
    title: { control: 'text' },
    baseText: { control: 'text' },
    confidence: { control: { type: 'number', min: 0, max: 100 } },
    loading: { control: 'boolean' },
    drivers: { control: false },
    onFeedback: { control: false, description: 'Verilirse 👍/👎 geri bildirim butonları görünür' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(460px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassValuationDrivers>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    drivers: dusukEtkiliOrnek,
    baseText: 'Bölge medyanı: 3.400.000 TL',
    confidence: 71,
  },
}

/** Tek genişlik ekseni: `impact` büyüklüğü — bar genişliği listedeki en büyük |impact|'e normalize edilir. Ayrı bir `variant`/`size` ekseni yok. */
export const Variants: Story = {
  name: 'Etki Büyüklüğü',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <GlassValuationDrivers
        title="Yüksek etki aralığı"
        drivers={denizManzaraliDurumEvi}
        baseText="Bölge medyanı: 5.100.000 TL"
        confidence={84}
      />
      <GlassValuationDrivers
        title="Düşük etki aralığı"
        drivers={dusukEtkiliOrnek}
        baseText="Bölge medyanı: 3.400.000 TL"
        confidence={71}
      />
    </div>
  ),
}

/** Geri bildirim: `onFeedback` verilince 👍/👎 butonları görünür; loading true iken bar listesi yerine flat skeleton + zorunlu AI rozeti gösterilir. */
export const States: Story = {
  name: 'Geri Bildirim ve Yükleme',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassValuationDrivers
        drivers={denizManzaraliDurumEvi}
        baseText="Bölge medyanı: 5.100.000 TL"
        confidence={84}
        onFeedback={fn()}
      />
      <GlassValuationDrivers
        drivers={denizManzaraliDurumEvi}
        baseText="Bölge medyanı: 5.100.000 TL"
      />
      <GlassValuationDrivers title="Yükleniyor" drivers={denizManzaraliDurumEvi} loading onFeedback={fn()} />
      <GlassValuationDrivers title="Sürücü bulunamadı" drivers={[]} baseText="Bölge medyanı: 5.100.000 TL" />
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <div style={{ width: 320 }}>
      <GlassValuationDrivers
        title="Kişiselleştirilmiş Değerleme Sürücüleri Analizi"
        baseText="Aynı mahalledeki eşdeğer 3+1 dairelerin bölge medyanı: 5.100.000 TL"
        confidence={84}
        drivers={[
          {
            id: 'manzara',
            label: 'Boğaz ve Deniz Manzarasına Kesintisiz Erişilebilirlik',
            impact: 320000,
            impactText: '+320.000 TL',
            note: 'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine uzun bir gerekçe cümlesi bile satır sararak okunabilir kalır.',
          },
          { id: 'yas', label: 'Bina Yaşının Bölge Ortalamasının Üzerinde Olması', impact: -180000, impactText: '-180.000 TL' },
        ]}
      />
    </div>
  ),
}

/** Dar konteyner + dokunmatik bağlam: satırlar tek sütuna daralır, geri bildirim butonları ≥44px hedef büyür. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    drivers: denizManzaraliDurumEvi,
    baseText: 'Bölge medyanı: 5.100.000 TL',
    confidence: 84,
    onFeedback: fn(),
  },
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
  args: { drivers: denizManzaraliDurumEvi, baseText: 'Bölge medyanı: 5.100.000 TL', confidence: 84 },
  parameters: {
    docs: {
      description: {
        story:
          'Liste `role="list"` taşır (bar track\'i tamamen `aria-hidden`, dekoratif); accessible name görünür ' +
          'başlıktan `aria-labelledby` ile gelir, `baseText` verilirse `aria-describedby` ile bağlanır. Her satırda ' +
          'görünen `impactText`\'in yanına görsel-gizli "— değeri artırıyor/azaltıyor/etkilemiyor" metni eklenir — ' +
          'yön yalnız +/- işaretine veya renge bırakılmaz. "✦ AI" rozeti `aria-label="Yapay zekâ üretimi"` taşır ve ' +
          'yükleme durumunda da görünür kalır. Geri bildirim butonları gerçek `<button aria-pressed>`; odak halkası ' +
          'yalnız `:focus-visible`.',
      },
    },
  },
}
