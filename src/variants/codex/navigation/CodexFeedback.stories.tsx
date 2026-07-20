import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexButton, CodexField, CodexInput } from '../controls'
import { CodexEmptyState, CodexNotice } from '../content'
import { CodexProgress } from '../forms'
import { CodexDrawer, CodexModal, CodexPopover, CodexToast } from './CodexNavigation'
import styles from './CodexNavigation.module.css'

const meta = {
  title: 'Codex Enterprise/04 Overlay ve Geri Bildirim/01 Sistem',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { defaultTheme: 'paper' },
    docs: { description: { component: 'Sayfa içi feedback ile modal, drawer, popover ve toast katmanlarını önem, süre, odak ve güvenli geri dönüş sözleşmesiyle ayıran enterprise örnekleri.' } },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Page({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className={styles.storyPage}>
      <div className={styles.storyShell}>
        <header className={styles.storyHeader}><h1 className={styles.storyTitle}>{title}</h1><p className={styles.storyIntro}>{description}</p></header>
        <div className={styles.storyStack}>{children}</div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className={styles.storySection}><header className={styles.storySectionHeader}><h2 className={styles.storySectionTitle}>{title}</h2></header>{children}</section>
}

export const FeedbackHierarchy: Story = {
  name: 'Feedback · Önem hiyerarşisi',
  render: () => (
    <Page title="Geri bildirim önem ve süre matrisi" description="Mesajın yerleşimi etkisine göre seçilir: bağlamsal bilgi sayfada, kısa işlem sonucu toast’ta, geri döndürülemez karar modalda kalır.">
      <Section title="Sayfa içi ve ilerleme">
        <div className={styles.storyStack}>
          <CodexNotice tone="info" title="Belge kontrolü sürüyor">İlanı düzenlemeye devam edebilirsiniz; yayınlama kontrol tamamlanana kadar kapalıdır.</CodexNotice>
          <CodexNotice tone="warning" title="İmar belgesi eski" action={<CodexButton variant="quiet" size="sm">Güncel belge yükle</CodexButton>}>Belediye kayıt tarihiyle yüklenen nüsha eşleşmiyor.</CodexNotice>
          <CodexProgress label="EİDS doğrulama" value={68} tone="info" />
        </div>
      </Section>
      <Section title="Boş ve hata geri dönüşü">
        <div className={styles.storyGrid}>
          <CodexEmptyState title="Henüz mesaj yok" description="Bir ilan sayfasından satıcıya yazarak güvenli konuşma başlatın." action={<CodexButton>İlanlara dön</CodexButton>} />
          <CodexEmptyState title="Sonuçlar yüklenemedi" description="Filtreleriniz korundu. Bağlantıyı kontrol edip yeniden deneyin." action={<CodexButton>Yeniden dene</CodexButton>} />
        </div>
      </Section>
    </Page>
  ),
}

export const ToastMatrix: Story = {
  name: 'Toast · Beş ton ve geri alma',
  render: () => (
    <Page title="Kısa süreli işlem geri bildirimi" description="Renk her zaman başlık ve işaretle desteklenir; kritik tonlar assertive, bilgi tonları polite live region kullanır.">
      <Section title="Durum tonları">
        <div className={styles.storyStack}>
          <CodexToast title="Taslak kaydedildi" tone="neutral">Son değişiklikler bu cihazda saklandı.</CodexToast>
          <CodexToast title="Analiz hazır" tone="info" actionLabel="Raporu aç">27 emsal ve üç resmî kayıt karşılaştırıldı.</CodexToast>
          <CodexToast title="İlan yayına alındı" tone="success" actionLabel="İlanı görüntüle">Arama sonuçlarında görünmesi birkaç dakika sürebilir.</CodexToast>
          <CodexToast title="2 fotoğraf atlandı" tone="warning" actionLabel="İncele">Dosya çözünürlüğü yayın sınırının altında.</CodexToast>
          <CodexToast title="Toplu güncelleme uygulanamadı" tone="danger" actionLabel="Yeniden dene">Seçiminiz korundu; hiçbir ilan değiştirilmedi.</CodexToast>
        </div>
      </Section>
    </Page>
  ),
}

function OverlayDecisionsDemo() {
  const [archived, setArchived] = useState(false)
  return (
    <Page title="Karar ve inceleme katmanları" description="Modal yalnız sınırlı kararı, drawer geniş incelemeyi, popover tetikleyiciye bağlı kısa açıklamayı taşır.">
      <Section title="Overlay görevleri">
        <div className={styles.storyRow}>
          <CodexModal
            title="İlanı arşive taşı"
            description="İlan arama sonuçlarından kaldırılır; mesaj geçmişi korunur."
            triggerLabel="Arşivleme kararını aç"
            size="sm"
            footer={<><CodexButton variant="quiet">Vazgeç</CodexButton><CodexButton variant="danger" onClick={() => setArchived(true)}>{archived ? 'Arşivlendi' : 'Arşive taşı'}</CodexButton></>}
          >
            <CodexNotice tone="warning" title="18 aktif alarm etkilenecek">Kullanıcılar bu ilan için yeni bildirim almayacak.</CodexNotice>
          </CodexModal>
          <CodexDrawer
            title="Belge incelemesi"
            description="İmar belgesi · 12 Temmuz 2026"
            triggerLabel="İnceleme panelini aç"
            footer={<><CodexButton variant="secondary">Düzeltme iste</CodexButton><CodexButton>Doğrula</CodexButton></>}
          >
            <div className={styles.storyForm}>
              <CodexNotice tone="info" title="AI ön kontrolü">Ada/parsel eşleşti; belge tarihi manuel kontrol edilmeli.</CodexNotice>
              <CodexField label="İnceleme notu"><CodexInput defaultValue="Belediye yayın tarihi kontrol edilecek" /></CodexField>
            </div>
          </CodexDrawer>
          <CodexPopover trigger="Model sınırını açıkla" title="Değerleme güveni" description="Bu skor ekspertiz raporu değildir.">
            <p className={styles.storyMeta}>Confidence; emsal sayısı, veri güncelliği ve özellik benzerliğinden hesaplanır.</p>
          </CodexPopover>
        </div>
      </Section>
    </Page>
  )
}

export const OverlayDecisions: Story = { name: 'Overlay · Modal, drawer ve popover', render: () => <OverlayDecisionsDemo /> }

export const MobileFeedback: Story = {
  name: 'Mobil · Reflow ve touch',
  globals: { designTheme: 'codex-paper', forceTier: 'fallback', viewport: 'mobile1' },
  render: () => <OverlayDecisionsDemo />,
}
