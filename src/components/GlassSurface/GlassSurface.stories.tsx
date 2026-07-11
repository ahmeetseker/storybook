import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSurface } from './GlassSurface'

const meta = {
  title: 'Primitives/GlassSurface',
  component: GlassSurface,
  tags: ['autodocs'],
  argTypes: {
    thickness: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    variant: { control: 'select', options: ['regular', 'clear'] },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
  },
} satisfies Meta<typeof GlassSurface>

export default meta
type Story = StoryObj<typeof meta>

export const Regular: Story = {
  args: { thickness: 0.5, style: { width: 340, height: 120, display: 'grid', placeItems: 'center' }, children: 'Regular cam yüzey' },
}

export const Clear: Story = {
  args: { ...Regular.args, variant: 'clear', tone: 'light', children: 'Clear varyant (%35 karartma)' },
}

export const Thick: Story = {
  args: { ...Regular.args, thickness: 1, children: 'Kalın cam — güçlü lensing' },
}
