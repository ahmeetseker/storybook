# Glass Sidebar Ailesi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** visionOS Music kompozisyonunun web karşılığı: `GlassTabBar` (dikey ornament), `GlassSidebar` (composable panel), `GlassSplitView` (kabuk) + Music demo sahnesi.

**Architecture:** Üç bağımsız bileşen, mevcut `GlassSurface` üzerine oturur (tier/ton/kalınlık otomatik gelir). Seçim highlight'ları motion `layoutId` ile satırlar arasında kayar; panel genişliği/disclosure yeni `sidebar` spring'i ile animasyonlanır. Demo sahnesi üçünü birleştirir.

**Tech Stack:** React 19, TypeScript (strict, `tsc -b`), motion/react v12, CSS Modules, Vitest + @testing-library/react, Storybook 10 (react-vite).

**Spec:** `docs/superpowers/specs/2026-07-11-glass-sidebar-design.md`

## Global Constraints

- Yeni npm bağımlılığı eklenmez; mevcut `motion`, `react` kullanılır.
- Dosya kalıbı mevcut bileşenlerle aynı: `src/components/<Ad>/` içinde `<Ad>.tsx`, `<Ad>.module.css`, `<Ad>.stories.tsx`, `<Ad>.test.tsx`, `index.ts`.
- Yorumlar ve test adları Türkçe; kod tanımlayıcıları İngilizce.
- Testler `GlassTierProvider tier="fallback"` ile sarılır (mevcut kalıp).
- `prefers-reduced-motion: reduce` altında genişlik/yükseklik animasyonları kapanır (`prefersReducedMotion()` — `src/core/tier.ts:26`).
- HIG: sidebar'da en fazla iki seviye — iç içe `Group` dev modda `console.warn` üretir.
- `npm run build` (`tsc -b && vite build`) hatasız geçmeli.

---

### Task 1: `sidebar` spring preset'i + GlassTabBar

**Files:**
- Modify: `src/motion/presets.ts`
- Create: `src/components/GlassTabBar/GlassTabBar.tsx`
- Create: `src/components/GlassTabBar/GlassTabBar.module.css`
- Create: `src/components/GlassTabBar/GlassTabBar.stories.tsx`
- Create: `src/components/GlassTabBar/index.ts`
- Test: `src/components/GlassTabBar/GlassTabBar.test.tsx`

**Interfaces:**
- Consumes: `GlassSurface` (`../GlassSurface`), `prefersReducedMotion` (`../../core/tier`), `presets` (`../../motion/presets`).
- Produces: `GlassTabBar` bileşeni — `{ selected: string; onSelect: (id: string) => void; tone?: 'light'|'dark'|'auto'; 'aria-label'?: string; children }` props'lu; `GlassTabBar.Item` — `{ id: string; icon: ReactNode; label: string }`. `presets.springs.sidebar = { stiffness: 260, damping: 32 }`.

- [ ] **Step 1: Failing testi yaz**

`src/components/GlassTabBar/GlassTabBar.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassTabBar } from './GlassTabBar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderBar = (props: Partial<Parameters<typeof GlassTabBar>[0]> = {}) => {
  const onSelect = vi.fn()
  const utils = render(
    <GlassTierProvider tier="fallback">
      <GlassTabBar selected="library" onSelect={onSelect} {...props}>
        <GlassTabBar.Item id="play" icon={<span />} label="Şimdi Çal" />
        <GlassTabBar.Item id="library" icon={<span />} label="Kitaplık" />
        <GlassTabBar.Item id="search" icon={<span />} label="Ara" />
      </GlassTabBar>
    </GlassTierProvider>,
  )
  return { onSelect, ...utils }
}

describe('GlassTabBar', () => {
  it('tablist ve tab rolleriyle render olur, seçili öğe aria-selected alır', () => {
    renderBar()
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical')
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Kitaplık' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Ara' }).getAttribute('aria-selected')).toBe('false')
  })

  it('tıklama onSelect çağırır', () => {
    const { onSelect } = renderBar()
    fireEvent.click(screen.getByRole('tab', { name: 'Ara' }))
    expect(onSelect).toHaveBeenCalledWith('search')
  })

  it('pointer girişinde genişler, çıkışında daralır', () => {
    const { container } = renderBar()
    const bar = container.querySelector('[data-expanded]')!
    expect(bar.getAttribute('data-expanded')).toBe('false')
    fireEvent.pointerEnter(bar)
    expect(bar.getAttribute('data-expanded')).toBe('true')
    fireEvent.pointerLeave(bar)
    expect(bar.getAttribute('data-expanded')).toBe('false')
  })

  it('ArrowDown bir sonraki sekmeyi seçer, ArrowUp öncekini', () => {
    const { onSelect } = renderBar()
    const tabs = screen.getAllByRole('tab')
    tabs[1].focus()
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowDown' })
    expect(onSelect).toHaveBeenCalledWith('search')
    tabs[1].focus()
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowUp' })
    expect(onSelect).toHaveBeenCalledWith('play')
  })

  it('Item, GlassTabBar dışında kullanılırsa anlamlı hata fırlatır', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<GlassTabBar.Item id="x" icon={<span />} label="X" />)).toThrow(
      /GlassTabBar içinde/,
    )
    vi.mocked(console.error).mockRestore()
  })
})
```

Not: proje jest-dom kullanmıyor — bu yüzden nitelik kontrolleri `getAttribute(...)` ile yazıldı; `toHaveAttribute` ekleme.

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run src/components/GlassTabBar --reporter=basic`
Expected: FAIL — "Failed to resolve import ./GlassTabBar"

- [ ] **Step 3: Preset'i ekle**

`src/motion/presets.ts` — `springs` nesnesine satır ekle:

```ts
// RealityKit AnimationLibraryComponent deseninden uyarlanmış adlandırılmış preset kaydı.
export const presets = {
  pressLiquefy: { displacementScale: 1.7, transformScale: 0.96 },
  springs: {
    press: { stiffness: 400, damping: 25 },
    jelly: { stiffness: 300, damping: 15 }, // düşük damping = bırakınca jöle salınımı
    sidebar: { stiffness: 260, damping: 32 }, // panel/highlight — salınımsız, yumuşak duruş
  },
} as const
```

- [ ] **Step 4: Bileşeni yaz**

`src/components/GlassTabBar/GlassTabBar.tsx`:

```tsx
import { createContext, useContext, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassTabBar.module.css'

interface TabBarContextValue {
  selected: string
  onSelect: (id: string) => void
  highlightId: string
}

const TabBarContext = createContext<TabBarContextValue | null>(null)

export interface GlassTabBarProps {
  selected: string
  onSelect: (id: string) => void
  tone?: 'light' | 'dark' | 'auto'
  'aria-label'?: string
  children: ReactNode
}

export interface GlassTabBarItemProps {
  id: string
  icon: ReactNode
  label: string
}

function TabBarRoot({ selected, onSelect, tone = 'auto', 'aria-label': ariaLabel = 'Ana sekmeler', children }: GlassTabBarProps) {
  const [expanded, setExpanded] = useState(false)
  const highlightId = useId()
  const listRef = useRef<HTMLDivElement>(null)

  // visionOS gaze davranışının web karşılığı: bara bakınca (hover/focus) etiketler belirir
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const tabs = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])
    const current = tabs.findIndex((t) => t === document.activeElement)
    if (current === -1) return
    const next = e.key === 'ArrowDown' ? (current + 1) % tabs.length : (current - 1 + tabs.length) % tabs.length
    tabs[next].focus()
    tabs[next].click()
  }

  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false)
  }

  return (
    <GlassSurface
      shape={34}
      tone={tone}
      thickness={0.4}
      className={styles.bar}
      data-expanded={expanded}
      onPointerEnter={() => setExpanded(true)}
      onPointerLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={onBlur}
    >
      <div ref={listRef} role="tablist" aria-label={ariaLabel} aria-orientation="vertical" className={styles.list} onKeyDown={onKeyDown}>
        <TabBarContext.Provider value={{ selected, onSelect, highlightId }}>{children}</TabBarContext.Provider>
      </div>
    </GlassSurface>
  )
}

function Item({ id, icon, label }: GlassTabBarItemProps) {
  const ctx = useContext(TabBarContext)
  if (!ctx) throw new Error('GlassTabBar.Item, GlassTabBar içinde kullanılmalı')
  const { selected, onSelect, highlightId } = ctx
  const isSelected = selected === id
  const reduced = prefersReducedMotion()

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      className={styles.item}
      onClick={() => onSelect(id)}
    >
      {isSelected ? (
        <motion.span
          layoutId={highlightId}
          className={styles.highlight}
          transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
          aria-hidden
        />
      ) : null}
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <span className={styles.labelWrap} aria-hidden={false}>
        <span className={styles.label}>{label}</span>
      </span>
    </button>
  )
}

export const GlassTabBar = Object.assign(TabBarRoot, { Item })
```

`src/components/GlassTabBar/GlassTabBar.module.css`:

```css
.bar {
  display: inline-flex;
  padding: 8px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  padding: 0;
  border-radius: 999px;
  cursor: pointer;
}

.icon {
  position: relative;
  z-index: 1;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  flex: none;
}
.icon svg {
  width: 22px;
  height: 22px;
}

/* Seçili ikonun arkasındaki daire — layoutId ile sekmeler arasında süzülür */
.highlight {
  position: absolute;
  left: 0;
  top: 0;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
}

/* Etiketler grid 0fr→1fr numarasıyla genişler: width animasyonundan akıcı, JS'siz */
.labelWrap {
  display: grid;
  grid-template-columns: 0fr;
  transition: grid-template-columns 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.bar[data-expanded='true'] .labelWrap {
  grid-template-columns: 1fr;
}

.label {
  overflow: hidden;
  white-space: nowrap;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity 0.22s ease 0.06s,
    transform 0.3s cubic-bezier(0.32, 0.72, 0, 1) 0.04s;
}
.bar[data-expanded='true'] .label {
  opacity: 1;
  transform: none;
  padding-right: 18px;
}

@media (prefers-reduced-motion: reduce) {
  .labelWrap,
  .label {
    transition: none;
  }
}
```

`src/components/GlassTabBar/index.ts`:

```ts
export { GlassTabBar, type GlassTabBarProps, type GlassTabBarItemProps } from './GlassTabBar'
```

- [ ] **Step 5: Testlerin geçtiğini doğrula**

Run: `npx vitest run src/components/GlassTabBar --reporter=basic`
Expected: PASS (5 test)

- [ ] **Step 6: Story'yi yaz**

`src/components/GlassTabBar/GlassTabBar.stories.tsx`:

```tsx
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassTabBar } from './GlassTabBar'

const meta = {
  title: 'Components/GlassTabBar',
  component: GlassTabBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof GlassTabBar>

export default meta
type Story = StoryObj<typeof meta>

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function Demo() {
  const [tab, setTab] = useState('library')
  return (
    <div style={{ padding: '48px 160px 48px 48px', borderRadius: 24, background: 'linear-gradient(160deg, #8a7968, #b3a292 55%, #cfbfae)' }}>
      <GlassTabBar selected={tab} onSelect={setTab} tone="light">
        <GlassTabBar.Item id="play" label="Şimdi Çal" icon={<Icon d="M8 5.5v13l11-6.5L8 5.5Z" />} />
        <GlassTabBar.Item id="browse" label="Keşfet" icon={<Icon d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />} />
        <GlassTabBar.Item id="radio" label="Radyo" icon={<Icon d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4" />} />
        <GlassTabBar.Item id="library" label="Kitaplık" icon={<Icon d="M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />} />
        <GlassTabBar.Item id="search" label="Ara" icon={<Icon d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4" />} />
      </GlassTabBar>
    </div>
  )
}

export const Default: Story = {
  args: { selected: 'library', onSelect: () => {}, children: null },
  render: () => <Demo />,
}
```

- [ ] **Step 7: Lint + tam test**

Run: `npm run lint && npm test`
Expected: her ikisi de hatasız

- [ ] **Step 8: Commit**

```bash
git add src/motion/presets.ts src/components/GlassTabBar
git commit -m "feat: GlassTabBar — dikey ornament, hover genişlemesi ve kayan highlight"
```

---

### Task 2: GlassSidebar (Header / Item / Group)

**Files:**
- Create: `src/components/GlassSidebar/SidebarContext.tsx`
- Create: `src/components/GlassSidebar/GlassSidebar.tsx`
- Create: `src/components/GlassSidebar/GlassSidebar.module.css`
- Create: `src/components/GlassSidebar/GlassSidebar.stories.tsx`
- Create: `src/components/GlassSidebar/index.ts`
- Test: `src/components/GlassSidebar/GlassSidebar.test.tsx`

**Interfaces:**
- Consumes: `GlassSurface`, `prefersReducedMotion`, `presets.springs.sidebar` (Task 1'de eklendi).
- Produces: `GlassSidebar` — `{ selected?: string; onSelect?: (id: string) => void; tone?; className?; 'aria-label'?; children }`; `GlassSidebar.Header` — `{ title: ReactNode; subtitle?: ReactNode; action?: ReactNode }`; `GlassSidebar.Item` — `{ id: string; icon?: ReactNode; children: ReactNode }`; `GlassSidebar.Group` — `{ label: ReactNode; defaultOpen?: boolean; children: ReactNode }`.

- [ ] **Step 1: Failing testi yaz**

`src/components/GlassSidebar/GlassSidebar.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassSidebar } from './GlassSidebar'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderSidebar = (props: Partial<Parameters<typeof GlassSidebar>[0]> = {}) => {
  const onSelect = vi.fn()
  const utils = render(
    <GlassTierProvider tier="fallback">
      <GlassSidebar selected="all" onSelect={onSelect} {...props}>
        <GlassSidebar.Header title="Library" subtitle="All Music" />
        <GlassSidebar.Item id="recent">Recently Added</GlassSidebar.Item>
        <GlassSidebar.Group label="Playlists" defaultOpen>
          <GlassSidebar.Item id="all">All Playlists</GlassSidebar.Item>
          <GlassSidebar.Item id="indie">Indie Anthems</GlassSidebar.Item>
        </GlassSidebar.Group>
      </GlassSidebar>
    </GlassTierProvider>,
  )
  return { onSelect, ...utils }
}

describe('GlassSidebar', () => {
  it('nav olarak render olur, başlık ve öğeler görünür', () => {
    renderSidebar()
    expect(screen.getByRole('navigation')).toBeTruthy()
    expect(screen.getByText('Library')).toBeTruthy()
    expect(screen.getByText('Recently Added')).toBeTruthy()
  })

  it('öğe tıklaması onSelect çağırır', () => {
    const { onSelect } = renderSidebar()
    fireEvent.click(screen.getByRole('button', { name: 'Indie Anthems' }))
    expect(onSelect).toHaveBeenCalledWith('indie')
  })

  it('seçili öğe aria-current alır, bilinmeyen selected highlight üretmez', () => {
    renderSidebar()
    expect(screen.getByRole('button', { name: 'All Playlists' }).getAttribute('aria-current')).toBe('page')

    renderSidebar({ selected: 'bilinmeyen-id' })
    const currents = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-current') === 'page')
    expect(currents).toHaveLength(1) // yalnızca ilk render'daki; ikinci render'da yok
  })

  it('Group başlığı aria-expanded günceller ve öğeleri gizler', async () => {
    renderSidebar()
    const groupBtn = screen.getByRole('button', { name: /Playlists/ })
    expect(groupBtn.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(groupBtn)
    expect(groupBtn.getAttribute('aria-expanded')).toBe('false')
    await waitFor(() => expect(screen.queryByText('All Playlists')).toBeNull())
  })

  it('iç içe Group dev uyarısı üretir', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <GlassTierProvider tier="fallback">
        <GlassSidebar>
          <GlassSidebar.Group label="Dış">
            <GlassSidebar.Group label="İç">
              <GlassSidebar.Item id="x">X</GlassSidebar.Item>
            </GlassSidebar.Group>
          </GlassSidebar.Group>
        </GlassSidebar>
      </GlassTierProvider>,
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('iç içe Group'))
    warn.mockRestore()
  })

  it('Item, GlassSidebar dışında kullanılırsa anlamlı hata fırlatır', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<GlassSidebar.Item id="x">X</GlassSidebar.Item>)).toThrow(/GlassSidebar içinde/)
    vi.mocked(console.error).mockRestore()
  })
})
```

Not — `bilinmeyen selected` testi: aynı testte iki `renderSidebar` çağrısı iki ağaç bırakır; ikinci ağaçta `aria-current` olmadığını doğrulamak için sayım 1'de kalmalı. Daha temiz istersen ikinci render'ı `utils.unmount()` sonrası yap.

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run src/components/GlassSidebar --reporter=basic`
Expected: FAIL — "Failed to resolve import ./GlassSidebar"

- [ ] **Step 3: Context ve bileşeni yaz**

`src/components/GlassSidebar/SidebarContext.tsx`:

```tsx
import { createContext, useContext } from 'react'

export interface SidebarContextValue {
  selected?: string
  onSelect?: (id: string) => void
  /** layoutId — highlight kapsülünün satırlar arasında süzülmesi için sidebar örneğine özgü kimlik */
  highlightId: string
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebarContext(component: string): SidebarContextValue {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error(`${component}, GlassSidebar içinde kullanılmalı`)
  return ctx
}

/** HIG: en fazla iki seviye — iç içe Group tespiti için derinlik sayacı */
export const GroupDepthContext = createContext(0)
```

`src/components/GlassSidebar/GlassSidebar.tsx`:

```tsx
import { useContext, useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import { GroupDepthContext, SidebarContext, useSidebarContext } from './SidebarContext'
import styles from './GlassSidebar.module.css'

export interface GlassSidebarProps {
  selected?: string
  onSelect?: (id: string) => void
  tone?: 'light' | 'dark' | 'auto'
  className?: string
  'aria-label'?: string
  children: ReactNode
}

export interface GlassSidebarHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}

export interface GlassSidebarItemProps {
  id: string
  icon?: ReactNode
  children: ReactNode
}

export interface GlassSidebarGroupProps {
  label: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

function SidebarRoot({ selected, onSelect, tone = 'auto', className, 'aria-label': ariaLabel = 'Kenar çubuğu', children }: GlassSidebarProps) {
  const highlightId = useId()
  return (
    <GlassSurface
      as="nav"
      shape={24}
      tone={tone}
      thickness={0.5}
      className={[styles.sidebar, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      <SidebarContext.Provider value={{ selected, onSelect, highlightId }}>{children}</SidebarContext.Provider>
    </GlassSurface>
  )
}

function Header({ title, subtitle, action }: GlassSidebarHeaderProps) {
  useSidebarContext('GlassSidebar.Header')
  return (
    <header className={styles.header}>
      <div>
        <span className={styles.title}>{title}</span>
        {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
      </div>
      {action}
    </header>
  )
}

function Item({ id, icon, children }: GlassSidebarItemProps) {
  const { selected, onSelect, highlightId } = useSidebarContext('GlassSidebar.Item')
  const isSelected = selected === id
  const reduced = prefersReducedMotion()

  return (
    <button
      type="button"
      className={styles.item}
      aria-current={isSelected ? 'page' : undefined}
      onClick={() => onSelect?.(id)}
    >
      {isSelected ? (
        <motion.span
          layoutId={highlightId}
          className={styles.itemHighlight}
          transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
          aria-hidden
        />
      ) : null}
      {icon ? (
        <span className={styles.itemIcon} aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className={styles.itemLabel}>{children}</span>
    </button>
  )
}

function Group({ label, defaultOpen = true, children }: GlassSidebarGroupProps) {
  useSidebarContext('GlassSidebar.Group')
  const depth = useContext(GroupDepthContext)
  if (depth > 0 && import.meta.env.DEV) {
    console.warn('GlassSidebar: iç içe Group desteklenmez — HIG en fazla iki seviye önerir')
  }
  const [open, setOpen] = useState(defaultOpen)
  const reduced = prefersReducedMotion()
  const regionId = useId()

  return (
    <div className={styles.group}>
      <button type="button" className={styles.groupHeader} aria-expanded={open} aria-controls={regionId} onClick={() => setOpen((o) => !o)}>
        <span className={styles.groupLabel}>{label}</span>
        <motion.span
          className={styles.chevronBox}
          animate={{ rotate: open ? 0 : -90 }}
          transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          aria-hidden
        >
          <span className={styles.chevron} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={regionId}
            className={styles.groupItems}
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            <GroupDepthContext.Provider value={depth + 1}>{children}</GroupDepthContext.Provider>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export const GlassSidebar = Object.assign(SidebarRoot, { Header, Item, Group })
```

`src/components/GlassSidebar/GlassSidebar.module.css`:

```css
.sidebar {
  display: flex;
  flex-direction: column;
  width: 300px;
  box-sizing: border-box;
  padding: 20px 12px;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 12px 20px;
}

.title {
  display: block;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em; /* SF display tracking */
}

.subtitle {
  display: block;
  margin-top: 2px;
  font-size: 14px;
  opacity: 0.6;
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 44px; /* dokunma hedefi */
  padding: 0 12px;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 15.5px;
  font-weight: 500;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
}
.item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.itemHighlight {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
}

.itemIcon {
  position: relative;
  z-index: 1;
  width: 22px;
  display: grid;
  place-items: center;
  flex: none;
}
.itemIcon svg {
  width: 18px;
  height: 18px;
}

.itemLabel {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group {
  margin-top: 18px;
}

.groupHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 17px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
}
.groupHeader:hover {
  background: rgba(255, 255, 255, 0.06);
}

.groupItems {
  overflow: hidden;
}

.chevronBox {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
}

/* Aşağı bakan chevron; kapalıyken motion rotate(-90) ile sağa döner */
.chevron {
  width: 8px;
  height: 8px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg) translate(-1px, -1px);
  opacity: 0.6;
}
```

`src/components/GlassSidebar/index.ts`:

```ts
export {
  GlassSidebar,
  type GlassSidebarProps,
  type GlassSidebarHeaderProps,
  type GlassSidebarItemProps,
  type GlassSidebarGroupProps,
} from './GlassSidebar'
```

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run: `npx vitest run src/components/GlassSidebar --reporter=basic`
Expected: PASS (6 test)

- [ ] **Step 5: Story'yi yaz**

`src/components/GlassSidebar/GlassSidebar.stories.tsx`:

```tsx
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSidebar } from './GlassSidebar'

const meta = {
  title: 'Components/GlassSidebar',
  component: GlassSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof GlassSidebar>

export default meta
type Story = StoryObj<typeof meta>

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

function Demo() {
  const [sel, setSel] = useState('all')
  return (
    <div style={{ padding: 40, borderRadius: 24, background: 'linear-gradient(160deg, #8a7968, #b3a292 55%, #cfbfae)' }}>
      <GlassSidebar selected={sel} onSelect={setSel} tone="light">
        <GlassSidebar.Header title="Library" subtitle="All Music" />
        <GlassSidebar.Item id="recent" icon={<Icon d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 3" />}>
          Recently Added
        </GlassSidebar.Item>
        <GlassSidebar.Item id="artists" icon={<Icon d="M15 4a4 4 0 0 0-4 4c0 1 .3 1.8.9 2.5L4 18.4V20h1.6l7.9-7.9c.7.6 1.5.9 2.5.9a4 4 0 0 0 0-8Z" />}>
          Artists
        </GlassSidebar.Item>
        <GlassSidebar.Item id="albums" icon={<Icon d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />}>
          Albums
        </GlassSidebar.Item>
        <GlassSidebar.Item id="songs" icon={<Icon d="M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />}>
          Songs
        </GlassSidebar.Item>
        <GlassSidebar.Group label="Playlists" defaultOpen>
          <GlassSidebar.Item id="all" icon={<Icon d="M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v6H4v-6Zm10 0h6v6h-6v-6Z" />}>
            All Playlists
          </GlassSidebar.Item>
          <GlassSidebar.Item id="good-vibes" icon={<Icon d="M4 6h9M4 12h9M4 18h9M17 6v9.5M17 15.5a2 2 0 1 1-2 2" />}>
            Good Vibes Only
          </GlassSidebar.Item>
          <GlassSidebar.Item id="indie" icon={<Icon d="M4 6h9M4 12h9M4 18h9M17 6v9.5M17 15.5a2 2 0 1 1-2 2" />}>
            Indie Anthems
          </GlassSidebar.Item>
        </GlassSidebar.Group>
      </GlassSidebar>
    </div>
  )
}

export const Default: Story = {
  args: { children: null },
  render: () => <Demo />,
}
```

- [ ] **Step 6: Lint + tam test**

Run: `npm run lint && npm test`
Expected: hatasız

- [ ] **Step 7: Commit**

```bash
git add src/components/GlassSidebar
git commit -m "feat: GlassSidebar — composable panel, kayan seçim highlight'ı ve disclosure grupları"
```

---

### Task 3: GlassSplitView

**Files:**
- Create: `src/components/GlassSplitView/GlassSplitView.tsx`
- Create: `src/components/GlassSplitView/GlassSplitView.module.css`
- Create: `src/components/GlassSplitView/GlassSplitView.stories.tsx`
- Create: `src/components/GlassSplitView/index.ts`
- Test: `src/components/GlassSplitView/GlassSplitView.test.tsx`

**Interfaces:**
- Consumes: `prefersReducedMotion`, `presets.springs.sidebar`, `GlassSurface` (toggle butonu için).
- Produces: `GlassSplitView` — `{ sidebar: ReactNode; children: ReactNode; sidebarOpen?: boolean; defaultOpen?: boolean; onSidebarOpenChange?: (open: boolean) => void; contentKey?: string; sidebarWidth?: number; toggle?: boolean; className? }`. Toggle butonu aria-label: açıkken `"Kenar çubuğunu gizle"`, kapalıyken `"Kenar çubuğunu göster"`.

- [ ] **Step 1: Failing testi yaz**

`src/components/GlassSplitView/GlassSplitView.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GlassSplitView } from './GlassSplitView'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const renderSplit = (props: Partial<Parameters<typeof GlassSplitView>[0]> = {}, content = 'İçerik A') =>
  render(
    <GlassTierProvider tier="fallback">
      <GlassSplitView sidebar={<div>Yan Panel</div>} {...props}>
        <div>{content}</div>
      </GlassSplitView>
    </GlassTierProvider>,
  )

describe('GlassSplitView', () => {
  it('sidebar ve içerik render olur', () => {
    renderSplit()
    expect(screen.getByText('Yan Panel')).toBeTruthy()
    expect(screen.getByText('İçerik A')).toBeTruthy()
  })

  it('kontrollü mod: sidebarOpen=false sidebar bölmesini gizler', () => {
    const { container } = renderSplit({ sidebarOpen: false })
    const slot = container.querySelector('[data-sidebar-slot]')!
    expect(slot.getAttribute('aria-hidden')).toBe('true')
  })

  it('toggle butonu kontrolsüz modda açar/kapar ve onSidebarOpenChange bildirir', () => {
    const onChange = vi.fn()
    const { container } = renderSplit({ toggle: true, defaultOpen: true, onSidebarOpenChange: onChange })
    const btn = screen.getByRole('button', { name: 'Kenar çubuğunu gizle' })
    fireEvent.click(btn)
    expect(onChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('button', { name: 'Kenar çubuğunu göster' })).toBeTruthy()
    expect(container.querySelector('[data-sidebar-slot]')!.getAttribute('aria-hidden')).toBe('true')
  })

  it('contentKey değişince içerik geçiş yapar', async () => {
    const { rerender } = render(
      <GlassTierProvider tier="fallback">
        <GlassSplitView sidebar={<div>Yan Panel</div>} contentKey="a">
          <div>İçerik A</div>
        </GlassSplitView>
      </GlassTierProvider>,
    )
    rerender(
      <GlassTierProvider tier="fallback">
        <GlassSplitView sidebar={<div>Yan Panel</div>} contentKey="b">
          <div>İçerik B</div>
        </GlassSplitView>
      </GlassTierProvider>,
    )
    expect(await screen.findByText('İçerik B')).toBeTruthy()
    await waitFor(() => expect(screen.queryByText('İçerik A')).toBeNull())
  })
})
```

- [ ] **Step 2: Testin başarısız olduğunu doğrula**

Run: `npx vitest run src/components/GlassSplitView --reporter=basic`
Expected: FAIL — "Failed to resolve import ./GlassSplitView"

- [ ] **Step 3: Bileşeni yaz**

`src/components/GlassSplitView/GlassSplitView.tsx`:

```tsx
import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { GlassSurface, type GlassSurfaceProps } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassSplitView.module.css'

export interface GlassSplitViewProps {
  sidebar: ReactNode
  children: ReactNode
  /** Kontrollü görünürlük; verilmezse defaultOpen ile kontrolsüz çalışır */
  sidebarOpen?: boolean
  defaultOpen?: boolean
  onSidebarOpenChange?: (open: boolean) => void
  /** Değişince içerik crossfade + hafif dikey kayma ile yenilenir */
  contentKey?: string
  sidebarWidth?: number
  /** Yerleşik gizle/göster butonu */
  toggle?: boolean
  className?: string
}

const GAP = 16 // sidebar'ın kenarlardan içeri alındığı boşluk (yüzen panel hissi)

export function GlassSplitView({
  sidebar,
  children,
  sidebarOpen,
  defaultOpen = true,
  onSidebarOpenChange,
  contentKey,
  sidebarWidth = 300,
  toggle = false,
  className,
}: GlassSplitViewProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = sidebarOpen ?? internalOpen
  const reduced = prefersReducedMotion()

  const setOpen = (next: boolean) => {
    setInternalOpen(next)
    onSidebarOpenChange?.(next)
  }

  const panelSpring = reduced ? { duration: 0 } : ({ type: 'spring', ...presets.springs.sidebar } as const)
  const contentTween = reduced ? { duration: 0 } : ({ duration: 0.28, ease: [0.32, 0.72, 0, 1] } as const)

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <div className={styles.content}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={contentKey ?? '__static__'}
            className={styles.contentInner}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0, paddingLeft: open ? sidebarWidth + GAP * 3 : GAP + 40 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={contentTween}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sidebar içeriğin ÜSTÜNDE yüzer — arka plan altından görünür (HIG background extension) */}
      <motion.div
        data-sidebar-slot
        className={styles.sidebarSlot}
        aria-hidden={!open}
        initial={false}
        animate={{ width: open ? sidebarWidth : 0, opacity: open ? 1 : 0 }}
        transition={panelSpring}
        style={{ pointerEvents: open ? undefined : 'none' }}
      >
        <div className={styles.sidebarInner} style={{ width: sidebarWidth }}>
          {sidebar}
        </div>
      </motion.div>

      {toggle ? (
        <motion.div
          className={styles.toggleSlot}
          initial={false}
          animate={{ left: open ? sidebarWidth + GAP * 2 : GAP }}
          transition={panelSpring}
        >
          <GlassSurface
            as="button"
            shape="capsule"
            interactive
            thickness={0.3}
            className={styles.toggle}
            aria-expanded={open}
            aria-label={open ? 'Kenar çubuğunu gizle' : 'Kenar çubuğunu göster'}
            onClick={() => setOpen(!open)}
            {...({ type: 'button' } as unknown as GlassSurfaceProps)} // GlassButton'daki cast kalıbı: HTMLAttributes'ta type yok
          >
            <span className={styles.toggleIcon} data-open={open} aria-hidden />
          </GlassSurface>
        </motion.div>
      ) : null}
    </div>
  )
}
```

`src/components/GlassSplitView/GlassSplitView.module.css`:

```css
.root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.content {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  z-index: 1;
}

.contentInner {
  min-height: 100%;
  box-sizing: border-box;
  padding: 24px 24px 24px 0;
}

.sidebarSlot {
  position: absolute;
  top: 16px;
  bottom: 16px;
  left: 16px;
  z-index: 2;
  display: flex;
  overflow: hidden;
  border-radius: 24px;
}

.sidebarInner {
  height: 100%;
  display: flex;
  flex: none;
}
.sidebarInner > * {
  height: 100%;
  overflow-y: auto;
}

.toggleSlot {
  position: absolute;
  top: 24px;
  z-index: 3;
}

.toggle {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

/* Sidebar sembolü: iki bölmeli dikdörtgen */
.toggleIcon {
  width: 16px;
  height: 12px;
  border: 1.8px solid currentColor;
  border-radius: 3px;
  position: relative;
  opacity: 0.85;
}
.toggleIcon::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 4px;
  width: 1.8px;
  background: currentColor;
}
.toggleIcon[data-open='true']::before {
  background: currentColor;
  opacity: 1;
}
.toggleIcon[data-open='false']::before {
  opacity: 0.4;
}
```

`src/components/GlassSplitView/index.ts`:

```ts
export { GlassSplitView, type GlassSplitViewProps } from './GlassSplitView'
```

- [ ] **Step 4: Testlerin geçtiğini doğrula**

Run: `npx vitest run src/components/GlassSplitView --reporter=basic`
Expected: PASS (4 test)

Dikkat: `contentKey` testi `AnimatePresence mode="wait"` yüzünden eski içeriğin kalkmasını bekler; jsdom'da animasyon tamamlanması `waitFor` ile yakalanır. Kararsızlık görürsen `waitFor`'a `{ timeout: 2000 }` ver.

- [ ] **Step 5: Story'yi yaz**

`src/components/GlassSplitView/GlassSplitView.stories.tsx`:

```tsx
import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSplitView } from './GlassSplitView'
import { GlassSidebar } from '../GlassSidebar'

const meta = {
  title: 'Components/GlassSplitView',
  component: GlassSplitView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GlassSplitView>

export default meta
type Story = StoryObj<typeof meta>

const TITLES: Record<string, string> = {
  recent: 'Recently Added',
  all: 'All Playlists',
  indie: 'Indie Anthems',
}

function Demo() {
  const [sel, setSel] = useState('all')
  return (
    <div style={{ height: 560, background: 'linear-gradient(160deg, #8a7968, #b3a292 55%, #cfbfae)', color: 'rgba(255,255,255,0.95)' }}>
      <GlassSplitView
        toggle
        contentKey={sel}
        sidebar={
          <GlassSidebar selected={sel} onSelect={setSel} tone="light">
            <GlassSidebar.Header title="Library" subtitle="All Music" />
            <GlassSidebar.Item id="recent">Recently Added</GlassSidebar.Item>
            <GlassSidebar.Group label="Playlists" defaultOpen>
              <GlassSidebar.Item id="all">All Playlists</GlassSidebar.Item>
              <GlassSidebar.Item id="indie">Indie Anthems</GlassSidebar.Item>
            </GlassSidebar.Group>
          </GlassSidebar>
        }
      >
        <div style={{ paddingTop: 48 }}>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em' }}>{TITLES[sel]}</h1>
          <p style={{ opacity: 0.7 }}>Sidebar'dan seçim yap — içerik crossfade ile geçer.</p>
        </div>
      </GlassSplitView>
    </div>
  )
}

export const Default: Story = {
  args: { sidebar: null, children: null },
  render: () => <Demo />,
}
```

- [ ] **Step 6: Lint + tam test**

Run: `npm run lint && npm test`
Expected: hatasız

- [ ] **Step 7: Commit**

```bash
git add src/components/GlassSplitView
git commit -m "feat: GlassSplitView — yüzen sidebar yerleşimi, gizle/göster ve içerik geçişi"
```

---

### Task 4: Public export'lar + Music demo sahnesi + katalog güncellemesi

**Files:**
- Modify: `src/index.ts`
- Create: `src/demo/MusicDemo.tsx`
- Create: `src/demo/MusicDemo.stories.tsx`
- Modify: `src/demo/ComponentCatalog.tsx:46-50` (Sidebar entry'si), `src/demo/ComponentCatalog.tsx:63-68` (Tab Bar entry'si)

**Interfaces:**
- Consumes: Task 1–3'ün ürettiği `GlassTabBar`, `GlassSidebar`, `GlassSplitView` (component index'lerinden).
- Produces: kütüphane public API'sinde üç yeni bileşen; `MusicDemo` bileşeni (props'suz); Storybook'ta `Demo/Music` story'si.

- [ ] **Step 1: Export'ları ekle**

`src/index.ts` sonuna:

```ts
export { GlassTabBar, type GlassTabBarProps, type GlassTabBarItemProps } from './components/GlassTabBar'
export {
  GlassSidebar,
  type GlassSidebarProps,
  type GlassSidebarHeaderProps,
  type GlassSidebarItemProps,
  type GlassSidebarGroupProps,
} from './components/GlassSidebar'
export { GlassSplitView, type GlassSplitViewProps } from './components/GlassSplitView'
```

- [ ] **Step 2: Music demo sahnesini yaz**

`src/demo/MusicDemo.tsx`:

```tsx
// visionOS Music kompozisyonunun web uyarlaması — GlassTabBar + GlassSidebar + GlassSplitView.
// Katalogdaki diğer demolar gibi inline stil kullanır; kütüphane API'sinin vitrinidir.
import { useState, type CSSProperties, type ReactNode } from 'react'
import { GlassTabBar } from '../components/GlassTabBar'
import { GlassSidebar } from '../components/GlassSidebar'
import { GlassSplitView } from '../components/GlassSplitView'
import { GlassSurface } from '../components/GlassSurface'

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)

const ICONS = {
  play: 'M8 5.5v13l11-6.5L8 5.5Z',
  browse: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  radio: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4',
  library: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4-4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 3',
  mic: 'M15 4a4 4 0 0 0-4 4c0 1 .3 1.8.9 2.5L4 18.4V20h1.6l7.9-7.9c.7.6 1.5.9 2.5.9a4 4 0 0 0 0-8Z',
  album: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  person: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-7 16a7 7 0 0 1 14 0',
  grid: 'M4 5h6v6H4V5Zm10 0h6v6h-6V5ZM4 15h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  playlist: 'M4 6h9M4 12h9M4 18h9M17 6v9.5M17 15.5a2 2 0 1 1-2 2',
} as const

const CONTENT_TITLES: Record<string, { title: string; caption: string }> = {
  recent: { title: 'Recently Added', caption: 'Son eklenenler' },
  artists: { title: 'Artists', caption: '128 Artists' },
  albums: { title: 'Albums', caption: '86 Albums' },
  songs: { title: 'Songs', caption: '1.204 Songs' },
  'made-for-you': { title: 'Made For You', caption: 'Senin için derlendi' },
  all: { title: 'Playlists', caption: 'All 254 Playlists' },
  'good-vibes': { title: 'Good Vibes Only', caption: '32 Songs' },
  indie: { title: 'Indie Anthems', caption: '48 Songs' },
  family: { title: 'Family Dance Party', caption: '25 Songs' },
}

const CARD_HUES = [18, 210, 280, 140, 340, 45]

const cardStyle = (hue: number): CSSProperties => ({
  aspectRatio: '1',
  borderRadius: 18,
  background: `linear-gradient(150deg, hsl(${hue} 24% 46% / 0.55), hsl(${hue} 30% 24% / 0.65))`,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
})

function PlaylistGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20, marginTop: 24 }}>
      {CARD_HUES.map((hue) => (
        <div key={hue}>
          <div style={cardStyle(hue)} />
          <div style={{ height: 10, width: '55%', marginTop: 12, borderRadius: 999, background: 'rgba(255,255,255,0.35)' }} />
        </div>
      ))}
    </div>
  )
}

function SearchCapsule({ placeholder }: { placeholder: string }) {
  return (
    <GlassSurface shape="capsule" variant="clear" thickness={0.25} style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 560, padding: '12px 18px', marginTop: 20 }}>
      <span style={{ width: 18, display: 'inline-flex' }} aria-hidden>
        <Icon d={ICONS.search} />
      </span>
      <input
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'none', color: 'inherit', font: 'inherit', fontSize: 15 }}
      />
    </GlassSurface>
  )
}

export function MusicDemo() {
  const [tab, setTab] = useState('library')
  const [sel, setSel] = useState('all')
  const content = CONTENT_TITLES[sel] ?? CONTENT_TITLES.all

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        minHeight: '100vh',
        padding: '48px 48px 48px 36px',
        boxSizing: 'border-box',
        background: 'radial-gradient(120% 140% at 70% 20%, #cfc4b4 0%, #a99a89 45%, #7d6f60 100%)',
        color: 'rgba(255, 255, 255, 0.95)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      <GlassTabBar selected={tab} onSelect={setTab} tone="light" aria-label="Music sekmeleri">
        <GlassTabBar.Item id="play" label="Şimdi Çal" icon={<Icon d={ICONS.play} />} />
        <GlassTabBar.Item id="browse" label="Keşfet" icon={<Icon d={ICONS.browse} />} />
        <GlassTabBar.Item id="radio" label="Radyo" icon={<Icon d={ICONS.radio} />} />
        <GlassTabBar.Item id="library" label="Kitaplık" icon={<Icon d={ICONS.library} />} />
        <GlassTabBar.Item id="search" label="Ara" icon={<Icon d={ICONS.search} />} />
      </GlassTabBar>

      <GlassSurface shape={36} variant="clear" thickness={0.3} style={{ flex: 1, height: 'calc(100vh - 96px)', minHeight: 480 }}>
        <GlassSplitView
          toggle
          contentKey={sel}
          sidebar={
            <GlassSidebar selected={sel} onSelect={setSel} tone="light">
              <GlassSidebar.Header title="Library" subtitle="All Music" />
              <GlassSidebar.Item id="recent" icon={<Icon d={ICONS.clock} />}>Recently Added</GlassSidebar.Item>
              <GlassSidebar.Item id="artists" icon={<Icon d={ICONS.mic} />}>Artists</GlassSidebar.Item>
              <GlassSidebar.Item id="albums" icon={<Icon d={ICONS.album} />}>Albums</GlassSidebar.Item>
              <GlassSidebar.Item id="songs" icon={<Icon d={ICONS.library} />}>Songs</GlassSidebar.Item>
              <GlassSidebar.Item id="made-for-you" icon={<Icon d={ICONS.person} />}>Made For You</GlassSidebar.Item>
              <GlassSidebar.Group label="Playlists" defaultOpen>
                <GlassSidebar.Item id="all" icon={<Icon d={ICONS.grid} />}>All Playlists</GlassSidebar.Item>
                <GlassSidebar.Item id="good-vibes" icon={<Icon d={ICONS.playlist} />}>Good Vibes Only</GlassSidebar.Item>
                <GlassSidebar.Item id="indie" icon={<Icon d={ICONS.playlist} />}>Indie Anthems</GlassSidebar.Item>
                <GlassSidebar.Item id="family" icon={<Icon d={ICONS.playlist} />}>Family Dance Party</GlassSidebar.Item>
              </GlassSidebar.Group>
            </GlassSidebar>
          }
        >
          <div style={{ paddingTop: 40, paddingRight: 12 }}>
            <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em' }}>{content.title}</h1>
            <p style={{ margin: '6px 0 0', fontSize: 15, opacity: 0.65 }}>{content.caption}</p>
            <SearchCapsule placeholder={`Search in ${content.title}`} />
            <PlaylistGrid />
          </div>
        </GlassSplitView>
      </GlassSurface>
    </div>
  )
}
```

- [ ] **Step 3: Demo story'sini yaz**

`src/demo/MusicDemo.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MusicDemo } from './MusicDemo'

const meta = {
  title: 'Demo/Music',
  component: MusicDemo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MusicDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
```

- [ ] **Step 4: Katalog entry'lerini güncelle**

`src/demo/ComponentCatalog.tsx` içinde `Sidebar` entry'sini (satır ~46-50) şununla değiştir:

```tsx
  {
    name: 'Sidebar',
    description: "visionOS tarzı yüzen cam kenar çubuğu — kayan seçim highlight'ı, disclosure grupları, split view ile içerik geçişi.",
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/demo-music--default',
  },
```

`Tab Bar` entry'sini (satır ~63-68) şununla değiştir:

```tsx
  {
    name: 'Tab Bar',
    description: "Dikey visionOS ornament'ı — hover'da genişleyip etiketleri gösterir, seçim highlight'ı sekmeler arasında süzülür.",
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glasstabbar--default',
  },
```

Not: `preview` alanı bilinçli olarak verilmedi — iki bileşen de 72px'lik önizleme kutusuna sığmayacak kadar büyük; `storyPath` canlı story'ye götürüyor. `preview` yoksa kutuda "Yakında" yazar; bunu önlemek için `ComponentCatalog.tsx:189`'daki fallback'i durumdan haberdar et:

```tsx
{entry.preview ?? (
  <span style={{ fontSize: 12, color: '#9ca3af' }}>
    {entry.status === 'hazır' ? "Story'de izle →" : 'Yakında'}
  </span>
)}
```

- [ ] **Step 5: Tam doğrulama**

Run: `npm run lint && npm test && npm run build`
Expected: üçü de hatasız (build = `tsc -b && vite build`)

- [ ] **Step 6: Commit**

```bash
git add src/index.ts src/demo/MusicDemo.tsx src/demo/MusicDemo.stories.tsx src/demo/ComponentCatalog.tsx
git commit -m "feat: Music demo sahnesi, public export'lar ve katalog güncellemesi"
```

---

### Task 5: Uçtan uca doğrulama

**Files:**
- Modify: yok (yalnızca doğrulama; bulgu çıkarsa ilgili task dosyalarına döner)

**Interfaces:**
- Consumes: Task 1–4'ün tamamı.
- Produces: yeşil test/build/storybook çıktısı.

- [ ] **Step 1: Tüm süit**

Run: `npm test`
Expected: tüm testler PASS (mevcut GlassButton/GlassNavbar/GlassSurface testleri dahil)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `tsc -b` tip hatasız, vite build tamam

- [ ] **Step 3: Storybook build**

Run: `npm run build-storybook`
Expected: hatasız; `storybook-static/` güncellenir

- [ ] **Step 4: Görsel duman testi (manuel, kullanıcıyla)**

Run: `npm run storybook`
Kontrol listesi — `Demo/Music` story'sinde:
- Tab bar hover'da genişleyip etiketleri gösteriyor, çıkınca daralıyor
- Sidebar'da seçim highlight'ı satırlar arasında süzülüyor
- Playlists grubu chevron ile kapanıp açılıyor
- Toggle butonu sidebar'ı gizleyince içerik sola genişliyor
- İçerik `contentKey` değişiminde crossfade yapıyor
- Chrome'da refraction tier'da FPS gözle akıcı (sidebar büyük yüzey — spec'teki performans notu)

- [ ] **Step 5: Bulgu yoksa bitir**

Bulgu varsa ilgili task'ın dosyalarında düzelt, testi güncelle, aynı commit disipliniyle ilerle.
