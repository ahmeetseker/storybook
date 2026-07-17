import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GlassLoanCalculator } from './GlassLoanCalculator'

const meta = {
  title: 'Components/GlassLoanCalculator',
  component: GlassLoanCalculator,
  tags: ['autodocs'],
  args: { onChange: fn(), onCtaClick: fn() },
  argTypes: {
    variant: { control: 'select', options: ['full', 'compact'] },
    // hover/focus/active CSS state'idir, control değildir (bkz. rules.md)
  },
  parameters: {
    docs: {
      description: {
        component:
          'Konut kredisi hesaplayıcı. Gerçek anüite matematiği: taksit = P·r·(1+r)^n / ((1+r)^n − 1). ' +
          '`variant="full"` tüm girişleri ve dökümü gösterir; `variant="compact"` yalnız aylık taksit ' +
          've CTA satırını gösterir (GlassSheet/GlassModal içine gömülmeye uygun).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '48px auto', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassLoanCalculator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultPrice: 4250000,
    defaultDownPaymentPercent: 20,
    defaultTermYears: 10,
    defaultMonthlyRatePercent: 2.79,
  },
}

export const Playground: Story = {
  args: {
    title: 'Konut Kredisi Hesaplama',
    defaultPrice: 6800000,
    defaultDownPaymentPercent: 25,
    defaultTermYears: 8,
    defaultMonthlyRatePercent: 3.15,
    ctaLabel: 'Kredi Başvurusu Yap',
  },
}

/** `variant="compact"`: yalnız aylık taksit + CTA satırı — ilan detay sayfasında bir GlassSheet
 * içine gömülecek özet kart için tasarlanmıştır. Giriş kontrolleri gösterilmez. */
export const Compact: Story = {
  args: {
    variant: 'compact',
    defaultPrice: 3950000,
    defaultDownPaymentPercent: 15,
    defaultTermYears: 10,
    defaultMonthlyRatePercent: 2.79,
    ctaLabel: 'Hemen Başvur',
  },
}

/** Sıfır faizli kampanya senaryosu — anüite formülünün r=0 dalı (P/n) devreye girer. */
export const SifirFaiz: Story = {
  args: {
    title: 'Kampanyalı Konut Kredisi',
    defaultPrice: 5000000,
    defaultDownPaymentPercent: 30,
    defaultTermYears: 5,
    defaultMonthlyRatePercent: 0,
  },
}

/** Maksimum peşinat (%90) — kredi tutarı küçülür, taksit buna göre düşer. */
export const YuksekPesinat: Story = {
  args: {
    defaultPrice: 4250000,
    defaultDownPaymentPercent: 90,
    defaultTermYears: 3,
    defaultMonthlyRatePercent: 2.79,
  },
}

/** Uzun içerik: yüksek fiyat + uzun vade + yüksek faiz — büyük rakamların tabular hizası ve
 * kartın sabit genişlikte taşmadan büyümesi test edilir (gerçek büyükşehir villa fiyatı). */
export const UzunIcerik: Story = {
  args: {
    title: 'Boğaz Manzaralı Villa — Kredi Hesaplama',
    defaultPrice: 48750000,
    defaultDownPaymentPercent: 10,
    defaultTermYears: 10,
    defaultMonthlyRatePercent: 4.35,
  },
}

/**
 * Erişilebilirlik: başlık `aria-labelledby` ile karta bağlıdır; her giriş `<label>`/`aria-label`
 * ile adlandırılmıştır; anapara/faiz çubuğu `role="img"` + özet `aria-label` taşır (renk körlüğü
 * güvenli — aynı bilgi metinsel legend'da da tekrarlanır); odak sırası: fiyat → peşinat → vade →
 * faiz → CTA. Klavye ile tüm slider'lar ok tuşlarıyla, CTA butonu Enter/Space ile çalışır.
 */
export const Erisilebilirlik: Story = {
  args: { defaultPrice: 4250000, defaultDownPaymentPercent: 20, defaultTermYears: 10, defaultMonthlyRatePercent: 2.79 },
  parameters: {
    docs: {
      description: {
        story:
          'role="img" + metinsel özet olan anapara/faiz çubuğu, her giriş için accessible name, ' +
          've mantıklı Tab sırası. `prefers-reduced-motion`/`prefers-contrast` bu kartı etkilemez ' +
          '(animasyon kullanılmaz, flat yüzey).',
      },
    },
  },
}

/** Dar container + dokunmatik: kart 320px genişlikte taşmadan daralır, kontroller ≥44px hedefte kalır. */
export const Responsive: Story = {
  args: { defaultPrice: 3250000, defaultDownPaymentPercent: 20, defaultTermYears: 10, defaultMonthlyRatePercent: 2.79 },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => (
      <div style={{ margin: '24px auto', maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
}

/** İki variant yan yana — 'full' karşısında 'compact' özetin görsel farkı. */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
      <GlassLoanCalculator {...args} variant="full" />
      <GlassLoanCalculator {...args} variant="compact" />
    </div>
  ),
  args: {
    defaultPrice: 4250000,
    defaultDownPaymentPercent: 20,
    defaultTermYears: 10,
    defaultMonthlyRatePercent: 2.79,
  },
}
