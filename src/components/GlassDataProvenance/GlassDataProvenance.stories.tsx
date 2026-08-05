import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassDataProvenance, type GlassProvenanceSourceClass } from './GlassDataProvenance'

const meta = {
  title: 'Bileşenler/Veri Gösterimi/GlassDataProvenance',
  component: GlassDataProvenance,
  tags: ['autodocs'],
  argTypes: {
    sourceClass: {
      control: 'select',
      options: ['official', 'verified_document', 'advertiser_declared', 'platform_derived', 'model_estimate', 'unknown'],
    },
    freshness: {
      control: 'select',
      options: ['current', 'aging', 'stale', 'unknown'],
    },
  },
} satisfies Meta<typeof GlassDataProvenance>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    fieldLabel: 'Yüzölçümü',
    sourceLabel: 'TKGM MEGSİS',
    sourceClass: 'official',
    retrievedAt: '24 Tem 2026',
    scopeLabel: 'parsel',
    method: 'Doğrudan kayıt sorgusu',
  },
  render: (args) => (
    <div style={{ maxWidth: 420, margin: '48px auto' }}>
      <GlassDataProvenance {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    fieldLabel: 'Yüzölçümü',
    sourceLabel: 'TKGM MEGSİS',
    sourceClass: 'official',
    retrievedAt: '24 Tem 2026',
    effectiveAt: '10 Tem 2026',
    validUntil: '10 Oca 2027',
    scopeLabel: 'parsel',
    geographicResolution: 'Parsel bazlı',
    method: 'Doğrudan kayıt sorgusu',
    methodVersion: 'v2',
    sourceHref: 'https://parselsorgu.tkgm.gov.tr',
    limitations: ['Parsel bazlı hüküm vermez.'],
  },
  render: Default.render,
}

/**
 * Altı kaynak sınıfının rozet etiketleri yan yana — sabit metinler: "Resmî
 * kayıttan", "Doğrulanmış belgeden", "İlan sahibi beyanı", "ArsaPazar hesabı",
 * "Model tahmini", "Doğrulanamadı". "Doğrulandı" hiçbir zaman üretilmez.
 */
export const KaynakSiniflari: Story = {
  args: Default.args,
  render: () => {
    const classes: { sourceClass: GlassProvenanceSourceClass; sourceLabel: string }[] = [
      { sourceClass: 'official', sourceLabel: 'TKGM MEGSİS' },
      { sourceClass: 'verified_document', sourceLabel: 'Tapu senedi (PDF)' },
      { sourceClass: 'advertiser_declared', sourceLabel: 'İlan sahibi' },
      { sourceClass: 'platform_derived', sourceLabel: 'ArsaPazar' },
      { sourceClass: 'model_estimate', sourceLabel: 'ArsaPazar AI' },
      { sourceClass: 'unknown', sourceLabel: 'Bilinmiyor' },
    ]
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxWidth: 720, margin: '48px auto' }}>
        {classes.map((c) => (
          <GlassDataProvenance
            key={c.sourceClass}
            fieldLabel="Yüzölçümü"
            sourceLabel={c.sourceLabel}
            sourceClass={c.sourceClass}
            retrievedAt="24 Tem 2026"
            scopeLabel="parsel"
          />
        ))}
      </div>
    )
  },
}

/**
 * Çelişki: rozet "Kaynaklar çelişiyor" yazar (kaynak sınıfı etiketinin yerine
 * geçer), açıldığında geçerli değer ile çelişen değer(ler) kaynak ve tarihiyle
 * birlikte gösterilir — çelişki sessizce çözülmez.
 */
export const Cakisma: Story = {
  args: {
    fieldLabel: 'Yüzölçümü',
    sourceLabel: 'TKGM MEGSİS',
    sourceClass: 'official',
    retrievedAt: '24 Tem 2026',
    scopeLabel: 'parsel',
    currentValueLabel: '4.712 m²',
    conflicts: [{ sourceLabel: 'İlan sahibi beyanı', value: '4.850 m²', effectiveAt: '12 Nis 2026' }],
  },
  render: (args) => (
    <div style={{ maxWidth: 420, margin: '48px auto' }}>
      <GlassDataProvenance {...args} defaultOpen />
    </div>
  ),
}

/**
 * Bayat kaynak: `freshness="stale"` rozette "Güncel değil" yazar — kaynak
 * sınıfı etiketinin önüne geçer (çelişkiden sonra ikinci öncelik).
 */
export const BayatKaynak: Story = {
  args: {
    fieldLabel: 'Aidat',
    sourceLabel: 'Yönetim beyanı',
    sourceClass: 'advertiser_declared',
    retrievedAt: '02 Oca 2025',
    scopeLabel: 'bina',
    freshness: 'stale',
  },
  render: Default.render,
}

/**
 * Uzun içerik: uzun sağlayıcı adı rozet dışında panelde satır kırar; üç
 * sınırlama maddesi liste olarak sarmalanır.
 */
export const UzunIcerik: Story = {
  args: {
    fieldLabel: 'İmar Durumu',
    sourceLabel: 'İstanbul Büyükşehir Belediyesi İmar ve Şehircilik Daire Başkanlığı e-imar sorgu sistemi',
    sourceClass: 'verified_document',
    retrievedAt: '24 Tem 2026',
    scopeLabel: 'parsel',
    method: 'e-imar üzerinden ada/parsel sorgusu ile alınan çıktının el ile doğrulanması',
    limitations: [
      'Parsel bazlı hüküm vermez, ada bütününü yansıtmayabilir.',
      'İmar planı değişiklik sürecindeki parsellerde güncel olmayabilir.',
      'Resmî kurumdan alınan yazılı belge yerine geçmez.',
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 320, margin: '48px auto' }}>
      <GlassDataProvenance {...args} defaultOpen />
    </div>
  ),
}

/**
 * Dar container (240px) + dokunmatik bağlam: rozet ve panel taşmadan
 * sarmalanır, tetikleyici `pointer: coarse`'da 44px hedefe çıkar.
 */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    fieldLabel: 'Yüzölçümü',
    sourceLabel: 'TKGM MEGSİS',
    sourceClass: 'official',
    retrievedAt: '24 Tem 2026',
    scopeLabel: 'parsel',
    method: 'Doğrudan kayıt sorgusu',
  },
  render: (args) => (
    <div style={{ maxWidth: 240, margin: '48px auto' }}>
      <GlassDataProvenance {...args} defaultOpen />
    </div>
  ),
}

/** Düz fildişi zemin: rozet tonları (`data-tone`) arka plan sabitlenerek okunurluk için denetlenir. */
export const DuzZemin: Story = {
  parameters: { globals: { backgroundKey: 'light' } },
  args: Default.args,
  render: (args) => (
    <div style={{ maxWidth: 420, margin: '48px auto' }}>
      <GlassDataProvenance {...args} defaultOpen />
    </div>
  ),
}

/**
 * Tetikleyici gerçek bir `<button>`; `aria-expanded` durumla senkron ve
 * `aria-controls` hedefindeki panel yalnız açıkken DOM'dadır. Erişilebilir
 * ad görünmez `fieldLabel` öneki + rozet metninden gelir. Focus sırası tek
 * durak: yalnız tetikleyici buton (panel içindeki bağlantı hariç).
 */
export const Erisilebilirlik: Story = {
  name: 'Erişilebilirlik',
  args: Default.args,
  render: (args) => (
    <div style={{ maxWidth: 420, margin: '48px auto' }}>
      <GlassDataProvenance {...args} defaultOpen sourceHref="https://parselsorgu.tkgm.gov.tr" />
    </div>
  ),
}
