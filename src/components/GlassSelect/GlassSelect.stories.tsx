import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassSelect } from './GlassSelect'

const vitesOptions = [
  { value: 'manuel', label: 'Manuel' },
  { value: 'otomatik', label: 'Otomatik' },
  { value: 'yarim', label: 'Yarı Otomatik' },
]

const ilOptions = [
  { value: '34', label: 'İstanbul' },
  { value: '06', label: 'Ankara' },
  { value: '35', label: 'İzmir' },
  { value: '16', label: 'Bursa' },
  { value: '07', label: 'Antalya' },
  { value: '01', label: 'Adana' },
  { value: '42', label: 'Konya' },
  { value: '27', label: 'Gaziantep' },
  { value: '33', label: 'Mersin' },
  { value: '61', label: 'Trabzon' },
  { value: '55', label: 'Samsun' },
  { value: '26', label: 'Eskişehir' },
]

const meta = {
  title: 'Bileşenler/Form/GlassSelect',
  component: GlassSelect,
  tags: ['autodocs'],
  args: { onChange: fn(), options: vitesOptions, 'aria-label': 'Vites' },
  argTypes: {
    material: { control: 'select', options: ['glass', 'flat'] },
    panelMaterial: { control: 'select', options: ['glass', 'flat'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    'aria-required': { control: 'boolean' },
  },
  // Panel absolute açıldığı için story'lere alt boşluk bırakıyoruz
  decorators: [
    (Story) => (
      <div style={{ minHeight: 280, maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { placeholder: 'Vites seçin' } }

export const Preselected: Story = { args: { defaultValue: 'otomatik' } }

export const Invalid: Story = { args: { placeholder: 'Vites seçin', invalid: true } }

export const Required: Story = {
  args: { placeholder: 'Vites seçin', 'aria-required': true },
}

export const Disabled: Story = { args: { placeholder: 'Vites seçin', disabled: true } }

/** `material` trigger'ı belirler; panel varsayılan olarak opak kalır. */
export const Materials: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--lg-space-3)',
      }}
    >
      <GlassSelect
        material="glass"
        aria-label="Cam malzeme"
        placeholder="Cam malzeme"
        options={vitesOptions}
      />
      <GlassSelect
        material="flat"
        aria-label="Düz malzeme"
        placeholder="Düz malzeme"
        options={vitesOptions}
      />
    </div>
  ),
}

/**
 * Panel malzemesi trigger'dan bağımsız eksendir. Varsayılan `flat` (opak
 * `--lg-surface`): yoğun içerik üzerinde açılan liste her zaman okunur kalır.
 * `glass` yalnız arkası sade yerleşimlerde bilinçli seçilir.
 */
export const PanelMaterials: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--lg-space-3)',
      }}
    >
      <GlassSelect
        aria-label="Opak panel"
        placeholder="Opak panel (varsayılan)"
        options={vitesOptions}
      />
      <GlassSelect
        panelMaterial="glass"
        aria-label="Cam panel"
        placeholder="Cam panel"
        options={vitesOptions}
      />
    </div>
  ),
}

/** Devre dışı seçenek: klavye gezinmesi atlar, tıklama seçmez. */
export const DisabledOption: Story = {
  args: {
    placeholder: 'Yakıt seçin',
    'aria-label': 'Yakıt',
    options: [
      { value: 'benzin', label: 'Benzin' },
      { value: 'dizel', label: 'Dizel' },
      { value: 'lpg', label: 'LPG', disabled: true },
      { value: 'elektrik', label: 'Elektrik' },
    ],
  },
}

/** Boyut ekseni: trigger yüksekliği --lg-control-* token'ından. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <GlassSelect size="sm" aria-label="Küçük" placeholder="Küçük — sm" options={vitesOptions} />
      <GlassSelect size="md" aria-label="Orta" placeholder="Orta — md" options={vitesOptions} />
      <GlassSelect size="lg" aria-label="Büyük" placeholder="Büyük — lg" options={vitesOptions} />
    </div>
  ),
}

/** Kontrollü kullanım: value dışarıda tutulur, onChange değeri döndürür. */
export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | undefined>(undefined)
    return (
      <div>
        <GlassSelect aria-label="İl" placeholder="İl seçin" options={ilOptions} value={value ?? ''} onChange={setValue} />
        <p style={{ font: '13px var(--lg-font)', color: 'var(--lg-label-secondary)' }}>Seçilen plaka kodu: {value ?? '—'}</p>
      </div>
    )
  },
}

/**
 * Responsive: coarse pointer'da dokunmatik tipografi ve 50vh liste tavanı;
 * fine pointer'da kontrol token'ından türeyen liste tavanı kullanılır.
 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { placeholder: 'İl seçin', 'aria-label': 'İl', options: ilOptions },
}
