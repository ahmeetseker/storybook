import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassMatchScore, type GlassMatchScoreCriterion } from './GlassMatchScore'

// Gerçek ArsaPazar emlak verisi — "senin kriterlerine göre" uyum kriterleri
const yuksekUyumKriterleri: GlassMatchScoreCriterion[] = [
  { label: '3+1', matched: true },
  { label: 'Bütçe aralığında', matched: true },
  { label: 'Otoparklı', matched: true },
  { label: 'Metroya yakın', matched: true },
  { label: 'Asansörlü', matched: false },
]

const dusukUyumKriterleri: GlassMatchScoreCriterion[] = [
  { label: '2+1', matched: false },
  { label: 'Bütçe aralığında', matched: true },
  { label: 'Otoparklı', matched: false },
  { label: 'Metroya yakın', matched: false },
]

const meta = {
  title: 'Components/GlassMatchScore',
  component: GlassMatchScore,
  tags: ['autodocs'],
  args: {
    value: 86,
    title: 'Sana Uygunluk',
    criteria: yuksekUyumKriterleri,
    explanation: 'Bütçene, oda sayısı tercihine ve ulaşım kriterlerine büyük ölçüde uyuyor.',
    confidence: 92,
    variant: 'card',
  },
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 100 } },
    title: { control: 'text' },
    explanation: { control: 'text' },
    confidence: { control: { type: 'number', min: 0, max: 100 } },
    variant: { control: 'select', options: ['card', 'compact'] },
    loading: { control: 'boolean' },
    criteria: { control: false },
    onFeedback: { control: false, description: 'Verilirse 👍/👎 geri bildirim butonları görünür' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(420px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassMatchScore>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    value: 64,
    title: 'Sana Uygunluk',
    criteria: dusukUyumKriterleri,
    explanation: 'Bütçe uyuyor ama oda sayısı ve konum tercihlerinle kısmen örtüşüyor.',
    confidence: 78,
  },
}

/** `card`: tam kart — halka + başlık + rozet + açıklama + kriter chip'leri + geri bildirim. `compact`: yalnız halka + başlık + rozet, tek satır — ilan kartlarına gömülür. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <GlassMatchScore
        variant="card"
        value={86}
        criteria={yuksekUyumKriterleri}
        explanation="Bütçene, oda sayısı tercihine ve ulaşım kriterlerine büyük ölçüde uyuyor."
        confidence={92}
      />
      <div
        style={{
          width: 280,
          borderRadius: 'var(--lg-radius-card)',
          border: '1px solid var(--lg-hairline)',
          padding: 16,
        }}
      >
        <GlassMatchScore variant="compact" value={86} confidence={92} />
      </div>
    </div>
  ),
}

/** Renk eşiği otomatik: ≥70 success, 40-69 accent, <40 danger — `value`'dan hesaplanır, prop yok. */
export const RenkEsigi: Story = {
  name: 'Renk Eşiği',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <GlassMatchScore value={91} title="Yüksek uyum" criteria={yuksekUyumKriterleri} confidence={88} />
      <GlassMatchScore
        value={55}
        title="Orta uyum"
        criteria={dusukUyumKriterleri}
        explanation="Bazı kriterlerin karşılanmıyor, yine de değerlendirilebilir bir seçenek."
        confidence={70}
      />
      <GlassMatchScore
        value={22}
        title="Düşük uyum"
        criteria={[
          { label: '2+1', matched: false },
          { label: 'Bütçe aralığında', matched: false },
          { label: 'Otoparklı', matched: false },
        ]}
        explanation="Bütçe ve oda sayısı kriterlerinin çoğuyla örtüşmüyor."
        confidence={64}
      />
    </div>
  ),
}

/** Geri bildirim: `onFeedback` verilince 👍/👎 butonları görünür; tıklanan yön `aria-pressed` ile işaretlenir. Verilmezse hiç render edilmez. */
export const States: Story = {
  name: 'Geri Bildirim',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <GlassMatchScore
        value={78}
        criteria={yuksekUyumKriterleri}
        explanation="👍/👎 ile geri bildirim verilebilir."
        confidence={85}
        onFeedback={fn()}
      />
      <GlassMatchScore value={78} criteria={yuksekUyumKriterleri} explanation="onFeedback verilmedi — aksiyon satırı yok." />
      <GlassMatchScore value={0} title="Yükleniyor" loading criteria={yuksekUyumKriterleri} onFeedback={fn()} />
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
      <GlassMatchScore
        value={73}
        title="Kişiselleştirilmiş Uygunluk Değerlendirmesi"
        explanation="Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine uzun bir gerekçe cümlesi bile açıklama alanında satır sararak okunabilir kalır."
        criteria={[
          { label: 'Toplu Taşımaya Erişilebilirlik Kriteri', matched: true },
          { label: 'Ebeveyn Banyosu ve Ankastre Mutfak Donanımı', matched: true },
          { label: 'Merkezi Isıtma Sistemi ve Isı Yalıtımı', matched: false },
        ]}
        confidence={81}
      />
      <div style={{ width: 200, borderRadius: 'var(--lg-radius-card)', border: '1px solid var(--lg-hairline)', padding: 16 }}>
        <GlassMatchScore variant="compact" value={73} title="Kişiselleştirilmiş Uygunluk Değerlendirmesi" confidence={81} />
      </div>
    </div>
  ),
}

/** Dar konteyner + dokunmatik bağlam: kart tek sütuna daralır, kriter chip'leri satır sarar, geri bildirim butonları ≥44px hedef büyür. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    value: 68,
    criteria: dusukUyumKriterleri,
    explanation: 'Otobüs durağı 3 dk yürüyüş, ancak metroya uzak.',
    confidence: 74,
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
  args: { value: 86, criteria: yuksekUyumKriterleri, explanation: 'Bütçene ve oda sayısı tercihine uyuyor.', confidence: 92 },
  parameters: {
    docs: {
      description: {
        story:
          'Halka `role="meter"` + `aria-valuemin/max/now` taşır; accessible name görünür başlıktan ' +
          '`aria-labelledby` ile gelir. `explanation` verilince `aria-describedby` ile bağlanır. ' +
          '"✦ AI" rozeti `aria-label="Yapay zekâ üretimi"` taşır — AI üretimi içerik her zaman işaretlenir. ' +
          '`confidence` verilirse "%N güven" görünür metin olarak (yalnız renk değil) rozetin yanında yer alır. ' +
          'Geri bildirim butonları gerçek `<button aria-pressed>`; odak halkası yalnız `:focus-visible`.',
      },
    },
  },
}
