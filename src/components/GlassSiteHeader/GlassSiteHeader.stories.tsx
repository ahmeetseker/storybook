import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSiteHeader, type GlassSiteHeaderLink } from './GlassSiteHeader'
import { GlassButton } from '../GlassButton'

const links: GlassSiteHeaderLink[] = [
  { label: 'Arama', href: '#arama', active: true },
  { label: 'Ofisler', href: '#ofisler' },
  { label: 'Bölgeler', href: '#bolgeler' },
  { label: 'Blog', href: '#blog' },
]

/** Parsel-pin monogram — harf-kutusu logo kalıbı yerine özel işaret. */
const Mark = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--lg-accent)" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
    <path d="M12 21.5C12 21.5 4.5 15.4 4.5 9.8a7.5 7.5 0 0 1 15 0c0 5.6-7.5 11.7-7.5 11.7z" />
    <path d="M8.6 8.2h6.8M8.6 11.6h6.8M12 5v9.8" strokeWidth="1.2" opacity="0.85" />
  </svg>
)

const Logo = () => (
  <>
    <Mark />
    arsam.net
  </>
)

const ThemeButton = () => (
  <GlassButton size="sm" aria-label="Tema: sistem" title="Tema: sistem">
    ◐
  </GlassButton>
)

const AccountButton = () => <GlassButton size="sm">Üye girişi</GlassButton>
const CreateButton = () => (
  <GlassButton size="sm" prominent>
    İlan ver
  </GlassButton>
)

/** Scroll morfu canlı denenebilsin diye sahne uzun tutulur. */
const Stage = ({ children }: { children: ReactNode }) => (
  <div style={{ minHeight: '220vh', background: 'var(--lg-bg)' }}>
    {children}
    <div style={{ paddingTop: '30vh', textAlign: 'center', color: 'var(--lg-label-secondary)' }}>
      Kapsülün daralmasını görmek için sayfayı kaydır.
    </div>
  </div>
)

const meta = {
  title: 'Bileşenler/Navigasyon/GlassSiteHeader',
  component: GlassSiteHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    logo: <Logo />,
    links,
    utility: <ThemeButton />,
    secondaryAction: <AccountButton />,
    action: <CreateButton />,
    menuLabel: 'Menü',
    scrollThreshold: 24,
  },
  decorators: [(Story) => <Stage><Story /></Stage>],
} satisfies Meta<typeof GlassSiteHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Temel sözleşme — tepede şeffaf geniş ray. */
export const Default: Story = {}

/** Yalnız public API; hover/focus/active control DEĞİLDİR. */
export const Playground: Story = {
  argTypes: {
    menuLabel: { control: 'text' },
    scrollThreshold: { control: { type: 'number', min: 0, step: 8 } },
  },
}

/** Scroll durumları — `variant` ekseni yok, morf tek eksen (rules.md §5). */
export const ScrollDurumlari: Story = {
  args: { condensedAction: <CreateButton />, scrollThreshold: 24 },
}

/**
 * Linksiz (sade) durum — nav, hamburger ve panel render edilmez.
 * Kök `position: fixed` olduğu için tek story'de iki header gösterilmez;
 * aktif link `Default`'ta, mobil panel `Responsive`'te denetlenir.
 */
export const Durumlar: Story = {
  args: { links: [], logo: 'arsam.net' },
}

/** Uzun TR etiketleri ve uzun wordmark — taşma/sıkışma davranışı. */
export const UzunIcerik: Story = {
  args: {
    logo: 'arsam.net · Kurumsal Emlak Pazaryeri',
    links: [
      { label: 'Gelişmiş Arsa Arama', href: '#a', active: true },
      { label: 'Kurumsal Ofis Rehberi', href: '#b' },
      { label: 'Bölgesel Değerleme Raporları', href: '#c' },
      { label: 'Pazar Analizi Günlüğü', href: '#d' },
    ],
  },
}

/** Dar container → linkler hamburger'a düşer. Viewport toolbar'ıyla denenir. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

/** Kağıt teması — toolbar'daki tema seçicisiyle Grafit'e de bakılır. */
export const Temalar: Story = {
  parameters: { backgrounds: { default: 'light' } },
}

/**
 * Erişilebilirlik: hamburger `aria-expanded`/`aria-controls`, aktif link
 * `aria-current="page"`, Escape'te focus hamburger'a döner, focus halkası
 * yalnız `:focus-visible`. Panel modal DEĞİLDİR — Tab panelden çıkabilir.
 */
export const Erisilebilirlik: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
