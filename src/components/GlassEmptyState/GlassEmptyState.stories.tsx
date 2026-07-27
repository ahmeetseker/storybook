import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassEmptyState } from './GlassEmptyState'
import { GlassButton } from '../GlassButton'

const SearchIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const WarningIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 2.5 20h19L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10v4.5M12 17.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassEmptyState',
  component: GlassEmptyState,
  tags: ['autodocs'],
  args: { title: 'Sonuç bulunamadı' },
  argTypes: {
    variant: { control: 'select', options: ['empty', 'error'] },
    size: { control: 'select', options: ['sm', 'md'] },
    icon: { control: false },
    action: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassEmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: SearchIcon,
    title: 'Aramanla eşleşen ilan yok',
    description: 'Filtreleri gevşetmeyi veya farklı bir semtte aramayı dene.',
  },
}

/** Aksiyonlu boş durum — action slot'una çağıran GlassButton verir. */
export const Aksiyonlu: Story = {
  args: {
    icon: SearchIcon,
    title: 'Kayıtlı ilanın yok',
    description: 'Beğendiğin araç ve emlak ilanlarını kaydet, buradan takip et.',
    action: <GlassButton prominent>İlanlara Göz At</GlassButton>,
  },
}

/** Hata varyantı: ikon zemini danger tonu. role="alert" bilinçli olarak YOK — statik içerik. */
export const Hata: Story = {
  args: {
    variant: 'error',
    icon: WarningIcon,
    title: 'İlanlar yüklenemedi',
    description: 'Bağlantını kontrol edip tekrar dene.',
    action: <GlassButton>Tekrar Dene</GlassButton>,
  },
}

/** Boyut ekseni: sm dar panellerde (sidebar, kart içi) kullanılır. */
export const Boyutlar: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <GlassEmptyState {...args} size="md" icon={SearchIcon} description="Varsayılan boyut" />
      <GlassEmptyState {...args} size="sm" icon={SearchIcon} description="Dar panel boyutu" />
    </div>
  ),
}

/**
 * Responsive davranış: bp-sm altında ikon 44px'e küçülür, padding daralır,
 * başlık headline boyutuna iner.
 */
export const Mobil: Story = {
  args: {
    icon: SearchIcon,
    title: 'Mesajın yok',
    description: 'Satıcılarla yazışmaya başladığında burada görünür.',
    action: <GlassButton size="sm">İlanlara Dön</GlassButton>,
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
