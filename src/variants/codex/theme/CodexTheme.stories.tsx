import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexTheme, type CodexThemeName } from './CodexTheme'
import styles from './CodexTheme.module.css'

const meta = {
  title: 'Codex Enterprise/01 Temeller/00 Tema Sistemi',
  component: CodexTheme,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    codex: { fullCanvas: true },
  },
  argTypes: {
    theme: { control: 'select', options: ['paper', 'mineral', 'graphite'] },
    canvas: { control: 'select', options: ['inline', 'padded', 'full'] },
  },
  args: {
    theme: 'paper',
    canvas: 'padded',
  },
} satisfies Meta<typeof CodexTheme>

export default meta
type Story = StoryObj<typeof meta>

const themeCopy: Record<CodexThemeName, { title: string; description: string }> = {
  paper: {
    title: 'Paper',
    description: 'Markaya yakın, sıcaklığı azaltılmış nötr kâğıt ve kontrollü pas vurgusu.',
  },
  mineral: {
    title: 'Mineral',
    description: 'Gün ışığında net okunan serin yüzeyler ve güven veren petrol mavisi.',
  },
  graphite: {
    title: 'Graphite',
    description: 'Düşük ışık için grafit katmanlar, bakır aksiyon ve ayrıştırılmış durum renkleri.',
  },
}

function ThemeSample({ theme, recommended = false }: { theme: CodexThemeName; recommended?: boolean }) {
  const copy = themeCopy[theme]
  const swatches = [
    { name: 'Canvas', color: 'var(--cx-bg)', label: 'var(--cx-label)' },
    { name: 'Surface', color: 'var(--cx-surface)', label: 'var(--cx-label)' },
    { name: 'Subtle', color: 'var(--cx-surface-subtle)', label: 'var(--cx-label)' },
    { name: 'Accent', color: 'var(--cx-accent)', label: 'var(--cx-on-accent)' },
    { name: 'Success', color: 'var(--cx-success-solid)', label: 'var(--cx-success-on-solid)' },
  ]

  return (
    <CodexTheme theme={theme} className={styles.themeCard}>
      <div className={styles.themeCardHeader}>
        <div>
          <h2 className={styles.themeTitle}>{copy.title}</h2>
          <p className={styles.themeMeta}>{copy.description}</p>
        </div>
        {recommended ? <span className={styles.recommended}>Önerilen</span> : null}
      </div>

      <div className={styles.swatches} aria-label={`${copy.title} renk örnekleri`}>
        {swatches.map((swatch) => (
          <span
            className={styles.swatch}
            key={swatch.name}
            style={
              {
                '--swatch': swatch.color,
                '--swatch-label': swatch.label,
              } as CSSProperties
            }
          >
            {swatch.name}
          </span>
        ))}
      </div>

      <div className={styles.controlRow}>
        <button className={styles.sampleButton} type="button">
          İlanı incele
        </button>
        <button className={styles.sampleButtonQuiet} type="button">
          Kaydet
        </button>
      </div>
    </CodexTheme>
  )
}

function SingleThemePage({ theme, recommended = false }: { theme: CodexThemeName; recommended?: boolean }) {
  return (
    <CodexTheme theme={theme} canvas="padded">
      <main className={styles.showcase}>
        <header className={styles.showcaseHeader}>
          <h1 className={styles.showcaseTitle}>{themeCopy[theme].title}</h1>
          <p className={styles.showcaseDescription}>{themeCopy[theme].description}</p>
        </header>
        <ThemeSample theme={theme} recommended={recommended} />
      </main>
    </CodexTheme>
  )
}

export const Playground: Story = {
  render: (args) => (
    <CodexTheme {...args}>
      <div className={styles.showcase}>
        <header className={styles.showcaseHeader}>
          <h1 className={styles.showcaseTitle}>{themeCopy[args.theme ?? 'paper'].title}</h1>
          <p className={styles.showcaseDescription}>{themeCopy[args.theme ?? 'paper'].description}</p>
        </header>
        <ThemeSample theme={args.theme ?? 'paper'} recommended={args.theme === 'paper'} />
      </div>
    </CodexTheme>
  ),
}

export const PaletteComparison: Story = {
  args: { theme: 'paper', canvas: 'full' },
  render: () => (
    <CodexTheme theme="paper" canvas="padded">
      <main className={styles.showcase}>
        <header className={styles.showcaseHeader}>
          <h1 className={styles.showcaseTitle}>Codex tema sistemi</h1>
          <p className={styles.showcaseDescription}>
            Üç palet aynı geometri, tipografi, erişilebilirlik ve motion sözleşmesini paylaşır.
            Yalnız renk stratejisi değişir; component kişiliği tema geçişinde korunur.
          </p>
        </header>
        <div className={styles.themeGrid}>
          <ThemeSample theme="paper" recommended />
          <ThemeSample theme="mineral" />
          <ThemeSample theme="graphite" />
        </div>
      </main>
    </CodexTheme>
  ),
}

export const Paper: Story = {
  args: { theme: 'paper' },
  render: () => <SingleThemePage theme="paper" recommended />,
}

export const Mineral: Story = {
  args: { theme: 'mineral' },
  render: () => <SingleThemePage theme="mineral" />,
}

export const Graphite: Story = {
  args: { theme: 'graphite' },
  render: () => <SingleThemePage theme="graphite" />,
}
