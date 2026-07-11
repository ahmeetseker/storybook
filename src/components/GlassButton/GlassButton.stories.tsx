import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassButton } from './GlassButton'

const meta = {
  title: 'Components/GlassButton',
  component: GlassButton,
  tags: ['autodocs'],
  args: { onClick: fn() },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    tint: { control: 'color' },
  },
} satisfies Meta<typeof GlassButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'Devam Et' } }
export const Tinted: Story = { args: { children: 'Satın Al', tint: '#0a84ff', tone: 'light' } }
export const Prominent: Story = { args: { children: 'Bitti', prominent: true, tint: '#0a84ff' } }
export const ExtraLarge: Story = { args: { children: 'Başlayalım', size: 'xl' } }
export const Disabled: Story = { args: { children: 'Devre Dışı', disabled: true } }
