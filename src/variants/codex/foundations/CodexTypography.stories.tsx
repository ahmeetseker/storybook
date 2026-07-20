import type { Meta, StoryObj } from '@storybook/react-vite'
import styles from './CodexFoundations.module.css'

const meta = {
  title: 'Codex Enterprise/01 Temeller/02 Tipografi',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const rows = [
  ['Display', '30 / 32.4 · 700', styles.typeDisplay, 'Aradığınız parseli veriye bakarak seçin.'],
  ['Title', '22 / 28.6 · 700', styles.typeTitle, '4.250.000 TL · 8.301 TL/m²'],
  ['Headline', '17 / 20.4 · 700', styles.typeHeadline, 'Tapu ve imar doğrulaması'],
  ['Body', '15 / 22.5 · 400', styles.typeBody, 'İmar, tapu ve bölge fiyatlarını tek akışta karşılaştırın. Sonuçlar veri kaynağına göre açıkça işaretlenir.'],
  ['Label', '13 / 16.9 · 600', styles.typeLabel, 'En yüksek fiyat'],
  ['Caption', '12 / 16.8 · 400', styles.typeCaption, '18 Temmuz 2026, 09:42 · TKGM kaydı'],
] as const

export const ProductScale: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>Sabit ürün tipi ölçeği</h1><p>Tek Manrope ailesi; bilgi yoğun ürün yüzeyinde ağırlık, satır yüksekliği ve tabular rakamlarla hiyerarşi kurar.</p></header><div className={styles.typeScale}>{rows.map(([name, token, className, copy]) => <div key={name} className={styles.typeRow}><span className={styles.typeMeta}><strong>{name}</strong><code>{token}</code></span><p className={className}>{copy}</p></div>)}</div></div>,
}

export const TurkishLongContent: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>Türkçe uzun içerik ve sayı ritmi</h1><p>Başlıklar dengeli, gövde metni 65–75 karakter genişliğinde ve birleşik sözcükler dar ekranda güvenli biçimde kırılır.</p></header><article className={styles.longContent}><h2>Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine uzun başlık testi</h2><p>Taşınmazın güncel imar planındaki kullanım kararı, yapılaşma koşulları ve belediye meclisi kararları ilan sahibi tarafından sağlanan belgeyle karşılaştırıldı. Bu özet resmi ekspertiz veya hukuki görüş yerine geçmez.</p><p className={styles.numeric}><strong>4.250.000 TL</strong> · 512 m² · 8.301 TL/m² · %4,27 değişim · 46 gün</p></article></div>,
}

export const TextZoomTwoHundred: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>%200 metin büyütme</h1><p>Yatay kayıp, kesilen kontrol etiketi veya üst üste binen metin olmadan reflow hedeflenir.</p></header><article className={`${styles.longContent} ${styles.zoom200}`}><h2>İlan doğrulama özeti</h2><p>Tapu ve yetki bilgileri eşleşti. İmar belgesinin güncel nüshası bekleniyor.</p></article></div>,
}
