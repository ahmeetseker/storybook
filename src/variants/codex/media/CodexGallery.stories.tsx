import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexCarousel, CodexGallery, CodexMediaGallery } from './index'
import { carouselItems, galleryItems } from './CodexMedia.stories.fixtures'
import styles from './CodexMedia.stories.module.css'

const meta = {
  title: 'Codex Enterprise/07 Medya ve Harita/01 Galeri',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper', fullCanvas: true } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ children, title, description, immersive = false }: { children: ReactNode; title: string; description: string; immersive?: boolean }) {
  return (
    <main className={[styles.page, immersive ? styles.pageImmersive : styles.pageWide].join(' ')}>
      <header className={styles.storyHeader}><h1>{title}</h1><p>{description}</p></header>
      {children}
    </main>
  )
}

export const Immersive: Story = {
  name: 'Immersive · Tam genişlik',
  render: () => (
    <Page immersive title="Mekânı kesintisiz inceleyin" description="Büyük medya sahnesi açıklamayı fotoğraftan ayırmadan; sayaç, tür ve gezinme kontrollerini yalnız gerektiği yerde yüzdürür.">
      <CodexGallery items={galleryItems} variant="immersive" defaultSelectedId="coast" />
    </Page>
  ),
}

export const Contained: Story = {
  name: 'Contained · İçerik alanı',
  render: () => (
    <Page title="İlan detay galerisi" description="Standart içerik sütununda 12px medya köşesi ve yatay film şeridi kullanılır.">
      <CodexGallery items={galleryItems.slice(0, 5)} variant="contained" />
    </Page>
  ),
}

export const MixedMedia: Story = {
  name: 'Mixed media · Tür filtreleri',
  render: () => (
    <Page title="Fotoğraf, video, 360° ve plan" description="Tür sekmeleri adetleri görünür tutar; seçilen tür kendi erişilebilir galeri paneline bağlanır.">
      <CodexMediaGallery items={galleryItems} />
    </Page>
  ),
}

export const Carousel: Story = {
  name: 'Carousel · Öne çıkan seçki',
  render: () => (
    <Page title="Öne çıkan yaşam alanları" description="Yatay seçki dokunma, gezinme düğmeleri ve ok tuşlarıyla aynı aktif kartı paylaşır.">
      <CodexCarousel items={carouselItems} columns={3} description="Fotoğraf setinin karar vermeyi hızlandıran beş ana görünümü." />
    </Page>
  ),
}

export const Loading: Story = {
  name: 'Durum · Yükleniyor',
  render: () => (
    <Page title="Galeri yükleniyor" description="İskelet, beklenen medya alanının yerini korur ve yardımcı teknolojiye yükleme durumunu bildirir.">
      <CodexGallery items={[]} status="loading" />
    </Page>
  ),
}

export const Empty: Story = {
  name: 'Durum · Boş',
  render: () => (
    <Page title="Henüz medya yok" description="Boş durum eksikliği açıklarken bir sonraki içerik adımını da tarif eder.">
      <CodexGallery items={[]} status="empty" />
    </Page>
  ),
}

export const Error: Story = {
  name: 'Durum · Hata',
  render: () => (
    <Page title="Medya alınamadı" description="Hata, galerinin yerini korur; kullanıcı yeniden deneyebilir ve metin içeriğine devam edebilir.">
      <CodexGallery items={[]} status="error" onRetry={() => undefined} />
    </Page>
  ),
}

export const Mobile: Story = {
  name: 'Mobile · Dokunmatik film şeridi',
  globals: { viewport: 'mobile1' },
  render: () => (
    <Page title="Mobil galeri" description="Film şeridi ekran kenarına taşar, ana medya ve kontroller 44px dokunma hedeflerini korur.">
      <CodexGallery items={galleryItems.slice(0, 6)} defaultSelectedId="living" />
    </Page>
  ),
}

export const Keyboard: Story = {
  name: 'Keyboard · Galeri ve filtreler',
  render: () => (
    <Page title="Klavye gezinme sözleşmesi" description="Galeri odağı ve medya türü sekmeleri ayrı, öngörülebilir klavye bölgeleridir.">
      <p className={styles.instruction}><kbd>Tab</kbd> ile galeriye gelin; <kbd>←</kbd><kbd>→</kbd> ile medya, <kbd>Home</kbd><kbd>End</kbd> ile ilk ve son öğe arasında ilerleyin.</p>
      <CodexMediaGallery items={galleryItems} />
    </Page>
  ),
}
