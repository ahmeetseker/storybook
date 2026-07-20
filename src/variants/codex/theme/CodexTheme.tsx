import type { HTMLAttributes, ReactNode } from 'react'
import styles from './CodexTheme.module.css'

export type CodexThemeName = 'paper' | 'mineral' | 'graphite'
export type CodexThemeCanvas = 'inline' | 'padded' | 'full'

export interface CodexThemeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Codex görsel sistemi. Mevcut tema varsayılanlarını yalnız bu kapsama içinde değiştirir. */
  theme?: CodexThemeName
  /** Storybook tuvali için iç boşluk ve minimum yükseklik davranışı. */
  canvas?: CodexThemeCanvas
  children?: ReactNode
}

const themeClasses: Record<CodexThemeName, string> = {
  paper: styles.paper,
  mineral: styles.mineral,
  graphite: styles.graphite,
}

const canvasClasses: Record<CodexThemeCanvas, string> = {
  inline: styles.inline,
  padded: styles.padded,
  full: styles.full,
}

export function CodexTheme({
  theme = 'paper',
  canvas = 'inline',
  className,
  children,
  ...rest
}: CodexThemeProps) {
  return (
    <div
      {...rest}
      className={[styles.root, themeClasses[theme], canvasClasses[canvas], className]
        .filter(Boolean)
        .join(' ')}
      data-codex-theme={theme}
      data-design-system="codex"
    >
      {children}
    </div>
  )
}
