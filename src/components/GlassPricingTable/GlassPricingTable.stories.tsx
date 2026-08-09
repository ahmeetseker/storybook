import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassPricingTable, type GlassPricingPeriod, type GlassPricingPlan } from './GlassPricingTable'

// Gerçek ArsaPazar planları — ilan sahibi, danışman ve ofis kademeleri
const plans: GlassPricingPlan[] = [
  {
    id: 'bireysel',
    name: 'Bireysel',
    kind: 'ilan sahibi',
    description: 'Kendi mülkünü yayınlayan ilan sahibi için. Tek portföy, tek gelen kutusu.',
    price: { monthly: 249, yearly: 2390 },
    seats: { included: 1, max: 1 },
    action: { label: 'Planı seç' },
    secondaryAction: { label: 'Detayları gör' },
    featuresTitle: 'Plana dahil',
    features: [
      '3 aktif ilan',
      'İlan kartı ve galeri',
      'Harita üzerinde konum',
      'Mesaj kutusu',
      'Aylık performans özeti',
    ],
  },
  {
    id: 'profesyonel',
    name: 'Profesyonel',
    kind: 'danışman',
    description:
      'Danışmanlar için. Vitrin önceliği, alıcı eşleşmesi ve yapay zekâ destekli ilan metni.',
    price: { monthly: 749, yearly: 7190 },
    seats: { included: 1, max: 10, extraMonthly: 180, extraYearly: 1730 },
    action: { label: 'Planı seç' },
    secondaryAction: { label: 'Demo talep et' },
    prominent: true,
    badge: 'En çok seçilen',
    featuresTitle: 'Bireysel’deki her şey, ayrıca',
    features: [
      '50 aktif ilan',
      'Vitrin sıralamasında öncelik',
      'Yapay zekâ ilan özeti',
      'Alıcı eşleşme skoru',
      'Değerleme ve bölge raporu',
      'Randevu takvimi',
    ],
  },
  {
    id: 'kurumsal',
    name: 'Kurumsal',
    kind: 'ofis ve ekip',
    description: 'Ofisler ve portföy ekipleri için. Çok kullanıcı, yetki katmanı ve veri aktarımı.',
    price: { monthly: 1890, yearly: 18140 },
    seats: { included: 5, max: 25, extraMonthly: 290, extraYearly: 2780 },
    action: { label: 'Satışla görüş' },
    secondaryAction: { label: 'Fiyat teklifi al' },
    featuresTitle: 'Profesyonel’deki her şey, ayrıca',
    features: [
      'Sınırsız ilan',
      '25 kullanıcıya kadar ekip',
      'Ekip panosu ve yetkiler',
      'API ve toplu ilan aktarımı',
      'Marka rengiyle özelleştirme',
      'Öncelikli destek',
    ],
  },
]

const footnote = (
  <>
    <span>Fiyatlara KDV dahil değildir. İstediğiniz zaman iptal edebilirsiniz.</span>
    <span>Yıllık planlarda 14 gün koşulsuz iade.</span>
  </>
)

function Frame({ width = 1180, children }: { width?: number | string; children: React.ReactNode }) {
  return <div style={{ maxWidth: width, margin: '48px auto', padding: '0 16px' }}>{children}</div>
}

/** Controlled story gövdesi — hook'lar story render fonksiyonunda değil burada yaşar. */
function ControlledDemo(args: React.ComponentProps<typeof GlassPricingTable>) {
  const [period, setPeriod] = useState<GlassPricingPeriod>('yearly')
  return (
    <Frame>
      <p style={{ font: '400 15px/1.5 var(--lg-font)', color: 'var(--lg-label-secondary)' }}>
        Dışarıdan seçili dönem: <b style={{ color: 'var(--lg-label)' }}>{period}</b>{' '}
        <button
          type="button"
          onClick={() => setPeriod(period === 'monthly' ? 'yearly' : 'monthly')}
          style={{ marginLeft: 8 }}
        >
          değiştir
        </button>
      </p>
      <GlassPricingTable {...args} period={period} onPeriodChange={setPeriod} />
    </Frame>
  )
}

const meta = {
  title: 'Bileşenler/Vitrin ve Yerleşim/GlassPricingTable',
  component: GlassPricingTable,
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'inline-radio',
      options: ['auto', 'grid', 'compact'],
      description:
        '`auto` konteyner genişliğini ölçer (620px altı → compact). `compact` yalnız dar alanda anlamlıdır; geniş alanda zorlanırsa liste satırları gereksiz uzar.',
    },
    period: { control: false, description: 'Controlled — verilirse `defaultPeriod` yok sayılır' },
    defaultPeriod: { control: 'inline-radio', options: ['monthly', 'yearly'] },
    animatePrice: { control: 'boolean' },
    currency: { control: 'text' },
    locale: { control: 'text' },
    compactActionLabel: {
      control: 'text',
      description: '`{plan}` seçili planın adıyla değişir; yalnız compact yerleşimde görünür',
    },
    yearlyDiscountLabel: {
      control: 'text',
      description: 'Boş bırakılırsa ilk planın aylık/yıllık farkından hesaplanır',
    },
  },
} satisfies Meta<typeof GlassPricingTable>

export default meta
type Story = StoryObj<typeof meta>

/** Temel sözleşme: üç plan, dönem anahtarı, vurgulanan tek plan. */
export const Default: Story = {
  args: { plans, footnote },
  render: (args) => (
    <Frame>
      <GlassPricingTable {...args} />
    </Frame>
  ),
}

export const Playground: Story = {
  args: {
    plans,
    footnote,
    layout: 'auto',
    defaultPeriod: 'monthly',
    animatePrice: true,
    currency: '₺',
    locale: 'tr-TR',
    compactActionLabel: '{plan} ile devam et',
  },
  render: Default.render,
}

/**
 * Yerleşim ekseni. `grid` geniş alanda karşılaştırma için, `compact` dar
 * alanda seçim için. Fark yalnız görsel değildir: `compact` planları
 * `radiogroup` yapar ve seçili olmayan gövdeler `inert` olur.
 */
export const Yerlesimler: Story = {
  name: 'Yerleşimler (grid · compact)',
  args: { plans, footnote },
  render: (args) => (
    <Frame width={1180}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <section>
          <h3 style={{ margin: '0 0 16px', font: '600 17px/1.3 var(--lg-font)' }}>grid — 1180px</h3>
          <GlassPricingTable {...args} layout="grid" />
        </section>
        <section>
          <h3 style={{ margin: '0 0 16px', font: '600 17px/1.3 var(--lg-font)' }}>compact — 390px</h3>
          <div style={{ width: 390 }}>
            <GlassPricingTable {...args} layout="compact" />
          </div>
        </section>
      </div>
    </Frame>
  ),
}

/**
 * Kolon sayısını konteyner seçer — viewport değil. Üç kutu aynı sayfada,
 * aynı prop'larla: 1180 / 760 / 390 px.
 */
export const Responsive: Story = {
  args: { plans, footnote },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48, padding: 32 }}>
      {[1180, 760, 390].map((width) => (
        <section key={width}>
          <h3 style={{ margin: '0 0 16px', font: '600 17px/1.3 var(--lg-font)' }}>
            {width}px konteyner
          </h3>
          <div style={{ width, maxWidth: '100%' }}>
            <GlassPricingTable {...args} />
          </div>
        </section>
      ))}
    </div>
  ),
}

/** Dört plan: tek kalan plan olmadığı için tablet kademesinde 2×2 ızgara olur. */
export const DortPlan: Story = {
  name: 'Dört plan (bant yok)',
  args: {
    plans: [
      ...plans,
      {
        id: 'franchise',
        name: 'Franchise',
        kind: 'çok şubeli ağ',
        description: 'Şube ağı için merkezi portföy yönetimi ve şube bazlı raporlama.',
        price: { monthly: 4900, yearly: 47000 },
        action: { label: 'Satışla görüş' },
        featuresTitle: 'Kurumsal’daki her şey, ayrıca',
        features: ['Sınırsız şube', 'Merkezî yetki yönetimi', 'Şube bazlı rapor', 'Özel entegrasyon'],
      },
    ],
    footnote,
  },
  render: (args) => (
    <Frame width={980}>
      <GlassPricingTable {...args} />
    </Frame>
  ),
}

/**
 * Controlled dönem: `period` + `onPeriodChange`. Dışarıdaki kontrol ile
 * component'in kendi anahtarı aynı durumu okur.
 */
export const Controlled: Story = {
  args: { plans, footnote },
  render: (args) => <ControlledDemo {...args} />,
}

/**
 * Sınır durumları: kullanıcı adedi tavanda/tabanda (kontrol pasifleşir),
 * ikincil eylemi olmayan plan, rozeti olmayan plan.
 */
export const Durumlar: Story = {
  name: 'Durumlar (sınırlar)',
  args: {
    plans: [
      { ...plans[0], secondaryAction: undefined },
      { ...plans[1], badge: undefined, prominent: false },
      plans[2],
    ],
    footnote,
    layout: 'compact',
    defaultSelectedPlanId: 'kurumsal',
    defaultSeats: { kurumsal: 25 },
  },
  render: (args) => (
    <Frame width={390}>
      <GlassPricingTable {...args} />
    </Frame>
  ),
}

/** Uzun TR metinleri, altı basamaklı tutar ve sarma davranışı. */
export const UzunIcerik: Story = {
  name: 'Uzun içerik',
  args: {
    plans: plans.map((plan) => ({
      ...plan,
      name: plan.id === 'kurumsal' ? 'Kurumsal Gayrimenkul Ağı' : plan.name,
      kind: plan.id === 'kurumsal' ? 'çok şubeli portföy yönetimi' : plan.kind,
      description:
        'Gayrimenkul danışmanlığı yapan ekipler için portföy yönetimi, alıcı eşleştirmesi, değerleme raporları ve randevu takibi tek panelde toplanır.',
      price:
        plan.id === 'kurumsal' ? { monthly: 189_900, yearly: 1_823_040 } : plan.price,
      features: [
        ...plan.features,
        'Kurumsal müşteri temsilcisi ve öncelikli teknik destek hattı',
      ],
    })),
    footnote,
  },
  render: (args) => (
    <Frame width={1180}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <GlassPricingTable {...args} layout="grid" />
        <div style={{ width: 360 }}>
          <GlassPricingTable {...args} layout="compact" />
        </div>
      </div>
    </Frame>
  ),
}

/**
 * Erişilebilirlik: dönem anahtarı ve plan listesi birer `radiogroup`; ok
 * tuşları seçimi taşır, `Tab` gruba bir kez girer (roving tabindex). Fiyat
 * rulosu `aria-hidden`, değişim görünmez bir `aria-live` bölgesinde duyurulur.
 * Adet kontrolünün görünür kutusu 32px, dokunma hedefi 44px'tir.
 */
export const Erisilebilirlik: Story = {
  args: { plans, footnote, layout: 'compact' },
  render: (args) => (
    <Frame width={390}>
      <GlassPricingTable {...args} />
    </Frame>
  ),
}

/** Rulo kapalı: uzun listelerde ve görsel regresyon testinde deterministik. */
export const AnimasyonsuzFiyat: Story = {
  name: 'Animasyonsuz fiyat',
  args: { plans, footnote, animatePrice: false, defaultPeriod: 'yearly' },
  render: Default.render,
}
