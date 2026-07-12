// visionOS Music kompozisyonunun web uyarlaması — GlassTabBar + GlassSidebar + GlassSplitView.
// Katalogdaki diğer demolar gibi inline stil kullanır; kütüphane API'sinin vitrinidir.
import { useState, type CSSProperties } from 'react'
import { GlassTabBar } from '../components/GlassTabBar'
import { GlassSidebar } from '../components/GlassSidebar'
import { GlassSplitView } from '../components/GlassSplitView'
import { GlassSurface } from '../components/GlassSurface'

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

const ICONS = {
  play: 'M8 5.5v13l11-6.5L8 5.5Z',
  browse: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  radio: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4',
  library: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 3',
  mic: 'M15 4a4 4 0 0 0-4 4c0 1 .3 1.8.9 2.5L4 18.4V20h1.6l7.9-7.9c.7.6 1.5.9 2.5.9a4 4 0 0 0 0-8Z',
  album: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  person: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-7 16a7 7 0 0 1 14 0',
  grid: 'M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  playlist: 'M4 6h9M4 12h9M4 18h9M17 6v9.5M17 15.5a2 2 0 1 1-2 2',
} as const

const CONTENT_TITLES: Record<string, { title: string; caption: string }> = {
  recent: { title: 'Recently Added', caption: 'Son eklenenler' },
  artists: { title: 'Artists', caption: '128 Artists' },
  albums: { title: 'Albums', caption: '86 Albums' },
  songs: { title: 'Songs', caption: '1.204 Songs' },
  'made-for-you': { title: 'Made For You', caption: 'Senin için derlendi' },
  all: { title: 'Playlists', caption: 'All 254 Playlists' },
  'good-vibes': { title: 'Good Vibes Only', caption: '32 Songs' },
  indie: { title: 'Indie Anthems', caption: '48 Songs' },
  family: { title: 'Family Dance Party', caption: '25 Songs' },
}

// Referans (visionOS Music): kartlar renkli değil, pencere camından hafif koyu nötr placeholder'lar
const cardStyle: CSSProperties = {
  aspectRatio: '1',
  borderRadius: 22,
  background: 'linear-gradient(160deg, rgba(105, 96, 88, 0.5), rgba(62, 56, 50, 0.55))',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
}

function PlaylistGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24, marginTop: 28 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div style={cardStyle} />
          <div style={{ height: 10, width: '55%', marginTop: 14, borderRadius: 999, background: 'rgba(255,255,255,0.3)' }} />
        </div>
      ))}
    </div>
  )
}

function SearchCapsule({ placeholder }: { placeholder: string }) {
  return (
    <GlassSurface shape="capsule" variant="clear" thickness={0.25} style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 560, padding: '12px 18px', marginTop: 20 }}>
      <span style={{ width: 18, display: 'inline-flex' }} aria-hidden>
        <Icon d={ICONS.search} />
      </span>
      <input
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'none', color: 'inherit', font: 'inherit', fontSize: 15 }}
      />
    </GlassSurface>
  )
}

export function MusicDemo() {
  const [tab, setTab] = useState('library')
  const [sel, setSel] = useState('all')
  const content = CONTENT_TITLES[sel] ?? CONTENT_TITLES.all

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        minHeight: '100vh',
        padding: '48px 48px 48px 36px',
        boxSizing: 'border-box',
        background: 'radial-gradient(120% 140% at 65% 15%, #eae5dd 0%, #cfc5b8 45%, #9d9080 100%)',
        color: 'rgba(255, 255, 255, 0.95)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      <GlassTabBar selected={tab} onSelect={setTab} tone="light" aria-label="Music sekmeleri">
        <GlassTabBar.Item id="play" label="Şimdi Çal" icon={<Icon d={ICONS.play} />} />
        <GlassTabBar.Item id="browse" label="Keşfet" icon={<Icon d={ICONS.browse} />} />
        <GlassTabBar.Item id="radio" label="Radyo" icon={<Icon d={ICONS.radio} />} />
        <GlassTabBar.Item id="library" label="Kitaplık" icon={<Icon d={ICONS.library} />} />
        <GlassTabBar.Item id="search" label="Ara" icon={<Icon d={ICONS.search} />} />
      </GlassTabBar>

      <GlassSurface shape={36} variant="clear" thickness={0.3} style={{ flex: 1, height: 'calc(100vh - 96px)', minHeight: 480 }}>
        {/* HIG: visionOS'ta pencere sidebar'a yer açar, gizle/göster nadirdir → demo'da toggle yok */}
        <GlassSplitView
          contentKey={sel}
          sidebar={
            <GlassSidebar selected={sel} onSelect={setSel} tone="light">
              <GlassSidebar.Header title="Library" subtitle="All Music" />
              <GlassSidebar.Item id="recent" icon={<Icon d={ICONS.clock} />}>Recently Added</GlassSidebar.Item>
              <GlassSidebar.Item id="artists" icon={<Icon d={ICONS.mic} />}>Artists</GlassSidebar.Item>
              <GlassSidebar.Item id="albums" icon={<Icon d={ICONS.album} />}>Albums</GlassSidebar.Item>
              <GlassSidebar.Item id="songs" icon={<Icon d={ICONS.library} />}>Songs</GlassSidebar.Item>
              <GlassSidebar.Item id="made-for-you" icon={<Icon d={ICONS.person} />}>Made For You</GlassSidebar.Item>
              <GlassSidebar.Group label="Playlists" defaultOpen>
                <GlassSidebar.Item id="all" icon={<Icon d={ICONS.grid} />}>All Playlists</GlassSidebar.Item>
                <GlassSidebar.Item id="good-vibes" icon={<Icon d={ICONS.playlist} />}>Good Vibes Only</GlassSidebar.Item>
                <GlassSidebar.Item id="indie" icon={<Icon d={ICONS.playlist} />}>Indie Anthems</GlassSidebar.Item>
                <GlassSidebar.Item id="family" icon={<Icon d={ICONS.playlist} />}>Family Dance Party</GlassSidebar.Item>
              </GlassSidebar.Group>
            </GlassSidebar>
          }
        >
          <div style={{ paddingTop: 44, paddingRight: 16 }}>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em' }}>{content.title}</h1>
            <p style={{ margin: '8px 0 0', fontSize: 15, opacity: 0.6 }}>{content.caption}</p>
            <SearchCapsule placeholder={`Search in ${content.title}`} />
            <PlaylistGrid />
          </div>
        </GlassSplitView>
      </GlassSurface>
    </div>
  )
}
