import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassBento } from './GlassBento'
import { placeholderImage } from '../../demo/placeholderImage'

const meta = {
  title: 'Components/GlassBento',
  component: GlassBento,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof GlassBento>

export default meta
type Story = StoryObj<typeof meta>

const MapPreview = () => (
  <>
    <svg
      viewBox="0 0 200 100"
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}
    >
      <path d="M0 62 Q40 40 70 55 T130 48 T200 60" fill="none" stroke="var(--lg-label-secondary)" strokeWidth="1" />
      <path d="M0 78 Q50 60 90 72 T200 74" fill="none" stroke="var(--lg-label-secondary)" strokeWidth="1" />
      <circle cx="72" cy="52" r="5" fill="var(--lg-accent)" />
      <circle cx="138" cy="47" r="4" fill="var(--lg-accent)" opacity="0.7" />
      <circle cx="45" cy="70" r="3.5" fill="var(--lg-accent)" opacity="0.5" />
    </svg>
    <span style={{ position: 'relative', fontSize: 12.5, fontWeight: 700 }}>Haritada 214 ilan · İzmir</span>
  </>
)

export const Default: Story = {
  name: 'Veri Bento (Konsept E)',
  args: {
    children: (
      <>
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
      </>
    ),
  },
}

export const Playground: Story = {
  args: {
    columns: 4,
    children: (
      <>
        <GlassBento.Feature
          image={placeholderImage('Urla', '#3a6f5f', '#1f4a3a', 800, 640)}
          price="4.250.000 TL"
          title="İzmir Urla Köşe Parsel"
          badge="✓ EİDS"
        />
        <GlassBento.Stat value="81 il" label="kapsama alanı" />
        <GlassBento.Stat value="4.8/5" label="kullanıcı puanı" />
        <GlassBento.Stat value="%98" label="tapu eşleşme oranı" tone="accent" />
        <GlassBento.Stat value="12.400+" label="aktif ilan" />
      </>
    ),
  },
}

export const UcSutun: Story = {
  name: 'Üç Sütun',
  args: {
    columns: 3,
    children: (
      <>
        <GlassBento.Feature
          image={placeholderImage('Gölbaşı', '#8a6f3a', '#5f4a1f', 800, 640)}
          price="1.850.000 TL"
          title="Ankara Gölbaşı Yatırımlık Tarla"
          meta="1.240 m² · Yol Cepheli"
        />
        <GlassBento.Stat value="214" label="bölgede aktif ilan" />
        <GlassBento.Stat value="1.492 TL" label="ortalama m² fiyatı" tone="accent" />
      </>
    ),
  },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { children: null },
  parameters: {
    docs: {
      description: {
        story:
          'Feature kartları gerçek <button>; görselleri dekoratif (alt=""), içerik metinle verilir. ' +
          'Veri hücreleri statik metindir. Tab sırası DOM sırasıdır; :focus-visible halkası karttadır.',
      },
    },
  },
  render: () => (
    <GlassBento>
      <GlassBento.Feature
        image={placeholderImage('Urla', '#3a6f5f', '#1f4a3a', 800, 640)}
        price="4.250.000 TL"
        title="Klavye ile odaklan — halka kartta"
        badge="✓ EİDS"
      />
      <GlassBento.Stat value="Tab" label="sırası DOM sırasıdır" />
      <GlassBento.Stat value="alt=''" label="görseller dekoratif" />
    </GlassBento>
  ),
}
