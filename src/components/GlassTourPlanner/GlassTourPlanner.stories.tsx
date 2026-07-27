import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassTourPlanner, type GlassTourPlannerStop } from './GlassTourPlanner'
import { placeholderImage } from '../../demo/placeholderImage'

// Gerçek ArsaPazar emlak verisi — "Cmt 18 Tem" günü için 4 ilanlık AI tur planı
const kozluDuraklari: GlassTourPlannerStop[] = [
  {
    id: 'ilan-4821',
    title: 'Kozlu Fatih Sitesi 3+1',
    time: '11:00',
    duration: '30 dk',
    image: placeholderImage('Kozlu 3+1', '#f59e0b', '#b45309'),
  },
  {
    id: 'ilan-5107',
    title: 'Kılıç Mahallesi Deniz Manzaralı 2+1',
    time: '11:42',
    duration: '25 dk',
    travelNote: 'Önceki duraktan 12 dk araç',
    image: placeholderImage('Kılıç 2+1', '#0ea5e9', '#0369a1'),
  },
  {
    id: 'ilan-5288',
    title: 'Zonguldak Merkez Ofis Katı',
    time: '12:30',
    duration: '20 dk',
    travelNote: 'Önceki duraktan 18 dk araç',
    image: placeholderImage('Merkez Ofis', '#8b5cf6', '#5b21b6'),
  },
  {
    id: 'ilan-5340',
    title: 'Gökçebey Bahçeli Villa',
    time: '13:15',
    duration: '35 dk',
    travelNote: 'Önceki duraktan 22 dk araç — şehir dışı',
    image: placeholderImage('Gökçebey Villa', '#22c55e', '#15803d'),
  },
]

const meta = {
  title: 'Bileşenler/AI/GlassTourPlanner',
  component: GlassTourPlanner,
  tags: ['autodocs'],
  args: {
    stops: kozluDuraklari,
    date: 'Cmt 18 Tem',
    totalNote: '4 durak · ~2 sa 15 dk',
    confidence: 88,
    onConfirm: fn(),
  },
  argTypes: {
    date: { control: 'text' },
    totalNote: { control: 'text' },
    confidence: { control: { type: 'number', min: 0, max: 100 } },
    loading: { control: 'boolean' },
    stops: { control: false },
    onFeedback: { control: false, description: 'Verilirse 👍/👎 geri bildirim butonları görünür' },
    onConfirm: { control: false, description: '"Planı Onayla" tıklanınca çağrılır — buton her zaman görünür, verilmezse disabled' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(480px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassTourPlanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    stops: kozluDuraklari.slice(0, 2),
    date: 'Paz 19 Tem',
    totalNote: '2 durak · ~55 dk',
    confidence: 74,
    onFeedback: fn(),
  },
}

/** Geri bildirim: `onFeedback` verilince plan altında 👍/👎 butonları görünür; tıklanan yön `aria-pressed` ile işaretlenir. Verilmezse hiç render edilmez. */
export const GeriBildirim: Story = {
  name: 'Geri Bildirim',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <GlassTourPlanner
        stops={kozluDuraklari.slice(0, 2)}
        date="Cmt 18 Tem"
        totalNote="2 durak · ~55 dk"
        confidence={82}
        onFeedback={fn()}
        onConfirm={fn()}
      />
      <GlassTourPlanner
        stops={kozluDuraklari.slice(0, 2)}
        date="Cmt 18 Tem"
        totalNote="onFeedback verilmedi — geri bildirim satırı yok."
        onConfirm={fn()}
      />
    </div>
  ),
}

/** `onConfirm` verilmezse "Planı Onayla" butonu YOK SAYILMAZ — AI çıktısı asla otomatik eylem tetiklemediği için her zaman görünür kalır, yalnız `disabled` olur. */
export const OnaySozlesmesi: Story = {
  name: 'Onay Sözleşmesi',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, color: 'var(--lg-label-secondary)' }}>onConfirm verildi — buton aktif</p>
        <GlassTourPlanner stops={kozluDuraklari.slice(0, 2)} date="Cmt 18 Tem" totalNote="2 durak · ~55 dk" onConfirm={fn()} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, color: 'var(--lg-label-secondary)' }}>
          onConfirm verilmedi — buton yine görünür, disabled
        </p>
        <GlassTourPlanner stops={kozluDuraklari.slice(0, 2)} date="Cmt 18 Tem" totalNote="2 durak · ~55 dk" />
      </div>
    </div>
  ),
}

/** `loading=true` iken durak listesi yerine flat skeleton gösterilir; zorunlu "✦ AI" rozeti ve onay butonu (disabled) yine görünür kalır. */
export const Yukleniyor: Story = {
  name: 'Yükleniyor',
  args: {
    loading: true,
    onFeedback: fn(),
  },
}

/** Tek duraklı plan: bağlantı çizgisi ve travelNote render edilmez (ilk/son aynı durak). */
export const TekDurak: Story = {
  name: 'Tek Durak',
  args: {
    stops: [kozluDuraklari[0]],
    date: 'Pzt 20 Tem',
    totalNote: '1 durak · ~30 dk',
  },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <GlassTourPlanner
      date="Çarşamba, 22 Temmuz — Öğleden Sonra Turu"
      totalNote="5 durak · ~3 sa 40 dk (öğle molası dahil)"
      confidence={91}
      onFeedback={fn()}
      onConfirm={fn()}
      stops={[
        {
          id: 'ilan-6011',
          title: 'Kilimli Sahil Yolu Üzeri Denize Sıfır Dubleks Villa',
          time: '10:00',
          duration: '45 dk',
        },
        {
          id: 'ilan-6032',
          title: 'Alaplı Sanayi Bölgesi Geniş Depolu Ticari Dükkân',
          time: '11:15',
          duration: '20 dk',
          travelNote:
            'Önceki duraktan 40 dk araç — sahil yolu yoğun olabilir, alternatif güzergâh önerilir',
        },
        {
          id: 'ilan-6058',
          title: 'Çaycuma Merkez Yenilenmiş Bina İçi Asansörlü Daire',
          time: '12:10',
          duration: '25 dk',
          travelNote: 'Önceki duraktan 15 dk araç',
        },
        {
          id: 'ilan-6071',
          title: 'Devrek Orman Manzaralı Bahçe Katı Müstakil Ev',
          time: '13:30',
          duration: '30 dk',
          travelNote: 'Önceki duraktan 28 dk araç — öğle molası sonrası',
        },
        {
          id: 'ilan-6090',
          title: 'Gökçebey Tarım Arazisi İmarlı Köşe Parsel',
          time: '14:20',
          duration: '20 dk',
          travelNote: 'Önceki duraktan 14 dk araç',
        },
      ]}
    />
  ),
}

/** Dar konteyner + dokunmatik bağlam: kart tek sütuna daralır, geri bildirim/onay butonları ≥44px hedef büyür. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    stops: kozluDuraklari,
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
  args: { stops: kozluDuraklari, onFeedback: fn() },
  parameters: {
    docs: {
      description: {
        story:
          'Kök `<section aria-labelledby>` görünür tarih metnine bağlanır. Durak listesi `<ol role="list">` + ' +
          'her durak `<li role="listitem">` (Safari\'nin `list-style:none` uyguladığında listeyi VoiceOver\'dan ' +
          'gizleme hatasına karşı açıkça verilir); sıra numarası rozeti dekoratif (`aria-hidden`) — konum zaten ' +
          'native/explicit listitem semantiğiyle duyurulur. "✦ AI" rozeti `aria-label="Yapay zekâ üretimi"` taşır ' +
          've `loading` sırasında da görünür kalır. `confidence` verilirse "%N güven" görünür metin (yalnız renk ' +
          'değil) rozetin yanında yer alır. AI çıktısı asla otomatik eylem tetiklemez: "Planı Onayla" gerçek bir ' +
          '`<button>` olarak HER ZAMAN render edilir — `onConfirm` verilmezse `disabled` olur, gizlenmez. Geri ' +
          'bildirim butonları gerçek `<button aria-pressed>`; odak halkası yalnız `:focus-visible`.',
      },
    },
  },
}
