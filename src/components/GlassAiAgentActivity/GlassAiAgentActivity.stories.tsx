import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassAiAgentActivity } from './GlassAiAgentActivity'
import type { GlassAgentActivityEntry } from './GlassAiAgentActivity'

const mixed: GlassAgentActivityEntry[] = [
  { id: 'e1', title: 'İlan verileri tarandı', status: 'done', toolLabel: 'search', timeLabel: '10:02' },
  { id: 'e2', title: 'Bölge emsalleri çekiliyor', status: 'running', toolLabel: 'market.compare', timeLabel: '10:03' },
  { id: 'e3', title: 'Satıcıya mesaj gönderilecek', status: 'needsApproval', detail: 'Taslak hazır — göndermeden önce onayınız gerekiyor.', technical: 'POST /messages { listingId, body }' },
  { id: 'e4', title: 'Sıradaki: fiyat önerisi', status: 'queued' },
]

const meta = {
  title: 'Bileşenler/AI/GlassAiAgentActivity',
  component: GlassAiAgentActivity,
  tags: ['autodocs'],
  args: {
    entries: mixed,
    title: 'AI ajan etkinliği',
  },
  argTypes: {
    title: { control: 'text' },
    permissionNote: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassAiAgentActivity>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { onApprove: () => {}, onReject: () => {}, onStop: () => {} },
}

/** İzin bekleyen adım — kullanıcı onayı olmadan ajan ilerlemez. */
export const IzinBekliyor: Story = {
  name: 'İzin Bekliyor',
  args: {
    entries: [
      { id: 'a', title: 'İlan otomatik yayınlanacak', status: 'needsApproval', detail: 'Yüksek etkili işlem — onay gerekiyor.', technical: 'POST /listings/publish' },
    ],
    onApprove: () => {},
    onReject: () => {},
  },
}

/** Hepsi tamamlanmış — durdur butonu görünmez. */
export const HepsiTamam: Story = {
  name: 'Hepsi Tamamlandı',
  args: {
    entries: [
      { id: 'a', title: 'Tarama', status: 'done', timeLabel: '09:58' },
      { id: 'b', title: 'Analiz', status: 'done', timeLabel: '10:00' },
      { id: 'c', title: 'Özet üretildi', status: 'done', timeLabel: '10:01' },
    ],
    onStop: () => {},
  },
}

/** Hata durumu. */
export const HataDurumu: Story = {
  name: 'Hata Durumu',
  args: {
    entries: [
      { id: 'a', title: 'Tarama', status: 'done' },
      { id: 'b', title: 'Emsal servisi yanıt vermedi', status: 'error', detail: 'Zaman aşımı — yeniden denenebilir.', technical: 'ETIMEDOUT market.compare' },
    ],
  },
}

/** Boş akış. */
export const BosAkis: Story = { name: 'Boş Akış', args: { entries: [] } }

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { onApprove: () => {}, onReject: () => {}, onStop: () => {} },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { onApprove: () => {}, onReject: () => {}, onStop: () => {} },
  parameters: {
    docs: {
      description: {
        story:
          'Akış `role="log"` + `aria-live="polite"` — yeni işlemler ekran okuyuculara duyurulur. Durum ' +
          '("Sırada/Çalışıyor/Tamamlandı/İzin bekliyor/Reddedildi/Hata") renk dışında metinle iletilir. ' +
          'Yüksek etkili adımlar (`needsApproval`) "İzin ver"/"Reddet" kapısı sunar; butonlar yalnız ilgili ' +
          'callback verilince çizilir. Kalıcı yetki notu, ajanın izinsiz eylem yapmayacağını belirtir. ' +
          '`running` nabız animasyonu yalnız transform/opacity kullanır ve `prefers-reduced-motion`\'da kapanır.',
      },
    },
  },
}
