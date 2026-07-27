import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassClimateRiskPanel, type GlassClimateRiskHazard } from './GlassClimateRiskPanel'

const Deprem = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12h4l2-6 4 12 2-6h8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Sel = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 16c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0M3 11c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" strokeLinecap="round" />
  </svg>
)
const Yangin = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2c1 3-2 4-2 7a3 3 0 1 0 6 0c0-1-.5-2-1-2 1 4-2 5-3 5-2 0-4-1.5-4-4.5C8 5 10 4 12 2Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Zemin = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 18h18M5 18l3-6 3 3 3-8 3 11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const arsaHazards: GlassClimateRiskHazard[] = [
  {
    id: 'deprem',
    label: 'Deprem',
    icon: <Deprem />,
    level: 4,
    levelLabel: 'Yüksek',
    description: 'Parsel, 1. derece deprem bölgesinde ve aktif fay hattına yaklaşık 6 km mesafede.',
    source: 'AFAD 2025',
  },
  {
    id: 'sel',
    label: 'Sel',
    icon: <Sel />,
    level: 2,
    levelLabel: 'Düşük',
    description: 'Dere yatağı taşkın sınırının dışında; son 20 yılda kayıtlı taşkın olayı yok.',
    source: 'AFAD 2025',
  },
  {
    id: 'yangin',
    label: 'Yangın',
    icon: <Yangin />,
    level: 3,
    levelLabel: 'Orta',
    description: 'Parsel orman sınırına 400 m mesafede; yaz aylarında orman yangını riski taşır.',
    source: 'OGM 2024',
  },
  {
    id: 'zemin',
    label: 'Zemin',
    icon: <Zemin />,
    level: 5,
    levelLabel: 'Çok Yüksek',
    description: 'Zemin etüdüne göre sıvılaşma riski yüksek; temel öncesi ek jeoteknik rapor önerilir.',
    source: 'Belediye Zemin Etüdü 2023',
  },
]

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassClimateRiskPanel',
  component: GlassClimateRiskPanel,
  tags: ['autodocs'],
  args: {
    hazards: arsaHazards,
    variant: 'badges',
    title: 'İklim ve Afet Riski',
  },
  argTypes: {
    variant: { control: 'select', options: ['badges', 'detailed'] },
    title: { control: 'text' },
    hazards: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(520px, 92vw)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassClimateRiskPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {
  args: { variant: 'detailed' },
}

/** İki görsel biçim yan yana — badges kompakt kart içi rozet, detailed tam açıklamalı satır. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;badges&quot; — kompakt kart içi rozet</p>
        <GlassClimateRiskPanel hazards={arsaHazards} variant="badges" title="İklim ve Afet Riski" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.7, margin: '0 0 8px' }}>variant=&quot;detailed&quot; — 5 birimlik ölçek + açıklama + kaynak</p>
        <GlassClimateRiskPanel hazards={arsaHazards} variant="detailed" title="İklim ve Afet Riski" />
      </div>
    </div>
  ),
}

/** Semantik renk eşiği: 1-2 success, 3 warning (yoksa accent), 4-5 danger — hepsi levelLabel metniyle de okunur. */
export const SeviyeOlcegi: Story = {
  name: 'Seviye Ölçeği',
  render: () => (
    <GlassClimateRiskPanel
      variant="detailed"
      title="Seviye Ölçeği Referansı"
      hazards={[
        { id: '1', label: 'Deprem', level: 1, levelLabel: 'Çok Düşük', description: 'Otomatik ton: success' },
        { id: '2', label: 'Sel', level: 2, levelLabel: 'Düşük', description: 'Otomatik ton: success' },
        { id: '3', label: 'Yangın', level: 3, levelLabel: 'Orta', description: 'Otomatik ton: warning' },
        { id: '4', label: 'Zemin', level: 4, levelLabel: 'Yüksek', description: 'Otomatik ton: danger' },
        { id: '5', label: 'Heyelan', level: 5, levelLabel: 'Çok Yüksek', description: 'Otomatik ton: danger' },
      ]}
    />
  ),
}

/** Az tehlike + kart içi kullanım örneği — konut ilanında tek bir rozet satırı yeterli olabilir. */
export const KonutOzeti: Story = {
  name: 'Konut Özeti',
  args: {
    title: undefined,
    variant: 'badges',
    hazards: [
      { id: 'deprem', label: 'Deprem', icon: <Deprem />, level: 2, levelLabel: 'Düşük', source: 'AFAD 2025' },
      { id: 'sel', label: 'Sel', icon: <Sel />, level: 1, levelLabel: 'Çok Düşük', source: 'AFAD 2025' },
    ],
  },
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    variant: 'detailed',
    title: 'İklim ve Afet Riski Değerlendirmesi',
    hazards: [
      {
        id: 'deprem',
        label: 'Deprem',
        icon: <Deprem />,
        level: 5,
        levelLabel: 'Çok Yüksek Sismik Aktivite Riski',
        description:
          'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine yakın bir aktif fay hattı üzerinde bulunan bu parsel, mikrobölgeleme çalışmasına göre 1. derece deprem kuşağında yer almaktadır ve zemin büyütme katsayısı yüksektir.',
        source: 'AFAD Deprem Tehlike Haritası 2025 — Mikrobölgeleme Raporu Ek-3',
      },
      {
        id: 'zemin',
        label: 'Zemin',
        icon: <Zemin />,
        level: 4,
        levelLabel: 'Yüksek',
        description: 'Sıvılaşma potansiyeli olan alüvyon zemin; kazıklı temel sistemi önerilir.',
        source: 'Belediye Zemin Etüdü 2023',
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
}

/** Dar konteyner + dokunmatik bağlam: badges satırı sarar, detailed satırları tam genişliğe uyar. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { variant: 'badges' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', padding: 16 }}>
        <Story />
      </div>
    ),
  ],
}

export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: { variant: 'detailed' },
  parameters: {
    docs: {
      description: {
        story:
          'Tehlike listesi `role="list"` + her tehlike `<li>` (native `listitem`) taşır. ' +
          'Seviye bilgisi hiçbir zaman yalnız renkle verilmez — `levelLabel` metni her iki varyantta ' +
          'da görünür render edilir (WCAG 1.4.1). `detailed` varyantındaki 5 birimlik görsel ölçek ' +
          '`role="img"` + `aria-label` ile "Deprem: 5 üzerinden 4, Yüksek" biçiminde hem sayısal hem ' +
          'metinsel karşılığını ekran okuyucuya eşdeğer sunar; birim çubukları kendisi `aria-hidden`\'dır. ' +
          'Component tamamen statik/sunum amaçlıdır — etkileşim, klavye deseni veya controlled state yoktur.',
      },
    },
  },
}
