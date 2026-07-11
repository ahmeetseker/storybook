import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSplitView } from './GlassSplitView'
import { GlassSidebar } from '../GlassSidebar'

const meta = {
  title: 'Components/GlassSplitView',
  component: GlassSplitView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GlassSplitView>

export default meta
type Story = StoryObj<typeof meta>

const TITLES: Record<string, string> = {
  recent: 'Recently Added',
  all: 'All Playlists',
  indie: 'Indie Anthems',
}

function Demo() {
  const [sel, setSel] = useState('all')
  return (
    <div style={{ height: 560, background: 'linear-gradient(160deg, #8a7968, #b3a292 55%, #cfbfae)', color: 'rgba(255,255,255,0.95)' }}>
      <GlassSplitView
        toggle
        contentKey={sel}
        sidebar={
          <GlassSidebar selected={sel} onSelect={setSel} tone="light">
            <GlassSidebar.Header title="Library" subtitle="All Music" />
            <GlassSidebar.Item id="recent">Recently Added</GlassSidebar.Item>
            <GlassSidebar.Group label="Playlists" defaultOpen>
              <GlassSidebar.Item id="all">All Playlists</GlassSidebar.Item>
              <GlassSidebar.Item id="indie">Indie Anthems</GlassSidebar.Item>
            </GlassSidebar.Group>
          </GlassSidebar>
        }
      >
        <div style={{ paddingTop: 48 }}>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em' }}>{TITLES[sel]}</h1>
          <p style={{ opacity: 0.7 }}>Sidebar'dan seçim yap — içerik crossfade ile geçer.</p>
        </div>
      </GlassSplitView>
    </div>
  )
}

export const Default: Story = {
  args: { sidebar: null, children: null },
  render: () => <Demo />,
}
