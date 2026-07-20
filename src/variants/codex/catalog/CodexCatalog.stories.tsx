import { useMemo, useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodexBadge, CodexField, CodexInput, CodexSelect } from '../controls'
import { CodexDataTable, CodexMetricStrip, type CodexDataColumn } from '../data'
import {
  CODEX_CATALOG_CATEGORIES,
  CODEX_COMPONENT_CATALOG,
  CODEX_PAGE_CATALOG,
  CODEX_PAGE_COUNT,
  type CodexComponentCatalogItem,
  type CodexCoverageStrategy,
} from './CodexCatalog'
import styles from './CodexCatalog.module.css'

const meta = {
  title: 'Codex Enterprise/00 Başlangıç/01 Kapsam ve Katalog',
  parameters: { layout: 'fullscreen', codex: { defaultTheme: 'paper' } },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const strategyCopy: Record<CodexCoverageStrategy, { label: string; tone: 'success' | 'info' | 'neutral'; description: string }> = {
  native: { label: 'Native Codex', tone: 'success', description: 'Codex namespace içinde ayrı API, state ve test sözleşmesi.' },
  composed: { label: 'Codex kompozisyonu', tone: 'info', description: 'Codex primitive’leriyle sayfa/pattern düzeyinde kurulan aile.' },
  compatibility: { label: 'Uyumluluk katmanı', tone: 'neutral', description: 'Mevcut Glass API, Codex scoped token köprüsüyle korunur.' },
}

const categoryById = new Map(CODEX_CATALOG_CATEGORIES.map((category) => [category.id, category]))

const documentedCoverage = {
  components: 96,
  native: 70,
  composed: 26,
} as const

function Page({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <CodexBadge tone="accent">Codex Enterprise · v1 kapsamı</CodexBadge>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <aside className={styles.heroMeta} aria-label="Katalog özeti">
          <h2>Teslim sözleşmesi</h2>
          <dl>
            <div><dt>Mevcut component ailesi</dt><dd>{documentedCoverage.components}</dd></div>
            <div><dt>Ürün sayfası</dt><dd>{CODEX_PAGE_COUNT}</dd></div>
            <div><dt>Codex paleti</dt><dd>3</dd></div>
            <div><dt>Hedef</dt><dd>WCAG 2.2 AA</dd></div>
          </dl>
        </aside>
      </header>
      {children}
    </div>
  )
}

export const ExecutiveOverview: Story = {
  render: () => {
    return (
      <Page title="96 bileşen ve 28 sayfa için tek, aranabilir Codex sözleşmesi" description="Bu ekran pazarlama sayısı değil; hangi ailenin ayrı Codex API’si, hangi ailenin ürün kompozisyonu ve hangisinin geriye uyum katmanı olduğunu açıkça gösteren teslim envanteridir.">
        <CodexMetricStrip items={[
          { id: 'components', label: 'Component kapsamı', value: String(documentedCoverage.components), help: '96/96 mevcut Glass ailesi katalogda' },
          { id: 'native', label: 'Native Codex', value: String(documentedCoverage.native), help: 'Ayrı API + story + state' },
          { id: 'composed', label: 'Kompozisyon', value: String(documentedCoverage.composed), help: 'Ürün bağlamında kurulan pattern ailesi' },
          { id: 'pages', label: 'Sayfa kapsamı', value: String(CODEX_PAGE_COUNT), help: 'Kamusal, alıcı, satıcı, hesap, kurumsal' },
        ]} />
        <section className={styles.section}>
          <header className={styles.sectionHeader}><h2>Kategori mimarisi</h2><p>Sidebar sırası kullanıcı görevi ve tasarım sistemi bağımlılığına göre sabittir; alfabetik bir component çöplüğü değildir.</p></header>
          <div className={styles.categoryGrid}>
            {CODEX_CATALOG_CATEGORIES.map((category) => {
              const entries = CODEX_COMPONENT_CATALOG.filter((entry) => entry.category === category.id)
              const native = entries.filter((entry) => entry.strategy === 'native').length
              return (
                <article key={category.id} className={styles.categoryCard}>
                  <div className={styles.categoryCardHeader}><h3>{String(category.order).padStart(2, '0')} · {category.label}</h3><CodexBadge>{entries.length}</CodexBadge></div>
                  <p>{category.description}</p>
                  <dl><div><dt>Native</dt><dd>{native}</dd></div><div><dt>Kompozisyon</dt><dd>{entries.length - native}</dd></div></dl>
                </article>
              )
            })}
          </div>
        </section>
        <section className={styles.section}>
          <header className={styles.sectionHeader}><h2>Uygulama stratejileri</h2><p>Enterprise kütüphane aynı davranışı taşıyan 96 aileyi körlemesine kopyalamaz; görsel veya semantik ayrım gerektiğinde native, ürün bağlamı gerektiğinde kompozisyon, API korunması gerektiğinde uyumluluk kullanır.</p></header>
          <div className={styles.legend}>
            {(Object.keys(strategyCopy) as CodexCoverageStrategy[]).map((strategy) => <article key={strategy}><CodexBadge tone={strategyCopy[strategy].tone} dot>{strategyCopy[strategy].label}</CodexBadge><h3>{strategy === 'native' ? 'Ayrı ve testli bileşen' : strategy === 'composed' ? 'Gerçek iş akışında pattern' : 'Mevcut API’ye güvenli köprü'}</h3><p>{strategyCopy[strategy].description}</p></article>)}
          </div>
        </section>
      </Page>
    )
  },
}

interface InventoryRow extends CodexComponentCatalogItem { id: string }

const inventoryColumns: Array<CodexDataColumn<InventoryRow>> = [
  {
    key: 'name',
    header: 'Component',
    sortable: true,
    render: (row) => <span className={styles.componentName}><strong>{row.codex}</strong><code>{row.original}</code></span>,
  },
  { key: 'category', header: 'Kategori', sortable: true, render: (row) => categoryById.get(row.category)?.label },
  { key: 'purpose', header: 'Görev', render: (row) => <span className={styles.purpose}>{row.purpose}</span> },
  { key: 'variants', header: 'Varyantlar', render: (row) => <span className={styles.variantList}>{row.variants.map((variant) => <span key={variant}>{variant}</span>)}</span> },
  {
    key: 'strategy',
    header: 'Kapsam',
    sortable: true,
    render: (row) => <span className={styles.strategy}><CodexBadge tone={strategyCopy[row.strategy].tone} dot>{strategyCopy[row.strategy].label}</CodexBadge><small>{strategyCopy[row.strategy].description}</small></span>,
  },
  { key: 'story', header: 'Story grubu', render: (row) => <span className={styles.storyPath}>{row.storyGroup}</span>, hideOnCompact: true },
]

function Inventory() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [strategy, setStrategy] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('ascending')
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR')
    const matching = CODEX_COMPONENT_CATALOG.filter((entry) => {
      const queryMatch = !normalizedQuery || [entry.original, entry.codex, entry.purpose, ...entry.variants].join(' ').toLocaleLowerCase('tr-TR').includes(normalizedQuery)
      return queryMatch && (category === 'all' || entry.category === category) && (strategy === 'all' || entry.strategy === strategy)
    }).map((entry) => ({ ...entry, id: entry.original }))
    return matching.sort((a, b) => {
      const result = String(a[sortKey as keyof InventoryRow]).localeCompare(String(b[sortKey as keyof InventoryRow]), 'tr')
      return sortDirection === 'ascending' ? result : -result
    })
  }, [category, query, sortDirection, sortKey, strategy])

  return (
    <Page title="Component envanteri" description="İsim, görev, varyant, uygulama stratejisi ve Storybook konumu üzerinden 96 ailenin tamamını arayın.">
      <section className={styles.section}>
        <div className={styles.filters}>
          <CodexField label="Component veya varyant ara"><CodexInput type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Örn. table, loading, harita" /></CodexField>
          <CodexField label="Kategori"><CodexSelect value={category} onChange={(event) => setCategory(event.currentTarget.value)}><option value="all">Tüm kategoriler</option>{CODEX_CATALOG_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</CodexSelect></CodexField>
          <CodexField label="Kapsam"><CodexSelect value={strategy} onChange={(event) => setStrategy(event.currentTarget.value)}><option value="all">Tüm stratejiler</option><option value="native">Native Codex</option><option value="composed">Kompozisyon</option><option value="compatibility">Uyumluluk</option></CodexSelect></CodexField>
        </div>
        <div className={styles.resultMeta}><p><strong>{filtered.length}</strong> / {documentedCoverage.components} component gösteriliyor</p>{query || category !== 'all' || strategy !== 'all' ? <CodexBadge tone="accent">Filtre aktif</CodexBadge> : <CodexBadge>Tam kapsam</CodexBadge>}</div>
        <CodexDataTable caption="Codex Enterprise component envanteri" columns={inventoryColumns} rows={filtered} density="compact" sortKey={sortKey} sortDirection={sortDirection} onSortChange={(key, direction) => { setSortKey(key); setSortDirection(direction) }} emptyTitle="Eşleşen component yok" emptyDescription="Arama metnini veya kapsam filtrelerini değiştirin." />
      </section>
    </Page>
  )
}

export const ComponentInventory: Story = { render: () => <Inventory /> }

const audienceCopy = { public: 'Kamusal', buyer: 'Alıcı', seller: 'Satıcı', account: 'Hesap', enterprise: 'Kurumsal' } as const
const audienceTone = { public: 'neutral', buyer: 'info', seller: 'accent', account: 'success', enterprise: 'warning' } as const

export const PageInventory: Story = {
  render: () => (
    <Page title="28 sayfalık ürün akışı" description="Her sayfanın kitlesi, görevi, zorunlu durumları ve Codex kompozisyonu tek matriste görünür.">
      <section className={styles.section}>
        <div className={styles.pageGrid}>
          {CODEX_PAGE_CATALOG.map((page) => (
            <article key={page.name} className={styles.pageCard}>
              <header><h3>{page.label}</h3><CodexBadge tone={audienceTone[page.audience]}>{audienceCopy[page.audience]}</CodexBadge></header>
              <p>{page.purpose}</p>
              <div><h4>Zorunlu story durumları</h4><ul className={styles.stateList}>{page.states.map((state) => <li key={state}>{state}</li>)}</ul></div>
              <p className={styles.composition}>Codex: {page.codexComposition}</p>
            </article>
          ))}
        </div>
      </section>
    </Page>
  ),
}

export const MobileInventory: Story = {
  render: () => <Inventory />,
  globals: { viewport: 'mobile1' },
}
