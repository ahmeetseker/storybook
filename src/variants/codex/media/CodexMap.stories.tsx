import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexMap } from './index'
import { mapMarkers } from './CodexMedia.stories.fixtures'
import styles from './CodexMedia.stories.module.css'

const meta = {
  title: 'Codex Enterprise/07 Medya ve Harita/02 Harita',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper', fullCanvas: true } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <main className={[styles.page, styles.pageWide].join(' ')}><header className={styles.storyHeader}><h1>{title}</h1><p>{description}</p></header>{children}</main>
}

export const SelectedPin: Story = {
  name: 'Selected pin · İlan ve çevre',
  render: () => (
    <Page title="Seçili pin ve karşılaştırma bağlamı" description="İlan, ulaşım, okul, sağlık ve yakın yer işaretleri tek klavye sırasını paylaşır; seçimin türü, adı ve mesafesi metinle de görünür.">
      <CodexMap markers={mapMarkers} defaultSelectedId="health" description="Urla İskele çevresinde ilan ve önemli noktalar." />
    </Page>
  ),
}

export const PrivacyCircle: Story = {
  name: 'Privacy circle · Yaklaşık konum',
  render: () => (
    <Page title="Kesin adresi paylaşmadan konum anlatımı" description="Gizlilik çemberi görsel bir işaretle yetinmez; yaklaşık alan ve kesin adresin neden saklandığı erişilebilir metinde açıklanır.">
      <CodexMap
        markers={mapMarkers.slice(0, 1)}
        privacyCircle={{ x: 52, y: 48, radius: 18, label: 'İlan bu alanın içinde.', distanceLabel: 'Kesin konum, ilan sahibi onayı olmadan paylaşılmaz.' }}
        showLegend={false}
      />
    </Page>
  ),
}

export const Satellite: Story = {
  name: 'Uydu · Arazi bağlamı',
  render: () => (
    <Page title="Uydu yüzeyi" description="Harita ve uydu görünümü aynı pin, seçim ve yakınlaştırma davranışını korur.">
      <CodexMap markers={mapMarkers} defaultView="satellite" defaultSelectedId="listing-a" />
    </Page>
  ),
}

export const Loading: Story = {
  name: 'Durum · Yükleniyor',
  render: () => <Page title="Harita yükleniyor" description="Harita alanı veri gelene kadar boyutunu korur."><CodexMap markers={[]} status="loading" /></Page>,
}

export const Empty: Story = {
  name: 'Durum · Boş',
  render: () => <Page title="Konum eklenmedi" description="Konum olmadan yanlış bir pin üretilmez; kullanıcıya hangi veri gerektiği açıklanır."><CodexMap markers={[]} status="empty" /></Page>,
}

export const Error: Story = {
  name: 'Durum · Hata',
  render: () => <Page title="Harita kullanılamıyor" description="Harita sağlayıcısı başarısız olduğunda adres metniyle devam etme yolu korunur."><CodexMap markers={[]} status="error" onRetry={() => undefined} /></Page>,
}

export const Mobile: Story = {
  name: 'Mobile · Pin ve bilgi yüzeyi',
  globals: { viewport: 'mobile1' },
  render: () => (
    <Page title="Mobil konum görünümü" description="Seçili pin bilgisi haritanın altına sabitlenir; yakınlaştırma ve görünüm kontrolü erişilebilir kalır.">
      <CodexMap markers={mapMarkers} defaultSelectedId="listing-a" privacyCircle={{ radius: 15 }} />
    </Page>
  ),
}

export const Keyboard: Story = {
  name: 'Keyboard · Pinler ve yakınlaştırma',
  render: () => (
    <Page title="Harita klavye kullanımı" description="Pin sırası döngüseldir; yakınlaştırma standart düğmelerle ayrı bir kontrol grubu oluşturur.">
      <p className={styles.instruction}>Bir pine odaklanın; <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> ile diğer pinlere, <kbd>Home</kbd><kbd>End</kbd> ile listenin sınırlarına gidin.</p>
      <CodexMap markers={mapMarkers} />
    </Page>
  ),
}
