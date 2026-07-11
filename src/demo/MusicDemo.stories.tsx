import type { Meta, StoryObj } from '@storybook/react-vite'
import { MusicDemo } from './MusicDemo'

const meta = {
  title: 'Demo/Music',
  component: MusicDemo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MusicDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
