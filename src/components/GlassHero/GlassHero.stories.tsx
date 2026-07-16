import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassHero } from './GlassHero'
import { GlassButton } from '../GlassButton'
import { placeholderImage } from '../../demo/placeholderImage'

const DemoSearch = () => (
  <form
    onSubmit={(e) => e.preventDefault()}
    style={{ display: 'flex', gap: 8, width: '100%' }}
  >
    <input
      aria-label="Arsa ara"
      placeholder='"İzmir Urla imarlı arsa" yaz, gerisini bize bırak'
      style={{
        flex: 1,
        minHeight: 'var(--lg-control-lg, 48px)',
        padding: '0 18px',
        borderRadius: 999,
        border: '1px solid var(--lg-hairline)',
        background: 'var(--lg-surface)',
        color: 'var(--lg-label)',
        font: 'inherit',
        fontSize: 15,
        outline: 'none',
      }}
    />
    <GlassButton prominent size="lg" type="submit">Ara</GlassButton>
  </form>
)

const QuickLinks = () => (
  <>
    {['İzmir imarlı', 'Ankara tarla', 'Deniz manzaralı', 'Krediye uygun', 'Sanayi imarlı'].map((q) => (
      <a key={q} href="#arama" style={{ color: 'var(--lg-accent)', textDecoration: 'none', fontWeight: 500 }}>
        {q}
      </a>
    ))}
  </>
)

const StatPanel = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
    }}
  >
    {[
      ['12.400+', 'Doğrulanmış ilan'],
      ['%98', 'EİDS eşleşme oranı'],
      ['81 il', 'Kapsama alanı'],
      ['4.8/5', 'Kullanıcı puanı'],
    ].map(([deger, etiket]) => (
      <div
        key={etiket}
        style={{
          background: 'var(--lg-surface)',
          border: '1px solid var(--lg-hairline)',
          borderRadius: 'var(--lg-radius-card, 20px)',
          padding: '22px 20px',
        }}
      >
        <strong style={{ display: 'block', fontSize: 26, letterSpacing: '-0.022em' }}>{deger}</strong>
        <span style={{ fontSize: 13, color: 'var(--lg-label-secondary)' }}>{etiket}</span>
      </div>
    ))}
  </div>
)

const meta = {
  title: 'Components/GlassHero',
  component: GlassHero,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    title: 'Arsa yatırımının doğrulanmış adresi',
    subtitle: 'Tapu ve imar bilgisi EİDS ile doğrulanmış 12.000+ ilan arasında doğal dille ara.',
  },
} satisfies Meta<typeof GlassHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'search', search: <DemoSearch />, quickLinks: <QuickLinks /> },
}

export const Playground: Story = {}

export const Split: Story = {
  args: {
    variant: 'split',
    title: 'Kurumsal portföyünüzü tek panelden yönetin',
    subtitle: 'Toplu ilan yükleme, vitrin sayfası ve performans raporlarıyla kurumsal hesap.',
    actions: (
      <>
        <GlassButton prominent size="lg">Kurumsal Başvuru</GlassButton>
        <GlassButton size="lg">Tanıtımı İzle</GlassButton>
      </>
    ),
    media: <StatPanel />,
  },
}

export const Showcase: Story = {
  args: {
    variant: 'showcase',
    title: 'Deniz manzaralı yatırım fırsatları',
    subtitle: 'Ege ve Akdeniz hattında, imar durumu doğrulanmış seçkin parseller.',
    actions: <GlassButton prominent size="lg">Fırsatları Gör</GlassButton>,
    media: <img src={placeholderImage('Ege Sahili', '#3a7a8a', '#1f4a5f', 1600, 640)} alt="" />,
  },
}

export const Centered: Story = {
  args: {
    variant: 'centered',
    title: 'İlanını 3 dakikada yayına al',
    subtitle: 'EİDS doğrulaması, akıllı fiyat önerisi ve moderasyon — hepsi tek sihirbazda.',
    actions: (
      <>
        <GlassButton prominent size="lg">İlan Ver</GlassButton>
        <GlassButton size="lg">Nasıl Çalışır?</GlassButton>
      </>
    ),
  },
}

export const H1Baslik: Story = {
  name: 'h1 Başlık (titleAs)',
  args: { titleAs: 'h1', variant: 'centered', actions: <GlassButton prominent>Başla</GlassButton> },
}

export const VaryantKarsilastirma: Story = {
  name: 'Varyant Karşılaştırma',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 40 }}>
      {(
        [
          ['search', { search: <DemoSearch />, quickLinks: <QuickLinks /> }],
          [
            'split',
            {
              title: 'Kurumsal portföyünüzü tek panelden yönetin',
              subtitle: 'Toplu ilan yükleme, vitrin sayfası ve performans raporlarıyla kurumsal hesap.',
              actions: <GlassButton prominent size="lg">Kurumsal Başvuru</GlassButton>,
              media: <StatPanel />,
            },
          ],
          [
            'showcase',
            {
              title: 'Deniz manzaralı yatırım fırsatları',
              subtitle: 'Ege ve Akdeniz hattında, imar durumu doğrulanmış seçkin parseller.',
              actions: <GlassButton prominent size="lg">Fırsatları Gör</GlassButton>,
              media: <img src={placeholderImage('Ege Sahili', '#3a7a8a', '#1f4a5f', 1600, 640)} alt="" />,
            },
          ],
          [
            'centered',
            {
              title: 'İlanını 3 dakikada yayına al',
              subtitle: 'EİDS doğrulaması, akıllı fiyat önerisi ve moderasyon — hepsi tek sihirbazda.',
              actions: <GlassButton prominent size="lg">İlan Ver</GlassButton>,
            },
          ],
        ] as const
      ).map(([variant, extra]) => (
        <section key={variant}>
          <h3 style={{ margin: '0 0 10px', padding: '0 20px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lg-label-secondary)' }}>
            variant="{variant}"
          </h3>
          <GlassHero {...args} {...extra} variant={variant} />
        </section>
      ))}
    </div>
  ),
}
