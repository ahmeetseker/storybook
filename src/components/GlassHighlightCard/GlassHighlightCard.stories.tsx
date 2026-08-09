import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassHighlightCard } from './GlassHighlightCard'

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassHighlightCard',
  component: GlassHighlightCard,
  tags: ['autodocs'],
  args: {
    title: 'Ege Arsa Ofisi',
    description: 'İzmir ve çevresinde imarlı arsa uzmanı',
    metrics: [
      { label: 'Aktif İlan', value: '48' },
      { label: 'Uzmanlık', value: '12 bölge' },
    ],
    actionLabel: '0 (232) 456 78 90',
    actionHref: 'tel:02324567890',
    iconLabel: 'Doğrulanmış kurumsal ofis',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    actionLabel: { control: 'text' },
    actionHref: { control: 'text' },
    iconLabel: { control: 'text' },
    tint: { control: 'color' },
    icon: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '28rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassHighlightCard>

export default meta
type Story = StoryObj<typeof meta>

/** Temel sözleşme: başlık + açıklama + iki metrik + tel: aksiyonu. */
export const Default: Story = {}

/** Yalnız public API — hover/focus kontrol değildir. */
export const Playground: Story = {}

/** Görünüm ekseni tek: `tint`. Gradyan, rozet ve aksiyon aynı bazdan türer. */
export const Tintler: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--lg-space-4)' }}>
      <GlassHighlightCard {...args} />
      <GlassHighlightCard {...args} title="Güney Sahil Gayrimenkul" tint="#3a7a8a" />
      <GlassHighlightCard {...args} title="Başkent Arazi" tint="#8a6f3a" />
    </div>
  ),
}

/** Ana sayfa kullanım örneği: doğrulanmış ofis vitrini, üçlü ızgara. */
export const DogrulanmisOfisler: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--lg-space-6)' }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(20rem, 100%), 1fr))',
        gap: 'var(--lg-space-4)',
      }}
    >
      <GlassHighlightCard
        title="Ege Arsa Ofisi"
        description="İzmir ve çevresinde imarlı arsa uzmanı"
        metrics={[
          { label: 'Aktif İlan', value: '48' },
          { label: 'Uzmanlık', value: '12 bölge' },
        ]}
        actionLabel="0 (232) 456 78 90"
        actionHref="tel:02324567890"
        iconLabel="Doğrulanmış kurumsal ofis"
        tint="#b45309"
        href="#ofisler"
      />
      <GlassHighlightCard
        title="Güney Sahil Gayrimenkul"
        description="Antalya ve Muğla sahil hattı"
        metrics={[
          { label: 'Aktif İlan', value: '31' },
          { label: 'Danışman', value: '7' },
        ]}
        actionLabel="0 (242) 312 44 08"
        actionHref="tel:02423124408"
        iconLabel="Doğrulanmış kurumsal ofis"
        tint="#3a7a8a"
        href="#ofisler"
      />
      <GlassHighlightCard
        title="Başkent Arazi"
        description="Ankara tarla ve yatırım arazileri"
        metrics={[
          { label: 'Aktif İlan', value: '26' },
          { label: 'Deneyim', value: '11 yıl' },
        ]}
        actionLabel="0 (312) 418 27 16"
        actionHref="tel:03124182716"
        iconLabel="Doğrulanmış kurumsal ofis"
        tint="#8a6f3a"
        href="#ofisler"
      />
    </div>
  ),
}

/** Uzun başlık/açıklama sarar, metrik değerleri taşmaz; TR uzun kelime testi. */
export const UzunIcerik: Story = {
  args: {
    title:
      'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine Gayrimenkul Danışmanlık',
    description:
      'Ege ve Akdeniz kıyı bandında imarlı arsa, tarla, zeytinlik ve yatırım amaçlı arazi alım satımında yirmi yılı aşkın deneyimiyle bölgesinin en kapsamlı portföyünü yönetir.',
    metrics: [
      { label: 'Aktif İlan Sayısı Toplamı', value: '1.248' },
      { label: 'Uzmanlaşılan Bölge', value: '24 ilçe' },
    ],
    actionLabel: 'Tüm portföyü görüntüle',
    actionHref: undefined,
    onAction: () => {},
  },
}

/** Dar container: alt satır sarar, aksiyon metrilerin altına düşer. */
export const Responsive: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '17rem' }}>
        <Story />
      </div>
    ),
  ],
}

/** Focus halkası kontrast renkte çizilir; rozet yalnız `iconLabel` ile adlandırılır. */
export const Erisilebilirlik: Story = {
  args: {
    actionLabel: 'Tümünü gör',
    actionHref: undefined,
    onAction: () => {},
  },
}
