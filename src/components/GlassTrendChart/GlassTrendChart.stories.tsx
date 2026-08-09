import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassTrendChart, type GlassTrendSeries } from './GlassTrendChart'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassTrendChart',
  component: GlassTrendChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Çok serili zaman serisi — bir bölgenin seyrini üst bölge veya resmî endeksle aynı eksende kıyaslar. ' +
          'Tek seri için GlassChart kullanın. Seri sınıfı çizgi desenine bağlıdır: `observed` düz, ' +
          '`benchmark` uzun kesikli, `estimated` kısa kesikli — renk tek başına kanal değildir.',
      },
    },
  },
  argTypes: {
    series: { description: 'Seriler; hepsi aynı x etiketlerini paylaşmalıdır (ilk seri ekseni belirler).' },
    height: { control: { type: 'range', min: 140, max: 420, step: 20 } },
    showGrid: { control: 'boolean' },
    valueSuffix: { control: 'text' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof GlassTrendChart>

export default meta
type Story = StoryObj<typeof meta>

const AYLAR = ['Ağu 25', 'Eyl 25', 'Eki 25', 'Kas 25', 'Ara 25', 'Oca 26', 'Şub 26', 'Mar 26', 'Nis 26', 'May 26', 'Haz 26', 'Tem 26']

const seri = (id: string, label: string, values: (number | null)[], kind?: GlassTrendSeries['kind']): GlassTrendSeries => ({
  id,
  label,
  kind,
  points: AYLAR.map((x, i) => ({ x, y: values[i] ?? null })),
})

const MAHALLE = seri('mahalle', 'Feneryolu', [61_600, 63_100, 65_400, 67_200, 69_800, 72_100, 74_000, 75_900, 77_600, 79_400, 81_200, 82_500])
const ILCE = seri('ilce', 'Kadıköy ortalaması', [70_100, 71_800, 73_900, 75_400, 77_900, 80_200, 82_000, 83_800, 85_100, 86_900, 88_400, 89_600], 'benchmark')
const TCMB = seri('tcmb', 'TCMB Konut Fiyat Endeksi', [64_200, 66_000, 68_100, 70_000, 72_400, 74_800, 76_500, 78_100, 79_600, 81_000, 82_300, 83_400], 'benchmark')

export const Default: Story = {
  args: {
    title: 'Medyan ilan m² fiyatı — nominal',
    series: [MAHALLE, ILCE],
    valueSuffix: ' TL/m²',
  },
}

export const Playground: Story = {
  args: {
    title: 'Medyan ilan m² fiyatı',
    series: [MAHALLE, ILCE],
    valueSuffix: ' TL/m²',
    height: 260,
    showGrid: true,
  },
}

/** Tek seri de geçerlidir; künye yine görünür (hangi veriye baktığı yazılı kalır). */
export const TekSeri: Story = {
  name: 'Tek seri',
  args: { title: 'Yalnız mahalle', series: [MAHALLE], valueSuffix: ' TL/m²' },
}

/** Üç seri — kendi ölçümümüz + üst bölge + resmî endeks. Paletin sınırı 4 seridir. */
export const UcSeri: Story = {
  name: 'Üç seri · resmî benchmark ile',
  args: {
    title: 'Mahalle · ilçe · resmî endeks',
    series: [MAHALLE, ILCE, TCMB],
    valueSuffix: ' TL/m²',
  },
}

/** Model çıktısı kısa kesikli çizgi ve "tahmin" rozetiyle ayrılır. */
export const TahminSerisi: Story = {
  name: 'Tahmin serisi',
  args: {
    title: 'Gözlem ve 6 aylık tahmin',
    series: [
      MAHALLE,
      seri('tahmin', 'Model tahmini', [null, null, null, null, null, null, null, null, 77_600, 80_900, 84_400, 88_200], 'estimated'),
    ],
    valueSuffix: ' TL/m²',
  },
}

/** Yayımlanmayan dönem `null` verilir; çizgi kopar, düz çizgiyle doldurulmaz. */
export const EksikDonem: Story = {
  name: 'Eksik dönem (yayımlanmadı)',
  args: {
    title: 'Az veri: seri kopar',
    series: [seri('m', 'Dumlupınar', [41_200, 42_800, null, null, 46_100, 47_900, null, 51_400, 52_800, null, null, 58_300])],
    valueSuffix: ' TL/m²',
  },
}

/** Uzun TR seri adları künyede sarar, grafiği daraltmaz. */
export const UzunIcerik: Story = {
  name: 'Uzun içerik',
  args: {
    title: 'Kadıköy Feneryolu Mahallesi medyan ilan metrekare fiyatı — enflasyondan arındırılmış',
    series: [
      { ...MAHALLE, label: 'Feneryolu Mahallesi (İstanbul · Kadıköy) medyan ilan m² fiyatı' },
      { ...ILCE, label: 'Kadıköy ilçesi geneli ortalama metrekare fiyatı' },
    ],
    valueSuffix: ' TL/m²',
  },
}

/** Dar kapta grafik yüksekliği korunur; künye sarar. */
export const Responsive: Story = {
  render: (args) => (
    <div style={{ width: 320, border: '1px dashed var(--lg-hairline)', padding: 8 }}>
      <GlassTrendChart {...args} />
    </div>
  ),
  args: { title: 'Dar kap', series: [MAHALLE, ILCE], valueSuffix: ' TL/m²' },
}

/** Boş seri listesi sessizce çökmez. */
export const VeriYok: Story = {
  name: 'Veri yok',
  args: { title: 'Boş', series: [] },
}

/**
 * Erişilebilirlik: SVG `role="img"` + seri adlarını içeren özet taşır; altında
 * ekran okuyucuya açık, her seri için bir sütunu olan tam veri tablosu vardır.
 * Seri sınıfı hem çizgi deseni hem künye rozetiyle iletilir.
 */
export const Erisilebilirlik: Story = {
  args: { title: 'Erişilebilir özet ve veri tablosu', series: [MAHALLE, ILCE, TCMB], valueSuffix: ' TL/m²' },
}
