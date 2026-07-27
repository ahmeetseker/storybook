import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassAgencyCard } from './GlassAgencyCard'
import { placeholderImage } from '../../demo/placeholderImage'

const kayaLogo = placeholderImage('KE', '#b45309', '#7c3d0a', 200, 200)

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassAgencyCard',
  component: GlassAgencyCard,
  tags: ['autodocs'],
  args: {
    name: 'Kaya Emlak Gayrimenkul',
    tagline: 'İstanbul Anadolu Yakası Yetkili Bayi',
    stats: [
      { label: 'Aktif İlan', value: '48' },
      { label: 'Danışman', value: '12' },
    ],
    verified: true,
    verifiedBy: 'arsam.net',
    phone: '0 (216) 348 22 11',
    variant: 'panel',
    onMessage: fn(),
    onViewListings: fn(),
  },
  argTypes: {
    name: { control: 'text' },
    logoSrc: { control: 'text' },
    tagline: { control: 'text' },
    verified: { control: 'boolean' },
    verifiedBy: { control: 'text' },
    phone: { control: 'text' },
    variant: { control: 'select', options: ['panel', 'inline'] },
    stats: { control: 'object' },
  },
  decorators: [
    (Story, ctx) => (
      <div style={{ width: ctx.args.variant === 'inline' ? 'min(680px, 92vw)' : 'min(340px, 90vw)', margin: '32px auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassAgencyCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    name: 'Marmara Gayrimenkul Danışmanlık',
    tagline: 'Kadıköy · Ataşehir · Maltepe',
    stats: [
      { label: 'Aktif İlan', value: '31' },
      { label: 'Danışman', value: '7' },
      { label: 'Deneyim', value: '9 yıl' },
    ],
  },
}

/** İki yerleşim varyantı: `panel` (ilan detay yan kolonu, dikey) ve `inline` (liste içi, yatay şerit). */
export const Variants: Story = {
  name: 'Varyantlar',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ maxWidth: 340 }}>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;panel&quot; — ilan detay yan kolonu</p>
        <GlassAgencyCard {...args} variant="panel" />
      </div>
      <div style={{ maxWidth: 680 }}>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;inline&quot; — liste/ofis dizini içi şerit</p>
        <GlassAgencyCard {...args} variant="inline" />
      </div>
    </div>
  ),
}

/** Logo verilince GlassAvatar img render eder; verilmezse kurum adından baş harf fallback'i çıkar. */
export const WithLogo: Story = {
  name: 'Logolu',
  args: { logoSrc: kayaLogo },
}

/**
 * Durum matrisi: minimal, yalnız telefon, kaynaksız doğrulama işareti ve
 * doğrulama kaynağı tooltip'i — her prop render'ı bağımsız kontrol eder.
 */
export const States: Story = {
  name: 'Durumlar',
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', maxWidth: 1080 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Minimal — aksiyonsuz, doğrulanmamış</p>
        <GlassAgencyCard name="Yıldız Gayrimenkul" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Yalnız telefon + ilan linki (mesaj yok)</p>
        <GlassAgencyCard
          name="Deniz Emlak Ofisi"
          tagline="Bakırköy · Bahçelievler"
          stats={[{ label: 'Aktif İlan', value: '19' }]}
          phone="0 (212) 560 44 12"
          onViewListings={fn()}
        />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Yalnız mesaj (telefon/ilan linki yok)</p>
        <GlassAgencyCard name="Panorama Gayrimenkul" verified onMessage={fn()} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Doğrulama kaynağı — bilgi ikonu hover/focus tooltip'i</p>
        <GlassAgencyCard
          name="Başkent Arazi"
          tagline="Ankara tarla ve yatırım arazileri"
          verified
          verifiedBy="arsam.net"
        />
      </div>
    </div>
  ),
}

/**
 * Uzun içerik: uzun kurumsal isim + tagline sarar (truncation yok), stat etiketleri
 * `white-space: nowrap` ile satır içi kırılmadan kalır.
 */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    name: 'Kaya Otomotiv ve Gayrimenkul Yatırım Danışmanlığı Sanayi Ticaret Limited Şirketi',
    tagline: 'İstanbul Anadolu Yakası · Kadıköy, Ataşehir, Maltepe, Kartal, Pendik bölgeleri yetkili kurumsal bayi',
    stats: [
      { label: 'Aktif İlan', value: '134' },
      { label: 'Danışman', value: '26' },
      { label: 'Ortalama Yanıt Süresi', value: '18 dk' },
    ],
  },
}

/** Dar konteyner: `inline` varyant container genişliğine göre iki satıra, sonra tek kolona düşer. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { variant: 'inline' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 360, margin: '16px auto' }}>
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
          'Kök `<section>` düz metin akışıdır — özel bir ARIA rolü üstlenmez. Logo dekoratiftir ' +
          '(`alt=""`); kurum adı zaten görünür metin olarak yanında yer aldığından tekrar okutulmaz. ' +
          'Kompakt doğrulama işareti "Doğrulanmış kurumsal ofis" accessible adına sahiptir. ' +
          '`verifiedBy` verildiğinde bilgi düğmesi doğrulayan kurumu `GlassTooltip` ile hover/focus\'ta açıklar; ' +
          'düğmenin accessible adı ve `title` metni aynı açıklamayı taşır. ' +
          'İstatistikler `<dl>` ile etiket/değer ilişkisi kurar. Telefon gerçek bir `tel:` linkidir ' +
          '(Enter ile native aktivasyon, orta tık/kopyala çalışır); "N ilanı görüntüle" ve "Mesaj Gönder" ' +
          'gerçek `<button>` — ikisi de `:focus-visible`\'da `--lg-accent` halkası alır, dokunmatikte ' +
          '"N ilanı görüntüle" 44px hedefine büyür.',
      },
    },
  },
}
