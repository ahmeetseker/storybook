---
name: GlassTabs
category: navigasyon
status: hazır
lastReviewed: 2026-07-15
---

# GlassTabs Kuralları

## 1. Amaç

Kapsül cam sekme çubuğu + tek görünür içerik paneli: aynı bağlamın alternatif
görünümleri arasında geçiş. Sekme çubuğu **kontrol katmanıdır ve her zaman cam
kalır**; `material` prop'u yalnız içerik paneline uygulanır.

- **Kullan:** ilan/detay sayfasında bölüm geçişi (Açıklama / Özellikler / Konum),
  aynı verinin alternatif sunumları.
- **Kullanma:** uygulama düzeyi ana navigasyon (→ `GlassTabBar`), sayfalar arası
  yönlendirme (→ router linkleri), tek panel (sekme gereksiz).

| İlgili | Farkı |
|---|---|
| GlassTabBar | Dikey, ikonlu, uygulama düzeyi; panel render etmez; controlled-only |
| GlassSegmentedControl (yok) | Değer seçimi olurdu; Tabs içerik gösterir — bkz. Açık Kararlar |

## 2. Semantik sözleşme

- Kök: düz `<div>`; içinde `GlassSurface`(bar) + `GlassSurface`(panel).
- ARIA: `role="tablist"` > `role="tab"` (`<button type="button">`) ve
  `role="tabpanel"`; `useId` tabanlı `aria-controls`/`aria-labelledby` çiftleri,
  seçili sekmede `aria-selected="true"`.
- Yalnız aktif panel DOM'dadır (koşullu render) — gizli panel yok.
- Accessible name: sekme = `label` metni; panel = aktif sekmenin başlığı
  (`aria-labelledby`). Portal kullanılmaz.
- DOM değişmezleri: (1) tab'lar gerçek `<button type="button">` kalır,
  (2) tablist camın *içindedir*, cam elementin kendisi role almaz.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| tabs[].label | ✅ | `string` | Tek satır (`white-space: nowrap`); taşarsa liste yatay kayar (scrollbar gizli) |
| tabs[].content | ✅ | `ReactNode` | Panel içine olduğu gibi basılır; padding panelden gelir (20px) |
| bar | otomatik | GlassSurface capsule, `thickness=0.25` | Her zaman cam; `material`'dan etkilenmez |
| panel | otomatik | GlassSurface `shape=20`, `thickness=0.4` | `material` yalnız burayı değiştirir |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| tabs | prop | `GlassTabItem[]` (`{id, label, content}`) | — (zorunlu) | — | Sekme tanımları |
| activeId | prop | `string` | — | ✅ | Verilirse iç state devre dışı |
| defaultActiveId | prop | `string` | ilk sekmenin id'si | uncontrolled | Başlangıç sekmesi |
| onTabChange | prop | `(id: string) => void` | — | — | Her sekme tıklamasında (iki modda da) |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | — | İki GlassSurface'e geçer |
| material | prop | `'glass'\|'flat'` | `undefined` (→ Surface default `glass`) | — | **Yalnız panel**; bar cam kalır |
| ...rest | — | `Omit<HTMLAttributes<HTMLDivElement>,'onChange'>` | — | — | Kök div'e |

Ref hedefi yok (forwardRef kullanılmaz — bkz. Açık Kararlar). Event sözleşmesi:
`onTabChange` zaten seçili sekmeye tekrar tıklanınca da çağrılır (kodda eşitlik
kontrolü yok).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `tone=auto`, panel `material=glass`, ilk sekme aktif.

| Kural / türetilen | Davranış |
|---|---|
| `activeId` bilinmeyen id | Panel ve seçim ilk sekmeye düşer (`find ?? tabs[0]`) |
| `activeId` + `defaultActiveId` birlikte | `activeId` kazanır; default yok sayılır |
| `material="flat"` | Bar yine cam — kontrol/içerik katman kuralı |
| `size` ekseni | Yok — tek boyut (bkz. Borç: raw padding) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| selected | prop/iç state | — | `aria-selected` + `tabIndex=0` (diğerleri `-1`) |
| hover | CSS `:hover` | — | opacity 0.7 → 1 |
| focus-visible | CSS | — | 2px `--lg-accent` outline |
| active (basılı) | — | — | Yok — basınç animasyonu yok (bilinçli: sekme hafif kontrol) |
| disabled | — | — | Sekme bazında disabled desteklenmiyor (Açık Kararlar) |

Katman sırası: value (selected `background`) → interaction (hover opacity).

## 7. Davranış

- Pointer: tıklama seçer; uncontrolled'da iç state güncellenir, controlled'da
  yalnız `onTabChange` bildirilir (test: activeId sabitken içerik değişmez).
- Keyboard (WAI-ARIA tabs deseni): ArrowRight/Down ve ArrowLeft/Up sarmalı
  gezinir, Home/End uçlara gider; seçim focus'u izler (roving tabindex).
  Testle güvence altında.
- Focus akışı: Tab → aktif sekme → panel içeriği.
- Dar container: `.list` yatay kayar (`overflow-x: auto`, scrollbar gizli);
  bar `max-width: 100%` ile taşmaz.
- Async / overlay: N/A — senkron, portal yok.
- Touch: `.tab` her ortamda `min-height: var(--lg-control-md)` (44px) taşır —
  fare/dokunmatik ayrımı yok, sekme her zaman gerçek bir dokunma hedefidir
  (Chip'in aksine, sekme yoğunluk kaygısı taşımaz).

## 8. İçerik kuralları

- Sekme etiketi tek satır, kırpılmaz; uzun TR kelimede liste kayar. Etiketleri
  1–2 kelime tut.
- `tabs=[]` boş dizi: bar boş render olur, panel render edilmez (`current` yok) —
  çağıran boş dizi vermemeli.
- İkon desteği yok (`label: string`); ikon gerekiyorsa API genişletilmeli.
- Panel içeriği serbest; tipografi mirası panelden (15px / 1.55).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| tab | focus outline | `--lg-accent` (fallback `#0a84ff`) | yalnız focus-visible |
| bar/panel | cam görünümü | GlassSurface'ten (`thickness`, `tone`) | — |
| tab | font | miras (`font: inherit`) | — |

**Borç (raw değerler):** `.root { --root-gap: var(--lg-space-3);
--list-gap: 2px; --tab-pad-inline: var(--lg-space-4);
--tab-font-size: var(--lg-text-footnote); }` — `--root-gap`/`--tab-pad-inline`/
`--tab-font-size` artık birebir token'a bağlı (2026-07-30); yerel değişken
yalnız isimlendirme kolaylığı için kalır. `--list-gap: 2px` token karşılığı
olmadığından raw kalır (ölçek en küçük adımı 4px, 2px daha ince bir ayrım).
`.tab` artık `min-height: var(--lg-control-md)` taşır — dokunma hedefi her
ortamda garanti (bkz. §7 Davranış). Bağlananlar: bar `padding` →
`--lg-space-1`, tab dikey padding → `--lg-space-2`, tab radius →
`--lg-radius-capsule`, panel `padding` → `--lg-space-5`, panel font →
`--lg-text-body`. Aktif zemin `rgba(255,255,255,0.28)` bilinçli beyaz-alfa
malzeme etkisi — token'a bağlanmadı; panel `shape={20}` sayısal (değer
`--lg-radius-card`'a eşit ama token'dan okunmuyor — `.tsx` bu fazın kapsamı
dışında); geçiş süresi/easing (`0.18s ease`) süre token'ı olmadığından raw.

## 10. Storybook kapsamı

Var: **Default** (3 sekme, uncontrolled) · **Controlled** (`activeId='konum'`) ·
**Materials** (glass/flat panel yan yana; bar iki örnekte de cam) ·
**UzunIcerik** (6 sekme + uzun TR etiket, yatay kaydırma) · **DarContainer**
(280px; bar taşmaz, liste kayar). **Eksik:** Playground (Controls) · States
(forced hover/focus) · Responsive (coarse pointer) · Temalar (Kağıt/Grafit) ·
Erişilebilirlik (focus sırası). Sizes: N/A — `size` ekseni yok.

## 11. Test kabul kriterleri

- [x] İlk sekme varsayılan açık, yalnız aktif panel DOM'da (unit)
- [x] Tıklama içerik değiştirir + `onTabChange` doğru id ile (interaction)
- [x] Controlled: `activeId` belirleyici, tıklama içerik değiştirmez
- [x] `defaultActiveId` uncontrolled başlangıcı belirler
- [ ] `aria-controls`/`aria-labelledby` id eşleşmesi (a11y)
- [ ] Ok tuşu navigasyonu (önce implement edilmeli)
- [ ] `material="flat"` yalnız paneli değiştirir, bar `data-material="glass"` kalır
- [ ] Dar container'da yatay kaydırma (visual)

## 12. Do / Don't

- ✅ Sayfa içinde tek GlassTabs; sekmeler aynı bağlamın görünümleri olsun.
- ✅ İçerik katmanına oturuyorsa `material="flat"` ver — bar zaten cam kalır.
- ❌ Sekmeyi router navigasyonu için kullanma; URL değişiyorsa link kullan.
- ❌ Boş `tabs` dizisi verme.
- ❌ `onTabChange` içinde aynı id'ye karşı guard'a güvenme — tekrar tıklamada da çağrılır.

**Bilinen kısıtlar:** sekme bazında `disabled` yok · ikon desteği yok · panel
geçiş animasyonu yok (anlık swap).

**Açık kararlar:** `forwardRef` eklenmeli mi · tekrar tıklamada `onTabChange`
bastırılmalı mı · `size` ekseni gerekli mi.

**Changelog:**
- 2026-07-15 — ilk sözleşme, koddan çıkarıldı.
- 2026-07-15 — ok tuşu navigasyonu eklendi (ArrowLeft/Right/Up/Down sarmalı,
  Home/End; seçim focus'u izler) + test.
- 2026-07-30 — `.tab`'a `min-height: var(--lg-control-md)` eklendi (dokunma
  hedefi eksikti, ~37px'te kalıyordu); `--tab-font-size`/`--root-gap`/
  `--tab-pad-inline` token'a bağlandı (`--lg-text-footnote`/`--lg-space-3`/
  `--lg-space-4`).
