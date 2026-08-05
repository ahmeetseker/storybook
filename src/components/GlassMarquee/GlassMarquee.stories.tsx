import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassMarquee, type GlassMarqueeItem } from './GlassMarquee'

const ilanlar: GlassMarqueeItem[] = [
  ['İzmir Urla Denize 900 m, İmarlı Köşe Parsel', '4.250.000 TL'],
  ['Antalya Kaş Deniz Manzaralı Arsa', '6.900.000 TL'],
  ['Ankara Gölbaşı Yol Cepheli Yatırımlık Tarla', '1.850.000 TL'],
  ['Balıkesir Ayvalık Müstakil Tapulu Zeytinlik', '3.980.000 TL'],
  ['Muğla Datça Bağ Evi Yapımına Uygun Arazi', '5.400.000 TL'],
  ['Bursa İznik Göl Kenarı Bahçe', '2.150.000 TL'],
  ['Tekirdağ Şarköy Denize Yakın Yazlık Arsa', '1.290.000 TL'],
  ['Malatya Battalgazi Sulanabilir Kayısı Bahçesi', '890.000 TL'],
].map(([label, meta], index) => ({
  id: `ilan-${index}`,
  label,
  meta,
  href: '#',
}))

const meta = {
  title: 'Bileşenler/Vitrin ve Yerleşim/GlassMarquee',
  component: GlassMarquee,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { items: ilanlar, label: 'Öne çıkan ilanlar' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['accent', 'ink'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    direction: { control: 'inline-radio', options: ['start', 'end'] },
    speed: { control: { type: 'range', min: 20, max: 160, step: 10 } },
  },
} satisfies Meta<typeof GlassMarquee>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'Accent — footer üstü şerit' }

export const Varyantlar: Story = {
  name: 'Varyantlar',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(
        [
          ['accent', 'Marka amber bandı — kampanya/vitrin tonu'],
          ['ink', 'Mürekkep bandı — sayfayı footer’dan sessizce ayırır'],
        ] as const
      ).map(([variant, note]) => (
        <section key={variant}>
          <h3
            style={{
              margin: '0 0 8px',
              padding: '0 16px',
              color: 'var(--lg-label-secondary)',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            variant="{variant}"{' '}
            <span style={{ fontWeight: 500 }}>— {note}</span>
          </h3>
          <GlassMarquee {...args} variant={variant} />
        </section>
      ))}
    </div>
  ),
}

export const Olcekler: Story = {
  name: 'Ölçekler',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassMarquee {...args} size="sm" />
      <GlassMarquee {...args} size="md" />
    </div>
  ),
}

export const Yon: Story = {
  name: 'Yön ve hız',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GlassMarquee {...args} direction="start" speed={40} />
      <GlassMarquee {...args} direction="end" speed={110} variant="ink" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Hız saniyedeki pikseldir; süre ölçülen grup genişliğinden türetilir. ' +
          'Böylece 8 ilanla 40 ilan aynı hızda akar — uzun liste hızlanmaz.',
      },
    },
  },
}

export const Playground: Story = {
  args: { variant: 'accent', size: 'md', direction: 'start', speed: 60 },
}

export const UzunIcerik: Story = {
  name: 'Uzun içerik',
  args: {
    items: [
      {
        id: 'uzun',
        label:
          'Afyonkarahisar Şuhut Karacaören köyünde muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine uzun başlıklı imarlı parsel',
        meta: '12.480.000 TL',
        href: '#',
      },
      ...ilanlar.slice(0, 3),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Öğeler kırpılmaz, tek satırda akar: şeridin işi taramaktır, okumak değil. ' +
          'Çok uzun başlık bandı yavaşlatmaz (hız sabit), yalnız turu uzatır.',
      },
    },
  },
}

export const Durumlar: Story = {
  name: 'Durumlar — bağlantısız öğe',
  args: {
    items: [
      { id: 'd1', label: 'EİDS yetki kontrolü her ilanda görünür' },
      { id: 'd2', label: 'Doğrulanmış ofisler', meta: '128 ofis', href: '#' },
      { id: 'd3', label: 'Tapu ve parsel kaydı ilan detayında' },
    ],
  },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  parameters: {
    docs: {
      description: {
        story:
          'Hareket duraklatılabilir (WCAG 2.2.2): sağdaki düğme, imleç bandın üstündeyken ve ' +
          'içeride odak varken şerit durur — hareket eden bağlantı kovalanmaz. ' +
          'Döngü kopyası aria-hidden + inert; ekran okuyucu ilanı bir kez okur, klavye kopyaya girmez. ' +
          'prefers-reduced-motion açıkken şerit hiç dönmez, yatay kaydırılabilir listeye iner ve ' +
          'duraklat düğmesi kalkar. Odak halkası bant renginin üstünde currentColor ile çizilir.',
      },
    },
  },
}
