# GlassHeader · GlassHero · GlassFooter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site seviyesi header (5 varyant), hero (4 varyant) ve footer (5 varyant) kütüphane component'leri — kullanıcı nihai deseni Storybook karşılaştırma story'lerinden seçecek.

**Architecture:** Her component tam konvansiyon setiyle (`tsx + module.css + stories + test + rules.md + index`) gelir, `src/index.ts`'e export edilir ve `ComponentCatalog`'a kaydedilir. Default görünüm flat (site zeminiyle uyumlu); cam yalnız header'da `material="glass"` seçilirse. Header mobil menüsü mevcut `GlassDrawer`'ı yeniden kullanır.

**Tech Stack:** React 19, CSS Modules + `--lg-*` token'ları, Storybook (`@storybook/react-vite`), vitest + testing-library.

**Spec:** `docs/superpowers/specs/2026-07-16-header-hero-footer-design.md`

## Global Constraints

- Component CSS'inde raw hex/rgba renk yasak — yalnız `var(--lg-*)` token'ları ve `color-mix(in srgb, var(--lg-*) N%, transparent)` türevleri (token fallback'i serbest, ör. `var(--lg-radius-chip, 10px)`). Boşluk/padding/font-size'da raw px mevcut component CSS konvansiyonudur (bkz. GlassNavbar.module.css) — serbest, ama rules.md §9'da "borç" olarak listelenir.
- Radius yalnız chip/media/card/capsule ölçeğinden; focus halkası `outline: 2px solid var(--lg-accent)` yalnız `:focus-visible`; hover stilleri `@media (hover: hover)` içinde; dokunmatikte min 44px hedef (`pointer: coarse` sorgusuyla yükseltilir).
- hover/focus/active asla prop olmaz; Controls yalnız public API.
- Story başlıkları tam olarak `Components/GlassHeader`, `Components/GlassHero`, `Components/GlassFooter`; `tags: ['autodocs']`.
- Testler mevcut desene uyar: `GlassTierProvider tier="fallback"` sarmalayıcısı (`src/components/GlassNavbar/GlassNavbar.test.tsx` deseni).
- Doğrulama komutları: `npx tsc -b` temiz; `npm run lint` — repo'da ÖNCEDEN var olan react-hooks hataları dokunulmamış component story dosyalarında (baseline), kural "yeni lint hatası yok"; `npm test` tüm suite yeşil.
- Commit mesajlarına şu trailer eklenir: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: GlassHeader — 5 varyantlı site header'ı

**Files:**
- Create: `src/components/GlassHeader/GlassHeader.tsx`
- Create: `src/components/GlassHeader/GlassHeader.module.css`
- Create: `src/components/GlassHeader/GlassHeader.stories.tsx`
- Create: `src/components/GlassHeader/GlassHeader.test.tsx`
- Create: `src/components/GlassHeader/rules.md`
- Create: `src/components/GlassHeader/index.ts`
- Modify: `src/index.ts` (export ekle)
- Modify: `src/demo/ComponentCatalog.tsx` (katalog kaydı)

**Interfaces:**
- Consumes: `GlassSurface` (`shape: number | 'capsule'`, `tone`, `thickness`, `as`, `className`), `GlassDrawer` (`open`, `onClose`, `title`, `side`, `size`), `GlassIconButton` (`label` zorunlu, children ikon), `GlassTierProvider` (testlerde).
- Produces: `GlassHeader`, `GlassHeaderProps`, `GlassHeaderLink` — Task 4'te story path `components-glassheader--default`.

- [ ] **Step 1: CSS modülünü yaz**

`src/components/GlassHeader/GlassHeader.module.css`:

```css
/* GlassHeader — site seviyesi header. Default flat (site zeminiyle uyumlu);
   material="glass" yalnız kapsayıcıda cam kullanır (sayfada 1 cam yüzey). */
.root {
  position: relative;
  z-index: 20;
  width: 100%;
  box-sizing: border-box;
}
.sticky { position: sticky; top: 0; }

.flatRoot { background: var(--lg-surface); border-bottom: 1px solid var(--lg-hairline); }
.glassRoot { background: none; }
.capsuleRoot { background: none; padding: 12px 16px; }

.inner,
.innerColumn { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
.inner { display: flex; align-items: center; gap: 16px; min-height: 60px; }
.innerColumn { display: flex; flex-direction: column; }

.logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: none;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.022em;
  color: var(--lg-label);
}

.grow { flex: 1; min-width: 0; }

.nav { display: flex; min-width: 0; }
.linkList {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2px;
  width: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
}
.link {
  display: inline-flex;
  align-items: center;
  min-height: var(--lg-control-sm, 36px);
  padding: 0 12px;
  border-radius: var(--lg-radius-chip, 10px);
  color: var(--lg-label-secondary);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
}
@media (hover: hover) {
  .link:hover { color: var(--lg-label); background: color-mix(in srgb, var(--lg-label) 7%, transparent); }
}
.link:focus-visible { outline: 2px solid var(--lg-accent); outline-offset: 2px; }
.linkActive { color: var(--lg-label); font-weight: 600; background: color-mix(in srgb, var(--lg-label) 7%, transparent); }
@media (pointer: coarse) { .link { min-height: 44px; } }

.actions { display: inline-flex; align-items: center; gap: 8px; flex: none; }
.burger { display: none; }
.burgerAlways { display: inline-flex; }

/* centered: üstte 3 kolonlu satır (ortada logo), altında ortalanmış nav */
.centeredTop { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; min-height: 60px; }
.centeredTop > .logo { grid-column: 2; justify-self: center; }
.centeredTop > .actions { grid-column: 3; justify-self: end; }
.centeredNav { padding-bottom: 10px; }

/* split: üst utility satırı her zaman flat */
.utility { border-bottom: 1px solid var(--lg-hairline); background: var(--lg-bg); }
.utilityInner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 6px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: var(--lg-label-secondary);
}

/* capsule: içerikten boşlukla ayrık yüzen tek kapsül */
.capsule {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 960px;
  margin: 0 auto;
  padding: 8px 16px;
  border-radius: 999px;
  box-sizing: border-box;
}
.capsuleFlat { background: var(--lg-surface); border: 1px solid var(--lg-hairline); }

/* mobil menü (GlassDrawer içi) listesi */
.drawerList { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.drawerLink {
  display: flex;
  width: 100%;
  align-items: center;
  min-height: var(--lg-control-lg, 44px);
  padding: 0 14px;
  border: none;
  border-radius: var(--lg-radius-chip, 10px);
  background: none;
  font: inherit;
  font-size: 15px;
  color: var(--lg-label);
  cursor: pointer;
  text-align: start;
}
@media (hover: hover) {
  .drawerLink:hover { background: color-mix(in srgb, var(--lg-label) 7%, transparent); }
}
.drawerLink:focus-visible { outline: 2px solid var(--lg-accent); outline-offset: 2px; }
.drawerLinkActive { font-weight: 700; color: var(--lg-accent); }

/* Dar viewport: linkler hamburger menüsüne çöker. Container query pratik değil
   (header sayfa kökünde sticky; containment sticky'i bozar) — gerekçe rules.md §7. */
@media (max-width: 760px) {
  .nav { display: none; }
  .burger { display: inline-flex; }
  .utility { display: none; }
  .centeredTop { grid-template-columns: auto 1fr auto; }
  .centeredTop > .logo { grid-column: 1; justify-self: start; }
  .centeredTop > .actions { grid-column: 3; }
}
```

- [ ] **Step 2: Component'i yaz**

`src/components/GlassHeader/GlassHeader.tsx`:

```tsx
// Site seviyesi header — logo, nav linkleri, CTA ve mobil menü (GlassDrawer).
// Default material="flat"; "glass" yalnız kapsayıcıda cam kullanır.
import { useState, type MouseEvent, type ReactNode } from 'react'
import { GlassSurface } from '../GlassSurface'
import { GlassDrawer } from '../GlassDrawer'
import { GlassIconButton } from '../GlassIconButton'
import styles from './GlassHeader.module.css'

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export interface GlassHeaderLink {
  label: string
  onClick?: () => void
  href?: string
  /** Aktif sayfa linki — aria-current="page" */
  active?: boolean
}

export interface GlassHeaderProps {
  /** Marka alanı (metin veya görsel) */
  logo: ReactNode
  links?: GlassHeaderLink[]
  /** Sağ CTA alanı — GlassButton'ları çağıran verir */
  actions?: ReactNode
  /** Yalnız variant="split": üst ince utility satırı içeriği */
  utility?: ReactNode
  /** Yerleşim deseni */
  variant?: 'bar' | 'centered' | 'split' | 'capsule' | 'minimal'
  /** Default flat — site zeminiyle uyumlu; glass yalnız kapsayıcıda cam kullanır */
  material?: 'glass' | 'flat'
  sticky?: boolean
  tone?: 'light' | 'dark' | 'auto'
  /** Mobil menü başlığı ve hamburger'ın accessible name'i */
  menuLabel?: string
}

export function GlassHeader({
  logo,
  links = [],
  actions,
  utility,
  variant = 'bar',
  material = 'flat',
  sticky = true,
  tone = 'auto',
  menuLabel = 'Menü',
}: GlassHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClick = (link: GlassHeaderLink) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!link.href) e.preventDefault()
    link.onClick?.()
  }

  const navList = (extraClass?: string) =>
    links.length > 0 && variant !== 'minimal' ? (
      <nav aria-label="Site" className={[styles.nav, extraClass].filter(Boolean).join(' ')}>
        <ul className={styles.linkList}>
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href ?? '#'}
                onClick={linkClick(link)}
                aria-current={link.active ? 'page' : undefined}
                className={link.active ? `${styles.link} ${styles.linkActive}` : styles.link}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    ) : null

  const actionArea = (
    <span className={styles.actions}>
      {actions}
      {links.length > 0 ? (
        <span className={variant === 'minimal' ? styles.burgerAlways : styles.burger}>
          <GlassIconButton label={menuLabel} onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </GlassIconButton>
        </span>
      ) : null}
    </span>
  )

  const logoEl = <span className={styles.logo}>{logo}</span>

  let content: ReactNode
  if (variant === 'centered') {
    content = (
      <div className={styles.innerColumn}>
        <div className={styles.centeredTop}>
          <span aria-hidden />
          {logoEl}
          {actionArea}
        </div>
        {navList(styles.centeredNav)}
      </div>
    )
  } else if (variant === 'capsule') {
    const capsuleChildren = (
      <>
        {logoEl}
        {navList(styles.grow) ?? <span className={styles.grow} aria-hidden />}
        {actionArea}
      </>
    )
    content =
      material === 'glass' ? (
        <GlassSurface shape="capsule" tone={tone} thickness={0.35} className={styles.capsule}>
          {capsuleChildren}
        </GlassSurface>
      ) : (
        <div className={`${styles.capsule} ${styles.capsuleFlat}`}>{capsuleChildren}</div>
      )
  } else {
    content = (
      <div className={styles.inner}>
        {logoEl}
        {navList(styles.grow) ?? <span className={styles.grow} aria-hidden />}
        {actionArea}
      </div>
    )
  }

  const rootClasses = [
    styles.root,
    sticky ? styles.sticky : '',
    variant === 'capsule' ? styles.capsuleRoot : material === 'glass' ? styles.glassRoot : styles.flatRoot,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={rootClasses} data-variant={variant} data-material={material}>
      {variant === 'split' && utility ? (
        <div className={styles.utility}>
          <div className={styles.utilityInner}>{utility}</div>
        </div>
      ) : null}
      {material === 'glass' && variant !== 'capsule' ? (
        <GlassSurface as="div" shape={0} tone={tone} thickness={0.3}>
          {content}
        </GlassSurface>
      ) : (
        content
      )}
      {links.length > 0 ? (
        <GlassDrawer open={menuOpen} onClose={() => setMenuOpen(false)} title={menuLabel} side="right" size="sm">
          <ul className={styles.drawerList}>
            {links.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  aria-current={link.active ? 'page' : undefined}
                  className={link.active ? `${styles.drawerLink} ${styles.drawerLinkActive}` : styles.drawerLink}
                  onClick={() => {
                    link.onClick?.()
                    setMenuOpen(false)
                  }}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </GlassDrawer>
      ) : null}
    </header>
  )
}
```

Not: `GlassSurface`'ın `shape={0}` kabul etmediğini typecheck söylerse (`shape?: number | 'capsule'` — 0 geçerli), sorun yaşarsan `shape={0}` yerine sarmalayıcıyı kaldırıp glassRoot'a CSS'te `backdrop-filter` VERME — bunun yerine `GlassSurface`'ı `className={styles.glassBar}` ile kullan ve raporda not düş.

- [ ] **Step 3: Testleri yaz**

`src/components/GlassHeader/GlassHeader.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { GlassHeader, type GlassHeaderLink } from './GlassHeader'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const makeLinks = (): GlassHeaderLink[] => [
  { label: 'İlanlar', onClick: vi.fn(), active: true },
  { label: 'Harita', onClick: vi.fn() },
]

const renderHeader = (props = {}, links = makeLinks()) => {
  render(
    <GlassTierProvider tier="fallback">
      <GlassHeader logo="ArsaPazar" links={links} {...props} />
    </GlassTierProvider>,
  )
  return links
}

describe('GlassHeader', () => {
  it('banner ve "Site" navigasyon landmarklarını render eder', () => {
    renderHeader()
    expect(screen.getByRole('banner')).toBeDefined()
    expect(screen.getByRole('navigation', { name: 'Site' })).toBeDefined()
  })

  it('aktif linkte aria-current="page" vardır, diğerlerinde yoktur', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'İlanlar' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Harita' }).getAttribute('aria-current')).toBeNull()
  })

  it('href olmayan link tıklaması onClick çağırır', () => {
    const links = renderHeader()
    fireEvent.click(screen.getByRole('link', { name: 'Harita' }))
    expect(links[1].onClick).toHaveBeenCalledTimes(1)
  })

  it('hamburger menüyü açar; menü öğesi tıklanınca onClick çağrılır', () => {
    const links = renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Menü' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Harita' }))
    expect(links[1].onClick).toHaveBeenCalledTimes(1)
  })

  it('utility bar varyantında render olmaz, split varyantında olur', () => {
    renderHeader({ utility: <span>Kurumsal Çözümler</span> })
    expect(screen.queryByText('Kurumsal Çözümler')).toBeNull()
  })

  it('split varyantında utility görünür', () => {
    renderHeader({ variant: 'split', utility: <span>Kurumsal Çözümler</span> })
    expect(screen.getByText('Kurumsal Çözümler')).toBeDefined()
  })

  it('minimal varyantta nav listesi yoktur, hamburger vardır', () => {
    renderHeader({ variant: 'minimal' })
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.getByRole('button', { name: 'Menü' })).toBeDefined()
  })

  it('variant ve material data attribute olarak işaretlenir', () => {
    renderHeader({ variant: 'capsule', material: 'glass' })
    const header = screen.getByRole('banner')
    expect(header.getAttribute('data-variant')).toBe('capsule')
    expect(header.getAttribute('data-material')).toBe('glass')
  })

  it('links verilmezse nav ve hamburger render edilmez', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassHeader logo="ArsaPazar" />
      </GlassTierProvider>,
    )
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Menü' })).toBeNull()
  })
})
```

- [ ] **Step 4: Testleri koş — kırmızıdan yeşile**

Run: `npx vitest run src/components/GlassHeader/GlassHeader.test.tsx`
Expected: 9/9 PASS (component Step 2'de yazıldığı için doğrudan yeşil; import hatası veya assert kırmızısı görürsen component'i düzelt, testi değil).

- [ ] **Step 5: Story'leri yaz**

`src/components/GlassHeader/GlassHeader.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassHeader, type GlassHeaderLink } from './GlassHeader'
import { GlassButton } from '../GlassButton'

const navLinks: GlassHeaderLink[] = [
  { label: 'Satılık Arsa', active: true },
  { label: 'Harita' },
  { label: 'Mağazalar' },
  { label: 'Fiyat Analizi' },
  { label: 'Kurumsal' },
  { label: 'Yardım' },
]

const Logo = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <span
      aria-hidden
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        background: 'var(--lg-accent)',
        color: '#fff',
        display: 'inline-grid',
        placeItems: 'center',
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      A
    </span>
    ArsaPazar
  </span>
)

const Actions = () => (
  <>
    <GlassButton size="sm">Giriş Yap</GlassButton>
    <GlassButton size="sm" prominent>İlan Ver</GlassButton>
  </>
)

const Utility = () => (
  <>
    <span>0 (232) 456 78 90</span>
    <a href="#kurumsal" style={{ color: 'inherit' }}>Kurumsal Çözümler</a>
    <a href="#yardim" style={{ color: 'inherit' }}>Yardım Merkezi</a>
    <span>TR ▾</span>
  </>
)

const meta = {
  title: 'Components/GlassHeader',
  component: GlassHeader,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { logo: <Logo />, links: navLinks, actions: <Actions /> },
} satisfies Meta<typeof GlassHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Altına içerik koyup sticky davranışını gösteren sarmalayıcı */
const PageBody = () => (
  <div style={{ height: 480, padding: '24px 20px', color: 'var(--lg-label-secondary)' }}>
    Sayfa içeriği — header üstte sabit kalır.
  </div>
)

export const Default: Story = {
  render: (args) => (
    <div>
      <GlassHeader {...args} />
      <PageBody />
    </div>
  ),
}

export const Playground: Story = {}

export const Centered: Story = { args: { variant: 'centered' } }

export const Split: Story = { args: { variant: 'split', utility: <Utility /> } }

export const Capsule: Story = { args: { variant: 'capsule' } }

export const Minimal: Story = { args: { variant: 'minimal' } }

export const CamMalzeme: Story = {
  name: 'Cam Malzeme (glass)',
  args: { material: 'glass', variant: 'capsule' },
  render: (args) => (
    <div style={{ minHeight: 320, background: 'linear-gradient(135deg, #3a6f5f, #1f4a3a 55%, #8a6f3a)', paddingBottom: 40 }}>
      <GlassHeader {...args} />
      <PageBody />
    </div>
  ),
}

export const UzunIcerik: Story = {
  name: 'Uzun İçerik',
  args: {
    links: [
      ...navLinks,
      { label: 'Krediye Uygun Arsalar' },
      { label: 'Yatırım Rehberi' },
      { label: 'Bölge Raporları' },
      { label: 'Sık Sorulan Sorular' },
    ],
  },
}

export const VaryantKarsilastirma: Story = {
  name: 'Varyant Karşılaştırma',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 40 }}>
      {(['bar', 'centered', 'split', 'capsule', 'minimal'] as const).map((variant) => (
        <section key={variant}>
          <h3 style={{ margin: '0 0 10px', padding: '0 20px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lg-label-secondary)' }}>
            variant="{variant}"
          </h3>
          <GlassHeader
            {...args}
            variant={variant}
            sticky={false}
            utility={variant === 'split' ? <Utility /> : undefined}
          />
        </section>
      ))}
    </div>
  ),
}
```

- [ ] **Step 6: rules.md ve index.ts'i yaz**

`src/components/GlassHeader/index.ts`:

```ts
export { GlassHeader, type GlassHeaderProps, type GlassHeaderLink } from './GlassHeader'
```

`src/components/GlassHeader/rules.md`:

```markdown
---
name: GlassHeader
category: navigasyon
status: hazır
lastReviewed: 2026-07-16
---

# GlassHeader Kuralları

## 1. Amaç

Site seviyesi header: logo, nav linkleri, CTA aksiyonları ve mobil menü.
Beş yerleşim varyantı; default görünüm flat (site zeminiyle uyumlu), cam opsiyonel.

- **Kullan:** kamuya açık site sayfalarının üst navigasyonu (ana sayfa, listeleme, kurumsal).
- **Kullanma:** uygulama içi geri+başlık barı (→ `GlassNavbar`), sekmeler (→ `GlassTabBar`).

| İlgili | Farkı |
|---|---|
| GlassNavbar | iOS tarzı kompakt araç çubuğu; GlassHeader site markası + tam nav taşır |
| GlassDrawer | Mobil menünün overlay'i; sözleşmesi (focus trap, focus dönüşü) miras alınır |

## 2. Semantik sözleşme

- Kök `<header>` (banner landmark) + içinde `<nav aria-label="Site">`.
- Linkler gerçek `<a>`; `href` yoksa `#` + `preventDefault` + `onClick`.
- Aktif link `aria-current="page"`.
- Hamburger `GlassIconButton` — `menuLabel` accessible name'idir (default 'Menü').
- Logo `<span>`; heading değildir.

## 3. Anatomy

| Slot | Zorunlu | Kurallar |
|---|---|---|
| logo | ✅ | Marka; tek satır |
| links | — | `GlassHeaderLink[]`; boşsa nav + hamburger render edilmez |
| actions | — | `<GlassButton>` önerilir; en fazla 2-3 CTA |
| utility | — | Yalnız `variant="split"`; her zaman flat üst satır |
| mobil menü | otomatik | GlassDrawer sağ panel; linkler tam genişlik buton |

## 4. Public API

| Ad | Type | Default | Açıklama |
|---|---|---|---|
| logo | `ReactNode` | — | Marka alanı |
| links | `GlassHeaderLink[]` | `[]` | `{label, onClick?, href?, active?}` |
| actions | `ReactNode` | — | Sağ CTA alanı |
| utility | `ReactNode` | — | Yalnız split |
| variant | `'bar'\|'centered'\|'split'\|'capsule'\|'minimal'` | `'bar'` | Yerleşim |
| material | `'glass'\|'flat'` | `'flat'` | Cam yalnız kapsayıcıda |
| sticky | `boolean` | `true` | `position: sticky; top: 0` |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'a iletilir |
| menuLabel | `string` | `'Menü'` | Hamburger adı + drawer başlığı |

`...rest` yok.

## 5. Seçenek eksenleri

| Kural | Davranış |
|---|---|
| `utility` + variant ≠ split | Render edilmez |
| `variant="minimal"` | Nav listesi hiçbir genişlikte görünmez; linkler yalnız menüde |
| `material="glass"` | Sayfada 1 cam yüzey harcar; cam üstüne cam yasağı gereği linkler düz `<a>` |

## 6. State modeli

Tek iç state: mobil menü `open`. Link hover/focus CSS'tedir (`:focus-visible` halka,
`@media (hover: hover)` hover). `disabled` ekseni yok.

## 7. Davranış

- `sticky`: `position: sticky; top: 0; z-index: 20`.
- Dar viewport (`max-width: 760px` media query): nav gizlenir, hamburger görünür,
  utility gizlenir. **Container query kullanılmadı** çünkü header sayfa kökünde
  sticky'dir ve containment sticky konumlandırmayı bozar — bilinçli istisna.
- Mobil menü: GlassDrawer (portal + focus trap + kapanışta hamburger'a focus dönüşü).
  Menü öğesi tıklanınca `onClick` çağrılır ve menü kapanır.

## 8. İçerik

- Link etiketleri kısa (1-3 kelime); 6-8 linkten fazlası `UzunIcerik` story'sindeki
  gibi sarmalanır, ideal değildir — bilgi mimarisini sadeleştir.
- `menuLabel` lokalizasyon için dışarıdan verilebilir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| flat kabuk | background / border | `--lg-surface` / `--lg-hairline` |
| link | renk / radius / yükseklik | `--lg-label(-secondary)` / `--lg-radius-chip` / `--lg-control-sm` |
| focus halkası | outline | `--lg-accent` |
| hover/aktif zemin | background | `color-mix(--lg-label 7%)` |
| kapsül (glass) | malzeme | GlassSurface capsule, thickness 0.35 |

**Borç (raw):** min-height 60px (header yüksekliği), padding/gap değerleri,
font-size 15/17/13px, 760px breakpoint, kapsül max-width 960px.

## 10. Storybook kapsamı

Default, Playground, Centered, Split, Capsule, Minimal, CamMalzeme (gradyan zeminde),
UzunIcerik, VaryantKarsilastirma (5 varyant alt alta — seçim story'si).
Temalar/tier toolbar'dan.

## 11. Test kabul kriterleri

- [x] banner + "Site" navigation landmark
- [x] aktif link `aria-current="page"`
- [x] href'siz link onClick + preventDefault yolu
- [x] hamburger menüyü açar; menü öğesi onClick çağırır
- [x] utility yalnız split'te
- [x] minimal'de nav yok, hamburger var
- [x] data-variant / data-material işaretleri
- [x] links boşken nav + hamburger yok
- [ ] dar viewport nav çökmesi (visual, Chrome)
- [ ] glass kapsülün cam görünümü (visual, Chrome)

## 12. Do / Don't

- ✅ actions'a yalnız buton/link ver; blok içerik verme.
- ✅ Sayfada tek GlassHeader kullan (tek banner landmark).
- ❌ `material="glass"` + sayfada 5'ten fazla başka cam yüzey (≤6 kuralı).
- ❌ Linklere ikon dışında blok element koyma.

**Bilinen kısıtlar:** nav çökmesi viewport media query'siyledir; dar bir container
içinde kullanılırsa çökme tetiklenmez. **Açık kararlar:** megamenü/dropdown (v2,
GlassMenu ile) · `--lg-space-*` token'ları gelince raw boşluk borcunun kapanması.
```

- [ ] **Step 7: Export ve katalog kaydı**

`src/index.ts`'e (GlassNavbar export satırının altına):

```ts
export { GlassHeader, type GlassHeaderProps, type GlassHeaderLink } from './components/GlassHeader'
```

`src/demo/ComponentCatalog.tsx` — `ENTRIES` dizisinde Navigasyon bölümüne (mevcut Navigasyon girdilerinin yanına) ekle:

```tsx
  {
    name: 'Header',
    description: 'Site seviyesi header — 5 yerleşim varyantı (bar/centered/split/capsule/minimal), flat default + opsiyonel cam, GlassDrawer mobil menü.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassheader--default',
  },
```

- [ ] **Step 8: Doğrula**

Run: `npx tsc -b && npm run lint && npm test`
Expected: typecheck temiz; lint'te YENİ hata yok (baseline hariç); tüm suite yeşil (310 + 9 yeni).

- [ ] **Step 9: Commit**

```bash
git add src/components/GlassHeader/ src/index.ts src/demo/ComponentCatalog.tsx
git commit -m "feat: GlassHeader — 5 varyantlı site header'ı (bar/centered/split/capsule/minimal)"
```

---

### Task 2: GlassHero — 4 varyantlı hero + scrim token'ları

**Files:**
- Modify: `src/index.css` (`--lg-scrim`, `--lg-on-scrim` token'ları)
- Create: `src/components/GlassHero/GlassHero.tsx`
- Create: `src/components/GlassHero/GlassHero.module.css`
- Create: `src/components/GlassHero/GlassHero.stories.tsx`
- Create: `src/components/GlassHero/GlassHero.test.tsx`
- Create: `src/components/GlassHero/rules.md`
- Create: `src/components/GlassHero/index.ts`
- Modify: `src/index.ts`, `src/demo/ComponentCatalog.tsx`

**Interfaces:**
- Consumes: yalnız token'lar; story'lerde `GlassButton`, `placeholderImage` (`src/demo/placeholderImage`).
- Produces: `GlassHero`, `GlassHeroProps`; token'lar `--lg-scrim`, `--lg-on-scrim`.

- [ ] **Step 1: Token'ları ekle**

`src/index.css` — `:root` bloğundaki token listesine (mevcut renk token'larının yanına):

```css
  /* Hero showcase overlay: medya üstü karartma + üzerindeki metin rengi */
  --lg-scrim: rgba(10, 12, 16, 0.55);
  --lg-on-scrim: #ffffff;
```

Dark tema bloğuna (`--lg-bg: #121316` olan bölüme):

```css
    --lg-scrim: rgba(4, 5, 8, 0.62);
    --lg-on-scrim: #ffffff;
```

Not: index.css'te hem `@media (prefers-color-scheme: dark)` hem `data-theme` override
bloğu varsa her ikisine de ekle (dosyadaki mevcut dark token deseninin birebir aynısını izle).

- [ ] **Step 2: CSS modülünü yaz**

`src/components/GlassHero/GlassHero.module.css`:

```css
/* GlassHero — içerik katmanı hero'su. Zemin her zaman flat; cam yalnız
   çağıranın koyduğu kontrollerde (CTA/arama) olabilir. */
.root { width: 100%; box-sizing: border-box; background: var(--lg-bg); }

.inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 56px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-start;
  text-align: start;
}
.alignCenter { align-items: center; text-align: center; }

.title {
  margin: 0;
  max-width: 760px;
  font-size: clamp(30px, 4.5vw, 46px);
  line-height: 1.12;
  font-weight: 700;
  letter-spacing: -0.028em;
  color: var(--lg-label);
}
.subtitle {
  margin: 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.55;
  color: var(--lg-label-secondary);
}
.actionsRow { display: flex; flex-wrap: wrap; gap: 10px; }
.searchSlot { width: 100%; max-width: 660px; }
.quickLinks { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 14px; }

/* split */
.splitGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(400px, 100%), 1fr));
  gap: 36px;
  align-items: center;
}
.splitText { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.media { min-width: 0; }
.media > * { max-width: 100%; }

/* showcase */
.showcase { position: relative; overflow: hidden; }
.showcaseMedia { position: absolute; inset: 0; }
.showcaseMedia > * { width: 100%; height: 100%; object-fit: cover; }
.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--lg-scrim, rgba(10, 12, 16, 0.55)) 25%, transparent 85%);
}
.showcaseContent {
  position: relative;
  max-width: 1120px;
  margin: 0 auto;
  padding: 150px 20px 56px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-start;
  text-align: start;
}
.showcase .title { color: var(--lg-on-scrim, #ffffff); }
.showcase .subtitle { color: var(--lg-on-scrim, #ffffff); opacity: 0.85; }
```

- [ ] **Step 3: Component'i yaz**

`src/components/GlassHero/GlassHero.tsx`:

```tsx
// İçerik katmanı hero'su — zemin flat; cam yalnız slot'lara konan kontrollerde.
// Dört yerleşim varyantı: search (marketplace), split (SaaS), showcase (medya), centered (CTA).
import type { ElementType, ReactNode } from 'react'
import styles from './GlassHero.module.css'

export interface GlassHeroProps {
  title: ReactNode
  subtitle?: ReactNode
  /** CTA butonları — GlassButton'ları çağıran verir */
  actions?: ReactNode
  /** split: yan panel · showcase: arka plan görseli (dekoratif — alt="" ver) */
  media?: ReactNode
  /** Yalnız variant="search": arama kompozisyonu slotu */
  search?: ReactNode
  /** Yalnız variant="search": arama altı hızlı linkler */
  quickLinks?: ReactNode
  variant?: 'search' | 'split' | 'showcase' | 'centered'
  /** Default: search/centered → center, split/showcase → start */
  align?: 'center' | 'start'
  /** Heading seviyesini sayfa belirler */
  titleAs?: 'h1' | 'h2' | 'div'
  tone?: 'light' | 'dark' | 'auto'
}

export function GlassHero({
  title,
  subtitle,
  actions,
  media,
  search,
  quickLinks,
  variant = 'search',
  align,
  titleAs = 'h2',
}: GlassHeroProps) {
  const Title = titleAs as ElementType
  const resolvedAlign = align ?? (variant === 'search' || variant === 'centered' ? 'center' : 'start')
  const centerClass = resolvedAlign === 'center' ? styles.alignCenter : ''

  const textBlock = (
    <>
      <Title className={styles.title}>{title}</Title>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      {variant === 'search' && search ? <div className={styles.searchSlot}>{search}</div> : null}
      {actions ? <div className={styles.actionsRow}>{actions}</div> : null}
      {variant === 'search' && quickLinks ? <div className={styles.quickLinks}>{quickLinks}</div> : null}
    </>
  )

  if (variant === 'showcase') {
    return (
      <section className={`${styles.root} ${styles.showcase}`} data-variant={variant}>
        <div className={styles.showcaseMedia} aria-hidden>
          {media}
        </div>
        <div className={styles.scrim} data-hero-scrim aria-hidden />
        <div className={`${styles.showcaseContent} ${centerClass}`}>{textBlock}</div>
      </section>
    )
  }

  if (variant === 'split') {
    return (
      <section className={styles.root} data-variant={variant}>
        <div className={`${styles.inner} ${styles.splitGrid}`}>
          <div className={`${styles.splitText} ${centerClass}`}>{textBlock}</div>
          {media ? <div className={styles.media}>{media}</div> : null}
        </div>
      </section>
    )
  }

  return (
    <section className={styles.root} data-variant={variant}>
      <div className={`${styles.inner} ${centerClass}`}>{textBlock}</div>
    </section>
  )
}
```

- [ ] **Step 4: Testleri yaz ve koş**

`src/components/GlassHero/GlassHero.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassHero } from './GlassHero'

describe('GlassHero', () => {
  it('başlık default h2 render edilir', () => {
    render(<GlassHero title="Arsa yatırımının doğrulanmış adresi" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Arsa yatırımının doğrulanmış adresi' })).toBeDefined()
  })

  it('titleAs="h1" heading seviyesini değiştirir', () => {
    render(<GlassHero title="Başlık" titleAs="h1" />)
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
  })

  it('search slotu yalnız search varyantında render olur', () => {
    const { rerender } = render(
      <GlassHero title="B" variant="search" search={<input aria-label="Arsa ara" />} />,
    )
    expect(screen.getByLabelText('Arsa ara')).toBeDefined()
    rerender(<GlassHero title="B" variant="centered" search={<input aria-label="Arsa ara" />} />)
    expect(screen.queryByLabelText('Arsa ara')).toBeNull()
  })

  it('split varyantında media paneli render olur', () => {
    render(<GlassHero title="B" variant="split" media={<div>istatistik paneli</div>} />)
    expect(screen.getByText('istatistik paneli')).toBeDefined()
  })

  it('showcase varyantında scrim ve dekoratif medya sarmalayıcısı vardır', () => {
    const { container } = render(
      <GlassHero title="B" variant="showcase" media={<img alt="" src="x.png" />} />,
    )
    expect(container.querySelector('[data-hero-scrim]')).not.toBeNull()
    const mediaWrap = container.querySelector('img')?.parentElement
    expect(mediaWrap?.getAttribute('aria-hidden')).toBe('true')
  })

  it('actions verilince render olur', () => {
    render(<GlassHero title="B" variant="centered" actions={<button>Hemen Başla</button>} />)
    expect(screen.getByRole('button', { name: 'Hemen Başla' })).toBeDefined()
  })

  it('variant data attribute olarak işaretlenir', () => {
    const { container } = render(<GlassHero title="B" variant="split" />)
    expect(container.querySelector('section')?.getAttribute('data-variant')).toBe('split')
  })
})
```

Run: `npx vitest run src/components/GlassHero/GlassHero.test.tsx`
Expected: 7/7 PASS.

- [ ] **Step 5: Story'leri yaz**

`src/components/GlassHero/GlassHero.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassHero } from './GlassHero'
import { GlassButton } from '../GlassButton'
import { placeholderImage } from '../../demo/placeholderImage'

const DemoSearch = () => (
  <form
    onSubmit={(e) => e.preventDefault()}
    style={{ display: 'flex', gap: 8, width: '100%' }}
  >
    <input
      aria-label="Arsa ara"
      placeholder='"İzmir Urla imarlı arsa" yaz, gerisini bize bırak'
      style={{
        flex: 1,
        minHeight: 'var(--lg-control-lg, 48px)',
        padding: '0 18px',
        borderRadius: 999,
        border: '1px solid var(--lg-hairline)',
        background: 'var(--lg-surface)',
        color: 'var(--lg-label)',
        font: 'inherit',
        fontSize: 15,
        outline: 'none',
      }}
    />
    <GlassButton prominent size="lg" type="submit">Ara</GlassButton>
  </form>
)

const QuickLinks = () => (
  <>
    {['İzmir imarlı', 'Ankara tarla', 'Deniz manzaralı', 'Krediye uygun', 'Sanayi imarlı'].map((q) => (
      <a key={q} href="#arama" style={{ color: 'var(--lg-accent)', textDecoration: 'none', fontWeight: 500 }}>
        {q}
      </a>
    ))}
  </>
)

const StatPanel = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
    }}
  >
    {[
      ['12.400+', 'Doğrulanmış ilan'],
      ['%98', 'EİDS eşleşme oranı'],
      ['81 il', 'Kapsama alanı'],
      ['4.8/5', 'Kullanıcı puanı'],
    ].map(([deger, etiket]) => (
      <div
        key={etiket}
        style={{
          background: 'var(--lg-surface)',
          border: '1px solid var(--lg-hairline)',
          borderRadius: 'var(--lg-radius-card, 20px)',
          padding: '22px 20px',
        }}
      >
        <strong style={{ display: 'block', fontSize: 26, letterSpacing: '-0.022em' }}>{deger}</strong>
        <span style={{ fontSize: 13, color: 'var(--lg-label-secondary)' }}>{etiket}</span>
      </div>
    ))}
  </div>
)

const meta = {
  title: 'Components/GlassHero',
  component: GlassHero,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    title: 'Arsa yatırımının doğrulanmış adresi',
    subtitle: 'Tapu ve imar bilgisi EİDS ile doğrulanmış 12.000+ ilan arasında doğal dille ara.',
  },
} satisfies Meta<typeof GlassHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'search', search: <DemoSearch />, quickLinks: <QuickLinks /> },
}

export const Playground: Story = {}

export const Split: Story = {
  args: {
    variant: 'split',
    title: 'Kurumsal portföyünüzü tek panelden yönetin',
    subtitle: 'Toplu ilan yükleme, vitrin sayfası ve performans raporlarıyla kurumsal hesap.',
    actions: (
      <>
        <GlassButton prominent size="lg">Kurumsal Başvuru</GlassButton>
        <GlassButton size="lg">Tanıtımı İzle</GlassButton>
      </>
    ),
    media: <StatPanel />,
  },
}

export const Showcase: Story = {
  args: {
    variant: 'showcase',
    title: 'Deniz manzaralı yatırım fırsatları',
    subtitle: 'Ege ve Akdeniz hattında, imar durumu doğrulanmış seçkin parseller.',
    actions: <GlassButton prominent size="lg">Fırsatları Gör</GlassButton>,
    media: <img src={placeholderImage('Ege Sahili', '#3a7a8a', '#1f4a5f', 1600, 640)} alt="" />,
  },
}

export const Centered: Story = {
  args: {
    variant: 'centered',
    title: 'İlanını 3 dakikada yayına al',
    subtitle: 'EİDS doğrulaması, akıllı fiyat önerisi ve moderasyon — hepsi tek sihirbazda.',
    actions: (
      <>
        <GlassButton prominent size="lg">İlan Ver</GlassButton>
        <GlassButton size="lg">Nasıl Çalışır?</GlassButton>
      </>
    ),
  },
}

export const H1Baslik: Story = {
  name: 'h1 Başlık (titleAs)',
  args: { titleAs: 'h1', variant: 'centered', actions: <GlassButton prominent>Başla</GlassButton> },
}

export const VaryantKarsilastirma: Story = {
  name: 'Varyant Karşılaştırma',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 40 }}>
      {(
        [
          ['search', { search: <DemoSearch />, quickLinks: <QuickLinks /> }],
          [
            'split',
            {
              title: 'Kurumsal portföyünüzü tek panelden yönetin',
              actions: <GlassButton prominent size="lg">Kurumsal Başvuru</GlassButton>,
              media: <StatPanel />,
            },
          ],
          [
            'showcase',
            {
              title: 'Deniz manzaralı yatırım fırsatları',
              actions: <GlassButton prominent size="lg">Fırsatları Gör</GlassButton>,
              media: <img src={placeholderImage('Ege Sahili', '#3a7a8a', '#1f4a5f', 1600, 640)} alt="" />,
            },
          ],
          [
            'centered',
            {
              title: 'İlanını 3 dakikada yayına al',
              actions: <GlassButton prominent size="lg">İlan Ver</GlassButton>,
            },
          ],
        ] as const
      ).map(([variant, extra]) => (
        <section key={variant}>
          <h3 style={{ margin: '0 0 10px', padding: '0 20px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lg-label-secondary)' }}>
            variant="{variant}"
          </h3>
          <GlassHero {...args} {...extra} variant={variant} />
        </section>
      ))}
    </div>
  ),
}
```

- [ ] **Step 6: rules.md ve index.ts'i yaz**

`src/components/GlassHero/index.ts`:

```ts
export { GlassHero, type GlassHeroProps } from './GlassHero'
```

`src/components/GlassHero/rules.md`:

```markdown
---
name: GlassHero
category: içerik
status: hazır
lastReviewed: 2026-07-16
---

# GlassHero Kuralları

## 1. Amaç

Sayfa açılış (hero) bölümü — başlık, alt başlık ve slot'lar. Zemin her zaman flat
(içerik katmanı); cam yalnız çağıranın slot'lara koyduğu kontrollerde olabilir.

- **Kullan:** ana sayfa/kurumsal tanıtım/kampanya açılış bölümleri.
- **Kullanma:** sayfa içi ara başlıklar, kart başlıkları.

## 2. Semantik sözleşme

- Kök `<section>` (isimlendirilmemiş — landmark üretmez; gerekiyorsa çağıran
  `aria-label` verir... vermez: rest props yok, Açık Kararlar'da).
- Başlık elementi `titleAs` ile belirlenir (default `h2`); **sayfadaki tek h1
  olacaksa `titleAs="h1"` ver.**
- `showcase` medyası dekoratiftir: sarmalayıcı `aria-hidden`, görsele `alt=""` ver.

## 3. Anatomy

| Slot | Zorunlu | Kurallar |
|---|---|---|
| title | ✅ | Tek cümle; 760px max genişlik |
| subtitle | — | 1-2 cümle; `--lg-label-secondary` |
| search | — | Yalnız `variant="search"` |
| quickLinks | — | Yalnız `variant="search"`; kısa link seti |
| actions | — | Tüm varyantlarda; GlassButton önerilir |
| media | — | split: yan panel · showcase: tam arka plan |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| title | `ReactNode` | — |
| subtitle | `ReactNode` | — |
| actions / media / search / quickLinks | `ReactNode` | — |
| variant | `'search'\|'split'\|'showcase'\|'centered'` | `'search'` |
| align | `'center'\|'start'` | varyanta göre (search/centered→center) |
| titleAs | `'h1'\|'h2'\|'div'` | `'h2'` |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` |

## 5. Seçenek eksenleri

`material` yok — hero içerik katmanıdır, hep flat. `search`/`quickLinks` diğer
varyantlarda sessizce render edilmez (yasak kombinasyon yerine no-op).

## 6. State modeli

Stateless sunum component'i. Hover/focus slot içeriğinin kendi kurallarındadır.

## 7. Davranış

- Responsive: split grid `auto-fit + minmax(min(400px,100%),1fr)` — dar ekranda
  tek kolona düşer, 320px'te taşma yok.
- Animasyon yok (v1) — eklenirse yalnız transform/opacity + reduced-motion koşulu.

## 8. İçerik

- Başlık ≤ 8-10 kelime; showcase üstündeki metin `--lg-on-scrim` ile yazılır,
  kontrast scrim token'ının koyuluğuyla garanti edilir.

## 9. Token eşlemesi

| Part | Token |
|---|---|
| zemin | `--lg-bg` |
| başlık/alt başlık | `--lg-label` / `--lg-label-secondary` |
| showcase overlay | `--lg-scrim` (yeni) |
| showcase metin | `--lg-on-scrim` (yeni) |

**Borç (raw):** padding 56/150px, clamp font aralığı 30-46px, gap değerleri,
max-width 640/660/760px.

## 10. Storybook kapsamı

Default(search), Playground, Split, Showcase, Centered, H1Baslik,
VaryantKarsilastirma (4 varyant alt alta — seçim story'si). Temalar toolbar'dan.

## 11. Test kabul kriterleri

- [x] default h2 / titleAs h1
- [x] search slotu yalnız search varyantında
- [x] split media paneli
- [x] showcase scrim + aria-hidden medya
- [x] actions render
- [x] data-variant işareti
- [ ] showcase kontrastı (visual, Chrome)

## 12. Do / Don't

- ✅ Sayfa hero'suysa `titleAs="h1"` ver.
- ✅ showcase görseline `alt=""` ver (dekoratif).
- ❌ Hero'ya cam zemin verme; cam yalnız içindeki kontrollerde.
- ❌ `search` slotuna form dışı blok içerik koyma.

**Açık kararlar:** `as`/rest props · giriş animasyonu preset'i (v2) ·
`--lg-space-*` gelince boşluk borcu.
```

- [ ] **Step 7: Export ve katalog kaydı**

`src/index.ts`'e:

```ts
export { GlassHero, type GlassHeroProps } from './components/GlassHero'
```

`ComponentCatalog.tsx` ENTRIES — İçerik bölümüne:

```tsx
  {
    name: 'Hero',
    description: 'Sayfa açılış bölümü — 4 varyant (search/split/showcase/centered), flat zemin, titleAs ile heading kontrolü, --lg-scrim overlay.',
    category: 'İçerik',
    status: 'hazır',
    storyPath: '/story/components-glasshero--default',
  },
```

- [ ] **Step 8: Doğrula**

Run: `npx tsc -b && npm run lint && npm test`
Expected: typecheck temiz; yeni lint hatası yok; tüm suite yeşil.

- [ ] **Step 9: Commit**

```bash
git add src/components/GlassHero/ src/index.css src/index.ts src/demo/ComponentCatalog.tsx
git commit -m "feat: GlassHero — 4 varyantlı hero (search/split/showcase/centered) + scrim token'ları"
```

---

### Task 3: GlassFooter — 5 varyantlı site footer'ı

**Files:**
- Create: `src/components/GlassFooter/GlassFooter.tsx`
- Create: `src/components/GlassFooter/GlassFooter.module.css`
- Create: `src/components/GlassFooter/GlassFooter.stories.tsx`
- Create: `src/components/GlassFooter/GlassFooter.test.tsx`
- Create: `src/components/GlassFooter/rules.md`
- Create: `src/components/GlassFooter/index.ts`
- Modify: `src/index.ts`, `src/demo/ComponentCatalog.tsx`

**Interfaces:**
- Consumes: yalnız token'lar; story'lerde `GlassButton`.
- Produces: `GlassFooter`, `GlassFooterProps`, `GlassFooterColumn`, `GlassFooterLinkItem`.

- [ ] **Step 1: CSS modülünü yaz**

`src/components/GlassFooter/GlassFooter.module.css`:

```css
/* GlassFooter — içerik katmanı footer'ı. Her zaman flat + hairline üst çizgi. */
.root { border-top: 1px solid var(--lg-hairline); background: var(--lg-surface); color: var(--lg-label); }

.inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 44px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-sizing: border-box;
}

.top { display: grid; grid-template-columns: minmax(220px, 1.2fr) 3fr; gap: 32px; align-items: start; }
.brandBlock { display: flex; flex-direction: column; gap: 10px; font-size: 14px; color: var(--lg-label-secondary); }
.brand { font-size: 17px; font-weight: 700; letter-spacing: -0.022em; color: var(--lg-label); }

.columnsNav { min-width: 0; }
.columnsGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px; }
.column { display: flex; flex-direction: column; gap: 10px; }
.columnTitle {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--lg-label-secondary);
}
.columnList { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }

.link {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: var(--lg-radius-chip, 10px);
  color: var(--lg-label-secondary);
  text-decoration: none;
  font-size: 14px;
}
@media (hover: hover) { .link:hover { color: var(--lg-label); } }
.link:focus-visible { outline: 2px solid var(--lg-accent); outline-offset: 2px; }
@media (pointer: coarse) { .link { min-height: 44px; } }

.legalRow {
  border-top: 1px solid var(--lg-hairline);
  padding-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  justify-content: space-between;
  align-items: center;
}
.legal { font-size: 13px; color: var(--lg-label-secondary); }
.social { display: inline-flex; align-items: center; gap: 12px; }

/* slim */
.slimInner {
  padding: 18px 20px;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 20px;
}
.inlineList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  justify-content: center;
}

/* centered */
.centeredInner { align-items: center; text-align: center; gap: 18px; }

/* cta / newsletter bantları */
.ctaBand {
  background: color-mix(in srgb, var(--lg-accent) 10%, var(--lg-surface));
  border: 1px solid color-mix(in srgb, var(--lg-accent) 22%, transparent);
  border-radius: var(--lg-radius-card, 20px);
  padding: 26px 28px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 24px;
}
.newsletterBand {
  background: var(--lg-bg);
  border: 1px solid var(--lg-hairline);
  border-radius: var(--lg-radius-card, 20px);
  padding: 26px 28px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 24px;
}

@media (max-width: 760px) {
  .top { grid-template-columns: 1fr; }
  .legalRow { justify-content: center; text-align: center; }
}
```

- [ ] **Step 2: Component'i yaz**

`src/components/GlassFooter/GlassFooter.tsx`:

```tsx
// İçerik katmanı footer'ı — her zaman flat. Beş yerleşim varyantı.
import type { MouseEvent, ReactNode } from 'react'
import styles from './GlassFooter.module.css'

export interface GlassFooterLinkItem {
  label: string
  onClick?: () => void
  href?: string
}

export interface GlassFooterColumn {
  title: string
  links: GlassFooterLinkItem[]
}

export interface GlassFooterProps {
  /** columns/cta/newsletter varyantlarında sütun grupları; slim/centered'da satıra düzleştirilir */
  columns?: GlassFooterColumn[]
  /** Telif + yasal satır — zorunlu */
  legal: ReactNode
  /** Yalnız variant="cta": üst bant içeriği */
  cta?: ReactNode
  /** Logo/marka bloğu */
  brand?: ReactNode
  /** Sosyal linkler satırı */
  social?: ReactNode
  /** Yalnız variant="newsletter": kayıt formu slotu */
  newsletter?: ReactNode
  variant?: 'columns' | 'slim' | 'cta' | 'centered' | 'newsletter'
  tone?: 'light' | 'dark' | 'auto'
}

function FootLink({ link }: { link: GlassFooterLinkItem }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!link.href) e.preventDefault()
    link.onClick?.()
  }
  return (
    <a href={link.href ?? '#'} onClick={onClick} className={styles.link}>
      {link.label}
    </a>
  )
}

export function GlassFooter({
  columns = [],
  legal,
  cta,
  brand,
  social,
  newsletter,
  variant = 'columns',
}: GlassFooterProps) {
  const flatLinks = columns.flatMap((c) => c.links)

  const inlineNav = flatLinks.length ? (
    <nav aria-label="Alt bilgi">
      <ul className={styles.inlineList}>
        {flatLinks.map((link) => (
          <li key={link.label}>
            <FootLink link={link} />
          </li>
        ))}
      </ul>
    </nav>
  ) : null

  if (variant === 'slim') {
    return (
      <footer className={styles.root} data-variant={variant}>
        <div className={`${styles.inner} ${styles.slimInner}`}>
          <span className={styles.legal}>{legal}</span>
          {inlineNav}
        </div>
      </footer>
    )
  }

  if (variant === 'centered') {
    return (
      <footer className={styles.root} data-variant={variant}>
        <div className={`${styles.inner} ${styles.centeredInner}`}>
          {brand ? <span className={styles.brand}>{brand}</span> : null}
          {inlineNav}
          {social ? <span className={styles.social}>{social}</span> : null}
          <span className={styles.legal}>{legal}</span>
        </div>
      </footer>
    )
  }

  return (
    <footer className={styles.root} data-variant={variant}>
      <div className={styles.inner}>
        {variant === 'cta' && cta ? (
          <div className={styles.ctaBand} data-footer-cta>
            {cta}
          </div>
        ) : null}
        {variant === 'newsletter' && newsletter ? (
          <div className={styles.newsletterBand} data-footer-newsletter>
            {newsletter}
          </div>
        ) : null}
        <div className={styles.top}>
          {brand ? <div className={styles.brandBlock}>{brand}</div> : null}
          {columns.length ? (
            <nav aria-label="Alt bilgi" className={styles.columnsNav}>
              <div className={styles.columnsGrid}>
                {columns.map((col) => (
                  <div key={col.title} className={styles.column}>
                    <span className={styles.columnTitle}>{col.title}</span>
                    <ul className={styles.columnList}>
                      {col.links.map((link) => (
                        <li key={link.label}>
                          <FootLink link={link} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          ) : null}
        </div>
        <div className={styles.legalRow}>
          <span className={styles.legal}>{legal}</span>
          {social ? <span className={styles.social}>{social}</span> : null}
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Testleri yaz ve koş**

`src/components/GlassFooter/GlassFooter.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassFooter, type GlassFooterColumn } from './GlassFooter'

const columns: GlassFooterColumn[] = [
  { title: 'Kurumsal', links: [{ label: 'Hakkımızda', onClick: vi.fn() }, { label: 'Kariyer' }] },
  { title: 'Destek', links: [{ label: 'Yardım Merkezi' }] },
]

describe('GlassFooter', () => {
  it('contentinfo landmark ve "Alt bilgi" navigasyonu render edilir', () => {
    render(<GlassFooter columns={columns} legal="© 2026 ArsaPazar" />)
    expect(screen.getByRole('contentinfo')).toBeDefined()
    expect(screen.getByRole('navigation', { name: 'Alt bilgi' })).toBeDefined()
    expect(screen.getByText('Kurumsal')).toBeDefined()
  })

  it('href olmayan link tıklaması onClick çağırır', () => {
    render(<GlassFooter columns={columns} legal="©" />)
    fireEvent.click(screen.getByRole('link', { name: 'Hakkımızda' }))
    expect(columns[0].links[0].onClick).toHaveBeenCalled()
  })

  it('slim varyantı sütun başlıklarını atar, linkleri tek satıra düzleştirir', () => {
    render(<GlassFooter variant="slim" columns={columns} legal="© 2026" />)
    expect(screen.queryByText('Kurumsal')).toBeNull()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('cta bandı yalnız cta varyantında render olur', () => {
    const { container, rerender } = render(
      <GlassFooter variant="cta" columns={columns} legal="©" cta={<span>Arsanı bugün listele</span>} />,
    )
    expect(container.querySelector('[data-footer-cta]')).not.toBeNull()
    rerender(<GlassFooter variant="columns" columns={columns} legal="©" cta={<span>Arsanı bugün listele</span>} />)
    expect(container.querySelector('[data-footer-cta]')).toBeNull()
  })

  it('newsletter slotu yalnız newsletter varyantında render olur', () => {
    const { container, rerender } = render(
      <GlassFooter variant="newsletter" columns={columns} legal="©" newsletter={<input aria-label="E-posta" />} />,
    )
    expect(container.querySelector('[data-footer-newsletter]')).not.toBeNull()
    rerender(<GlassFooter variant="columns" columns={columns} legal="©" newsletter={<input aria-label="E-posta" />} />)
    expect(container.querySelector('[data-footer-newsletter]')).toBeNull()
  })

  it('centered varyantı marka + satır linkleri + legal gösterir', () => {
    render(<GlassFooter variant="centered" columns={columns} legal="© 2026" brand="ArsaPazar" social={<a href="#x">X</a>} />)
    expect(screen.getByText('ArsaPazar')).toBeDefined()
    expect(screen.getByText('© 2026')).toBeDefined()
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(4)
  })

  it('variant data attribute olarak işaretlenir', () => {
    render(<GlassFooter variant="slim" legal="©" />)
    expect(screen.getByRole('contentinfo').getAttribute('data-variant')).toBe('slim')
  })
})
```

Run: `npx vitest run src/components/GlassFooter/GlassFooter.test.tsx`
Expected: 7/7 PASS.

- [ ] **Step 4: Story'leri yaz**

`src/components/GlassFooter/GlassFooter.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassFooter, type GlassFooterColumn } from './GlassFooter'
import { GlassButton } from '../GlassButton'

const columns: GlassFooterColumn[] = [
  { title: 'Kurumsal', links: [{ label: 'Hakkımızda' }, { label: 'Kariyer' }, { label: 'Basın' }, { label: 'İletişim' }] },
  { title: 'Destek', links: [{ label: 'Yardım Merkezi' }, { label: 'Güvenli Alışveriş' }, { label: 'Ücretler ve Doping' }, { label: 'Canlı Destek' }] },
  { title: 'Keşfet', links: [{ label: 'Satılık Arsa' }, { label: 'Harita' }, { label: 'Mağazalar' }, { label: 'Fiyat Analizi' }] },
  { title: 'Yasal', links: [{ label: 'KVKK Aydınlatma' }, { label: 'Çerez Tercihleri' }, { label: 'Kullanım Koşulları' }, { label: 'Üyelik Sözleşmesi' }] },
]

const Brand = () => (
  <>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 17, fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--lg-label)' }}>
      <span aria-hidden style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--lg-accent)', color: '#fff', display: 'inline-grid', placeItems: 'center', fontSize: 13, fontWeight: 800 }}>A</span>
      ArsaPazar
    </span>
    <span>EİDS doğrulamalı arsa ilan platformu. Tapu ve imar bilgisi doğrulanmadan ilan yayına alınmaz.</span>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--lg-success)', fontWeight: 600, fontSize: 13 }}>✓ 12.400+ doğrulanmış ilan</span>
  </>
)

const SocialIcon = ({ label, d }: { label: string; d: string }) => (
  <a href="#sosyal" aria-label={label} style={{ display: 'inline-grid', placeItems: 'center', width: 34, height: 34, borderRadius: 999, border: '1px solid var(--lg-hairline)', color: 'var(--lg-label-secondary)' }}>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d={d} />
    </svg>
  </a>
)

const Social = () => (
  <>
    <SocialIcon label="X (Twitter)" d="M4 4l7.2 9.6L4.4 20h2.6l5.4-5.1 3.8 5.1H20l-7.5-10L19.4 4h-2.6l-4.9 4.7L8.4 4H4z" />
    <SocialIcon label="Instagram" d="M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2zM17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 12.9a4.9 4.9 0 1 1 0-9.8 4.9 4.9 0 0 1 0 9.8zM17.4 7.6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
    <SocialIcon label="YouTube" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
    <SocialIcon label="LinkedIn" d="M6.5 8.5V19H3.4V8.5h3.1zM4.9 4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM20.6 13v6h-3.1v-5.4c0-1.4-.5-2.3-1.7-2.3-.9 0-1.5.6-1.7 1.2-.1.2-.1.5-.1.8V19h-3.1V8.5h3.1v1.4c.4-.6 1.2-1.6 2.9-1.6 2.1 0 3.7 1.4 3.7 4.7z" />
  </>
)

const legal = (
  <>
    © 2026 ArsaPazar Bilgi Teknolojileri A.Ş. · Her hakkı saklıdır ·{' '}
    <a href="#kvkk" style={{ color: 'inherit' }}>KVKK</a> ·{' '}
    <a href="#cerez" style={{ color: 'inherit' }}>Çerez Tercihleri</a>
  </>
)

const meta = {
  title: 'Components/GlassFooter',
  component: GlassFooter,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: { columns, legal, brand: <Brand />, social: <Social /> },
} satisfies Meta<typeof GlassFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Playground: Story = {}

export const Slim: Story = {
  args: { variant: 'slim', columns: [{ title: 'Yasal', links: [{ label: 'KVKK' }, { label: 'Çerezler' }, { label: 'Koşullar' }, { label: 'Yardım' }] }] },
}

const ctaContent = (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <strong style={{ fontSize: 19, letterSpacing: '-0.022em' }}>Arsanı bugün listele</strong>
      <span style={{ fontSize: 14, color: 'var(--lg-label-secondary)' }}>İlk ilan ücretsiz — EİDS doğrulaması dahil.</span>
    </div>
    <GlassButton prominent size="lg">İlan Ver</GlassButton>
  </>
)

export const Cta: Story = {
  name: 'CTA Bantlı',
  args: { variant: 'cta', cta: ctaContent },
}

export const Centered: Story = { args: { variant: 'centered', brand: 'ArsaPazar' } }

const newsletterContent = (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <strong style={{ fontSize: 17, letterSpacing: '-0.022em' }}>Fırsatları kaçırma</strong>
      <span style={{ fontSize: 14, color: 'var(--lg-label-secondary)' }}>Haftalık yeni ilan ve bölge raporu bülteni.</span>
    </div>
    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input
        aria-label="E-posta adresi"
        placeholder="e-posta@ornek.com"
        style={{ minHeight: 'var(--lg-control-md, 40px)', padding: '0 14px', borderRadius: 999, border: '1px solid var(--lg-hairline)', background: 'var(--lg-surface)', color: 'var(--lg-label)', font: 'inherit', fontSize: 14, outline: 'none' }}
      />
      <GlassButton prominent type="submit">Abone Ol</GlassButton>
    </form>
  </>
)

export const Newsletter: Story = {
  name: 'Bülten Kayıtlı',
  args: { variant: 'newsletter', newsletter: newsletterContent },
}

export const VaryantKarsilastirma: Story = {
  name: 'Varyant Karşılaştırma',
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 40 }}>
      {(['columns', 'slim', 'cta', 'centered', 'newsletter'] as const).map((variant) => (
        <section key={variant}>
          <h3 style={{ margin: '0 0 10px', padding: '0 20px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--lg-label-secondary)' }}>
            variant="{variant}"
          </h3>
          <GlassFooter
            {...args}
            variant={variant}
            cta={variant === 'cta' ? ctaContent : undefined}
            newsletter={variant === 'newsletter' ? newsletterContent : undefined}
          />
        </section>
      ))}
    </div>
  ),
}
```

- [ ] **Step 5: rules.md ve index.ts'i yaz**

`src/components/GlassFooter/index.ts`:

```ts
export { GlassFooter, type GlassFooterProps, type GlassFooterColumn, type GlassFooterLinkItem } from './GlassFooter'
```

`src/components/GlassFooter/rules.md`:

```markdown
---
name: GlassFooter
category: navigasyon
status: hazır
lastReviewed: 2026-07-16
---

# GlassFooter Kuralları

## 1. Amaç

Site footer'ı — link sütunları, marka bloğu, sosyal linkler ve yasal satır.
Her zaman flat + hairline üst çizgi; cam kullanılmaz (büyük içerik yüzeyi).

- **Kullan:** kamuya açık site sayfalarının alt bölümü.
- **Kullanma:** uygulama içi panel altları, dialog aksiyon satırları.

## 2. Semantik sözleşme

- Kök `<footer>` (contentinfo landmark); link grupları `<nav aria-label="Alt bilgi">`.
- Sütun başlıkları heading DEĞİL — `<span>` + `<ul>` listesi (sayfa outline'ını kirletmez).
- Linkler gerçek `<a>`; `href` yoksa `#` + `preventDefault` + `onClick`.

## 3. Anatomy

| Slot | Zorunlu | Kurallar |
|---|---|---|
| legal | ✅ | Telif + yasal linkler; her varyantta görünür |
| columns | — | `{title, links[]}`; slim/centered'da satıra düzleştirilir |
| brand | — | Logo + kısa açıklama + güven rozeti |
| social | — | `aria-label`'lı ikon linkleri |
| cta | yalnız `cta` | Üst vurgu bandı (accent tint zemin) |
| newsletter | yalnız `newsletter` | Kayıt formu slotu (demo-grade) |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| columns | `GlassFooterColumn[]` | `[]` |
| legal | `ReactNode` | — (zorunlu) |
| cta / brand / social / newsletter | `ReactNode` | — |
| variant | `'columns'\|'slim'\|'cta'\|'centered'\|'newsletter'` | `'columns'` |
| tone | `'light'\|'dark'\|'auto'` | `'auto'` |

`...rest` yok.

## 5. Seçenek eksenleri

`material` yok — footer hep flat. `cta`/`newsletter` slot'ları kendi varyantı
dışında sessizce render edilmez.

## 6. State modeli

Stateless. Link hover/focus CSS'te (`:focus-visible` halka, `hover: hover`).

## 7. Davranış

- Responsive: sütun grid'i `auto-fit minmax(150px, 1fr)`; 760px altında marka bloğu
  tek kolona iner, legal satırı ortalanır. 320px'te taşma yok.
- `pointer: coarse` ortamda link hedefi 44px'e yükselir.

## 8. İçerik

- Sütun başlıkları tek kelime tercih (Kurumsal, Destek, Yasal, Keşfet).
- Sosyal ikon linklerinde `aria-label` zorunlu (story'deki `SocialIcon` deseni).

## 9. Token eşlemesi

| Part | Token |
|---|---|
| zemin / çizgiler | `--lg-surface` / `--lg-hairline` |
| metinler | `--lg-label(-secondary)` |
| cta bandı | `color-mix(--lg-accent 10%)` zemin, `--lg-radius-card` |
| focus halkası | `--lg-accent` |

**Borç (raw):** padding/gap değerleri, font-size 13/14/17px, 760px breakpoint,
ikon kutusu 34px.

## 10. Storybook kapsamı

Default(columns), Playground, Slim, Cta, Centered, Newsletter,
VaryantKarsilastirma (5 varyant alt alta — seçim story'si). Temalar toolbar'dan.

## 11. Test kabul kriterleri

- [x] contentinfo + "Alt bilgi" navigation
- [x] href'siz link onClick
- [x] slim: başlıksız düzleştirilmiş linkler
- [x] cta bandı yalnız cta'da
- [x] newsletter slotu yalnız newsletter'da
- [x] centered yapısı
- [x] data-variant işareti
- [ ] 320px responsive (visual, Chrome)

## 12. Do / Don't

- ✅ Sayfada tek GlassFooter (tek contentinfo landmark).
- ✅ Sosyal ikonlara `aria-label` ver.
- ❌ Footer'a cam/backdrop-filter ekleme.
- ❌ Sütun başlıklarını heading'e çevirme.

**Açık kararlar:** app-store rozet slotu (v2) · dil seçici slotu (v2).
```

- [ ] **Step 6: Export ve katalog kaydı**

`src/index.ts`'e:

```ts
export { GlassFooter, type GlassFooterProps, type GlassFooterColumn, type GlassFooterLinkItem } from './components/GlassFooter'
```

`ComponentCatalog.tsx` ENTRIES — Navigasyon bölümüne (Header girdisinin yanına):

```tsx
  {
    name: 'Footer',
    description: 'Site footer\'ı — 5 varyant (columns/slim/cta/centered/newsletter), flat + hairline, sosyal ikon ve bülten slotları.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/components-glassfooter--default',
  },
```

- [ ] **Step 7: Doğrula**

Run: `npx tsc -b && npm run lint && npm test`
Expected: typecheck temiz; yeni lint hatası yok; tüm suite yeşil.

- [ ] **Step 8: Commit**

```bash
git add src/components/GlassFooter/ src/index.ts src/demo/ComponentCatalog.tsx
git commit -m "feat: GlassFooter — 5 varyantlı site footer'ı (columns/slim/cta/centered/newsletter)"
```

---

### Task 4: Son doğrulama

**Files:** yok (yalnız komutlar).

- [ ] **Step 1: Tam doğrulama**

Run: `npm test && npx tsc -b && npm run lint && npm run build`
Expected: test suite tam yeşil (310 + ~23 yeni); typecheck temiz; lint'te yeni hata yok; Storybook build başarılı.

- [ ] **Step 2: Görsel tur (kullanıcıyla)**

`npm run dev` → `Components/GlassHeader`, `Components/GlassHero`, `Components/GlassFooter`
altındaki **VaryantKarsilastirma** story'leri Kağıt/Grafit temada ve 320px'te gezilir.
Kullanıcı her alan için nihai varyantı seçer — seçim sonrası entegrasyon (PublicShell)
ayrı iştir, bu planın kapsamı dışında.

- [ ] **Step 3: Commit (gerekirse)**

Görsel turda düzeltme çıkarsa ilgili dosyayla commit'lenir; çıkmazsa bu task commit üretmez.
