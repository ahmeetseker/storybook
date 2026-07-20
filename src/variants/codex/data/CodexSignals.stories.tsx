import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexMiniChart, CodexMetricStrip, CodexScoreMeter } from './CodexData'
import styles from './CodexData.stories.module.css'

const meta = {
  title: 'Codex Enterprise/06 Veri ve Karşılaştırma/02 Sinyaller ve Grafik',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const pricePoints = [
  { label: 'Oca 2026', value: 7140 },
  { label: 'Şub 2026', value: 7280 },
  { label: 'Mar 2026', value: 7460, annotation: 'İmar planı duyurusu' },
  { label: 'Nis 2026', value: 7510 },
  { label: 'May 2026', value: 7690 },
  { label: 'Haz 2026', value: 7815 },
  { label: 'Tem 2026', value: 7840 },
]

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <div className={styles.page}><header className={styles.header}><h1>{title}</h1><p>{description}</p></header>{children}</div>
}

export const PriceTrend: Story = {
  render: () => (
    <Page title="Bölge fiyat sinyali" description="Grafik, görsel çizgiye ek olarak ekran okuyucular için gerçek bir veri tablosu taşır.">
      <CodexMiniChart
        title="Urla konut imarlı arsa · m² fiyatı"
        description="Ocak–Temmuz 2026, doğrulanmış 184 ilan medyanı"
        points={pricePoints}
        valueFormatter={(value) => `${value.toLocaleString('tr-TR')} TL`}
        trend="up"
      />
    </Page>
  ),
}

export const NoChartData: Story = {
  render: () => (
    <Page title="Yetersiz veri" description="Grafik boşken sıfırmış gibi yanlış bir çizgi üretmez.">
      <CodexMiniChart title="Yeni mahalle fiyat hareketi" description="Karşılaştırılabilir satış verisi aranıyor" points={[]} />
    </Page>
  ),
}

export const ScoreMatrix: Story = {
  render: () => (
    <Page title="Skor ve güven aralıkları" description="Renk her zaman açık etiket, değer ve açıklama ile desteklenir.">
      <div className={styles.storyGrid}>
        <section className={styles.panel}><div className={styles.scoreStack}>
          <CodexScoreMeter label="İlan kalitesi" value={92} tone="success" description="Fotoğraf, açıklama ve resmi kayıtlar eksiksiz." />
          <CodexScoreMeter label="Fiyat uyumu" value={74} tone="accent" description="Bölge medyanının %6,1 üzerinde." />
          <CodexScoreMeter label="Belge güveni" value={58} tone="warning" description="İmar belgesinin güncel nüshası bekleniyor." />
          <CodexScoreMeter label="Risk incelemesi" value={23} tone="danger" description="Düşük puan daha düşük risk anlamına gelir." />
        </div></section>
        <section className={styles.panel}><div className={styles.scoreStack}>
          <CodexScoreMeter label="Konum eşleşmesi" value={88} tone="success" />
          <CodexScoreMeter label="Bütçe eşleşmesi" value={81} tone="success" />
          <CodexScoreMeter label="İmar eşleşmesi" value={100} tone="accent" />
          <CodexScoreMeter label="Ulaşım eşleşmesi" value={67} tone="warning" />
        </div></section>
      </div>
    </Page>
  ),
}

export const EnterpriseMetrics: Story = {
  render: () => (
    <Page title="Kurumsal portföy göstergeleri" description="Tabular rakamlar, organik veriler ve yönün renk dışı ikinci kanalı birlikte kullanılır.">
      <CodexMetricStrip items={[
        { id: 'live', label: 'Yayındaki ilan', value: '184', change: '%3,4', direction: 'up', help: 'Son 30 güne göre' },
        { id: 'views', label: 'Görüntülenme', value: '48.296', change: '%8,7', direction: 'up', help: '18 Haz–18 Tem' },
        { id: 'lead', label: 'Nitelikli talep', value: '1.246', change: '%2,1', direction: 'down', help: 'Telefon + mesaj' },
        { id: 'response', label: 'Yanıt süresi', value: '18 dk', change: '−6 dk', direction: 'up', help: 'Mesai saatleri medyanı' },
      ]} />
    </Page>
  ),
}
