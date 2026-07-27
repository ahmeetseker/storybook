import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassTrustSignalPanel, type GlassTrustSignal } from './GlassTrustSignalPanel'

const ilanSinyalleri: GlassTrustSignal[] = [
  {
    id: 'eids',
    label: 'EİDS tapu eşleşmesi',
    status: 'verified',
    detail: '12 Temmuz 2026, kayıt 2841937465',
  },
  {
    id: 'tapu',
    label: 'Tapu kaydı',
    status: 'verified',
    detail: 'Tapu Müdürlüğü sorgusu ilan sahibiyle birebir eşleşti',
  },
  {
    id: 'moderasyon',
    label: 'AI içerik moderasyonu',
    status: 'warning',
    detail: 'İlan görsellerinden birinde okunaklı plaka tespit edildi, bulanıklaştırma önerildi',
    aiGenerated: true,
    confidence: 91,
  },
  {
    id: 'satici-gecmisi',
    label: 'Satıcı geçmişi',
    status: 'info',
    detail: '3 yıldır ArsaPazar üyesi, 18 tamamlanmış işlem, şikayet kaydı yok',
  },
]

const sorunluIlanSinyalleri: GlassTrustSignal[] = [
  { id: 'eids', label: 'EİDS tapu eşleşmesi', status: 'verified', detail: '9 Temmuz 2026, kayıt 2841911002' },
  {
    id: 'kimlik',
    label: 'Satıcı kimlik doğrulama',
    status: 'failed',
    detail: 'Yüklenen kimlik belgesi ile ilan sahibi bilgileri eşleşmedi',
  },
  {
    id: 'moderasyon',
    label: 'AI içerik moderasyonu',
    status: 'failed',
    detail: 'İlan açıklamasında başka bir platforma yönlendiren iletişim bilgisi tespit edildi',
    aiGenerated: true,
    confidence: 76,
  },
  { id: 'fiyat', label: 'Fiyat tutarlılığı', status: 'warning', detail: 'Bölge ortalamasının %38 altında — kontrol önerilir' },
  { id: 'satici-gecmisi', label: 'Satıcı geçmişi', status: 'info', detail: '2 haftalık yeni üye, ilk ilanı' },
]

const meta = {
  title: 'Bileşenler/AI/GlassTrustSignalPanel',
  component: GlassTrustSignalPanel,
  tags: ['autodocs'],
  args: {
    signals: ilanSinyalleri,
    title: 'Güven Kontrolleri',
    variant: 'panel',
  },
  argTypes: {
    variant: { control: 'select', options: ['panel', 'compact'] },
    title: { control: 'text' },
    loading: { control: 'boolean' },
    signals: { control: false },
    onFeedback: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(480px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassTrustSignalPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: {
    onFeedback: (signalId: string, value: 'up' | 'down') => console.log('feedback', signalId, value),
  },
}

/** İki görsel yoğunluk yan yana — panel tam satır listesi, compact yalnız özet + ikon dizisi (kart içi özet rozeti). */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;panel&quot; — ikon + etiket + detay satır listesi</p>
        <GlassTrustSignalPanel signals={ilanSinyalleri} variant="panel" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;compact&quot; — yalnız özet satırı + ikon dizisi</p>
        <GlassTrustSignalPanel signals={ilanSinyalleri} variant="compact" />
      </div>
    </div>
  ),
}

/** Dördü de görünür durum: doğrulandı/uyarı/başarısız/bilgi — hiçbiri yalnız renkle taşınmaz, her satırda ikon + metin birlikte. */
export const DurumEsleri: Story = {
  name: 'Durum Örnekleri',
  args: {
    title: 'Tüm Durumlar',
    signals: [
      { id: 's1', label: 'EİDS tapu eşleşmesi', status: 'verified', detail: '12 Temmuz 2026, kayıt 2841937465' },
      { id: 's2', label: 'Fiyat tutarlılığı', status: 'warning', detail: 'Bölge ortalamasının %20 altında' },
      { id: 's3', label: 'Kimlik doğrulama', status: 'failed', detail: 'Belge okunamadı, yeniden yükleme gerekiyor' },
      { id: 's4', label: 'Satıcı geçmişi', status: 'info', detail: '3 yıldır ArsaPazar üyesi' },
    ],
  },
}

/** Başarısız/uyarı ağırlıklı bir ilan — başlıkta "N kontrol başarısız" uyarı metni --lg-danger vurgulu görünür. */
export const SorunluIlan: Story = {
  name: 'Sorunlu İlan',
  args: {
    title: 'Güven Kontrolleri',
    signals: sorunluIlanSinyalleri,
  },
}

/** AI moderasyon geri bildirimi — her aiGenerated satırda 👍/👎, tıklanan yön aria-pressed ile görsel seçili işaretlenir. */
export const AiGeriBildirimi: Story = {
  name: 'AI Geri Bildirimi',
  render: () => {
    function Demo() {
      const [log, setLog] = useState<string | null>(null)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <GlassTrustSignalPanel
            signals={ilanSinyalleri}
            onFeedback={(signalId, value) => setLog(`${signalId} → ${value === 'up' ? 'faydalı' : 'faydalı değil'}`)}
          />
          <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>{log ?? 'Henüz geri bildirim verilmedi.'}</p>
        </div>
      )
    }
    return <Demo />
  },
}

/** AI-first yükleme sözleşmesi: parıltısız soluk placeholder, gerçek içerik ve özet gizli, section aria-busy taşır. */
export const Yukleniyor: Story = {
  name: 'Yükleniyor',
  args: { loading: true },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    title: 'İlan Güven Değerlendirmesi — Kapsamlı Doğrulama Raporu',
    signals: [
      {
        id: 'eids',
        label: 'EİDS tapu eşleşmesi ve mülkiyet zinciri doğrulaması',
        status: 'verified',
        detail:
          'Elektronik İlan Doğrulama Sistemi kaydı, tapu müdürlüğü mülkiyet bilgileriyle 12 Temmuz 2026 tarihinde birebir eşleşti — kayıt numarası 2841937465, önceki mülkiyet zincirinde uyuşmazlık tespit edilmedi.',
      },
      {
        id: 'moderasyon',
        label: 'Yapay zekâ destekli içerik moderasyonu değerlendirmesi',
        status: 'warning',
        detail:
          'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine uzun bir açıklama metninde tekrarlayan iletişim bilgisi kalıpları tespit edildi; insan incelemesi bekleniyor.',
        aiGenerated: true,
        confidence: 64,
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

/** Dar konteyner + dokunmatik bağlam: satırlar sarar, geri bildirim düğmeleri 44px hedefe büyür. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    onFeedback: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: 16 }}>
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
          'Sinyal listesi `role="list"` + her sinyal `<li>` (native `listitem`) taşır. Durum hiçbir zaman ' +
          'yalnız renkle verilmez — her satırın ikonu `role="img"` + sabit `aria-label` ("Doğrulandı"/"Uyarı"/' +
          '"Başarısız"/"Bilgi") taşır ve etiket/detay metni ayrıca görünür render edilir. `aiGenerated` ' +
          'sinyallerde AI-first sözleşmesi uygulanır: "✦ AI" rozeti koşulsuz `aria-label="Yapay zekâ üretimi"` ' +
          'taşır, `confidence` verilirse "%N güven" metni rozetin yanında görünür etikettir (yalnız renkle ' +
          'değil), `onFeedback` verilirse 👍/👎 düğmeleri `aria-pressed` ile seçili durumunu duyurur ve hiçbir ' +
          'geri bildirim otomatik bir eylem tetiklemez — yalnız çağırana bilgi iletir. `loading` durumunda ' +
          'section `aria-busy="true"` taşır, gerçek içerik yerine dekoratif (`aria-hidden`) parıltısız bir ' +
          'placeholder render edilir.',
      },
    },
  },
}
