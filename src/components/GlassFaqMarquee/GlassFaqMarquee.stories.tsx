import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassFaqMarquee, type GlassFaqMarqueeRow } from './GlassFaqMarquee'

const rows: GlassFaqMarqueeRow[] = [
  {
    id: 'satir-1',
    speed: 32,
    direction: 'start',
    items: [
      {
        id: 'koltuk',
        question: 'Koltuk ne demek?',
        answer:
          'Ofis panelinde kendi hesabıyla çalışan her danışman bir koltuktur. Paketin dahil ettiği sayıyı aştığınızda ek koltuk aylık ücrete eklenir.',
      },
      {
        id: 'degisim',
        question: 'Paket değiştirirsem ne olur?',
        answer:
          'Yükseltme anında geçerli olur, kalan süreniz yeni pakete oranlanarak işlenir. Düşürme bir sonraki fatura döneminde başlar.',
      },
      {
        id: 'vitrin',
        question: 'Vitrin kontenjanı nedir?',
        answer:
          'Vitrin, ilanın arama sonuçlarında ve anasayfada öne çıkarıldığı yerdir. Kontenjan aylıktır, kullanılmayan hak devretmez.',
      },
    ],
  },
  {
    id: 'satir-2',
    speed: 24,
    direction: 'end',
    items: [
      {
        id: 'belge',
        question: 'Yetki belgem yoksa başvurabilir miyim?',
        answer:
          'Hayır. Taşınmaz ticareti yetki belgesi ve sorumlu danışmanın MYK Seviye 5 belgesi başvurunun ön koşuludur.',
      },
      {
        id: 'odeme',
        question: 'Ödeme ne zaman alınır?',
        answer:
          'Başvurunuz onaylandıktan sonra alınır; paket sayfasında gördüğünüz fiyatlara KDV dahil değildir.',
      },
      {
        id: 'iade',
        question: 'Yıllık ödemede iade var mı?',
        answer: 'Var — yıllık ödemede 14 gün koşulsuz iade hakkınız bulunur.',
      },
    ],
  },
]

const meta = {
  title: 'Bileşenler/Vitrin ve Yerleşim/GlassFaqMarquee',
  component: GlassFaqMarquee,
  tags: ['autodocs'],
  args: {
    title: 'Sık sorulanlar',
    subtitle:
      'Aradığınız cevabı bulamadıysanız bize yazın — destek ekibi aynı gün döner.',
    rows,
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--lg-space-8) 0' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassFaqMarquee>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'İki raf — zıt yönler' }

/** Tek raf: kısa SSS listesi. Döngü tek satırda da kesintisizdir. */
export const TekRaf: Story = {
  name: 'Tek raf',
  args: { rows: [rows[0]] },
}

/** Başlıksız gömme: bölüm başlığını sayfa yazar, bölge `label` ile adlandırılır. */
export const Basliksiz: Story = {
  name: 'Başlıksız',
  args: { title: undefined, subtitle: undefined, label: 'Paket soruları' },
}

export const Playground: Story = {}

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  parameters: {
    docs: {
      description: {
        story:
          'Kök `<section>` başlıkla (`aria-labelledby`) ya da `label` ile adlandırılmış bölge üretir. ' +
          'Kesintisiz döngü için her raf iki kez basılır; kopya `aria-hidden` + `inert` — ekran okuyucu ' +
          'aynı soruyu iki kez okumaz. Hareket görünür düğmeyle, imleçle ve odakla durur (WCAG 2.2.2); ' +
          '`prefers-reduced-motion` altında raflar hiç dönmez, yatay kaydırılabilir listeye iner.',
      },
    },
  },
}
