# GlassSiteHeader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tailark `hero-section-1` header'ının Liquid Glass uyarlaması olan `GlassSiteHeader` bileşenini kurmak ve `apps/web`'in `MarketplaceShell`'ini `GlassIslandHeader`'dan ona geçirmek.

**Architecture:** Sabit (`position: fixed`) bir ray, içinde tek bir kapsül. Tepede kapsül şeffaf ve geniş; scroll eşiği aşılınca `data-scrolled` attribute'u düşer, kapsül daralır, köşelenir ve altındaki `GlassSurface` malzeme katmanı opacity ile belirir. Genişlik/radius değişimi `motion` layout (FLIP) ile transform'a çevrilir — layout tetikleyen transition yok. Mobil menü ayrı bir overlay değil; kapsülün kendisi büyüyerek içinde açılır.

**Tech Stack:** React 19, `motion/react`, CSS Modules, vitest + @testing-library/react, Storybook 9 (`@storybook/react-vite`), TanStack Router (`apps/web`).

**Spec:** `docs/superpowers/specs/2026-07-31-glass-site-header-design.md`

## Global Constraints

Bunlar `CLAUDE.md` ve `src/design/*.mdx`'ten gelir; **her task'ın gereksinimlerine dâhildir**:

- Component CSS'inde **raw px/hex yasak** (yalnız `var(--token, fallback)` biçimindeki token fallback'i serbest). Token karşılığı olmayan layout ölçüleri kökte yerel değişkenlere toplanır ve `rules.md` §9'da "Borç" başlığı altında listelenir.
- Radius yalnız ölçekten: `--lg-radius-chip/media/card/capsule`. Kontrol yükseklikleri `--lg-control-sm/md/lg/xl`. Dokunmatik hedef ≥ 44px.
- Animasyon **yalnız** `transform` / `opacity` / `filter` üzerinde; layout tetiklemez. Genişlik/yükseklik değişimi `motion` layout (FLIP) ile.
- Focus halkası yalnız `:focus-visible`: `outline: var(--lg-focus-ring-width) solid var(--lg-accent)`.
- İkon-tek butonlarda `label` zorunlu.
- Breakpoint yerine yetenek sorguları (`@media (hover: hover)`, `@media (pointer: coarse)`) ve container query.
- Birleşik variant yasak; `hover`/`focus`/`active` asla prop olmaz.
- Cam yalnız navigasyon/kontrol katmanında; sayfa başına en fazla 6 cam yüzey; **cam üstüne cam yok**.
- Kod tanımlayıcıları İngilizce, yorumlar/JSDoc/dokümanlar **Türkçe**.
- Doğrulama komutları: `npx tsc -b` · `npm test` · `npm run lint`.

---

## File Structure

| Dosya | Sorumluluk |
|---|---|
| `src/components/GlassSiteHeader/GlassSiteHeader.tsx` | Bileşen — semantik, state (scroll bayrağı + menü), slot yerleşimi |
| `src/components/GlassSiteHeader/GlassSiteHeader.module.css` | Ray/kapsül geometrisi, morf durumları, container query |
| `src/components/GlassSiteHeader/GlassSiteHeader.test.tsx` | vitest + testing-library |
| `src/components/GlassSiteHeader/GlassSiteHeader.stories.tsx` | Zorunlu story matrisi |
| `src/components/GlassSiteHeader/rules.md` | Bileşen sözleşmesi |
| `src/components/GlassSiteHeader/index.ts` | Re-export |
| `src/index.ts` | Kütüphane export'u (Task 4) |
| `src/demo/ComponentCatalog.tsx` | Katalog kaydı (Task 4) |
| `apps/web/src/components/MarketplaceShell.tsx` | Header'a geçiş + düşen yeteneklerin temizliği (Task 5, 6) |
| `apps/web/src/components/MarketplaceShell.test.tsx` | Mock ve testlerin güncellenmesi (Task 5, 6) |
| `apps/web/src/routes/__root.tsx` | `initialTime` loader'ının kaldırılması (Task 6) |
| `apps/web/src/styles/app.css` | `.shell-brand` eklenmesi, `.shell-extras`/`.shell-language` kaldırılması, offset yorumu (Task 5, 6) |

---

## Task 1: Bileşen iskeleti — semantik, linkler, aksiyon slotları

Kapsülün statik hâli: `<header>` + `<nav>`, link listesi, aktif link göstergesi, `logo`/`utility`/`secondaryAction`/`action` slotları. Scroll morfu ve mobil panel sonraki task'larda.

**Files:**
- Create: `src/components/GlassSiteHeader/GlassSiteHeader.tsx`
- Create: `src/components/GlassSiteHeader/GlassSiteHeader.module.css`
- Create: `src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`
- Create: `src/components/GlassSiteHeader/index.ts`

**Interfaces:**
- Consumes: `GlassSurface`, `GlassTierProvider` (`../GlassSurface`), `presets` (`../../motion/presets`), `prefersReducedMotion` (`../../core/tier`).
- Produces: `GlassSiteHeader` bileşeni; `GlassSiteHeaderProps` ve `GlassSiteHeaderLink` tipleri. Task 2, 3, 4, 5 bu adlara dayanır.

- [ ] **Step 1: Testi yaz (başarısız olacak)**

`src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`:

```tsx
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GlassSiteHeader, type GlassSiteHeaderLink } from './GlassSiteHeader'
import { GlassTierProvider } from '../GlassSurface/GlassTierContext'

const makeLinks = (): GlassSiteHeaderLink[] => [
  { label: 'Arama', href: '#arama', onClick: vi.fn(), active: true },
  { label: 'Ofisler', href: '#ofisler', onClick: vi.fn() },
]

const renderHeader = (props = {}, links = makeLinks()) => {
  render(
    <GlassTierProvider tier="fallback">
      <GlassSiteHeader logo="arsam.net" links={links} {...props} />
    </GlassTierProvider>,
  )
  return links
}

describe('GlassSiteHeader — semantik ve slotlar', () => {
  it('banner ve "Site" navigasyon landmarklarını render eder', () => {
    renderHeader()
    expect(screen.getByRole('banner')).toBeDefined()
    expect(screen.getByRole('navigation', { name: 'Site' })).toBeDefined()
  })

  it('aktif linkte aria-current="page" ve kayan cam gösterge vardır', () => {
    renderHeader()
    const active = screen.getByRole('link', { name: 'Arama' })
    expect(active.getAttribute('aria-current')).toBe('page')
    expect(active.querySelector('[data-nav-glass]')).not.toBeNull()
    const passive = screen.getByRole('link', { name: 'Ofisler' })
    expect(passive.getAttribute('aria-current')).toBeNull()
    expect(passive.querySelector('[data-nav-glass]')).toBeNull()
  })

  it('sade sol tıkta onClick çağrılır ve varsayılan gezinme engellenir', () => {
    const links = renderHeader()
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    screen.getByRole('link', { name: 'Ofisler' }).dispatchEvent(event)
    expect(links[1].onClick).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(true)
  })

  it('meta/ctrl tıkta onClick çağrılmaz — tarayıcı yeni sekmeyi açar', () => {
    const links = renderHeader()
    fireEvent.click(screen.getByRole('link', { name: 'Ofisler' }), { metaKey: true })
    expect(links[1].onClick).not.toHaveBeenCalled()
  })

  it('logo, utility, secondaryAction ve action slotları render olur', () => {
    renderHeader({
      logo: <span>arsam.net</span>,
      utility: <button>Tema</button>,
      secondaryAction: <button>Üye girişi</button>,
      action: <button>İlan ver</button>,
    })
    expect(screen.getByText('arsam.net')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Tema' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Üye girişi' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'İlan ver' })).toBeDefined()
  })

  it('links boşken nav ve hamburger render edilmez', () => {
    render(
      <GlassTierProvider tier="fallback">
        <GlassSiteHeader logo="arsam.net" />
      </GlassTierProvider>,
    )
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Menü' })).toBeNull()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`
Expected: FAIL — `Failed to resolve import "./GlassSiteHeader"`

- [ ] **Step 3: CSS modülünü yaz**

`src/components/GlassSiteHeader/GlassSiteHeader.module.css`:

```css
/* GlassSiteHeader — tepede görünmez ray, scroll'da yüzen cam kapsül.
   Cam TEK yüzeyde (.material) ve yalnız condensed/açık durumda görünür;
   kapsül içeriği GlassTierProvider ile düz katmana iner (cam üstüne cam yok). */
.root {
  /* Token karşılığı olmayan layout ölçüleri — bkz. rules.md §9 Borç */
  --rail-pad-y: var(--lg-space-3);
  --capsule-pad-y: var(--lg-space-2);
  --capsule-pad-x: var(--lg-space-4);
  --capsule-max: var(--lg-container-narrow);
  --capsule-max-scrolled: 55rem;
  --zone-gap: 18px;
  --actions-gap: 12px;
  --wordmark-gap: 9px;
  --nav-font: 14px;
  --link-gap: 2px;
  --link-pad-x: 13px;
  --focus-radius: 4px;
  --pill-inset: 3px 1px;
  --morph-dur: 0.3s;

  position: fixed;
  top: 0;
  inset-inline: 0;
  z-index: 30;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  padding: calc(var(--rail-pad-y) + env(safe-area-inset-top, 0px))
    var(--lg-container-gutter) 0;
  /* Ray tıklamayı yutmaz; yalnız kapsül etkileşim alır. */
  pointer-events: none;
}

.capsule {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: var(--capsule-max);
  padding: var(--capsule-pad-y) var(--capsule-pad-x);
  border-radius: 0;
  pointer-events: auto;
  /* Link satırının açılması kapsül genişliğine bağlı — viewport'a değil.
     Kök `fixed`, kapsül değil; containment burada sticky/fixed bozmaz. */
  container-type: inline-size;
}

/* ── Malzeme katmanı: tek cam yüzey, opacity ile belirir ─────────────── */
.material {
  position: absolute;
  inset: 0;
  --lg-surface-shadow: var(--lg-shadow-md);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--morph-dur) ease,
    visibility 0s linear var(--morph-dur);
}

/* ── Satır ────────────────────────────────────────────────────────────── */
.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--zone-gap);
  min-height: var(--lg-control-lg);
}

.wordmark {
  display: inline-flex;
  align-items: center;
  gap: var(--wordmark-gap);
  flex: none;
  font-size: var(--lg-text-headline);
  font-weight: 750;
  letter-spacing: -0.032em;
  color: var(--lg-label);
}

.grow { flex: 1; min-width: 0; }

/* ── Linkler ──────────────────────────────────────────────────────────── */
.nav { display: none; flex: 1; justify-content: center; min-width: 0; }
.linkList {
  display: flex;
  align-items: center;
  gap: var(--link-gap);
  list-style: none;
  margin: 0;
  padding: 0;
}
.linkItem { display: flex; }
.link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: var(--lg-control-sm);
  padding: 0 var(--link-pad-x);
  border-radius: var(--lg-radius-capsule);
  color: var(--lg-label-secondary);
  text-decoration: none;
  font-size: var(--nav-font);
  font-weight: 500;
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: color 0.2s ease;
}
@media (hover: hover) { .link:hover { color: var(--lg-label); } }
.link:focus-visible {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: 2px;
}
.linkActive { color: var(--lg-label); font-weight: 600; }
.linkLabel { position: relative; z-index: 1; }

/* Aktif linkin kayan cam göstergesi — tek küçük liquid-glass dokunuşu. */
.glassPill {
  position: absolute;
  inset: var(--pill-inset);
  border-radius: var(--lg-radius-capsule);
  background: color-mix(in srgb, var(--lg-surface) 52%, transparent);
  backdrop-filter: blur(8px) saturate(150%);
  -webkit-backdrop-filter: blur(8px) saturate(150%);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--lg-label) 9%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--lg-surface) 85%, transparent);
}

/* ── Aksiyonlar ───────────────────────────────────────────────────────── */
.actions {
  display: inline-flex;
  align-items: center;
  gap: var(--actions-gap);
  flex: none;
}

/* ── Container query: kapsül genişse linkler açılır ───────────────────── */
@container (min-width: 48rem) {
  .nav { display: flex; }
}
```

- [ ] **Step 4: Bileşeni yaz**

`src/components/GlassSiteHeader/GlassSiteHeader.tsx`:

```tsx
// GlassSiteHeader — tepede görünmez ray, scroll'da yüzen cam kapsüle morflanan
// site header'ı. Kaynak: Tailark hero-section-1'in HeroHeader'ı; Liquid Glass
// uyarlaması (bkz. rules.md §1). Cam tek yüzeyde ve yalnız condensed/açık
// durumda; genişlik/radius değişimi motion layout (FLIP) ile transform'a çevrilir.
import { useId, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, GlassTierProvider } from '../GlassSurface'
import { prefersReducedMotion } from '../../core/tier'
import { presets } from '../../motion/presets'
import styles from './GlassSiteHeader.module.css'

/** Header'ın yatay link satırındaki tek gezinme öğesi. */
export interface GlassSiteHeaderLink {
  label: string
  /** Gerçek gezinme hedefi — SSR ve orta-tık için her zaman verilmesi önerilir */
  href?: string
  /** Verilirse sade sol tık engellenip bu çağrılır (SPA gezinmesi) */
  onClick?: () => void
  /** Aktif sayfa — aria-current="page" + kayan cam gösterge */
  active?: boolean
}

export interface GlassSiteHeaderProps {
  /** Wordmark/monogram slotu — harf-kutusu logo kalıbı kullanılmaz */
  logo: ReactNode
  links?: GlassSiteHeaderLink[]
  /** Aksiyonların solundaki küçük yardımcı slot (örn. tema butonu) */
  utility?: ReactNode
  /** İkincil aksiyon (örn. "Üye girişi") */
  secondaryAction?: ReactNode
  /** Birincil CTA (örn. "İlan ver") */
  action?: ReactNode
  /** Verilirse condensed durumda utility/secondaryAction/action üçlüsünün yerine geçer */
  condensedAction?: ReactNode
  /** Hamburger'ın accessible name'i ve panel etiketi */
  menuLabel?: string
  /** Kapsülün morflandığı scroll eşiği, px */
  scrollThreshold?: number
}

/**
 * Sade sol tıkta SPA gezinmesine devret; modifier'lı ve orta tıkta tarayıcıya
 * bırak (yeni sekme davranışı korunur).
 */
function linkClick(link: GlassSiteHeaderLink) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (!link.onClick) return
    if (e.defaultPrevented) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    link.onClick()
  }
}

// `menuLabel`, `condensedAction` ve `scrollThreshold` prop'ları arayüzde tanımlı
// ama bu task'ta henüz destructure EDİLMEZ — Task 2 ve 3'te bağlanacaklar.
// Kullanılmayan değişken lint uyarısı böylece hiç doğmaz.
export function GlassSiteHeader({
  logo,
  links = [],
  utility,
  secondaryAction,
  action,
}: GlassSiteHeaderProps) {
  const glassId = useId()
  const reduced = prefersReducedMotion()
  const hasLinks = links.length > 0

  const nav = hasLinks ? (
    <nav aria-label="Site" className={styles.nav}>
      <ul className={styles.linkList}>
        {links.map((link) => (
          <li key={link.label} className={styles.linkItem}>
            <a
              href={link.href ?? '#'}
              onClick={linkClick(link)}
              aria-current={link.active ? 'page' : undefined}
              className={link.active ? `${styles.link} ${styles.linkActive}` : styles.link}
            >
              {link.active ? (
                <motion.span
                  layoutId={glassId}
                  data-nav-glass
                  className={styles.glassPill}
                  transition={reduced ? { duration: 0 } : { type: 'spring', ...presets.springs.sidebar }}
                  aria-hidden
                />
              ) : null}
              <span className={styles.linkLabel}>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  ) : (
    <span className={styles.grow} aria-hidden />
  )

  return (
    <header className={styles.root}>
      <div className={styles.capsule}>
        <GlassSurface
          aria-hidden
          material="glass"
          thickness={0.4}
          shape={20}
          className={styles.material}
        />
        {/* Kapsülün içi düz katman — cam üstüne cam yok. */}
        <GlassTierProvider tier="fallback">
          <div className={styles.row}>
            <span className={styles.wordmark}>{logo}</span>
            {nav}
            <span className={styles.actions}>
              {utility}
              {secondaryAction}
              {action}
            </span>
          </div>
        </GlassTierProvider>
      </div>
    </header>
  )
}
```

`src/components/GlassSiteHeader/index.ts`:

```ts
export {
  GlassSiteHeader,
  type GlassSiteHeaderProps,
  type GlassSiteHeaderLink,
} from './GlassSiteHeader'
```

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`
Expected: PASS — 6 test

- [ ] **Step 6: Typecheck ve lint**

Run: `npx tsc -b && npm run lint`
Expected: hata yok.

- [ ] **Step 7: Commit**

```bash
git add src/components/GlassSiteHeader/
git commit -m "feat(GlassSiteHeader): kapsül iskeleti — semantik, linkler, aksiyon slotları"
```

---

## Task 2: Scroll morfu — `data-scrolled`, FLIP kapsül, `condensedAction`

**Files:**
- Modify: `src/components/GlassSiteHeader/GlassSiteHeader.tsx`
- Modify: `src/components/GlassSiteHeader/GlassSiteHeader.module.css`
- Modify: `src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`

**Interfaces:**
- Consumes: Task 1'in `GlassSiteHeader` bileşeni ve `GlassSiteHeaderProps` tipi.
- Produces: kökte `data-scrolled="true"` attribute'u (Task 3'ün CSS'i ve Task 5'in shell offset'i buna dayanır); `scrollThreshold` ve `condensedAction` prop'larının çalışır hâli.

- [ ] **Step 1: Testi yaz (başarısız olacak)**

`GlassSiteHeader.test.tsx` sonuna ekle:

```tsx
describe('GlassSiteHeader — scroll morfu', () => {
  const setScroll = (value: number) => {
    Object.defineProperty(window, 'scrollY', { value, configurable: true })
    fireEvent.scroll(window)
  }

  it('scroll eşiği geçilince kök data-scrolled işaretlenir, dönünce kalkar', () => {
    renderHeader()
    const header = screen.getByRole('banner')
    expect(header.getAttribute('data-scrolled')).toBeNull()
    setScroll(200)
    expect(header.getAttribute('data-scrolled')).toBe('true')
    setScroll(0)
    expect(header.getAttribute('data-scrolled')).toBeNull()
  })

  it('scrollThreshold eşiği belirler', () => {
    renderHeader({ scrollThreshold: 400 })
    const header = screen.getByRole('banner')
    setScroll(200)
    expect(header.getAttribute('data-scrolled')).toBeNull()
    setScroll(500)
    expect(header.getAttribute('data-scrolled')).toBe('true')
    setScroll(0)
  })

  it('condensedAction verilince scroll sonrası üçlü aksiyonun yerine geçer', () => {
    renderHeader({
      utility: <button>Tema</button>,
      secondaryAction: <button>Üye girişi</button>,
      action: <button>İlan ver</button>,
      condensedAction: <button>Hemen başla</button>,
    })
    expect(screen.getByRole('button', { name: 'Üye girişi' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Hemen başla' })).toBeNull()

    setScroll(200)
    expect(screen.getByRole('button', { name: 'Hemen başla' })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Üye girişi' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Tema' })).toBeNull()
    setScroll(0)
  })

  it('condensedAction verilmezse scroll sonrası üçlü aksiyon korunur', () => {
    renderHeader({
      secondaryAction: <button>Üye girişi</button>,
      action: <button>İlan ver</button>,
    })
    setScroll(200)
    expect(screen.getByRole('button', { name: 'Üye girişi' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'İlan ver' })).toBeDefined()
    setScroll(0)
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`
Expected: FAIL — "scroll eşiği geçilince..." testi `data-scrolled` null döner

- [ ] **Step 3: `useScrolled` kancasını ve morf işaretini ekle**

`GlassSiteHeader.tsx` — import satırını güncelle:

```tsx
import { useEffect, useId, useState, type MouseEvent, type ReactNode } from 'react'
```

`linkClick` fonksiyonunun üstüne ekle:

```tsx
/**
 * Scroll eşiği geçildi mi — görsel geçişler CSS'te, JS yalnız attribute
 * değiştirir. Listener passive; her karede ölçüm yapılmaz.
 */
function useScrolled(threshold: number): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}
```

Bileşen imzasını ve gövdesini güncelle:

```tsx
export function GlassSiteHeader({
  logo,
  links = [],
  utility,
  secondaryAction,
  action,
  condensedAction,
  scrollThreshold = 24,
}: GlassSiteHeaderProps) {
  const glassId = useId()
  const reduced = prefersReducedMotion()
  const scrolled = useScrolled(scrollThreshold)
  const hasLinks = links.length > 0
  const morphTransition = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, ...presets.springs.sidebar }
```

`nav` tanımı değişmiyor. `return` bloğunu şununla değiştir:

```tsx
  return (
    <header className={styles.root} data-scrolled={scrolled || undefined}>
      <motion.div layout transition={morphTransition} className={styles.capsule}>
        <GlassSurface
          aria-hidden
          material="glass"
          thickness={0.4}
          shape={20}
          className={styles.material}
        />
        {/* Kapsülün içi düz katman — cam üstüne cam yok. */}
        <GlassTierProvider tier="fallback">
          <motion.div layout="position" transition={morphTransition} className={styles.row}>
            <span className={styles.wordmark}>{logo}</span>
            {nav}
            <span className={styles.actions}>
              {condensedAction && scrolled ? (
                condensedAction
              ) : (
                <>
                  {utility}
                  {secondaryAction}
                  {action}
                </>
              )}
            </span>
          </motion.div>
        </GlassTierProvider>
      </motion.div>
    </header>
  )
}
```

`menuLabel` hâlâ destructure edilmiyor — Task 3'te eklenecek.

- [ ] **Step 4: CSS'e morf durumlarını ekle**

`GlassSiteHeader.module.css` — `.capsule` kuralının hemen ardına ekle:

```css
/* Condensed: kapsül daralır ve köşelenir. Genişlik/radius değişimini motion
   layout (FLIP) transform'a çevirir — CSS transition YOK (layout tetiklerdi). */
.root[data-scrolled] .capsule {
  max-width: var(--capsule-max-scrolled);
  border-radius: var(--lg-radius-card);
}
```

`.material` kuralının hemen ardına ekle:

```css
.root[data-scrolled] .material {
  opacity: 1;
  visibility: visible;
  transition: opacity var(--morph-dur) ease, visibility 0s;
}
```

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`
Expected: PASS — 10 test

- [ ] **Step 6: Commit**

```bash
git add src/components/GlassSiteHeader/
git commit -m "feat(GlassSiteHeader): scroll morfu — data-scrolled, FLIP kapsül, condensedAction"
```

---

## Task 3: Mobil panel — inline disclosure sözleşmesi

Hamburger kapsülü aşağı büyütür. Portal/focus trap/scroll kilidi **yok** — panel modal değil, sayfa akışının parçası.

**Files:**
- Modify: `src/components/GlassSiteHeader/GlassSiteHeader.tsx`
- Modify: `src/components/GlassSiteHeader/GlassSiteHeader.module.css`
- Modify: `src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`

**Interfaces:**
- Consumes: Task 2'nin `scrolled`/`morphTransition` değişkenleri ve `menuLabel` prop'u.
- Produces: kökte `data-menu-open="true"` attribute'u; hamburger butonu (`aria-expanded`, `aria-controls`); panel `id`'si.

- [ ] **Step 1: Testi yaz (başarısız olacak)**

`GlassSiteHeader.test.tsx` sonuna ekle:

```tsx
describe('GlassSiteHeader — mobil panel', () => {
  const openMenu = () => {
    const burger = screen.getByRole('button', { name: 'Menü' })
    fireEvent.click(burger)
    return burger
  }

  it('hamburger aria-expanded/aria-controls sözleşmesini taşır', () => {
    renderHeader()
    const burger = screen.getByRole('button', { name: 'Menü' })
    expect(burger.getAttribute('aria-expanded')).toBe('false')
    const panelId = burger.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    expect(document.getElementById(panelId as string)).toBeNull()

    fireEvent.click(burger)
    expect(burger.getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById(panelId as string)).not.toBeNull()
  })

  it('panel açıkken kök data-menu-open işaretlenir', () => {
    renderHeader()
    openMenu()
    expect(screen.getByRole('banner').getAttribute('data-menu-open')).toBe('true')
  })

  it('Escape paneli kapatır ve focus hamburger’a döner', () => {
    renderHeader()
    const burger = openMenu()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(burger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(burger)
  })

  it('kapsül dışına pointerdown paneli kapatır', () => {
    renderHeader()
    const burger = openMenu()
    fireEvent.pointerDown(document.body)
    expect(burger.getAttribute('aria-expanded')).toBe('false')
  })

  it('kapsül içine pointerdown paneli kapatmaz', () => {
    renderHeader()
    const burger = openMenu()
    fireEvent.pointerDown(screen.getByText('arsam.net'))
    expect(burger.getAttribute('aria-expanded')).toBe('true')
  })

  it('panelden link seçimi onClick çağırır ve paneli kapatır', () => {
    const links = makeLinks()
    renderHeader({}, links)
    const burger = openMenu()
    const panelId = burger.getAttribute('aria-controls') as string
    const panel = document.getElementById(panelId) as HTMLElement
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    ;(panel.querySelector('a[href="#ofisler"]') as HTMLElement).dispatchEvent(event)
    expect(links[1].onClick).toHaveBeenCalledTimes(1)
    expect(burger.getAttribute('aria-expanded')).toBe('false')
  })

  it('menuLabel hamburger’ın accessible name’ini belirler', () => {
    renderHeader({ menuLabel: 'Gezinme' })
    expect(screen.getByRole('button', { name: 'Gezinme' })).toBeDefined()
  })
})
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`
Expected: FAIL — `Unable to find role="button" with name "Menü"`

- [ ] **Step 3: Hamburger ikonunu ve paneli ekle**

`GlassSiteHeader.tsx` — import satırlarını güncelle:

```tsx
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { GlassSurface, GlassTierProvider } from '../GlassSurface'
import { GlassIconButton } from '../GlassIconButton'
```

Bileşen imzasına `menuLabel`'ı ekle:

```tsx
  action,
  condensedAction,
  menuLabel = 'Menü',
  scrollThreshold = 24,
}: GlassSiteHeaderProps) {
```

`useScrolled`'ın üstüne ikonu ekle:

```tsx
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
```

Bileşen gövdesinde `const hasLinks = ...` satırından sonra ekle:

```tsx
  const [menuOpen, setMenuOpen] = useState(false)
  const capsuleRef = useRef<HTMLDivElement>(null)
  const burgerId = `${glassId}-burger`
  const panelId = `${glassId}-panel`

  // Escape kapatır ve focus hamburger'a döner; kapsül dışına pointerdown kapatır.
  // Focus trap YOK — panel modal değil, sayfa akışının parçası (rules.md §2).
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      document.getElementById(burgerId)?.focus()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (capsuleRef.current?.contains(e.target as Node)) return
      setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [menuOpen, burgerId])
```

`nav` tanımından sonra, `return`'ün üstüne ekle:

```tsx
  const burger = hasLinks ? (
    <span className={styles.burger}>
      <GlassIconButton
        id={burgerId}
        label={menuLabel}
        aria-expanded={menuOpen}
        aria-controls={panelId}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MenuIcon />
      </GlassIconButton>
    </span>
  ) : null

  const panel =
    hasLinks && menuOpen ? (
      <motion.div
        id={panelId}
        layout
        transition={morphTransition}
        className={styles.panel}
      >
        <nav aria-label={menuLabel}>
          <ul className={styles.panelList}>
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href ?? '#'}
                  aria-current={link.active ? 'page' : undefined}
                  className={link.active ? `${styles.panelLink} ${styles.panelLinkActive}` : styles.panelLink}
                  onClick={(e) => {
                    linkClick(link)(e)
                    setMenuOpen(false)
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.panelActions}>
          {utility}
          {secondaryAction}
          {action}
        </div>
      </motion.div>
    ) : null
```

Kök `<header>` ve satır bloğunu güncelle — `data-menu-open` ekle, `capsuleRef` bağla, hamburger'ı aksiyonların sonuna koy, paneli satırın altına al:

```tsx
  return (
    <header
      className={styles.root}
      data-scrolled={scrolled || undefined}
      data-menu-open={menuOpen || undefined}
    >
      <motion.div ref={capsuleRef} layout transition={morphTransition} className={styles.capsule}>
        <GlassSurface
          aria-hidden
          material="glass"
          thickness={0.4}
          shape={20}
          className={styles.material}
        />
        {/* Kapsülün içi düz katman — cam üstüne cam yok. */}
        <GlassTierProvider tier="fallback">
          <motion.div layout="position" transition={morphTransition} className={styles.row}>
            <span className={styles.wordmark}>{logo}</span>
            {nav}
            <span className={styles.actions}>
              {condensedAction && scrolled ? (
                condensedAction
              ) : (
                <>
                  {utility}
                  {secondaryAction}
                  {action}
                </>
              )}
              {burger}
            </span>
          </motion.div>
          {/* AnimatePresence yok: panelin exit varyantı yok, kapanışta kapsülün
              `layout`'u yükseklik farkını zaten FLIP ile sürüyor. */}
          {panel}
        </GlassTierProvider>
      </motion.div>
    </header>
  )
```

- [ ] **Step 4: CSS'e panel ve container query kurallarını ekle**

`GlassSiteHeader.module.css` — `.actions` kuralının ardına ekle:

```css
.burger { display: inline-flex; }

/* ── Mobil panel: kapsülün kendisi büyür, ayrı yüzey değil ────────────── */
.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-4);
  margin-top: var(--lg-space-3);
  padding-top: var(--lg-space-4);
  border-top: 1px solid var(--lg-hairline);
}
.panelList {
  display: flex;
  flex-direction: column;
  gap: var(--lg-space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}
.panelLink {
  display: flex;
  align-items: center;
  min-height: var(--lg-control-md);
  padding: 0 var(--link-pad-x);
  border-radius: var(--lg-radius-chip);
  color: var(--lg-label-secondary);
  text-decoration: none;
  font-size: var(--lg-text-body);
  font-weight: 500;
}
@media (hover: hover) { .panelLink:hover { color: var(--lg-label); } }
.panelLink:focus-visible {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: 2px;
}
.panelLinkActive { color: var(--lg-label); font-weight: 600; }
.panelActions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--actions-gap);
}
```

`.material` durum kuralının ardına ekle (panel tepede açılırsa da okunur zemin gerekir):

```css
/* Panel tepede de açılabilir — o hâlde de zemin gerekir, yoksa metin
   sayfa içeriğinin üstünde okunmaz kalır. */
.root[data-menu-open] .capsule { border-radius: var(--lg-radius-card); }
.root[data-menu-open] .material {
  opacity: 1;
  visibility: visible;
  transition: opacity var(--morph-dur) ease, visibility 0s;
}
```

Container query bloğunu güncelle (`@container (min-width: 48rem)` içine ekle):

```css
@container (min-width: 48rem) {
  .nav { display: flex; }
  .burger { display: none; }
  .panel { display: none; }
}
```

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npx vitest run src/components/GlassSiteHeader/GlassSiteHeader.test.tsx`
Expected: PASS — 17 test

- [ ] **Step 6: Typecheck ve lint**

Run: `npx tsc -b && npm run lint`
Expected: hata yok

- [ ] **Step 7: Commit**

```bash
git add src/components/GlassSiteHeader/
git commit -m "feat(GlassSiteHeader): kapsül içinde açılan mobil panel — inline disclosure"
```

---

## Task 4: Story matrisi, `rules.md`, export ve katalog kaydı

**Files:**
- Create: `src/components/GlassSiteHeader/GlassSiteHeader.stories.tsx`
- Create: `src/components/GlassSiteHeader/rules.md`
- Modify: `src/index.ts:4` civarı (GlassHeader export'unun hemen ardı)
- Modify: `src/demo/ComponentCatalog.tsx:163` civarı (Navigasyon bölümünün başı)

**Interfaces:**
- Consumes: `GlassSiteHeader`, `GlassSiteHeaderProps`, `GlassSiteHeaderLink` (Task 1-3).
- Produces: `@repo/ui`'den `GlassSiteHeader` ve `GlassSiteHeaderLink` export'u — Task 5 buna dayanır.

- [ ] **Step 1: Story dosyasını yaz**

`src/components/GlassSiteHeader/GlassSiteHeader.stories.tsx`:

```tsx
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSiteHeader, type GlassSiteHeaderLink } from './GlassSiteHeader'
import { GlassButton } from '../GlassButton'

const links: GlassSiteHeaderLink[] = [
  { label: 'Arama', href: '#arama', active: true },
  { label: 'Ofisler', href: '#ofisler' },
  { label: 'Bölgeler', href: '#bolgeler' },
  { label: 'Blog', href: '#blog' },
]

/** Parsel-pin monogram — harf-kutusu logo kalıbı yerine özel işaret. */
const Mark = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--lg-accent)" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
    <path d="M12 21.5C12 21.5 4.5 15.4 4.5 9.8a7.5 7.5 0 0 1 15 0c0 5.6-7.5 11.7-7.5 11.7z" />
    <path d="M8.6 8.2h6.8M8.6 11.6h6.8M12 5v9.8" strokeWidth="1.2" opacity="0.85" />
  </svg>
)

const Logo = () => (
  <>
    <Mark />
    arsam.net
  </>
)

const ThemeButton = () => (
  <GlassButton size="sm" aria-label="Tema: sistem" title="Tema: sistem">
    ◐
  </GlassButton>
)

const AccountButton = () => <GlassButton size="sm">Üye girişi</GlassButton>
const CreateButton = () => (
  <GlassButton size="sm" prominent>
    İlan ver
  </GlassButton>
)

/** Scroll morfu canlı denenebilsin diye sahne uzun tutulur. */
const Sahne = ({ children }: { children: ReactNode }) => (
  <div style={{ minHeight: '220vh', background: 'var(--lg-bg)' }}>
    {children}
    <div style={{ paddingTop: '30vh', textAlign: 'center', color: 'var(--lg-label-secondary)' }}>
      Kapsülün daralmasını görmek için sayfayı kaydır.
    </div>
  </div>
)

const meta = {
  title: 'Bileşenler/Navigasyon/GlassSiteHeader',
  component: GlassSiteHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    logo: <Logo />,
    links,
    utility: <ThemeButton />,
    secondaryAction: <AccountButton />,
    action: <CreateButton />,
    menuLabel: 'Menü',
    scrollThreshold: 24,
  },
  decorators: [(Story) => <Sahne><Story /></Sahne>],
} satisfies Meta<typeof GlassSiteHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Temel sözleşme — tepede şeffaf geniş ray. */
export const Default: Story = {}

/** Yalnız public API; hover/focus/active control DEĞİLDİR. */
export const Playground: Story = {
  argTypes: {
    menuLabel: { control: 'text' },
    scrollThreshold: { control: { type: 'number', min: 0, step: 8 } },
  },
}

/** Scroll durumları — `variant` ekseni yok, morf tek eksen (rules.md §5). */
export const ScrollDurumlari: Story = {
  args: { condensedAction: <CreateButton />, scrollThreshold: 24 },
}

/**
 * Linksiz (sade) durum — nav, hamburger ve panel render edilmez.
 * Kök `position: fixed` olduğu için tek story'de iki header gösterilmez;
 * aktif link `Default`'ta, mobil panel `Responsive`'te denetlenir.
 */
export const Durumlar: Story = {
  args: { links: [], logo: 'arsam.net' },
}

/** Uzun TR etiketleri ve uzun wordmark — taşma/sıkışma davranışı. */
export const UzunIcerik: Story = {
  args: {
    logo: 'arsam.net · Kurumsal Emlak Pazaryeri',
    links: [
      { label: 'Gelişmiş Arsa Arama', href: '#a', active: true },
      { label: 'Kurumsal Ofis Rehberi', href: '#b' },
      { label: 'Bölgesel Değerleme Raporları', href: '#c' },
      { label: 'Pazar Analizi Günlüğü', href: '#d' },
    ],
  },
}

/** Dar container → linkler hamburger'a düşer. Viewport toolbar'ıyla denenir. */
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

/** Kağıt teması — toolbar'daki tema seçicisiyle Grafit'e de bakılır. */
export const Temalar: Story = {
  parameters: { backgrounds: { default: 'light' } },
}

/**
 * Erişilebilirlik: hamburger `aria-expanded`/`aria-controls`, aktif link
 * `aria-current="page"`, Escape'te focus hamburger'a döner, focus halkası
 * yalnız `:focus-visible`. Panel modal DEĞİLDİR — Tab panelden çıkabilir.
 */
export const Erisilebilirlik: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
```

- [ ] **Step 2: Storybook'ta story'lerin yüklendiğini doğrula**

Run: `npx tsc -b`
Expected: hata yok. (Görsel doğrulama Task 7'de `npm run dev` ile.)

- [ ] **Step 3: `rules.md` yaz**

`src/components/GlassSiteHeader/rules.md`:

```markdown
---
name: GlassSiteHeader
category: navigasyon
status: hazır
lastReviewed: 2026-07-31
---

# GlassSiteHeader Kuralları

## 1. Amaç

Tepede görünmez, scroll'da yüzen bir cam kapsüle morflanan site header'ı.
Kaynak: Tailark `hero-section-1`'in `HeroHeader`'ı; Liquid Glass uyarlaması.

- **Kullan:** pazaryerinin/kamuya açık sitenin üst navigasyonu.
- **Kullanma:** uygulama içi geri+başlık barı (→ `GlassNavbar`); dört anatomili
  editorial header (→ `GlassHeader`); Dynamic Island paneli (→ `GlassIslandHeader`).

## 2. Semantik sözleşme

- Kök `<header>` (banner); yatay link satırı `<nav aria-label="Site">`;
  mobil panel `<nav aria-label={menuLabel}>`. Aktif link `aria-current="page"`.
- Kayan cam gösterge `aria-hidden` + `data-nav-glass`; motion `layoutId`
  (`presets.springs.sidebar`), reduced-motion'da `duration: 0`.
- Hamburger `GlassIconButton` — accessible name `menuLabel`, `aria-expanded` +
  `aria-controls` panel `id`'sine bağlı.
- **Panel modal DEĞİLDİR.** Portal yok, focus trap yok, scroll kilidi yok.
  Escape kapatır ve focus hamburger'a döner; kapsül dışına `pointerdown`
  kapatır; link seçimi kapatır. Gerekçe: `GenelBakis.mdx`'in overlay sözleşmesi
  (portal + trap + kilit + focus dönüşü) sayfayı bloke eden Modal/Drawer/Toast
  katmanı için yazıldı. Bu panel sayfa akışının parçası — `Tab` panelden doğal
  olarak çıkmalıdır.
- Linkler sade sol tıkta `onClick`'e devreder (`preventDefault`); modifier'lı ve
  orta tıkta tarayıcıya bırakılır — yeni sekme davranışı korunur.

## 3. Anatomy

| Slot | Zorunlu | Kurallar |
|---|---|---|
| logo | ✅ | Wordmark/monogram — harf-kutusu kalıbı kullanılmaz |
| links | — | Boşsa nav, hamburger ve panel render edilmez |
| utility | — | Küçük yardımcı ikon buton (tema vb.) — aksiyonların solunda |
| secondaryAction | — | İkincil aksiyon ("Üye girişi") |
| action | — | TEK birincil CTA ("İlan ver") |
| condensedAction | — | Verilirse condensed'de utility+secondary+action üçlüsünün yerine geçer |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| logo | `ReactNode` | — |
| links | `GlassSiteHeaderLink[]` | `[]` |
| utility / secondaryAction / action / condensedAction | `ReactNode` | — |
| menuLabel | `string` | `'Menü'` |
| scrollThreshold | `number` | `24` |

`GlassSiteHeaderLink`: `{ label: string; href?: string; onClick?: () => void; active?: boolean }`

`...rest` yok. Controlled/Ref: N/A — iç state yalnız menü açıklığı + scroll bayrağı.

## 5. Seçenek eksenleri

| Kural | Davranış |
|---|---|
| `variant` / `size` / `material` | ❌ YOK — tek anatomi. Morf bir *durum*, eksen değil |
| `tone` | ❌ YOK — renkler tema token'larından döner |
| `condensedAction` verilmezse | Üçlü aksiyon condensed'de olduğu gibi kalır (opt-in davranış) |
| `links` boş | nav + hamburger + panel render edilmez, yerine esnek boşluk |

## 6. State modeli

İç state iki bayrak: `useScrolled(scrollThreshold)` → kökte `data-scrolled`;
`menuOpen` → kökte `data-menu-open`. Scroll listener passive; JS ölçüm yapmaz,
görsel geçişler CSS ve motion layout'ta.

## 7. Davranış

- **Rest:** kapsül `--lg-container-narrow` genişliğinde, şeffaf, köşesiz. Cam
  yüzey maliyeti **0** (`.material` `visibility: hidden`).
- **Condensed:** kapsül `55rem`'e daralır, `--lg-radius-card` köşelenir,
  `.material` opacity ile belirir. Cam yüzey **1**.
- Genişlik/radius değişimi **motion layout (FLIP)** ile transform'a çevrilir.
  CSS `max-width` transition'ı bilinçli olarak YOK — layout tetiklerdi
  (`ErisilebilirlikMotionResponsive.mdx`).
- Panel tepede açılırsa da `.material` görünür olur; yoksa panel metni sayfa
  içeriğinin üstünde okunmaz kalırdı.
- Dar kapsülde (`@container (min-width: 48rem)` altı) yatay linkler gizlenir,
  hamburger görünür. **Container query kullanıldı** — `GlassHeader` §7'deki
  "containment sticky'i bozar" notunun tersine burada güvenli: kök `fixed`,
  containment `.capsule`'da ve kapsül konumlanmış bir öğe değil.
- `condensedAction` DOM'da tek örnek olarak yer değiştirir (display ile gizlenen
  ikinci kopya yok) — çift accessible name önlenir.

## 8. İçerik

- Link etiketleri 1-3 kelime; 5-6 linkten fazlasında `UzunIcerik` story'sindeki
  gibi sıkışır — bilgi mimarisini sadeleştir.
- `utility` slotuna yalnız tek ikon buton ver; aksiyon yığını yapma.

## 9. Token eşlemesi

| Part | Token |
|---|---|
| kapsül genişliği | `--lg-container-narrow` (rest) |
| kenar boşluğu | `--lg-container-gutter` |
| köşe | `--lg-radius-card` (kapsül) · `--lg-radius-capsule` (link) · `--lg-radius-chip` (panel linki) |
| kontrol yükseklikleri | `--lg-control-sm` (link) · `--lg-control-md` (panel linki) · `--lg-control-lg` (satır) |
| gölge | `--lg-shadow-md`, `GlassSurface`'in `--lg-surface-shadow` kancasına verilir |
| metinler | `--lg-label` / `--lg-label-secondary`; `--lg-text-headline` / `--lg-text-body` |
| çizgiler | `--lg-hairline` |
| boşluklar | `--lg-space-1/2/3/4` |
| focus | `--lg-focus-ring-width` + `--lg-accent` |

**Borç (raw / mikro-geometri):** Token karşılığı olmayan ölçüler kökte yerel
değişkenlerde toplandı: `--capsule-max-scrolled: 55rem` (condensed genişlik —
container ölçeğinde karşılığı yok), `--zone-gap: 18px`, `--actions-gap: 12px`,
`--wordmark-gap: 9px`, `--nav-font: 14px`, `--link-gap: 2px`,
`--link-pad-x: 13px`, `--focus-radius: 4px`, `--pill-inset: 3px 1px`,
`--morph-dur: 0.3s`. Bilinçli bırakılanlar: cam pill reçetesi
`blur(8px) + saturate(150%)` ve `color-mix`'li ışıma (token gölge kalıplarıyla
birebir değil), geçiş easing'i (token yok), `z-index: 30` (z ölçeği yok —
`GlassHeader` ile aynı kademe), container query eşiği `48rem` (bp ölçeği dışı),
`GlassSurface`'in `shape={20}` sayısal API'si (`--lg-radius-card`'ın 20px
değeriyle elle eşlenir — prop CSS değil sayı alır).

## 10. Storybook kapsamı

Default, Playground, ScrollDurumlari (`Variants/Materials` yerine — varyant
ekseni yok), Durumlar, UzunIcerik, Responsive, Temalar, Erisilebilirlik.
`Sizes`: N/A — `size` ekseni yok. Story zeminleri 220vh olduğu için scroll
morfu canlı denenebilir.

## 11. Test kabul kriterleri

- [x] banner + "Site" navigation landmark
- [x] aktif link `aria-current` + `data-nav-glass` göstergesi
- [x] sade sol tıkta `onClick` + `preventDefault`; modifier'lı tıkta devretmez
- [x] logo/utility/secondaryAction/action slotları render
- [x] links boşken nav + hamburger yok
- [x] scroll eşiği → `data-scrolled` (ileri/geri) ve `scrollThreshold` etkisi
- [x] `condensedAction` üçlünün yerine geçer / verilmezse üçlü korunur
- [x] hamburger `aria-expanded` + `aria-controls`; panel `id`'si
- [x] `data-menu-open` işareti
- [x] Escape kapatır + focus hamburger'a döner
- [x] dış `pointerdown` kapatır, iç kapatmaz
- [x] panelden link seçimi `onClick` + kapatma
- [ ] kapsülün daralma morfu (visual, Chrome)
- [ ] `.material`'ın opacity ile belirişi (visual, Chrome)

## 12. Do / Don't

- ✅ `href`'i her zaman ver — orta tık ve SSR gezinmesi korunur.
- ✅ `condensedAction`'ı yalnız gerçekten tek CTA'ya çökmesi gereken sitelerde ver.
- ❌ `action`'a birden çok buton koyma — tek CTA sözleşmesi.
- ❌ Kapsül içine `GlassSurface` koyma — içerik `GlassTierProvider tier="fallback"`
  ile düz katmandadır, cam üstüne cam olur.
- ❌ Paneli modal gibi kullanma (arka planı kilitleme, trap ekleme) — sözleşme §2.

**Bilinen kısıtlar:** `container-type: inline-size` kapsülü `position: fixed`
torunlar için containing block yapar; panel/gösterge `absolute` olduğu için
sorun çıkmaz, ancak kapsül içine `fixed` bir şey konursa viewport'a değil
kapsüle göre konumlanır. **Açık kararlar:** arama slotu (v2+) · bildirim
göstergesi (v2+) · megamenü (GlassMenu ile).
```

- [ ] **Step 4: Kütüphane export'unu ekle**

`src/index.ts` — `GlassHeader` export satırının hemen ardına ekle:

```ts
export {
  GlassSiteHeader,
  type GlassSiteHeaderProps,
  type GlassSiteHeaderLink,
} from './components/GlassSiteHeader'
```

- [ ] **Step 5: Katalog kaydını ekle**

`src/demo/ComponentCatalog.tsx` — `// ── Navigasyon ──` yorumunun hemen altına, `Navbar` girdisinden **önce** ekle:

```tsx
  {
    name: 'SiteHeader',
    description:
      'Tepede görünmez ray, scroll’da yüzen cam kapsüle morflanan site header’ı — mobilde kapsülün içinde açılan menü paneli.',
    category: 'Navigasyon',
    status: 'hazır',
    storyPath: '/story/bileşenler-navigasyon-glasssiteheader--default',
  },
```

- [ ] **Step 6: Tüm testleri, typecheck ve lint'i çalıştır**

Run: `npm test && npx tsc -b && npm run lint`
Expected: tümü PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/GlassSiteHeader/ src/index.ts src/demo/ComponentCatalog.tsx
git commit -m "docs(GlassSiteHeader): story matrisi, rules.md, export ve katalog kaydı"
```

---

## Task 5: `MarketplaceShell`'i `GlassSiteHeader`'a geçir ve düşenleri temizle

Geçiş ve temizlik **tek task**: header değişimi `search` (AI composer), saat/`initialTime`, `statusTrail`, bildirim ve dil seçici kodunu anında sahipsiz bırakır. Ayrı commit'lerde bölünürse arada derlenen ama ölü kod taşıyan bir hâl oluşur. Tema butonu **kalır** (spec §6.3 — tek erişim noktası).

**Files:**
- Modify: `apps/web/src/components/MarketplaceShell.tsx`
- Modify: `apps/web/src/components/MarketplaceShell.test.tsx`
- Modify: `apps/web/src/routes/__root.tsx`
- Modify: `apps/web/src/styles/app.css`

**Interfaces:**
- Consumes: `@repo/ui`'den `GlassSiteHeader`, `GlassSiteHeaderLink` (Task 4).
- Produces: `.shell-brand` CSS sınıfı; güncellenmiş `--lg-shell-header-offset`; `MarketplaceShellProps` artık yalnız `{ children: ReactNode }`.

- [ ] **Step 1: Test mock'unu ve beklentileri güncelle (başarısız olacak)**

`apps/web/src/components/MarketplaceShell.test.tsx`:

`vi.mock('@repo/ui', ...)` bloğundan `GlassAiComposer` satırını **sil**, `GlassIslandHeader` girdisini şununla **değiştir**:

```tsx
  GlassSiteHeader: ({
    utility,
    secondaryAction,
    action,
  }: {
    utility?: ReactNode
    secondaryAction?: ReactNode
    action?: ReactNode
  }) => (
    <header data-testid="global-header">
      {utility}
      {secondaryAction}
      {action}
    </header>
  ),
```

Üç `<MarketplaceShell initialTime="2026-07-25T12:00:00.000Z">` kullanımını `<MarketplaceShell>` yap (kapanış etiketleri değişmez).

`describe('MarketplaceShell odaklı ilan akışı')` içinde, `/ilan-ver` beklentilerinin ardına ekle:

```tsx
    expect(screen.queryByTestId('global-search')).toBeNull()
```

`describe('MarketplaceShell hesap eylemi')` bloğunun ardına, tema butonunun korunduğunu doğrulayan yeni describe ekle:

```tsx
describe('MarketplaceShell tema eylemi', () => {
  it('tema butonu header’da kalır — tek erişim noktası', () => {
    routerState.pathname = '/emlak'

    render(
      <MarketplaceShell>
        <main>Rota içeriği</main>
      </MarketplaceShell>,
    )

    expect(screen.getByRole('button', { name: 'Tema: system' })).toBeTruthy()
  })
})
```

> `GlassButton` mock'u `aria-label`'ı geçirmiyor; bu testin geçmesi için mock'u
> `({ children, onClick, ...rest }) => <button onClick={onClick} {...rest}>{children}</button>`
> biçiminde genişlet.

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx vitest run --root apps/web src/components/MarketplaceShell.test.tsx`
Expected: FAIL — `GlassIslandHeader is not a function` ve `initialTime` zorunlu prop eksik

- [ ] **Step 3: `MarketplaceShell`'i geçir**

`apps/web/src/components/MarketplaceShell.tsx` — `@repo/ui` importunu güncelle:

```tsx
import {
  GlassButton,
  GlassDock,
  GlassSiteHeader,
  type GlassDockItem,
  type GlassSiteHeaderLink,
} from '@repo/ui'
```

`COMPOSER_TOOLS` sabitini ve üstündeki `// Header kompozitörünün bağlam ekleme araçları` yorumunu **sil**.

Props arayüzünü sadeleştir:

```tsx
export interface MarketplaceShellProps {
  children: ReactNode
}

export function MarketplaceShell({ children }: MarketplaceShellProps) {
```

`const [brief, setBrief] = useState('')` ve `const [briefContext, setBriefContext] = useState<GlassAiComposerAttachment[]>([])` satırlarını **sil**.

`composerTools` sabitini, üstündeki `// Bağlamı zaten eklenmiş araç...` yorumunu ve `const search = (<GlassAiComposer ... />)` bloğunun tamamını **sil**.

`headerPages` useMemo'sunu şununla değiştir:

```tsx
  const headerLinks = useMemo<GlassSiteHeaderLink[]>(
    () =>
      headerRouteKeys.map((key) => {
        const route = getRouteByKey(key)
        return {
          label: route.key === 'offices' ? 'Ofisler' : route.label,
          href: withBase(route.href),
          active: route.key === currentRoute.key,
          onClick: () => routeTo(withBase(route.href)),
        }
      }),
    [currentRoute.key, routeTo],
  )
```

`extras` bloğunu **sil** ve yerine üç ayrı slot koy:

```tsx
  const logo = (
    <a className="shell-brand" href={withBase('/')}>
      <NavigationIcon name="sparkles" size={22} />
      arsam.net
    </a>
  )

  const themeAction = (
    <GlassButton
      size="sm"
      aria-label={`Tema: ${theme}`}
      title={`Tema: ${theme}`}
      onClick={cycleTheme}
    >
      <NavigationIcon name="theme" size={18} />
    </GlassButton>
  )

  const accountAction = (
    <GlassButton
      id="shell-account-action"
      size="sm"
      onClick={() => routeTo('/hesabim')}
    >
      {currentRoute.scope === 'account' ? 'Hesabım' : 'Üye girişi'}
    </GlassButton>
  )

  const createAction = (
    <GlassButton size="sm" prominent onClick={() => routeTo('/ilan-ver')}>
      İlan ver
    </GlassButton>
  )
```

`return` içindeki `<GlassIslandHeader ... />` bloğunu şununla değiştir:

```tsx
        <GlassSiteHeader
          logo={logo}
          links={headerLinks}
          utility={themeAction}
          secondaryAction={accountAction}
          action={createAction}
          condensedAction={createAction}
        />
```

- [ ] **Step 4: `__root.tsx`'ten `initialTime` loader'ını kaldır**

`apps/web/src/routes/__root.tsx` — `createRootRouteWithContext` çağrısından `loader` alanını sil:

```tsx
export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
```

`RootComponent`'i güncelle:

```tsx
function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <MarketplaceShell>
          <Outlet />
        </MarketplaceShell>
      </QueryClientProvider>
    </RootDocument>
  )
}
```

- [ ] **Step 5: `.shell-brand` stilini ekle, dil/extras stillerini sil, offset yorumunu güncelle**

`apps/web/src/styles/app.css`:

**Sil:** `.shell-extras { ... }` ve `.shell-language { ... }` kurallarının tamamı. Ayrıca `@media (max-width: 767px)` bloğu içindeki şu kural:

```css
  .shell-extras {
    padding-inline: var(--lg-space-3);
  }
```

O blokta `.route-capabilities` kuralı kalır — blok boşalmaz, silme.

**Ekle** (silinen `.shell-extras`'ın yerine):

```css
.shell-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--lg-space-2);
  color: var(--lg-label);
  text-decoration: none;
}

.shell-brand:focus-visible {
  outline: var(--lg-focus-ring-width) solid var(--lg-accent);
  outline-offset: var(--lg-space-1);
  border-radius: var(--lg-radius-chip);
}
```

`--lg-shell-header-offset` bloğunun yorumunu ve hesabını güncelle:

```css
  /* Fixed GlassSiteHeader'ın kapladığı dikey alan: rayın üst boşluğu
     (--lg-space-3, GlassSiteHeader.module.css `--rail-pad-y`) + kapsül dolgusu
     (2 × --lg-space-2) + satır yüksekliği (--lg-control-lg).
     12 + 16 + 48 = 76px — önceki ada ölçüsüyle birebir aynı.
     Sayfa dolgusu, sticky öğelerin yapışma noktası ve odak kaydırma payı bu
     tek kaynağı okur; hiçbir yerde sabit bir sayı yazılmaz. */
  --lg-shell-header-offset: calc(
    var(--lg-space-3) + (2 * var(--lg-space-2)) + var(--lg-control-lg)
  );
```

- [ ] **Step 6: Testleri, typecheck ve lint'i çalıştır**

Run: `npx vitest run --root apps/web && npm test && npx tsc -b && npm run lint`
Expected: tümü PASS. `apps/web` tarafı 5 test (1 odaklı akış + 3 hesap eylemi + 1 tema eylemi). `GlassAiComposer` ve `GlassIslandHeader` artık `apps/web`'de referanssız; ikisi de kütüphanede duruyor (silinmiyor).

- [ ] **Step 7: `statusTrail` tüketicisinin kalmadığını doğrula**

Run: `grep -rn "statusTrail" apps/web/src`
Expected: yalnız `config/routes.ts` tanımı çıkar; `MarketplaceShell` referansı çıkmaz. Veri bilinçli olarak duruyor (spec §6.2).

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/MarketplaceShell.tsx apps/web/src/components/MarketplaceShell.test.tsx apps/web/src/routes/__root.tsx apps/web/src/styles/app.css
git commit -m "feat(apps/web): MarketplaceShell'i GlassSiteHeader'a geçir, düşen yetenekleri temizle"
```

---

## Task 6: Görsel doğrulama

Otomatik testlerin yakalayamadığı morf ve malzeme davranışı.

**Files:** yok (yalnız doğrulama; bulgular varsa ilgili task'ın dosyalarına düzeltme)

- [ ] **Step 1: Storybook'ta bileşeni denetle**

Run: `npm run dev`
Kontrol listesi (`Bileşenler/Navigasyon/GlassSiteHeader`):
- `Default`: tepede kapsül şeffaf, kenarlıksız, gölgesiz.
- Kaydır: kapsül daralıyor, köşeleniyor, cam beliriyor — sıçrama/zıplama yok.
- `ScrollDurumlari`: scroll'da üçlü aksiyon tek CTA'ya çöküyor.
- `Responsive` (mobile1): linkler gizli, hamburger görünür; hamburger'a bas — kapsül aşağı büyüyor, panel okunur zeminde.
- Panel tepedeyken (scroll=0) açıldığında da zemin var mı.
- `Temalar`: Kağıt ve Grafit'te kontrast yeterli mi.
- Klavye: Tab ile hamburger'a git, Enter ile aç, Escape ile kapat — focus hamburger'a döndü mü. Focus halkası yalnız klavyede görünüyor mu.
- DevTools → Rendering → "Emulate prefers-reduced-motion": morf anında oluyor mu.
- Katalogdaki `SiteHeader` kartının `storyPath`'i doğru story'ye gidiyor mu —
  Storybook'un ürettiği gerçek story id'sini URL'den oku ve gerekirse
  `ComponentCatalog.tsx`'teki değeri düzelt (Türkçe karakterli başlıkta id
  üretimi tahmine bırakılmaz).

- [ ] **Step 2: `apps/web`'de denetle**

Run: `npm run dev --workspace apps/web` (veya `npx vite --config apps/web/vite.config.ts`)
Kontrol listesi:
- Header sayfa içeriğini örtmüyor (`--lg-shell-header-offset` doğru).
- `/ilan-ver` rotasında header ve dock gizli.
- Aktif rota linki vurgulu; linke tık SPA gezinmesi yapıyor (tam sayfa yenilenmesi yok).
- Cmd+tık yeni sekmede açıyor.
- Tema butonu çalışıyor, seçim `localStorage`'da kalıcı.
- Dock ile header çakışmıyor.

- [ ] **Step 3: Bulguları düzelt ve commit'le**

Bulgu yoksa commit gerekmez. Varsa:

```bash
git add -A
git commit -m "fix(GlassSiteHeader): görsel QA bulgularını düzelt"
```

- [ ] **Step 4: `rules.md`'deki görsel kabul kriterlerini işaretle**

`src/components/GlassSiteHeader/rules.md` §11'de iki visual maddeyi `- [x]` yap.

```bash
git add src/components/GlassSiteHeader/rules.md
git commit -m "docs(GlassSiteHeader): görsel kabul kriterlerini işaretle"
```
