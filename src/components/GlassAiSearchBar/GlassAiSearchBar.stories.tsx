import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassAiSearchBar, type GlassAiSearchBarFilter } from './GlassAiSearchBar'

const meta = {
  title: 'Components/GlassAiSearchBar',
  component: GlassAiSearchBar,
  tags: ['autodocs'],
  args: {
    onSubmit: fn(),
    placeholder: 'Örn. "Urla\'da deniz manzaralı 3+1 daire"',
  },
  argTypes: {
    onSubmit: { control: false },
    onValueChange: { control: false },
    onRemoveFilter: { control: false },
    onFeedback: { control: false },
    parsedFilters: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Konuşmalı/doğal dil arama çubuğu — kapsül ray (düz yüzey + hairline) içinde serbest metin ' +
          'girişi ve gönder butonu; odaklanınca altında öneri listesi (düz buton dizisi, listbox değil), ' +
          'gönderim sonrası AI\'nin sorgudan çıkardığı kaldırılabilir filtre chip\'leri görünür.',
      },
    },
  },
} satisfies Meta<typeof GlassAiSearchBar>

export default meta
type Story = StoryObj<typeof meta>

const SUGGESTIONS = [
  'Urla\'da deniz manzaralı 3+1 villa',
  'Karşıyaka\'da metroya yakın 2+1 daire',
  'Bornova\'da öğrenciye uygun eşyalı 1+1',
  'Çeşme\'de bahçeli müstakil yazlık',
]

const PARSED_FILTERS: GlassAiSearchBarFilter[] = [
  { id: 'konum', label: 'Konum', value: 'İzmir, Urla' },
  { id: 'oda', label: 'Oda Sayısı', value: '3+1' },
  { id: 'ozellik', label: 'Özellik', value: 'Deniz manzaralı' },
]

export const Default: Story = {
  args: { defaultValue: '' },
}

export const Playground: Story = {
  args: {
    defaultValue: 'Urla\'da deniz manzaralı 3+1 daire',
    suggestions: SUGGESTIONS,
    parsedFilters: PARSED_FILTERS,
    confidence: 87,
    onFeedback: fn(),
    onRemoveFilter: fn(),
  },
}

/** Odaklanınca öneri listesi input altında görünür — basit buton dizisi, tıklanınca sorgu gönderilir. */
export const OneriListesi: Story = {
  name: 'Öneri Listesi',
  args: { suggestions: SUGGESTIONS },
  parameters: {
    docs: {
      description: {
        story:
          'Input odaklanınca altında görünür; her öneri düz `<button>` (listbox/combobox deseni ' +
          'kullanılmaz). Tıklanınca değer o öneriye eşitlenir ve `onSubmit` doğrudan çağrılır.',
      },
    },
  },
}

/** Gönderim sonrası AI'nin sorgudan çıkardığı filtreler input altında rozetli başlık + kaldırılabilir chip'lerle görünür. */
export const AICikarilanFiltreler: Story = {
  name: 'AI Çıkarılan Filtreler',
  args: {
    defaultValue: 'Urla\'da deniz manzaralı 3+1 daire',
    parsedFilters: PARSED_FILTERS,
    confidence: 92,
    onRemoveFilter: fn(),
    onFeedback: fn(),
  },
}

/** Güven skoru verilmezse rozet yalnız "✦ AI" gösterir; geri bildirim callback'i yoksa 👍/👎 butonları da görünmez. */
export const GuvenVeGeriBildirimYok: Story = {
  name: 'Güven / Geri Bildirim Yok',
  args: {
    defaultValue: 'Bornova 1+1 kiralık',
    parsedFilters: [{ id: 'konum', label: 'Konum', value: 'İzmir, Bornova' }],
  },
}

function ControlledDemo() {
  const [value, setValue] = useState('')
  const [filters, setFilters] = useState<GlassAiSearchBarFilter[]>(PARSED_FILTERS)
  const [log, setLog] = useState<string[]>([])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 420 }}>
      <GlassAiSearchBar
        value={value}
        onValueChange={setValue}
        onSubmit={(q) => setLog((prev) => [q, ...prev].slice(0, 4))}
        suggestions={SUGGESTIONS}
        parsedFilters={filters}
        confidence={87}
        onRemoveFilter={(id) => setFilters((prev) => prev.filter((f) => f.id !== id))}
      />
      <div style={{ fontSize: 13, color: 'var(--lg-label-secondary)' }}>
        <p style={{ margin: '0 0 4px' }}>Güncel değer: {value || '(boş)'}</p>
        {log.length > 0 ? (
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
            {log.map((q, i) => (
              <li key={i}>Gönderildi: {q}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

/** Controlled kullanım: value + onValueChange dışarıda tutulur, onRemoveFilter listeden çıkarır. */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

/** Gönderim sürerken input devre dışı kalır, öneri listesi kapanır ve soluk "Düşünüyor…" göstergesi belirir. */
export const States: Story = {
  name: 'Durumlar',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 420 }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>Boş</p>
        <GlassAiSearchBar onSubmit={fn()} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>Dolu</p>
        <GlassAiSearchBar onSubmit={fn()} defaultValue="Çeşme'de bahçeli yazlık" />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>Yükleniyor (loading)</p>
        <GlassAiSearchBar onSubmit={fn()} defaultValue="Urla'da deniz manzaralı 3+1 daire" loading />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.7 }}>Filtreli + düşük güven</p>
        <GlassAiSearchBar
          onSubmit={fn()}
          defaultValue="deniz manzaralı ucuz daire"
          parsedFilters={[{ id: 'ozellik', label: 'Özellik', value: 'Deniz manzaralı' }]}
          confidence={38}
          onFeedback={fn()}
        />
      </div>
    </div>
  ),
}

/** Uzun sorgu metni, uzun öneri cümleleri ve çok filtreli AI çıktısı — taşma/kırpma yerine sarma. */
export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  render: () => (
    <div style={{ width: 420 }}>
      <GlassAiSearchBar
        onSubmit={fn()}
        defaultValue="İzmir Urla Zeytineli mahallesinde, denize yürüme mesafesinde, bahçeli, kapalı otoparklı, güneybatı cepheli, yeni yapılmış müstakil 4+1 villa arıyorum"
        suggestions={[
          'İzmir Urla Zeytineli\'nde deniz manzaralı, bahçeli, kapalı garajlı 4+1 müstakil villa',
          'Urla Kalabak Koyu yakınında sıfır bina, asansörlü, otoparklı 3+1 daire',
        ]}
        parsedFilters={[
          { id: 'konum', label: 'Konum', value: 'İzmir, Urla, Zeytineli Mahallesi' },
          { id: 'oda', label: 'Oda Sayısı', value: '4+1' },
          { id: 'ozellik1', label: 'Özellik', value: 'Deniz manzaralı, bahçeli' },
          { id: 'ozellik2', label: 'Özellik', value: 'Kapalı otopark' },
          { id: 'cephe', label: 'Cephe', value: 'Güneybatı' },
          { id: 'yas', label: 'Bina Yaşı', value: '0 (yeni)' },
        ]}
        confidence={95}
        onRemoveFilter={fn()}
        onFeedback={fn()}
      />
    </div>
  ),
}

/** Dar mobil konteyner: ray tam genişliğe yayılır, chip'ler ve öneri butonları dokunmatik hedefe büyür. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ width: '100%', padding: 16 }}>
      <GlassAiSearchBar
        onSubmit={fn()}
        defaultValue="Urla'da deniz manzaralı 3+1 daire"
        suggestions={SUGGESTIONS}
        parsedFilters={PARSED_FILTERS}
        confidence={87}
        onRemoveFilter={fn()}
        onFeedback={fn()}
      />
    </div>
  ),
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: {
    defaultValue: 'Urla\'da deniz manzaralı 3+1 daire',
    parsedFilters: PARSED_FILTERS,
    confidence: 87,
    onRemoveFilter: fn(),
    onFeedback: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Kök `<form role="search">`; girdi `type="search"` (role `searchbox`) ve sabit ' +
          '`aria-label="Doğal dilde arama"` taşır. Öneriler düz `<button>` dizisi — özel klavye deseni ' +
          'gerekmez, doğal Tab sırası ve Enter/Space yeterlidir. Yükleme sırasında input `disabled` olur ' +
          've `aria-describedby` ile "Düşünüyor…" `aria-live="polite"` bölgesine bağlanır. Her filtre ' +
          'chip\'inin kaldır butonu `aria-label="Filtreyi kaldır: <Etiket>"` — jenerik "Kaldır" değil, ' +
          'hangi filtrenin kaldırılacağı AT\'ye ayrı ayrı duyurulur. Geri bildirim butonları basılı ' +
          'durumu `aria-pressed` ile taşır.',
      },
    },
  },
}
