import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexBadge, CodexField, CodexInput, CodexSelect } from '../controls'
import {
  CODEX_COMPACT_ADAPTATIONS,
  CODEX_COMPACT_COMPONENT_COUNT,
  CODEX_COMPACT_PATTERNS,
  type CodexCompactPatternId,
} from './CodexCompactCatalog'
import styles from './CodexCompactCatalog.stories.module.css'

const meta = {
  title: 'Codex Enterprise/13 Mobil Sistem/00 Kapsam ve Dönüşüm Matrisi',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper', fullCanvas: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function CompactInventory() {
  const [query, setQuery] = useState('')
  const [pattern, setPattern] = useState<'all' | CodexCompactPatternId>('all')
  const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR')
  const matching = useMemo(() => CODEX_COMPACT_ADAPTATIONS.filter((item) => {
    const queryMatch = !normalizedQuery || [item.original, item.codex, item.patternLabel, item.decision]
      .join(' ')
      .toLocaleLowerCase('tr-TR')
      .includes(normalizedQuery)
    return queryMatch && (pattern === 'all' || item.pattern === pattern)
  }), [normalizedQuery, pattern])

  const visibleGroups = CODEX_COMPACT_PATTERNS.map((group) => ({
    ...group,
    entries: matching.filter((item) => item.pattern === group.id),
  })).filter((group) => group.entries.length > 0)

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Codex compact adaptation</p>
            <h1>96 component, 10 doğru mobil davranış</h1>
            <p className={styles.heroCopy}>Ayrı bir “mobile prop” katmanı yok. Aynı semantik API; akış, dokunma hedefi, navigasyon ve veri yoğunluğuna göre doğru kompakt pattern ile davranır.</p>
          </div>
          <dl className={styles.stats} aria-label="Mobil kapsam özeti">
            <div><dt>Kapsam</dt><dd>{CODEX_COMPACT_COMPONENT_COUNT}/96</dd></div>
            <div><dt>Pattern</dt><dd>{CODEX_COMPACT_PATTERNS.length}</dd></div>
            <div><dt>Eksik</dt><dd>0</dd></div>
            <div><dt>Tekrar</dt><dd>0</dd></div>
          </dl>
        </header>

        <section aria-label="Envanter filtreleri">
          <div className={styles.controls}>
            <CodexField label="Component veya karar ara">
              <CodexInput type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Örn. table, sheet, ilan kartı" />
            </CodexField>
            <CodexField label="Mobil pattern">
              <CodexSelect value={pattern} onChange={(event) => setPattern(event.currentTarget.value as typeof pattern)}>
                <option value="all">Tüm patternler</option>
                {CODEX_COMPACT_PATTERNS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </CodexSelect>
            </CodexField>
          </div>
          <p className={styles.resultMeta} aria-live="polite"><span><strong>{matching.length}</strong> / {CODEX_COMPACT_COMPONENT_COUNT} component gösteriliyor</span><span>{visibleGroups.length} pattern</span></p>
        </section>

        {visibleGroups.length ? (
          <div className={styles.groups}>
            {visibleGroups.map((group, index) => (
              <section className={styles.group} key={group.id} aria-labelledby={`compact-pattern-${group.id}`}>
                <header className={styles.groupHeader}>
                  <span className={styles.groupIndex} aria-hidden>{String(index + 1).padStart(2, '0')}</span>
                  <div><h2 id={`compact-pattern-${group.id}`}>{group.label}</h2><p>{group.summary}</p></div>
                  <CodexBadge tone="accent">{group.entries.length} component</CodexBadge>
                </header>
                <ul className={styles.rows}>
                  {group.entries.map((entry) => (
                    <li className={styles.row} key={entry.original}>
                      <span className={styles.names}><strong>{entry.codex}</strong><code>{entry.original}</code></span>
                      <CodexBadge className={styles.strategy} tone={entry.strategy === 'native' ? 'success' : 'info'}>{entry.strategy === 'native' ? 'Native Codex' : 'Kompozisyon'}</CodexBadge>
                      <p className={styles.decision}>{entry.implementation}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : <p className={styles.empty}>Bu aramayla eşleşen component yok.</p>}
      </div>
    </main>
  )
}

export const TamKapsam: Story = {
  render: () => <CompactInventory />,
  globals: { viewport: 'desktop' },
}

export const MobilEnvanter: Story = {
  render: () => <CompactInventory />,
  globals: { viewport: 'mobile390' },
}

