---
name: GlassDrawer
category: overlay
status: hazır
lastReviewed: 2026-07-16
---

# GlassDrawer Kuralları

## 1. Amaç

Kenardan kayan panel: filtreler, ikincil detay (satıcı profili, karşılaştırma),
çok adımlı olmayan uzun içerik. Akışı Modal kadar kesmeden bağlam açar.

- **Kullan:** arama filtreleri, ilan karşılaştırma, satıcı/konum detayı.
- **Kullanma:** kısa karar onayı (→ `GlassModal`), kalıcı navigasyon
  (→ `GlassSidebar`), akış içi bildirim (→ `GlassAlert`).

| İlgili | Farkı |
|---|---|
| GlassModal | Ortalanmış, kısa karar; drawer kenara yapışık uzun içerik |
| GlassSidebar | Overlay değil, kalıcı cam navigasyon |

## 2. Semantik sözleşme

- Element: `createPortal(document.body)` altında `role="dialog"` + `aria-modal="true"` div.
- Accessible name: `title` → `aria-labelledby`; yoksa `ariaLabel` **zorunlu**
  (type-level union — GlassModal ile aynı sözleşme).
- `description` → `aria-describedby`.
- DOM değişmezleri: (1) backdrop `aria-hidden`, (2) panel `tabIndex=-1`.

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | koşullu | düz metin (h2) | Yoksa `ariaLabel` şart |
| description | — | düz metin | Soluk, başlığın altında |
| children | ✅ | serbest içerik | `flex:1` — yan panelde footer'ı alta iter; taşarsa scroll |
| footer | — | aksiyon satırı | GlassButton'ları çağıran verir |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| open | prop | `boolean` | — | Yalnız controlled |
| onClose | event | `() => void` | — | Escape/backdrop kapama isteği |
| title | prop | `string` | — | Başlık + accessible name |
| ariaLabel | prop | `string` | — | `title` yoksa zorunlu |
| description | prop | `string` | — | `aria-describedby` |
| footer | prop | `ReactNode` | — | Aksiyon satırı |
| side | prop | `'left'\|'right'\|'bottom'` | `'right'` | Kayma kenarı |
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | Yan: 320/400/560px (≥sm) · bottom: %50/%70/%90 max-height |
| dismissible | prop | `boolean` | `true` | `false`: yalnız programatik kapanış |
| className | prop | `string` | — | Panele eklenir |

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `side=right`, `size=md`, `dismissible=true`.

| Yasak / türetilen | Davranış |
|---|---|
| `title`+`ariaLabel` yok | ❌ derleme hatası (union type) |
| `size` anlamı | `side`'a göre değişir: yan → genişlik, bottom → max-height |
| yan panel mobilde | Genişlik yok sayılır — tam genişlik (%100) |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| open | prop | — | Backdrop fade + panel kendi kenarından spring translate (x/y %100→0) |
| kapanış | AnimatePresence exit | — | Girişin tersi (kenara geri kayar) |
| reduced-motion | media query | translate | Yalnız opacity fade |

## 7. Davranış

- Keyboard: Escape kapatır (`dismissible` iken); Tab panel içinde iki yönde sarar.
- Focus: açılınca ilk odaklanabilire (yoksa panele `tabIndex=-1`); kapanınca
  open öncesi `activeElement`'e döner.
- Scroll: body kilidi + eski değeri geri yazan cleanup — GlassModal ile birebir.
- Backdrop tıklaması kapatır (`dismissible` iken).
- İç kenar ≥sm'de yuvarlanır (`--lg-radius-card`); mobil tam genişlikte radius yok.

## 8. İçerik

Başlık panelin işlevini adlandırır ("Arama filtreleri"). Uzun listeler panel
içinde scroll eder; footer aksiyonu görünür kalır (body `flex:1`).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| panel | background | `--lg-surface` |
| panel | radius (iç kenar) | `--lg-radius-card` |
| panel | padding | `--lg-space-4/5` (mobil), `--lg-space-6` (≥sm) |
| title | font-size | `--lg-text-title` |
| description | color / font-size | `--lg-label-secondary` / `--lg-text-footnote` |
| footer | gap | `--lg-space-2` |

**Borç (raw / mikro-geometri):** yan genişlikler ve backdrop blur token
karşılığı olmadığından component kökünde yerel değişken olarak toplandı
(`.root { --backdrop-blur: 8px; --panel-w-sm: 320px; --panel-w-md: 400px;
--panel-w-lg: 560px; }`); backdrop scrim `rgba(0,0,0,0.4)` bilinçli yerinde
bırakıldı — `--lg-scrim` (`rgba(10,12,16,0.55)`) ile birebir aynı değil,
bağlamak görsel değişiklik olurdu; panel gölgesi `0 24px 64px rgba(0,0,0,0.35)`
hiçbir `--lg-shadow-*` deseniyle birebir değil (`lg` alfa 0.32) — dokunulmadı;
`z-index: 1000` raw (z token'ı yok). Overlay/genişlik token seti tanımlanınca
bağlanacak.

## 10. Storybook kapsamı

Var: Default (filtre akışı), Sides, Sizes, NonDismissible, MobileFullWidth
(`viewport: mobile1`). **Eksik:** sürükleyerek kapatma (gesture) senaryosu —
desteklenmiyor (Açık Kararlar).

## 11. Test kabul kriterleri

- [x] `role="dialog"` + accessible name (title ve ariaLabel yolları)
- [x] side/size sınıfları uygulanır
- [x] Escape/backdrop kapatır; `dismissible=false` iken kapatmaz
- [x] Açılış focus'u + scroll kilidi + cleanup
- [x] Tab trap sarar
- [ ] Kenardan kayma animasyonu (visual, Chrome QA)

## 12. Do / Don't

- ✅ Mobilde filtre gibi başparmakla yönetilen akışlarda `side="bottom"` düşün.
- ✅ Footer'daki birincil aksiyon sonucu özetlesin ("128 İlanı Göster").
- ❌ Drawer içinden ikinci Drawer/Modal açma — tek overlay katmanı varsayılır.
- ❌ Panele cam malzeme verme — içerik katmanı flat kalır.

**Açık kararlar:** swipe-to-dismiss gesture'ı · Modal ile ortak overlay
altyapısının (focus trap/scroll kilidi) hook'a çıkarılması.

## Changelog

- 2026-07-16: İlk sürüm — side/size eksenleri, GlassModal ile ortak
  focus/scroll/Escape sözleşmesi, mobil tam genişlik davranışı.
