---
name: GlassValuationDrivers
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassValuationDrivers Kuralları

## 1. Amaç

AI değerleme sürücüleri — `GlassValuationCard`ın derin ekranı. İlanın tahmini
değerini etkileyen faktörleri ("Deniz manzarası", "Bina yaşı"...) tornado-
benzeri yatay bar listesiyle özetler: merkez çizgiden sağa pozitif (değeri
artıran), sola negatif (değeri azaltan) etki, bar genişliği |impact| listedeki
en büyüğe normalize edilerek belirlenir. AI-first component: içerik AI
tarafından üretildiği için "✦ AI" rozeti zorunlu ve daima görünür.

- **Kullan:** ilan detay sayfasında "bu değer nasıl hesaplandı" derin ekranı/
  genişletilmiş kart, AI değerleme özetinin gerekçe kırılımı.
- **Kullanma:** tekil bir uyum/skor göstergesi (→ `GlassMatchScore`), nesnel/
  kalıcı bir konum metriği (→ `GlassScoreMeter`), çok satırlı ham özellik
  künyesi (→ `GlassFeatureGroup`).

| İlgili | Farkı |
|---|---|
| GlassMatchScore | Tekil 0-100 kişisel uyum skoru + kriter chip'leri; ValuationDrivers imzalı (±) sayısal etkenlerin bar kırılımıdır, tekil skor taşımaz |
| GlassScoreMeter | Nesnel/kalıcı metrik, AI-first sözleşmesi yok; ValuationDrivers her zaman AI çıktısıdır |
| GlassSpecTable | Ham özellik/değer tablosu; ValuationDrivers yalnız *değere etkisi olan* faktörleri işaretli büyüklükle gösterir |

## 2. Semantik sözleşme

- Kök: `<div>` (`article` değil — tek bir "değerlendirme" bildirimi, ayrık bir
  doküman bölümü değil; `GlassMatchScore` ile aynı karar).
- Sürücü listesi: `<ul role="list"><li>` — `list-style: none` Safari/VoiceOver'da
  `ul`'un örtük `list` rolünü düşürdüğü için `role="list"` açıkça eklenir; her
  satır doğal `listitem` rolünü korur.
- Liste `aria-labelledby` ile görünür başlığa (`title`) bağlıdır; `baseText`
  verilirse `aria-describedby` ile de aynı listeye bağlanır (`aria-label`
  DEĞİL — çift okuma olmaz).
- Bar görselleştirmesi (`track`, `half`, `bar`, `centerLine`) tamamen
  `aria-hidden="true"` — dekoratif. Yön bilgisi (artırıyor/azaltıyor) AT'ye
  yalnız renkle veya +/- işaretine güvenilerek DEĞİL, her satırın görünür
  `impactText`'inin yanına eklenen görsel-gizli (`srOnly`, `aria-hidden`
  DEĞİL) "— değeri artırıyor/azaltıyor/etkilemiyor" metniyle iletilir.
- "✦ AI" rozeti: `aria-label="Yapay zekâ üretimi"` — görünür "✦ AI" metni AT
  için yeterince açıklayıcı olmadığından geçersiz kılınır.
- `confidence` metni ("%N güven") görünür düz metin — ayrı ARIA gerekmez.
- Geri bildirim: gerçek `<button aria-pressed>` (👍/👎), accessible name
  "Faydalı"/"Faydalı değil" — `role="radiogroup"` DEĞİL, iki bağımsız toggle
  (bkz. `GlassMatchScore` §2 aynı gerekçe, roving tabindex gerekmez). Buton
  çifti görünür soru metnine ("Bu değerlendirme faydalı mıydı?")
  `role="group"` + `aria-labelledby` ile programatik bağlıdır — soru metni
  `aria-label` olarak TEKRARLANMAZ (çift kaynak/çift okuma olmaz, tek görünür
  metin tek gerçek kaynak kalır).
- `loading=true`: liste/feedback render edilmez; tek duyuru noktası
  `role="status"` + görünür olmayan (`srOnly`) "{title} hesaplanıyor" metni —
  görsel placeholder tamamen `aria-hidden`, TEK istisna zorunlu "✦ AI" rozeti
  (skeleton başlık satırının yanında normal/erişilebilir kalır).
- `role="status"` düğümü component'in ömrü boyunca DAİMA mount edilir —
  `loading` true/false geçişinde bu düğüm hiç unmount/remount OLMAZ, yalnız
  `srOnly` metni değişir (sonradan-mount edilen canlı bölgeler bazı ekran
  okuyucularda güvenilir duyurulmaz). `loading` true→false geçtiğinde metin
  "{title} hazır" olarak güncellenir (sonuç hazır olduğuna dair duyuru);
  component ilk kez `loading=false` ile mount edildiğinde ise metin boş kalır
  (sahte "hazır" duyurusu YOK — hiçbir şey gerçekten tamamlanmadı). Duyuru
  metni `loading` YANINDA `title`'a da bağımlıdır: aynı `loading` değeri
  korunurken `title` değişirse (ör. yükleniyorken ya da "hazır" duyurusundan
  sonra farklı bir ilana geçildiğinde) metin güncel başlıkla yenilenir — TEK
  istisna: hiç duyuru yapılmamış boş durumda (`statusText === ''`, henüz hiç
  `loading` olmamış) yalnız `title` değişimi sahte bir "hazır" duyurusu
  TETİKLEMEZ.
- `drivers=[]`: liste (`role="list"`) hiç render edilmez, yerine görünür
  bilgilendirici bir paragraf ("Değerlemeyi etkileyen bir faktör bulunamadı.")
  gösterilir — hata fırlatılmaz, boş `<ul>` üretilmez.
- Portal yok, ref forwarding yok (statik/kontrollü sunum kararı, diğer içerik
  katmanı component'leriyle tutarlı).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| başlık | ✅ | `title` (default "Değerlemeyi Etkileyenler") | Accessible name kaynağı |
| AI rozeti | ✅ (her zaman) | "✦ AI" | Kontrat sabit CSS'i — component'ler arası birebir aynı |
| güven metni | — | "%N güven" | Yalnız `confidence` sonluysa; rozetin yanında |
| baz metni | — | `baseText` | Başlığın altında, listeye `aria-describedby` ile bağlı |
| sürücü listesi | ✅ | `drivers[]` bar satırları | `role="list"`; boşsa bilgi metni |
| bar/track | ✅ (satır başına) | merkez çizgi + sol/sağ dolum | Tamamen `aria-hidden`, dekoratif |
| impact metni | ✅ (satır başına) | `impactText` + srOnly yön | Görünür, `data-tone` renkli |
| not | — (satır başına) | `note` | Yalnız verilirse render edilir |
| geri bildirim | — | 👍/👎 | Yalnız `onFeedback` verilirse |

Children kabul edilmez — tamamen prop güdümlü. `GlassValuationDriversProps`,
`HTMLAttributes<HTMLDivElement>`'tan `'children'`ı da (`'title'`nin yanında)
tip düzeyinde `Omit` eder — bu render-zamanı bir engelleme değil, geçersiz bir
kullanımın derleme zamanında yakalanması içindir (bkz. §4).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| drivers | prop | `{ id, label, impact, impactText, note? }[]` | — (zorunlu) | — | Bar genişliği en büyük \|impact\|'e normalize edilir; sonlu olmayan `impact` 0 sayılır |
| baseText | prop | `string` | — | — | Başlığın altında görünür kıyas referansı |
| title | prop | `string` | `'Değerlemeyi Etkileyenler'` | — | Accessible name kaynağı |
| confidence | prop | `number` | — | — | [0,100]'e clamp; sonlu değilse gizlenir (rozet yine görünür) |
| onFeedback | prop | `(value: 'up' \| 'down') => void` | — | — | Verilirse 👍/👎 butonları görünür |
| loading | prop | `boolean` | `false` | — | true → flat skeleton + `role="status"` |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`title`/`children` hariç) | — | — | `className`/`style` birleştirilir; `children` tip düzeyinde omit edilir (component'e içerik geçirilemez — render edilecek bir children yolu YOK) |

Ref hedefi yok. `driver.id` yalnız React key ve içerik imzası (feedback
sıfırlama) için kullanılır — hiçbir zaman DOM `id` alanına yazılmaz (satır
listesinde ARIA IDREF ihtiyacı yok). `onFeedback` her tıklamada çağrılır (aynı
yöne tekrar tıklama toggle-off dahil).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: tek görsel biçim — ayrı `variant`/`size` ekseni yok
(spec'te istenmedi, bar genişliği tamamen `impact` verisinden türetilir).

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` (satır bazlı) | N/A prop olarak açık değil — her satırın tonu (`success`/`danger`/`neutral`) otomatik `impact`'in işaretinden türetilir |
| `size`/`variant` | N/A — spec'te istenmedi |
| `thickness`/`prominent` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `drivers=[]` | Liste render edilmez, bilgilendirici metin gösterilir (hata fırlatılmaz) |
| `loading=true` | `drivers`/`onFeedback` verilse de yok sayılır, yalnız placeholder + durum metni |
| `impact` `NaN`/`Infinity` | 0 kabul edilir → ton `neutral`, bar genişliği 0 |
| `confidence` aralık dışı | [0,100]'e clamp; sonlu değilse (`NaN`/`Infinity`) hiç render edilmez |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| satır tonu | `driver.impact` işareti (>0 success, <0 danger, 0/sonlu-değil neutral) | — | `data-tone`, srOnly yön metni |
| bar genişliği | `|impact| / maxAbsImpact` (listedeki en büyük, guard: min 1) | — | dekoratif (`aria-hidden`) |
| güven | `confidence` (normalize) | — | görünür metin |
| geri bildirim seçimi | dahili state (`feedback: 'up'\|'down'\|undefined`); aynı yöne tekrar tıklama toggle-off; `drivers`/`baseText` içerik imzası değişince render sırasında otomatik `undefined`'a sıfırlanır | — | `aria-pressed`, `data-selected` |
| yükleme | `loading` prop | liste/feedback tamamen (AI rozeti HARİÇ — bkz. §2) | `role="status"` |
| durum duyurusu (`statusText`) | dahili state; `loading` VE `title`'ın ikisine de bağımlı (ref'le karşılaştırılır) | — | `role="status"` `srOnly` metin |
| disabled/hover/focus/active | — | — | hover/focus/active PROP DEĞİL; yalnız `:focus-visible`/`@media(hover:hover)` |

**İçerik imzası (feedback sıfırlama):** `JSON.stringify({ drivers:
drivers.map(d => [d.id, d.label, d.impact, d.impactText]), baseText:
baseText ?? null })` bir önceki render'ın imzasıyla (ref) karşılaştırılır;
farklıysa geri bildirim seçimi render sırasında (ekstra effect turu olmadan)
sıfırlanır — `GlassMatchScore` ile aynı desen (React docs "Adjusting state
when a prop changes"). Referans eşitliği değil İÇERİK eşitliği kontrol
edilir: aynı içerikle yeni bir `drivers` dizisi referansı verilirse seçim
KORUNUR.

Katman sırası: `loading` (varsa AI rozeti hariç her şeyi bastırır) →
`drivers` (boşsa bilgi metni, içerik imzasının parçası) → `baseText` (içerik
imzasının parçası) → render.

## 7. Davranış

- Bar genişliği `width` 0.3s ease-out geçişle akar (`GlassMatchScore`
  halkasıyla aynı süre/eğri — tutarlı "dolum" hissi); `prefers-reduced-motion:
  reduce`'ta geçiş kapanır.
- Geri bildirim butonları: `onFeedback` verilmezse hiç render edilmezler.
  Tıklamada `onFeedback(direction)` çağrılır ve tıklanan yön
  `aria-pressed="true"` olur; diğer yön otomatik `false`'a döner (karşılıklı
  dışlama, iki bağımsız `<button>` — roving tabindex/`radiogroup` YOK). Zaten
  seçili olan yöne TEKRAR tıklama seçimi geri alır (toggle); `onFeedback` bu
  tıklamada da çağrılır. Buton grubu `role="group"` + `aria-labelledby` ile
  görünür soru metnine ("Bu değerlendirme faydalı mıydı?") programatik olarak
  bağlıdır — ekranokuyucu grup adını duyurur.
- Geri bildirim seçimi `drivers`/`baseText` GERÇEKTEN değiştiğinde (içerik
  imzası — §6) otomatik sıfırlanır; aksi halde farklı bir ilana geçilse bile
  eski "faydalı" işareti ekranda asılı kalırdı.
- `loading`: skeleton çizgileri `aria-hidden`; `role="status"` düğümü
  ekranokuyucuya tek seferlik "{title} hesaplanıyor" duyurur. Skeleton
  animasyonu yalnız `opacity` (shimmer/gradient yok, kendi flat placeholder'ı).
  Zorunlu "✦ AI" rozeti skeleton başlık satırının yanında normal
  (aria-hidden OLMAYAN) şekilde render edilir. `title` `loading` sırasında
  (ya da "hazır" duyurusundan sonra) değişirse duyuru metni güncel başlığı
  yansıtacak şekilde yeniden hesaplanır — bkz. §2 ve §6.
- Odak taşıma yok — component hiçbir zaman kendiliğinden odak almaz/taşımaz;
  tek etkileşim yüzeyi (geri bildirim butonları) doğal Tab sırasında durur.
- Responsive: grid satırı (`etiket | bar | impactText`) konteynerin
  genişliğine uyar, `note` tam genişlikte alt satıra sarar
  (`grid-column: 1 / -1`). Dokunmatik: geri bildirim butonları
  `pointer: coarse`'ta 44px'e yükselir.

## 8. İçerik kuralları

- `title` kısa kalmalı ("Değerlemeyi Etkileyenler") — ayrıntı zaten satırlarda.
- `driver.label` kısa tutulmalı; uzun etiketler `overflow-wrap: anywhere` ile
  sarar (bkz. UzunIcerik story).
- `impactText` HAZIR gelir — component kendi sayı biçimlendirmesi yapmaz,
  yalnız `impact`'in işaretinden bar yönünü/tonunu türetir. Çağıran
  "4.250.000 TL" biçimini (nokta binlik ayraç) korumalıdır.
- `note` tek cümlelik somut gerekçe; verilmezse hiç render edilmez.
- `baseText` kısa kıyas referansı (ör. "Bölge medyanı: 5,1M"); verilmezse
  `aria-describedby` hiç eklenmez.
- AI rozeti metni sabit "✦ AI" — çağıran tarafından özelleştirilemez.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kart zemini | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` | — |
| başlık | color | `--lg-label` | — |
| baz metni | color | `--lg-label-secondary` | — |
| AI rozeti zemin/metin | background/color | `color-mix(... var(--lg-accent) ... var(--lg-surface)/var(--lg-label))` | kontrat sabiti — `GlassMatchScore`/`GlassChatDock` ile birebir aynı, component'ler arası kopya |
| bar (pozitif) | background | `color-mix(in srgb, var(--lg-success) 70%, transparent)` | `data-tone=success` |
| bar (negatif) | background | `color-mix(in srgb, var(--lg-danger) 70%, transparent)` | `data-tone=danger` |
| impactText | color | `--lg-label-secondary` | `data-tone` → `color-mix(... success/danger 55% ... --lg-label)` — Kağıt temada ≥5.17:1 (13px/700 metin için AA eşiği 4.5:1), `GlassAgencyCard` ile aynı oran |
| centerLine | background | `--lg-hairline` | — |
| geri bildirim butonu | border/background/radius | `--lg-hairline`/`--lg-surface`/`--lg-radius-capsule` | `aria-pressed=true` → `--lg-accent` tint |
| skeleton | background | `color-mix(... var(--lg-label) 8% ...)` | `loading` |

**Borç (raw):** bar/track yükseklikleri 18px (track)/8px (bar) — çok küçük
ölçekli görsel öğeler tasarım sistemi ölçeğinde yok, `GlassMatchScore`'daki
ring çapı borcuyla aynı gerekçe; AI rozeti font-size 10.5px/700 (kontrat
sabiti); `centerLine` 1px genişlik (kart hairline border'ıyla aynı 1px
konvansiyonu).

## 10. Storybook kapsamı

Var: Default, Playground, Variants (`Etki Büyüklüğü` — yüksek/düşük impact
aralığı örnekleri), States (`Geri Bildirim ve Yükleme`: `onFeedback` var/yok +
`loading` + boş `drivers`), UzunIcerik, Responsive (mobile1 + dokunmatik geri
bildirim butonları), Erişilebilirlik (docs description'lı).

`Sizes`/`Temalar` ayrı story olarak yok: `size` ekseni tanımlı değil, tema
toolbar'la otomatik doğrulanır (`GlassMatchScore` ile aynı karar).

## 11. Test kabul kriterleri

- [x] `role="list"` + `aria-labelledby` ile ad (default title dahil)
- [x] `baseText` verilince listeye `aria-describedby` ile bağlanır, verilmezse hiç eklenmez
- [x] her satırda görünen `impactText` + görsel-gizli yön metni ("değeri artırıyor/azaltıyor/etkilemiyor") birlikte yer alır
- [x] `note` yalnız verildiğinde render edilir
- [x] bar genişliği listedeki en büyük \|impact\|'e normalize edilir; `NaN`/`Infinity` impact 0 genişlik üretir
- [x] `drivers=[]` liste yerine bilgilendirici metin gösterir, hata fırlatmaz
- [x] AI rozeti her zaman render edilir; confidence geçerliyse metin eklenir, sonlu değilse gizlenir
- [x] geri bildirim butonları `onFeedback`'i doğru yönle çağırır + `aria-pressed` görsel seçimi işaretler; aynı yöne tekrar tıklama toggle-off yapar
- [x] `onFeedback` verilmezse buton hiç render edilmez
- [x] geri bildirim seçimi `drivers`/`baseText` içerik imzası değişince otomatik sıfırlanır; içerik AYNIYSA (farklı referans dahi olsa) seçim korunur
- [x] `loading=true` iken liste/feedback yerine `role="status"` durum metni render edilir; zorunlu "✦ AI" rozeti yine görünür kalır (güven metni gösterilmez)
- [x] `children` tip düzeyinde omit edilir; zorla (tip korumasını atlayarak) geçirilse dahi render edilmez
- [x] geri bildirim sorusu `role="group"` + `aria-labelledby` ile buton grubuna programatik bağlanır
- [x] durum duyurusu `title`'a da bağımlıdır: aynı `loading` değerinde `title` değişince metin güncellenir; hiç duyuru yapılmamış boş durumda yalnız `title` değişimi sahte "hazır" duyurusu üretmez
- [ ] reduced-motion'da bar/skeleton geçişlerinin kapanması (visual)

## 12. Do / Don't

- ✅ `impactText`'i her zaman çağırandan hazır al — component kendi para/yüzde
  biçimlendirmesi yapmaz, yalnız `impact`'in işaretinden yön/ton türetir.
- ✅ AI rozetini her zaman göster — `loading` dahil hiçbir durumda kaybolmaz.
- ✅ `drivers`'ı yalnız gerçekten hesaplanan faktörlerle doldur — AI çıktısı
  asla otomatik eylem tetiklemez, yalnız bilgi sunar.
- ❌ Bar rengini tek bilgi kaynağı yapma — yön her zaman `impactText` + srOnly
  metinle de iletilir.
- ❌ `driver.id`'yi DOM `id` alanına yazma — yalnız React key/içerik imzası.
- ❌ `loading` sırasında `drivers`/`onFeedback` API'sini render etmeye çalışma.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.

**Açık kararlar:** `drivers` için maksimum eleman sayısı/sıralama önceliği
(mutlak etkiye göre mi sıralanmalı?) · geri bildirim sonrası "gönderildi"
mikro-metni gösterip göstermeme (şu an component kendi başarı durumunu
taşımıyor, tamamen çağırana bırakıldı — `GlassMatchScore.onFeedback` ile aynı
karar).

## Changelog

- 2026-07-17: İlk sürüm — tornado-benzeri yatay bar listesi (merkez çizgiden
  sağa pozitif/sola negatif), zorunlu AI rozeti + opsiyonel güven metni,
  👍/👎 geri bildirim, flat `loading` placeholder, boş `drivers` bilgi metni.
- 2026-07-17: Codex konsolide QA raporu (Dalga 4) düzeltmeleri —
  `GlassValuationDriversProps` `HTMLAttributes`'tan `'children'`ı da (tip
  düzeyinde) omit eder; geri bildirim sorusu artık `role="group"` +
  `aria-labelledby` ile buton grubuna programatik bağlı; `role="status"`
  duyuru metni `loading` yanında `title` değişimine de tepki verir (aynı
  `loading` değerinde başlık değişse dahi eski başlıkla asılı kalmaz, boş/hiç
  duyurulmamış durumda ise sahte "hazır" duyurusu üretmez). İçerik imzası
  (feedback sıfırlama, §6) zaten ilk sürümden beri yapılandırılmış
  `JSON.stringify` tuple'ı kullanıyordu — raporun bu maddesi bu component için
  ek değişiklik gerektirmedi.
