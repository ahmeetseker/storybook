---
name: GlassMenu
category: navigasyon
status: hazır
lastReviewed: 2026-07-16
---

# GlassMenu Kuralları

## 1. Amaç

Dropdown aksiyon menüsü: tetikleyiciye bağlı cam panel içinde dikey aksiyon
listesi (Düzenle, Öne Çıkar, Sil…). Aksiyon seçilir seçilmez kapanır.

- **Kullan:** ilan kartı "…" menüsü, sayfa başlığı ikincil aksiyonları,
  satır bazlı işlem menüleri.
- **Kullanma:** form içi değer seçimi (→ Select yok; Açık Kararlar), gezinme
  linkleri listesi (→ GlassNavbar/GlassSidebar), onay gerektiren kalıcı
  diyaloglar (→ Modal).

| İlgili | Farkı |
|---|---|
| GlassTabs | Kalıcı görünüm değiştirici; menü geçici aksiyon listesi |
| GlassIconButton | Yaygın tetikleyici; menünün kendisi değil |

## 2. Semantik sözleşme

- Kök: `position: relative` `div` — panel bu wrapper içinde `absolute`
  (portal **yok**, brief'teki overlay kalıbı).
- Tetikleyici: `isValidElement` ise `cloneElement` ile `aria-haspopup="menu"`
  + `aria-expanded` enjekte edilir (GlassButton/GlassIconButton `...rest`'i
  native butona geçirdiği için doğru öğeye iner).
- Panel: `role="menu"` liste + `GlassMenuItem` = `<button role="menuitem">`,
  `GlassMenuSeparator` = `role="separator"`.
- DOM değişmezleri: (1) menuitem'lar gerçek `<button>`, (2) `aria-expanded`
  yalnız tetikleyicide, (3) panel kapalıyken DOM'da yoktur (AnimatePresence).

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| trigger | ✅ | ReactNode (buton önerilir) | Tıklama toggle; klavye açılışı için focusable olmalı |
| children | ✅ | GlassMenuItem / GlassMenuSeparator | Başka öğe koyma — rol sözleşmesi bozulur |
| item.icon | — | ReactNode | `aria-hidden`; anlamı etiket taşır |

## 4. Public API

**GlassMenu**

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| trigger | prop | `ReactNode` | — (zorunlu) | Relative wrapper'a sarılır; tıklayınca toggle |
| placement | prop | `'bottom-start'\|'bottom-end'\|'top-start'\|'top-end'` | `'bottom-start'` | Panel konumu + transform-origin |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Panel GlassSurface'ine geçer |
| children | prop | `ReactNode` | — (zorunlu) | Item/Separator öğeleri |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | Köke geçer |

**GlassMenuItem**

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| icon | prop | `ReactNode` | — | Sol ikon, `aria-hidden` |
| onSelect | prop | `() => void` | — | Seçimde çağrılır; ardından menü kapanır |
| destructive | prop | `boolean` | `false` | `--lg-danger` renk (Sil vb.) |
| disabled | prop | `boolean` | `false` | Native disabled + `aria-disabled`; gezinti atlar |
| children | prop | `ReactNode` | — (zorunlu) | Etiket |
| ...rest | — | `ButtonHTMLAttributes` (`onSelect` hariç) | — | Item butonuna geçer; `onClick` override edilir — aksiyon için `onSelect` kullan |

**GlassMenuSeparator** — prop almaz.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `placement=bottom-start`, `tone=auto`.

| Yasak / türetilen | Davranış |
|---|---|
| `defaultOpen` / controlled open | ❌ yok — açık/kapalı state içseldir |
| item'a `onClick` | Yok sayılır (içsel handler kazanır) — `onSelect` kullan |
| trigger geçersiz element (string vb.) | aria enjeksiyonu atlanır, tıklama wrapper'dan çalışır |
| panel `size` / `thickness` | ❌ sabit: thickness 0.5, radius `--lg-radius-media` |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel / ARIA |
|---|---|---|---|
| open | içsel `useState` | — | AnimatePresence panel + `aria-expanded="true"` |
| focused item | roving tabIndex (DOM) | — | focus halkası; aktif item `tabIndex=0`, diğerleri `-1` |
| hover (item) | CSS (`hover:hover`) | — | `rgba(255,255,255,.28)` zemin; destructive'de danger %16 |
| disabled (item) | native | hover, seçim, gezinti | opacity .45 |
| destructive | prop | — | `--lg-danger` metin |

## 7. Davranış

- Aç: trigger click (toggle) · trigger'da ArrowDown (ilk item'a focus) ·
  ArrowUp (son item'a focus) · Enter/Space native click üretir → toggle + ilk item.
- Gezin: ArrowDown/ArrowUp (uçlarda sarar, disabled atlanır), Home/End.
- Seç: Enter/Space (native buton aktivasyonu) veya click → `onSelect` + kapan +
  focus trigger'a döner.
- Kapat: Escape (focus trigger'a döner) · dış `pointerdown` (focus dokunulmaz) ·
  Tab (menü focus tuzağı değildir — kapanır, focus doğal akar).
- Animasyon: scale 0.96 + 4px kayma + opacity, 160ms; `prefers-reduced-motion`
  → yalnız opacity. transform-origin placement'a göre.
- Responsive: panel `min-width: 60vw` mobile-first; `/* bp-sm */ 640px`'te
  200px'e iner. Item yüksekliği tek token'dan: `--lg-control-sm` — imleçli
  cihazda 36px, dokunmatikte 44px.

## 8. İçerik

- Etiketler kısa emir kipinde ("İlanı Sil", "Öne Çıkar"); uzun etiket tek
  satırda ellipsis ile kırpılır (`white-space: nowrap`).
- Destructive öğeler listenin sonunda, separator ile ayrılmış olmalı.
- İkon opsiyoneldir; kullanılırsa ya hepsinde ya hiçbirinde (hizalama).
- Boş menü (item'sız children) render edilir ama sözleşme ihlalidir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| panel | radius | `--lg-radius-media` |
| panel offset | top/bottom | `--lg-space-2` |
| list | padding | `--lg-space-1` |
| item | padding / min-height | `--lg-space-2/3` / `--lg-control-sm` (imleçli 36px, dokunmatik 44px) |
| item | font-size / radius | `--lg-text-body` / `--lg-radius-chip` |
| item | focus outline | `--lg-accent` |
| destructive | color | `--lg-danger` |
| separator | background | `--lg-hairline` |

**Borç (raw / mikro-geometri):** hover zemini ve panel min genişliği component
kökünde yerel değişkende toplandı (`.root { --panel-min-width: 200px;
--item-hover-bg: rgba(255,255,255,.28); }`) — hover zemini beyaz-alfa cam
malzeme etkisidir (GlassTabs paritesi), değer değiştirilmedi; `200px`'in token
karşılığı yok. Bilinçli bırakılan: z-index 30 (z ölçeği token'ı yok), geçiş
süresi `0.16s ease` (süre/easing token'ı yok).

**Dokunma hedefi (2026-08-03):** Öğe yüksekliği tek kaynaktan —
`--lg-control-sm` imleçli cihazda 36px, dokunmatikte 44px verdiği için eski
`@media (pointer: coarse) { .item { min-height: var(--lg-control-md) } }`
bloğu gereksizleşti ve KALDIRILDI. Görünmez `::after` taşması bilinçli olarak
EKLENMEDİ: öğeler `--lg-space-1` dolgulu bir listede 1px boşlukla dizili,
dikey taşma komşu hedeflerle üst üste binerdi. Menü satırı tam genişlikte bir
metin hedefidir; 36px yükseklik WCAG 2.2 AA 2.5.8 tabanının (24px) üstündedir.

## 10. Storybook kapsamı

Var: Default, IkonluOgeler (GlassIconButton tetikleyici + bottom-end),
Placements (4'lü matris), DisabledItem, MobilPanel (viewport: mobile1).
**Eksik:** uzun etiket kırpma, klavye akışı interaction story'si,
reduced-motion görseli.

## 11. Test kabul kriterleri

- [x] kapalı başlar; click açar; `aria-haspopup`/`aria-expanded` sözleşmesi
- [x] açılışta ilk item focus; seçim `onSelect` + kapanış + focus trigger'da
- [x] ok/Home/End gezintisi, disabled atlama, roving tabIndex, Escape dönüşü
- [x] trigger'da ArrowDown açar + ilk item focus
- [x] disabled item seçilemez, menü açık kalır
- [x] dış tıklama kapatır
- [ ] Tab ile kapanış + focus akışı (interaction)
- [ ] viewport taşmasında yön çevirme — desteklenmiyor (bkz. kısıtlar)

## 12. Do / Don't

- ✅ Tetikleyici olarak GlassButton/GlassIconButton kullan (aria enjeksiyonu
  native butona iner).
- ✅ Yıkıcı aksiyonu separator'la ayır, `destructive` ver.
- ❌ Item içine link/checkbox koyma — `menuitem` sözleşmesi bozulur.
- ❌ Menüyü form değer seçimi için kullanma (Select değildir).

**Bilinen kısıtlar:** çarpışma tespiti yok — panel viewport'tan taşarsa
placement'ı çağıran değiştirmeli. Portal yok — `overflow: hidden` ata panel
kırpar. Alt menü (submenu) desteklenmiyor. Karakterle arama (typeahead) yok.
**Açık kararlar:** controlled `open` prop'u · GlassSelect ihtiyacı ·
typeahead eklenmesi.

## Changelog

- 2026-07-16: İlk sürüm — cloneElement aria enjeksiyonu, roving tabIndex,
  AnimatePresence panel, dış tıklama/Escape/Tab kapanışı.
- 2026-08-03: Yeni kontrol ölçeğine uyarlandı — gereksizleşen
  `pointer: coarse` yüksekliği kaldırıldı; öğe imleçlide 36px, dokunmatikte
  44px (tek token, `--lg-control-sm`).
