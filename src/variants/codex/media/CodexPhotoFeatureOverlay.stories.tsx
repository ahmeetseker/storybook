import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexPhotoFeatureOverlay } from './index'
import { galleryItems, photoFeatures } from './CodexMedia.stories.fixtures'
import styles from './CodexMedia.stories.module.css'

const meta = {
  title: 'Codex Enterprise/07 Medya ve Harita/05 Görsel Açıklama',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper', fullCanvas: true } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <main className={[styles.page, styles.pageWide].join(' ')}><header className={styles.storyHeader}><h1>{title}</h1><p>{description}</p></header>{children}</main>
}

export const SelectedFeature: Story = {
  name: 'Selected feature · Kaynak ve güven',
  render: () => (
    <Page title="Fotoğraftaki özelliği açıklayın" description="Numaralı işaret, açıklama satırı, kaynak ve güven düzeyi tek seçime bağlıdır; AI önerileri kesin tespit gibi sunulmaz.">
      <CodexPhotoFeatureOverlay media={galleryItems[0]} features={photoFeatures} defaultSelectedId="roof" />
    </Page>
  ),
}

export const ExpertNotes: Story = {
  name: 'Uzman notu · Güven gizli',
  render: () => (
    <Page title="İnsan incelemesiyle hazırlanmış açıklama" description="Güven skoru kullanılmadığında bile kaynak ve seçili işaret ilişkisi korunur.">
      <CodexPhotoFeatureOverlay media={galleryItems[0]} features={photoFeatures.filter((feature) => feature.source !== 'ai')} showConfidence={false} analysisNotice="İşaretler uzman incelemesi sırasında eklenmiştir; yerinde teknik kontrolün yerini almaz." />
    </Page>
  ),
}

export const Analyzing: Story = {
  name: 'Durum · Analiz ediliyor',
  render: () => <Page title="Görsel analiz ediliyor" description="Analiz süreci yardımcı teknolojiye canlı durum olarak bildirilir."><CodexPhotoFeatureOverlay media={galleryItems[0]} features={[]} status="analyzing" /></Page>,
}

export const Loading: Story = {
  name: 'Durum · Yükleniyor',
  render: () => <Page title="Fotoğraf yükleniyor" description="Fotoğraf verisi gelmeden işaretler etkileşime açılmaz."><CodexPhotoFeatureOverlay media={galleryItems[0]} features={[]} status="loading" /></Page>,
}

export const Empty: Story = {
  name: 'Durum · Boş bulgu',
  render: () => <Page title="Güvenilir özellik bulunamadı" description="Boş bulgu, fotoğrafta sorun olmadığı anlamına gelmez; elle inceleme yönlendirmesi görünür kalır."><CodexPhotoFeatureOverlay media={galleryItems[0]} features={[]} status="empty" /></Page>,
}

export const Error: Story = {
  name: 'Durum · Hata',
  render: () => <Page title="Otomatik açıklama kullanılamıyor" description="Fotoğrafın elle incelenebileceği açıkça söylenir ve yeniden deneme sunulur."><CodexPhotoFeatureOverlay media={galleryItems[0]} features={[]} status="error" onRetry={() => undefined} /></Page>,
}

export const Mobile: Story = {
  name: 'Mobile · Fotoğraf ve bulgu listesi',
  globals: { viewport: 'mobile1' },
  render: () => (
    <Page title="Mobil görsel açıklama" description="İşaretli fotoğraf önce, eşleşen açıklamalar hemen ardından gelir.">
      <CodexPhotoFeatureOverlay media={galleryItems[0]} features={photoFeatures} defaultSelectedId="access" />
    </Page>
  ),
}

export const Keyboard: Story = {
  name: 'Keyboard · İşaret eşleştirme',
  render: () => (
    <Page title="Fotoğraf işaretlerinde klavye gezinmesi" description="Fotoğraf işaretleri ve açıklama listesi aynı seçimi paylaşır; kullanıcı iki bölgeden de ilerleyebilir.">
      <p className={styles.instruction}>Bir işarete veya açıklama satırına odaklanın; <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> ile diğer bulgulara gidin.</p>
      <CodexPhotoFeatureOverlay media={galleryItems[0]} features={photoFeatures} />
    </Page>
  ),
}
