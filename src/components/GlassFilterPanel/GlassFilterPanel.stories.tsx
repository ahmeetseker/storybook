import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassFilterPanel } from './GlassFilterPanel'
import { GlassCheckbox } from '../GlassCheckbox'
import { GlassChip } from '../GlassChip'

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
