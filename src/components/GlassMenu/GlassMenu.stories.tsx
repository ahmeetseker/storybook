import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassMenu, GlassMenuItem, GlassMenuSeparator } from './GlassMenu'
import { GlassButton } from '../GlassButton'
import { GlassIconButton } from '../GlassIconButton'

/* Menü ikonları: emoji yerine tek renkli çizgi SVG (currentColor) */
const ikon = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)
const IkonKalem = ikon('m11.5 2 2.5 2.5-8.5 8.5-3.2.7.7-3.2L11.5 2Z')
const IkonYildiz = ikon('M8 1.8 9.9 5.7l4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.8Z')
const IkonBaglanti = ikon('M6.5 9.5 9.5 6.5 M5 11 3.5 12.5a2.1 2.1 0 0 1-3-3L4 6a2.1 2.1 0 0 1 3 0 M11 5l1.5-1.5a2.1 2.1 0 0 1 3 3L12 10a2.1 2.1 0 0 1-3 0')
const IkonCop = ikon('M2.5 4h11 M5.5 4V2.5h5V4 M4 4l.7 10h6.6L12 4 M6.5 7v4 M9.5 7v4')

const meta = {
  title: 'Bileşenler/Navigasyon/GlassMenu',
  component: GlassMenu,
  tags: ['autodocs'],
  args: {
    trigger: <GlassButton>İlan İşlemleri</GlassButton>,
    children: null,
  },
  argTypes: {
    placement: { control: 'select', options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
    trigger: { control: false },
    children: { control: false },
  },
  // Panel absolute konumlandığı için story'lere nefes alanı
  decorators: [(Story) => <div style={{ minHeight: 260, padding: 16 }}>{Story()}</div>],
} satisfies Meta<typeof GlassMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <GlassMenu {...args}>
      <GlassMenuItem onSelect={fn()}>İlanı Düzenle</GlassMenuItem>
      <GlassMenuItem onSelect={fn()}>Öne Çıkar</GlassMenuItem>
      <GlassMenuItem onSelect={fn()}>Fiyatı Güncelle</GlassMenuItem>
      <GlassMenuSeparator />
      <GlassMenuItem destructive onSelect={fn()}>
        İlanı Sil
      </GlassMenuItem>
    </GlassMenu>
  ),
}

/** İkonlu öğeler + ikon buton tetikleyici (ilan kartı sağ üst "…" menüsü). */
export const IkonluOgeler: Story = {
  args: { trigger: <GlassIconButton label="Diğer işlemler">⋯</GlassIconButton>, placement: 'bottom-end' },
  render: (args) => (
    <GlassMenu {...args}>
      <GlassMenuItem icon={IkonKalem} onSelect={fn()}>
        Düzenle
      </GlassMenuItem>
      <GlassMenuItem icon={IkonYildiz} onSelect={fn()}>
        Favorilere Ekle
      </GlassMenuItem>
      <GlassMenuItem icon={IkonBaglanti} onSelect={fn()}>
        Bağlantıyı Kopyala
      </GlassMenuItem>
      <GlassMenuSeparator />
      <GlassMenuItem icon={IkonCop} destructive onSelect={fn()}>
        Kaldır
      </GlassMenuItem>
    </GlassMenu>
  ),
}

/** Konum matrisi — panel tetikleyiciye göre 4 köşeden açılır. */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 120, padding: '120px 40px' }}>
      {(['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const).map((p) => (
        <GlassMenu key={p} placement={p} trigger={<GlassButton size="sm">{p}</GlassButton>}>
          <GlassMenuItem onSelect={fn()}>Satıcıyı Ara</GlassMenuItem>
          <GlassMenuItem onSelect={fn()}>Mesaj Gönder</GlassMenuItem>
        </GlassMenu>
      ))}
    </div>
  ),
}

/** Devre dışı öğe: tıklanamaz, ok gezintisi atlar. */
export const DisabledItem: Story = {
  render: (args) => (
    <GlassMenu {...args}>
      <GlassMenuItem onSelect={fn()}>Mesaj Gönder</GlassMenuItem>
      <GlassMenuItem disabled onSelect={fn()}>
        Teklif Ver (kapalı ilan)
      </GlassMenuItem>
      <GlassMenuItem onSelect={fn()}>Satıcının Diğer İlanları</GlassMenuItem>
    </GlassMenu>
  ),
}

/**
 * Responsive: bp-sm altında panel min-width %60vw — dokunma hedefleri geniş.
 * Bu story mobil viewport'ta açılır.
 */
export const MobilPanel: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <GlassMenu {...args}>
      <GlassMenuItem onSelect={fn()}>İlanı Düzenle</GlassMenuItem>
      <GlassMenuItem onSelect={fn()}>Öne Çıkar</GlassMenuItem>
      <GlassMenuSeparator />
      <GlassMenuItem destructive onSelect={fn()}>
        İlanı Sil
      </GlassMenuItem>
    </GlassMenu>
  ),
}
