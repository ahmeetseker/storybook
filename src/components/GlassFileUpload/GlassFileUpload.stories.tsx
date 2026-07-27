import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassFileUpload } from './GlassFileUpload'

const meta = {
  title: 'Bileşenler/Form/GlassFileUpload',
  component: GlassFileUpload,
  tags: ['autodocs'],
  args: { onFiles: fn() },
  argTypes: {
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
    maxSize: { control: 'number', description: 'Byte cinsinden; aşan dosya reddedilir ve hata listelenir' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassFileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** İlan fotoğrafı yükleme: çoklu seçim + yalnız görsel kabulü. */
export const IlanFotograflari: Story = {
  args: {
    multiple: true,
    accept: 'image/*',
    label: 'İlan fotoğraflarını yükleyin',
    description: 'JPG veya PNG, en fazla 10 fotoğraf',
  },
}

/** Boyut sınırı: 2 MB üzeri dosyalar reddedilir, hata altta listelenir. */
export const BoyutSinirli: Story = {
  args: {
    maxSize: 2 * 1024 * 1024,
    label: 'Ekspertiz raporunu yükleyin',
    description: 'PDF, en fazla 2 MB',
    accept: '.pdf',
  },
}

export const Disabled: Story = {
  args: { disabled: true, description: 'Önce ilan bilgilerini kaydedin' },
}

/**
 * Responsive davranış: bp-sm altında alan daha kısa padding kullanır,
 * kaldır butonu coarse pointer'da 36px dokunma hedefine büyür.
 */
export const Mobil: Story = {
  args: {
    multiple: true,
    label: 'Fotoğraf ekle',
    description: 'Galeriden seç veya sürükle',
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
