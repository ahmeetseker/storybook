import type { Meta, StoryObj } from '@storybook/react-vite'
import { Arama } from './Arama'

const meta = {
  title: 'Sayfalar/Public/Arama',
  component: Arama,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Arama>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const HaritaGorunumu: Story = {
  args: { baslangicGorunumu: 'harita' },
}
