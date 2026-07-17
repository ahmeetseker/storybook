import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassVitrin, type GlassVitrinItem } from './GlassVitrin'
import { placeholderImage } from '../../demo/placeholderImage'

const RENKLER: [string, string][] = [
  ['#3a6f5f', '#1f4a3a'],
  ['#3a7a8a', '#1f4a5f'],
  ['#8a6f3a', '#5f4a1f'],
  ['#3a5f8a', '#1f3a5f'],
  ['#6f3a5f', '#4a1f3a'],
  ['#5f6f3a', '#35431c'],
  ['#2e5f50', '#12312a'],
  ['#7a5a3a', '#4a331c'],
]
const ILLER = [
  'İzmir, Urla', 'Antalya, Kaş', 'Ankara, Gölbaşı', 'Bursa, Nilüfer', 'Tekirdağ, Şarköy',
  'Eskişehir, Tepebaşı', 'İzmir, Çeşme', 'Bursa, İznik', 'Muğla, Bodrum', 'İstanbul, Silivri',
  'Balıkesir, Ayvalık', 'Amasya, Merzifon', 'Muğla, Datça', 'Uşak, Merkez',
]
const TIPLER = [
  'İmarlı Köşe Parsel', 'Deniz Manzaralı Arsa', 'Yatırımlık Tarla', 'Villa İmarlı Arsa',
  'Bağ Evi İzinli Tarla', 'Sanayi İmarlı Parsel', 'Taş Ev İmarlı Arsa', 'Göl Kenarı Bahçe',
]
const FIYATLAR = [
  '4.250.000', '6.900.000', '1.850.000', '3.100.000', '980.000', '2.400.000', '5.400.000',
  '1.290.000', '7.750.000', '2.150.000', '3.980.000', '1.640.000', '4.870.000', '890.000',
  '2.760.000', '1.170.000', '5.980.000', '745.000', '3.420.000', '2.030.000',
]

const demoItems = (n: number): GlassVitrinItem[] =>
  Array.from({ length: n }, (_, i) => {
    const il = ILLER[(i * 3) % ILLER.length]
    const [c1, c2] = RENKLER[i % RENKLER.length]
    return {
      id: `ilan-${i}`,
      image: placeholderImage(il.split(', ')[1], c1, c2, 320, 240),
      price: `${FIYATLAR[i % FIYATLAR.length]} TL`,
      title: `${il.split(', ')[1]} ${TIPLER[(i * 7) % TIPLER.length]}`,
      location: il,
      eids: i % 3 !== 1,
      featured: i < 5,
    }
  })

const meta = {
  title: 'Components/GlassVitrin',
  component: GlassVitrin,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { items: demoItems(54) },
} satisfies Meta<typeof GlassVitrin>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'Micro (Konsept L)', args: { variant: 'micro' } }

export const Ruled: Story = { name: 'Ruled — Cetvel (Konsept M)', args: { variant: 'ruled' } }

export const Mosaic: Story = {
  name: 'Mosaic — Fiyat Overlay (Konsept N)',
  args: { variant: 'mosaic', items: demoItems(60) },
}

export const List: Story = {
  name: 'List — Mikro Satırlar (Konsept O)',
  args: { variant: 'list', items: demoItems(36) },
}

export const Banded: Story = {
  name: 'Banded — Doping Bandı (Konsept P)',
  args: { variant: 'banded', items: demoItems(50) },
}

export const Playground: Story = { args: { variant: 'micro', items: demoItems(18) } }

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    variant: 'micro',
    items: demoItems(9).map((i) => ({
      ...i,
      title: 'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine Uzun Başlıklı Parsel',
    })),
  },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { variant: 'mosaic', items: demoItems(10) },
  parameters: {
    docs: {
      description: {
        story:
          'Her kart gerçek <button> — accessible name başlıktan gelir (mosaic\'te görsel gizli metinle). ' +
          'Görseller dekoratif (alt=""); EİDS rozeti aria-hidden. Mosaic\'te başlık overlay\'i :focus-visible\'da da açılır. ' +
          'Klavyeyle gezinip halkayı doğrulayın.',
      },
    },
  },
}

export const VaryantKarsilastirma: Story = {
  name: 'Varyant Karşılaştırma',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
      {(
        [
          ['micro', 'Mikro ızgara — 54 ilan, fiyat önde', demoItems(27)],
          ['ruled', 'Cetvel — sıfır boşluk, hairline hücreler', demoItems(27)],
          ['mosaic', 'Mozaik — görsel duvarı, fiyat chip\'te', demoItems(33)],
          ['list', 'Liste — üç kolonlu mikro satırlar', demoItems(18)],
          ['banded', 'Bantlı — üstte doping rafı', demoItems(23)],
        ] as const
      ).map(([variant, note, items]) => (
        <section key={variant}>
          <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lg-label-secondary)' }}>
            variant="{variant}" <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>— {note}</span>
          </h3>
          <GlassVitrin {...args} variant={variant} items={items} />
        </section>
      ))}
    </div>
  ),
}
