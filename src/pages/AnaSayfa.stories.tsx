import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnaSayfa } from './AnaSayfa'

const meta = {
  title: 'Sayfalar/Public/Ana Sayfa',
  component: AnaSayfa,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AnaSayfa>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
