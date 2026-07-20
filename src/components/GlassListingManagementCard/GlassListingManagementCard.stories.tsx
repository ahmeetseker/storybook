import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassListingManagementCard } from './GlassListingManagementCard'
import type { GlassListingState } from './GlassListingManagementCard'

const stats = [
  { id: 'v', label: 'Görüntülenme', value: '1.284' },
  { id: 'm', label: 'Mesaj', value: '37' },
  { id: 'f', label: 'Favori', value: '52' },
]

const ActionButtons = () => (
  <>
    <button
      type="button"
      style={{ minHeight: 40, padding: '0 16px', borderRadius: 'var(--lg-radius-chip)', border: '1px solid var(--lg-hairline)', background: 'transparent', fontWeight: 600 }}
    >
      Düzenle
    </button>
    <button
      type="button"
      style={{ minHeight: 40, padding: '0 16px', borderRadius: 'var(--lg-radius-chip)', border: 'none', background: 'var(--lg-accent)', color: 'var(--lg-accent-contrast)', fontWeight: 600 }}
    >
      Öne çıkar
    </button>
  </>
)

const meta = {
  title: 'Components/GlassListingManagementCard',
  component: GlassListingManagementCard,
  tags: ['autodocs'],
  args: {
    title: 'Urla deniz manzaralı müstakil ev',
    state: 'live',
    referenceLabel: 'İlan #48213 · İzmir · Urla',
    priceLabel: '7.850.000 ₺',
    updatedLabel: '2 gün önce güncellendi',
    imageSrc: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    imageAlt: 'Müstakil ev cephesi',
    stats,
    onOpen: () => {},
  },
  argTypes: {
    state: { control: 'select', options: ['draft', 'review', 'live', 'changes', 'paused', 'expired'] },
    headingAs: { control: 'inline-radio', options: ['h2', 'h3', 'h4'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassListingManagementCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <GlassListingManagementCard {...args} actions={<ActionButtons />} />,
}

/** Altı durum bir arada — renk + metin çift kanal. */
export const TumDurumlar: Story = {
  name: 'Tüm Durumlar',
  render: () => {
    const states: { state: GlassListingState; issue?: string }[] = [
      { state: 'draft' },
      { state: 'review' },
      { state: 'live' },
      { state: 'changes', issue: 'Tapu belgesi yüklenmeli.' },
      { state: 'paused' },
      { state: 'expired', issue: 'Yayın süresi doldu; yenilemek için doping alın.' },
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {states.map(({ state, issue }) => (
          <GlassListingManagementCard
            key={state}
            title={`İlan — ${state}`}
            state={state}
            issue={issue}
            referenceLabel="İlan #48213 · İzmir"
            priceLabel="7.850.000 ₺"
            imageSrc="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200"
            stats={stats}
          />
        ))}
      </div>
    )
  },
}

/** "İşlem gerekli" uyarısı. */
export const IslemGerekli: Story = {
  name: 'İşlem Gerekli',
  args: {
    state: 'changes',
    issue: 'İlan görselleri kural ihlali içeriyor; düzeltip yeniden gönderin.',
  },
  render: (args) => <GlassListingManagementCard {...args} actions={<ActionButtons />} />,
}

/** Görselsiz — temsili medya (role="img"). */
export const GorselsizTemsiliMedya: Story = {
  name: 'Görselsiz Temsili Medya',
  args: { imageSrc: undefined, imageAlt: undefined, state: 'draft' },
}

/** onOpen verilmedi — başlık statik (tıklanamaz). */
export const StatikBaslik: Story = {
  name: 'Statik Başlık',
  args: { onOpen: undefined },
}

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => <GlassListingManagementCard {...args} actions={<ActionButtons />} />,
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  render: (args) => <GlassListingManagementCard {...args} actions={<ActionButtons />} />,
  parameters: {
    docs: {
      description: {
        story:
          'Kök `<article>` — kartın tamamı button DEĞİL (GlassListingCard hatasının aksine); başlık gerçek ' +
          'heading. Durum ("Taslak/İncelemede/Yayında/Değişiklik istendi/Duraklatıldı/Süresi doldu") renk ' +
          'dışında metinle iletilir. "İşlem gerekli" uyarısı `role="status"` taşır. Görsel yoksa temsili ' +
          'medya `role="img"` + etiketle çizilir. Başlık yalnız `onOpen` verildiğinde erişilebilir tetikleyici ' +
          'olur; aksi halde statiktir (false affordance yok). Aksiyonlar `actions` slotunda ayrı kontrollerdir.',
      },
    },
  },
}
