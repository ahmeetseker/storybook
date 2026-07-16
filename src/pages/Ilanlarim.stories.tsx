import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ilanlarim } from './Ilanlarim'

const meta = {
  title: 'Sayfalar/Hesabım/İlanlarım',
  component: Ilanlarim,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Ilanlarim>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
