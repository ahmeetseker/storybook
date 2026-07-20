import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexFloorPlanViewer } from './index'
import { floorPlans } from './CodexMedia.stories.fixtures'
import styles from './CodexMedia.stories.module.css'

const meta = {
  title: 'Codex Enterprise/07 Medya ve Harita/04 Kat Planı',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper', fullCanvas: true } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <main className={[styles.page, styles.pageWide].join(' ')}><header className={styles.storyHeader}><h1>{title}</h1><p>{description}</p></header>{children}</main>
}

export const MultiFloor: Story = {
  name: 'Çok katlı · Oda seçimi',
  render: () => (
    <Page title="Kat ve bölüm bazında inceleme" description="Kat sekmesi, oda işareti, net alan ve açıklama aynı seçim durumuna bağlıdır; plan yakınlaştırılabilir ve döndürülebilir.">
      <CodexFloorPlanViewer floors={floorPlans} defaultSelectedFloorId="ground" defaultSelectedRoomId="living" />
    </Page>
  ),
}

export const GardenPlan: Story = {
  name: 'Parsel · Bahçe kullanımı',
  render: () => (
    <Page title="Yapı ve açık alan ilişkisi" description="Aynı plan sözleşmesi bahçe, otopark, yapı oturumu ve peyzaj bölgelerini de açıklayabilir.">
      <CodexFloorPlanViewer floors={floorPlans} defaultSelectedFloorId="garden" defaultSelectedRoomId="olive" />
    </Page>
  ),
}

export const Loading: Story = {
  name: 'Durum · Yükleniyor',
  render: () => <Page title="Plan yükleniyor" description="Plan alanı dosya hazırlanırken boyutunu ve yükleme bildirimini korur."><CodexFloorPlanViewer floors={[]} status="loading" /></Page>,
}

export const Empty: Story = {
  name: 'Durum · Boş',
  render: () => <Page title="Kat planı eklenmedi" description="Ölçü veya oda bilgisi yoksa temsili bir plan gerçek veri gibi sunulmaz."><CodexFloorPlanViewer floors={[]} status="empty" /></Page>,
}

export const Error: Story = {
  name: 'Durum · Hata',
  render: () => <Page title="Plan dosyası açılamıyor" description="Alan bilgisi ilan metninde kullanılabilir; plan ayrıca yeniden denenebilir."><CodexFloorPlanViewer floors={[]} status="error" onRetry={() => undefined} /></Page>,
}

export const Mobile: Story = {
  name: 'Mobile · Yatay kat sekmeleri',
  globals: { viewport: 'mobile1' },
  render: () => (
    <Page title="Mobil kat planı" description="Katlar yatay kaydırılır; plan alanı taşmak yerine kendi içinde kaydırılabilir kalır.">
      <CodexFloorPlanViewer floors={floorPlans} defaultSelectedFloorId="upper" />
    </Page>
  ),
}

export const Keyboard: Story = {
  name: 'Keyboard · Kat ve odalar',
  render: () => (
    <Page title="Kat planı klavye sözleşmesi" description="Kat sekmeleri ve oda bölgeleri ayrı ok tuşu gruplarıdır; odak her zaman görünür kalır.">
      <p className={styles.instruction}>Kat sekmelerinde ve oda bölgelerinde <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> kullanın; <kbd>Home</kbd><kbd>End</kbd> grup sınırlarına gider.</p>
      <CodexFloorPlanViewer floors={floorPlans} />
    </Page>
  ),
}
