import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassToolbar, GlassToolbarGroup } from './GlassToolbar'
import { GlassIconButton } from '../GlassIconButton'
import { GlassButton } from '../GlassButton'
import { GlassSegmentedControl } from '../GlassSegmentedControl'

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const icons = {
  edit: 'M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z',
  share: 'M8 10V2M5 4.5L8 2l3 2.5M3 8v5.5h10V8',
  heart: 'M8 13.5C4 10.5 2 8.4 2 6a3 3 0 0 1 6-.7A3 3 0 0 1 14 6c0 2.4-2 4.5-6 7.5z',
  trash: 'M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 8.5h5.6l.7-8.5',
  flag: 'M4 14V2.5m0 .5h7.5L9.5 5.5 11.5 8H4',
}

const meta = {
  title: 'Components/GlassToolbar',
  component: GlassToolbar,
  tags: ['autodocs'],
  args: { label: 'İlan araçları' },
  argTypes: {
    primary: { control: false, description: 'Sağa yaslı birincil aksiyon slotu' },
    children: { control: false },
  },
} satisfies Meta<typeof GlassToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <GlassToolbarGroup label="Düzenleme">
          <GlassIconButton size="sm" label="Düzenle"><Icon d={icons.edit} /></GlassIconButton>
          <GlassIconButton size="sm" label="Paylaş"><Icon d={icons.share} /></GlassIconButton>
          <GlassIconButton size="sm" label="Favorilere ekle"><Icon d={icons.heart} /></GlassIconButton>
        </GlassToolbarGroup>
        <GlassToolbarGroup label="Yönetim">
          <GlassIconButton size="sm" label="Şikâyet et"><Icon d={icons.flag} /></GlassIconButton>
          <GlassIconButton size="sm" label="Sil"><Icon d={icons.trash} /></GlassIconButton>
        </GlassToolbarGroup>
      </>
    ),
  },
}

/** Primary action pill gruplarından ayrı ve tintli — sağa yaslanır. */
export const WithPrimary: Story = {
  args: {
    primary: (
      <GlassButton size="sm" prominent onClick={fn()}>
        İlanı Yayınla
      </GlassButton>
    ),
    children: (
      <>
        <GlassToolbarGroup label="Düzenleme">
          <GlassIconButton size="sm" label="Düzenle"><Icon d={icons.edit} /></GlassIconButton>
          <GlassIconButton size="sm" label="Paylaş"><Icon d={icons.share} /></GlassIconButton>
        </GlassToolbarGroup>
        <GlassToolbarGroup label="Yönetim">
          <GlassIconButton size="sm" label="Sil"><Icon d={icons.trash} /></GlassIconButton>
        </GlassToolbarGroup>
      </>
    ),
  },
  render: (args) => <div style={{ minWidth: 480 }}><GlassToolbar {...args} /></div>,
}

/** Karma içerik: grup içinde segmented control da yaşayabilir. */
export const MixedControls: Story = {
  args: {
    children: (
      <>
        <GlassSegmentedControl
          size="sm"
          label="Görünüm"
          options={[
            { value: 'list', label: 'Liste' },
            { value: 'grid', label: 'Izgara' },
          ]}
        />
        <GlassToolbarGroup label="Aksiyonlar">
          <GlassIconButton size="sm" label="Paylaş"><Icon d={icons.share} /></GlassIconButton>
          <GlassIconButton size="sm" label="Favorilere ekle"><Icon d={icons.heart} /></GlassIconButton>
        </GlassToolbarGroup>
      </>
    ),
  },
}

/** State matrisi: aktif (pressed) ve disabled kontroller grupta. */
export const States: Story = {
  args: {
    children: (
      <GlassToolbarGroup label="Durumlar">
        <GlassIconButton size="sm" label="Favori" active tint="#ff453a"><Icon d={icons.heart} /></GlassIconButton>
        <GlassIconButton size="sm" label="Paylaş"><Icon d={icons.share} /></GlassIconButton>
        <GlassIconButton size="sm" label="Sil" disabled><Icon d={icons.trash} /></GlassIconButton>
      </GlassToolbarGroup>
    ),
  },
}

/** Dar container: gruplar yatay scroll'a düşer, primary sabit kalır. */
export const NarrowContainer: Story = {
  args: WithPrimary.args,
  render: (args) => (
    <div style={{ maxWidth: 340, border: '1px dashed rgba(128,128,128,.4)', padding: 12, borderRadius: 12 }}>
      <GlassToolbar {...args} />
    </div>
  ),
}

/** Responsive: dokunmatikte buton hedefleri token'la 44px'e büyür. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: Default.args,
}
