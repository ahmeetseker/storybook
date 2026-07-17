import type { Meta, StoryObj } from '@storybook/react-vite'
import { Karsilastir } from './Karsilastir'

const meta = {
  title: 'Sayfalar/Public/Karşılaştır',
  component: Karsilastir,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Karsilastir>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
