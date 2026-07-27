import { useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassPagination } from './GlassPagination'

const meta = {
  title: 'Bileşenler/Navigasyon/GlassPagination',
  component: GlassPagination,
  tags: ['autodocs'],
  args: { page: 5, pageCount: 20, onPageChange: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
  },
} satisfies Meta<typeof GlassPagination>

export default meta
type Story = StoryObj<typeof meta>

const DefaultDemo = (args: ComponentProps<typeof GlassPagination>) => {
  const [page, setPage] = useState(args.page)
  return <GlassPagination {...args} page={page} onPageChange={setPage} />
}

/** Kontrollü kullanım — `page` dışarıdan yönetilir (ör. ilan arama sonuçları). */
export const Default: Story = {
  render: (args) => <DefaultDemo {...args} />,
}

const EllipsisDemo = () => {
  const [page, setPage] = useState(5)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <GlassPagination page={page} pageCount={20} onPageChange={setPage} />
      <GlassPagination page={2} pageCount={20} onPageChange={fn()} />
      <GlassPagination page={19} pageCount={20} onPageChange={fn()} />
    </div>
  )
}

/** Ellipsis mantığı: ortadayken `1 … 4 5 6 … 20`, uca yakınken tek ellipsis. */
export const Ellipsis: Story = {
  render: () => <EllipsisDemo />,
}

/** `siblingCount=2`: aktif sayfanın iki yanında ikişer komşu. */
export const SiblingCountTwo: Story = {
  args: { page: 10, pageCount: 40, siblingCount: 2 },
}

/** Boyut ekseni — yükseklikler kontrol token'larından (dokunmatikte 44px+). */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <GlassPagination size="sm" page={3} pageCount={12} onPageChange={fn()} />
      <GlassPagination size="md" page={3} pageCount={12} onPageChange={fn()} />
    </div>
  ),
}

/** Uç durumlar: ilk sayfada "önceki", son sayfada "sonraki" disabled; az sayfada ellipsis yok. */
export const UcDurumlar: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <GlassPagination page={1} pageCount={7} onPageChange={fn()} />
      <GlassPagination page={7} pageCount={7} onPageChange={fn()} />
      <GlassPagination page={1} pageCount={1} onPageChange={fn()} />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
}

const MobilKompaktDemo = () => {
  const [page, setPage] = useState(5)
  return <GlassPagination page={page} pageCount={20} onPageChange={setPage} />
}

/**
 * Responsive: bp-sm (640px) altında sayfa listesi gizlenir, kompakt mod
 * ("önceki · 5 / 20 · sonraki") görünür — iki DOM bloğu, media query ile
 * gösterilip gizlenir. Bu story mobil viewport'ta açılır.
 */
export const MobilKompakt: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <MobilKompaktDemo />,
}
