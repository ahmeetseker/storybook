import type { Meta, StoryObj } from '@storybook/react-vite'
import { MagazaVitrin } from './MagazaVitrin'

const meta = {
  title: 'Sayfalar/Public/Mağaza Vitrini',
  component: MagazaVitrin,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MagazaVitrin>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
