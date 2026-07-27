import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassAiEvidenceList } from './GlassAiEvidenceList'

const meta = {
  title: 'Bileşenler/AI/GlassAiEvidenceList',
  component: GlassAiEvidenceList,
  tags: ['autodocs'],
  args: {
    title: 'Kaynaklar',
    evidence: [
      { id: 'tapu', title: 'Tapu kaydı — 34/1284', sourceType: 'official', verified: true, relevance: 96, excerpt: '1.284 m² arsa, imar durumu konut.', href: '#' },
      { id: 'ilan', title: 'İlan metni beyanı', sourceType: 'listing', verified: false, relevance: 62, excerpt: 'Satıcı beyanı — bağımsız doğrulanmadı.' },
      { id: 'emsal', title: 'Bölge emsal analizi (son 6 ay)', sourceType: 'market', verified: true, relevance: 84, excerpt: '12 karşılaştırılabilir satış.' },
    ],
  },
  argTypes: {
    title: { control: 'text' },
    compact: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassAiEvidenceList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Doğrulanmış ve doğrulanmamış kaynaklar bir arada — durum metinle ayrışır. */
export const KarisikDogrulama: Story = {
  name: 'Karışık Doğrulama',
  args: {
    evidence: [
      { id: '1', title: 'TKGM tapu sorgusu', sourceType: 'official', verified: true, relevance: 98, href: '#' },
      { id: '2', title: 'Kullanıcı yorumu', sourceType: 'user', verified: false, relevance: 40 },
      { id: '3', title: 'Ekspertiz raporu.pdf', sourceType: 'document', verified: true, relevance: 90, href: '#' },
    ],
  },
}

/** Boş liste: otomatik eylem yok, "önce doğrulayın" güvenli mesajı (role="note"). */
export const BosDurum: Story = {
  name: 'Boş Durum',
  args: { evidence: [] },
}

/** Link + callback + statik kaynaklar bir arada. */
export const InteraktifVeStatik: Story = {
  name: 'İnteraktif ve Statik',
  args: {
    evidence: [
      { id: 'a', title: 'Dış bağlantılı kaynak', sourceType: 'official', verified: true, relevance: 88, href: 'https://ornek' },
      { id: 'b', title: 'Uygulama içi açılan kaynak', sourceType: 'market', verified: true, relevance: 77, onOpen: () => {} },
      { id: 'c', title: 'Statik dayanak (tıklanamaz)', sourceType: 'listing', verified: false },
    ],
  },
}

/** Kompakt: alıntılar gizlenir, yoğun listelerde sığar. */
export const Kompakt: Story = { args: { compact: true } }

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    evidence: [
      {
        id: 'x',
        title: 'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizden bir kaynak başlığı',
        sourceType: 'document',
        verified: false,
        relevance: 55,
        excerpt: 'Çok uzun bir alıntı metni ile taşma ve sarma davranışı sınanır; kelime kırma çalışmalı.',
      },
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

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  parameters: {
    docs: {
      description: {
        story:
          'Kök `<section aria-labelledby>` adlandırılır; kaynaklar numaralı `<ol>` içinde. Doğrulama ' +
          'durumu ("Doğrulandı" / "Doğrulanmalı") ve ilgi oranı renk dışında metinle iletilir. `href` ' +
          'verilen kaynak gerçek `<a>`, yalnız `onOpen` verilen `<button>`, ikisi de yoksa tıklanamaz — ' +
          'false affordance üretilmez. Boş listede `role="note"` güvenli mesaj gösterilir (alert değil); ' +
          'AI çıktısı asla otomatik bir eylem tetiklemez.',
      },
    },
  },
}
