import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassHeader, type GlassHeaderLink } from './GlassHeader'
import { GlassButton } from '../GlassButton'

const navLinks: GlassHeaderLink[] = [
  { label: 'Satılık Arsa', active: true },
  { label: 'Harita' },
  { label: 'Mağazalar' },
  { label: 'Fiyat Analizi' },
  { label: 'Kurumsal' },
  { label: 'Yardım' },
]

const Logo = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <span
      aria-hidden
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        background: 'var(--lg-accent)',
        color: '#fff',
        display: 'inline-grid',
        placeItems: 'center',
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      A
    </span>
    ArsaPazar
  </span>
)

const Actions = () => (
  <>
    <GlassButton size="sm">Giriş Yap</GlassButton>
    <GlassButton size="sm" prominent>İlan Ver</GlassButton>
  </>
)

// material="glass" kapsülünde actions'a cam component verilmez (cam üstüne cam
// yasağı) — düz, token stilli butonlar kullanılır. Bkz. rules.md §5, §12.
const FlatActions = () => (
  <>
    <button
      type="button"
      style={{ border: 'none', background: 'none', color: 'inherit', font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px 12px', borderRadius: 999 }}
    >
      Giriş Yap
    </button>
    <button
      type="button"
      style={{ border: 'none', background: 'var(--lg-accent)', color: '#fff', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '8px 14px', borderRadius: 999 }}
    >
      İlan Ver
    </button>
  </>
)

const Utility = () => (
  <>
    <span>0 (232) 456 78 90</span>
    <a href="#kurumsal" style={{ color: 'inherit' }}>Kurumsal Çözümler</a>
    <a href="#yardim" style={{ color: 'inherit' }}>Yardım Merkezi</a>
    <span>TR ▾</span>
  </>
)

const meta = {
  title: 'Components/GlassHeader',
  component: GlassHeader,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { logo: <Logo />, links: navLinks, actions: <Actions /> },
} satisfies Meta<typeof GlassHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Altına içerik koyup sticky davranışını gösteren sarmalayıcı */
const PageBody = () => (
  <div style={{ height: 480, padding: '24px 20px', color: 'var(--lg-label-secondary)' }}>
    Sayfa içeriği — header üstte sabit kalır.
  </div>
)

export const Default: Story = {
  render: (args) => (
    <div>
      <GlassHeader {...args} />
      <PageBody />
    </div>
  ),
}

export const Playground: Story = {}

export const Centered: Story = { args: { variant: 'centered' } }

export const Split: Story = { args: { variant: 'split', utility: <Utility /> } }

export const Capsule: Story = { args: { variant: 'capsule' } }

export const Minimal: Story = { args: { variant: 'minimal' } }

export const CamMalzeme: Story = {
  name: 'Cam Malzeme (glass)',
  args: { material: 'glass', variant: 'capsule', actions: <FlatActions /> },
  render: (args) => (
    <div style={{ minHeight: 320, background: 'linear-gradient(135deg, #3a6f5f, #1f4a3a 55%, #8a6f3a)', paddingBottom: 40 }}>
      <GlassHeader {...args} />
      <PageBody />
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    links: [
      ...navLinks,
      { label: 'Krediye Uygun Arsalar' },
      { label: 'Yatırım Rehberi' },
      { label: 'Bölge Raporları' },
      { label: 'Sık Sorulan Sorular' },
    ],
  },
}

export const VaryantKarsilastirma: Story = {
  name: 'Varyant Karşılaştırma',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 40 }}>
      {(['bar', 'centered', 'split', 'capsule', 'minimal'] as const).map((variant) => (
        <section key={variant}>
          <h3 style={{ margin: '0 0 10px', padding: '0 20px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lg-label-secondary)' }}>
            variant="{variant}"
          </h3>
          <GlassHeader
            {...args}
            variant={variant}
            sticky={false}
            utility={variant === 'split' ? <Utility /> : undefined}
          />
        </section>
      ))}
    </div>
  ),
}
