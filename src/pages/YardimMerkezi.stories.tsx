import type { Meta, StoryObj } from '@storybook/react-vite'
import { YardimMerkezi } from './YardimMerkezi'

const meta = {
  title: 'Sayfalar/Public/Yardım Merkezi',
  component: YardimMerkezi,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof YardimMerkezi>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
