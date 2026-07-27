import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassTimeline, type GlassTimelineEvent } from './GlassTimeline'

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)
const WarnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </svg>
)

const ilanSureciEvents: GlassTimelineEvent[] = [
  {
    id: 'yayin',
    date: '2 Haz 2026',
    title: 'İlan Yayınlandı',
    description: "Emlak danışmanı tarafından ArsaPazar'da yayına alındı.",
  },
  {
    id: 'teklif',
    date: '9 Haz 2026',
    title: 'İlk Teklif Alındı',
    description: '4.100.000 TL değerinde ilk teklif alıcı tarafından iletildi.',
  },
  {
    id: 'ekspertiz',
    date: '18 Haz 2026',
    title: 'Ekspertiz Tamamlandı',
    description: 'Bankadan gelen ekspertiz raporu olumlu sonuçlandı.',
    tone: 'success',
    icon: <CheckIcon />,
  },
  {
    id: 'kredi',
    date: '30 Haz 2026',
    title: 'Kredi Başvurusu Beklemede',
    description: "Alıcının banka kredi başvurusu değerlendirme aşamasında.",
    tone: 'warning',
    icon: <ClockIcon />,
  },
  {
    id: 'sozlesme',
    date: '10 Tem 2026',
    title: 'Sözleşme İmzalandı',
    description: 'Satış sözleşmesi noterde taraflarca imzalandı.',
    tone: 'success',
    icon: <CheckIcon />,
  },
  {
    id: 'devir',
    date: '16 Tem 2026',
    title: 'Tapu Devri Tamamlandı',
    description: 'Devir işlemi tapu müdürlüğünde sorunsuz tamamlandı.',
    tone: 'success',
    icon: <CheckIcon />,
  },
]

const binaGecmisiEvents: GlassTimelineEvent[] = [
  { id: 'temel', date: '2016', title: 'Temel Atıldı' },
  { id: 'iskan', date: '2018', title: 'İskan Alındı' },
  { id: 'ortak-alan', date: '2021', title: 'Ortak Alan Tadilatı Yapıldı' },
  { id: 'deprem-raporu', date: '2023', title: 'Deprem Yönetmeliği Uygunluk Raporu Alındı', tone: 'success' },
  { id: 'cati', date: '2025', title: 'Çatı Yalıtımı Yenilendi' },
]

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassTimeline',
  component: GlassTimeline,
  tags: ['autodocs'],
  args: { events: ilanSureciEvents, variant: 'line' },
  argTypes: {
    variant: { control: 'select', options: ['line', 'compact'] },
    events: { control: false },
    emptyState: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, margin: '32px auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { 'aria-label': 'İlan süreci' } }

export const Playground: Story = { args: { 'aria-label': 'İlan süreci' } }

/** `line`: sol rayda ton renkli noktalar + dikey çizgi, açıklama satırıyla. `compact`: yalnız tarih+başlık. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;line&quot; — İlan Süreci</p>
        <GlassTimeline events={ilanSureciEvents} variant="line" aria-label="İlan süreci" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;compact&quot; — Bina Geçmişi</p>
        <GlassTimeline events={binaGecmisiEvents} variant="compact" aria-label="Bina geçmişi" />
      </div>
    </div>
  ),
}

/** Ton eksenindeki dört durum (`default`/`success`/`warning`/`danger`) + boş liste durumu. */
export const States: Story = {
  name: 'Durumlar',
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', maxWidth: 900 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Tüm ton örnekleri</p>
        <GlassTimeline
          aria-label="Ton örnekleri"
          events={[
            { id: '1', date: '1 Tem 2026', title: 'İlan Yayınlandı', tone: 'default' },
            { id: '2', date: '5 Tem 2026', title: 'Ekspertiz Onaylandı', tone: 'success', icon: <CheckIcon /> },
            { id: '3', date: '9 Tem 2026', title: 'Belge Bekleniyor', tone: 'warning', icon: <ClockIcon /> },
            { id: '4', date: '12 Tem 2026', title: 'Kredi Başvurusu Reddedildi', tone: 'danger', icon: <WarnIcon /> },
          ]}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Boş liste</p>
        <GlassTimeline aria-label="Boş süreç" events={[]} />
      </div>
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <GlassTimeline
      aria-label="Uzun içerikli ilan süreci"
      events={[
        {
          id: 'uzun-1',
          date: '3 Tem 2026',
          title: 'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmiş Uzunlukta Bir Süreç Başlığı',
          description:
            'Bu açıklama satırı bilinçli olarak çok uzun tutulmuştur: kelime kırılmadan sarmalanmalı, ' +
            'ray/nokta hizası bozulmadan içerik gövdesi kendi genişliğinde kalmalı ve konteyner taşmamalıdır. ' +
            'Ayrıca Türkçe uzun sözcükler (ör. çekoslovakyalılaştıramadıklarımızdanmışsınızcasına) satır içinde ' +
            'düzgün kırılabilmelidir.',
          tone: 'warning',
          icon: <ClockIcon />,
        },
        {
          id: 'uzun-2',
          date: '11 Tem 2026',
          title: 'İkinci Olay',
          description: 'Kısa açıklama.',
          tone: 'success',
          icon: <CheckIcon />,
        },
      ]}
    />
  ),
}

/** Dar konteyner (320px): içerik gövdesi kırılır, ray/nokta hizası korunur. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, margin: '32px auto' }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { 'aria-label': 'İlan süreci' },
  parameters: {
    docs: {
      description: {
        story:
          'Liste `role="list"`, her olay `role="listitem"` taşır (Safari\'nin `list-style:none` ' +
          'uygulanan listeleri VoiceOver\'dan gizleme hatasına karşı açıkça belirtilir). Ray/nokta/bağlantı ' +
          'çizgisi tamamen dekoratif, `aria-hidden`. `tone` `default` DIŞINDA verildiğinde (`success`/' +
          '`warning`/`danger`) durum yalnız renkle değil, görsel-gizli bir metinle de duyurulur (ör. ' +
          '"— Durum: Tamamlandı"). Boş `events` dizisi bilgilendirici bir metinle gösterilir, hata fırlatmaz.',
      },
    },
  },
}
