import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSparkline } from './GlassSparkline'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassSparkline',
  component: GlassSparkline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tablo hücresine sığan eksensiz mikro trend. GlassChart’ın küçültülmüşü değildir: eksen, grid, ' +
          'tooltip ve başlık taşımaz. `label` zorunludur — sparkline dekoratif değil veridir ve ekran ' +
          'okuyucu yönü ile uç değerleri cümle olarak okur.',
      },
    },
  },
  argTypes: {
    points: { description: 'Soldan sağa değerler; en az 2 nokta gerekir.' },
    trend: { control: 'inline-radio', options: [undefined, 'up', 'down', 'steady'] },
    width: { control: { type: 'range', min: 40, max: 200, step: 4 } },
    height: { control: { type: 'range', min: 12, max: 64, step: 2 } },
  },
} satisfies Meta<typeof GlassSparkline>

export default meta
type Story = StoryObj<typeof meta>

const YUKSELEN = [61_600, 63_100, 65_400, 67_200, 69_800, 72_100, 74_000, 75_900, 77_600, 79_400, 81_200, 82_500]
const DUSEN = [128_700, 126_400, 124_900, 121_300, 119_800, 118_100, 116_400, 114_900, 112_600, 110_300, 108_900, 107_200]
const YATAY = [70_100, 70_400, 69_900, 70_200, 70_000, 70_300, 70_100, 69_800, 70_200, 70_000, 70_100, 70_300]

export const Default: Story = {
  args: { points: YUKSELEN, label: 'Feneryolu · son 12 ay medyan m² fiyatı' },
}

export const Playground: Story = {
  args: { points: YUKSELEN, label: 'Örnek seri', width: 72, height: 24 },
}

/** Yön ilk ve son noktadan türetilir; %1 altındaki değişim "yatay" sayılır. */
export const Yonler: Story = {
  name: 'Yönler',
  args: { points: YUKSELEN, label: 'Feneryolu · yükseliş' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[
        { p: YUKSELEN, l: 'Feneryolu · yükseliş' },
        { p: DUSEN, l: 'Caddebostan · düşüş' },
        { p: YATAY, l: 'Merdivenköy · yatay' },
      ].map((s) => (
        <span key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <GlassSparkline points={s.p} label={s.l} />
          <span style={{ color: 'var(--lg-label-secondary)' }}>{s.l}</span>
        </span>
      ))}
    </div>
  ),
}

/** Yoğunluğa göre ölçek — dar hücrede 56×20, ferah kartta 120×36. */
export const Boyutlar: Story = {
  name: 'Boyutlar',
  args: { points: YUKSELEN, label: 'Ölçek örneği' },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <GlassSparkline points={YUKSELEN} label="Dar" width={56} height={20} />
      <GlassSparkline points={YUKSELEN} label="Varsayılan" />
      <GlassSparkline points={YUKSELEN} label="Ferah" width={120} height={36} />
    </div>
  ),
}

/** Asıl kullanım: sıralama tablosunda satır başına bir trend sütunu. */
export const TabloIcinde: Story = {
  name: 'Tablo içinde',
  args: { points: YUKSELEN, label: 'Tablo satırı' },
  render: () => (
    <table style={{ borderCollapse: 'collapse', fontSize: 14, minWidth: 420 }}>
      <caption style={{ textAlign: 'start', paddingBottom: 8, color: 'var(--lg-label-secondary)', fontSize: 12 }}>
        Kadıköy mahalleleri · medyan m² fiyatı
      </caption>
      <thead>
        <tr>
          <th scope="col" style={{ textAlign: 'start', padding: '6px 12px' }}>Mahalle</th>
          <th scope="col" style={{ textAlign: 'end', padding: '6px 12px' }}>Medyan m²</th>
          <th scope="col" style={{ textAlign: 'end', padding: '6px 12px' }}>12 ay</th>
        </tr>
      </thead>
      <tbody>
        {[
          { ad: 'Caddebostan', v: '128.700 TL', p: DUSEN },
          { ad: 'Göztepe', v: '91.200 TL', p: YUKSELEN },
          { ad: 'Merdivenköy', v: '69.800 TL', p: YATAY },
          { ad: 'Dumlupınar', v: '—', p: [0] },
        ].map((r) => (
          <tr key={r.ad} style={{ borderTop: '1px solid var(--lg-hairline)' }}>
            <td style={{ padding: '8px 12px' }}>{r.ad}</td>
            <td style={{ padding: '8px 12px', textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}>{r.v}</td>
            <td style={{ padding: '8px 12px', textAlign: 'end' }}>
              <GlassSparkline points={r.p} label={`${r.ad} · son 12 ay`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}

/** Tek nokta trend anlatmaz: çizgi yerine tire ve ekran okuyucuya gerekçe. */
export const YetersizVeri: Story = {
  name: 'Yetersiz veri',
  args: { points: [82_500], label: 'Dumlupınar · son 12 ay' },
}

/** Uzun TR etiket yalnız erişilebilir ada girer; görsel genişliği etkilemez. */
export const UzunIcerik: Story = {
  name: 'Uzun içerik',
  args: {
    points: YUKSELEN,
    label: 'Kadıköy Feneryolu Mahallesi son on iki aylık medyan ilan metrekare fiyatı seyri',
  },
}

/** Dar kapta genişlik prop’tan gelir; kap küçülünce taşmaz. */
export const Responsive: Story = {
  args: { points: YUKSELEN, label: 'Dar kap' },
  render: (args) => (
    <div style={{ width: 120, border: '1px dashed var(--lg-hairline)', padding: 8, overflow: 'hidden' }}>
      <GlassSparkline {...args} width={96} />
    </div>
  ),
}

/**
 * Erişilebilirlik: SVG `role="img"` ve yön + uç değerleri içeren `aria-label`
 * taşır. Yön renkten bağımsız olarak bu metinde geçer.
 */
export const Erisilebilirlik: Story = {
  args: { points: DUSEN, label: 'Caddebostan · son 12 ay medyan m² fiyatı' },
}
