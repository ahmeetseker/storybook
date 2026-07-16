import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kayit } from './Kayit'

const meta = {
  title: 'Sayfalar/Public/Kayıt',
  component: Kayit,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Kayit>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
