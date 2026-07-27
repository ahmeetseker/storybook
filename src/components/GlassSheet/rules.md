---
name: GlassSheet
category: overlay
status: hazır
lastReviewed: 2026-07-16
---

# GlassSheet Kuralları

## 1. Amaç

Alttan yükselen yarım sayfa **cam** panel: tutamaçtan çekilerek duraklar
(detent) arasında büyür; yükseldikçe opaklaşır ve blur'u artar ("kalınlaşma").
Bağlamı koparmadan ikincil içerik sunar.

- **Kullan:** filtreler, seçenek listeleri, bağlam koparmayacak akışlar.
- **Kullanma:** tek boyutlu yan/alt panel (→ `GlassDrawer`), onay/karar
  diyaloğu (→ `GlassModal`), 2–3 satırlık bilgi (→ `GlassPopover`).

| İlgili | Farkı |
|---|---|
| GlassDrawer | Flat yüzey, sabit boyut, sürükleme yok |
| GlassModal | Ortalanmış karar diyaloğu; boyut içerikten gelir |

## 2. Semantik sözleşme

- Panel: `role="dialog"` + `aria-modal="true"`; `title` → `aria-labelledby`,
  yoksa `ariaLabel` **zorunlu** (union type ile derleme zamanı garanti).
- Tutamaç: gerçek `<button aria-label="Panel boyutu">`; görsel bar `aria-hidden`.
- Portal `document.body`'ye; scroll kilidi + focus trap + kapanışta
  tetikleyiciye focus dönüşü (GlassDrawer/GlassModal sözleşmesi).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| grabber | sabit | Tutamaç şeridi | Her zaman ilk çocuk; kaldırılamaz |
| title | ✅* | `<h2>` | *ariaLabel verilirse opsiyonel |
| description | — | Soluk satır | `aria-describedby` |
| children | ✅ | Gövde | Kendi içinde kayar (`overscroll-behavior: contain`) |

## 4. Public API

| Ad | Type | Default | Açıklama |
|---|---|---|---|
| open | `boolean` | — | Yalnız controlled |
| onClose | `() => void` | — | Escape/backdrop/aşağı çekme isteği |
| detents | `number[]` | `[0.45, 0.88]` | Viewport oranları, artan sırada |
| defaultDetent | `number` | `0` | Açılış durağı index'i |
| onDetentChange | `(index: number) => void` | — | Durak değişince |
| dismissible | `boolean` | `true` | false: yalnız programatik kapanış |
| title / ariaLabel | union | — | Accessible name garantisi |
| description | `string` | — | — |

Event sözleşmesi: `onDetentChange` yalnız durak **değiştiğinde** çalışır;
aynı durağa dönen sürükleme çağırmaz. `onClose` kapanış *isteğidir* — state'i
çağıran günceller.

## 5. Seçenek eksenleri

`size` yok — boyut `detents` ile ifade edilir. Yalnız alttan açılır
(HIG sheet kalıbı); yan kenar gerekiyorsa `GlassDrawer`.

## 6. State modeli

| State | Kaynak | Görsel |
|---|---|---|
| durak (detent) | iç state + `defaultDetent` | Yükseklik + `--sheet-t` kalınlık |
| dragging | pointer | transition kapalı, yükseklik parmağı izler |
| focus-visible | CSS | İç kenarda halka (panel taşmaz) |

## 7. Davranış

- **Sürükleme:** tutamaç pointer capture alır; bırakınca en yakın durağa
  oturur. En küçük durağın **80px** altına çekilirse ve `dismissible` ise kapanır.
  En büyük durağın üstüne çekilemez (clamp).
- **Klavye (tutamaç):** ArrowUp bir üst durak; ArrowDown bir alt durak,
  en alttayken kapanış (dismissible ise). Escape her yerden kapatır.
- **Kalınlaşma:** `--sheet-t` (0=en küçük durak, 1=en büyük) cam opaklığını
  %72→%96 ve blur'u 14→24px ölçekler; gölge de koyulaşır.
- **Motion:** giriş/çıkış `y: 100%` spring (`presets.springs.sidebar`);
  duraklar arası yükseklik geçişi CSS transition. `prefers-reduced-motion`:
  giriş/çıkış yalnız opacity, durak geçişi anında.

## 8. İçerik kuralları

Gövde uzunsa kendi içinde kayar — panel yüksekliği durakların sözüdür.
Başlık kısa isim ("Filtreler"); durak sayısı 2–3'ü geçmemeli.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| panel | radius | `--lg-radius-card` (üst köşeler) |
| panel | background | `--lg-surface` × `--sheet-t` karışımı |
| başlık/açıklama/gövde | font | `--lg-text-title/footnote/body` |
| tutamaç barı | renk | `--lg-label` %25 |
| focus | outline | `--lg-accent` |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler component
kökünde yerel değişkene toplandı — `.root { --backdrop-blur: 8px;
--grabber-min-h: 28px; --grabber-bar-w: 36px; --grabber-bar-h: 5px;
--sheet-max-w: 560px; --sheet-side-inset: 48px; }` (tutamaç 28px kontrol
ölçeğine uymuyor — control token'ı verilmedi; 48px kenar payı boşluk
ölçeğinde yok ve kontrol geometrisi değil). Bilinçli bırakılanlar:
`z-index: 1000` raw (GlassDrawer ile aynı — z-scale token'ı yok) · backdrop
`rgba(0,0,0,.4)` raw (--lg-scrim alfa .55 ile birebir değil, overlay scrim
token'ı bekliyor) · kalınlaşan panel gölgesi
`0 -12px 48px rgba(0,0,0,calc(...))` component'e özgü dinamik desen — hiçbir
gölge token'ıyla eşleşmez, dokunulmadı · kalınlaşma katsayıları (72/24,
14/10) ve duraklar arası `height` transition'ı (`0.38s
cubic-bezier(0.32,0.72,0,1)`) bilinçli istisna (bkz. Açık kararlar) —
süre/easing token'ı da yok.

## 10. Storybook kapsamı

Var: Default, ThreeDetents, OpensLarge, NonDismissible, Mobile (viewport).
Playground overlay doğası gereği harness üzerinden.

## 11. Test kabul kriterleri

- [x] dialog + aria-modal + title/ariaLabel accessible name
- [x] open=false render etmez
- [x] defaultDetent yüksekliği belirler
- [x] ArrowUp/Down durak değiştirir, en altta kapanır
- [x] Escape/backdrop dismissible sözleşmesi
- [x] sürükleme en yakın durağa oturur
- [x] 80px eşiği altına çekilince kapanır
- [x] scroll kilidi kurulur/çözülür
- [ ] kalınlaşma görseli (visual)

## 12. Do / Don't

- ✅ İlk durağı içeriğin özetine, sonuncuyu tamamına göre seç.
- ✅ Zorunlu akışlarda `dismissible={false}` + gövdede açık kapanış aksiyonu ver.
- ❌ Sheet içinde ikinci overlay açma (cam üstüne cam).
- ❌ `detents`'i azalan sırada verme — sözleşme artan sıradır.

**Açık kararlar:** durak geçişi `height` transition'ı — "animasyon yalnız
transform/opacity/filter" kuralının bilinçli istisnası (sheet yeniden boyutlanması
doğası gereği layout'tur; transform scale içerik oranını bozar).

## Changelog

- 2026-07-16: İlk sürüm — detent sistemi, sürüklenebilir tutamaç, kalınlaşan cam.
