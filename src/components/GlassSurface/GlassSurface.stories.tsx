import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSurface } from './GlassSurface'

const meta = {
  title: 'Çekirdek/GlassSurface',
  component: GlassSurface,
  tags: ['autodocs'],
  argTypes: {
    thickness: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    variant: { control: 'select', options: ['regular', 'clear'] },
    material: { control: 'select', options: ['glass', 'flat'] },
    tone: { control: 'select', options: ['light', 'dark', 'auto'] },
    // interactive yalnız imleç/touch-action verir; hover/focus görselleri CSS state'idir (bkz. rules.md)
  },
} satisfies Meta<typeof GlassSurface>

export default meta
type Story = StoryObj<typeof meta>

export const Regular: Story = {
  args: { thickness: 0.5, style: { width: 340, height: 120, display: 'grid', placeItems: 'center' }, children: 'Regular cam yüzey' },
}

export const Clear: Story = {
  args: { ...Regular.args, variant: 'clear', tone: 'light', children: 'Clear varyant (%35 karartma)' },
}

export const Thick: Story = {
  args: { ...Regular.args, thickness: 1, children: 'Kalın cam — güçlü lensing' },
}

/** Materyal ekseni yan yana: glass (backdrop-filter + refraction) vs flat (opak, filtresiz — compositor maliyeti yok). */
export const Materials: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <GlassSurface style={{ width: 280, height: 120, display: 'grid', placeItems: 'center' }}>
        Glass — navigasyon/kontrol katmanı
      </GlassSurface>
      <GlassSurface material="flat" style={{ width: 280, height: 120, display: 'grid', placeItems: 'center' }}>
        Flat — içerik katmanı
      </GlassSurface>
    </div>
  ),
}

/** Uzun içerik: yüzey metni kırpmaz; genişlik sınırlıysa içerik sarar ve yükseklik büyür. */
export const UzunIcerik: Story = {
  args: {
    thickness: 0.4,
    style: { maxWidth: 360, padding: '20px 24px', lineHeight: 1.55, fontSize: 14 },
    children:
      'İlan açıklaması: Araç ilk sahibinden olup periyodik bakımları yetkili serviste eksiksiz yaptırılmıştır. Değişen ve boyalı parçası yoktur; ekspertiz raporu, fatura ve bakım geçmişi alıcıya teslim edilecektir. Takas ve kredi seçenekleri için mesaj bırakabilirsiniz.',
  },
}

/**
 * Alan sınırı geçişi: 160.000 px² (~400×400) üstündeki yüzeylerde refraction devre dışı kalır,
 * yüzey otomatik olarak blur fallback'e düşer (REFRACTION_MAX_AREA). Küçük yüzeylerle
 * kenar bükülmesini karşılaştırmak için toolbar'dan canlı bir arka plan seçin.
 */
export const BuyukYuzey: Story = {
  args: {
    thickness: 0.5,
    style: { width: 'min(720px, 100%)', minHeight: 360, display: 'grid', placeItems: 'center' },
    children: 'Büyük yüzey — alan sınırı aşıldığı için refraction yerine blur',
  },
}
