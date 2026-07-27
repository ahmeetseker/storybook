---
name: GlassModal
category: overlay
status: hazır
lastReviewed: 2026-07-16
---

# GlassModal Kuralları

## 1. Amaç

Akışı kesen, karar bekleyen ortalanmış dialog: onay, kısa form, önizleme.
bp-sm altında bottom-sheet'e dönüşür (mobil başparmak erişimi).

- **Kullan:** yıkıcı işlem onayı (ilanı kaldır), kısa karar akışları, medya önizleme.
- **Kullanma:** uzun form/filtre paneli (→ `GlassDrawer`), pasif bilgilendirme
  (→ `GlassAlert`), sayfa içi geçiş (→ navigasyon).

| İlgili | Farkı |
|---|---|
| GlassDrawer | Kenardan kayar; uzun/ikincil içerik, akışı tam kesmez |
| GlassAlert | Overlay değil; akış içi durum bildirimi |

## 2. Semantik sözleşme

- Element: `createPortal(document.body)` altında `role="dialog"` + `aria-modal="true"` div.
- Accessible name: `title` → `aria-labelledby`; `title` yoksa `ariaLabel` **zorunlu**
  (type-level union ile derlemede zorlanır).
- `description` → `aria-describedby`.
- DOM değişmezleri: (1) backdrop `aria-hidden`, (2) panel `tabIndex=-1` (fallback focus hedefi).

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | koşullu | düz metin (h2) | Yoksa `ariaLabel` şart |
| description | — | düz metin | Soluk, başlığın altında |
| children | ✅ | serbest içerik | Flat içerik katmanı; taşarsa panel içinde scroll |
| footer | — | aksiyon satırı | GlassButton'ları çağıran verir; sağa hizalı, sarabilir |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| open | prop | `boolean` | — | Yalnız controlled |
| onClose | event | `() => void` | — | Escape/backdrop kapama isteği; state'i çağıran günceller |
| title | prop | `string` | — | Başlık + accessible name |
| ariaLabel | prop | `string` | — | `title` yoksa zorunlu |
| description | prop | `string` | — | `aria-describedby` |
| footer | prop | `ReactNode` | — | Aksiyon satırı |
| size | prop | `'sm'\|'md'\|'lg'` | `'md'` | max-width 400/560/760 (≥sm) |
| dismissible | prop | `boolean` | `true` | `false`: yalnız programatik kapanış |
| className | prop | `string` | — | Panele eklenir |

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `size=md`, `dismissible=true`.

| Yasak / türetilen | Davranış |
|---|---|
| `title` + `ariaLabel` birlikte | `title` kazanır (aria-labelledby) |
| `title` ve `ariaLabel` ikisi de yok | ❌ derleme hatası (union type) |
| boyutlar mobilde | Yok sayılır — bottom-sheet hep tam genişlik |

## 6. State modeli

| State | Kaynak | Bastırdığı | Görsel |
|---|---|---|---|
| open | prop | — | Backdrop fade + panel spring (scale .96→1, y 8→0) |
| open (mobil) | prop + `max-width: 639px` | scale animasyonu | Bottom-sheet: y %100→0 |
| kapanış | AnimatePresence exit | — | Girişin tersi |
| reduced-motion | media query | scale/translate | Yalnız opacity fade |

## 7. Davranış

- Keyboard: Escape kapatır (`dismissible` iken); Tab panel içinde sarar (basit trap,
  kütüphanesiz); Shift+Tab ilk elemandan sona sarar.
- Focus: açılınca panel içindeki ilk odaklanabilire (yoksa panele); kapanınca
  open öncesi `activeElement`'e geri döner.
- Scroll: `document.body.style.overflow='hidden'` + eski değeri geri yazan cleanup.
- Backdrop tıklaması kapatır (`dismissible` iken); panel tıklaması kapatmaz.
- Sheet/panel kararı open anındaki `matchMedia('(max-width: 639px)')` ile alınır —
  modal açıkken resize'a tepki vermez (bilinçli sadelik; CSS yerleşimi yine uyar).

## 8. İçerik

Başlık kısa emir kipi ("İlanı kaldır"). Gövde tek konu; uzun içerik Drawer'a.
Footer'da en fazla bir `prominent` buton; yıkıcı aksiyon `tint=--lg-danger`.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| panel | background | `--lg-surface` |
| panel | radius | `--lg-radius-card` (mobilde yalnız üst köşeler) |
| panel | padding | `--lg-space-4/5` (mobil), `--lg-space-6` (≥sm) |
| title | font-size | `--lg-text-title` |
| description | color / font-size | `--lg-label-secondary` / `--lg-text-footnote` |
| footer | gap | `--lg-space-2` |

**Borç (raw / mikro-geometri):** backdrop blur'u ve boyut genişlikleri token
karşılığı olmadığından component kökünde yerel değişkene toplandı
(`.root { --backdrop-blur: 8px; --panel-max-w-sm/md/lg: 400/560/760px; }`).
Bilinçli bırakılanlar: backdrop `rgba(0,0,0,.4)` (--lg-scrim alfa .55 ile
birebir değil — overlay scrim token'ı tanımlanınca bağlanacak); panel
gölgeleri raw (mobil `0 -8px 40px rgba(0,0,0,.25)` hiçbir token deseniyle
eşleşmiyor; masaüstü bileşik gölgenin ilk katmanı `0 24px 64px rgba(0,0,0,.35)`
--lg-shadow-lg'den alfa farkıyla ayrışıyor (.32), ikinci katman tek başına
--lg-shadow-sm ile birebir olsa da bileşik desen bütün olarak token değil —
dokunulmadı); `z-index: 1000` raw (z-scale token'ı yok).

## 10. Storybook kapsamı

Var: Default (tetikleyici+footer), Sizes, NonDismissible, WithoutTitle (ariaLabel),
MobileBottomSheet (`viewport: mobile1`). **Eksik:** panel içi scroll'lu uzun içerik
görseli, iç içe modal senaryosu (desteklenmiyor — Açık Kararlar).

## 11. Test kabul kriterleri

- [x] `role="dialog"` + accessible name (title ve ariaLabel yolları)
- [x] `aria-modal` ve `aria-describedby` sözleşmesi
- [x] Escape/backdrop kapatır; `dismissible=false` iken kapatmaz
- [x] Açılış focus'u + kapanışta tetikleyiciye dönüş
- [x] Tab trap iki yönde sarar
- [x] Scroll kilidi uygulanır/kalkar
- [ ] Bottom-sheet görünümü (visual, Chrome QA)

## 12. Do / Don't

- ✅ Yıkıcı onayda `dismissible=false` yerine varsayılanı bırak; kazara kapanma
  zaten "Vazgeç" ile eşdeğer.
- ✅ Footer aksiyonlarını GlassButton ile ver; sıralama: ikincil → birincil.
- ❌ Modal içinde modal açma (trap ve focus dönüşü tek katman varsayar).
- ❌ Panele cam malzeme verme — içerik katmanı flat kalır (Temel tasarım kuralı 1).

**Açık kararlar:** iç içe modal ihtiyacı · overlay z-index/scrim token seti ·
açıkken resize'da sheet/panel animasyon modunun güncellenmesi.

## Changelog

- 2026-07-16: İlk sürüm — controlled dialog, union type'lı title/ariaLabel
  sözleşmesi, mobil bottom-sheet, kütüphanesiz focus trap.
