import { useState, type CSSProperties, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { GlassSidebar } from './GlassSidebar'

type IconName = 'home' | 'search' | 'radio' | 'clock' | 'album' | 'person' | 'heart' | 'message' | 'settings'

const iconPaths: Record<IconName, string> = {
  home: 'M2.5 7.3 8 2.6l5.5 4.7v6.1H9.8V9.6H6.2v3.8H2.5V7.3Z',
  search: 'm11.6 11.6 2.8 2.8 M7.2 12.2a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z',
  radio: 'M8 9.7a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z M4.5 4.6a4.8 4.8 0 0 0 0 6.8 M11.5 4.6a4.8 4.8 0 0 1 0 6.8 M2.2 2.4a8 8 0 0 0 0 11.2 M13.8 2.4a8 8 0 0 1 0 11.2',
  clock: 'M8 2.2a5.8 5.8 0 1 0 0 11.6A5.8 5.8 0 0 0 8 2.2Z M8 4.8v3.5l2.4 1.4',
  album: 'M3 2.5h10v11H3z M5.5 5.2h5 M5.5 7.6h5 M5.5 10h3.2',
  person: 'M8 8a2.7 2.7 0 1 0 0-5.4A2.7 2.7 0 0 0 8 8Z M2.8 13.5c.7-2.3 2.5-3.4 5.2-3.4s4.5 1.1 5.2 3.4',
  heart: 'M8 13.4 2.8 8.5A3.4 3.4 0 0 1 7.6 3.7L8 4l.4-.3a3.4 3.4 0 0 1 4.8 4.8L8 13.4Z',
  message: 'M2.5 3h11v7.8h-6l-3.6 2.7v-2.7H2.5V3Z',
  settings: 'M8 5.6A2.4 2.4 0 1 0 8 10.4 2.4 2.4 0 0 0 8 5.6Z M8 1.8v1.3 M8 12.9v1.3 M14.2 8h-1.3 M3.1 8H1.8 M12.4 3.6l-.9.9 M4.5 11.5l-.9.9 M12.4 12.4l-.9-.9 M4.5 4.5l-.9-.9',
}

function NavIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  )
}

const stage: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 28,
  flexWrap: 'wrap',
  maxWidth: 980,
  margin: '0 auto',
}

function StoryNote({ children }: { children: ReactNode }) {
  return (
    <p style={{ maxWidth: 320, margin: '0 0 12px', color: 'var(--lg-label-secondary)', fontSize: 13, lineHeight: 1.55 }}>
      {children}
    </p>
  )
}

function MusicSidebar({ selected = 'recent', onSelect = fn(), tone = 'light' }: { selected?: string; onSelect?: (id: string) => void; tone?: 'light' | 'dark' | 'auto' }) {
  return (
    <GlassSidebar selected={selected} onSelect={onSelect} tone={tone} aria-label="Müzik bölümleri">
      <GlassSidebar.Header title="Müzik" subtitle="Deniz'in Kitaplığı" />
      <GlassSidebar.Item id="home" icon={<NavIcon name="home" />}>Şimdi Dinle</GlassSidebar.Item>
      <GlassSidebar.Item id="browse" icon={<NavIcon name="search" />}>Göz At</GlassSidebar.Item>
      <GlassSidebar.Item id="radio" icon={<NavIcon name="radio" />}>Radyo</GlassSidebar.Item>
      <GlassSidebar.Group label="Kitaplık">
        <GlassSidebar.Item id="recent">Son Eklenenler</GlassSidebar.Item>
        <GlassSidebar.Item id="artists">Sanatçılar</GlassSidebar.Item>
        <GlassSidebar.Item id="albums">Albümler</GlassSidebar.Item>
        <GlassSidebar.Item id="songs">Parçalar</GlassSidebar.Item>
      </GlassSidebar.Group>
    </GlassSidebar>
  )
}

function AccountSidebar({ selected, onSelect, tone = 'auto', defaultOpen = true }: { selected?: string; onSelect?: (id: string) => void; tone?: 'light' | 'dark' | 'auto'; defaultOpen?: boolean }) {
  return (
    <GlassSidebar selected={selected} onSelect={onSelect} tone={tone} aria-label="Hesap bölümleri">
      <GlassSidebar.Header title="Hesabım" subtitle="Mehmet Yılmaz" />
      <GlassSidebar.Item id="summary" icon={<NavIcon name="home" />}>Hesap Özeti</GlassSidebar.Item>
      <GlassSidebar.Item id="listings" icon={<NavIcon name="album" />}>İlanlarım</GlassSidebar.Item>
      <GlassSidebar.Item id="messages" icon={<NavIcon name="message" />}>Mesajlar</GlassSidebar.Item>
      <GlassSidebar.Group label="Koleksiyonlar" defaultOpen={defaultOpen}>
        <GlassSidebar.Item id="saved">Kaydettiklerim</GlassSidebar.Item>
        <GlassSidebar.Item id="alerts">Arama Alarmları</GlassSidebar.Item>
      </GlassSidebar.Group>
      <GlassSidebar.Group label="Hesap" defaultOpen={defaultOpen}>
        <GlassSidebar.Item id="profile">Profil ve Ayarlar</GlassSidebar.Item>
        <GlassSidebar.Item id="verification">Kurumsal Doğrulama</GlassSidebar.Item>
      </GlassSidebar.Group>
    </GlassSidebar>
  )
}

function ControlledSidebarDemo() {
  const [selected, setSelected] = useState('summary')
  const labels: Record<string, string> = {
    summary: 'Hesap Özeti',
    listings: 'İlanlarım',
    messages: 'Mesajlar',
    saved: 'Kaydettiklerim',
    alerts: 'Arama Alarmları',
    profile: 'Profil ve Ayarlar',
    verification: 'Kurumsal Doğrulama',
  }

  return (
    <div style={{ ...stage, alignItems: 'stretch' }}>
      <AccountSidebar selected={selected} onSelect={setSelected} />
      <section aria-live="polite" style={{ maxWidth: 360, padding: '12px 4px' }}>
        <StoryNote>Seçim state'i Sidebar içinde tutulmaz; ürün kabuğu seçili kimliği yönetir.</StoryNote>
        <h2 style={{ margin: '20px 0 8px', fontSize: 22, letterSpacing: '-0.02em' }}>{labels[selected]}</h2>
        <p style={{ maxWidth: 52 * 8, margin: 0, color: 'var(--lg-label-secondary)', lineHeight: 1.65 }}>
          Bir öğe seçildiğinde içerik bölgesi güncellenir ve aktif navigasyon öğesi
          <code style={{ marginLeft: 5, fontSize: '0.9em' }}>aria-current=&quot;page&quot;</code> alır.
        </p>
      </section>
    </div>
  )
}

const meta = {
  title: 'Bileşenler/Navigasyon/GlassSidebar',
  component: GlassSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    selected: 'recent',
    tone: 'light',
    'aria-label': 'Müzik bölümleri',
    onSelect: fn(),
    children: null,
  },
  argTypes: {
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
    selected: { control: 'text' },
    'aria-label': { control: 'text' },
    onSelect: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof GlassSidebar>

export default meta
type Story = StoryObj<typeof meta>

/** Varsayılan kullanım: tekil öğeler, bir disclosure grubu ve controlled seçim işareti. */
export const Default: Story = {
  render: (args) => (
    <div style={stage}>
      <MusicSidebar selected={args.selected} onSelect={args.onSelect} tone={args.tone} />
    </div>
  ),
}

/** Controlled seçim: ebeveyn state'i içerik bölgesi ve aria-current değerini birlikte günceller. */
export const Controlled: Story = {
  render: () => <ControlledSidebarDemo />,
}

/** Birden fazla disclosure grubu; ikinci grup başlangıçta kapalıdır ve gruplar iç içe geçmez. */
export const Groups: Story = {
  render: () => (
    <div style={stage}>
      <GlassSidebar selected="saved" onSelect={fn()} aria-label="Gruplu hesap navigasyonu">
        <GlassSidebar.Header title="Çalışma Alanı" subtitle="Emlak ekibi" />
        <GlassSidebar.Item id="overview" icon={<NavIcon name="home" />}>Genel Bakış</GlassSidebar.Item>
        <GlassSidebar.Group label="Portföy">
          <GlassSidebar.Item id="saved">Kaydedilen İlanlar</GlassSidebar.Item>
          <GlassSidebar.Item id="drafts">Taslaklar</GlassSidebar.Item>
          <GlassSidebar.Item id="archived">Arşivlenenler</GlassSidebar.Item>
        </GlassSidebar.Group>
        <GlassSidebar.Group label="Ekip" defaultOpen={false}>
          <GlassSidebar.Item id="members">Üyeler</GlassSidebar.Item>
          <GlassSidebar.Item id="permissions">Yetkiler</GlassSidebar.Item>
        </GlassSidebar.Group>
      </GlassSidebar>
    </div>
  ),
}

/** State karşılaştırması: seçili/açık yapı ile seçimsiz/kapalı yapı yan yana. */
export const States: Story = {
  render: () => (
    <div style={stage}>
      <div>
        <StoryNote>Seçili öğe ve açık disclosure grupları</StoryNote>
        <AccountSidebar selected="messages" onSelect={fn()} tone="light" />
      </div>
      <div>
        <StoryNote>Seçimsiz başlangıç ve kapalı disclosure grupları</StoryNote>
        <AccountSidebar onSelect={fn()} tone="dark" defaultOpen={false} />
      </div>
    </div>
  ),
}

/** 300px sabit genişlik dar ürün kabuğunda korunur; dikey kaydırmayı yerleşim slotu sağlar. */
export const Responsive: Story = {
  globals: { viewport: 'mobile1' },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: 300, maxWidth: '100%', maxHeight: 460, overflow: 'auto', margin: '0 auto' }}>
      <AccountSidebar selected="saved" onSelect={fn()} />
    </div>
  ),
}

/** Semantik sözleşme: adlandırılmış nav, aria-current ve aria-expanded/controls davranışı. */
export const Erisilebilirlik: Story = {
  render: () => (
    <div style={stage}>
      <GlassSidebar selected="listings" onSelect={fn()} aria-label="Hesap bölümleri">
        <GlassSidebar.Header title="Hesabım" subtitle="Klavye ile gezilebilir" />
        <GlassSidebar.Item id="summary" icon={<NavIcon name="home" />}>Hesap Özeti</GlassSidebar.Item>
        <GlassSidebar.Item id="listings" icon={<NavIcon name="album" />}>İlanlarım</GlassSidebar.Item>
        <GlassSidebar.Group label="Koleksiyonlar">
          <GlassSidebar.Item id="saved">Kaydettiklerim</GlassSidebar.Item>
          <GlassSidebar.Item id="alerts">Arama Alarmları</GlassSidebar.Item>
        </GlassSidebar.Group>
      </GlassSidebar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByRole('navigation', { name: 'Hesap bölümleri' })
    const current = within(nav).getByRole('button', { name: 'İlanlarım' })
    const group = within(nav).getByRole('button', { name: 'Koleksiyonlar' })

    await expect(current).toHaveAttribute('aria-current', 'page')
    await expect(group).toHaveAttribute('aria-expanded', 'true')
    await expect(group).toHaveAttribute('aria-controls')

    current.focus()
    await expect(current).toHaveFocus()
    await userEvent.click(group)
    await expect(group).toHaveAttribute('aria-expanded', 'false')
    await expect(within(nav).queryByRole('button', { name: 'Kaydettiklerim' })).not.toBeInTheDocument()
  },
}
