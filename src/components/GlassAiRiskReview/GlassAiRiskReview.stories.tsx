import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassAiRiskReview } from './GlassAiRiskReview'
import type { GlassAiRiskItem } from './GlassAiRiskReview'

const sample: GlassAiRiskItem[] = [
  { id: 'r1', title: 'Tapu ile ilan alanı uyuşmuyor', severity: 'high', status: 'open', description: 'İlan 140 m² beyan ediyor; tapu kaydı 120 m².', evidenceLabel: '2 dayanak' },
  { id: 'r2', title: 'Fotoğraf metaverisi eksik', severity: 'low', status: 'open', description: 'Yükleme kaynağı doğrulanamadı.' },
  { id: 'r3', title: 'Fiyat bölge emsalinin %38 altında', severity: 'medium', status: 'resolved', description: 'Satıcı gerekçe sundu; kabul edildi.', evidenceLabel: '5 emsal' },
]

const meta = {
  title: 'Components/GlassAiRiskReview',
  component: GlassAiRiskReview,
  tags: ['autodocs'],
  args: {
    items: sample,
    title: 'AI risk incelemesi',
    decision: 'pending',
  },
  argTypes: {
    decision: { control: 'inline-radio', options: ['pending', 'approved', 'rejected'] },
    title: { control: 'text' },
    reviewer: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassAiRiskReview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { onApprove: () => {}, onReject: () => {}, onItemToggle: () => {} },
}

/** Açık yüksek risk → onay kilitli; neden görünür metinle açıklanır. */
export const AgirRiskKilidi: Story = {
  name: 'Ağır Risk Kilidi',
  args: { onApprove: () => {}, onReject: () => {} },
}

/** Yalnız hafif/çözülmüş riskler → onay serbest. */
export const OnaylanabilirDurum: Story = {
  name: 'Onaylanabilir Durum',
  args: {
    items: [
      { id: 'a', title: 'Küçük yazım tutarsızlığı', severity: 'low', status: 'open' },
      { id: 'b', title: 'Fiyat notu', severity: 'medium', status: 'resolved' },
    ],
    onApprove: () => {},
    onReject: () => {},
  },
}

/** Karar verilmiş — aksiyon yerine özet + reviewer. */
export const Onaylanmis: Story = {
  name: 'Onaylanmış',
  args: { decision: 'approved', reviewer: 'Ayşe K.', onApprove: () => {}, onReject: () => {} },
}

export const Reddedilmis: Story = {
  name: 'Reddedilmiş',
  args: { decision: 'rejected', reviewer: 'Mehmet T.', onApprove: () => {}, onReject: () => {} },
}

/** Risk yok — güvenli boş durum. */
export const BosListe: Story = {
  name: 'Boş Liste',
  args: { items: [], onApprove: () => {}, onReject: () => {} },
}

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { onApprove: () => {}, onReject: () => {} },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { onApprove: () => {}, onReject: () => {} },
  parameters: {
    docs: {
      description: {
        story:
          'Kök `<section aria-labelledby>` adlandırılır; koşulsuz `✦ AI` rozeti taşır. Önem derecesi ' +
          '("Düşük/Orta/Yüksek/Engelleyici") ve durum ("Açık/Çözüldü/Kabul edildi") renk dışında metinle ' +
          'iletilir. Açık "Yüksek" veya "Engelleyici" risk varken onay butonu `disabled` olur ve nedeni ' +
          '`role="status"` bir not + `aria-describedby` ile açıklanır — ağır riskler görmezden gelinerek ' +
          'onaylanamaz. Karar verildiğinde aksiyonlar yerine `role="status"` karar özeti gösterilir. ' +
          'Onay/red butonları yalnız callback verilince çizilir (false affordance yok).',
      },
    },
  },
}
