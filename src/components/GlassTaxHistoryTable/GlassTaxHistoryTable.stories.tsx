import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassTaxHistoryTable, type GlassTaxHistoryTableRow } from './GlassTaxHistoryTable'

const bodrumVillaGecmisi: GlassTaxHistoryTableRow[] = [
  { year: '2026', amount: '18.450 TL', changePercent: 14.2 },
  { year: '2025', amount: '16.160 TL', changePercent: 9.8 },
  { year: '2024', amount: '14.720 TL', changePercent: -2.1 },
  { year: '2023', amount: '15.040 TL', changePercent: 0 },
  { year: '2022', amount: '15.040 TL' },
]

const meta = {
  title: 'Bileşenler/Pazar Yeri/GlassTaxHistoryTable',
  component: GlassTaxHistoryTable,
  tags: ['autodocs'],
  args: {
    rows: bodrumVillaGecmisi,
    caption: 'Kaynak: Muğla Bodrum Belediyesi emlak vergisi kayıtları ve site yönetimi aidat dekontları, Ocak 2026 itibarıyla günceldir.',
  },
  argTypes: {
    rows: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'İlan detayında yıllara göre vergi/aidat tutarlarını ve önceki yıla göre değişimini gösteren, salt-okunur düz (cam olmayan) içerik tablosu. Sıralama çağıranın işidir — component `rows`\'u olduğu gibi render eder, ilk satırı en yeni yıl kabul edip hafifçe vurgular.',
      },
    },
  },
} satisfies Meta<typeof GlassTaxHistoryTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420, margin: '48px auto' }}>
      <GlassTaxHistoryTable {...args} />
    </div>
  ),
}

export const Playground: Story = {
  args: {
    title: 'Aidat Ödeme Geçmişi',
  },
  render: Default.render,
}

/**
 * Değişim kolonunun dört durumu bir arada: artış (▲, `--lg-danger` renkli ok),
 * azalış (▼, `--lg-success` renkli ok), değişim yok (nötr, ok yok) ve veri
 * yok (`—`). Ok her zaman `aria-hidden`; metin daima nötr etiket renginde
 * kalır — renk yalnız ikonda taşınır (küçük renkli metin kontrast riski).
 */
export const DegisimTurleri: Story = {
  args: {
    title: 'Değişim Türleri',
    caption: undefined,
    rows: [
      { year: '2026', amount: '4.820 TL', changePercent: 12.4 },
      { year: '2025', amount: '4.290 TL', changePercent: -6.7 },
      { year: '2024', amount: '4.590 TL', changePercent: 0 },
      { year: '2023', amount: '4.590 TL' },
    ],
  },
  render: Default.render,
}

/** `rows` boşken varsayılan boş durum metni ("Kayıt bulunamadı.") görünür. */
export const Empty: Story = {
  args: { rows: [], caption: undefined },
  render: Default.render,
}

/**
 * Uzun içerik: çift haneli yüzde değişimi ve uzun kaynak notu metni; sütun
 * genişlikleri sabit kalır, kaynak notu satır içinde serbestçe kırılır.
 */
export const UzunIcerik: Story = {
  args: {
    title: 'Vergi ve Aidat Geçmişi',
    rows: [
      { year: '2026', amount: '124.850 TL', changePercent: 38.6 },
      { year: '2025', amount: '90.070 TL', changePercent: 21.9 },
      { year: '2024', amount: '73.890 TL', changePercent: -11.4 },
      { year: '2023', amount: '83.420 TL', changePercent: 4.5 },
      { year: '2022', amount: '79.830 TL', changePercent: 1.2 },
      { year: '2021', amount: '78.870 TL' },
    ],
    caption:
      'Kaynak: Antalya Kaş Belediyesi emlak vergisi tahakkuk kayıtları, site yönetimi yıllık aidat mutabakat tutanakları ve devreden borç/alacak bakiyeleri birlikte değerlendirilerek hazırlanmıştır — son güncelleme Ocak 2026.',
  },
  render: (args) => (
    <div style={{ maxWidth: 380, margin: '48px auto' }}>
      <GlassTaxHistoryTable {...args} />
    </div>
  ),
}

/** Dar ekran + dokunmatik: tablo kendi kaydırma sarmalayıcısında (`overflow-x: auto`) yatay kayar — breakpoint yok, içsel akış. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <div style={{ maxWidth: 320, margin: '24px auto' }}>
      <GlassTaxHistoryTable {...args} />
    </div>
  ),
}

/**
 * Erişilebilirlik: başlık `<h3>` tabloyu `aria-labelledby` ile adlandırır;
 * `scope="col"` başlıklar. Değişim kolonunda yön bilgisi yalnız renkle değil,
 * görsel olarak gizli "Artış:"/"Azalış:"/"Değişim yok:" metniyle de taşınır —
 * ok ikonu (`▲`/`▼`) her zaman `aria-hidden="true"`.
 */
export const Erisilebilirlik: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Kart başlığı gerçek bir `<h3>` ve tablo ona `aria-labelledby` ile bağlıdır. Değişim hücresi ekran okuyucuya renk dışı bir yön metni ("Artış:"/"Azalış:"/"Değişim yok:"/"Değişim bilgisi yok") sunar; görünür metin ise her zaman nötr `--lg-label` renginde kalır, yalnız ok ikonu semantik renk (`--lg-danger`/`--lg-success`) taşır.',
      },
    },
  },
  render: Default.render,
}
