import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassNavbar } from './GlassNavbar'

const meta = {
  title: 'Components/GlassNavbar',
  component: GlassNavbar,
  parameters: { layout: 'fullscreen' },
  args: { onBack: fn() },
} satisfies Meta<typeof GlassNavbar>

export default meta
type Story = StoryObj<typeof meta>

const ScrollContent = () => (
  <div style={{ padding: '24px 16px', maxWidth: 640, margin: '0 auto' }}>
    {Array.from({ length: 24 }, (_, i) => (
      <p key={i} style={{ fontSize: 17, lineHeight: 1.6, margin: '0 0 20px' }}>
        {i + 1}. paragraf — bar'ın altından kayarken kenarında kademeli olarak
        bulanıklaşıp arka plana erimeli (scroll edge effect). Sert bir çizgi
        görünmemeli.
      </p>
    ))}
  </div>
)

export const WithBackAndActions: Story = {
  args: {
    title: 'Ayarlar',
    backLabel: 'Geri',
    actions: (
      <>
        <button>Paylaş</button>
        <button>Düzenle</button>
      </>
    ),
  },
  render: (args) => (
    <div style={{ height: '100vh', overflowY: 'auto' }}>
      <GlassNavbar {...args} />
      <ScrollContent />
    </div>
  ),
}

export const TitleOnly: Story = {
  args: { title: 'Kitaplık', onBack: undefined },
  render: WithBackAndActions.render,
}

/** backLabel verilmeyince geri pill'i ikon-tek moddur; ekran okuyucu adı 'Geri' sabitidir. */
export const IkonTekGeri: Story = {
  args: { title: 'Bildirimler' },
  render: WithBackAndActions.render,
}

/** Uzun başlık tek satırda ellipsis ile kırpılır; geri pill'i ve action grubu yerinden oynamaz. */
export const UzunBaslik: Story = {
  args: {
    title: 'Satılık Daireler — Kadıköy Moda Deniz Manzaralı 3+1 Fırsat İlanları',
    backLabel: 'Geri',
    actions: (
      <>
        <button>Paylaş</button>
        <button>Kaydet</button>
      </>
    ),
  },
  render: WithBackAndActions.render,
}

/** Dar container (360px, telefon genişliği): başlık kırpılır, dokunma hedefleri 44px kalır. */
export const DarContainer: Story = {
  args: {
    title: 'İlan Detayı',
    backLabel: 'Geri',
    actions: <button>Paylaş</button>,
  },
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '0 auto', height: '100vh', overflowY: 'auto' }}>
      <GlassNavbar {...args} />
      <ScrollContent />
    </div>
  ),
}
