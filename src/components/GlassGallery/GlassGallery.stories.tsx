import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassGallery } from './GlassGallery'
import { placeholderImage } from '../../demo/placeholderImage'

const images = [
  { src: placeholderImage('Ön', '#3a5f8a', '#1f3a5f'), alt: 'Aracın önden görünümü' },
  { src: placeholderImage('Yan', '#5f3a8a', '#3a1f5f'), alt: 'Aracın yandan görünümü' },
  { src: placeholderImage('Arka', '#8a5f3a', '#5f3a1f'), alt: 'Aracın arkadan görünümü' },
  { src: placeholderImage('İç Mekan', '#3a8a5f', '#1f5f3a'), alt: 'Araç iç mekanı' },
  { src: placeholderImage('Motor', '#8a3a3a', '#5f1f1f'), alt: 'Motor bölmesi' },
]

const meta = {
  title: 'Components/GlassGallery',
  component: GlassGallery,
  tags: ['autodocs'],
  args: { onIndexChange: fn() },
} satisfies Meta<typeof GlassGallery>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { images },
  render: (args) => (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <GlassGallery {...args} />
    </div>
  ),
}

export const SingleImage: Story = {
  args: { images: images.slice(0, 1) },
  render: Default.render,
}

export const Wide: Story = {
  args: { images, aspectRatio: '16 / 9' },
  render: Default.render,
}
