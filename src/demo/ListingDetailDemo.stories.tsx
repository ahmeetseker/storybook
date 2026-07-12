import type { Meta, StoryObj } from '@storybook/react-vite'
import { ListingDetailDemo } from './ListingDetailDemo'

const meta = {
  title: 'Demo/İlan Detay',
  component: ListingDetailDemo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ListingDetailDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
