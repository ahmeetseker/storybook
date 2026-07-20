import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexBadge, CodexButton } from '../controls'
import { CodexTheme, type CodexThemeName } from '../theme'
import styles from './CodexFoundations.module.css'

const meta = {
  title: 'Codex Enterprise/01 Temeller/01 Renk ve Tema',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const themeCopy: Record<CodexThemeName, { title: string; description: string }> = {
  paper: { title: 'Paper', description: 'Gün ışığında genel ürün kullanımı; önerilen varsayılan.' },
  mineral: { title: 'Mineral', description: 'Analiz ve editoryal keşif için serin, teknik açık yön.' },
  graphite: { title: 'Graphite', description: 'Düşük ışıkta yoğun operasyon ve profesyonel izleme.' },
}

function ThemePreview({ theme }: { theme: CodexThemeName }) {
  return (
    <CodexTheme theme={theme} canvas="inline" className={styles.themePreview}>
      <header><CodexBadge tone="accent">{themeCopy[theme].title}</CodexBadge><h2>4.250.000 TL</h2><p>{themeCopy[theme].description}</p></header>
      <div className={styles.themeActions}><CodexButton size="sm">İlanı incele</CodexButton><CodexButton size="sm" variant="secondary">Kaydet</CodexButton></div>
      <div className={styles.themeLayers}><span>Canvas</span><span>Surface</span><span>Subtle</span></div>
    </CodexTheme>
  )
}

export const ThemeComparison: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>Üç palet, tek etkileşim sözleşmesi</h1><p>Renk değişimi geometriyi, kontrol yüksekliğini, focus davranışını veya semantik state dilini değiştirmez.</p></header><div className={styles.themeGrid}><ThemePreview theme="paper" /><ThemePreview theme="mineral" /><ThemePreview theme="graphite" /></div></div>,
}

const tokens = [
  ['bg', 'Canvas', '--cx-bg'], ['surface', 'Surface', '--cx-surface'], ['subtle', 'Subtle', '--cx-surface-subtle'], ['accent', 'Accent', '--cx-accent'],
  ['success', 'Success', '--cx-success-fg'], ['warning', 'Warning', '--cx-warning-fg'], ['danger', 'Danger', '--cx-danger-fg'], ['info', 'Info', '--cx-info-fg'],
] as const

export const SemanticTokens: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>Semantik renk rolleri</h1><p>Ürün kodu hex değerini değil rolü tüketir. Accent yalnız ana aksiyon, seçim ve focus için kullanılır.</p></header><div className={styles.swatchGrid}>{tokens.map(([token, label, variable]) => <article key={token} className={styles.swatch} data-token={token}><span className={styles.swatchColor} /><span className={styles.swatchCopy}><strong>{label}</strong><code>{variable}</code></span></article>)}</div></div>,
}

export const ContrastContract: Story = {
  render: () => <div className={styles.page}><header className={styles.header}><h1>WCAG 2.2 AA kontrast sözleşmesi</h1><p>Muted metin dekorasyon değildir; normal metin kontrastını korur. Semantic foreground ile solid surface foreground ayrı tokenlardır.</p></header><table className={styles.contrastTable}><caption>Codex renk kontrast hedefleri</caption><thead><tr><th>Kullanım</th><th>Hedef</th><th>Doğrulama</th></tr></thead><tbody><tr><td>Normal ürün metni</td><td>≥ 4.5:1</td><td className={styles.pass}>AA</td></tr><tr><td>Büyük metin ve güçlü ikon</td><td>≥ 3:1</td><td className={styles.pass}>AA</td></tr><tr><td>Kontrol sınırı ve focus</td><td>≥ 3:1</td><td className={styles.pass}>AA</td></tr><tr><td>Placeholder metni</td><td>≥ 4.5:1</td><td className={styles.pass}>AA</td></tr><tr><td>Durum iletişimi</td><td>Renk + ikon/metin</td><td className={styles.pass}>İki kanal</td></tr></tbody></table></div>,
}
