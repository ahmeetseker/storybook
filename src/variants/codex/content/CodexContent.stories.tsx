import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexButton } from '../controls'
import {
  CodexEmptyState,
  CodexHeader,
  CodexListingCard,
  CodexNotice,
  CodexStat,
  CodexSurface,
} from './CodexContent'

const meta = {
  title: 'Codex Enterprise/05 İçerik ve Pazar Yeri/00 Temel Kalıplar',
  component: CodexListingCard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
} satisfies Meta<typeof CodexListingCard>

export default meta
type Story = StoryObj<typeof meta>

const cardArgs = {
  title: 'Denize yakın, imarlı köşe parsel',
  price: '4.250.000 TL',
  location: 'İzmir, Urla',
  meta: '512 m² · 8.301 TL/m² · Müstakil tapu',
  badge: 'EİDS doğrulandı',
  badgeTone: 'success' as const,
  mediaTone: 'forest' as const,
}

export const ListingPlayground: Story = {
  args: cardArgs,
}

export const ListingVariants: Story = {
  args: cardArgs,
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <CodexListingCard {...cardArgs} variant="featured" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <CodexListingCard {...cardArgs} />
        <CodexListingCard
          {...cardArgs}
          title="Yol cepheli yatırımlık tarla"
          price="1.850.000 TL"
          location="Ankara, Gölbaşı"
          meta="1.240 m² · 1.492 TL/m² · Hisseli tapu"
          badge="Yeni"
          badgeTone="accent"
          mediaTone="earth"
        />
      </div>
      <CodexListingCard {...cardArgs} variant="row" />
    </div>
  ),
}

export const SurfaceHierarchy: Story = {
  args: cardArgs,
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
      <CodexSurface treatment="outlined"><strong>Outlined</strong><p>Hairline kullanır; dekoratif gölge kullanmaz.</p></CodexSurface>
      <CodexSurface treatment="tonal"><strong>Tonal</strong><p>İkinci nötr katmanla ayrılır; border gerekmez.</p></CodexSurface>
      <CodexSurface treatment="elevated"><strong>Elevated</strong><p>Yalnız yükselti anlamlıysa kısa gölge kullanır.</p></CodexSurface>
      <CodexSurface treatment="glass"><strong>Chrome glass</strong><p>Yalnız navigasyon veya geçici kontrol katmanı.</p></CodexSurface>
    </div>
  ),
}

export const FeedbackStates: Story = {
  args: cardArgs,
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <CodexNotice title="İlan verileri güncellendi" tone="success">Tapu ve imar bilgileri EİDS kaydıyla eşleşti.</CodexNotice>
      <CodexNotice title="Emsal sayısı düşük" tone="warning">Bu bölgede son 30 güne ait yalnız 6 doğrulanmış satış var.</CodexNotice>
      <CodexNotice title="Doğrulama tamamlanamadı" tone="danger" action={<CodexButton variant="quiet" size="sm">Yeniden dene</CodexButton>}>Bağlantıyı kontrol edip tekrar deneyin.</CodexNotice>
      <CodexNotice title="Aramanızdan 4 filtre çıkardık" tone="info">Konum, bütçe, imar ve alan sonuçlara uygulandı.</CodexNotice>
    </div>
  ),
}

export const DataRhythm: Story = {
  args: cardArgs,
  render: () => (
    <CodexSurface treatment="tonal" style={{ maxWidth: 440 }}>
      <CodexStat label="Ortanca m² fiyatı" value="7.840 TL" change="%4,2" direction="up" />
      <CodexStat label="Yeni ilan" value="18" change="7 günde" />
      <CodexStat label="Satış süresi" value="46 gün" change="−8 gün" direction="up" />
      <CodexStat label="Toplam arz" value="1.284" change="%1,4" direction="down" />
    </CodexSurface>
  ),
}

export const NavigationPattern: Story = {
  args: cardArgs,
  parameters: { codex: { fullCanvas: true } },
  render: () => (
    <CodexHeader
      links={[
        { label: 'Ara', href: '/ara', active: true },
        { label: 'Harita', href: '/harita' },
        { label: 'Değerleme', href: '/degerleme' },
        { label: 'Rehber', href: '/rehber' },
      ]}
      actions={<><CodexButton variant="quiet" size="sm">Giriş</CodexButton><CodexButton size="sm">İlan ver</CodexButton></>}
    />
  ),
}

const SearchEmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m16 16 4.5 4.5M8 10.5h5" />
  </svg>
)

export const EmptyState: Story = {
  args: cardArgs,
  render: () => (
    <CodexSurface treatment="outlined" padding="none">
      <CodexEmptyState
        icon={<SearchEmptyIcon />}
        title="Bu ölçütlerde ilan yok"
        description="Bütçe üst sınırını yükseltin veya yakın ilçeleri aramaya ekleyin. Kayıtlı aramanız yeni ilan geldiğinde sizi bilgilendirebilir."
        action={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}><CodexButton>Aramayı genişlet</CodexButton><CodexButton variant="secondary">Alarm kur</CodexButton></div>}
      />
    </CodexSurface>
  ),
}
