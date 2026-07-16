import type { Meta, StoryObj } from '@storybook/react-vite'
import { Faturalarim } from './Faturalarim'

const meta = {
  title: 'Sayfalar/Hesabım/Faturalarım',
  component: Faturalarim,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Faturalarim>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
