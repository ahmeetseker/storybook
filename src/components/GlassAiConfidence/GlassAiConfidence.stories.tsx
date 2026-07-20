import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassAiConfidence } from './GlassAiConfidence'

const meta = {
  title: 'Components/GlassAiConfidence',
  component: GlassAiConfidence,
  tags: ['autodocs'],
  args: {
    score: 82,
    label: 'Yanıt güveni',
    size: 'md',
  },
  argTypes: {
    score: { control: { type: 'number', min: 0, max: 100 } },
    label: { control: 'text' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassAiConfidence>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Üç seviye: renk + seviye metni + yüzde birlikte. */
export const Seviyeler: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <GlassAiConfidence score={88} label="Yüksek güven" />
      <GlassAiConfidence score={54} label="Orta güven" />
      <GlassAiConfidence score={22} label="Düşük güven" />
    </div>
  ),
}

/** Skor verilmedi — sessiz gizleme yerine açık "ölçülmedi" uyarısı. */
export const Olculmedi: Story = {
  name: 'Ölçülmedi',
  args: { score: undefined },
}

/** Güveni etkileyen etkenler — yön metinle iletilir. */
export const Etkenli: Story = {
  args: {
    score: 71,
    factors: [
      { id: 'a', label: 'Tapu kaydı doğrulandı', impact: 'positive' },
      { id: 'b', label: 'Bölge emsali güçlü', impact: 'positive' },
      { id: 'c', label: 'İlan fotoğrafları 6 aydan eski', impact: 'negative' },
      { id: 'd', label: 'Satıcı beyanı bağımsız doğrulanmadı', impact: 'neutral' },
    ],
  },
}

/** Kompakt — kart içi dar bağlam. */
export const Kompakt: Story = { args: { size: 'sm', score: 63 } }

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: {
    score: 47,
    factors: [{ id: 'x', label: 'Sınırlı veri', impact: 'negative' }],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Skor `role="meter"` + `aria-valuemin/max/now` + `aria-valuetext` taşır; accessible name görünür ' +
          'etiketten `aria-labelledby` ile gelir. Seviye ("Düşük/Orta/Yüksek") ve etken yönü ("Artırıyor/' +
          'Azaltıyor/Nötr") renk dışında metinle iletilir. Skor verilmezse sessizce gizlenmez; "Ölçülmedi — ' +
          'sonucu doğrulayın" fallback\'i gösterilir. Güvenin doğruluk garantisi olmadığı kalıcı uyarısı her ' +
          'durumda görünür.',
      },
    },
  },
}
