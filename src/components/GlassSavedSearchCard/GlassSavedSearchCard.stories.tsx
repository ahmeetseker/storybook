import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSavedSearchCard } from './GlassSavedSearchCard'

const criteria = ['İzmir · Urla', '3+1', 'Bahçeli', '5–8 milyon ₺']

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassSavedSearchCard',
  component: GlassSavedSearchCard,
  tags: ['autodocs'],
  args: {
    title: 'Urla deniz manzaralı bahçeli',
    criteria,
    newResultCount: 4,
    lastRunLabel: '2 saat önce',
    frequencyLabel: 'Günlük',
    defaultAlertsEnabled: true,
    onOpen: () => {},
    onEdit: () => {},
    onDelete: () => {},
    onAlertsChange: () => {},
  },
  argTypes: {
    headingAs: { control: 'inline-radio', options: ['h2', 'h3', 'h4'] },
    newResultCount: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassSavedSearchCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Yeni eşleşme yok — rozet gizli. */
export const YeniSonucYok: Story = {
  name: 'Yeni Sonuç Yok',
  args: { newResultCount: 0 },
}

/** Alarm kapalı başlar (uncontrolled). */
export const AlarmKapali: Story = {
  name: 'Alarm Kapalı',
  args: { defaultAlertsEnabled: false },
}

/** Salt görüntüleme — hiçbir callback yok, aksiyon butonu ve switch çizilmez. */
export const SaltOkunur: Story = {
  name: 'Salt Okunur',
  args: {
    onOpen: undefined,
    onEdit: undefined,
    onDelete: undefined,
    onAlertsChange: undefined,
    defaultAlertsEnabled: undefined,
    newResultCount: 0,
  },
}

export const UzunKriterListesi: Story = {
  name: 'Uzun Kriter Listesi',
  args: {
    criteria: [
      'İstanbul · Kadıköy · Moda',
      '2+1 veya 3+1',
      'Asansörlü',
      'Otoparklı',
      'Site içinde',
      'Eşyalı',
      '8–15 milyon ₺',
      'Krediye uygun',
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  parameters: {
    docs: {
      description: {
        story:
          'Kök `<article>` — kart tümüyle bir button DEĞİL (GlassListingCard\'ın aksine); başlık gerçek bir ' +
          'heading (`headingAs`). Alarm anahtarı `role="switch"` controlled/uncontrolled deseni izler. Silme ' +
          'butonu bağlama duyarlı ad taşır ("{başlık} aramasını sil"). Callback verilmeyen aksiyonlar için ' +
          'buton çizilmez (false affordance yok). Yeni sonuç rozeti sr-only "eşleşme" bağlamı içerir.',
      },
    },
  },
}
