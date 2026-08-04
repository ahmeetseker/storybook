---
name: GlassNavbar
category: navigasyon
status: hazır
lastReviewed: 2026-07-15
---

# GlassNavbar Kuralları

## 1. Amaç

Sayfa üstü yapışkan navigasyon barı: geri pill'i, ortalanmış başlık ve cam
action grubu. Bar'ın kendisi zeminsizdir; içerik altından kayarken scroll edge
efektiyle kademeli bulanıklaşarak arka plana erir (sert çizgi yok — Apple kuralı).

- **Kullan:** detay/ayar sayfalarının üst navigasyonu, geri + başlık + 1-3 aksiyon.
- **Kullanma:** sekme değiştirme (→ `GlassTabBar`), sayfa içi araç çubuğu,
  çok satırlı başlık gereken yerler.

| İlgili | Farkı |
|---|---|
| GlassBackButton | Navbar'ın alt parçası; `GlassButton size="sm"` sarmalayıcısı |
| GlassSurface | Action grubunun malzemesi; navbar kendisi cam yüzey değildir |

## 2. Semantik sözleşme

- Element: `<nav>` (navigation landmark). `as` desteklenmez.
- Geri butonu gerçek `<button>` (GlassButton); accessible name `backLabel ?? 'Geri'`
  (`aria-label` ile — chevron `aria-hidden`).
- Başlık `<span>`'dir, heading **değildir** — sayfa `<h1>`'i içerikte kalır.
- DOM değişmezleri: (1) scroll edge span'i `aria-hidden` ve `pointer-events: none`,
  (2) action grubu `data-glass-action-group` işaretli GlassSurface capsule,
  (3) geri/aksiyon yokken 44px spacer render edilir (başlık ortalı kalsın diye).
- Aynı sayfada birden çok `<nav>` varsa çağıran `aria-label` vermelidir (rest
  props geçirilmiyor — bkz. Açık Kararlar).

## 3. Anatomy

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | — | metin/ReactNode | Tek satır, ellipsis; ortalanır |
| geri pill | `onBack` verilince | chevron + opsiyonel `backLabel` | GlassButton `size="sm"`; label yoksa yalnız chevron + `aria-label` |
| actions | — | `<button>` / `<a>` öğeleri | Tek cam capsule grupta; stil grup CSS'inden gelir |
| scrollEdge | otomatik | blur katmanı | Dokunulamaz, `aria-hidden`, mask ile alta doğru erir |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| title | prop | `ReactNode` | — | Ortadaki başlık |
| onBack | prop | `() => void` | — | Verilirse geri pill'i render olur |
| backLabel | prop | `string` | — | Pill metni + accessible name; yoksa 'Geri' |
| actions | prop | `ReactNode` | — | Cam action grubuna basılır |
| tone | prop | `'light'\|'dark'\|'auto'` | `'auto'` | Geri pill'ine ve action grubuna iletilir |

`...rest` **yok** — `nav`'a ekstra attribute geçirilemez. Event sözleşmesi:
`onBack` yalnız geri butonuna tıklayınca; action tıklamaları çağıranın kendi
handler'larıdır.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: yalnız `title`, `tone='auto'`.

| Türetilen / kural | Davranış |
|---|---|
| `onBack` yok | Geri yerine 44px spacer |
| `actions` yok | Grup yerine 44px spacer |
| `backLabel` yok + `onBack` var | İkon-tek pill; a11y adı 'Geri' |
| `material` / `size` | ❌ yok — bar navigasyon katmanıdır, hep cam pill'ler |

## 6. State modeli

Bar'ın kendi state'i yoktur; state'ler alt kontrollerdedir.

| State | Kaynak | Görsel |
|---|---|---|
| geri pill hover/active/focus | GlassButton kuralları | bkz. GlassButton rules.md |
| action hover | CSS (`.actionGroup button:hover`) | `rgba(255,255,255,.18)` zemin |
| sticky/scrolled | CSS (`position: sticky`) | scrollEdge her zaman render; ayrı state yok |

Katman sırası GlassButton'dan miras. `disabled` ekseni yok (navigasyon aksiyonu
kapatılacaksa çağıran action'ı render etmez).

## 7. Davranış

- Yerleşim: `position: sticky; top: 0; z-index: 10` — scroll container'ın
  çağıranın sağladığı `overflow-y: auto` öğesi olması gerekir.
- Scroll edge: `backdrop-filter: blur(14px) saturate(150%)` + `mask-image`
  gradyanı (%55'ten sonra saydama erir), bar altına -28px taşar.
- Keyboard: geri pill'i ve action'lar DOM sırasıyla (sol→sağ) Tab akışındadır;
  bar kendisi focus almaz.
- Overlay: N/A — portal/modal davranışı yok.
- Controlled/uncontrolled: N/A — durum tutmaz.

## 8. İçerik

- Başlık tek satır: `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`.
  Uzun TR başlıklar kırpılır; tam metin gerekiyorsa çağıran `title` attribute
  ekleyemez (rest yok) — Açık Kararlar.
- Action'lar kısa fiil etiketleri (Paylaş, Düzenle); en fazla 3.
- `backLabel` verilmezse ikon-tek moddur; ekran okuyucu adı 'Geri' Türkçe sabittir —
  lokalizasyonda `backLabel` verilmelidir.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| geri pill / action grubu | malzeme | GlassSurface (`thickness 0.35`, capsule) |
| bar | gap / padding | `--lg-space-3` / `--lg-space-2` + `--lg-space-4` |
| başlık | font-size | `--lg-text-headline` |
| action grubu | padding / iç gap | `--lg-space-1` |
| action buton/link | min-height / padding / radius | `--lg-control-sm` / `0 --lg-space-3` / `--lg-radius-capsule` |
| dokunma hedefi | `::after` taşması | `--lg-control-hit` (44px) |
| spacer | width | `--lg-control-hit` |

**Borç (raw / mikro-geometri):** token karşılığı olmayan ölçüler `.bar`
kökünde yerel değişkenlerde toplandı: `--nav-edge-bleed` (-28px, scroll edge
alt taşması), `--nav-edge-blur` (14px — blur token'ı yok),
`--nav-chevron-box` (10px), `--nav-chevron-stroke` (2.5px),
`--nav-chevron-gap` (2px). `--nav-spacer` artık raw 44px değil
`--lg-control-hit`e bağlı — geri pill'i / action grubu yokken başlığı ortalayan
simetri boşluğu, ölçüsü dokunma hedefi tabanıyla aynı kalmalı.

**Şerit ölçüsü (2026-08-03):** `.bar` dikey dolgusu `--lg-space-3` →
`--lg-space-2`. Aksiyon buton/linkleri artık dikey padding yerine
`min-height: var(--lg-control-sm)` (36px) taşıyor; `--lg-space-1` dolgulu
aksiyon grubuyla birlikte grup 44px, bar toplam 60px (eski ~65px).

**Dokunma hedefi:** Aksiyon slotu ikon-tek olabildiği için buton/link görünmez
`::after` taşmasıyla `--lg-control-hit`e (44px) genişler. Taşma 4px ve
`.actionGroup`'un `--lg-space-1` dolgusuna tam oturur; bu yüzden
`GlassSurface`'in `overflow: hidden`'ı hedefi kırpmaz (kırpma padding
kutusunda olur). Bilinçli bırakılan: action hover
zemini `rgba(255,255,255,.18)` — cam capsule üstünde beyaz-alfa malzeme
etkisi, birebir token yok, `color-mix`'e çevrilmedi; başlık ağırlığı `700`
(headline token'ı yalnız boyut tanımlar, ağırlık kuralı 600'ü aşıyor —
mevcut karar); scrollEdge mask gradyan yüzdesi (%55) spec sabiti.

## 10. Storybook kapsamı

Var: `WithBackAndActions` (scroll edge senaryolu), `TitleOnly`, `IkonTekGeri`
(backLabel'sız pill), `UzunBaslik` (başlık truncation), `DarContainer`
(360px responsive). Arka plan/tema toolbar'dan (Arka plan + Tier global'leri).
**Eksik:** Playground (Controls), Erişilebilirlik (Tab sırası) story'si.
Action hover/focus CSS state'idir — control/story yapılmaz (bkz. GlassButton kuralı).

## 11. Test kabul kriterleri

- [x] başlık render (unit)
- [x] `onBack` verilince buton render + çağrılır
- [x] `onBack` yokken buton yok
- [x] actions `data-glass-action-group` içinde
- [x] `navigation` landmark
- [ ] backLabel yokken accessible name 'Geri' (a11y)
- [ ] uzun başlık ellipsis (visual)
- [ ] scroll edge'te sert çizgi yok (visual, Chrome)

## 12. Do / Don't

- ✅ Action olarak yalnız `<button>`/`<a>` ver; grup stili bu seçicilere bağlı.
- ✅ Bar'ı scroll eden container'ın **içine**, en üste koy (sticky bağlamı).
- ❌ Bar'a opak zemin/çizgi ekleme — scroll edge modelini bozar.
- ❌ `title`'a blok element verme; tek satır sözleşmesi bozulur.

**Bilinen kısıtlar:** scrollEdge, `backdrop-filter` desteklemeyen ortamda
görünmezdir (içerik kesilmeden akar). **Açık kararlar:** `nav`'a `aria-label`
için rest props açılmalı mı · 'Geri' fallback'inin i18n'i.
(Başlığın `--lg-text-headline`'a bağlanması yapıldı — bkz. §9.)

## Changelog

- 2026-08-03: Yeni kontrol ölçeğine uyarlandı. `.bar` dikey dolgusu
  `--lg-space-3` → `--lg-space-2`; aksiyon buton/linkleri
  `min-height: var(--lg-control-sm)` + `padding: 0 --lg-space-3` oldu (bar ~65px
  → 60px). `--nav-spacer` raw 44px yerine `--lg-control-hit`e bağlandı.
  İkon-tek aksiyonlar için görünmez `::after` dokunma hedefi taşması eklendi.
