import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassModal } from './GlassModal'
import { GlassButton } from '../GlassButton'

const meta = {
  title: 'Components/GlassModal',
  component: GlassModal,
  tags: ['autodocs'],
  args: { open: false, onClose: fn(), title: 'Başlık', children: 'İçerik' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    dismissible: { control: 'boolean' },
    // open/onClose bilinçli olarak controlled — story'ler kendi state'ini yönetir
  },
} satisfies Meta<typeof GlassModal>

export default meta
type Story = StoryObj<typeof meta>

/** Temel akış: tetikleyici buton + footer aksiyonları. Kapanınca focus tetikleyiciye döner. */
export const Default: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <GlassButton onClick={() => setOpen(true)}>İlanı Kaldır</GlassButton>
        <GlassModal
          open={open}
          onClose={() => setOpen(false)}
          title="İlanı kaldır"
          description="Bu işlem geri alınamaz; ilan arşive taşınır."
          footer={
            <>
              <GlassButton onClick={() => setOpen(false)}>Vazgeç</GlassButton>
              <GlassButton prominent tint="var(--lg-danger, #ff3b30)" onClick={() => setOpen(false)}>
                Kaldır
              </GlassButton>
            </>
          }
        >
          “2019 Volvo XC60 T5 Inscription” ilanınız yayından kaldırılacak. Kayıtlı 3 alıcı mesajı korunur.
        </GlassModal>
      </>
    )
  },
}

/** Boyut ekseni: sm 400 · md 560 · lg 760 max-width (≥sm; mobilde hepsi bottom-sheet). */
export const Sizes: Story = {
  render: function Render() {
    const [openSize, setOpenSize] = useState<'sm' | 'md' | 'lg' | null>(null)
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <GlassButton key={s} onClick={() => setOpenSize(s)}>
            {s} modal
          </GlassButton>
        ))}
        <GlassModal
          open={openSize !== null}
          onClose={() => setOpenSize(null)}
          size={openSize ?? 'md'}
          title="Fiyat teklifi gönder"
          footer={<GlassButton prominent onClick={() => setOpenSize(null)}>Teklifi Gönder</GlassButton>}
        >
          Satıcıya 1.240.000 TL’lik teklifinizi iletmek üzeresiniz. Teklifiniz 48 saat geçerli kalır.
        </GlassModal>
      </div>
    )
  },
}

/** dismissible=false: backdrop ve Escape kapatmaz — kapanış yalnız footer aksiyonuyla. */
export const NonDismissible: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <GlassButton onClick={() => setOpen(true)}>Satışı Onayla</GlassButton>
        <GlassModal
          open={open}
          onClose={() => setOpen(false)}
          dismissible={false}
          size="sm"
          title="Satış sözleşmesi"
          description="Devam etmek için bir seçim yapmalısınız."
          footer={
            <>
              <GlassButton onClick={() => setOpen(false)}>Reddet</GlassButton>
              <GlassButton prominent onClick={() => setOpen(false)}>
                Kabul Et
              </GlassButton>
            </>
          }
        >
          Araç satış bedeli emanet hesabına aktarılacak ve plaka devri noterde tamamlanacaktır.
        </GlassModal>
      </>
    )
  },
}

/** title'sız kullanım: ariaLabel zorunlu — dialog'un erişilebilir adı buradan gelir. */
export const WithoutTitle: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <GlassButton onClick={() => setOpen(true)}>Fotoğrafı Büyüt</GlassButton>
        <GlassModal open={open} onClose={() => setOpen(false)} ariaLabel="İlan fotoğrafı önizleme" size="lg">
          <div
            style={{
              aspectRatio: '16 / 9',
              borderRadius: 'var(--lg-radius-media, 14px)',
              background: 'linear-gradient(135deg, #b45309, #24211b)',
            }}
            role="img"
            aria-label="Volvo XC60 ön cephe fotoğrafı"
          />
        </GlassModal>
      </>
    )
  },
}

/**
 * Responsive davranış: bp-sm (640px) altında modal bottom-sheet olur — alta yapışık,
 * tam genişlik, üst köşeler yuvarlak, alttan kayarak açılır (translateY animasyonu).
 */
export const MobileBottomSheet: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: function Render() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <GlassButton onClick={() => setOpen(true)}>Satıcıyı Ara</GlassButton>
        <GlassModal
          open={open}
          onClose={() => setOpen(false)}
          title="Satıcıyla iletişim"
          description="Görüşmeler kayıt altına alınmaz."
          footer={
            <GlassButton prominent onClick={() => setOpen(false)}>
              0 (5xx) xxx xx xx
            </GlassButton>
          }
        >
          Aramadan önce ilan numarasını (No: 2847391) hazır bulundurun.
        </GlassModal>
      </>
    )
  },
}
