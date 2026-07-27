import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassTabs, type GlassTabItem } from './GlassTabs'

const meta = {
  title: 'Bileşenler/Navigasyon/GlassTabs',
  component: GlassTabs,
  tags: ['autodocs'],
  args: { onTabChange: fn() },
  // hover/focus bilinçli olarak control değildir — CSS state'idir (bkz. rules.md)
} satisfies Meta<typeof GlassTabs>

export default meta
type Story = StoryObj<typeof meta>

const ilanSekmeleri: GlassTabItem[] = [
  {
    id: 'aciklama',
    label: 'Açıklama',
    content: (
      <p style={{ margin: 0 }}>
        Aracımız ilk sahibinden, tüm bakımları yetkili serviste yapılmıştır. Değişen ve
        boyası yoktur. Görmeden karar vermeyin.
      </p>
    ),
  },
  {
    id: 'ozellikler',
    label: 'Özellikler',
    content: <p style={{ margin: 0 }}>Sunroof, geri görüş kamerası, şerit takip asistanı, ısıtmalı koltuk.</p>,
  },
  {
    id: 'konum',
    label: 'Konum',
    content: <p style={{ margin: 0 }}>İstanbul, Kadıköy — Fenerbahçe Mah.</p>,
  },
]

export const Default: Story = {
  args: { tabs: ilanSekmeleri },
  render: (args) => (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <GlassTabs {...args} />
    </div>
  ),
}

export const Controlled: Story = {
  args: { ...Default.args, activeId: 'konum' },
  render: Default.render,
}

/**
 * `material` yalnız içerik paneline uygulanır — sekme çubuğu kontrol katmanıdır
 * ve iki örnekte de cam kalır (bkz. rules.md §1/§5).
 */
export const Materials: Story = {
  args: { tabs: ilanSekmeleri, tone: 'light' },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gap: 28,
        padding: 32,
        borderRadius: 24,
        background: 'linear-gradient(160deg, #8a7968, #b3a292 55%, #cfbfae)',
      }}
    >
      <div>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
          material=&quot;glass&quot; (varsayılan)
        </p>
        <GlassTabs {...args} />
      </div>
      <div>
        <p style={{ margin: '0 0 10px', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
          material=&quot;flat&quot; — panel düz, bar yine cam
        </p>
        <GlassTabs {...args} material="flat" />
      </div>
    </div>
  ),
}

const detaySekmeleri: GlassTabItem[] = [
  {
    id: 'aciklama',
    label: 'Açıklama',
    content: (
      <p style={{ margin: 0 }}>
        2019 model, 68.000 km&apos;de, ilk sahibinden. Tüm bakımları zamanında yetkili serviste
        yapıldı; servis geçmişi ekspertiz raporuyla birlikte sunulur. Şehir içi kullanıldı,
        sigara içilmedi. Takas düşünülmemektedir, ciddi alıcılar görüşme sonrası yerinde
        inceleyebilir.
      </p>
    ),
  },
  {
    id: 'teknik',
    label: 'Teknik Özellikler',
    content: <p style={{ margin: 0 }}>1.5 dizel, 116 HP, 7 ileri çift kavramalı şanzıman, önden çekiş.</p>,
  },
  {
    id: 'hasar',
    label: 'Hasar ve Ekspertiz Raporu',
    content: <p style={{ margin: 0 }}>Değişen yok; sol arka çamurluk lokal boyalı. Tramer kaydı 4.200 TL.</p>,
  },
  {
    id: 'konum',
    label: 'Konum',
    content: <p style={{ margin: 0 }}>Ankara, Çankaya — Birlik Mah.</p>,
  },
  {
    id: 'satici',
    label: 'Satıcı Bilgileri',
    content: <p style={{ margin: 0 }}>Bireysel satıcı; hafta içi 18.00 sonrası, hafta sonu tüm gün ulaşılabilir.</p>,
  },
  {
    id: 'benzer',
    label: 'Benzer İlanlar',
    content: <p style={{ margin: 0 }}>Aynı segmentte, aynı ilçede 12 benzer ilan listelendi.</p>,
  },
]

/**
 * Çok sekme + uzun TR etiketler: etiket tek satırdır ve kırpılmaz; sığmayınca
 * liste yatay kayar (scrollbar gizli). Panel uzun içerikte doğal yükseklik alır.
 */
export const UzunIcerik: Story = {
  args: { tabs: detaySekmeleri },
  render: (args) => (
    <div style={{ maxWidth: 560, margin: '48px auto' }}>
      <GlassTabs {...args} />
    </div>
  ),
}

/** Dar container: bar `max-width: 100%` ile taşmaz, sekme listesi yatay kayar. */
export const DarContainer: Story = {
  args: { tabs: ilanSekmeleri },
  render: (args) => (
    <div style={{ maxWidth: 280, margin: '48px auto' }}>
      <GlassTabs {...args} />
    </div>
  ),
}
