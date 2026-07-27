import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassCommandPalette, type GlassCommandPaletteCommand, type GlassCommandPaletteProps } from './GlassCommandPalette'

// Gerçek ArsaPazar emlak verisi — ilan gezinmesi + sayfa kısayolları + hesap işlemleri
const baseCommands: GlassCommandPaletteCommand[] = [
  {
    id: 'ilan-karsiyaka',
    label: 'İzmir Karşıyaka 3+1 Deniz Manzaralı Daire',
    hint: '4.250.000 TL',
    group: 'İlanlar',
    onSelect: fn(),
  },
  {
    id: 'ilan-cankaya',
    label: 'Ankara Çankaya Bahçeli Villa',
    hint: '9.900.000 TL',
    group: 'İlanlar',
    onSelect: fn(),
  },
  {
    id: 'ilan-caddebostan',
    label: 'Kadıköy Caddebostan 2+1 Asansörlü Daire',
    hint: '6.100.000 TL',
    group: 'İlanlar',
    onSelect: fn(),
  },
  {
    id: 'sayfa-favoriler',
    label: 'Favorilerim',
    hint: '⌘F',
    group: 'Sayfalar',
    onSelect: fn(),
  },
  {
    id: 'sayfa-karsilastir',
    label: 'İlan Karşılaştır',
    group: 'Sayfalar',
    onSelect: fn(),
  },
  {
    id: 'sayfa-mesajlar',
    label: 'Mesajlarım',
    hint: '⌘M',
    group: 'Sayfalar',
    onSelect: fn(),
  },
  {
    id: 'hesap-ilan-ver',
    label: 'Yeni İlan Ver',
    group: 'Hesap',
    onSelect: fn(),
  },
  {
    id: 'hesap-ayarlar',
    label: 'Hesap Ayarları',
    group: 'Hesap',
    onSelect: fn(),
  },
  {
    id: 'genel-yardim',
    label: 'Yardım Merkezi',
    onSelect: fn(),
  },
]

/**
 * İnteraktif demo — palet kendi `open` durumunu üstlenmez (spec: controlled
 * zorunlu), story seviyesinde `useState` ile yönetilir. Tetikleyici buton +
 * `⌘K`/`Ctrl+K` kısayolu, gerçek entegrasyonu (çağıranın kendi dinleyicisini
 * kurması gerektiğini) gösterir.
 */
function CommandPaletteDemo(props: Omit<GlassCommandPaletteProps, 'open' | 'onClose'>) {
  const [open, setOpen] = useState(false)
  const [lastSelection, setLastSelection] = useState<string | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const commands = (props.commands ?? baseCommands).map((c) => ({
    ...c,
    onSelect: () => setLastSelection(c.label),
  }))

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          height: 40,
          padding: '0 16px',
          borderRadius: 999,
          border: '1px solid var(--lg-hairline)',
          background: 'var(--lg-surface)',
          color: 'var(--lg-label)',
          font: 'inherit',
          cursor: 'pointer',
        }}
      >
        Komut paletini aç <kbd style={{ marginLeft: 8, opacity: 0.6 }}>⌘K</kbd>
      </button>
      {lastSelection ? (
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--lg-label-secondary)' }}>
          Son seçim: <strong style={{ color: 'var(--lg-label)' }}>{lastSelection}</strong>
        </p>
      ) : null}
      <GlassCommandPalette {...props} commands={commands} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

const meta = {
  title: 'Bileşenler/Navigasyon/GlassCommandPalette',
  component: GlassCommandPalette,
  tags: ['autodocs'],
  args: {
    open: true,
    onClose: fn(),
    commands: baseCommands,
    placeholder: 'Komut ara…',
    emptyText: 'Sonuç bulunamadı.',
  },
  argTypes: {
    open: { control: false, description: 'Controlled — ZORUNLU, uncontrolled kullanım yok' },
    onClose: { control: false },
    commands: { control: false },
    placeholder: { control: 'text' },
    emptyText: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Sayfa geneli komut paleti (⌘K). `GlassModal` KULLANILMAZ — kendi hafif overlay\'ini kurar: portal yok ' +
          '(sayfa içi `position: fixed`), backdrop tıklaması ve Escape kapatır, focus trap yok. `open` controlled ' +
          'zorunludur; çağıran kendi ⌘K kısayol dinleyicisini kurar (aşağıdaki Playground demosu gibi).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: 420, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassCommandPalette>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  render: (args) => (
    <CommandPaletteDemo commands={args.commands} placeholder={args.placeholder} emptyText={args.emptyText} />
  ),
}

/** Filtre sonucu boşken `emptyText` gösterilir — sonuç bulunmayan bir sorguyla eşleşen komut kümesi burada boş verilmiştir. */
export const BosSonuc: Story = {
  name: 'Boş Sonuç',
  args: {
    commands: [],
    emptyText: 'Eşleşen komut bulunamadı. Farklı bir arama deneyin.',
  },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    commands: [
      ...baseCommands,
      {
        id: 'ilan-uzun',
        label:
          'Muğla Bodrum Yalıkavak Deniz Sıfırı, Havuzlu, Akıllı Ev Sistemli, Geniş Bahçeli Lüks Müstakil Villa',
        hint: '18.750.000 TL',
        group: 'İlanlar',
        onSelect: fn(),
      },
      {
        id: 'sayfa-uzun',
        label: 'Kredi Hesaplama ve Ekspertiz Randevu Takip Sayfası',
        group: 'Sayfalar',
        onSelect: fn(),
      },
    ],
  },
}

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  render: (args) => (
    <CommandPaletteDemo commands={args.commands} placeholder={args.placeholder} emptyText={args.emptyText} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Panel `role="dialog"` + sabit `aria-label="Komut paleti"` taşır — **`aria-modal` yok**, focus trap yok. ' +
          'Arama input\'unun accessible name\'i sabit "Komut ara" (placeholder yalnız görsel). Grup başlıkları ' +
          '`heading` DEĞİL — `role="group"` + `aria-labelledby` ile bağlı `<p>`. Klavye gezinmesi `role="option"`/' +
          '`aria-activedescendant` KULLANMAZ: gerçek `<button>` listesi, `ArrowUp`/`ArrowDown` aktif işaretçiyi ' +
          '(görsel vurgu) taşır, `Enter` seçer; her buton ayrıca `Tab` ile tek tek de erişilebilir/etkinleştirilebilir. ' +
          'Sonuç sayısı her zaman mount edilmiş `role="status"` bölgesiyle duyurulur. `Escape` yalnız palet ' +
          'içindeyken kapatır (kapsayıcı-scoped, `document` geneli değil), kapanışta tetikleyiciye odak dönüşü ' +
          'çağıranın sorumluluğundadır.',
      },
    },
  },
}
