import type { Meta, StoryObj } from '@storybook/react-vite'
import { IlanVer } from './IlanVer'

const meta = {
  title: 'Sayfalar/Public/İlan Ver',
  component: IlanVer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof IlanVer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
