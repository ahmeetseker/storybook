import type { Meta, StoryObj } from '@storybook/react-vite'
import { HesapOzeti } from './HesapOzeti'

const meta = {
  title: 'Sayfalar/Hesabım/Hesap Özeti',
  component: HesapOzeti,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HesapOzeti>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
