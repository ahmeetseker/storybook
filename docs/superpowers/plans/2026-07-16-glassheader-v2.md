# GlassHeader v2 Implementation Plan

> **Yürütme notu:** Bu plan, spec'in GlassHeader v2 bölümünü uygular
> (`docs/superpowers/specs/2026-07-16-header-hero-footer-design.md`). Önceki
> planlardan farklı olarak kod, tasarım bağlamını taşıyan oturum içinde INLINE
> yazılır (transkripsiyon subagent'ı yok — tasarım-kritik iş, kullanıcı "premium,
> AI yapmış anlaşılmasın" kalite şartı koydu ve redesign-existing-projects
> denetim standardı bu oturumda yüklü). Bağımsız doğrulama: iş bitince
> task-reviewer subagent'ı + kullanıcı görsel turu.

**Goal:** v1'in 5 jenerik varyantını, anatomileri gerçekten farklı 4 premium
varyantla değiştirmek: `islands` · `command` · `masthead` · `overlay`.

**Karar kaynağı:** Kullanıcı seçimi (4/4) — web araştırması (Figma/luxury RE
2026 trendleri) + Codex danışması sentezinden.

## Task 1: Component yeniden yazımı

- [ ] `GlassHeader.tsx` — v2 API (`action`/`secondaryAction`/`meta`/`search`/
  `searchSummary`; `material`/`utility`/`actions` kaldırıldı); `useScrolled`
  iç hook'u (passive listener → `data-scrolled`); 4 varyant yerleşimi; kayan
  cam gösterge: `motion.span layoutId` (GlassSidebar highlight deseni,
  `presets.springs.sidebar`, reduced-motion'da duration 0) — islands'ta link
  arkasında cam pill, masthead'de link altında refraktif çizgi, overlay'de
  link yanında cam boncuk; GlassDrawer mobil menü v1 sözleşmesiyle aynen.
- [ ] `GlassHeader.module.css` — cam gösterge: `backdrop-filter: blur(8px)
  saturate(140%)` + `rgba` zemin + 1px iç kenar ışıması (inset box-shadow);
  scroll geçişleri yalnız transform/opacity/padding transition; command'da
  `:focus-within` ile ray yeniden açılma; overlay'de `--lg-on-scrim` metin.
- [ ] `GlassHeader.test.tsx` — v2 testleri: 4 varyant yapısal farkı, aktif
  cam gösterge varlığı (`data-nav-glass`), scroll attribute (scrollY simüle),
  drawer sözleşmesi (href link / onClick buton), landmark + aria-current,
  action/secondaryAction yerleşimi, links boşken nav yok.
- [ ] `GlassHeader.stories.tsx` — Default(islands), Command (arama rayı demo
  slotu + özet), Masthead, Overlay (placeholderImage hero üstünde), Playground,
  UzunIcerik, Erisilebilirlik, VaryantKarsilastirma (4 varyant, içi dolu).
  Logo: harf kutusu YOK — parsel-pin monogram SVG + wordmark.
- [ ] `rules.md` — v2 sözleşmesi + changelog'a v1→v2 kırıcı değişim kaydı +
  Açık Kararlar: dikey köşe nav (overlay v2), megamenü.
- [ ] Doğrulama: focused vitest + `npx tsc -b` + oxlint (folder) + tam suite.
- [ ] Commit: `feat!: GlassHeader v2 — islands/command/masthead/overlay premium varyant seti`

## Task 2: Bağımsız review + görsel tur

- [ ] Task-reviewer subagent (diff + spec v2 bölümü + premium denetim lensi).
- [ ] Kullanıcı Storybook'ta VaryantKarsilastirma'dan değerlendirir.

## Kapsam dışı

- Hero/Footer premium geçişi (header onaylandıktan sonra aynı dille ayrı iş).
- command varyantının arama segmenti cam merceği (slot içeriğinin işi — story
  demo eder, component API'si değil).
