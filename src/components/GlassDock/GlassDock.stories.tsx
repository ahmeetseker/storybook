import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassDock, type GlassDockItem } from './GlassDock'

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  )
}

// ArsaPazar gezinme seti — sabit ikon sırası ve aktif rota göstergesi.
const items: GlassDockItem[] = [
  { key: 'home', label: 'Anasayfa', href: '/', icon: <Icon d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" /> },
  { key: 'search', label: 'Arama', href: '/arsa', icon: <Icon d="M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm10.5 18-4.8-4.8" /> },
  { key: 'offices', label: 'Ofisler', href: '/ofisler', icon: <Icon d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16M9 7h2m-2 4h2m-2 4h2" /> },
  { key: 'regions', label: 'Bölgeler', href: '/bolgeler', icon: <Icon d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /> },
  { key: 'compare', label: 'Compare', href: '/karsilastirma', active: true, icon: <Icon d="M7 4v10m0 0-3-3m3 3 3-3m7 9V7m0 0-3 3m3-3 3 3" /> },
  { key: 'favs', label: 'Favoriler', icon: <Icon d="M12 20.5s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 5.7-8 11-8 11Z" /> },
  { key: 'blog', label: 'Blog', icon: <Icon d="M12 5.5C10.5 4 8.5 3.5 6 3.5v14c2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2v-14c-2.5 0-4.5.5-6 2Zm0 0v14" /> },
  { key: 'list', label: 'İlan Ver', icon: <Icon d="M12 5v14m-7-7h14" /> },
  { key: 'account', label: 'Hesabım', icon: <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" /> },
  { key: 'messages', label: 'Mesajlar', icon: <Icon d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z" /> },
]

const meta = {
  title: 'Bileşenler/Navigasyon/GlassDock',
  component: GlassDock,
  tags: ['autodocs'],
  args: {
    items,
    behavior: 'fixed',
    onRoute: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    items: { control: false },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    behavior: { control: 'inline-radio', options: ['fixed', 'morph'] },
    label: { control: 'text' },
    open: {
      control: false,
      description: 'Yalnız behavior="morph": controlled kullanım',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Yalnız behavior="morph": uncontrolled başlangıç',
    },
    onOpenChange: {
      control: false,
      description: 'Yalnız behavior="morph": açma/kapama isteği',
    },
    onRoute: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Varsayılan `fixed` davranışında doğrudan render edilen, sürekli açık LiquidDock gezinmesi. ' +
          'public-site referansındaki 180px imleç etki alanı, kosinüs eğrili 1×→1.5× büyütme, yeniden akan ' +
          'öğe merkezleri, hover tooltip\'i ve hareketli edge lens birebir korunur. Dış yüzey Header ile aynı ' +
          'blur/saturation değerini kullanır; iç lens daha güçlü cam tint taşır. `behavior="morph"` legacy ' +
          'peek↔dock aç/kapa akışını korur. `href` ' +
          'gerçek bağlantı üretir; `onRoute` aynı-origin SPA geçişini yakalar.',
      },
    },
  },
  decorators: [
    (Story, context) => (
      <div style={{ position: 'relative', minHeight: 420, width: '100%' }}>
        <p style={{ maxWidth: 480, color: 'var(--lg-label-secondary)', fontSize: 13 }}>
          {context.args.behavior === 'morph'
            ? 'Sayfa içeriği — legacy peek hover veya aktivasyonla LiquidDock rayına açılır.'
            : 'Sayfa içeriği — fixed dock alt-ortada (dikeyde sağ-ortada) sürekli açıktır.'}
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassDock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: { behavior: 'fixed', label: 'Gezinme' },
}

/** public-site LiquidDock büyütmesini ve Header ile eş dış cam malzemeyi gösterir. */
export const HoverVeHeaderMalzemesi: Story = {
  name: 'Hover ve Header Malzemesi',
  parameters: {
    docs: {
      description: {
        story:
          'İmleci Arama öğesinin üzerine getir. Öğeler referanstaki kosinüs eğrisiyle en fazla 1.5× büyür, ' +
          'komşular yeniden konumlanır ve edge lens Arama öğesine taşınır. Dış cam yüzey Header ile aynı ' +
          '`blur(14px) saturate(180%)`; edge lens `blur(6px) saturate(180%)` kullanır.',
      },
    },
  },
}

/** Geriye uyumluluk için korunan Dynamic Island peek↔dock aç/kapa davranışı. */
export const LegacyMorph: Story = {
  name: 'Legacy Morph',
  args: { behavior: 'morph' },
  parameters: {
    docs: {
      description: {
        story:
          'Kapalı peek hapı hover/tıklama ile LiquidDock ikon rayına morph eder. ' +
          'Grup etiketleri render edilmez; açılan ray aynı LiquidDock büyütmesini kullanır.',
      },
    },
  },
}

export const Dikey: Story = {
  name: 'Dikey yönelim',
  args: { orientation: 'vertical' },
}

/** Uzun TR etiketler tooltip chip'inde tek satırda kalır; büyütülen ray içerik güdümlü genişler. */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    items: [
      ...items.slice(0, 6),
      { key: 'valuation', label: 'Değerleme Raporlarım', icon: <Icon d="M4 19V5m0 14h16M8 15l3-4 3 2 4-6" /> },
      { key: 'saved', label: 'Kaydedilmiş Aramalarım', icon: <Icon d="M6 4h12v16l-6-4-6 4V4Z" /> },
    ],
  },
}

/**
 * Dar viewport'ta ray safe-area içinde yatay kayar. Gerçek coarse-pointer
 * büyütme kilidi ve ≥44px dokunma hedefi E2E mobil senaryosunda doğrulanır.
 */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: 380, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  parameters: {
    docs: {
      description: {
        story:
          'Varsayılan fixed davranış doğrudan `<nav aria-label data-behavior="fixed">` render eder ve Escape, ' +
          'dışarı tıklama ya da seçimle kapanmaz. Her öğe `aria-label`\'lı gerçek bağlantı/butondur; aktif öğe ' +
          '`aria-current="page"` taşır. Tooltip `aria-hidden` görsel süstür. Legacy Morph story\'sinde peek ' +
          'butonu, ilk öğeye odak taşıma ve Escape ile peek\'e odak iadesi ayrıca doğrulanabilir.',
      },
    },
  },
}
