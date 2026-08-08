import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassFilterPanel } from './GlassFilterPanel'
import { GlassCheckbox } from '../GlassCheckbox'
import { GlassChip } from '../GlassChip'
import { GlassButton } from '../GlassButton'
import { GlassPriceRange, type GlassPriceRangeValue } from '../GlassPriceRange'
import { GlassSegmentedControl } from '../GlassSegmentedControl'
import { GlassSwitch } from '../GlassSwitch'

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassFilterPanel',
  component: GlassFilterPanel,
  tags: ['autodocs'],
  args: {
    label: 'Filtreler',
    resultCount: 128,
    material: 'flat',
  },
  argTypes: {
    material: { control: 'inline-radio', options: ['flat', 'glass'] },
    label: { control: 'text' },
    resultCount: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassFilterPanel>

export default meta
type Story = StoryObj<typeof meta>

const SampleFilters = () => (
  <>
    <GlassCheckbox defaultChecked label="Krediye uygun" />
    <GlassCheckbox label="Site içinde" />
    <GlassCheckbox label="Eşyalı" />
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <GlassChip defaultSelected>2+1</GlassChip>
      <GlassChip onSelectedChange={() => {}}>3+1</GlassChip>
      <GlassChip onSelectedChange={() => {}}>4+1</GlassChip>
    </div>
  </>
)

export const Default: Story = {
  render: (args) => (
    <GlassFilterPanel {...args} onReset={() => {}}>
      <SampleFilters />
    </GlassFilterPanel>
  ),
}

/** Sıfırlama callback'i yok → buton hiç render edilmez (false affordance yok). */
export const SifirlamaSiz: Story = {
  name: 'Sıfırlamasız',
  render: (args) => (
    <GlassFilterPanel {...args}>
      <SampleFilters />
    </GlassFilterPanel>
  ),
}

/** Sonuç sayısı verilmez — özet satırı gizlenir. */
export const SonucSayisiSiz: Story = {
  name: 'Sonuç Sayısız',
  args: { resultCount: undefined },
  render: (args) => (
    <GlassFilterPanel {...args} onReset={() => {}}>
      <SampleFilters />
    </GlassFilterPanel>
  ),
}

/** Footer slotunda "Uygula" aksiyonu. */
export const FooterAksiyonlu: Story = {
  name: 'Footer Aksiyonlu',
  render: (args) => (
    <GlassFilterPanel
      {...args}
      onReset={() => {}}
      footer={
        <button
          type="button"
          style={{
            minHeight: 44,
            padding: '0 16px',
            borderRadius: 'var(--lg-radius-chip)',
            border: 'none',
            background: 'var(--lg-accent)',
            color: 'var(--lg-accent-contrast)',
            fontWeight: 600,
          }}
        >
          Filtreleri uygula
        </button>
      }
    >
      <SampleFilters />
    </GlassFilterPanel>
  ),
}

/** Gerçek chrome bağlamı — cam yüzey. */
export const CamYuzey: Story = {
  name: 'Cam Yüzey',
  args: { material: 'glass' },
  render: (args) => (
    <div style={{ padding: 24, background: 'var(--lg-bg)' }}>
      <GlassFilterPanel {...args} onReset={() => {}}>
        <SampleFilters />
      </GlassFilterPanel>
    </div>
  ),
}

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <GlassFilterPanel {...args} onReset={() => {}}>
      <SampleFilters />
    </GlassFilterPanel>
  ),
}

// ── Referans emlak filtresi ────────────────────────────────────────────────
const KIRA_BANTLARI = [
  3, 6, 11, 18, 27, 38, 52, 66, 78, 86, 91, 88, 79, 68, 57, 46, 36, 28, 21, 16, 12, 9, 7, 5, 4, 3, 2, 2, 1, 1,
]
const KIRA_MIN = 300
const KIRA_MAX = 12000
const BANT_GENISLIGI = (KIRA_MAX - KIRA_MIN) / KIRA_BANTLARI.length
const ODA_SECENEKLERI = [
  { value: 'hepsi', label: 'Hepsi' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4+' },
]
const TL = (v: number) => `${v.toLocaleString('tr-TR')} ₺`

const AlanBasligi = ({ children }: { children: string }) => (
  <span style={{ fontSize: 'var(--lg-text-footnote)', fontWeight: 600, color: 'var(--lg-label)' }}>
    {children}
  </span>
)

const AnahtarSatiri = ({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
    <span style={{ fontSize: 'var(--lg-text-body)', color: 'var(--lg-label)' }}>{label}</span>
    <GlassSwitch label={label} defaultChecked={defaultChecked} />
  </div>
)

const EmlakFiltresiDemo = (args: React.ComponentProps<typeof GlassFilterPanel>) => {
  const [aralik, setAralik] = useState<GlassPriceRangeValue>([850, 7400])
  const [oda, setOda] = useState('hepsi')
  const [banyo, setBanyo] = useState('2')

  // Sonuç sayısı fiyat bandından türer; oda/banyo seçimi daraltır.
  const bandaDusen = KIRA_BANTLARI.reduce((sum, count, i) => {
    const bandBasi = KIRA_MIN + i * BANT_GENISLIGI
    return bandBasi + BANT_GENISLIGI > aralik[0] && bandBasi < aralik[1] ? sum + count : sum
  }, 0)
  const sonuc = Math.round(bandaDusen * (oda === 'hepsi' ? 1 : 0.42) * (banyo === 'hepsi' ? 1 : 0.68))

  return (
    <GlassFilterPanel
      {...args}
      resultCount={sonuc}
      resultLabel={(n) => `${n.toLocaleString('tr-TR')} ilan`}
      onReset={() => {
        setAralik([KIRA_MIN, KIRA_MAX])
        setOda('hepsi')
        setBanyo('hepsi')
      }}
      resetLabel="Temizle"
      footer={
        <GlassButton prominent size="lg" style={{ width: '100%' }}>
          {sonuc.toLocaleString('tr-TR')} ilanı göster
        </GlassButton>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AlanBasligi>Oda sayısı</AlanBasligi>
        <GlassSegmentedControl
          label="Oda sayısı"
          options={ODA_SECENEKLERI}
          value={oda}
          onChange={setOda}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AlanBasligi>Banyo</AlanBasligi>
        <GlassSegmentedControl
          label="Banyo"
          options={ODA_SECENEKLERI}
          value={banyo}
          onChange={setBanyo}
          style={{ width: '100%' }}
        />
      </div>
      <GlassPriceRange
        label="Fiyat aralığı"
        hint="Ortalama 1.200 ₺"
        min={KIRA_MIN}
        max={KIRA_MAX}
        step={50}
        bins={KIRA_BANTLARI}
        value={aralik}
        onChange={setAralik}
        formatValue={TL}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AlanBasligi>Diğer seçenekler</AlanBasligi>
        <AnahtarSatiri label="Krediye uygun" defaultChecked />
        <AnahtarSatiri label="Tek katlı" />
      </div>
    </GlassFilterPanel>
  )
}

/**
 * Referanstaki emlak filtre yaprağının kütüphane karşılığı: segmentli oda/banyo
 * satırları, dağılım histogramlı fiyat aralığı (`GlassPriceRange`), anahtarlar
 * ve altta sonucu **sayan** birincil eylem. Sonuç sayısı canlıdır — kullanıcı
 * paneli kapatmadan kaç ilan kaldığını görür.
 */
export const ReferansEmlakFiltresi: Story = {
  name: 'Referans Emlak Filtresi',
  args: { label: 'Filtreler', material: 'flat' },
  render: (args) => <EmlakFiltresiDemo {...args} />,
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  render: (args) => (
    <GlassFilterPanel {...args} onReset={() => {}}>
      <SampleFilters />
    </GlassFilterPanel>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Kök `<aside aria-label>` adlandırılmış `complementary` landmark üretir — ekran okuyucu ' +
          'kullanıcıları filtre bölgesine doğrudan atlayabilir. Sonuç sayısı `aria-live="polite"` ile ' +
          'duyurulur; filtre değişince güncel sonuç sesli okunur. Sıfırlama butonu yalnız `onReset` ' +
          'verildiğinde çizilir (false affordance yok) ve `:focus-visible` halkası taşır.',
      },
    },
  },
}
