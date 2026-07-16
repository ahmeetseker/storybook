import type { Meta, StoryObj } from '@storybook/react-vite'
import { DopingOdeme } from './DopingOdeme'

const meta = {
  title: 'Sayfalar/Hesabım/Doping Ödeme',
  component: DopingOdeme,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DopingOdeme>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
