---
name: AdvisorWorkspace
category: içerik
status: hazır
lastReviewed: 2026-07-27
---

# AdvisorWorkspace Kuralları

## 1. Amaç

`AdvisorWorkspace`, doğal dildeki emlak ihtiyacını düzenlenebilir kriterlere,
açıklanabilir ilan eşleşmelerine ve güvenli karar eylemlerine dönüştürür.
`/ai-danisman` sayfasının tek çalışma alanıdır; genel amaçlı sohbet, gerçek
üretim AI servisi veya kullanıcı onayı olmadan dış aksiyon başlatmak için
kullanılmaz. Tekrar kullanılabilir arama kontrolü `GlassAiSearchBar`, overlay
sözleşmesi `GlassDrawer` tarafından sağlanır; advisor bileşenleri sayfaya
özeldir.

## 2. Semantik sözleşme

- Kök öğe `<main id="main-content">` olup shell skip-link hedefidir.
- Tek composer `<form role="search">`; girdinin adı `Doğal dilde arama`dır.
- Sayfa tam olarak bir `role="status" aria-live="polite"` outlet’i taşır.
  Composer `announcementMode="external"` ile ikinci live region üretmez.
- Sonuç durumunda görünür ve DOM sırası değişmezi
  `query → profile → featured → alternatives → actions`tır. Her gerçek bölüm
  aynı değerli `data-flow-section` işaretini kendi semantik yüzeyinde taşır;
  CSS `order` ile yeniden sıralama yapılmaz.
- Sonuçlar `<section>`; ilanlar accessible name’ini başlıktan alan
  `<article>`; profil bir `<section>`; karar alanı bir `<aside>` olarak
  sunulur.
- Drawer’lar `document.body` portalında `role="dialog" aria-modal="true"`
  kullanır. Açılış odağı, focus trap, Escape/backdrop kapanışı, body scroll
  kilidi ve kapanışta tetikleyiciye focus dönüşü korunur.
- Sonuç ekranı geniş container’da tek 12 kolon sistemi içinde iki alandır:
  sonuç kanvası 8 kolon, profil ve karar yüzeyleri 4 kolon. Üç kolonlu sohbet
  kompozisyonu kullanılmaz.
- Container ölçümü dış `main` üzerinde, responsive padding ise iç page frame
  üzerinde yaşar; böylece frame kendi container sorgusuyla kendisini
  biçimlendirmeye çalışmaz.
- Geniş dalda profil ve karar eylemleri aynı grid satırında, aynı yatay
  eksende ve `--lg-space-5` aralıkla koordine edilir. Profilin gerçek
  `border-box` yüksekliği `ResizeObserver` ile
  `--lg-advisor-profile-block-size` değişkenine aktarılır; iki yüzey birlikte
  sticky kalırken sonuç yüksekliği sağ rail aralığını germez.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| Status outlet | Evet | Analiz, sonuç, hata ve yerel işlem duyuruları | Tek ve kalıcıdır; boşken görsel olarak gizlenir |
| Query | Evet | Tek eyebrow, H1, `AdvisorComposer` | Sonuç akışının ilk DOM bölümüdür |
| Welcome | Idle | Başlık, kısa açıklama, composer, üç örnek | Karar panelleri ve boş sonuç göstermez |
| Search profile | Sonuç/empty/error | Yorumlanan kriter satırları | Kriterler düzenlenebilir/kaldırılabilir; orta ve darda sonuçlardan önce gelir |
| Featured | Results | En iyi eşleşme kartı | Tek büyük karar kartıdır |
| Alternatives | Results | Kalan eşleşmeler | Genişte iki kolon, darda tam genişlik |
| Decision actions | Sonuç/empty/error | Compare sayacı, kayıt, alarm, güven, geçmiş, consent | Alternatiflerden sonra DOM’dadır; genişte 4 kolon alanda görünür |
| Drawers | İsteğe bağlı | Kriter, ilan, güven, geçmiş, consent | Aynı anda en fazla bir dialog |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| `initialQuery` | prop | `string` | `''` | Hayır, yalnız başlangıç | İlk mount’ta bir kez ayrıştırılıp çalıştırılan paylaşılabilir sorgu |
| `initialCompareIds` | prop | `string[]` | `[]` | Hayır, yalnız başlangıç | İlk karşılaştırma seçimi; reducer en fazla üç kimliği korur |
| `searchAdapter` | prop | `AdvisorSearchAdapter` | Fixture adapter | Enjeksiyon | Abort signal alan asenkron arama sınırı |
| `onRouteStateChange` | event | `(state: AdvisorRouteState) => void` | N/A | N/A | Geçerli sorgu gönderimi veya compare seçimi değişince çağrılır; IME composition sırasında çağrılmaz |
| `onOpenComparison` | event | `(ids: string[]) => void` | N/A | N/A | En az iki seçimle kullanıcı Karşılaştır eylemini tetiklediğinde çağrılır |

Ref iletilmez. Workspace state’i reducer tarafından sahiplenilir; başlangıç
prop’larını sonradan state’e eşitleyen prop-sync effect kullanılmaz.

## 5. Seçenek eksenleri

Workspace görsel variant API’si sunmaz. `material`, `tone`, `size`,
`variant`, `thickness`, `tint` ve `prominent` yalnız ilgili primitive’lerin
sözleşmesidir. Tema component prop’u değildir; Storybook ve uygulama
`backgroundKey`/tema token’larını kullanır.

Varsayılan kombinasyon: flat içerik yüzeyleri + yalnız kontrol katmanında
mevcut glass primitive’ler. Yasak kombinasyonlar: içerik kartında glass,
cam üstüne cam, sayfa başına altıdan fazla cam yüzey, theme prop’u, hover /
focus / active prop’u ve cihaz adına dayalı responsive prop.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| `idle` | Reducer başlangıcı | Sonuç, profil, karar yüzeyleri | Tek search form görünür |
| `analyzing` | Geçerli gönderim | Önceki yeni sonuç render’ı | Status outlet analizi duyurur; skeleton `aria-hidden` |
| `results` | Adapter eşleşmeleri | Empty/error | Sonuç sayısı status outlet’te duyurulur |
| `empty` | Sıfır eşleşme | Results/error | Öncelikli kriter kaldırma ve düzenleme görünür |
| `error` | Abort dışı adapter hatası | Results/empty | Inline alan `role="alert"` |
| `clarification` | Parser önerisi | Adapter çağrısı ve karar yüzeyleri | Tek netleştirme sorusu, aynı composer |
| Compare/favorite | Reducer | N/A | Kalıcı buton state’i `aria-pressed` |
| Overlay | Reducer | Diğer overlay | Tek modal dialog |
| Disabled/loading | Primitive state | Hover/active | Native `disabled`, uygun `aria-busy` |

Katman sırası: availability → kalıcı değer → interaction → tema. Abort edilen
istek error state üretmez; reducer son tutarlı snapshot’a döner.

## 7. Davranış

### Pointer ve touch

- Flat örnek, kart ve karar eylemleri native button’dır.
- Hover yalnız `@media (hover: hover)` içinde tanımlanır.
- `pointer: coarse` ortamında etkileşimli hedefler en az
  `--lg-control-md` yüksekliğindedir.

### Klavye ve focus

| Tuş / eylem | Sonuç |
|---|---|
| Composer’da Enter | Composition yoksa güncel sorguyu gönderir |
| IME composition sırasında Enter | Form sınırında engellenir; arama ve route persistence oluşmaz |
| Drawer açıkken Escape | Dismissible drawer’ı kapatır |
| Drawer içinde Tab / Shift+Tab | İlk ve son odaklanabilir öğe arasında sarar |
| Drawer kapanışı | Tetikleyici bağlıysa odağı geri alır |
| Compare/favorite Enter veya Space | Native button davranışıyla `aria-pressed` state’ini değiştirir |

Tüm özel kontroller yalnız `:focus-visible` durumunda
`--lg-focus-ring-width`, `--lg-accent` ve `--lg-focus-ring-offset` kullanır.

### Async ve route

- Her analiz yeni bir `AbortController` oluşturur; yeni sorgu önceki isteği
  abort eder.
- Cancel ve unmount aktif isteği abort eder. Stale sonuç reducer’a yazılmaz.
- Clarification tamamlanmadan adapter çağrılmaz.
- Sorgu ve compare kimlikleri yalnız mevcut route callback sözleşmesiyle
  korunur; component doğrudan navigation yapmaz.
- Kriter düzenleme aynı immutable proposal üzerinden tekrar analiz edilir.
- Consent onayı gerçek dış paylaşım yapmaz; yalnız yerel geçmişe kaydedilir.

## 8. İçerik kuralları

- İlk görünümde bir uppercase eyebrow, en fazla iki satırlık H1 ve kısa
  açıklama kullanılır; ikinci eyebrow eklenmez.
- Görünür metin Türkçedir; kod tanımlayıcıları İngilizcedir.
- İlan başlıkları ve kriter değerleri kırpılmak yerine sarar;
  `overflow-wrap: anywhere` yalnız ölçüm/değer güvenliği için kullanılır.
- Eksik ilan verisi `Bilgi sağlanmadı` diye belirtilir; sahte değer üretilmez.
- Sorgu yorumlama güveni ve ilan eşleşmesi aynı kavram gibi sunulmaz.
- Sayısal fiyat ve alan değerleri tabular figures kullanır.
- En fazla üç kart highlight’ı gösterilir; fotoğraf üzerindeki metin durum
  rozeti ve fotoğraf sayısıyla sınırlıdır.
- Dış işlem simüle edilmez. Kayıt, alarm ve consent metinleri demo/yerel
  kapsamı açıkça söyler.
- Güncel eşleşmelerde bulunmayan kalıcı compare kimliği
  `İlan kimliği <id> güncel sonuçlarda bulunamadı.` cümlesiyle gösterilir.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| Page/layout | gap, padding, ölçülen rail yüksekliği | `--lg-space-*`, `--lg-shell-dock-offset`, `--lg-advisor-profile-block-size` | Dış container ve iç frame ayrıdır; dar container’da daha sıkı ritim; safe-area korunur |
| Flat surfaces | background, border, radius | `--lg-surface`, `--lg-hairline`, `--lg-stroke-hairline`, `--lg-radius-card` | Tema token’ları Kağıt/Grafit değerlerini sağlar |
| Media | radius, background | `--lg-radius-media`, `--lg-bg` | N/A |
| Chips/badges | radius, type | `--lg-radius-chip`, `--lg-radius-capsule`, `--lg-text-badge` | Verification semantik token kullanır |
| Controls | height, radius | `--lg-control-sm/md`, `--lg-radius-chip/capsule` | Coarse pointer’da `--lg-control-md` minimum |
| Typography | sizes, colors | `--lg-text-*`, `--lg-label`, `--lg-label-secondary`, `--lg-accent` | Tema otomatik |
| Dividers | border | `--lg-stroke-hairline`, `--lg-hairline` | N/A |
| Focus | outline | `--lg-focus-ring-width`, `--lg-accent`, `--lg-focus-ring-offset` | Yalnız `:focus-visible` |
| Motion | transform/filter | Tasarım sistemi motion preset’leri | Reduced motion’da transform kapalı |

Raw piksel/hex, zorlayıcı önem eki, keyfî radius, viewport width breakpoint
ve yerel shadow kullanılmaz. Token borcu yoktur.

## 10. Storybook kapsamı

| Story | Durum | Amaç |
|---|---|---|
| `Initial` | Var | İlk açılış / default |
| `Analyzing` | Var | Abort edilebilir deterministic pending |
| `Results` | Var | Açıklanabilir sonuç kompozisyonu |
| `CompareSelected` | Var | Başlangıç compare state’i |
| `Empty` | Var | Sabit sıfır sonuç |
| `ErrorState` | Var | Sabit adapter hatası |
| `LowConfidence` | Var | Iterative clarification |
| `LongTurkishContent` | Var | Uzun sorgu ve başlık |
| `NarrowContainer` | Var | Story-local full-bleed ile gerçek 390 container ve tam genişlik akışı |
| `MediumContainer` | Var | Story-local full-bleed ile gerçek 768 container ve profil-önce akış |
| `PaperResults` | Var | `backgroundKey: light` |
| `GraphiteResults` | Var | `backgroundKey: dark` |
| `Accessibility` | Var | Portal drawer, Escape/focus dönüşü, compare ARIA |

Playground/controls: N/A — sayfa state’leri public görsel eksenler değil,
deterministic scenario story’leriyle belgelenir. Sizes/materials: N/A —
workspace variant sunmaz. Forced hover/focus: N/A — etkileşim story’si gerçek
keyboard focus’unu kullanır.

## 11. Test kabul kriterleri

### Unit ve integration

- Idle’da tek composer ve tek live region bulunur.
- Whitespace sorgu ve IME composition gönderim/route değişimi üretmez.
- Analyzing, clarification, results, empty, error, retry ve cancel geçişleri
  reducer/adapter sınırı üzerinden çalışır.
- Yeni analiz ve unmount aktif isteği abort eder; stale sonuç yazılmaz.
- Kriter kaldırma/düzenleme immutable proposal ile tekrar analiz edilir.
- Favori ve en fazla üç compare seçimi `aria-pressed` ile görünürdür.
- Listing, trust, history ve consent drawer akışları gerçek portal/focus
  sözleşmesini korur.
- Route state query + compare kimliklerini kaybetmez.

### Semantik ve a11y

- Kök `main#main-content`, tek `role="search"` ve tek polite status vardır.
- Results DOM marker’ları literal olarak
  `query, profile, featured, alternatives, actions` sırasındadır.
- Icon-only primitive’ler accessible name taşır.
- Drawer accessible name, focus trap, Escape ve focus dönüşü test edilir.
- Renk tek anlam taşıyıcısı değildir.

### Visual ve responsive

- Geniş container 12 kolon 8/4 iki alan kompozisyonudur.
- Geniş container’da profil ve karar eylemleri aynı x ekseninde sabit token
  aralığıyla birlikte sticky kalır; uzun sonuç kanvası aralarında boşluk
  üretmez.
- Orta container profil → sonuçlar → eylemler sırasına iner.
- 40rem ve altında dar dal; üstünde ve 64rem’e kadar orta dal kullanılır.
  Dar container’da aynı DOM/görsel sıra ve tam genişlik kartlar vardır.
- İç içe scroll, yatay taşma ve global dock/safe-area çakışması yoktur.
- Kağıt/Grafit, uzun Türkçe içerik ve reduced motion/transparency
  koşulları Storybook/görsel denetime açıktır.

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

### Do

- İçeriği flat ve hiyerarşiyi boşluk, hairline, tipografi, fotoğraf oranıyla
  kur.
- Tek composer, tek status outlet ve tek overlay değişmezlerini koru.
- Yeni state’i reducer event’i ve deterministic adapter fixture’ıyla ekle.
- Orta/dar akışı DOM sırasıyla kur; container query kullan.
- Dış işlem öncesi açık consent ve demo kapsamını görünür tut.

### Don't

- Profil/eylemleri tekrar sağ rail içine alıp DOM’u
  `query → profile → actions → results` yapma.
- CSS `order`, duplicate composer/live region veya prop-sync effect kullanma.
- İçerik kartını glass yapma; shadow, gradient, dekoratif cam veya ikinci
  eyebrow ekleme.
- Viewport breakpoint, raw piksel/hex, keyfî radius veya zorlayıcı önem eki
  ekleme.
- Abort edilen isteği hata gibi duyurma veya stale response’u kabul etme.
- Gerçek kayıt, bildirim ya da danışman paylaşımı yapılmış izlenimi verme.

### Bilinen kısıtlar

- Arama adapter’ı fixture verisidir; gerçek AI/ağ entegrasyonu kapsam dışıdır.
- Favori, kayıt, alarm ve consent geçmişi yalnız mevcut demo oturumundadır.
- Responsive görsel kalite otomatik DOM testinin yanında tarayıcıda ayrıca
  incelenmelidir.

### Açık kararlar

- Gerçek üretim adapter’ı geldiğinde timeout/retry politikası veri katmanında
  tanımlanacaktır; workspace public API’sine yeni loading prop eklenmez.
- Server kontrollü favori/kayıt state’i ileride ayrı veri sözleşmesi
  gerektirir.

### Changelog

- `2026-07-27` — Task 9 responsive inceleme düzeltmesi: container sahibi ve
  padded frame ayrıldı; dar eşik 40rem’e çekildi; 390/768 story’leri
  full-bleed yapıldı; wide rail ölçülen profil yüksekliğiyle aynı satırda,
  sabit token aralıklı ve koordineli sticky davranışa geçirildi.
- `2026-07-27` — Task 9: gerçek semantik akış
  `query → profile → featured → alternatives → actions` olarak ayrıldı;
  deterministic 13-state Storybook matrisi, workspace IME regresyonu,
  responsive/a11y/token sözleşmesi tamamlandı.
