---
name: GlassMatchBreakdown
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassMatchBreakdown Kuralları

## 1. Amaç

`GlassMatchScore`'un derin ekranı — tek bir 0-100 skorun "neden bu skor"
sorusuna cevap veren grup grup dökümü. Genel uyum skorunu mini bir bar'la,
ardından her bir grubu (konum, bütçe, oda sayısı, bina özellikleri...) kendi
skor bar'ı + opsiyonel genel skordaki ağırlık etiketi + opsiyonel eşleşen/
eşleşmeyen detay chip'leriyle listeler. AI-first component: içerik AI
tarafından üretildiği için "✦ AI" rozeti zorunlu ve daima görünür. Kendi bar
mantığını çizer — `GlassScoreMeter`'dan bilinçli olarak İTHAL EDİLMEZ
(`GlassMatchScore` ile aynı bağımsızlık kararı; AI-first rozet/güven/geri
bildirim/yükleme sözleşmesi `GlassScoreMeter`'da yok).

- **Kullan:** ilan detay sayfasında "sana göre" kartının ("Uyum Dökümünü
  Gör" gibi bir aksiyonla) açtığı derin ekran/genişletilmiş panel.
- **Kullanma:** tek satırlık özet skor (→ `GlassMatchScore`), nesnel/kalıcı
  konum metriği (→ `GlassScoreMeter`), çok satırlı ham özellik künyesi (→
  `GlassFeatureGroup`).

| İlgili | Farkı |
|---|---|
| GlassMatchScore | Özet ekran — tek skor + kısa gerekçe + düz kriter listesi; MatchBreakdown aynı skorun grup grup AĞIRLIKLI dökümüdür (derin ekran) |
| GlassScoreMeter | Nesnel/kalıcı metrik, AI rozeti yok, AI-first sözleşmesi taşımaz |
| GlassFeatureGroup `checklist` | Ham özellik künyesi (✓/✕ ızgara), skor/ağırlık taşımaz; MatchBreakdown'daki detay chip'leri yalnızca bir grubun ALT kümesidir |

## 2. Semantik sözleşme

- Kök: `<div>` (`article` değil — tek bir "değerlendirme" bildirimi,
  `GlassMatchScore` ile aynı karar).
- Genel skor satırı: `<div role="meter">` + `aria-valuemin={0}`,
  `aria-valuemax={100}`, `aria-valuenow={clampedOverall}`, `aria-labelledby`
  sabit görünür "Genel Uyum" etiketine bağlı.
- Her grup satırı da AYRI bir `<div role="meter">` — `aria-labelledby`
  grup başlığına (ve varsa ağırlık etiketine, iki id boşlukla birleştirilip)
  bağlanır. Grup skoru (`groupScore`) `aria-hidden` — değer zaten
  `aria-valuenow`'da, AT'ye iki kez okutulmaz (genel skor satırıyla aynı
  karar).
- Grup listesi `<ul><li>`; her `<li>` bir meter + (varsa) kendi detay
  `<ul><li>` listesini kapsar (nested list, standart HTML).
- Detay chip'leri: ✓/✕ ikonları `aria-hidden` (dekoratif). Eşleşme durumu
  AT'ye görünür etiketin yanına eklenen görsel-gizli (`srOnly`, `aria-hidden`
  DEĞİL) "(eşleşti)"/"(eşleşmedi)" metniyle iletilir — `GlassMatchScore`
  kriter chip'leriyle birebir aynı desen.
- "✦ AI" rozeti: `aria-label="Yapay zekâ üretimi"`.
- `confidence` metni ("%N güven") görünür düz metin — ayrı ARIA gerekmez.
- Geri bildirim: gerçek `<button aria-pressed>` (👍/👎), accessible name
  "Faydalı"/"Faydalı değil". `role="radiogroup"` DEĞİL — ikisi bağımsız
  toggle (roving tabindex gerekmez, doğal Tab sırası).
- `loading=true`: genel satır/grup listesi/geri bildirim yerine `aria-hidden`
  skeleton render edilir; TEK istisna zorunlu "✦ AI" rozeti (skeleton başlık
  satırının yanında normal görünür kalır). Durum, mount anından itibaren
  DOM'da bulunan **tek bir** `role="status"` düğümünün metni değiştirilerek
  duyurulur — düğüm `loading=false`'ta da mount kalır, yalnız metni boşalır
  (sonradan DOM'a eklenen bir canlı bölge bazı ekranokuyucularda hiç
  duyurulmaz; bkz. §11 regresyon testi).
- Portal yok, ref forwarding yok (statik/kontrollü sunum kararı, diğer
  içerik katmanı component'leriyle tutarlı).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| başlık | ✅ | `title` (default "Uyum Dökümü") | Görünür metin; `loading`'de skeleton'la değişir |
| AI rozeti | ✅ (her zaman) | "✦ AI" | Kontrat sabit CSS'i — component'ler arası birebir aynı |
| güven metni | — | "%N güven" | Yalnız `confidence` sonluysa; rozetin yanında |
| genel skor satırı | ✅ | "Genel Uyum" etiketi + bar + sayı | `role="meter"` |
| grup listesi | — | `groups[]` | Boşsa/`undefined`sa bölüm hiç render edilmez |
| grup satırı | — | başlık + (opsiyonel) ağırlık + bar + sayı | Her biri kendi `role="meter"`'ı |
| detay chip'leri | — | `group.details[]` | Yalnız verilen grupta; ✓ (success ton) / ✕ (soluk) |
| geri bildirim | — | 👍/👎 | Yalnız `onFeedback` verilirse |

Children kabul edilmez — tamamen prop güdümlü.

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| overall | prop | `number` | — (zorunlu) | — | [0,100]'e clamp + yuvarlanır; `NaN`/`Infinity` önce 0'a düşer |
| groups | prop | `GlassMatchBreakdownGroup[]` | — (zorunlu) | — | `{ id, label, score, weight?, details? }[]`; boş dizi/`undefined` → grup bölümü render edilmez |
| title | prop | `string` | `'Uyum Dökümü'` | — | Görünür başlık metni |
| confidence | prop | `number` | — | — | [0,100]'e clamp; sonlu değilse gizlenir (rozet yine görünür) |
| onFeedback | prop | `(value: 'up' \| 'down') => void` | — | — | Verilirse 👍/👎 butonları görünür |
| loading | prop | `boolean` | `false` | — | true → flat skeleton + `role="status"` metni |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`title` hariç) | — | — | `className`/`style` birleştirilir |

`GlassMatchBreakdownGroup`: `id: string` (yalnız React `key`, DOM `id`'sine
YAZILMAZ — DOM id'leri her zaman `useId()` + grup index'inden türetilir),
`label: string`, `score: number` ([0,100]'e clamp + yuvarlanır, `NaN`/
`Infinity` önce 0'a düşer), `weight?: string` (ör. `'%30'`, ham metin —
component hesaplama yapmaz), `details?: { label: string; matched: boolean }[]`.

Ref hedefi yok. `onFeedback` her tıklamada çağrılır (aynı yöne tekrar
tıklama da dahil, toggle-off anında bile). `overall`/`groups` GERÇEKTEN
değiştiğinde (içerik imzası — bkz. §6) geri bildirim seçimi otomatik
sıfırlanır.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: otomatik ton (her satırın kendi `score`/`overall`
değerinden).

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` | N/A — ayrı bir `tone` prop'u yok, renk eşiği tamamen `overall`/`score`'dan otomatik (`GlassMatchScore` ile aynı karar) |
| `size`/`variant` | N/A — spec'te istenmedi, tek sabit anatomi |
| `thickness`/`prominent` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `loading=true` | `groups`/`onFeedback` verilse de yok sayılır, yalnız skeleton + durum metni |
| `overall`/`group.score` aralık dışı/`NaN`/`Infinity` | Önce 0'a düşer (sonlu değilse), sonra [0,100]'e clamp + yuvarlanır |
| `confidence` aralık dışı | [0,100]'e clamp; sonlu değilse hiç render edilmez |
| `group.weight` boş string | Falsy kabul edilir, ağırlık satırı hiç render edilmez |
| `group.details` boş dizi/`undefined` | Grubun altında detay `<ul>` hiç render edilmez |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| genel skor/ton | `overall` (otomatik eşik: ≥70 success, 40-69 accent, <40 danger) | — | `aria-valuenow`, `data-tone` |
| grup skoru/ton | her `group.score`'dan bağımsız otomatik eşik | — | `aria-valuenow`, `data-tone` (grup başına) |
| güven | `confidence` (normalize) | — | görünür metin |
| geri bildirim seçimi | dahili state (`feedback: 'up'\|'down'\|undefined`); aynı yöne tekrar tıklama toggle-off; `overall`/`groups` içerik imzası değişince render sırasında otomatik `undefined`'a sıfırlanır | — | `aria-pressed`, `data-selected` |
| yükleme | `loading` prop | genel satır/grup listesi/geri bildirim tamamen (AI rozeti HARİÇ — bkz. §2) | `role="status"` (her zaman mount, metin toggle) |
| disabled/hover/focus/active | — | — | hover/focus/active PROP DEĞİL; yalnız `:focus-visible`/`@media(hover:hover)` |

**İçerik imzası (feedback sıfırlama):** `JSON.stringify({ overall:
clampedOverall, groups: groups.map(g => [g.id, clampScore(g.score), g.weight
?? null, g.details?.map(d => [d.label, d.matched]) ?? null]) })` bir önceki
render'ın imzasıyla (ref) karşılaştırılır; farklıysa geri bildirim seçimi
render sırasında (ekstra effect turu olmadan) sıfırlanır. Referans eşitliği
değil İÇERİK eşitliği kontrol edilir: aynı içerikle yeni bir `groups` dizisi
referansı verilirse seçim KORUNUR.

Katman sırası: `loading` (varsa AI rozeti hariç her şeyi bastırır) →
`overall` (clamp/ton, içerik imzasının parçası) → `groups` (clamp/ton +
içerik imzasının parçası, her grup bağımsız) → render.

## 7. Davranış

- Bar dolumu `width` 0.3s ease-out geçişle akar (genel satır + her grup
  satırı aynı süre/eğri); `prefers-reduced-motion: reduce`'ta geçiş kapanır.
- Geri bildirim butonları: `onFeedback` verilmezse hiç render edilmezler.
  Tıklamada `onFeedback(direction)` çağrılır ve tıklanan yön
  `aria-pressed="true"` olur; diğer yön otomatik `false`'a döner (karşılıklı
  dışlama, iki bağımsız `<button>` — roving tabindex/`radiogroup` YOK).
  Zaten seçili olan yöne TEKRAR tıklama seçimi geri alır (toggle);
  `onFeedback` bu tıklamada da çağrılır.
- Geri bildirim seçimi `overall`/`groups` GERÇEKTEN değiştiğinde (içerik
  imzası — §6) otomatik sıfırlanır; sıfırlama render sırasında (React'in
  "adjusting state during rendering" deseniyle) yapılır, ekstra bir görünür
  kare/effect turu üretmez.
- `loading`: skeleton içeriği (`skeletonBlock`) `aria-hidden`; `role="status"`
  düğümü mount anından itibaren DOM'dadır — `loading` `true`↔`false` arası
  geçişte yalnız METNİ değişir, düğüm sökülüp yeniden takılmaz. Skeleton
  animasyonu yalnız `opacity` (shimmer/gradient yok). Zorunlu "✦ AI" rozeti
  skeleton başlık satırının yanında normal (aria-hidden OLMAYAN) şekilde
  render edilir.
- Odak taşıma yok — component hiçbir zaman kendiliğinden odak almaz/taşımaz;
  tek etkileşim yüzeyi (geri bildirim butonları) doğal Tab sırasında durur.
- Responsive: kart konteynerin genişliğine uyar; grup başlığı/ağırlık/skor
  satırı dar alanda `flex-wrap` ile sarar, detay chip'leri satır sarar.
  Dokunmatik: geri bildirim butonları `pointer: coarse`'ta 44px'e yükselir.

## 8. İçerik kuralları

- `title` kısa kalmalı ("Uyum Dökümü", "Neden Bu Skor?").
- `group.label` kısa tutulmalı; uzun etiketler `overflow-wrap: anywhere` ile
  sarar (bkz. UzunIcerik story).
- `group.weight` ham görünür metin — component ağırlıkları toplamaz/
  doğrulamaz, yalnız gösterir; çağıran "%30" gibi kısa biçimde vermeli.
- `group.details[].label` kısa tutulmalı (chip tek satırda kalır).
- `groups` boş dizi veya `undefined` → grup bölümü hiç render edilmez, yalnız
  genel skor satırı ve rozet görünür (hata fırlatılmaz).
- AI rozeti metni sabit "✦ AI" — çağıran tarafından özelleştirilemez.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kart zemini | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` | — |
| başlık | color | `--lg-label` | — |
| genel/grup skor sayısı | color | `--lg-label` (tona bağlı DEĞİL — bkz. Do/Don't) | — |
| bar track | background | `--lg-hairline` | — |
| bar fill | background (inline style) | `var(--lg-success/-accent/-danger)` | otomatik eşik (`overall`/`group.score`) |
| grup ayırıcı | border-top | `--lg-hairline` | ilk grupta yok |
| ağırlık etiketi | color | `--lg-label-secondary` | — |
| AI rozeti zemin/metin | background/color | `color-mix(... var(--lg-accent) ... var(--lg-surface)/var(--lg-label))` | kontrat sabiti — `GlassMatchScore.module.css`'teki `.aiBadge` bloğuyla birebir aynı |
| detay chip (matched) | background/color | `color-mix(... var(--lg-success) ...)` / `--lg-success` (ikon) | `data-matched=true` |
| detay chip (unmatched) | background/color | `color-mix(... var(--lg-label) ...)` / `--lg-label-secondary` | `data-matched=false` |
| geri bildirim butonu | border/background/radius | `--lg-hairline`/`--lg-surface`/`--lg-radius-capsule` | `aria-pressed=true` → `--lg-accent` tint |
| skeleton | background | `color-mix(... var(--lg-label) 8% ...)` | `loading` |

**Borç (raw):** bar track yüksekliği 6px, AI rozeti font-size 10.5px/700
(kontrat sabiti, tasarım sistemi ölçeğinde yok) — `GlassMatchScore`'daki ring
çapı borcuyla aynı gerekçe.

## 10. Storybook kapsamı

Var: Default, Playground, RenkEsigi (genel + grup skorlarında otomatik eşik
üç örnek), States (Geri Bildirim: `onFeedback` var/yok + `loading`),
UzunIcerik, Responsive (mobile1 + dokunmatik geri bildirim butonları),
Erişilebilirlik (docs description'lı).

`Variants`/`Sizes`/`Temalar` ayrı story olarak yok: bu component'te `variant`
ekseni tanımlı değil (tek sabit anatomi), tema toolbar'la otomatik doğrulanır
(`GlassMatchScore` ile aynı karar).

## 11. Test kabul kriterleri

- [x] genel skor satırı meter rolü + valuemin/valuemax/valuenow + sabit "Genel Uyum" adıyla
- [x] overall clamp ([0,100], yuvarlama), `NaN`/`Infinity` → 0
- [x] her grup kendi meter rolünü, skorunu ve otomatik ton eşiğini (`data-tone`) taşır
- [x] grup ağırlığı verilince accessible name'e dahil edilir, verilmezse yalnız etiket kullanılır
- [x] detay chip'leri matched/unmatched `data-matched` ile ayrışır; eşleşme durumu görsel-gizli metinle AT'ye iletilir, yalnız ikon `aria-hidden`
- [x] `details` verilmeyen grupta detay listesi hiç render edilmez
- [x] AI rozeti her zaman render edilir; confidence geçerliyse metin eklenir, sonlu değilse gizlenir
- [x] geri bildirim butonları `onFeedback`'i doğru yönle çağırır + `aria-pressed` görsel seçimi işaretler; aynı yöne tekrar tıklama toggle-off yapar
- [x] `onFeedback` verilmezse buton hiç render edilmez
- [x] geri bildirim seçimi `overall`/`groups` içerik imzası değişince otomatik sıfırlanır; içerik AYNIYSA (farklı referans dahi olsa) seçim korunur
- [x] `loading=true` iken meter/grup/feedback yerine skeleton + `role="status"` durum metni render edilir; zorunlu "✦ AI" rozeti yine görünür kalır
- [x] `role="status"` düğümü `loading` `true`↔`false` geçişinde aynı düğüm olarak kalır (mount edilip sökülmez), yalnız metni değişir
- [x] `groups` boş dizi verilince grup listesi hiç render edilmez, genel satır yine görünür
- [x] eşleşmeyen detay chip'inde metne element-genelinde opacity uygulanmaz (WCAG AA kontrast regresyonu)
- [x] AI rozeti CSS bloğu `GlassMatchScore.module.css`'teki `.aiBadge` ile hizalı
- [ ] reduced-motion'da bar/skeleton geçişlerinin kapanması (visual)

## 12. Do / Don't

- ✅ `groups`'u yalnız gerçekten hesaplanmış, kullanıcı kriterlerine dayalı
  gruplarla doldur — AI çıktısı asla otomatik eylem tetiklemez, yalnız bilgi
  sunar.
- ✅ AI rozetini her zaman göster — kaynağı insan olan içerikle asla
  karıştırma.
- ✅ Skor sayılarını (genel/grup) her zaman `--lg-label` ile nötr tonda
  render et — semantik renk yalnız bar dolgusuna/ikona uygulanır, metne
  değil (durum bilgisi zaten görünür sayı + `aria-valuenow`'da, yalnız
  renkle taşınmaz).
- ✅ `role="status"` düğümünü koşullu mount/unmount ETME — her zaman DOM'da
  tut, yalnız metnini değiştir.
- ❌ `GlassScoreMeter`'ı import edip bar mantığını paylaşma — iki
  component'in ARIA/AI sözleşmesi kasıtlı olarak ayrı.
- ❌ `groups`/`onFeedback` API'sini `loading` sırasında render etmeye
  çalışma — yükleme durumu her şeyi bastırır.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.
- ❌ `group.id`'yi DOM `id` attribute'una doğrudan yazma — yalnız React
  `key`; ARIA id'leri her zaman `useId()` + index'ten türetilir.

**Açık kararlar:** `group.weight` toplamının 100'e denk gelip gelmediğinin
doğrulanması (şu an component hesaplama yapmaz, ham metin gösterir) ·
detay chip'leri için maksimum eleman sayısı/sıralama önceliği · gruplar
arası genişletme/daraltma (accordion) ihtiyacı (spec'te istenmedi, tüm
gruplar her zaman açık gösteriliyor).

## Changelog

- 2026-07-17: İlk sürüm — genel skor satırı (mini bar) + grup grup skor
  dökümü (bar + opsiyonel ağırlık etiketi + opsiyonel detay chip'leri),
  zorunlu AI rozeti + opsiyonel güven metni, 👍/👎 geri bildirim, flat
  `loading` placeholder'ı ve her zaman mount edilmiş `role="status"` duyuru
  düğümü (önceki dalgalarda yakalanan "sonradan mount edilen canlı bölge
  duyurulmaz" bulgusuna karşı baştan tasarlandı).
