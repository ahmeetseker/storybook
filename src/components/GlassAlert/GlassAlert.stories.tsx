import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassAlert } from './GlassAlert'
import { GlassButton } from '../GlassButton'

const meta = {
  title: 'Bileşenler/Katmanlar/GlassAlert',
  component: GlassAlert,
  tags: ['autodocs'],
  args: { children: 'İlanınız yayına alındı.' },
  argTypes: {
    severity: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    // icon/action/onDismiss render örneklerinde gösterilir
  },
} satisfies Meta<typeof GlassAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    severity: 'info',
    children: 'Bu ilan 14 gün önce güncellendi; fiyat piyasa ortalamasının %6 altında.',
  },
}

/** Severity ekseni: info/success → role="status", warning/danger → role="alert". */
export const Severities: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
      <GlassAlert severity="info" title="Bilgi">
        Satıcı bu ilanda kapora ile rezervasyon kabul ediyor.
      </GlassAlert>
      <GlassAlert severity="success" title="Yayında">
        “2019 Volvo XC60” ilanınız onaylandı ve yayına alındı.
      </GlassAlert>
      <GlassAlert severity="warning" title="Belge eksik">
        Ekspertiz raporu yüklenmedi; ilan görünürlüğü düşük kalabilir.
      </GlassAlert>
      <GlassAlert severity="danger" title="Ödeme başarısız">
        Doping ödemesi bankanız tarafından reddedildi. Kart bilgilerinizi kontrol edin.
      </GlassAlert>
    </div>
  ),
}

/** Başlık + aksiyon + kapatma birlikte: aksiyon ≥sm'de satır içinde sağda durur. */
export const WithActionAndDismiss: Story = {
  args: {
    severity: 'warning',
    title: 'İlan süresi doluyor',
    children: 'Emlak ilanınızın yayın süresi 3 gün içinde sona erecek.',
    onDismiss: fn(),
    action: (
      <GlassButton size="sm" prominent>
        Süreyi Uzat
      </GlassButton>
    ),
  },
}

/** Özel ikon: severity ikonunun yerine geçer (renk yine severity token'ından). */
export const CustomIcon: Story = {
  args: {
    severity: 'success',
    title: 'Güvenli satıcı',
    children: 'Bu satıcının kimliği ve işletme kaydı doğrulandı.',
    icon: (
      <svg viewBox="0 0 20 20" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
        <path d="M10 2.5 16.5 5v4.6c0 3.9-2.8 6.7-6.5 7.9-3.7-1.2-6.5-4-6.5-7.9V5Z" strokeLinejoin="round" />
        <path d="m7.2 10 2 2 3.6-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
}

/**
 * Responsive davranış: bp-sm (640px) altında padding daralır ve action alt satıra
 * sarar; ≥sm action satır içinde sağa yaslanır.
 */
export const MobileLayout: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    severity: 'info',
    title: 'Fiyat düştü',
    children: 'Takip ettiğiniz “Kadıköy 3+1 daire” ilanının fiyatı 250.000 TL düştü.',
    onDismiss: fn(),
    action: (
      <GlassButton size="sm" prominent>
        İlana Git
      </GlassButton>
    ),
  },
}
