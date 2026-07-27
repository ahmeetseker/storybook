import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassHero } from './GlassHero'
import { GlassButton } from '../GlassButton'
import { placeholderImage } from '../../demo/placeholderImage'
import { useTypewriter } from '../../motion/useTypewriter'
import { GlassBento } from '../GlassBento'
import { GlassSegmentedControl } from '../GlassSegmentedControl'
import { GlassInput } from '../GlassInput'

const ARAMA_ORNEKLERI = [
  'İzmir Urla imarlı arsa',
  'Deniz manzaralı tarla',
  'Krediye uygun sanayi parseli',
  'Gölbaşı yatırımlık arazi',
]

const DemoSearch = () => {
  const oneri = useTypewriter(ARAMA_ORNEKLERI)
  return (
  <form
    onSubmit={(e) => e.preventDefault()}
    style={{ display: 'flex', gap: 8, width: '100%' }}
  >
    <input
      aria-label="Arsa ara"
      placeholder={oneri || 'Arsa ara'}
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
}

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
  title: 'Bileşenler/Vitrin ve Yerleşim/GlassHero',
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

/** Sekme şeridi eyebrow slotunda, arama split varyantının search slotunda. */
export const SplitEyebrowVeArama: Story = {
  args: {
    variant: 'split',
    titleAs: 'h2',
    eyebrow: (
      <GlassSegmentedControl
        label="İlan türü"
        options={[
          { value: 'arsa', label: 'Arsa' },
          { value: 'konut', label: 'Konut' },
        ]}
      />
    ),
    title: 'Önce haritada gör, sonra karar ver',
    subtitle: 'Bölgeyi seç, doğrulanmış ilanlara konum üzerinden ulaş.',
    search: <GlassInput aria-label="Arsa ara" placeholder="Bölge, bütçe veya imar tercihini yaz" />,
    media: (
      <div
        style={{
          aspectRatio: '4 / 3',
          background: 'color-mix(in srgb, var(--lg-label) 6%, transparent)',
          borderRadius: 'var(--lg-radius-media)',
        }}
      />
    ),
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

const MapPreview = () => (
  <>
    <svg viewBox="0 0 200 100" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}>
      <path d="M0 62 Q40 40 70 55 T130 48 T200 60" fill="none" stroke="var(--lg-label-secondary)" strokeWidth="1" />
      <path d="M0 78 Q50 60 90 72 T200 74" fill="none" stroke="var(--lg-label-secondary)" strokeWidth="1" />
      <circle cx="72" cy="52" r="5" fill="var(--lg-accent)" />
      <circle cx="138" cy="47" r="4" fill="var(--lg-accent)" opacity="0.7" />
      <circle cx="45" cy="70" r="3.5" fill="var(--lg-accent)" opacity="0.5" />
    </svg>
    <span style={{ position: 'relative', fontSize: 12.5, fontWeight: 700 }}>Haritada 214 ilan · İzmir</span>
  </>
)

const DemoBento = () => (
  <GlassBento>
    <GlassBento.Feature
      image={placeholderImage('Urla', '#3a6f5f', '#1f4a3a', 800, 640)}
      price="4.250.000 TL"
      title="İzmir Urla Denize 900 m — İmarlı Köşe Parsel"
      meta="512 m² · Konut İmarlı · 8.301 TL/m²"
      badge="✓ EİDS"
    />
    <GlassBento.Stat value="12.400+" label="EİDS doğrulamalı aktif ilan" />
    <GlassBento.Cell>
      <MapPreview />
    </GlassBento.Cell>
    <GlassBento.Feature
      image={placeholderImage('Kaş', '#3a7a8a', '#1f4a5f', 480, 320)}
      price="6.900.000 TL"
      title="Kaş Manzaralı Arsa"
      badge="✓ EİDS"
      colSpan={1}
      rowSpan={1}
    />
    <GlassBento.Stat value="%98" label="tapu eşleşme oranı — ilanını 3 dakikada doğrulat" tone="accent" />
  </GlassBento>
)

export const BentoVitrin: Story = {
  name: 'Bento Vitrin (Konsept E)',
  args: {
    variant: 'search',
    search: <DemoSearch />,
    bento: <DemoBento />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Veri bento\'su: öne çıkan ilan (2×2) + istatistik hücresi + harita önizlemesi + ikinci ilan. ' +
          'Kademeli girişin son bloğu olarak yükselir; 860px altında 2 sütun, 500px altında tek sütun.',
      },
    },
  },
}

export const AmbientZemin: Story = {
  name: 'Ambient Zemin',
  args: {
    variant: 'centered',
    ambient: true,
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

export const GirisAnimasyonsuz: Story = {
  name: 'Giriş Animasyonsuz (animate=false)',
  args: { variant: 'centered', animate: false, actions: <GlassButton prominent>Başla</GlassButton> },
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
