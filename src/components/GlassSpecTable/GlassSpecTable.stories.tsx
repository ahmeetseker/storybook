import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSpecTable } from './GlassSpecTable'

const carSpecs = [
  { label: 'Marka', value: 'Volkswagen' },
  { label: 'Seri', value: 'Golf' },
  { label: 'Model', value: '1.6 TDI Comfortline' },
  { label: 'Yıl', value: '2019' },
  { label: 'Kilometre', value: '87.500 km' },
  { label: 'Vites', value: 'Otomatik' },
  { label: 'Yakıt', value: 'Dizel' },
  { label: 'Renk', value: 'Beyaz' },
  { label: 'Hasar Kaydı', value: 'Yok' },
  { label: 'Takas', value: 'Evet' },
]

const meta = {
  title: 'Components/GlassSpecTable',
  component: GlassSpecTable,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'select', options: [1, 2] },
  },
} satisfies Meta<typeof GlassSpecTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { title: 'İlan Bilgileri', items: carSpecs },
  render: (args) => (
    <div style={{ maxWidth: 420, margin: '48px auto' }}>
      <GlassSpecTable {...args} />
    </div>
  ),
}

export const TwoColumns: Story = {
  args: { title: 'İlan Bilgileri', items: carSpecs, columns: 2 },
  render: (args) => (
    <div style={{ maxWidth: 720, margin: '48px auto' }}>
      <GlassSpecTable {...args} />
    </div>
  ),
}

export const WithoutTitle: Story = {
  args: { items: carSpecs.slice(0, 4) },
  render: Default.render,
}
