import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassValuationCard } from './GlassValuationCard'

const meta = {
  title: 'Components/GlassValuationCard',
  component: GlassValuationCard,
  tags: ['autodocs'],
  args: {
    estimate: 4850000,
    rangeLow: 4400000,
    rangeHigh: 5300000,
    listPrice: 5100000,
    confidence: 82,
    asOf: '16 Temmuz 2026 itibarıyla',
    onFeedback: fn(),
  },
  argTypes: {
    estimate: { control: { type: 'number', min: 0, step: 50000 } },
    rangeLow: { control: { type: 'number', min: 0, step: 50000 } },
    rangeHigh: { control: { type: 'number', min: 0, step: 50000 } },
    listPrice: { control: { type: 'number', min: 0, step: 50000 } },
    confidence: { control: { type: 'number', min: 0, max: 100 } },
    asOf: { control: 'text' },
    onFeedback: { control: false },
    loading: { control: 'boolean' },
    variant: { control: 'radio', options: ['panel', 'inline'] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(420px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassValuationCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    confidence: 68,
  },
}

/** `panel` (tam kart) ve `inline` (tek satır özet) yan yana. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>panel — tam kart</p>
        <GlassValuationCard
          estimate={6900000}
          rangeLow={6200000}
          rangeHigh={7600000}
          listPrice={7250000}
          confidence={76}
          asOf="16 Temmuz 2026 itibarıyla"
          onFeedback={fn()}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>inline — yalnız rozet + tahmin + aralık</p>
        <GlassValuationCard estimate={6900000} rangeLow={6200000} rangeHigh={7600000} variant="inline" />
      </div>
    </div>
  ),
}

/** Liste fiyatı karşılaştırmasının üç yönü: üstünde, altında, tahmine eşit. */
export const ListPriceKarsilastirma: Story = {
  name: 'Liste Fiyatı Karşılaştırması',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>liste fiyatı tahminin üstünde</p>
        <GlassValuationCard estimate={3980000} rangeLow={3600000} rangeHigh={4400000} listPrice={4400000} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>liste fiyatı tahminin altında</p>
        <GlassValuationCard estimate={3980000} rangeLow={3600000} rangeHigh={4400000} listPrice={3580000} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>liste fiyatı tahmine eşit</p>
        <GlassValuationCard estimate={3980000} rangeLow={3600000} rangeHigh={4400000} listPrice={3980000} />
      </div>
    </div>
  ),
}

/** Güven etiketi: yüksek, düşük, aralık dışı (clamp) ve verilmemiş (rozet yalnız). */
export const Confidence: Story = {
  name: 'Güven Etiketi',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassValuationCard estimate={2150000} rangeLow={1950000} rangeHigh={2350000} confidence={94} />
      <GlassValuationCard estimate={2150000} rangeLow={1950000} rangeHigh={2350000} confidence={38} />
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>confidence=140 → %100'e clamp edilir</p>
        <GlassValuationCard estimate={2150000} rangeLow={1950000} rangeHigh={2350000} confidence={140} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>confidence verilmedi → etiket yok</p>
        <GlassValuationCard estimate={2150000} rangeLow={1950000} rangeHigh={2350000} />
      </div>
    </div>
  ),
}

/** loading (rozet görünür, içerik placeholder), boş durum ve geri bildirim seçili hâli. */
export const States: Story = {
  name: 'Durumlar',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>loading — tahmin henüz üretiliyor</p>
        <GlassValuationCard estimate={0} rangeLow={0} rangeHigh={0} loading />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>
          boş durum — geçersiz veri (estimate negatif)
        </p>
        <GlassValuationCard estimate={-1} rangeLow={0} rangeHigh={0} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>geri bildirimli — 👍/👎 render edilir</p>
        <GlassValuationCard
          estimate={5450000}
          rangeLow={5100000}
          rangeHigh={5850000}
          confidence={71}
          onFeedback={fn()}
        />
      </div>
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    estimate: 18750000,
    rangeLow: 16900000,
    rangeHigh: 20600000,
    listPrice: 19950000,
    confidence: 58,
    asOf: 'Bölge emsal satış kayıtları ve son 12 aylık Datça-Palamutbükü hattı fiyat endeksi baz alınarak 16 Temmuz 2026 tarihinde güncellendi',
  },
}

/** Dar konteyner + dokunmatik bağlam: ray tam genişliğe uyar, geri bildirim butonları 44px'e büyür. */
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
          'Kök `role="group"` `aria-label="AI değerleme"` taşır. `✦ AI` rozeti ' +
          '`aria-label="Yapay zekâ üretimi"` ile her state\'te (içerik/loading/boş) koşulsuz görünür. ' +
          '`confidence` yalnız renkle değil "%N güven" metniyle duyurulur. Min–max ray tamamen ' +
          '`aria-hidden`\'dır — alt/üst sınır ve tahmin zaten görünür tabular metin olarak DOM\'da mevcuttur, ' +
          'ekran okuyucu ray\'i değil bu metinleri okur. Geri bildirim butonları gerçek `<button>` + ' +
          '`aria-pressed`, kendi `role="group"` `aria-label="Bu değerleme faydalı mıydı?"` içinde toplanır; ' +
          'tıklama karşılıklı dışlar ve asla otomatik bir eylem tetiklemez — yalnız `onFeedback` ' +
          'callback\'ini çağırır. `loading` sırasında kök `aria-busy="true"` taşır ve gerçek içerik yerine ' +
          '`aria-hidden` bir flat placeholder + görünmez "Değerleme yükleniyor" metni render edilir.',
      },
    },
  },
}
