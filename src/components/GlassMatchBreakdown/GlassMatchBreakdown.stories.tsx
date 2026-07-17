import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassMatchBreakdown, type GlassMatchBreakdownGroup } from './GlassMatchBreakdown'

// Gerçek ArsaPazar emlak verisi — MatchScore'un derin ekranı: genel uyum
// skorunun grup grup dökümü.
const yuksekUyumGruplari: GlassMatchBreakdownGroup[] = [
  {
    id: 'konum',
    label: 'Konum tercihlerin',
    score: 88,
    weight: '%30',
    details: [
      { label: 'Metroya 5 dk', matched: true },
      { label: 'İş yerine yakın', matched: true },
      { label: 'Sahil manzarası', matched: false },
    ],
  },
  {
    id: 'butce',
    label: 'Bütçe uyumu',
    score: 92,
    weight: '%25',
    details: [
      { label: '4.250.000 TL aralığında', matched: true },
      { label: 'Kredi uygun', matched: true },
    ],
  },
  {
    id: 'oda',
    label: 'Oda / metrekare',
    score: 95,
    weight: '%20',
    details: [
      { label: '3+1', matched: true },
      { label: '120 m² üzeri', matched: true },
    ],
  },
  {
    id: 'bina',
    label: 'Bina özellikleri',
    score: 60,
    weight: '%15',
    details: [
      { label: 'Otoparklı', matched: true },
      { label: 'Asansörlü', matched: false },
      { label: 'Güvenlikli site', matched: false },
    ],
  },
  {
    id: 'ulasim',
    label: 'Ulaşım',
    score: 74,
    weight: '%10',
    details: [
      { label: 'Otobüs durağı 3 dk', matched: true },
      { label: 'Ana yola cephe', matched: true },
    ],
  },
]

const dusukUyumGruplari: GlassMatchBreakdownGroup[] = [
  {
    id: 'konum',
    label: 'Konum tercihlerin',
    score: 35,
    weight: '%30',
    details: [
      { label: 'Metroya 5 dk', matched: false },
      { label: 'İş yerine yakın', matched: false },
    ],
  },
  {
    id: 'butce',
    label: 'Bütçe uyumu',
    score: 58,
    weight: '%25',
    details: [{ label: '4.250.000 TL aralığında', matched: true }],
  },
  {
    id: 'oda',
    label: 'Oda / metrekare',
    score: 20,
    weight: '%20',
    details: [
      { label: '3+1', matched: false },
      { label: '120 m² üzeri', matched: false },
    ],
  },
  {
    id: 'bina',
    label: 'Bina özellikleri',
    score: 44,
    weight: '%15',
    details: [{ label: 'Otoparklı', matched: false }],
  },
]

const meta = {
  title: 'Components/GlassMatchBreakdown',
  component: GlassMatchBreakdown,
  tags: ['autodocs'],
  args: {
    overall: 84,
    title: 'Uyum Dökümü',
    groups: yuksekUyumGruplari,
    confidence: 91,
  },
  argTypes: {
    overall: { control: { type: 'number', min: 0, max: 100 } },
    title: { control: 'text' },
    confidence: { control: { type: 'number', min: 0, max: 100 } },
    loading: { control: 'boolean' },
    groups: { control: false },
    onFeedback: { control: false, description: 'Verilirse 👍/👎 geri bildirim butonları görünür' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(420px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassMatchBreakdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    overall: 52,
    groups: dusukUyumGruplari,
    confidence: 76,
  },
}

/** Renk eşiği otomatik: ≥70 success, 40-69 accent, <40 danger — hem genel satırda hem her grupta kendi skorundan hesaplanır, prop yok. */
export const RenkEsigi: Story = {
  name: 'Renk Eşiği',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <GlassMatchBreakdown overall={91} title="Yüksek uyum" groups={yuksekUyumGruplari} confidence={88} />
      <GlassMatchBreakdown
        overall={52}
        title="Orta uyum"
        groups={[
          { id: 'konum', label: 'Konum tercihlerin', score: 65, weight: '%30' },
          { id: 'butce', label: 'Bütçe uyumu', score: 45, weight: '%25' },
          { id: 'oda', label: 'Oda / metrekare', score: 30, weight: '%20' },
        ]}
        confidence={70}
      />
      <GlassMatchBreakdown overall={22} title="Düşük uyum" groups={dusukUyumGruplari} confidence={64} />
    </div>
  ),
}

/** Geri bildirim: `onFeedback` verilince 👍/👎 butonları görünür; tıklanan yön `aria-pressed` ile işaretlenir. Verilmezse hiç render edilmez. `loading=true` iken zorunlu "✦ AI" rozeti yine görünür kalır. */
export const States: Story = {
  name: 'Geri Bildirim',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <GlassMatchBreakdown overall={84} groups={yuksekUyumGruplari} confidence={91} onFeedback={fn()} />
      <GlassMatchBreakdown overall={84} groups={yuksekUyumGruplari} />
      <GlassMatchBreakdown overall={0} title="Yükleniyor" groups={[]} loading onFeedback={fn()} />
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <div style={{ width: 320 }}>
      <GlassMatchBreakdown
        overall={67}
        title="Kişiselleştirilmiş Uyum Skoru Dökümü"
        confidence={81}
        groups={[
          {
            id: 'konum',
            label: 'Toplu Taşımaya Erişilebilirlik ve Konum Tercihlerin',
            score: 72,
            weight: '%30',
            details: [
              { label: 'Metro İstasyonuna Yürüme Mesafesi', matched: true },
              { label: 'Merkezi İş Alanına Yakınlık Kriteri', matched: false },
            ],
          },
          {
            id: 'bina',
            label: 'Bina Donanımı ve Ortak Alan Özellikleri',
            score: 40,
            weight: '%20',
            details: [
              { label: 'Ebeveyn Banyosu ve Ankastre Mutfak Donanımı', matched: true },
              { label: 'Merkezi Isıtma Sistemi ve Isı Yalıtımı', matched: false },
            ],
          },
        ]}
      />
    </div>
  ),
}

/** Dar konteyner + dokunmatik bağlam: grup satırları tek sütuna daralır, detay chip'leri satır sarar, geri bildirim butonları ≥44px hedef büyür. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    overall: 68,
    groups: dusukUyumGruplari,
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
  args: { overall: 84, groups: yuksekUyumGruplari, confidence: 91 },
  parameters: {
    docs: {
      description: {
        story:
          'Genel skor satırı ve her grup ayrı ayrı `role="meter"` + `aria-valuemin/max/now` taşır; ' +
          'grubun accessible name\'i görünür başlığından (ve varsa ağırlık etiketinden) `aria-labelledby` ile gelir. ' +
          '"✦ AI" rozeti `aria-label="Yapay zekâ üretimi"` taşır — AI üretimi içerik her zaman işaretlenir. ' +
          '`confidence` verilirse "%N güven" görünür metin olarak (yalnız renk değil) rozetin yanında yer alır. ' +
          'Detay chip\'lerinde eşleşme durumu görsel-gizli "(eşleşti)/(eşleşmedi)" metniyle de iletilir, ikon dekoratiftir. ' +
          'Geri bildirim butonları gerçek `<button aria-pressed>`; odak halkası yalnız `:focus-visible`. ' +
          '`loading=true` iken tek duyuru noktası her zaman mount edilmiş bir `role="status"` düğümüdür.',
      },
    },
  },
}
