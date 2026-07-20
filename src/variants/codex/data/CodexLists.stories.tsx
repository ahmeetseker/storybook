import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexBadge, CodexButton, CodexIconButton } from '../controls'
import { CodexList, CodexSkeletonBlock, CodexTimeline } from './CodexData'
import styles from './CodexData.stories.module.css'

const meta = {
  title: 'Codex Enterprise/06 Veri ve Karşılaştırma/03 Listeler ve Durumlar',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function BellIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
}

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return <div className={styles.page}><header className={styles.header}><h1>{title}</h1><p>{description}</p></header>{children}</div>
}

export const ActivityTimeline: Story = {
  render: () => (
    <Page title="İlan yaşam döngüsü" description="Moderasyon, belge ve fiyat olayları tek kronolojide; önem yalnız renkle anlatılmıyor.">
      <CodexTimeline title="ILN-48291 hareketleri" events={[
        { id: '1', title: 'İlan yayına alındı', description: 'EİDS kimlik ve yetki doğrulaması başarıyla tamamlandı.', time: 'Bugün, 09:42', datetime: '2026-07-18T09:42:00+03:00', tone: 'success', meta: <CodexBadge tone="success" dot>Otomatik kontrol</CodexBadge> },
        { id: '2', title: 'Fiyat önerisi incelendi', description: '4.180.000–4.430.000 TL güven aralığına göre mevcut fiyat korundu.', time: 'Bugün, 09:31', datetime: '2026-07-18T09:31:00+03:00', tone: 'info', meta: <CodexButton variant="quiet" size="sm">Analizi aç</CodexButton> },
        { id: '3', title: 'İmar belgesi eşleştirildi', description: 'Belgedeki ada/parsel bilgisi TKGM kaydıyla eşleşiyor.', time: 'Dün, 18:06', datetime: '2026-07-17T18:06:00+03:00', tone: 'success' },
        { id: '4', title: 'Fotoğraf incelemesi notu', description: 'İki fotoğrafta sınır çizgisi okunamıyor; ilan sahibinden ek görüntü istendi.', time: 'Dün, 17:54', datetime: '2026-07-17T17:54:00+03:00', tone: 'warning' },
      ]} />
    </Page>
  ),
}

export const NotificationList: Story = {
  render: () => (
    <Page title="Operasyon bildirimleri" description="Liste satırları bilgi, zaman ve aksiyonu aynı hiyerarşide taşır.">
      <CodexList aria-label="Son bildirimler" items={[
        { id: 'n1', leading: <span className={styles.icon}><BellIcon /></span>, title: 'Urla alarmında 6 yeni ilan', description: '5 milyon TL altı, konut imarlı, müstakil tapu', meta: <><CodexBadge tone="accent">Yeni</CodexBadge><br />8 dk önce</>, action: <CodexButton size="sm" variant="secondary">Görüntüle</CodexButton>, selected: true },
        { id: 'n2', leading: <span className={styles.avatar}>EP</span>, title: 'Ege Parsel yeni mesaj gönderdi', description: '“İmar belgesinin güncel nüshasını paylaşabilirim.”', meta: '34 dk önce', action: <CodexIconButton size="sm" label="Mesajı aç">→</CodexIconButton> },
        { id: 'n3', leading: <span className={styles.avatar}>AI</span>, title: 'Fiyat değişikliği açıklaması hazır', description: 'ILN-48291 için bölge ve emsal etkisi özetlendi.', meta: '2 sa önce', action: <CodexButton size="sm" variant="quiet">İncele</CodexButton> },
        { id: 'n4', leading: <span className={styles.avatar}>MD</span>, title: 'Moderasyon tamamlandı', description: 'Kaş turizm imarlı arsa yeniden yayında.', meta: 'Dün', action: <CodexButton size="sm" variant="quiet">İlana git</CodexButton> },
      ]} />
    </Page>
  ),
}

export const EmptyTimeline: Story = {
  render: () => <Page title="Yeni kayıt" description="İlk hareket oluşmadan önce kullanıcıya neyin burada görüneceğini açıklar."><CodexTimeline title="İlan hareketleri" events={[]} /></Page>,
}

export const LoadingShapes: Story = {
  render: () => (
    <Page title="İçeriğe göre skeleton" description="Tek bir genel spinner yerine gelecek yüzeyin gerçek geometrisi korunur.">
      <div className={styles.storyGrid}>
        <CodexSkeletonBlock variant="listing" label="İlan kartı yükleniyor" />
        <CodexSkeletonBlock variant="message" label="Mesaj yükleniyor" />
        <CodexSkeletonBlock variant="detail" label="İlan detayı yükleniyor" />
        <CodexSkeletonBlock variant="table" label="Rapor tablosu yükleniyor" />
      </div>
    </Page>
  ),
}

export const MobileList: Story = {
  ...NotificationList,
  globals: { viewport: 'mobile1' },
}
