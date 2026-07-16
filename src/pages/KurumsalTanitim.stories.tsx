import type { Meta, StoryObj } from '@storybook/react-vite'
import { KurumsalTanitim } from './KurumsalTanitim'

const meta = {
  title: 'Sayfalar/Public/Kurumsal Tanıtım',
  component: KurumsalTanitim,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof KurumsalTanitim>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
