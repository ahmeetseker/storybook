import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexButton } from '../controls'
import { CodexClimateRiskPanel, CodexTrustPanel } from './CodexMarketplace'
import styles from './CodexMarketplace.stories.module.css'

const meta = {
  title: 'Codex Enterprise/08 AI ve Güven/02 Doğrulama ve Risk',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <div className={styles.page}><header className={styles.header}><h1>{title}</h1><p>{description}</p></header>{children}</div>
}

const trustSignals = [
  { id: 'identity', label: 'İlan sahibi kimliği', description: 'T.C. kimlik ve hesap bilgisi EİDS üzerinden eşleşti.', status: 'verified' as const, source: 'EİDS', updatedAt: '18 Temmuz 2026, 09:28' },
  { id: 'authority', label: 'Yetki doğrulaması', description: 'Taşınmaz sahibi ilan verme yetkisini bu hesapla eşleştirdi.', status: 'verified' as const, source: 'EİDS', updatedAt: '18 Temmuz 2026, 09:29' },
  { id: 'deed', label: 'Ada ve parsel kaydı', description: 'İlanda verilen 118 ada / 24 parsel kaydı resmi verilerle uyumlu.', status: 'verified' as const, source: 'TKGM Parsel Sorgu', updatedAt: '17 Temmuz 2026' },
  { id: 'zoning', label: 'İmar belgesi güncelliği', description: 'Yüklenen belge 14 aylık. Belediyeden güncel nüsha istendi.', status: 'pending' as const, source: 'Urla Belediyesi', updatedAt: 'İstek gönderildi' },
  { id: 'photo', label: 'Fotoğraf-konum tutarlılığı', description: 'İki görseldeki yol cephesi ilan açıklamasıyla tam eşleşmiyor.', status: 'warning' as const, source: 'Görsel inceleme modeli', updatedAt: '18 Temmuz 2026' },
]

export const FullTrustReview: Story = {
  render: () => (
    <Page title="Doğrulama zinciri" description="Her sinyal kendi kaynağını, tarihini ve insan müdahalesi gereken noktayı gösterir.">
      <CodexTrustPanel score={84} signals={trustSignals.map((signal) => signal.id === 'photo' ? { ...signal, action: <CodexButton size="sm" variant="secondary">Görselleri incele</CodexButton> } : signal)} />
    </Page>
  ),
}

export const CompactTrustSummary: Story = {
  render: () => <Page title="Kompakt güven özeti" description="Liste/kart bağlamında yalnız karar için gereken durumlar kalır."><CodexTrustPanel score={84} compact signals={trustSignals} /></Page>,
}

export const ClimateAndDisasterRisk: Story = {
  render: () => (
    <Page title="İklim ve afet riskleri" description="Bölgesel veri kesin parsel raporu gibi sunulmaz; kaynak ve metodoloji sınırı görünürdür.">
      <CodexClimateRiskPanel
        location="İzmir · Urla · Kalabak"
        updatedAt="2026 Q2 veri kesiti"
        hazards={[
          { id: 'earthquake', label: 'Deprem tehlikesi', level: 'high', summary: 'Bölgesel ivme sınıfı yüksek. Zemin etüdü parsel bazında ayrıca incelenmeli.', source: 'AFAD Türkiye Deprem Tehlike Haritası' },
          { id: 'fire', label: 'Orman yangını', level: 'moderate', summary: 'Parsel, orman sınırına 2,7 km mesafede ve orta duyarlılık bandında.', source: 'OGM yangın duyarlılık verisi' },
          { id: 'flood', label: 'Taşkın', level: 'low', summary: 'Tespit edilen dere yatağı ve model taşkın alanı dışında.', source: 'DSİ bölgesel taşkın katmanı' },
          { id: 'heat', label: 'Aşırı sıcak', level: 'moderate', summary: '2050 projeksiyonunda yılda 18–26 aşırı sıcak gün öngörülüyor.', source: 'Meteoroloji iklim projeksiyonu' },
        ]}
        onOpenMethod={() => undefined}
      />
    </Page>
  ),
}

export const MobileRisk: Story = {
  ...ClimateAndDisasterRisk,
  globals: { viewport: 'mobile1' },
}
