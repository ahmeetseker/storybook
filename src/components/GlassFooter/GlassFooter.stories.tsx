import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassFooter, type GlassFooterColumn } from './GlassFooter'
import { GlassButton } from '../GlassButton'

const columns: GlassFooterColumn[] = [
  { title: 'Kurumsal', links: [{ label: 'Hakkımızda' }, { label: 'Kariyer' }, { label: 'Basın' }, { label: 'İletişim' }] },
  { title: 'Destek', links: [{ label: 'Yardım Merkezi' }, { label: 'Güvenli Alışveriş' }, { label: 'Ücretler ve Doping' }, { label: 'Canlı Destek' }] },
  { title: 'Keşfet', links: [{ label: 'Satılık Arsa' }, { label: 'Harita' }, { label: 'Mağazalar' }, { label: 'Fiyat Analizi' }] },
  { title: 'Yasal', links: [{ label: 'KVKK Aydınlatma' }, { label: 'Çerez Tercihleri' }, { label: 'Kullanım Koşulları' }, { label: 'Üyelik Sözleşmesi' }] },
]

const Brand = () => (
  <>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--lg-label)' }}>
      <span aria-hidden style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--lg-accent)', color: '#fff', display: 'inline-grid', placeItems: 'center', fontSize: 13, fontWeight: 800 }}>A</span>
      ArsaPazar
    </span>
    <span>EİDS doğrulamalı arsa ilan platformu. Tapu ve imar bilgisi doğrulanmadan ilan yayına alınmaz.</span>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--lg-success)', fontWeight: 600, fontSize: 13 }}>✓ 12.400+ doğrulanmış ilan</span>
  </>
)

const SocialIcon = ({ label, d }: { label: string; d: string }) => (
  <a href="#sosyal" aria-label={label} style={{ display: 'inline-grid', placeItems: 'center', width: 34, height: 34, borderRadius: 999, border: '1px solid var(--lg-hairline)', color: 'var(--lg-label-secondary)' }}>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  </a>
)

const Social = () => (
  <>
    <SocialIcon label="X (Twitter)" d="M4 4l7.2 9.6L4.4 20h2.6l5.4-5.1 3.8 5.1H20l-7.5-10L19.4 4h-2.6l-4.9 4.7L8.4 4H4z" />
    <SocialIcon label="Instagram" d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zM17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 12.9a4.9 4.9 0 1 1 0-9.8 4.9 4.9 0 0 1 0 9.8zM17.4 7.6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
    <SocialIcon label="YouTube" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
    <SocialIcon label="LinkedIn" d="M6.5 8.5V19H3.4V8.5h3.1zM4.9 4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM20.6 13v6h-3.1v-5.4c0-1.4-.5-2.3-1.7-2.3-.9 0-1.5.6-1.7 1.2-.1.2-.1.5-.1.8V19h-3.1V8.5h3.1v1.4c.4-.6 1.2-1.6 2.9-1.6 2.1 0 3.7 1.4 3.7 4.7z" />
  </>
)

const legal = (
  <>
    © 2026 ArsaPazar Bilgi Teknolojileri A.Ş. · Her hakkı saklıdır ·{' '}
    <a href="#kvkk" style={{ color: 'inherit' }}>KVKK</a> ·{' '}
    <a href="#cerez" style={{ color: 'inherit' }}>Çerez Tercihleri</a>
  </>
)

const meta = {
  title: 'Components/GlassFooter',
  component: GlassFooter,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { columns, legal, brand: <Brand />, social: <Social /> },
} satisfies Meta<typeof GlassFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {}

export const Slim: Story = {
  args: { variant: 'slim', columns: [{ title: 'Yasal', links: [{ label: 'KVKK' }, { label: 'Çerezler' }, { label: 'Koşullar' }, { label: 'Yardım' }] }] },
}

const ctaContent = (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <strong style={{ fontSize: 19, letterSpacing: '-0.022em' }}>Arsanı bugün listele</strong>
      <span style={{ fontSize: 14, color: 'var(--lg-label-secondary)' }}>İlk ilan ücretsiz — EİDS doğrulaması dahil.</span>
    </div>
    <GlassButton prominent size="lg">İlan Ver</GlassButton>
  </>
)

export const Cta: Story = {
  name: 'CTA Bantlı',
  args: { variant: 'cta', cta: ctaContent },
}

export const Centered: Story = { args: { variant: 'centered', brand: 'ArsaPazar' } }

const newsletterContent = (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <strong style={{ fontSize: 17, letterSpacing: '-0.022em' }}>Fırsatları kaçırma</strong>
      <span style={{ fontSize: 14, color: 'var(--lg-label-secondary)' }}>Haftalık yeni ilan ve bölge raporu bülteni.</span>
    </div>
    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input
        aria-label="E-posta adresi"
        placeholder="e-posta@ornek.com"
        style={{ minHeight: 'var(--lg-control-md, 40px)', padding: '0 14px', borderRadius: 999, border: '1px solid var(--lg-hairline)', background: 'var(--lg-surface)', color: 'var(--lg-label)', font: 'inherit', fontSize: 14, outline: 'none' }}
      />
      <GlassButton prominent type="submit">Abone Ol</GlassButton>
    </form>
  </>
)

export const Newsletter: Story = {
  name: 'Bülten Kayıtlı',
  args: { variant: 'newsletter', newsletter: newsletterContent },
}

export const VaryantKarsilastirma: Story = {
  name: 'Varyant Karşılaştırma',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 40 }}>
      {(['columns', 'slim', 'cta', 'centered', 'newsletter'] as const).map((variant) => (
        <section key={variant}>
          <h3 style={{ margin: '0 0 10px', padding: '0 20px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lg-label-secondary)' }}>
            variant="{variant}"
          </h3>
          <GlassFooter
            {...args}
            variant={variant}
            cta={variant === 'cta' ? ctaContent : undefined}
            newsletter={variant === 'newsletter' ? newsletterContent : undefined}
          />
        </section>
      ))}
    </div>
  ),
}
