import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassSearchField } from './GlassSearchField'

const meta = {
  title: 'Components/GlassSearchField',
  component: GlassSearchField,
  tags: ['autodocs'],
  args: { 'aria-label': 'İlan ara', onSearch: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    expandOnFocus: { control: 'boolean' },
  },
} satisfies Meta<typeof GlassSearchField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = { args: { defaultValue: 'passat 1.6 tdi' } }

export const NoExpand: Story = {
  args: { expandOnFocus: false },
}

/** Boyut ekseni: sm toolbar içi, md standart, lg hero arama. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <GlassSearchField size="sm" aria-label="Küçük arama" />
      <GlassSearchField size="md" aria-label="Orta arama" />
      <GlassSearchField size="lg" aria-label="Büyük arama" />
    </div>
  ),
}

/** State matrisi: boş · dolu (çarpı görünür) · disabled. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <GlassSearchField aria-label="Boş" />
      <GlassSearchField aria-label="Dolu" defaultValue="sahibinden clio" />
      <GlassSearchField aria-label="Disabled" disabled />
    </div>
  ),
}

/** Controlled kullanım + Enter'da arama, Esc metni temizler. */
export const Controlled: Story = {
  render: () => {
    const [query, setQuery] = useState('')
    const [submitted, setSubmitted] = useState<string | null>(null)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <GlassSearchField
          aria-label="İlan ara"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSearch={setSubmitted}
        />
        <span style={{ fontSize: 13, opacity: 0.7 }}>
          {submitted ? `Arandı: "${submitted}"` : 'Enter ile ara, Esc ile temizle'}
        </span>
      </div>
    )
  },
}

/** Genişleme davranışı dar container'da taşmaz (max-width sınırı). */
export const NarrowContainer: Story = {
  render: () => (
    <div style={{ maxWidth: 260, border: '1px dashed rgba(128,128,128,.4)', padding: 12, borderRadius: 12 }}>
      <GlassSearchField aria-label="Dar alan araması" />
    </div>
  ),
}

/** Responsive: dokunmatikte kontrol yüksekliği 44px'e büyür, 16px font zoom'u önler. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
