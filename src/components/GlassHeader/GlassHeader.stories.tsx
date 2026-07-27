import type { CSSProperties, ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassHeader, type GlassHeaderLink } from './GlassHeader'
import { GlassButton } from '../GlassButton'
import { placeholderImage } from '../../demo/placeholderImage'

const navLinks: GlassHeaderLink[] = [
  { label: 'Satılık Arsa', active: true },
  { label: 'Harita' },
  { label: 'Mağazalar' },
  { label: 'Fiyat Analizi' },
  { label: 'Kurumsal' },
]

/** Parsel-pin monogram — harf-kutusu logo kalıbı yerine özel işaret. */
const Mark = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--lg-accent)" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
    <path d="M12 21.5C12 21.5 4.5 15.4 4.5 9.8a7.5 7.5 0 0 1 15 0c0 5.6-7.5 11.7-7.5 11.7z" />
    <path d="M8.6 8.2h6.8M8.6 11.6h6.8M12 5v9.8" strokeWidth="1.2" opacity="0.85" />
  </svg>
)

const Logo = () => (
  <>
    <Mark />
    ArsaPazar
  </>
)

const Action = () => <GlassButton size="sm" prominent>İlan Ver</GlassButton>

const SecondaryAction = () => <button type="button">Giriş Yap</button>

/** command varyantı için segmentli arama rayı demosu (Konum · İmar · Bütçe). */
const railSegment: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  padding: '5px 16px',
  borderRadius: 999,
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  textAlign: 'start',
  font: 'inherit',
}

const SearchRail = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      background: 'var(--lg-surface)',
      border: '1px solid var(--lg-hairline)',
      borderRadius: 999,
      padding: 3,
      boxShadow: '0 4px 16px color-mix(in srgb, var(--lg-label) 6%, transparent)',
    }}
  >
    {(
      [
        ['Konum', 'İzmir, Urla'],
        ['İmar', 'Konut · Villa'],
        ['Bütçe', '≤ 5.000.000 TL'],
      ] as const
    ).map(([etiket, deger], i) => (
      <button key={etiket} type="button" style={{ ...railSegment, borderLeft: i ? '1px solid var(--lg-hairline)' : 'none', borderRadius: i === 0 ? '999px 0 0 999px' : 'initial' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--lg-label-secondary)' }}>{etiket}</span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--lg-label)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deger}</span>
      </button>
    ))}
    <span style={{ flex: 'none', padding: '0 4px 0 8px' }}>
      <GlassButton size="sm" prominent>Ara</GlassButton>
    </span>
  </div>
)

/** Story zemini — header'ın altında gerçekçi sayfa dokusu. */
const PageBody = ({ lines = 14 }: { lines?: number }) => (
  <div style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 20px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ height: 28, width: '38%', borderRadius: 8, background: 'color-mix(in srgb, var(--lg-label) 8%, transparent)' }} />
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} style={{ height: 13, width: `${88 - (i % 5) * 9}%`, borderRadius: 6, background: 'color-mix(in srgb, var(--lg-label) 5%, transparent)' }} />
    ))}
  </div>
)

const meta = {
  title: 'Bileşenler/Navigasyon/GlassHeader',
  component: GlassHeader,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    logo: <Logo />,
    links: navLinks,
    action: <Action />,
    secondaryAction: <SecondaryAction />,
  },
} satisfies Meta<typeof GlassHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Islands (Üç Ada)',
  render: (args) => (
    <div style={{ minHeight: '180vh', background: 'var(--lg-bg)' }}>
      <GlassHeader {...args} variant="islands" />
      <PageBody lines={40} />
    </div>
  ),
}

export const Command: Story = {
  name: 'Command (Arama Omurgası)',
  args: {
    variant: 'command',
    links: [{ label: 'Kaydedilenler' }, { label: 'Mesajlar' }, { label: 'İlanlarım' }],
    search: <SearchRail />,
    searchSummary: 'İzmir, Urla · Konut · ≤ 5M',
    secondaryAction: undefined,
  },
  render: (args) => (
    <div style={{ minHeight: '180vh', background: 'var(--lg-bg)' }}>
      <GlassHeader {...args} />
      <PageBody lines={40} />
    </div>
  ),
}

export const Masthead: Story = {
  name: 'Masthead (Kadastral)',
  args: {
    variant: 'masthead',
    meta: '81 il · 12.400+ ilan · EİDS doğrulamalı',
    secondaryAction: undefined,
  },
  render: (args) => (
    <div style={{ minHeight: '180vh', background: 'var(--lg-bg)' }}>
      <GlassHeader {...args} />
      <PageBody lines={40} />
    </div>
  ),
}

export const Overlay: Story = {
  name: 'Overlay (Galeri Eşiği)',
  args: { variant: 'overlay', secondaryAction: undefined },
  render: (args) => (
    <div style={{ minHeight: '180vh', background: 'var(--lg-bg)' }}>
      <div style={{ position: 'relative', minHeight: 460 }}>
        <img
          src={placeholderImage('Ege Sahili', '#2e5f50', '#12312a', 1600, 560)}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--lg-scrim, rgba(10,12,16,0.55)), transparent 55%)' }} />
        <GlassHeader {...args} />
        <div style={{ position: 'relative', padding: '200px 20px 60px', maxWidth: 1120, margin: '0 auto' }}>
          <h2 style={{ margin: 0, color: 'var(--lg-on-scrim, #fff)', fontSize: 40, letterSpacing: '-0.03em' }}>
            Deniz manzaralı yatırım fırsatları
          </h2>
        </div>
      </div>
      <PageBody lines={30} />
    </div>
  ),
}

export const Playground: Story = {}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    links: [
      ...navLinks,
      { label: 'Krediye Uygun Arsalar' },
      { label: 'Yatırım Rehberi' },
      { label: 'Bölge Raporları' },
    ],
  },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  parameters: {
    docs: {
      description: {
        story:
          'Tab sırası: linkler (soldan sağa) → ikincil aksiyon → CTA → hamburger. ' +
          'Aktif linkte aria-current="page"; kayan cam gösterge aria-hidden ve reduced-motion\'da anlıktır. ' +
          'Overlay kompakt rayı scroll öncesi inert\'tir (focus sızmaz). Klavyeyle gezinip :focus-visible halkasını doğrulayın.',
      },
    },
  },
}

const compareLabel: CSSProperties = {
  margin: '0 0 10px',
  padding: '0 20px',
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--lg-label-secondary)',
}

const CompareSection = ({ title, note, children }: { title: string; note: string; children: ReactNode }) => (
  <section style={{ borderBottom: '1px solid var(--lg-hairline)', paddingBottom: 36 }}>
    <h3 style={compareLabel}>
      {title} <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>— {note}</span>
    </h3>
    {children}
  </section>
)

export const VaryantKarsilastirma: Story = {
  name: 'Varyant Karşılaştırma',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44, paddingBottom: 60, background: 'var(--lg-bg)' }}>
      <CompareSection title='variant="islands"' note="genel site header'ı; nav kapsülde, seçilide kayan cam pill">
        <GlassHeader {...args} variant="islands" sticky={false} />
      </CompareSection>

      <CompareSection title='variant="command"' note="arama/harita sayfaları; menü değil arama rayı merkezde">
        <GlassHeader
          {...args}
          variant="command"
          sticky={false}
          links={[{ label: 'Kaydedilenler' }, { label: 'Mesajlar' }, { label: 'İlanlarım' }]}
          search={<SearchRail />}
          searchSummary="İzmir, Urla · Konut · ≤ 5M"
          secondaryAction={undefined}
        />
      </CompareSection>

      <CompareSection title='variant="masthead"' note="kurumsal/analiz sayfaları; yayın kimliği + ince indeks rayı">
        <GlassHeader
          {...args}
          variant="masthead"
          sticky={false}
          meta="81 il · 12.400+ ilan · EİDS doğrulamalı"
          secondaryAction={undefined}
        />
      </CompareSection>

      <CompareSection title='variant="overlay"' note="görsel ağırlıklı ana sayfa/kampanya; yüzeysiz, fotoğraf üstünde">
        <div style={{ position: 'relative', minHeight: 300 }}>
          <img
            src={placeholderImage('Ege Sahili', '#2e5f50', '#12312a', 1600, 400)}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--lg-scrim, rgba(10,12,16,0.5)), transparent 60%)' }} />
          <GlassHeader {...args} variant="overlay" sticky={false} secondaryAction={undefined} />
        </div>
      </CompareSection>
    </div>
  ),
}
