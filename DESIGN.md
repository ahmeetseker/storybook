---
name: liquid-glass-ui
description: Restrained Liquid Glass components with a calibrated Codex comparison layer.
colors:
  paper-canvas: "#F7F7F5"
  paper-surface: "#FFFFFF"
  paper-subtle: "#F0EFEB"
  paper-ink: "#1F201D"
  paper-muted: "#62635E"
  paper-accent: "#A44707"
  paper-on-accent: "#FFFFFF"
  mineral-canvas: "#F4F7F8"
  mineral-surface: "#FFFFFF"
  mineral-subtle: "#EAF0F2"
  mineral-ink: "#172126"
  mineral-muted: "#556269"
  mineral-accent: "#0B5C78"
  graphite-canvas: "#111214"
  graphite-surface: "#1A1C1F"
  graphite-subtle: "#23262A"
  graphite-ink: "#F4F4F2"
  graphite-muted: "#B1B3B5"
  graphite-accent: "#E29A4A"
  success: "#14733B"
  warning: "#8A4B00"
  danger: "#B42318"
  info: "#1D5A93"
typography:
  display:
    fontFamily: "Manrope Variable, Manrope, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope Variable, Manrope, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.022em"
  title:
    fontFamily: "Manrope Variable, Manrope, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope Variable, Manrope, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope Variable, Manrope, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  control:
    fontFamily: "Manrope Variable, Manrope, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
rounded:
  xs: "4px"
  compact: "8px"
  control: "10px"
  media: "12px"
  card: "16px"
  capsule: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  card: "20px"
  group: "24px"
  section: "40px"
  page: "64px"
components:
  button-primary:
    backgroundColor: "{colors.paper-accent}"
    textColor: "{colors.paper-on-accent}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
    typography: "{typography.control}"
  button-secondary:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
    typography: "{typography.control}"
  input-default:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
    typography: "{typography.body}"
  badge-soft:
    backgroundColor: "{colors.paper-subtle}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.compact}"
    padding: "3px 8px"
    typography: "{typography.label}"
  card-listing:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: liquid-glass-ui

## Overview

**Creative North Star: "The Calibrated Instrument"**

The interface behaves like a well-made measuring tool: tactile where people act, quiet where they read, and exact where they compare data. The original Kağıt/Grafit Liquid Glass identity remains available, while the Codex layer supplies three controlled comparison palettes. Paper is the recommended product default; Mineral changes the color character without changing geometry; Graphite supports dense work in low ambient light.

Glass is a functional material, not a page texture. It belongs to navigation, transient controls, and media chrome. Content cards, tables, notices, and reading surfaces stay flat. Motion communicates state within 120–240ms; it never stages a page-load performance.

The system explicitly rejects decorative glassmorphism, over-rounded Codex geometry, ghost cards, AI gradients, nested card grids, decorative motion, and inconsistent component vocabulary.

**Key Characteristics:**

- One sans family with a compact, legible product scale.
- Flat content and sparse Liquid Glass chrome.
- 4/8/10/12/16px geometry hierarchy; capsule only for true filters.
- Complete default, hover, focus, active, disabled, loading, invalid, and selected states.
- Paper, Mineral, and Graphite palettes sharing one interaction contract.

## Colors

The palette is restrained: neutral surfaces carry the product and one accent marks primary action, current selection, or focus.

### Primary

- **Fired Umber** (`paper-accent`): primary actions and focus in the recommended Paper direction; it is deliberately absent from decorative backgrounds.
- **Mineral Blue** (`mineral-accent`): the cool comparison direction for analytical and editorial exploration.
- **Graphite Copper** (`graphite-accent`): the low-light direction; it carries dark text rather than white when used as a solid surface.

### Neutral

- **Paper Canvas / Surface / Subtle**: the three light product layers. Canvas holds the page, Surface holds controls and content, Subtle groups related information without an extra card.
- **Mineral Canvas / Surface / Subtle**: a cooler but equally restrained alternative using the same layer hierarchy.
- **Graphite Canvas / Surface / Subtle**: three dark steps that preserve boundaries without bright hairlines.
- **Ink and Muted pairs**: normal text targets at least 4.5:1 against their intended background; muted is never used as faint decoration.

### Named Rules

**The One Voice Rule.** Accent color is used for primary action, selection, focus, and meaningful state only; it never decorates inactive space.

**The Semantic Foreground Rule.** A semantic foreground and a semantic solid background are separate roles. Never assume white is readable on warning, success, or danger.

## Typography

**Display Font:** Manrope Variable (with Manrope and system sans fallbacks)  
**Body Font:** Manrope Variable (with Manrope and system sans fallbacks)  
**Label Font:** Manrope Variable (with system sans fallbacks)

**Character:** A single humanist-geometric sans keeps component labels familiar while retaining enough character for Turkish display copy. Product trust comes from optical spacing and weight discipline, not a decorative font pairing.

### Hierarchy

- **Display** (700, 30px, 1.08): page-level product headings; editorial comparison pages may opt into a documented 52px display but never component labels.
- **Headline** (700, 17px, 1.2): compact section and panel headings.
- **Title** (700, 22px, 1.3): listing prices and compact data values; numeric values use tabular figures.
- **Body** (400, 15px, 1.5): product copy, capped at 65–75ch for prose.
- **Label** (600, 13px, -0.01em): field labels, filters, badges, and metadata; sentence case only.
- **Control** (600, 15px, -0.01em): default button and direct-manipulation text; small controls step down to Label.

### Named Rules

**The Product Scale Rule.** UI typography uses fixed sizes; fluid display type is reserved for the Editorial page composition and never leaks into controls.

## Elevation

The system uses tonal layering first and short structural shadows second. An outlined flat surface has no drop shadow. An elevated surface drops the border and uses a short 1–8px shadow. Dialogs may use a 16px/32px structural shadow only because they leave the document plane.

### Shadow Vocabulary

- **Raised** (`0 1px 2px rgb(31 32 29 / 8%)`): compact floating controls and quiet elevation.
- **Floating** (`0 4px 8px rgb(31 32 29 / 12%)`): menus or media controls clearly above content.
- **Dialog** (`0 16px 32px rgb(31 32 29 / 24%)`): modal surfaces without a decorative border.

### Named Rules

**The One Edge Rule.** A component uses hairline, tonal separation, or shadow as its primary edge treatment. Border plus wide soft shadow is forbidden.

**The Glass Budget Rule.** Glass appears only where a control or navigation layer floats above content; content surfaces never use backdrop blur.

## Components

### Buttons

- **Shape:** a restrained control corner (10px), not a capsule.
- **Primary:** one filled accent action per decision group; 40px default height and 16px inline padding.
- **Hover / Focus:** hover translates at most −1px; active returns to the plane or scales to .985; focus uses a 2px outline plus halo.
- **Secondary / Quiet / Danger:** secondary has a strong functional border and no shadow; quiet is transparent until hover; danger owns a separate semantic foreground.

### Chips

- **Style:** filters alone use the 999px capsule. Status badges use an 8px soft square, making information and interaction visually distinct.
- **State:** selected chips add a check, accent border, and soft fill; removable chips expose a separate accessible remove button.

### Cards / Containers

- **Corner Style:** outer cards use 16px; media uses 12px; nested content uses 8–10px.
- **Background:** flat Surface by default, Subtle for grouping, Glass only for chrome.
- **Shadow Strategy:** outlined cards have no shadow; elevated cards have no border.
- **Border:** one high-contrast-enough hairline; hover strengthens the boundary and moves at most −1px.
- **Internal Padding:** 16px compact, 20px default, 24px spacious.

### Inputs / Fields

- **Style:** 10px outline controls with a 40px default height and visible labels outside the field.
- **Focus:** the control boundary shifts to accent and gains the shared focus indicator.
- **Error / Disabled:** invalid uses semantic border, message, and `aria-invalid`; disabled changes surface, border, foreground, and cursor rather than opacity alone.

### Navigation

Header and tabs use familiar product patterns. Active navigation is marked with surface or underline plus `aria-current`; it is not a decorative glass capsule. On narrow screens, primary tasks remain reachable and horizontal tab lists scroll rather than truncate.

### Listing Card

Grid, row, and featured layouts share one price, location, badge, favorite, and focus contract. Listing imagery may be immersive; the text body remains flat and readable. Price uses tabular numerals and restrained 700–720 weight rather than an 800-weight billboard.

## Do's and Don'ts

### Do:

- **Do** keep the Paper direction as the default candidate until review selects another palette.
- **Do** use 10px for controls, 12px for media, and 16px for cards and panels.
- **Do** keep main touch controls at least 44px on coarse-pointer devices.
- **Do** verify 4.5:1 normal-text contrast and a visible 2px keyboard focus indicator.
- **Do** show loading, empty, error, invalid, disabled, selected, and long-content states in Storybook.
- **Do** keep Original stories and APIs intact; Codex work lives in its own namespace.

### Don't:

- **Don't** use “her yüzeyi cam yapan ve içerik hiyerarşisini bulanıklaştıran dekoratif glassmorphism.”
- **Don't** use “her öğeyi tam kapsül veya 20–40px radius yapan aşırı yuvarlak Codex görünümü.”
- **Don't** combine “aynı öğede 1px border ile geniş, yumuşak gölgeyi birleştiren ‘ghost card’ kalıbı.”
- **Don't** use “mor-mavi AI gradyanları, rastgele neon vurgular ve birbirinden kopuk tema renkleri.”
- **Don't** build “aynı boyda kart ızgaraları, kart içinde kart ve gereksiz modal katmanları.”
- **Don't** add “durum iletmeyen hareket, %5 ve üzeri hover büyümeleri ve odak göstergesinin gölgede kaybolması.”
- **Don't** allow “aynı işi yapan kontrollerin sayfadan sayfaya farklı görünmesi.”
