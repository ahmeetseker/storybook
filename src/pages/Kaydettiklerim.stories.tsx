import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kaydettiklerim } from './Kaydettiklerim'

const meta = {
  title: 'Sayfalar/Hesabım/Kaydettiklerim',
  component: Kaydettiklerim,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Kaydettiklerim>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
