// Flowbite Blocks tarzı component kataloğu — Storybook docs sayfasında yaşar.
// Sayfa temiz beyaz/gri; cam efekti yalnız kart içi önizleme kutucuklarında
// (pastel gradyan zemin üzerinde) görünür — düz zeminde cam okunmaz.
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { GlassButton } from '../components/GlassButton'
import { GlassBackButton } from '../components/GlassNavbar'

type Category = 'Navigasyon' | 'Kontroller' | 'Overlay'
type Status = 'hazır' | 'planlandı'

interface CatalogEntry {
  name: string
  description: string
  category: Category
  status: Status
  storyPath?: string
  preview?: ReactNode
}

const noop = () => {}

const ENTRIES: CatalogEntry[] = [
  {
    name: 'Button',
    description: 'Capsule cam buton — basınca sıvılaşma, parmak ucundan iç ışıma, bırakınca jöle salınımı.',
    category: 'Kontroller',
    status: 'hazır',
    storyPath: '/story/components-glassbutton--default',
    preview: <GlassButton size="sm" tone="dark" onClick={noop}>Devam Et</GlassButton>,
  },
  {
    name: 'Navbar',
    description: "Yüzen navigasyon barı — geri pill'i, başlık, paylaşımlı action grubu ve soft scroll edge.",
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassnavbar--with-back-and-actions',
    preview: <GlassBackButton onClick={noop} label="Geri" tone="dark" />,
  },
  {
    name: 'Dropdown / Menü',
    description: 'Butonun baloncuk gibi patlayarak menüye morph olması (layoutId FLIP); cam büyürken kalınlaşır.',
    category: 'Overlay',
    status: 'planlandı',
  },
  {
    name: 'Sidebar',
    description: "visionOS tarzı yüzen cam kenar çubuğu — kayan seçim highlight'ı, disclosure grupları, split view ile içerik geçişi.",
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/demo-music--default',
  },
  {
    name: 'Switch',
    description: 'Lip bezel profili — kenarlar içe kırar, merkez hafif çukur; başparmak basınca cama dönüşür.',
    category: 'Kontroller',
    status: 'planlandı',
  },
  {
    name: 'Slider',
    description: 'Konveks cam başparmak; mevcut seviye camın içinden kırılarak görünür.',
    category: 'Kontroller',
    status: 'planlandı',
  },
  {
    name: 'Tab Bar',
    description: "Dikey visionOS ornament'ı — hover'da genişleyip etiketleri gösterir, seçim highlight'ı sekmeler arasında süzülür.",
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glasstabbar--default',
  },
  {
    name: 'Sheet',
    description: 'Yarım sayfa cam panel — yukarı çekildikçe büyür, opaklaşır ve kalınlaşır.',
    category: 'Overlay',
    status: 'planlandı',
  },
  {
    name: 'Search Field',
    description: 'Cam arama kutusu — odaklanınca genişler, içi vibrancy katmanıyla ayrılır.',
    category: 'Kontroller',
    status: 'planlandı',
  },
  {
    name: 'Segmented Control',
    description: 'Seçili segmentin tek cam damla gibi kaydığı bölmeli kontrol.',
    category: 'Kontroller',
    status: 'planlandı',
  },
  {
    name: 'Popover / Alert',
    description: 'Kaynağından materialize olan cam balon; kalın varyant, bold tipografi.',
    category: 'Overlay',
    status: 'planlandı',
  },
  {
    name: 'Toolbar',
    description: 'İşleve göre pill gruplarına toplanan araç çubuğu; primary action ayrı ve tintli.',
    category: 'Navigasyon',
    status: 'planlandı',
  },
]

const CATEGORIES: Array<Category | 'Tümü'> = ['Tümü', 'Navigasyon', 'Kontroller', 'Overlay']

const chipStyle = (active: boolean): CSSProperties => ({
  border: active ? '1px solid #111827' : '1px solid #e5e7eb',
  background: active ? '#111827' : '#fff',
  color: active ? '#fff' : '#374151',
  borderRadius: 999,
  padding: '8px 16px',
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s ease, color 0.2s ease',
})

const badgeStyle = (kind: Status): CSSProperties => ({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  padding: '3px 10px',
  borderRadius: 999,
  background: kind === 'hazır' ? '#def7e4' : '#f3f4f6',
  color: kind === 'hazır' ? '#0f7a33' : '#6b7280',
  border: `1px solid ${kind === 'hazır' ? '#b5eac3' : '#e5e7eb'}`,
})

export function ComponentCatalog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'Tümü'>('Tümü')

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    return ENTRIES.filter((e) => {
      if (category !== 'Tümü' && e.category !== category) return false
      if (!q) return true
      return (e.name + ' ' + e.description).toLocaleLowerCase('tr').includes(q)
    })
  }, [query, category])

  return (
    <div style={{ position: 'relative', borderRadius: 20, background: '#f7f8fa', border: '1px solid #e5e7eb', padding: '2.5rem 2rem 3rem', color: '#111827', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Liquid Glass Componentleri</h2>
      <p style={{ margin: '8px 0 24px', maxWidth: 560, fontSize: 15, lineHeight: 1.55, color: '#4b5563' }}>
        Apple'ın Liquid Glass tasarım dilinin web karşılıkları. Hazır olanlar canlı önizlemeyle;
        planlananlar sırayla geliştirilecek — bir kart seç, birlikte yapalım.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Component ara…"
          aria-label="Component ara"
          style={{ border: '1px solid #e5e7eb', outline: 'none', background: '#fff', color: 'inherit', font: 'inherit', fontSize: 14.5, borderRadius: 12, padding: '10px 16px', minWidth: 260 }}
        />
        {CATEGORIES.map((c) => (
          <button key={c} type="button" style={chipStyle(category === c)} onClick={() => setCategory(c)} aria-pressed={category === c}>
            {c}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
          {filtered.length} sonuç gösteriliyor
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 18 }}>
        {filtered.map((entry) => (
          <div key={entry.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <strong style={{ fontSize: 17 }}>{entry.name}</strong>
              <span style={badgeStyle(entry.status)}>{entry.status}</span>
            </div>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{entry.category}</span>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#4b5563', flex: 1 }}>
              {entry.description}
            </p>
            <div
              style={{
                minHeight: 72,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 12,
                background: entry.preview
                  ? 'linear-gradient(135deg,#bfe3fb 0%,#dccdf6 45%,#f7cfe4 100%)'
                  : '#f3f4f6',
                border: entry.preview ? 'none' : '1px dashed #d1d5db',
              }}
            >
              {entry.preview ?? (
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  {entry.status === 'hazır' ? "Story'de izle →" : 'Yakında'}
                </span>
              )}
            </div>
            {entry.storyPath ? (
              <a
                href={`?path=${entry.storyPath}`}
                target="_top"
                style={{ fontSize: 13, fontWeight: 600, color: '#1c64f2', textDecoration: 'none' }}
              >
                Story'yi aç →
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
