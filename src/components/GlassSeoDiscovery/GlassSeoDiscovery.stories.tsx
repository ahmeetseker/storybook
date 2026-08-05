import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSeoDiscovery, type GlassSeoDiscoveryColumn } from './GlassSeoDiscovery'
import { placeholderImage } from '../../demo/placeholderImage'

const TONLAR: [string, string][] = [
  ['#3a6f5f', '#1f4a3a'],
  ['#8a6f3a', '#5f4a1f'],
  ['#3a7a8a', '#1f4a5f'],
  ['#6f3a5f', '#4a1f3a'],
  ['#5f6f3a', '#35431c'],
]

const gorsel = (etiket: string, index: number) => {
  const [from, to] = TONLAR[index % TONLAR.length]
  return placeholderImage(etiket, from, to, 160, 160)
}

/** Uzun kuyruk açılış sayfaları — bağlantı metni hedef sayfanın H1'idir. */
const kolonlar: GlassSeoDiscoveryColumn[] = [
  {
    id: 'yatirim',
    title: 'Yatırımlık arsa',
    href: '#yatirimlik-arsa',
    links: [
      { id: 'y1', label: 'Ankara yatırımlık arsa fırsatları', meta: 'Ankara · 128 ilan', href: '#', image: gorsel('Ankara', 0) },
      { id: 'y2', label: 'Eskişehir yol cepheli yatırımlık tarla', meta: 'Eskişehir · 64 ilan', href: '#', image: gorsel('Eskişehir', 1) },
      { id: 'y3', label: 'İstanbul Silivri imarlı yatırım arsası', meta: 'İstanbul · 52 ilan', href: '#', image: gorsel('Silivri', 2) },
      { id: 'y4', label: 'Konya Karatay ucuz yatırımlık arsa', meta: 'Konya · 47 ilan', href: '#', image: gorsel('Konya', 3) },
      { id: 'y5', label: 'Kayseri sanayi imarlı parsel', meta: 'Kayseri · 31 ilan', href: '#', image: gorsel('Kayseri', 4) },
    ],
  },
  {
    id: 'tarim',
    title: 'Tarım ve zeytinlik',
    href: '#tarim',
    links: [
      { id: 't1', label: "Ege'de satılık zeytinlik", meta: 'İzmir, Muğla · 96 ilan', href: '#', image: gorsel('Ege', 1) },
      { id: 't2', label: "Balıkesir Ayvalık'ta zeytinlik sahibi olun", meta: 'Balıkesir · 38 ilan', href: '#', image: gorsel('Ayvalık', 2) },
      { id: 't3', label: "Malatya'da satılık kayısı bahçesi", meta: 'Malatya · 24 ilan', href: '#', image: gorsel('Malatya', 3) },
      { id: 't4', label: "Manisa'da sulanabilir bağ arazisi", meta: 'Manisa · 41 ilan', href: '#', image: gorsel('Manisa', 4) },
      { id: 't5', label: "Antalya'da seracılığa uygun tarla", meta: 'Antalya · 29 ilan', href: '#', image: gorsel('Antalya', 0) },
    ],
  },
  {
    id: 'sahil',
    title: 'Deniz ve manzara',
    href: '#sahil',
    links: [
      { id: 's1', label: 'Muğla Datça deniz manzaralı arsa', meta: 'Muğla · 57 ilan', href: '#', image: gorsel('Datça', 2) },
      { id: 's2', label: "İzmir Çeşme'de villa imarlı arsa", meta: 'İzmir · 44 ilan', href: '#', image: gorsel('Çeşme', 3) },
      { id: 's3', label: "Antalya Kaş'ta denize yürüme mesafesi arsa", meta: 'Antalya · 22 ilan', href: '#', image: gorsel('Kaş', 4) },
      { id: 's4', label: 'Çanakkale Assos taş ev yapılabilir arsa', meta: 'Çanakkale · 18 ilan', href: '#', image: gorsel('Assos', 0) },
      { id: 's5', label: "Balıkesir Edremit'te dağ manzaralı bağ evi arsası", meta: 'Balıkesir · 26 ilan', href: '#', image: gorsel('Edremit', 1) },
    ],
  },
  {
    id: 'yazlik',
    title: 'Hobi ve yazlık',
    href: '#yazlik',
    links: [
      { id: 'h1', label: "İstanbul Çatalca'da hobi bahçesi", meta: 'İstanbul · 33 ilan', href: '#', image: gorsel('Çatalca', 3) },
      { id: 'h2', label: "Tekirdağ Şarköy'de yazlık arsa", meta: 'Tekirdağ · 39 ilan', href: '#', image: gorsel('Şarköy', 4) },
      { id: 'h3', label: "Bursa İznik'te göl kenarı bahçe", meta: 'Bursa · 21 ilan', href: '#', image: gorsel('İznik', 0) },
      { id: 'h4', label: "Kocaeli Kandıra'da köy evi arsası", meta: 'Kocaeli · 17 ilan', href: '#', image: gorsel('Kandıra', 1) },
      { id: 'h5', label: "Ankara Gölbaşı'nda müstakil ev arsası", meta: 'Ankara · 35 ilan', href: '#', image: gorsel('Gölbaşı', 2) },
    ],
  },
]

const meta = {
  title: 'Bileşenler/Vitrin ve Yerleşim/GlassSeoDiscovery',
  component: GlassSeoDiscovery,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { columns: kolonlar },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['ranked', 'plain'],
      description: 'ranked: kartlı satır + hayalet rakam · plain: çerçevesiz yoğun liste',
    },
    columnCount: { control: 'inline-radio', options: [3, 4, 5] },
    headingLevel: { control: 'inline-radio', options: [2, 3, 4] },
  },
} satisfies Meta<typeof GlassSeoDiscovery>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'Ranked — footer üstü raf' }

export const Playground: Story = {
  args: { variant: 'ranked', columnCount: 4, headingLevel: 3 },
}

export const Varyantlar: Story = {
  name: 'Varyantlar',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
      {(
        [
          ['ranked', 'Kartlı satır — görsel, iki satır metin, hayalet sıra rakamı'],
          ['plain', 'Çerçevesiz yoğun liste — ikincil sayfaların alt bandı'],
        ] as const
      ).map(([variant, note]) => (
        <section key={variant}>
          <h3
            style={{
              margin: '0 0 12px',
              color: 'var(--lg-label-secondary)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            variant="{variant}"{' '}
            <span style={{ fontWeight: 500, letterSpacing: 0, textTransform: 'none' }}>— {note}</span>
          </h3>
          <GlassSeoDiscovery {...args} variant={variant} />
        </section>
      ))}
    </div>
  ),
}

export const KolonSayisi: Story = {
  name: 'Kolon sayısı',
  args: { columnCount: 3, columns: kolonlar.slice(0, 3) },
}

export const GorselsizVeSayacsiz: Story = {
  name: 'Durumlar — görselsiz, sayaçsız, hub linksiz',
  args: {
    columns: kolonlar.slice(0, 4).map((column) => ({
      ...column,
      href: undefined,
      links: column.links.map(({ id, label, href }) => ({ id, label, href })),
    })),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Görsel, meta ve hub bağlantısı opsiyoneldir; hiçbiri yokken satır yalnız anahtar ifadeye iner. ' +
          'Görsel bir kolonda ya hepsinde olur ya hiçbirinde — karışık veri hizayı bozar.',
      },
    },
  },
}

export const UzunIcerik: Story = {
  name: 'Uzun içerik',
  args: {
    columns: kolonlar.slice(0, 4).map((column, index) => ({
      ...column,
      title: index === 0 ? 'Yatırımlık arsa ve imar planı hazır parseller' : column.title,
      links: column.links.map((link, linkIndex) =>
        linkIndex === 0
          ? {
              ...link,
              label:
                'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine uzun anahtar ifadeli açılış sayfası',
              meta: 'Afyonkarahisar, Şuhut, Karacaören köyü · 1.284 ilan',
            }
          : link,
      ),
    })),
  },
}

export const DarKap: Story = {
  name: 'Responsive — dar kap',
  render: (args) => (
    <div style={{ maxWidth: 380, border: '1px dashed var(--lg-hairline)', padding: 16 }}>
      <GlassSeoDiscovery {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Kırılımlar rafın kendi genişliğine bakar (container query): kap 64rem altına inince ' +
          '2, 36rem altına inince tek kolon. Bu yüzden dar bir kutuya konduğunda viewport geniş ' +
          'olsa bile yerleşim iner. Satır yüksekliği --lg-control-hit tabanına bağlı; ' +
          'dokunmatikte hedef 44px altına düşmez.',
      },
    },
  },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { columns: kolonlar.slice(0, 2) },
  parameters: {
    docs: {
      description: {
        story:
          'Satırlar gerçek <a href> ve sıralı liste (<ol>) içinde: ekran okuyucu sırayı listeden alır, ' +
          'sağdaki iri rakam aria-hidden dekordur. Görseller alt="" ile dekoratiftir. ' +
          'Hub bağlantıları aynı adı paylaşmasın diye hubLabel verilmediğinde erişilebilir ad ' +
          'küme adıyla genişletilir ("Tümünü gör — Yatırımlık arsa"); görünür etiket adın içinde kalır. ' +
          'Kolon başlıklarının düzeyi headingLevel ile sayfa hiyerarşisine oturtulur.',
      },
    },
  },
}
