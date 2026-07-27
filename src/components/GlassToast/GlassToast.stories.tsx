import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassToastProvider, useGlassToast, type GlassToastOptions } from './GlassToast'
import { GlassButton } from '../GlassButton'

const meta = {
  title: 'Bileşenler/Katmanlar/GlassToast',
  component: GlassToastProvider,
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['bottom-right', 'bottom-center', 'top-right'] },
    children: { control: false },
  },
} satisfies Meta<typeof GlassToastProvider>

export default meta
type Story = StoryObj<typeof meta>

function FireButton({ label, options }: { label: string; options: GlassToastOptions }) {
  const toast = useGlassToast()
  return (
    <GlassButton size="sm" onClick={() => toast(options)}>
      {label}
    </GlassButton>
  )
}

function SeverityDemo() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <FireButton label="Bilgi" options={{ title: 'İlan güncellendi', description: 'Fiyat değişikliği yayında.' }} />
      <FireButton
        label="Başarı"
        options={{ severity: 'success', title: 'İlan yayında', description: '2019 Passat 1.6 TDI ilanınız onaylandı.' }}
      />
      <FireButton
        label="Uyarı"
        options={{ severity: 'warning', title: 'Fotoğraf eksik', description: 'En az 3 fotoğraf önerilir.' }}
      />
      <FireButton
        label="Hata"
        options={{ severity: 'danger', title: 'Mesaj gönderilemedi', description: 'Satıcıya ulaşılamadı, tekrar deneyin.' }}
      />
    </div>
  )
}

export const Default: Story = {
  args: { children: null },
  render: (args) => (
    <GlassToastProvider {...args}>
      <SeverityDemo />
    </GlassToastProvider>
  ),
}

/** duration: null → kalıcı toast; action ile birlikte tipik "Geri Al" deseni. */
export const PersistentWithAction: Story = {
  args: { children: null },
  render: (args) => (
    <GlassToastProvider {...args}>
      <FireButton
        label="İlanı Arşivle"
        options={{
          title: 'İlan arşivlendi',
          description: 'Sahibinden Satılık Daire ilanı arşive taşındı.',
          duration: null,
          action: { label: 'Geri Al', onClick: () => console.log('geri alındı') },
        }}
      />
    </GlassToastProvider>
  ),
}

/** Konum ekseni: top-right — yalnız ≥640px'te köşe seçimi geçerlidir. */
export const TopRight: Story = {
  args: { children: null, position: 'top-right' },
  render: (args) => (
    <GlassToastProvider {...args}>
      <FireButton label="Yukarıda göster" options={{ title: 'Kaydedildi', severity: 'success' }} />
    </GlassToastProvider>
  ),
}

/** Responsive: <640px'te position yok sayılır, yığın altta tam genişliğe düşer (CSS). */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { children: null, position: 'top-right' },
  render: (args) => (
    <GlassToastProvider {...args}>
      <FireButton
        label="Bildirim gönder"
        options={{ title: 'Yeni mesaj', description: 'Alıcı: "Araç takasa açık mı?"', duration: null }}
      />
    </GlassToastProvider>
  ),
}
