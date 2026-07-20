import { useRef, useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CodexBreadcrumb,
  CodexDrawer,
  CodexMenu,
  CodexModal,
  CodexPagination,
  CodexPopover,
  CodexSidebar,
  CodexToast,
  CodexToolbar,
  CodexToolbarGroup,
  type CodexMenuItem,
  type CodexSidebarSection,
} from './CodexNavigation'
import styles from './CodexNavigation.module.css'

const meta = {
  title: 'Codex Enterprise/03 Navigasyon ve Komut/01 Sistem',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { defaultTheme: 'paper' },
    docs: {
      description: {
        component:
          'Kurumsal Türkçe pazar yeri ürünleri için landmark semantiği, klavye gezinmesi, kontrollü ve kontrolsüz state, mobil davranış ve odak yönetimi eksiksiz navigasyon/overlay sistemi.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}

const icons = {
  dashboard: <Icon><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Icon>,
  listing: <Icon><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></Icon>,
  message: <Icon><path d="M4 5h16v12H9l-5 4z" /><path d="M8 9h8M8 13h5" /></Icon>,
  chart: <Icon><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Icon>,
  sparkle: <Icon><path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8zM19 15l.6 2.1 1.9.9-1.9.9L19 21l-.6-2.1-1.9-.9 1.9-.9z" /></Icon>,
  settings: <Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></Icon>,
  filter: <Icon><path d="M4 5h16M7 12h10M10 19h4" /></Icon>,
  export: <Icon><path d="M12 4v11M8 8l4-4 4 4M5 14v6h14v-6" /></Icon>,
  more: <Icon><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></Icon>,
}

function StoryPage({ children }: { children: ReactNode }) {
  return (
    <main className={styles.storyPage}>
      <div className={styles.storyShell}>
        <header className={styles.storyHeader}>
          <h1 className={styles.storyTitle}>Kurumsal navigasyon ve overlay sistemi</h1>
          <p className={styles.storyIntro}>
            İlan yönetiminden yapay zekâ içgörülerine kadar yoğun iş akışlarında semantik, öngörülebilir ve mobilde aynı sözleşmeyi koruyan bileşenler.
          </p>
        </header>
        <div className={styles.storyStack}>{children}</div>
      </div>
    </main>
  )
}

function Section({ title, copy, children }: { title: string; copy?: string; children: ReactNode }) {
  return (
    <section className={styles.storySection}>
      <header className={styles.storySectionHeader}>
        <h2 className={styles.storySectionTitle}>{title}</h2>
        {copy ? <p className={styles.storySectionCopy}>{copy}</p> : null}
      </header>
      {children}
    </section>
  )
}

function Card({ title, copy, children }: { title: string; copy?: string; children: ReactNode }) {
  return (
    <article className={styles.storyCard}>
      <header className={styles.storyCardHeader}>
        <h3 className={styles.storyCardTitle}>{title}</h3>
        {copy ? <p className={styles.storyCardCopy}>{copy}</p> : null}
      </header>
      {children}
    </article>
  )
}

function OverviewDemo() {
  const [page, setPage] = useState(3)
  const [toastVisible, setToastVisible] = useState(true)

  return (
    <StoryPage>
      <Section title="Sayfa bağlamı" copy="Breadcrumb, sayfalama ve görev araçları aynı sakin ürün ölçeğinde çalışır.">
        <CodexBreadcrumb items={[
          { label: 'Kurumsal panel', href: '#' },
          { label: 'İlan yönetimi', href: '#' },
          { label: 'Satılık arsa', href: '#' },
          { label: 'İzmir', href: '#' },
          { label: 'Urla', href: '#' },
          { label: 'İlan 1160437821' },
        ]} />
        <CodexToolbar label="İlan araçları">
          <CodexToolbarGroup label="Görünüm">
            <button className={styles.storyButtonSecondary} type="button">Liste</button>
            <button className={styles.storyButtonSecondary} type="button">Harita</button>
          </CodexToolbarGroup>
          <CodexToolbarGroup label="İlan işlemleri" separated>
            <button className={styles.storyButtonSecondary} type="button">{icons.filter} Filtrele</button>
            <button className={styles.storyButtonSecondary} type="button">{icons.export} Dışa aktar</button>
          </CodexToolbarGroup>
        </CodexToolbar>
        <CodexPagination pageCount={18} page={page} onPageChange={setPage} />
      </Section>
      <Section title="Anlık geri bildirim" copy="Toast sayfayı kilitlemeden sonucu bildirir; kullanıcı bildirimi kapatabilir.">
        <CodexToast
          tone="success"
          title="Arama kriterleri kaydedildi"
          visible={toastVisible}
          onVisibleChange={setToastVisible}
          onDismiss={() => setToastVisible(false)}
          actionLabel="Aramalarıma git"
          onAction={() => undefined}
        >
          Urla ve Çeşme’deki yeni müstakil evler için bildirim alacaksınız.
        </CodexToast>
        {!toastVisible ? <button type="button" className={styles.storyButtonSecondary} onClick={() => setToastVisible(true)}>Bildirimi yeniden göster</button> : null}
      </Section>
    </StoryPage>
  )
}

export const Overview: Story = { render: () => <OverviewDemo /> }

function BreadcrumbPaginationDemo() {
  const [page, setPage] = useState(12)
  return (
    <StoryPage>
      <Section title="Breadcrumb varyantları" copy="Uzun yollar kontrollü biçimde daralır; gizli seviyeler tek bir açık etiketli kontrolle geri gelir.">
        <div className={styles.storyGrid}>
          <Card title="Kısa ürün yolu">
            <CodexBreadcrumb items={[{ label: 'Ana sayfa', href: '#' }, { label: 'Emlak', href: '#' }, { label: 'Satılık konut' }]} />
          </Card>
          <Card title="Kurumsal derin yol" copy="Üçten fazla ara seviye ilk görünümde özetlenir.">
            <CodexBreadcrumb maxItems={4} items={[
              { label: 'Operasyon', href: '#' },
              { label: 'Portföyler', href: '#' },
              { label: 'Ege Bölgesi', href: '#' },
              { label: 'İzmir', href: '#' },
              { label: 'Urla', href: '#' },
              { label: 'Konut', href: '#' },
              { label: 'Doğrulama kuyruğu' },
            ]} />
          </Card>
          <Card title="Buton tabanlı uygulama yolu">
            <CodexBreadcrumb items={[{ label: 'AI Asistanı', onClick: () => undefined }, { label: 'Fiyat modeli', onClick: () => undefined }, { label: 'Karşılaştırma' }]} />
          </Card>
        </div>
      </Section>
      <Section title="Sayfalama yoğunlukları" copy="Sayfa sayısı büyüdüğünde anlamlı komşular korunur; mobilde yön kontrolleri ikon seviyesine daralır.">
        <div className={styles.storyGrid}>
          <Card title="Kontrollü sonuç listesi" copy={`Aktif sayfa: ${page}`}>
            <CodexPagination pageCount={42} page={page} onPageChange={setPage} />
          </Card>
          <Card title="Bağlantılı SEO sonuçları">
            <CodexPagination pageCount={9} defaultPage={4} hrefBuilder={(next) => `?sayfa=${next}`} />
          </Card>
          <Card title="Tek sayfa ve devre dışı">
            <CodexPagination pageCount={1} disabled />
          </Card>
        </div>
      </Section>
    </StoryPage>
  )
}

export const BreadcrumbAndPagination: Story = { render: () => <BreadcrumbPaginationDemo /> }

const menuItems: CodexMenuItem[] = [
  { id: 'edit', label: 'İlanı düzenle', description: 'Başlık, fiyat ve özellikleri güncelle', shortcut: 'E' },
  { id: 'duplicate', label: 'Benzer ilan oluştur', description: 'Bilgileri yeni bir taslağa kopyala' },
  { id: 'report', label: 'Performans raporu', href: '#rapor' },
  { id: 'sep', type: 'separator' },
  { id: 'archive', label: 'Arşive taşı', description: 'İlan yayından kaldırılır', danger: true },
]

function ToolbarDemo() {
  return (
    <StoryPage>
      <Section title="Yatay görev araçları" copy="Sağ/sol ok, Home ve End roving tabindex sözleşmesiyle çalışır; dar alanda toolbar yatay kayar.">
        <CodexToolbar label="Toplu ilan araçları">
          <CodexToolbarGroup label="Seçim">
            <button type="button" className={styles.storyButtonSecondary}>24 ilan seçili</button>
          </CodexToolbarGroup>
          <CodexToolbarGroup label="Durum" separated>
            <button type="button" className={styles.storyButtonSecondary}>Yayına al</button>
            <button type="button" className={styles.storyButtonSecondary}>Pasife al</button>
            <button type="button" className={styles.storyButtonSecondary}>Etiketle</button>
          </CodexToolbarGroup>
          <CodexToolbarGroup label="Diğer" separated>
            <CodexMenu trigger={<>{icons.more} Diğer</>} items={menuItems} align="end" />
          </CodexToolbarGroup>
        </CodexToolbar>
      </Section>
      <Section title="Dikey editör araçları" copy="Aynı klavye modeli dikey yönde yukarı/aşağı oklarına dönüşür.">
        <CodexToolbar label="Fotoğraf düzenleme araçları" orientation="vertical">
          <CodexToolbarGroup label="Dönüşüm">
            <button type="button" className={styles.storyButtonSecondary}>Kırp</button>
            <button type="button" className={styles.storyButtonSecondary}>Döndür</button>
          </CodexToolbarGroup>
          <CodexToolbarGroup label="AI araçları" separated>
            <button type="button" className={styles.storyButtonSecondary}>Arka planı iyileştir</button>
            <button type="button" className={styles.storyButtonSecondary}>Kaliteyi artır</button>
          </CodexToolbarGroup>
        </CodexToolbar>
      </Section>
    </StoryPage>
  )
}

export const Toolbars: Story = { render: () => <ToolbarDemo /> }

const sidebarSections: CodexSidebarSection[] = [
  {
    id: 'workspace',
    label: 'Çalışma alanı',
    items: [
      { id: 'overview', label: 'Genel bakış', icon: icons.dashboard },
      { id: 'listings', label: 'İlanlarım', icon: icons.listing, badge: '24', children: [
        { id: 'published', label: 'Yayındaki ilanlar' },
        { id: 'drafts', label: 'Taslaklar', badge: '7' },
      ] },
      { id: 'messages', label: 'Mesajlar', icon: icons.message, badge: '3' },
      { id: 'analytics', label: 'Performans', icon: icons.chart },
    ],
  },
  {
    id: 'intelligence',
    label: 'Yapay zekâ',
    items: [
      { id: 'ai-assistant', label: 'Portföy asistanı', icon: icons.sparkle },
      { id: 'price-model', label: 'Fiyat tahmini', icon: icons.chart },
    ],
  },
  {
    id: 'system',
    items: [{ id: 'settings', label: 'Ayarlar', icon: icons.settings }],
  },
]

function SidebarDemo() {
  const [active, setActive] = useState('listings')
  return (
    <StoryPage>
      <Section title="Kurumsal kenar navigasyonu" copy="Controlled aktif öğe, iç içe liste, bildirim sayacı, daraltılmış masaüstü ve mobil off-canvas durumları tek API’dedir.">
        <div className={styles.storySidebarFrame}>
          <CodexSidebar
            sections={sidebarSections}
            activeId={active}
            onActiveChange={setActive}
            brand="Parsel Pro"
            footer={<p className={styles.storyMeta}>Kurumsal paket · 18 kullanıcı</p>}
          />
        </div>
      </Section>
      <Section title="Daraltılmış yoğun görünüm" copy="Görsel etiketler daralırken accessible name korunur; mobil açıldığında tam etiketler geri gelir.">
        <div className={styles.storySidebarFrame}>
          <CodexSidebar sections={sidebarSections} defaultActiveId="ai-assistant" defaultCollapsed brand="PP" />
        </div>
      </Section>
    </StoryPage>
  )
}

export const Sidebars: Story = { render: () => <SidebarDemo /> }

function MenuPopoverDemo() {
  const [saved, setSaved] = useState(false)
  return (
    <StoryPage>
      <Section title="İşlem menüleri" copy="ArrowUp/Down, Home, End, Escape ve odak iadesi; açıklamalı, bağlantılı, tehlikeli ve devre dışı öğeler.">
        <div className={styles.storyGrid}>
          <Card title="İlan aksiyonları">
            <CodexMenu items={menuItems} trigger={<>{icons.more} İşlemler</>} />
          </Card>
          <Card title="Hesap menüsü">
            <CodexMenu align="end" trigger="Kurumsal hesap" items={[
              { id: 'profile', label: 'Profil ve yetkiler', description: 'Ahmet Yılmaz · Yönetici' },
              { id: 'team', label: 'Ekip üyeleri', shortcut: '⌘T' },
              { id: 'billing', label: 'Fatura ve kullanım' },
              { id: 'separator', type: 'separator' },
              { id: 'logout', label: 'Oturumu kapat' },
            ]} />
          </Card>
          <Card title="Kısıtlı durum">
            <CodexMenu disabled trigger="Yetki gerekli" items={menuItems} />
          </Card>
        </div>
      </Section>
      <Section title="Bağlamsal popover’lar" copy="Popover modal değildir; kısa, ilişkili bilgi ve küçük kararlar için kullanılır.">
        <div className={styles.storyRow}>
          <CodexPopover
            trigger="AI fiyat görüşü"
            title="Bölgesel fiyat sinyali"
            description="Son 90 gündeki 38 doğrulanmış ilan üzerinden hesaplandı."
          >
            <p className={styles.storyPrice}>8.420–9.180 TL / m²</p>
            <p className={styles.storyMeta}>İlan fiyatınız bölge medyanının %6 üzerinde. Benzer ilanların ortalama yayında kalma süresi 31 gün.</p>
          </CodexPopover>
          <CodexPopover trigger="Kaydetme seçenekleri" title="Aramayı kaydet" placement="bottom-end">
            <div className={styles.storyForm}>
              <label className={styles.storyField}>Arama adı<input className={styles.storyInput} defaultValue="Urla müstakil ev" /></label>
              <button type="button" className={styles.storyButtonPrimary} onClick={() => setSaved(true)}>{saved ? 'Kaydedildi' : 'Kaydet'}</button>
            </div>
          </CodexPopover>
        </div>
      </Section>
    </StoryPage>
  )
}

export const MenusAndPopovers: Story = { render: () => <MenuPopoverDemo /> }

function OverlayDemo() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const modalTriggerRef = useRef<HTMLButtonElement>(null)
  const drawerTriggerRef = useRef<HTMLButtonElement>(null)

  return (
    <StoryPage>
      <Section title="Modal karar pencereleri" copy="Modal yalnız kesin kullanıcı kararı gerektiren akışlarda; focus trap, Escape, backdrop ve odak iadesi ile kullanılır.">
        <div className={styles.storyRow}>
          <CodexModal
            title="İlanı yayına al"
            description="Yayın öncesi son kontrolleri doğrulayın. Bu işlem ilanı arama sonuçlarında görünür yapar."
            triggerLabel="Yayın önizlemesini aç"
            footer={<div className={styles.storyActions}><button className={styles.storyButtonSecondary} type="button">Taslakta bırak</button><button className={styles.storyButtonPrimary} type="button">Şimdi yayınla</button></div>}
          >
            <ul className={styles.storyList}>
              <li>EİDS yetki doğrulaması tamamlandı.</li>
              <li>12 fotoğraf kalite kontrolünden geçti.</li>
              <li>İletişim tercihi “mesaj ve telefon” olarak ayarlı.</li>
            </ul>
          </CodexModal>
          <button ref={modalTriggerRef} type="button" className={styles.storyButtonSecondary} onClick={() => setModalOpen(true)}>Kontrollü modalı aç</button>
          <CodexModal open={modalOpen} onOpenChange={setModalOpen} returnFocusRef={modalTriggerRef} title="AI açıklamasını uygula" description="Mevcut ilan açıklaması değiştirilecektir." footer={<button className={styles.storyButtonPrimary} type="button" onClick={() => setModalOpen(false)}>Yeni metni uygula</button>}>
            <p className={styles.storyCardCopy}>Yeni metin; konum, manzara ve ulaşım avantajlarını doğrulanabilir bilgilerle öne çıkarır. Fiyat veya yatırım getirisi vaadi eklemez.</p>
          </CodexModal>
        </div>
      </Section>
      <Section title="Drawer görev panelleri" copy="Bağlamı kaybetmeden filtreleme, karşılaştırma ve düzenleme gibi uzun yan görevleri taşır.">
        <div className={styles.storyRow}>
          <CodexDrawer
            title="Gelişmiş filtreler"
            description="128 ilan içinden ihtiyacınıza uygun sonuçları daraltın."
            triggerLabel="Filtre panelini aç"
            footer={<div className={styles.storyActions}><button className={styles.storyButtonSecondary} type="button">Temizle</button><button className={styles.storyButtonPrimary} type="button">38 ilanı göster</button></div>}
          >
            <div className={styles.storyForm}>
              <label className={styles.storyField}>Minimum fiyat<input className={styles.storyInput} inputMode="numeric" placeholder="3.000.000 TL" /></label>
              <label className={styles.storyField}>Maksimum fiyat<input className={styles.storyInput} inputMode="numeric" placeholder="8.500.000 TL" /></label>
              <label className={styles.storyField}>Minimum net m²<input className={styles.storyInput} inputMode="numeric" placeholder="120" /></label>
            </div>
          </CodexDrawer>
          <button ref={drawerTriggerRef} type="button" className={styles.storyButtonSecondary} onClick={() => setDrawerOpen(true)}>Soldan karşılaştırma aç</button>
          <CodexDrawer side="start" open={drawerOpen} onOpenChange={setDrawerOpen} returnFocusRef={drawerTriggerRef} title="İlan karşılaştırması" description="En fazla dört ilanı ortak ölçütlerle inceleyin.">
            <p className={styles.storyCardCopy}>Urla İskele, Çeşme Alaçatı ve Seferihisar Sığacık’taki üç ilan karşılaştırmaya hazır.</p>
          </CodexDrawer>
        </div>
      </Section>
    </StoryPage>
  )
}

export const ModalsAndDrawers: Story = { render: () => <OverlayDemo /> }

function ToastDemo() {
  const [undoVisible, setUndoVisible] = useState(true)
  return (
    <StoryPage>
      <Section title="Toast durum matrisi" copy="Bilgi ve başarı polite status; uyarı ve hata assertive alert olarak duyurulur. Her durum renk dışında simge ve açık metin taşır.">
        <div className={styles.storyStack}>
          <CodexToast title="3 yeni mesajınız var" tone="neutral" actionLabel="Mesajları aç" onAction={() => undefined}>İki mesaj satıcı yanıtı, biri sistem bildirimidir.</CodexToast>
          <CodexToast title="Fiyat önerisi güncellendi" tone="info" onDismiss={() => undefined}>Bölgedeki yeni satış verileri tahmin aralığına eklendi.</CodexToast>
          <CodexToast title="İlan başarıyla yayınlandı" tone="success" onDismiss={() => undefined}>1160437821 numaralı ilan arama sonuçlarında görünür.</CodexToast>
          <CodexToast title="Kimlik doğrulaması 3 gün içinde sona erecek" tone="warning" actionLabel="Şimdi yenile" onAction={() => undefined} onDismiss={() => undefined} />
          <CodexToast title="Fotoğraflar yüklenemedi" tone="danger" actionLabel="Tekrar dene" onAction={() => undefined} onDismiss={() => undefined}>Bağlantınızı kontrol edin; ilan taslağınız korundu.</CodexToast>
          <CodexToast title="İlan arşive taşındı" tone="info" visible={undoVisible} onVisibleChange={setUndoVisible} onDismiss={() => setUndoVisible(false)} actionLabel="Geri al" onAction={() => setUndoVisible(false)} dismissOnAction />
          {!undoVisible ? <button type="button" className={styles.storyButtonSecondary} onClick={() => setUndoVisible(true)}>Geri alma bildirimini göster</button> : null}
        </div>
      </Section>
    </StoryPage>
  )
}

export const Toasts: Story = { render: () => <ToastDemo /> }
