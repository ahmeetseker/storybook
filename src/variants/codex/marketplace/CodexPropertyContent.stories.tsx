import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexBadge, CodexButton } from '../controls'
import {
  CodexFeatureGroup,
  CodexLocationCard,
  CodexPriceHeader,
  CodexValuationCard,
  type CodexValuationFeedback,
} from './CodexMarketplace'
import styles from './CodexMarketplace.stories.module.css'

const meta = {
  title: 'Codex Enterprise/05 İçerik ve Pazar Yeri/01 İlan İçeriği',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <div className={styles.page}><header className={styles.header}><h1>{title}</h1><p>{description}</p></header>{children}</div>
}

function PriceHeaderDemo() {
  const [favorite, setFavorite] = useState(false)
  return (
    <CodexPriceHeader
      title="Denize yakın, iki yola cepheli konut imarlı köşe parsel"
      location="İzmir · Urla · Kalabak"
      referenceId="11842891"
      price="4.250.000 TL"
      unitPrice="8.301 TL/m²"
      previousPrice="4.480.000 TL"
      badges={<><CodexBadge tone="success" dot>EİDS doğrulandı</CodexBadge><CodexBadge tone="accent">Fiyat düştü</CodexBadge><CodexBadge>Konut imarlı</CodexBadge></>}
      favorite={favorite}
      onFavoriteChange={setFavorite}
      actions={<CodexButton>Satıcıya yaz</CodexButton>}
    />
  )
}

export const PriceAndActions: Story = {
  render: () => <Page title="İlan fiyat başlığı" description="Fiyat, eski fiyat, birim değer, doğrulama ve aksiyonlar farklı ekranlarda aynı önceliği korur."><PriceHeaderDemo /></Page>,
}

export const MobilePriceHeader: Story = {
  render: () => <Page title="Mobil ilan başlığı" description="Aksiyonlar metni sıkıştırmadan fiyat bloğının altına iner."><PriceHeaderDemo /></Page>,
  globals: { viewport: 'mobile1' },
}

export const LocationAndPrivacy: Story = {
  render: () => (
    <Page title="Konum ve çevre" description="İlan sahibinin gizlilik tercihi korunurken kullanıcı yaklaşık bölgeyi ve mesafeleri anlayabilir.">
      <CodexLocationCard
        title="Urla · Kalabak"
        address="Kalabak Mahallesi, 118 ada çevresi"
        privacyLabel="Tam konum ilan sahibi tarafından gizlendi"
        coordinates="38.3262, 26.7487 · yaklaşık merkez"
        facts={[
          { label: 'İlçe merkezine', value: '4,8 km' },
          { label: 'Denize', value: '900 m' },
          { label: 'Ana yola', value: '320 m' },
          { label: 'Toplu ulaşıma', value: '6 dk yürüme' },
        ]}
        nearby={['Kalabak sahili · 900 m', 'Devlet hastanesi · 5,2 km', 'İlkokul · 1,1 km']}
        onOpenMap={() => undefined}
      />
    </Page>
  ),
}

function ValuationDemo({ compact = false }: { compact?: boolean }) {
  const [feedback, setFeedback] = useState<CodexValuationFeedback>()
  return (
    <CodexValuationCard
      estimate="4.310.000 TL"
      low="4.080.000 TL"
      high="4.560.000 TL"
      confidence={86}
      updatedAt="18 Temmuz 2026"
      comparables={27}
      drivers={[
        { label: 'İki yola cephe', effect: '+%4,8', direction: 'positive' },
        { label: 'Denize 900 m', effect: '+%3,1', direction: 'positive' },
        { label: '512 m² parsel büyüklüğü', effect: '+%1,7', direction: 'positive' },
        { label: 'Merkeze 4,8 km', effect: '−%1,2', direction: 'negative' },
      ]}
      feedback={feedback}
      onFeedbackChange={setFeedback}
      onOpenReport={() => undefined}
      compact={compact}
    />
  )
}

export const ValuationStates: Story = {
  render: () => (
    <Page title="Değer tahmini" description="Model tahmini, güven aralığı, emsal sayısı, etkenler, kullanıcı geri bildirimi ve hukuki sınır aynı yüzeyde açıkça sunulur.">
      <div className={styles.gridWide}>
        <ValuationDemo />
        <div className={styles.stack}>
          <ValuationDemo compact />
          <CodexValuationCard estimate="2.180.000 TL" low="1.720.000 TL" high="2.640.000 TL" confidence={48} updatedAt="18 Temmuz 2026" comparables={6} />
        </div>
      </div>
    </Page>
  ),
}

export const PropertyFeatures: Story = {
  render: () => (
    <Page title="İlan özellik grupları" description="Erişilebilir checklist ile ölçü/fakt tablosu aynı tipografik ritmi paylaşır.">
      <CodexFeatureGroup title="Parsel ve çevre özellikleri" sections={[
        { id: 'zoning', title: 'İmar ve tapu', items: [
          { id: 'deed', label: 'Müstakil tapu', available: true },
          { id: 'zoning', label: 'Konut imarlı', available: true, description: 'Emsal 0,30 · 2 kat' },
          { id: 'mortgage', label: 'İpotek veya şerh', available: false },
          { id: 'exchange', label: 'Takasa uygun', available: true },
        ] },
        { id: 'infrastructure', title: 'Altyapı ve erişim', items: [
          { id: 'road', label: 'Kadastro yolu', available: true },
          { id: 'electricity', label: 'Elektrik hattı', available: true, description: 'Parsel sınırına 40 m' },
          { id: 'water', label: 'Şebeke suyu', available: true },
          { id: 'gas', label: 'Doğalgaz', available: false },
        ] },
      ]} />
    </Page>
  ),
}
