import type { Meta, StoryObj } from '@storybook/react-vite'
import { KurumsalBasvuru } from './KurumsalBasvuru'

const meta = {
  title: 'Sayfalar/Public/Kurumsal Başvuru',
  component: KurumsalBasvuru,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof KurumsalBasvuru>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
