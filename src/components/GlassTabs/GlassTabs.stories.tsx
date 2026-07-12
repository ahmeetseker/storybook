import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassTabs } from './GlassTabs'

const meta = {
  title: 'Components/GlassTabs',
  component: GlassTabs,
  tags: ['autodocs'],
  args: { onTabChange: fn() },
} satisfies Meta<typeof GlassTabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    tabs: [
      {
        id: 'aciklama',
        label: 'Açıklama',
        content: (
          <p style={{ margin: 0 }}>
            Aracımız ilk sahibinden, tüm bakımları yetkili serviste yapılmıştır. Değişen ve
            boyası yoktur. Görmeden karar vermeyin.
          </p>
        ),
      },
      {
        id: 'ozellikler',
        label: 'Özellikler',
        content: <p style={{ margin: 0 }}>Sunroof, geri görüş kamerası, şerit takip asistanı, ısıtmalı koltuk.</p>,
      },
      {
        id: 'konum',
        label: 'Konum',
        content: <p style={{ margin: 0 }}>İstanbul, Kadıköy — Fenerbahçe Mah.</p>,
      },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 640, margin: '48px auto' }}>
      <GlassTabs {...args} />
    </div>
  ),
}

export const Controlled: Story = {
  args: { ...Default.args, activeId: 'konum' },
  render: Default.render,
}
