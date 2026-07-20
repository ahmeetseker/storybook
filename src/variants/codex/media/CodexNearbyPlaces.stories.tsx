import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexNearbyPlaces } from './index'
import { nearbyPlaces } from './CodexMedia.stories.fixtures'
import styles from './CodexMedia.stories.module.css'

const meta = {
  title: 'Codex Enterprise/07 Medya ve Harita/03 Konum ve Çevre',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper', fullCanvas: true } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <main className={[styles.page, styles.pageWide].join(' ')}><header className={styles.storyHeader}><h1>{title}</h1><p>{description}</p></header>{children}</main>
}

export const CategoryAndDistance: Story = {
  name: 'Kategori · Mesafe ve rota',
  render: () => (
    <Page title="Günlük yaşam noktalarını karşılaştırın" description="Kategori, yaklaşık mesafe, yürüme ve sürüş süreleri aynı satırda taranabilir; doğrulanan kaynaklar açıkça işaretlenir.">
      <CodexNearbyPlaces places={nearbyPlaces} defaultSelectedId="coast" />
    </Page>
  ),
}

export const TransportSelection: Story = {
  name: 'Seçim · Ulaşım filtresi',
  render: () => (
    <Page title="Ulaşım odaklı çevre görünümü" description="Önceden seçilmiş kategori, toplam bağlamı kaybetmeden ilgili noktaları sadeleştirir.">
      <CodexNearbyPlaces places={nearbyPlaces} defaultSelectedCategory="transport" defaultSort="walk" radiusLabel="15 dk yürüme" />
    </Page>
  ),
}

export const Loading: Story = {
  name: 'Durum · Yükleniyor',
  render: () => <Page title="Rotalar hesaplanıyor" description="Sonuç alanı, mesafeler hesaplanırken iskelet durumunu korur."><CodexNearbyPlaces places={[]} status="loading" /></Page>,
}

export const Empty: Story = {
  name: 'Durum · Boş',
  render: () => <Page title="Çevre verisi yok" description="Konum doğrulanana kadar tahmini yer veya süre uydurulmaz."><CodexNearbyPlaces places={[]} status="empty" /></Page>,
}

export const Error: Story = {
  name: 'Durum · Hata',
  render: () => <Page title="Rota hesabı kullanılamıyor" description="Kullanıcı konum adını kullanarak devam edebilir ve veri kaynağını yeniden deneyebilir."><CodexNearbyPlaces places={[]} status="error" onRetry={() => undefined} /></Page>,
}

export const Mobile: Story = {
  name: 'Mobile · Liste ve çevre özeti',
  globals: { viewport: 'mobile1' },
  render: () => (
    <Page title="Mobil yakın çevre" description="Sıralama, kategori ve liste önce gelir; çevre diyagramı listenin ardından okunur.">
      <CodexNearbyPlaces places={nearbyPlaces} defaultSelectedId="market" />
    </Page>
  ),
}

export const Keyboard: Story = {
  name: 'Keyboard · Dikey yer listesi',
  render: () => (
    <Page title="Çevre listesinde klavye gezinmesi" description="Kategori düğmeleri ve yer listesi doğal Tab sırasını korur; yerler arasında hızlı geçiş sağlanır.">
      <p className={styles.instruction}>Bir yer satırına odaklandıktan sonra <kbd>↑</kbd><kbd>↓</kbd> ile ilerleyin; <kbd>Home</kbd><kbd>End</kbd> ilk ve son yere gider.</p>
      <CodexNearbyPlaces places={nearbyPlaces} />
    </Page>
  ),
}
