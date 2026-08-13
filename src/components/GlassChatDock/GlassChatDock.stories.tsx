import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassChatDock, type GlassChatDockMessage, type GlassChatDockProps } from './GlassChatDock'

// Gerçek ArsaPazar emlak verisi — Kadıköy, Caddebostan'da deniz manzaralı 3+1 daire ilanı
const seedMessages: GlassChatDockMessage[] = [
  { id: 'm1', role: 'user', text: 'Bu daire kaçıncı katta ve asansör var mı?' },
  {
    id: 'm2',
    role: 'ai',
    text: 'İlan 7. katta, binada asansör mevcut. Deniz manzarası cephe bilgisiyle teyit edilmiş.',
  },
  { id: 'm3', role: 'user', text: 'Aidat ne kadar, ısınma tipi nedir?' },
  {
    id: 'm4',
    role: 'ai',
    text: 'Aylık aidat 1.850 TL olarak belirtilmiş; ısınma doğalgaz kombi. Güncel tutarı ilan sahibinden teyit etmeni öneririm.',
  },
]

function sampleAnswer(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('otopark')) return 'İlanda kapalı otopark bilgisi "var" olarak işaretlenmiş, bina girişinde 1 araçlık yer ayrılmış.'
  if (q.includes('kredi') || q.includes('kredi')) return 'İlan bankaların ekspertiz kriterlerine uygun görünüyor; kesin onay için bankanla ekspertiz talep etmen gerekir.'
  if (q.includes('okul') || q.includes('metro')) return 'En yakın metro durağı yürüyerek 8 dakika; ilçedeki anaokulu ve ilkokullar 500m içinde.'
  return 'Bu konuda ilanda net bir bilgi göremedim — ilan sahibiyle iletişime geçmeni öneririm.'
}

/** İnteraktif demo — panel kendi `open` durumunu yönetir (uncontrolled), `messages` story seviyesinde local state ile tutulur. */
function ChatDockDemo(props: Omit<GlassChatDockProps, 'messages' | 'onSend'> & { initialMessages?: GlassChatDockMessage[] }) {
  const { initialMessages, ...rest } = props
  const [messages, setMessages] = useState<GlassChatDockMessage[]>(initialMessages ?? [])

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `u-${prev.length}`, role: 'user', text },
      { id: `a-${prev.length}`, role: 'ai', text: sampleAnswer(text) },
    ])
  }

  return <GlassChatDock {...rest} messages={messages} onSend={handleSend} />
}

const meta = {
  title: 'Bileşenler/AI/GlassChatDock',
  component: GlassChatDock,
  tags: ['autodocs'],
  args: {
    onSend: fn(),
    messages: seedMessages,
  },
  argTypes: {
    title: { control: 'text' },
    placeholder: { control: 'text' },
    disclaimer: { control: 'text' },
    messages: { control: false },
    open: { control: false, description: 'Controlled kullanım — Controls yerine kod ile yönetin' },
    onOpenChange: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'İlan detay sayfasının sağ alt köşesinde sabit duran sohbet dock\'u. Kapalıyken yüzen "Soru sor" ' +
          'kapsülü, açıkken sohbet geçmişi + composer içeren panel gösterir. Modal DEĞİL: arka plan her zaman ' +
          'etkileşimli kalır, focus trap yok — yalnız Escape ve kapat butonu kapatır.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: 560, width: '100%' }}>
        <p style={{ maxWidth: 480, color: 'var(--lg-label-secondary)', fontSize: 13 }}>
          Kadıköy, Caddebostan — Deniz Manzaralı 3+1 Daire ilan sayfası (sağ altta dock).
        </p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassChatDock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  render: (args) => <ChatDockDemo {...args} initialMessages={seedMessages} defaultOpen />,
  args: {
    title: 'İlan Asistanı',
    placeholder: 'Bir soru yaz…',
    disclaimer: 'Yanıtlar yapay zekâ üretimidir, bağlayıcı değildir.',
  },
}

/** Uçtan uca akış: launcher'a tıkla, soru yaz, Enter'a bas — yerel state ile canlı sohbet demosu. */
export const Konusma: Story = {
  name: 'Konuşma',
  render: () => <ChatDockDemo initialMessages={seedMessages} />,
  parameters: {
    docs: {
      description: {
        story:
          'Kapalı başlar — "Soru sor" kapsülüne tıklayınca panel açılır, giriş alanına odak taşınır. ' +
          '"Otopark var mı?" gibi bir soru yazıp Enter\'a basarak canlı demoyu deneyebilirsin.',
      },
    },
  },
}

/** `message.pending=true` — metin yerine "yazıyor" üç nokta göstergesi (reduced-motion\'da statik "…"). */
export const Bekleme: Story = {
  name: 'Bekleme (pending)',
  args: {
    defaultOpen: true,
    messages: [
      ...seedMessages,
      { id: 'm5', role: 'user', text: 'Peki krediye uygun mu?' },
      { id: 'm6', role: 'ai', text: '', pending: true },
    ],
  },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    defaultOpen: true,
    messages: [
      {
        id: 'l1',
        role: 'user',
        text:
          'Dairenin tapu durumu, iskan belgesi, deprem yönetmeliğine uygunluğu ve son 5 yıl içindeki tadilat ' +
          'geçmişi hakkında elinizde detaylı bilgi var mı? Ayrıca bina yönetiminin son genel kurul kararlarını ' +
          've varsa ortak alan borçlarını da öğrenmek istiyorum.',
      },
      {
        id: 'l2',
        role: 'ai',
        text:
          'İlanda kat mülkiyetli tapu ve iskan belgesi mevcut olarak belirtilmiş. Deprem yönetmeliği uygunluğuna ' +
          'dair resmi bir rapor ilana eklenmemiş — bunu ilan sahibinden ayrıca talep etmeni öneririm. Tadilat ' +
          'geçmişi ve genel kurul kararları gibi detaylar bu platformda paylaşılmıyor; bu bilgileri yerinde ' +
          'görme sırasında bina yöneticisinden veya ilan sahibinden doğrudan sorman en sağlıklısı olur.',
      },
    ],
  },
}

/** `pendingLabel`/`pendingState` — bekleyen mesaj thinking-orbs durum orb'u + etiketle nefes alır; `content` — yanıta gömülü zengin içerik. */
export const DurumVeZenginIcerik: Story = {
  name: 'Durum ve Zengin İçerik',
  args: {
    defaultOpen: true,
    messages: [
      { id: 's1', role: 'user', text: 'Kadıköy tarafında 3+1 daire arıyorum.' },
      {
        id: 's2',
        role: 'ai',
        text: '2 güçlü eşleşme buldum — kartlara dokunup ilana gidebilirsiniz.',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" style={{ font: 'inherit', textAlign: 'start', padding: 8 }}>
              Caddebostan Deniz Manzaralı 3+1 — 14.500.000 TL
            </button>
            <button type="button" style={{ font: 'inherit', textAlign: 'start', padding: 8 }}>
              Fenerbahçe Yenilenmiş 3+1 — 12.900.000 TL
            </button>
          </div>
        ),
      },
      { id: 's3', role: 'user', text: 'Bu ay ne kadar harcadım?' },
      { id: 's4', role: 'ai', text: '', pending: true, pendingLabel: 'Harcamalarınız hesaplanıyor…', pendingState: 'solving' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Bekleyen mesaj `pendingLabel` + `pendingState` ile üç nokta yerine thinking-orbs durum orb\'u ve ' +
          'görünür etiket gösterir (niyete göre: searching/solving/connecting…). `content` alanı yanıt balonuna ' +
          'kart/grafik gibi zengin içerik gömer — pending sürerken çizilmez, yanıtla birlikte gelir.',
      },
    },
  },
}

/** `placeholders` — composer placeholder'ı öneri cümlelerini daktilo efektiyle sırayla yazar. */
export const DaktiloPlaceholder: Story = {
  name: 'Daktilo Placeholder',
  args: {
    defaultOpen: true,
    messages: seedMessages,
    placeholders: [
      'Bu daire krediye uygun mu?',
      'Aidat ve ısınma tipini sorun…',
      'Metroya yürüme mesafesini sorun…',
      'Tapu ve iskan durumunu sorun…',
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`placeholders` verilince composer placeholder\'ı cümleleri karakter karakter yazar, kısa bir ' +
          'beklemeden sonra sıradakine geçer (döngüsel). Kullanıcı taslak yazarken animasyon duraklar; ' +
          '`prefers-reduced-motion` tercihinde tamamen kapalıdır — ilk öneri statik gösterilir.',
      },
    },
  },
}

/** Dar/mobil viewport: panel `min()` sınırıyla kenar boşluklarını koruyarak kendiliğinden daralır (breakpoint yok). */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { defaultOpen: true, messages: seedMessages },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', minHeight: 520, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { defaultOpen: true, messages: seedMessages },
  parameters: {
    docs: {
      description: {
        story:
          'Kapalıyken gerçek `<button aria-haspopup="dialog">` ("Soru sor" accessible name kaynağı). Açık panel ' +
          '`role="dialog"` + `aria-labelledby` taşır, **`aria-modal` yok** — non-modal, focus trap yok, arka plan ' +
          'her zaman etkileşimli kalır. Mesaj listesi `role="log" aria-live="polite"` ile yeni mesajları duyurur. ' +
          '"✦ AI" rozeti `aria-label="Yapay zekâ üretimi"` taşır. Odak yalnız gerçek kullanıcı etkileşimiyle ' +
          '(launcher/kapat/Escape) taşınır — controlled modda dışarıdan `open` değişince odak çalınmaz. Escape ' +
          'kapatır ve odağı launcher butonuna geri döndürür.',
      },
    },
  },
}
