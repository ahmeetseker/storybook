---
name: GlassTooltip
category: görüntüleme
status: hazır
lastReviewed: 2026-07-16
---

# GlassTooltip Kuralları

## 1. Amaç

Hover/focus'ta beliren kısa, tamamlayıcı açıklama paneli. Küçük koyu flat
yüzeydir — bilinçli olarak cam DEĞİL: küçük punto metnin arkasında refraction
ve saydamlık okunabilirliği bozar.

- **Kullan:** kısaltılmış değerin tam hali, ikon butonun ek açıklaması,
  "neden?" tipi tek cümlelik bağlam (fiyat analizi, doğrulama rozeti).
- **Kullanma:** kritik/aksiyon gerektiren bilgi (dokunmatikte HİÇ görünmez),
  etkileşimli içerik (→ Popover, henüz yok), form hata mesajı (→ inline metin),
  tetikleyicinin accessible name'i (o `aria-label`'ın işidir).

| İlgili | Farkı |
|---|---|
| GlassBadge | Kalıcı görünür etiket; tooltip geçicidir |
| native `title` attr | Stilsiz, gecikmesi kontrol edilemez; kullanma |

## 2. Semantik sözleşme

- Sarmalayıcı: `<span>` (`position: relative; display: inline-flex`) —
  event'ler bu span üstündedir, `children` klonlanmaz (**cloneElement yok**).
- Panel: `role="tooltip"` + benzersiz `id`; açıkken tetikleyicinin KENDİSİNE
  (span'in ilk element çocuğu) `aria-describedby` DOM üstünden yazılır,
  kapanınca kaldırılır.
- `content` description'dır, accessible name değil.
- DOM değişmezleri: (1) tetikleyici her zaman span'in ilk element çocuğudur,
  (2) panel span'in içinde `position: absolute` konumlanır (portal yok).

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children | ✅ | tek `ReactElement` | Klavye erişimi için odaklanabilir öğe tercih et (buton/link) |
| content | ✅ | `ReactNode` | Kısa; 240px max-width'te sarar; etkileşimli öğe koyma |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| content | prop | `ReactNode` | — (zorunlu) | Panel içeriği |
| placement | prop | `'top'\|'bottom'\|'left'\|'right'` | `'top'` | Basit konumlama; collision detection YOK |
| delay | prop | `number` | `300` | Hover açılış gecikmesi (ms); focus anında açar, kapanış anında |
| children | prop | `ReactElement` | — (zorunlu) | Tek tetikleyici |
| ...rest | — | `HTMLAttributes<HTMLSpanElement>` | — | Sarmalayıcı span'e geçer (event handler'larımız rest'i ezer) |

Event sözleşmesi: dışa event yok. İç event'ler: `mouseenter` (delay ile açar),
`mouseleave`/`blur`-dışarı (anında kapatır), `focus` (anında açar),
document `keydown` Escape (anında kapatır).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `placement=top`, `delay=300`.

| Yasak / türetilen | Davranış |
|---|---|
| dokunmatik (pointer: coarse) | Tooltip hiç açılmaz — JS `matchMedia`, CSS gizleme değil; long-press YOK |
| controlled `open` prop | ❌ bilinçli yok — tooltip tamamen hover/focus güdümlüdür |
| tone/tint | ❌ — panel her temada ters kontrast (`--lg-label` zemin + `--lg-bg` metin) |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| kapalı | default | — | Panel DOM'da yok |
| bekliyor | hover + timer | — | Görsel değişiklik yok (delay dolmadan ayrılırsa iptal) |
| açık | timer doldu / focus | — | Fade + 2px translate ile belirir |
| coarse | cihaz | tümü | Hiç açılmaz; children normal render edilir |

## 7. Davranış

- Keyboard: tetikleyici odak alınca anında açılır, odak çıkınca kapanır;
  **Escape** her durumda kapatır (document listener, yalnız açıkken takılı).
- `prefers-reduced-motion`: translate yok, yalnız opacity; süre 0.
- Touch: `pointer: coarse` cihazda gösterilmez (lazy `useState(isCoarsePointer)`
  — cihaz sınıfı oturum içinde değişmez). Kritik bilgiyi tooltip'e koyma.
- Panel `pointer-events: none` — hover hedefi değildir, altındaki öğeyi bozmaz.
- Konumlama: CSS `translate` özelliğiyle merkezleme (motion'ın `transform`'uyla
  çarpışmaz); collision detection yok, kenara yakın tetikleyicide placement'ı
  çağıran seçer.

## 8. İçerik

Tek cümle, nokta olmadan; 240px'te sarar. Tooltip'te link/buton olmaz
(`pointer-events: none` zaten engeller). Tetikleyici metniyle aynı bilgiyi
tekrarlama.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| panel | background | `--lg-label` (ters kontrast) |
| panel | color | `--lg-bg` |
| panel | font-size | `--lg-text-footnote` |
| panel | radius | `--lg-radius-chip` |
| panel | padding | `--lg-space-1` / `--lg-space-2` |
| panel | offset | `--lg-space-2` (8px tetikleyici mesafesi) |

Borç: gölge raw rgba — GlassSurface gölge sistemine bağlanması değerlendirilecek.

## 10. Storybook kapsamı

Var: Default, Placements, Delays, OnBadge, LongContent, TouchDevice
(viewport: mobile1 — gerçek coarse davranışı cihaz emülasyonu ister).
**Eksik:** forced-hover görselleri, RTL.

## 11. Test kabul kriterleri

- [x] başlangıçta panel yok
- [x] hover delay'e uyar (299ms'te kapalı, 300ms'te açık)
- [x] focus anında açar + `aria-describedby` tetikleyiciye yazılır
- [x] Escape kapatır + `aria-describedby` kalkar (klavye)
- [x] blur (odak dışarı) kapatır
- [x] coarse pointer'da hiç açılmaz
- [ ] placement görselleri (visual)

## 12. Do / Don't

- ✅ Tetikleyici olarak odaklanabilir öğe kullan (klavye kullanıcısı da görsün).
- ✅ Dokunmatikte de erişilmesi gereken bilgiyi görünür metin olarak ver.
- ❌ `content`'e etkileşimli öğe koyma (erişilemez).
- ❌ Tooltip'i accessible name yerine kullanma (`aria-label` ver).
- ❌ İç içe tooltip / tooltip içinde tooltip.

**Açık kararlar:** collision detection (kenar taşması) ihtiyacı · etkileşimli
içerik için ayrı Popover component'i.

## Changelog

- 2026-07-16: İlk sürüm — placement/delay API'si, coarse-pointer'da kapalı,
  DOM üstünden aria-describedby, Escape + blur kapatma.
