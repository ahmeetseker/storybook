import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSidebar } from './GlassSidebar'

const meta = {
  title: 'Components/GlassSidebar',
  component: GlassSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof GlassSidebar>

export default meta
type Story = StoryObj<typeof meta>

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function Demo() {
  const [sel, setSel] = useState('all')
  return (
    <div style={{ padding: 40, borderRadius: 24, background: 'linear-gradient(160deg, #8a7968, #b3a292 55%, #cfbfae)' }}>
      <GlassSidebar selected={sel} onSelect={setSel} tone="light">
        <GlassSidebar.Header title="Library" subtitle="All Music" />
        <GlassSidebar.Item id="recent" icon={<Icon d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 3" />}>
          Recently Added
        </GlassSidebar.Item>
        <GlassSidebar.Item id="artists" icon={<Icon d="M15 4a4 4 0 0 0-4 4c0 1 .3 1.8.9 2.5L4 18.4V20h1.6l7.9-7.9c.7.6 1.5.9 2.5.9a4 4 0 0 0 0-8Z" />}>
          Artists
        </GlassSidebar.Item>
        <GlassSidebar.Item id="albums" icon={<Icon d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />}>
          Albums
        </GlassSidebar.Item>
        <GlassSidebar.Item id="songs" icon={<Icon d="M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />}>
          Songs
        </GlassSidebar.Item>
        <GlassSidebar.Group label="Playlists" defaultOpen>
          <GlassSidebar.Item id="all" icon={<Icon d="M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v6H4v-6Zm10 0h6v6h-6v-6Z" />}>
            All Playlists
          </GlassSidebar.Item>
          <GlassSidebar.Item id="good-vibes" icon={<Icon d="M4 6h9M4 12h9M4 18h9M17 6v9.5M17 15.5a2 2 0 1 1-2 2" />}>
            Good Vibes Only
          </GlassSidebar.Item>
          <GlassSidebar.Item id="indie" icon={<Icon d="M4 6h9M4 12h9M4 18h9M17 6v9.5M17 15.5a2 2 0 1 1-2 2" />}>
            Indie Anthems
          </GlassSidebar.Item>
        </GlassSidebar.Group>
      </GlassSidebar>
    </div>
  )
}

export const Default: Story = {
  args: { children: null },
  render: () => <Demo />,
}
