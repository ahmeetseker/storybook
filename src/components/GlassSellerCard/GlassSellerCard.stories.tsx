import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, userEvent, within } from 'storybook/test'
import { GlassSellerCard } from './GlassSellerCard'

// Dekoratif avatar (alt="") — dış ağ isteği olmasın diye inline SVG data URI
const avatarDataUri =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
      '<circle cx="24" cy="24" r="24" fill="#b45309"/>' +
      '<circle cx="24" cy="18" r="8" fill="rgba(255,255,255,.85)"/>' +
      '<path d="M8 46c2-9 8-13 16-13s14 4 16 13z" fill="rgba(255,255,255,.85)"/>' +
      '</svg>',
  )

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassSellerCard',
  component: GlassSellerCard,
  tags: ['autodocs'],
  args: { onPhoneReveal: fn(), onMessage: fn() },
} satisfies Meta<typeof GlassSellerCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'Mehmet Yılmaz',
    memberSince: 'Üyelik: Ocak 2019',
    phone: '0 (532) 123 45 67',
    verified: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 360, margin: '48px auto' }}>
      <GlassSellerCard {...args} />
    </div>
  ),
}

export const WithoutPhone: Story = {
  args: { name: 'Ayşe Demir', memberSince: 'Üyelik: Mart 2023' },
  render: Default.render,
}

export const Minimal: Story = {
  args: { name: 'Galeri Kaya Otomotiv', onMessage: undefined, phone: '0 (216) 348 22 11' },
  render: Default.render,
}

/** `avatarUrl` verilince img render edilir; baş harf fallback'i hiç çıkmaz. */
export const WithAvatar: Story = {
  args: {
    name: 'Elif Kaya',
    memberSince: 'Üyelik: Haziran 2021',
    phone: '0 (533) 987 65 43',
    verified: true,
    avatarUrl: avatarDataUri,
  },
  render: Default.render,
}

/**
 * Malzeme karşılaştırması: içerik sayfasında `material="flat"` önerilir (bkz. rules.md §12);
 * iç GlassButton'lar cam kalır. İki malzeme yan yana.
 */
export const Materials: Story = {
  args: {
    name: 'Mehmet Yılmaz',
    memberSince: 'Üyelik: Ocak 2019',
    phone: '0 (532) 123 45 67',
    verified: true,
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', maxWidth: 760, margin: '48px auto' }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;glass&quot; — yalnız medya üstü</p>
        <GlassSellerCard {...args} material="glass" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>material=&quot;flat&quot; — içerik sayfası (önerilen)</p>
        <GlassSellerCard {...args} material="flat" />
      </div>
    </div>
  ),
}

/**
 * State matrisi: telefon maskeli · telefon açılmış · verified'sız. `revealed` internal
 * state'tir, prop'la açılamaz — ortadaki kart play function ile "Telefonu Göster"e
 * tıklanarak açılır ve `tel:` linkine dönüşür.
 */
export const States: Story = {
  args: { name: 'Mehmet Yılmaz' },
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', maxWidth: 1100, margin: '48px auto' }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Telefon maskeli · verified</p>
        <GlassSellerCard name="Mehmet Yılmaz" memberSince="Üyelik: Ocak 2019" phone="0 (532) 123 45 67" verified onPhoneReveal={fn()} onMessage={fn()} />
      </div>
      <div data-testid="telefon-acilmis">
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Telefon açılmış (play ile) · verified</p>
        <GlassSellerCard name="Ayşe Demir" memberSince="Üyelik: Mart 2023" phone="0 (216) 348 22 11" verified onPhoneReveal={fn()} onMessage={fn()} />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>Verified'sız · maskeli</p>
        <GlassSellerCard name="Hasan Çelik" memberSince="Üyelik: Eylül 2024" phone="0 (505) 771 03 48" onPhoneReveal={fn()} onMessage={fn()} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const revealedCard = within(await canvas.findByTestId('telefon-acilmis'))
    await userEvent.click(revealedCard.getByRole('button', { name: 'Telefonu Göster' }))
  },
}

/**
 * Uzun içerik: isimde truncation yok — uzun kurumsal isim sarar (`who` min-width: 0 ile
 * daralır). Baş harf fallback'i en fazla 2 karakterdir, isim uzunluğundan etkilenmez.
 */
export const UzunIcerik: Story = {
  args: {
    name: 'Kaya Otomotiv Sanayi ve Ticaret Limited Şirketi — Ataşehir Yetkili Bayi',
    memberSince: 'Üyelik: Kasım 2015 · Kurumsal hesap',
    phone: '0 (216) 348 22 11',
    verified: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 300, margin: '48px auto' }}>
      <GlassSellerCard {...args} />
    </div>
  ),
}
