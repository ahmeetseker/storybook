---
name: GlassContextMenu
category: overlay
status: hazır
lastReviewed: 2026-07-16
---

# GlassContextMenu Kuralları

## 1. Amaç

Sağ tıklamayla imleç koordinatında açılan komut menüsü: bir içerik nesnesine
(ilan kartı, satır, görsel) hızlı ikincil aksiyonlar sunar. Masaüstü desenidir.

- **Kullan:** ilan kartında düzenle/öne çıkar/sil, tablo satırı aksiyonları,
  galeri görseli komutları.
- **Kullanma:** birincil gezinme (→ görünür buton/menü), dokunmatik-ana akış
  (→ görünür "..." + GlassMenu), form seçimi (→ Select).

| İlgili | Farkı |
|---|---|
| GlassPopover | Tetikleyiciye bağlı non-modal dialog; serbest içerik |
| GlassMenu (planlanan) | Görünür tetikleyicili menü; dokunmatik alternatifi |

## 2. Semantik sözleşme

- Panel: `role="menu"` + `aria-orientation="vertical"`; öğeler `role="menuitem"`
  olan gerçek `<button>`'lar (`tabIndex={-1}`, roving focus).
- Disabled öğe: native `disabled` + `aria-disabled="true"` — ok gezinmesi atlar.
- Ayraç: `role="separator"`.
- Sarmalayıcı div `onContextMenu`'da `preventDefault` yapar — tarayıcı menüsünü
  alan içinde bastırır.
- Panel portal'sızdır; `position: fixed` ile imleç koordinatında açılır.
  **Uyarı:** transform/filter'lı bir ata `fixed`'in referansını değiştirir —
  böyle bir kapsayıcı içinde kullanma.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children | ✅ | ReactNode | Sağ tıklanabilir alan |
| item.icon | — | ReactNode | 1.1em kutu, dekoratif (`aria-hidden`) |
| item.label | ✅ | string | Tek satır, taşarsa ellipsis |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| items | prop | `GlassContextMenuItem[]` | — | Menü tanımı |
| children | prop | `ReactNode` | — | Sağ tıklanabilir alan |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | GlassSurface'e geçer |
| ...rest | — | `HTMLAttributes<div>` | — | Sarmalayıcı div'e |

`GlassContextMenuItem`: `{ label: string; icon?: ReactNode; onSelect?(): void;`
`disabled?: boolean; destructive?: boolean; separatorBefore?: boolean }`

## 5. Seçenek eksenleri

- `destructive` yalnız renk (danger) — davranış farkı yok; onay gerekiyorsa
  `onSelect` içinde Modal aç.
- `separatorBefore` ilk öğede yok sayılır (menü ayraçla başlamaz).
- Açıkken tekrar sağ tıklama menüyü yeni koordinata taşır.

## 6. State modeli

| State | Kaynak | Görsel |
|---|---|---|
| kapalı | iç state | Panel DOM'da yok |
| açık | contextmenu olayı | scale .97→1 + fade (origin: sol üst), çıkış yalnız fade |
| hover/focus öğe | CSS / roving focus | currentColor %10 zemin / iç accent halka |
| disabled öğe | prop | opacity .45; gezinmede atlanır |
| reduced-motion | media query | Yalnız opacity |

## 7. Davranış

- Açılış: imleç koordinatı; panel ölçüldükten sonra viewport'a clamp
  (8px marj, `getBoundingClientRect` ile `useLayoutEffect`'te düzeltme).
- Açılınca ilk aktif öğe focus alır.
- Klavye: ↑/↓ sarmalı gezinir (disabled atlanır), Home/End uçlara, Enter/Space
  seçer (native buton), Escape kapatır, Tab menüyü kapatır.
- Kapatma: Escape, dış `pointerdown`, herhangi bir scroll (capture), seçim.
- Kontrollü mod yok — menü tamamen kendi state'ini yönetir (bilinçli karar).

## 8. İçerik

Etiketler emir kipinde kısa fiil öbeği ("İlanı Düzenle"). 7±2 öğeyi aşma;
gruplama gerekiyorsa `separatorBefore`. Yıkıcı öğe en sonda, ayraçla ayrılmış.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| panel | radius | 14 ← `--lg-radius-media` |
| panel | padding | `--lg-space-2` |
| item | min-height | `--lg-control-sm` (coarse'ta 36px) |
| item | radius | `--lg-radius-chip` |
| item | font-size | `--lg-text-body` |
| destructive | color | `--lg-danger` |
| separator | background | `--lg-hairline` |
| focus | outline | `--lg-accent` (iç, -2px offset) |

**Borç (mikro-geometri):** panel `min-width` (200px) token karşılığı
olmadığından component kökünde yerel değişkende toplandı
(`.area { --menu-min-width: 200px; }` — `.positioner` portal'sız `.area`
çocuğu olduğundan miras işler); viewport taşma marjı
`calc(100vw - var(--lg-space-4))` token'a bağlandı (birebir 16px).

## 10. Storybook kapsamı

Var: Default, ItemStates (disabled/destructive/separator), WithoutIcons,
Mobile (viewport: mobile1 — davranış değişmediğini belgelemek için).
**Eksik:** viewport kenarı clamp görseli, RTL.

## 11. Test kabul kriterleri

- [x] contextmenu ile açılır; role menu/menuitem; ilk öğe focus
- [x] Seçim onSelect + kapanma
- [x] disabled: aria-disabled, seçilemez, gezinmede atlanır
- [x] Ok tuşları sarmalı gezinme
- [x] Escape ve dış tıklama kapatır
- [x] separator/destructive/aria-orientation sözleşmesi
- [ ] Viewport clamp (jsdom rect 0 döndürdüğü için visual/e2e)

## 12. Do / Don't

- ✅ Menüdeki her komutun görünür bir eşdeğerini de sun (keşfedilebilirlik).
- ✅ Yıkıcı aksiyonu ayraç + `destructive` ile ayır.
- ❌ Transform'lu (ör. motion scale uygulanmış) kapsayıcı içine koyma — fixed kayar.
- ❌ Alt menü/checkbox item bekleme — düz komut listesiyle sınırlıdır.

**Açık kararlar:** Dokunmatikte **long-press yok** — bu masaüstü deseni mobilde
davranış değiştirmez; dokunmatik alternatifi (görünür "..." butonu + GlassMenu)
çağıranın sorumluluğudur. Kontrollü `open` prop'u bilinçli verilmedi (kullanım
senaryosu yok, API'yi şişirir). Alt menü desteği kapsam dışı.

## Changelog

- 2026-07-16: İlk sürüm — imleç koordinatlı fixed panel, viewport clamp,
  roving focus'lu tam klavye deseni, long-press'siz dokunmatik kararı.
