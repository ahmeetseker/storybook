import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassAiSummaryCard } from './GlassAiSummaryCard'

const meta = {
  title: 'Bileşenler/AI/GlassAiSummaryCard',
  component: GlassAiSummaryCard,
  tags: ['autodocs'],
  args: {
    summary:
      'Bu 3+1 daire, Kadıköy Fenerbahçe sahil şeridine 400 metre mesafede ve toplu taşımaya yürüme uzaklığında. ' +
      'Bölgedeki benzer ilanlarla karşılaştırıldığında m² fiyatı ortalamanın %6 altında; son bir yılda bölge değer artışı %18 oldu.',
    pros: ['Sahile ve metroya yürüme mesafesi', 'Yenilenmiş mutfak ve banyo', 'Güney cephe, gün boyu doğal ışık'],
    cons: ['Bina 1998 yapımı, asansör dar', 'Kapalı otopark yok'],
    confidence: 82,
    onFeedback: fn(),
  },
  argTypes: {
    summary: { control: 'text' },
    pros: { control: false },
    cons: { control: false },
    confidence: { control: { type: 'number', min: 0, max: 100 } },
    sourceNote: { control: 'text' },
    onFeedback: { control: false },
    loading: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(560px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassAiSummaryCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    confidence: 68,
  },
}

/** Üç içerik yoğunluğu yan yana: yalnız özet, tek kolon, iki kolon artı/eksi. */
export const Variants: Story = {
  name: 'İçerik Varyantları',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>pros/cons yok — yalnız özet</p>
        <GlassAiSummaryCard
          summary="Bu arsa, Silivri sahil bandına 2 km mesafede ve imar durumu konut+ticari karma kullanım olarak onaylı. Bölgede son altı ayda 4 emsal satış işlemi gerçekleşti."
          confidence={57}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>yalnız Artılar (Eksiler kolonu render edilmez)</p>
        <GlassAiSummaryCard
          summary="Beşiktaş'ta 2+1 kiralık daire, merkezi konumda ve toplu taşıma ağına çok yakın. Bölgedeki kira getirisi il ortalamasının üzerinde seyrediyor."
          pros={['Metrobüs durağına 3 dakika', 'Yeni tesisatlı bina', 'Site içi güvenlik 7/24']}
          confidence={74}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>yalnız Eksiler (Artılar kolonu render edilmez)</p>
        <GlassAiSummaryCard
          summary="Çankaya'daki bu villa geniş bahçesi ve müstakil konumuyla öne çıkıyor; ancak bazı bakım kalemleri dikkat gerektiriyor."
          cons={['Çatı izolasyonu 2010 sonrası yenilenmemiş', 'Isıtma sistemi kombi, doğalgaz altyapısı yok']}
          confidence={45}
        />
      </div>
    </div>
  ),
}

/** Geri bildirim seçili durumları: hiçbiri, 👍 seçili, 👎 seçili. */
export const States: Story = {
  name: 'Durumlar',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassAiSummaryCard
        summary="Üsküdar'da 4+1 daire, Boğaz manzaralı ve ulaşım ağlarına yakın konumda."
        pros={['Boğaz manzarası', 'Geniş balkon']}
        cons={['Aidat bölge ortalamasının üzerinde']}
        confidence={79}
        onFeedback={fn()}
      />
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>loading — özet henüz üretiliyor</p>
        <GlassAiSummaryCard summary="" loading />
      </div>
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    summary:
      'Muğla Bodrum Yalıkavak\'ta deniz manzaralı bu villa, toplam 320 m² kapalı alana ve 850 m² özel bahçeye sahip; ' +
      'bölgedeki emsal satış verileri incelendiğinde m² birim fiyatının hem Yalıkavak merkez hem de çevre mahallelerdeki ' +
      'benzer villa projelerine kıyasla makul bir aralıkta konumlandığı, buna karşın yaz sezonunda talebin ciddi biçimde ' +
      'arttığı ve bu nedenle fiyatlandırmanın sezonluk dalgalanmalara açık olabileceği değerlendirilmektedir.',
    pros: [
      'Doğrudan deniz manzarası, günbatımı cephesi',
      'Özel yüzme havuzu ve peyzajı tamamlanmış geniş bahçe',
      'Yalıkavak Marina\'ya araçla 8 dakika mesafede',
    ],
    cons: [
      'Kışın site içi ortak alan bakımının sınırlı yapıldığına dair emsal ilan yorumları mevcut',
      'Ana yola ulaşım dar ve virajlı bir köy yolundan sağlanıyor',
    ],
    confidence: 63,
    sourceNote:
      'İlan verisi, bölge emsal satış kayıtları ve son 12 aylık Yalıkavak-Gümüşlük hattı fiyat endeksinden üretildi',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

/** Dar konteyner + dokunmatik bağlam: artı/eksi ızgarası dikey akışa düşer, geri bildirim butonları 44px'e büyür. */
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
          'Kök `<article>`, "AI Özeti" `<h3>`\'üne `aria-labelledby` ile bağlanır. `aiGenerated` rozeti ' +
          '(`✦ AI`) her zaman `aria-label="Yapay zekâ üretimi"` taşır ve loading dahil koşulsuz görünür. ' +
          '`confidence` yalnız renkle değil "%N güven" metniyle duyurulur; sonlu olmayan değerde tamamen ' +
          'gizlenir. "Artılar"/"Eksiler" bilinçli olarak `<h4>` değil güçlü `<span>`\'dir — her biri kendi ' +
          '`<ul>`\'unu `aria-labelledby` ile adlandırır, ✓/− işaretleri `aria-hidden`\'dır (anlam yalnız ' +
          'metinden gelir). Geri bildirim butonları gerçek `<button>` + `aria-pressed`; tıklama karşılıklı ' +
          'dışlar ve asla otomatik bir eylem tetiklemez — yalnız `onFeedback` callback\'ini çağırır. ' +
          '`loading` sırasında kök `aria-busy="true"` taşır ve özet/kolonlar/geri bildirim yerine ' +
          '`aria-hidden` bir flat placeholder render edilir.',
      },
    },
  },
}
