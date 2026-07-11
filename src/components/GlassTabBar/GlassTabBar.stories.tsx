import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassTabBar } from './GlassTabBar'

const meta = {
  title: 'Components/GlassTabBar',
  component: GlassTabBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof GlassTabBar>

export default meta
type Story = StoryObj<typeof meta>

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function Demo() {
  const [tab, setTab] = useState('library')
  return (
    <div style={{ padding: '48px 160px 48px 48px', borderRadius: 24, background: 'linear-gradient(160deg, #8a7968, #b3a292 55%, #cfbfae)' }}>
      <GlassTabBar selected={tab} onSelect={setTab} tone="light">
        <GlassTabBar.Item id="play" label="Şimdi Çal" icon={<Icon d="M8 5.5v13l11-6.5L8 5.5Z" />} />
        <GlassTabBar.Item id="browse" label="Keşfet" icon={<Icon d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />} />
        <GlassTabBar.Item id="radio" label="Radyo" icon={<Icon d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4" />} />
        <GlassTabBar.Item id="library" label="Kitaplık" icon={<Icon d="M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />} />
        <GlassTabBar.Item id="search" label="Ara" icon={<Icon d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4" />} />
      </GlassTabBar>
    </div>
  )
}

export const Default: Story = {
  args: { selected: 'library', onSelect: () => {}, children: null },
  render: () => <Demo />,
}
