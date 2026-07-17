---
name: GlassFeatureGroup
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassFeatureGroup Kuralları

## 1. Amaç

Gruplu özellik/künye sunumu — sahibinden'in "İç Özellikler / Dış Özellikler"
deseninin genellenmiş hali. Bir veya daha çok başlıklı grup, her grupta
etiket:değer çiftleri ve/veya mevcut-yok (present) işaretli özellik listesi.

- **Kullan:** ilan detayında donanım/özellik künyesi (konut iç-dış özellikler,
  araç güvenlik/konfor donanımı), uzun statik özellik listeleri.
- **Kullanma:** tek düz etiket/değer listesi (grup yok) → `GlassSpecTable`,
  serbest metin açıklama, sıralanabilir/karşılaştırmalı veri.

| İlgili | Farkı |
|---|---|
| GlassSpecTable | Tek grup, başlıksız/tek başlıklı düz `dl`; grup yok |
| GlassSidebar.Group | Navigasyon aç/kapa grubu — cam, tıklanabilir öğeler; bu component içerik/statik |
| GlassChip | Tekil etiket rozeti; bu component çoklu-item grup konteyneri |

## 2. Semantik sözleşme

- Kök: `<div data-variant>` — flat panel (`--lg-surface` + `--lg-hairline`
  çerçeve), cam/backdrop-filter YOK.
- `accordion`: her grup başlığı `<h3>` içinde gerçek `<button aria-expanded
  aria-controls>`; açık gövde `role="region" aria-labelledby={buttonId}`.
  Kapalıyken region DOM'dan kaldırılır (AnimatePresence unmount — GlassSidebar
  `Group` ile aynı desen).
- `checklist`: grup başlığı `<h3>`; ikon grid'i `<ul><li>`; ikon
  `role="img" aria-label="mevcut"|"yok"` — durumu yalnız renk/opaklıkla
  bırakmaz.
- `columns`: grup başlığı **kasıtlı olarak heading DEĞİL** (`<p>` kicker) —
  birden çok grup başlığı doküman ana hattını kirletmesin; öğeler `<dl>`.
- DOM değişmezi: her item tam bir `dt`+`dd` çifti (row/columns) ya da
  `<li>` (checklist grid hücresi) üretir.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| groups[].title | ✅ | `string` | accordion'da buton metni; columns'ta kicker; checklist'te `h3` |
| groups[].items[].label | ✅ | `string` | `dt` / `li` etiketi |
| groups[].items[].value | — | `ReactNode` | verilirse label:value satırı — variant'tan bağımsız |
| groups[].items[].present | — | `boolean` | `value` yoksa ✓/✕ ikonu; checklist'te grid, diğerlerinde satır ikonu |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| groups | prop | `GlassFeatureGroupSection[]` | — (zorunlu) | — | Sıra verilen dizinin sırasıdır |
| variant | prop | `'accordion'\|'checklist'\|'columns'` | `'accordion'` | — | Sunum biçimi |
| columns | prop | `1\|2` | `1` | — | Yalnız `variant="columns"`; diğerlerinde yok sayılır |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | — | `className` birleştirilir; kök `div`'e geçer |

Ref hedefi: yok (forwardRef uygulanmadı — statik içerik component'i, diğer
içerik component'leriyle tutarlı — bkz. GlassSpecTable/GlassVitrin).
Event sözleşmesi: yok; accordion aç/kapa dahili state'tir, dışarı event
yayınlanmaz (spec'te controlled istenmedi).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant='accordion'`, `columns=1` (yalnız columns
variant'ında anlamlı).

| Kural | Davranış |
|---|---|
| `variant='accordion'` | İlk grup (`index 0`) varsayılan açık, diğerleri kapalı; her grup bağımsız aç/kapa |
| `variant='checklist'` | Grup içi item'lar `value`'ya göre ikiye ayrılır: `value` yoksa ızgara, varsa satır |
| `variant='columns'` + `columns=2` | Her grubun `dl`'i satır-yönlü iki sütuna diziliv (GlassSpecTable ile aynı CSS deseni) |
| `columns` + `variant≠'columns'` | Yok sayılır — accordion/checklist her zaman tek sütun satır |

Yasak kombinasyon yok — üç variant birbirini dışlar (birleşik variant yok).

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| accordion açık/kapalı | dahili `useState` (grup başına) | — | `aria-expanded` (buton), `role="region"` (gövde, yalnız açıkken DOM'da) |

Checklist/columns: N/A — tamamen statik, hover/focus/active/disabled/selected
yok. `present` boole'u state değil veri türevi — ikon rengi/etiketi ondan
türer, kullanıcı etkileşimiyle değişmez.

## 7. Davranış

- Accordion: buton tıklaması `setOpen` toggle'lar; `motion` height/opacity
  geçişi (`prefers-reduced-motion: reduce`'ta anında). Klavye: buton native
  `<button>` — Enter/Space ile aç/kapa, Tab sırası DOM sırasıdır.
- Checklist/columns: etkileşimsiz; focus yalnız `value` içine konan
  odaklanabilir öğelere gider.
- Responsive: `checklistGrid` `auto-fill minmax(150px,1fr)` ile kendiliğinden
  sütun düşürür; `columns` grid'i sabittir (dar container'da `columns=1`
  vermek çağıranın işi — GlassSpecTable ile aynı kısıt).

## 8. İçerik kuralları

- `label` `dt`'de `nowrap`; uzun TR bileşik kelimeler checklist `li`
  içinde sarar (`overflow-wrap: anywhere`), `dt`'de sarmaz — etiketi kısa tut.
- Boş `items` dizisi olan grup: accordion boş region render eder (başlık
  kalır), checklist ne grid ne satır göstermez (yalnız `h3`), columns boş
  `dl` gösterir — çağıran boş grubu listeye koymamalı.
- Ne `value` ne `present` verilen item: eksik veri asla "mevcut" gibi
  sunulmaz. Satır düzeninde (accordion/columns) `dd` boş kalır — hiç ikon
  render edilmez. Checklist grid'inde nötr soluk `—` işaretleyici gösterilir
  (`aria-hidden`, `role="img"` DEĞİL — isimsiz/aria-label'sız `img` rolü
  üretilmez); yalnız `present` tanımlıysa `role="img"` + `aria-label`
  ("mevcut"/"yok") ile ✓/✕ ikonu üretilir (data eksikliği; çağıranın
  sorumluluğu görsel olarak da ayırt edilir).
- Değer biçimlendirme (binlik ayraç, birim, "TL") çağıranın işidir.
- `groups[].title` render sırasında React `key` olarak kullanılır (yalnız
  `title`, index değil) — sıralama değişse bile grup kimliği (ör. accordion
  aç/kapa state'i) korunur. **Grup başlıkları aynı `groups` dizisi içinde
  benzersiz olmalı**; tekrar eden başlık key çakışmasına ve state
  karışmasına yol açar.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | background / border / radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` |
| ayraçlar (grup arası, satır arası) | border-color | `--lg-hairline` |
| accordion trigger | min-height | `--lg-control-lg` |
| accordion başlık | font-size | `--lg-text-headline` |
| columns kicker | font-size | `--lg-text-footnote` |
| presence ikonu (mevcut) | color / background | `--lg-success` + `color-mix` |
| presence ikonu (yok) | color / background | `--lg-label-secondary` / `--lg-label` + `color-mix` |
| ikon/rozet radius | border-radius | `--lg-radius-capsule` |
| focus halkası | outline | `--lg-accent` |

Borç: chevron ikonu 8×8px + 2px kenarlık raw (GlassSidebar chevron'uyla aynı
kabul edilen mikro-ölçek deseni) · checklist grid `minmax(150px,1fr)` ve
`gap` değerleri raw · `presenceIcon`/`checklistIcon` 18-20px boyutları raw.

## 10. Storybook kapsamı

Var: Default (accordion), Playground, Accordion, Checklist, Columns,
UzunIcerik, Erişilebilirlik (docs description'lı). **Eksik:** Sizes (N/A —
`size` ekseni yok), Responsive (ayrı story — dar container her variant
story'sinde `maxWidth` ile zaten örtük test ediliyor), Temalar (toolbar'la
manuel).

## 11. Test kabul kriterleri

- [x] accordion: ilk grup açık, diğerleri kapalı (unit)
- [x] accordion: toggle `aria-expanded` günceller + region görünür/kaybolur (interaction)
- [x] accordion: region `aria-labelledby` → buton id eşleşir (unit)
- [x] checklist: present true/false → `role="img"` "mevcut"/"yok" (unit/a11y)
- [x] checklist: `value` verilen item ayrıca satır olarak render olur (unit)
- [x] columns: grup başlığı heading DEĞİL (a11y regresyon)
- [x] columns: `columns=2` → `twoColumns` sınıfı (unit)
- [x] checklist: ne `value` ne `present` verilen item ✓ çizmez, isimsiz
  `role="img"` üretmez (regresyon)
- [x] accordion: grup sırası değişince `title` bazlı key sayesinde aç/kapa
  state'i korunur (regresyon)
- [ ] checklist ızgara `auto-fill` kırılımı (visual)
- [ ] accordion motion height geçişi + reduced-motion (visual)

## 12. Do / Don't

- ✅ Aynı grup içinde `value`'lu ve `present`'li item'ları serbestçe karıştır
  — component ikisini de aynı grupta ayrıştırır (checklist).
- ✅ Uzun donanım listelerinde (10+ item) `accordion`; kısa sabit özet
  künyesinde `columns`.
- ❌ `columns` prop'unu `accordion`/`checklist` ile birlikte anlamlı sayma —
  yok sayılır, kafa karıştırmasın diye Storybook'ta not düşüldü.
- ❌ Grup başlığını boş bırakma — accordion'da erişilebilir buton adı,
  checklist'te `h3`, columns'ta kicker kaynağıdır.

**Bilinen kısıtlar:** accordion tek-açık (exclusive) modu yok — her grup
bağımsız · checklist/columns responsive kırılımı sınırlı (auto-fill/sabit
grid) · dış `columns` prop'u yalnız `variant='columns'`'ta anlamlı, ikisini
ayrı prop'lara bölmek (ör. `variant`'a özel alt-prop) değerlendirilmedi.

**Açık kararlar:** accordion'da exclusive (tek grup açık) modu · checklist
ikonunun SVG tik/çarpıya taşınması (şu an Unicode `✓`/`✕`).

**Changelog:**
- 2026-07-17 — İlk sürüm: üç variant (accordion/checklist/columns),
  dalga1 kontratı (`.superpowers/sdd/dalga1-kontrat.md`) uyarınca flat içerik
  katmanı, cam yok.
- 2026-07-17 — Code review fix: checklist grid'inde `value`+`present` ikisi
  de eksikken artık ✓ çizilmiyor ve isimsiz `role="img"` üretilmiyor (nötr
  soluk `—` işaretleyici); grup render key'i `${title}-${index}`'ten yalnız
  `title`'a düşürüldü (sıralama değişiminde açık/kapalı state korunur, bkz.
  §8 "Grup başlıkları benzersiz olmalı").
