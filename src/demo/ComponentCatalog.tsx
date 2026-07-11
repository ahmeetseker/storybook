// Flowbite Blocks tarzı component kataloğu — Storybook docs sayfasında yaşar.
// Kartlar GlassSurface, filtre çipleri GlassButton: katalog kendi ürünümüzle inşa edilmiştir.
import { useMemo, useState, type ReactNode } from 'react'
import { GlassSurface } from '../components/GlassSurface'
import { GlassButton } from '../components/GlassButton'
import { GlassBackButton } from '../components/GlassNavbar'
import { GradientBlinds } from './GradientBlinds'

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
    preview: <GlassButton size="sm" tone="light" onClick={noop}>Devam Et</GlassButton>,
  },
  {
    name: 'Navbar',
    description: 'Yüzen navigasyon barı — geri pill\'i, başlık, paylaşımlı action grubu ve soft scroll edge.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassnavbar--with-back-and-actions',
    preview: <GlassBackButton onClick={noop} label="Geri" tone="light" />,
  },
  {
    name: 'Dropdown / Menü',
    description: 'Butonun baloncuk gibi patlayarak menüye morph olması (layoutId FLIP); cam büyürken kalınlaşır.',
    category: 'Overlay',
    status: 'planlandı',
  },
  {
    name: 'Sidebar',
    description: 'İçeriğin arkasından aktığı, kenarlardan içeri alınmış yüzen cam kenar çubuğu.',
    category: 'Navigasyon',
    status: 'planlandı',
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
    description: 'Aşağı kaydırınca küçülen, yukarıda genişleyen yüzen sekme barı; arama sekmesi ayrık.',
    category: 'Navigasyon',
    status: 'planlandı',
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

const badgeStyle = (kind: Status): React.CSSProperties => ({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  padding: '3px 10px',
  borderRadius: 999,
  background: kind === 'hazır' ? 'rgba(48, 209, 88, 0.25)' : 'rgba(255, 255, 255, 0.12)',
  color: kind === 'hazır' ? '#7cf59e' : 'rgba(255,255,255,0.65)',
  border: `1px solid ${kind === 'hazır' ? 'rgba(48,209,88,0.5)' : 'rgba(255,255,255,0.18)'}`,
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
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, background: '#0b0b14', padding: '2.5rem 2rem 3rem', color: 'rgba(255,255,255,0.92)', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <GradientBlinds
          gradientColors={['#FF9FFC', '#5227FF', '#50dee5']}
          angle={37}
          noise={0.15}
          blindCount={16}
          blindMinWidth={60}
          spotlightRadius={0.6}
          spotlightOpacity={0.8}
          mouseDampening={0.25}
        />
      </div>

      <div style={{ position: 'relative' }}>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Liquid Glass Componentleri</h2>
        <p style={{ margin: '8px 0 24px', maxWidth: 560, fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)' }}>
          Apple'ın Liquid Glass tasarım dilinin web karşılıkları. Hazır olanlar canlı önizlemeyle;
          planlananlar sırayla geliştirilecek — bir kart seç, birlikte yapalım.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 10 }}>
          <GlassSurface shape="capsule" tone="light" thickness={0.3} style={{ padding: '10px 18px', minWidth: 260 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Component ara…"
              aria-label="Component ara"
              style={{ border: 'none', outline: 'none', background: 'transparent', color: 'inherit', font: 'inherit', width: '100%' }}
            />
          </GlassSurface>
          {CATEGORIES.map((c) => (
            <GlassButton
              key={c}
              size="sm"
              tone="light"
              tint={category === c ? '#5227FF' : undefined}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c}
            </GlassButton>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            {filtered.length} sonuç gösteriliyor
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 18 }}>
          {filtered.map((entry) => (
            <GlassSurface key={entry.name} tone="light" thickness={0.45} shape={18} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ fontSize: 17 }}>{entry.name}</strong>
                <span style={badgeStyle(entry.status)}>{entry.status}</span>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{entry.category}</span>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.75)', flex: 1 }}>
                {entry.description}
              </p>
              <div style={{ minHeight: 56, display: 'grid', placeItems: 'center', borderRadius: 12, border: entry.preview ? 'none' : '1px dashed rgba(255,255,255,0.25)' }}>
                {entry.preview ?? <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Yakında</span>}
              </div>
              {entry.storyPath ? (
                <a
                  href={`?path=${entry.storyPath}`}
                  target="_top"
                  style={{ fontSize: 13, fontWeight: 600, color: '#9fd6ff', textDecoration: 'none' }}
                >
                  Story'yi aç →
                </a>
              ) : null}
            </GlassSurface>
          ))}
        </div>
      </div>
    </div>
  )
}
