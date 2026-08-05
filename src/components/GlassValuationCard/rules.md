---
name: GlassValuationCard
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassValuationCard Kuralları

## 1. Amaç

Yapay zekâ tarafından üretilmiş emlak değerlemesini (AVM — Otomatik Değerleme
Modeli) tahmin + min–max aralık barı + opsiyonel liste fiyatı
karşılaştırmasıyla sunan içerik kartı. AI-first standardını (Dalga 1
kontratı "AI-first standardı" bölümü) uygular: `aiGenerated` rozeti
koşulsuz, `confidence` metinle duyurulur, geri bildirim kullanıcı onayı
gerektirir, `loading` kendi flat placeholder'ını çizer — bu kart **daima**
AI üretimidir, rozet hiçbir prop'a bağlı değildir.

- **Kullan:** ilan detay sayfasında "AI tahmini değer" bloğu, satıcı/alıcı
  için fiyat karşılaştırma özeti.
- **Kullanma:** kullanıcı/uzman tarafından girilen manuel fiyat geçmişi (→
  `GlassSpecTable`), tekil 0-100 skor/metre (→ `GlassScoreMeter`), makine
  üretimi serbest metin özet (→ `GlassAiSummaryCard`).

| İlgili | Farkı |
|---|---|
| GlassAiSummaryCard | Serbest metin özet + artı/eksi listesi; ValuationCard sayısal tahmin + aralık barı |
| GlassPriceHeader | İlanın kendi (insan girdili) fiyatı; ValuationCard yapay zekâ tahmini, her zaman `aiGenerated` |
| GlassScoreMeter | Tekil 0-100 `role="meter"`; ValuationCard'daki `confidence` bir meter değil, rozetin yanında metin etiketi |

## 2. Semantik sözleşme

- Kök: `<div role="group" aria-label="AI değerleme">` — görünür bir başlık
  metni yok (rozet + büyük tahmin sayısı bağlamı zaten taşır), bu yüzden
  `aria-labelledby` yerine sabit `aria-label` kullanılır.
- `aiGenerated` rozeti (`✦ AI`, `aria-label="Yapay zekâ üretimi"`) her
  state'te (içerik/`loading`/boş) koşulsuz render edilir — kartın türünü
  tanımlar, veri varlığına bağlı değildir.
- `confidence` yalnız gerçek içerik state'inde (`loading`/boş değilken)
  rozetin yanında "%N güven" metniyle duyurulur (yalnız renk değil metin).
- Min–max ray (`rangeTrack`) tamamen dekoratif — `aria-hidden`; alt/üst
  sınır ve tahmin zaten görünür metin düğümleri olarak (tabular sayı,
  `rangeLabels`, `estimateValue`) DOM'da mevcuttur, AT ray'i atlayıp bu
  metinleri okur.
- Geri bildirim: `role="group"` + `aria-label="Bu değerleme faydalı
  mıydı?"` içinde iki gerçek `<button>` (`aria-pressed`, accessible name
  "Faydalı" / "Faydalı değil"). Roving tabindex/radiogroup DEĞİL — iki
  bağımsız tab-sırasında buton, tıklama karşılıklı dışlar (aynı anda yalnız
  biri `aria-pressed="true"`).
- Portal yok, ref forwarding yok, odak zorla taşınmaz (buton tıklaması
  kendi odağını korur, hiçbir etkileşim başka bir öğeye `focus()`
  çağırmaz).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| aiGenerated rozeti | ✅ | sabit "✦ AI" | Koşulsuz, tüm state'lerde (loading/boş dahil) görünür |
| confidence etiketi | — | `"%N güven"` | Rozetin yanında; yalnız içerik state'inde, `loading`/boş'ta yok |
| geri bildirim butonları | — | 👍/👎 | Yalnız `onFeedback` verilirse, yalnız içerik state'inde render edilir |
| estimateValue | ✅ (içerik state'i) | tabular TL metni | Büyük, `--lg-text-display` |
| rangeTrack + estimatePoint | ✅ (içerik state'i) | — | `aria-hidden`, konum oransal, aralık dışı değer uçta clamp edilir |
| listPoint + legend | — | — | Yalnız geçerli `listPrice` verilirse |
| comparison | — | cümle | Yalnız geçerli `listPrice` verilirse; gerçek yüzde hesaplanır |
| asOf | — | metin | Verildiği gibi gösterilir, ayrıştırılmaz |
| loading placeholder | — | flat çubuklar | `aria-hidden`, yalnız `loading=true` iken; `srOnly` metin AT'ye "yükleniyor" bildirir |
| boş durum metni | — | "Değerleme yok" | Yalnız `estimate`/`rangeLow`/`rangeHigh` geçersizken |

`inline` varyantında yalnız rozet + tahmin + aralık metni render edilir —
confidence/geri bildirim/comparison/asOf bilinçli olarak yok (§5, §12).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| estimate | prop | `number` | — (zorunlu) | — | TL; sonlu değilse veya `<= 0` ise kart boş duruma düşer |
| rangeLow | prop | `number` | — (zorunlu) | — | TL; sonlu değilse veya negatifse kart boş duruma düşer |
| rangeHigh | prop | `number` | — (zorunlu) | — | TL; sonlu değilse veya negatifse kart boş duruma düşer; `rangeLow`'dan küçükse ikisi takas edilir |
| listPrice | prop | `number` | — | — | Geçersizse (sonlu değil/`<=0`) sessizce yok sayılır — kart boş duruma düşmez, yalnız karşılaştırma satırı görünmez |
| confidence | prop | `number` | — | — | [0,100] clamp; sonlu değilse/`undefined` → gizli |
| asOf | prop | `string` | — | — | Olduğu gibi render edilir, tarih ayrıştırma/biçimlendirme yapılmaz |
| onFeedback | prop | `(value: 'up'\|'down') => void` | — | — | Verilirse geri bildirim butonları render edilir |
| loading | prop | `boolean` | `false` | — | Gerçek içerik yerine placeholder; rozet yine görünür |
| variant | prop | `'panel'\|'inline'` | `'panel'` | — | `inline` tek satır özet, diğer tüm alanları atlar |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`aria-label` hariç) | — | — | `className`/`style` birleştirilir, kalanı köke geçer |

Ref hedefi yok. Geri bildirim seçili durumu (`selected: 'up'|'down'|null`)
tamamen component içinde tutulur — dışarıya `value`/`defaultValue`
sözleşmesi açılmaz; yalnız `onFeedback` callback'i ve görsel `aria-pressed`
durumu gözlemlenebilir (kontrat "Geri bildirim deseni" maddesi controlled
value istemiyor, yalnız callback + görsel seçili durum istiyor).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant='panel'`, `listPrice`/`confidence`/
`asOf`/`onFeedback` verilmemiş.

| Eksen | Durum |
|---|---|
| `material`/`tone`/`size`/`thickness`/`tint`/`prominent` | N/A — flat içerik kartı, tek sabit ölçek, cam eksen yok |
| `variant` | `panel` (tam) / `inline` (tek satır özet) |

| Yasak / türetilen | Davranış |
|---|---|
| `estimate` sonlu değil veya `<= 0` | Kart "Değerleme yok" boş duruma düşer (rozet yine görünür) |
| `rangeLow`/`rangeHigh` sonlu değil veya negatif | Aynı şekilde boş duruma düşer |
| `rangeLow > rangeHigh` | Sessizce takas edilir — hata fırlatılmaz |
| `estimate` aralık dışında (low/high dışı) | Ray üzerindeki nokta 0%/100%'e clamp edilir; **görünen sayı asla değiştirilmez** |
| `listPrice` sonlu değil veya `<= 0` | Karşılaştırma satırı + ikinci işaret + legend hiç render edilmez; kart boş duruma düşmez |
| `confidence` [0,100] dışı | Sessizce clamp (150→100, -30→0) |
| `confidence` `NaN`/`Infinity` | Etiket tamamen gizlenir |
| `loading=true` | Tüm gerçek içerik yok sayılır, yalnız rozet + placeholder görünür (empty-state kontrolünden ÖNCE değerlendirilir) |
| `variant='inline'` | confidence/comparison/asOf/geri bildirim hiç render edilmez (açık karar, §12) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| `loading` | prop | tüm gerçek içerik + boş-durum kontrolü | kök `aria-busy="true"`; her zaman mount'lu `srOnly` `aria-live="polite"` span, metni yalnız `loading` iken "Değerleme yükleniyor" |
| boş durum | türetilen (`estimate`/`rangeLow`/`rangeHigh` geçersiz) | tahmin/ray/karşılaştırma/geri bildirim | yalnız "Değerleme yok" metni |
| geri bildirim seçimi | iç state (tıklama) | önceki seçili yön | her butonun `aria-pressed` |
| hover/focus/active | — | — | prop değil; yalnız CSS `:hover`/`:focus-visible` |

Katman sırası: `loading` → boş-durum kontrolü (estimate/range) → aralık
normalize (min/max takas) → `listPrice`/`confidence` geçerlilik → render.
Geri bildirim seçimi yalnız kullanıcı tıklamasıyla değişir, hiçbir zaman
prop/effect ile zorla taşınmaz — bunun tek istisnası içerik değişimi:
`FeedbackButtons` her render'da köke `key={estimate|low|high}` içerik
imzasıyla geçirilir, imza değişince React component'i unmount/mount eder
ve seçili yön (`selected`) otomatik sıfırlanır (Codex bulgusu — önceden
`estimate`/aralık değişse de eski seçim ekranda kalıyordu). Aynı yöne
tekrar basmak no-op'tur (GlassAiSummaryCard'daki toggle deseniyle aynı) —
`onFeedback` tekrar tetiklenmez.

`loading` canlı bölgesi (`srOnly` + `aria-live="polite"`) kartın tüm üç
state'inde (`loading`/boş/içerik) aynı JSX konumunda render edilir ve
metni koşullu (`loading ? 'Değerleme yükleniyor' : ''`) — span'ın kendisi
hiçbir zaman koşullu mount/unmount edilmez (SearchBar/GlassTrustSignalPanel
fix'iyle aynı desen); aksi halde ekran okuyucular loading'e giriş/çıkışı
kaçırabilir.

## 7. Davranış

- Pointer/touch: geri bildirim butonları gerçek `<button>`, `pointer:
  coarse` altında 44px'e yükselir (base `--lg-control-sm`).
- Klavye: `Tab` sırasıyla iki geri bildirim butonuna ayrı ayrı ulaşılır
  (roving yok, doğal DOM sırası); `Enter`/`Space` native buton davranışı.
- Focus: butona tıklama kendi odağını korur; component hiçbir zaman
  programatik `focus()` çağırmaz (kontrat: "controlled modda koşulsuz odak
  taşıma" hatasından bilinçli kaçınma).
- Async yok — `loading` dışarıdan kontrol edilen salt bir görüntü modu,
  component kendi zamanlayıcısı/fetch'i yok.
- Responsive: `panel` konteynerinin %100 genişliğine uyar (`rangeTrack`
  dahil); `inline` satır içine akar, dar konteynerde `flex-wrap` ile sarar.
- Overlay yok, portal yok.

## 8. İçerik kuralları

- `estimate`/`rangeLow`/`rangeHigh` ham `number` (TL) — string/biçimli
  değer geçilmez; biçimlendirme (`tr-TR`, binlik ayraç, "TL" son eki)
  component içinde yapılır.
- `asOf` hazır biçimli metin olarak geçilir (ör. "16 Temmuz 2026
  itibarıyla") — component tarih ayrıştırmaz, olduğu gibi basar.
- Karşılaştırma cümlesi component tarafından hesaplanır
  (`((listPrice - estimate) / estimate) * 100`, mutlak değer); çağıran
  yüzdeyi elle hesaplayıp string geçirmez.
- **Eşitlik kararı HAM değerle verilir** (`estimate === listPrice`) —
  yuvarlanmış yüzdeyle DEĞİL. Yüzde metni 1 ondalıkla (tr-TR virgüllü,
  ör. "%0,4") gösterilir; böylece küçük gerçek farklar yanlışlıkla "eşit"
  görünmez (Codex bulgusu — önceki `Math.round` tabanlı eşitlik kontrolü
  %0,4 gibi farkları yutuyordu).
- Yüzde hesabı sonlu çıkmazsa (`Number.isFinite` false — aşırı büyük/küçük
  ama yine de sonlu `estimate`/`listPrice` çiftlerinde bölme/çarpma
  taşabilir) veya `%999`'u aşarsa karşılaştırma satırı **hiç render
  edilmez** (kartın geri kalanı etkilenmez).
- AI çıktısı hiçbir zaman otomatik bir eylem tetiklemez (sayfa
  yönlendirme, form doldurma, ilan güncelleme vb.) — yalnız bilgilendirme +
  kullanıcı onaylı geri bildirim.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| panel kök | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` | — |
| estimateValue | color/font-size | `--lg-label` / `--lg-text-display` | — |
| rangeTrack | background | `color-mix(in srgb, var(--lg-accent) 16%, var(--lg-hairline))` | — |
| estimatePoint | background | `--lg-accent` | — |
| listPoint/legendDotList | background | `--lg-label-secondary` | — |
| rangeLabels/legend/asOf | color | `--lg-label-secondary` | — |
| comparison | color | `--lg-label` (vurgu yalnız `<strong>` ağırlığında, renk yok — WCAG 1.4.3) | — |
| badge (`aiBadge`) | background/color | `color-mix(in srgb, var(--lg-accent) 12%, var(--lg-surface))` / `color-mix(in srgb, var(--lg-accent) 70%, var(--lg-label))` | Kontrat "AI-first standardı" — tüm AI component'lerinde AYNI, kopya CSS kabul (bkz. `GlassAiSummaryCard`/`GlassTrustSignalPanel`) |
| feedbackButton seçili | border/background/color | `color-mix(in srgb, var(--lg-accent) 50%, transparent)` / `12%` zemin / `--lg-label` | Yalnız `aria-pressed=true` iken |
| radius | — | `--lg-radius-card` (panel) / `--lg-radius-capsule` (rozet, ray, nokta) / `--lg-radius-chip` (geri bildirim butonu, placeholder) | — |
| boşluk | gap/padding | `--lg-space-1..5` | — |
| yazı | font-size | `--lg-text-caption/footnote/body/display` | — |

**Borç (raw / mikro-geometri):** token karşılığı olmayan gösterge ölçüleri
component kökünde yerel değişken olarak toplanır (görsel değer değişmedi):
`--vc-track-h: 8px` (ray + placeholder ray) · `--vc-point-size: 14px` ·
`--vc-listpoint-size: 10px` · `--vc-point-ring: 2px` · `--vc-dot-size: 8px`
(legend) · `--vc-ai-pad-block: 3px` · `--vc-inline-ph-w: 160px` —
GlassScoreMeter'in ring/bar kalınlık borcuyla aynı gerekçe: gösterge ölçeği
için token yok. 2026-07-24: AI rozeti font-size borcu `--lg-text-badge`'e
(10.5→11px) taşınarak kapandı; `estimateValue` font-weight 800→700,
feedbackButton font-size → `--lg-text-body`, nokta/legend `border-radius:
50%` → `--lg-radius-capsule`. feedbackButton dokunmatik hedefi
pointer:coarse'ta `--lg-control-md` token'ından gelir (coarse'ta 44px —
birebir eski raw değer).

## 10. Storybook kapsamı

Var: Default, Playground, Variants (panel/inline), ListPriceKarsilastirma
(üstünde/altında/eşit üç örnek), Confidence, States (loading, boş durum,
geri bildirimli), UzunIcerik (uzun `asOf`, büyük sayılar), Responsive
(mobile1), Erişilebilirlik (docs description'lı).

`Sizes`/`Materials` story'si N/A — tek sabit ölçek, cam eksen yok
(`GlassAiSummaryCard` ile aynı karar).

## 11. Test kabul kriterleri

- [x] `role="group"` + `aria-label="AI değerleme"` ile render olur, rozet
      koşulsuz görünür
- [x] tahmin + min/max tabular TL metni olarak görünür
- [x] `rangeLow > rangeHigh` verilince sessizce takas edilir
- [x] `estimate`/`rangeLow`/`rangeHigh` sonlu değil veya negatifse boş
      duruma düşer ("Değerleme yok"), rozet yine görünür
- [x] `listPrice` verilince gerçek yüzde farkı hesaplanır, "üstünde" metni
- [x] `listPrice` tahminden düşükse "altında" metni
- [x] `confidence` [0,100] dışı clamp edilir; sonlu değilse hiç gösterilmez
- [x] `onFeedback`: butonlar render edilir, tıklama çağırır, `aria-pressed`
      karşılıklı dışlar
- [x] `onFeedback` verilmezse geri bildirim butonları render edilmez
- [x] `loading=true`: gerçek tahmin metni yok, `aria-busy="true"`, rozet
      görünür
- [x] küçük gerçek yüzde farkı (%0,4) yuvarlanıp "eşit" görünmez; gerçek
      yön + 1 ondalıklı yüzde gösterilir
- [x] `estimate === listPrice` (ham değer) ise "eşit" metni gösterilir
- [x] yüzde sonlu çıkmazsa (aşırı sonlu girdide taşma) veya `%999`'u
      aşarsa karşılaştırma satırı hiç render edilmez
- [x] `estimate`/aralık değişince geri bildirim seçimi sıfırlanır (yeni
      `key` içerik imzası)
- [x] aynı yöne tekrar basmak no-op'tur, `onFeedback` tekrar tetiklenmez
- [x] `loading` canlı bölgesi her zaman mount'lu kalır — loading↔içerik
      geçişinde aynı DOM düğümü sürer, yalnız metni güncellenir
- [x] `inline` varyant tek satırda rozet + tahmin + aralık metni gösterir
- [ ] Rozet/nokta kontrastı (visual)
- [ ] dar container'da ray/legend kırılması (visual)

## 12. Do / Don't

- ✅ `confidence` yalnız gerçek bir model çıktısı varsa geç — uydurma/sabit
  değer verme (rozetin anlamı zedelenir).
- ✅ `onFeedback` geçtiğinde sonucu kendi tarafında kaydet — component
  hiçbir state'i dışarı senkronize etmez.
- ✅ Liste fiyatı karşılaştırmasını component'e hesaplat — yüzdeyi elle
  hesaplayıp `asOf` gibi serbest metne gömme.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı (Dalga 1
  kontratı).
- ❌ `estimate`/`comparison` metnine semantik renk (success/danger)
  uygulama — liste fiyatının üstünde/altında olması iyi/kötü değildir,
  nötr bilgidir (WCAG 1.4.3, ayrıca yanlış değer yargısı iması).
- ❌ Geri bildirim tıklamasında başka bir öğeye programatik `focus()`
  çağırma.
- ❌ `inline` varyantına confidence/geri bildirim eklemeyi bekleme — bu
  varyant bilinçli olarak yalnız rozet + tahmin + aralık taşır.

**Açık kararlar:** `listPrice` geçersizken kartın boş duruma düşmemesi
(yalnız karşılaştırma satırının sessizce kaybolması) — `estimate`/`range`
çekirdek veri, `listPrice` isteğe bağlı zenginleştirme olduğundan · `inline`
varyantın confidence/comparison/asOf/geri bildirimi hiç taşımaması (tek
satır sözleşmesi net kalsın diye — tam detay gerekiyorsa `panel` kullanılır)
· `rangeLow`/`rangeHigh` için `0` değerinin geçerli kabul edilmesi (yalnız
negatif ve sonlu-olmayan reddedilir), `estimate` için ise `> 0` şartı
(bölme/konum hesaplarının anlamlı kalması için) · geri bildirim "gönderildi"
durumunun kalıcılığı (sayfa yenilemede sıfırlanır — çağıranın
localStorage/API senkronizasyonu sorumluluğu).

## Changelog

- 2026-07-17: İlk sürüm — tahmin + min–max aralık barı, opsiyonel liste
  fiyatı karşılaştırması (gerçek yüzde hesabı), koşulsuz `aiGenerated`
  rozeti, metinle duyurulan `confidence`, karşılıklı dışlayan geri bildirim
  butonları, flat/parıltısız `loading` placeholder'ı, `panel`/`inline`
  varyantları.
- 2026-07-17: Codex review fix — (1) eşitlik kararı ham değerle
  (`estimate === listPrice`), yüzde 1 ondalıkla gösterilir, sonlu
  çıkmayan/`%999` üstü yüzdelerde karşılaştırma satırı gizlenir; (2)
  `estimate`/aralık değişince geri bildirim seçimi `key` içerik imzasıyla
  sıfırlanır, aynı yöne tekrar basmak no-op; (3) `loading` `srOnly`
  canlı bölgesi tüm state'lerde her zaman mount'lu, yalnız metni koşullu.
  6 yeni regresyon testi.
- 2026-07-24: Tasarım sistemi uyum düzeltmesi — AI rozeti →
  `--lg-text-badge`; `estimateValue` font-weight 800→700; feedbackButton →
  `--lg-text-body`; nokta/legend `border-radius: 50%` →
  `--lg-radius-capsule`; ray/nokta/placeholder mikro-geometrisi kök
  `--vc-*` değişkenlerinde toplandı (görsel değer değişmedi, bkz. §9).
