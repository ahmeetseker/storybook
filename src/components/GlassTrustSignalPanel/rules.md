---
name: GlassTrustSignalPanel
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassTrustSignalPanel Kuralları

## 1. Amaç

Bir ilanın güven sinyallerini (EİDS/tapu eşleşmesi, AI içerik moderasyonu,
satıcı geçmişi, kimlik doğrulama vb.) durum ikonu + metniyle listeleyen
içerik paneli. Yalnız `verified`/`warning`/`failed`/`info` dört durumu değil,
sinyallerden biri yapay zekâ tarafından üretildiyse (`aiGenerated`) AI-first
sözleşmesini (rozet, güven yüzdesi, geri bildirim, yükleme) de uygular.
İçerik katmanı component'idir — bilinçli olarak cam DEĞİL: güven verisi
devamlı okunan bir değerlendirme, cam malzemenin anlamı yok (Dalga 1
kontratı §15).

- **Kullan:** ilan detay sayfasında güven/doğrulama özeti (`panel`), kart içi
  mini özet rozeti (`compact`).
- **Kullanma:** tek metrik/skor gösterimi (→ `GlassScoreMeter`), iklim/afet
  riski listesi (→ `GlassClimateRiskPanel`), AI özet paragrafı + artı/eksi (→
  `GlassAiSummaryCard`), ayrık tekil durum rozeti (→ `GlassBadge`).

| İlgili | Farkı |
|---|---|
| GlassClimateRiskPanel | 1-5 seviye ölçeği taşır; TrustSignalPanel 4 sabit durum (`verified/warning/failed/info`) + AI-first sözleşmesi taşır |
| GlassAiSummaryCard | Tüm kart AI üretimidir (koşulsuz rozet); TrustSignalPanel çoklu sinyal listesinde yalnız `aiGenerated` işaretli satırlarda rozet gösterir |
| GlassScoreMeter | Tekil 0-100 skor; TrustSignalPanel çoklu ayrık durumu listeler, `role="meter"` değil `role="list"` |
| GlassBadge | Tekil ayrık rozet; TrustSignalPanel çoklu sinyali aynı sözleşimle bir arada sunar |

## 2. Semantik sözleşme

- Kök: `<section aria-labelledby>` — `title` her zaman render edilir
  (varsayılan `'Güven Kontrolleri'`), bu yüzden section her zaman adlandırılır
  (GlassClimateRiskPanel'in aksine `title` burada opsiyonel-render değil).
- Sinyal listesi: `<ul role="list">` > `<li>` (native `listitem`).
  `list-style: none` Safari'de liste semantiğini düşürdüğünden `role="list"`
  açıkça verilir (GlassList/GlassClimateRiskPanel ile aynı desen).
- Durum ikonu bilgi taşır (dekoratif DEĞİL): `role="img"` + sabit `aria-label`
  (`'Doğrulandı'`/`'Uyarı'`/`'Başarısız'`/`'Bilgi'`) — durum asla yalnız renkle
  taşınmaz, ikon + görünür etiket/detay metni birlikte render edilir.
- AI-first rozeti (`aiGenerated=true` sinyallerde, `panel`): `<span
  aria-label="Yapay zekâ üretimi">✦ AI</span>` — kontrattaki tanıma birebir,
  koşulsuz görünür.
- `compact`'te AI kaynaklı sinyaller tamamen atılmaz: her `aiGenerated=true`
  sinyalin ikonunun köşesinde mini `✦` işareti (`aria-label="Yapay zekâ
  üretimi"`) görünür; ayrıca listede en az bir `aiGenerated=true` sinyal varsa
  özet satırının sonunda küçük "✦ AI destekli" metinli rozet görünür (AI
  sonucu insan doğrulaması gibi sunulmasın diye — bkz. §5/§9).
- Geri bildirim düğmeleri `role="group"` + `aria-label="Bu sinyal faydalı
  mıydı?"` içinde, her biri `aria-pressed` ile seçili durumunu duyurur.
- `loading=true`: `section[aria-busy="true"]`, gerçek liste yerine
  `aria-hidden` dekoratif placeholder render edilir. Duyuru: header içinde
  HER ZAMAN mount'lu bir `aria-live="polite"` (`.srOnly`) bölge bulunur —
  `loading=false` iken boş, `loading=true` iken "Güven kontrolleri
  yükleniyor" metnini alır. Bölge koşullu mount/unmount edilmez (yalnız
  içerik değişir), aksi halde SR'ler mount anındaki metni kaçırabilir.
- Portal yok, ref forwarding yok — tamamen statik/sunum (veri dışarıdan
  hesaplanır, component yalnız çizer + geri bildirim callback'i taşır).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | ✅ (default var) | `string` | `h3`, section'ı her zaman adlandırır |
| summary | ✅ | otomatik | `"N/toplam doğrulama geçti"`; `failed` varsa `--lg-danger` vurgulu ek metin |
| signal.icon | ✅ (otomatik) | `✓/!/✕/i` | `role="img"`, sabit `aria-label`, `panel`+`compact` her ikisinde |
| signal.label | ✅ | `string` | `panel`'de görünür; `compact`'te `.srOnly` |
| signal.detail | — | `string` | Yalnız `panel`; `compact`'te render edilmez |
| AI rozeti | yalnız `aiGenerated=true` + `panel` | `✦ AI` | Koşulsuz görünür, kopya CSS (bkz. §9) |
| confidence etiketi | yalnız `aiGenerated=true` + finite `confidence` | `"%N güven"` | Rozetin yanında görünür metin |
| AI köşe işareti | yalnız `aiGenerated=true` + `compact` | `✦` | İkonun köşesinde, `aria-label="Yapay zekâ üretimi"` |
| AI özet rozeti | yalnız listede ≥1 `aiGenerated=true` + `compact` | `"✦ AI destekli"` | Özet satırının sonunda görünür metin |
| geri bildirim | yalnız `aiGenerated=true` + `onFeedback` verilirse | 👍/👎 | `aria-pressed`, karşılıklı dışlar |
| placeholder | yalnız `loading=true` | — | `aria-hidden`, flat/parıltısız |
| loading duyurusu | her zaman mount'lu | — | `aria-live="polite"`, yalnız `loading=true` iken metin taşır |

Children kabul edilmez — tamamen prop güdümlü (`signals` + `title` +
`variant`).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| signals | prop | `GlassTrustSignal[]` | — (zorunlu) | — | Sıra dizinin sırasıdır; boş dizi boş liste + "0/0 doğrulama geçti" render eder |
| title | prop | `string` | `'Güven Kontrolleri'` | — | Her zaman render edilir, section'ı adlandırır |
| variant | prop | `'panel'\|'compact'` | `'panel'` | — | Görsel yoğunluk |
| loading | prop | `boolean` | `false` | — | AI-first yükleme placeholder'ı |
| onFeedback | prop | `(signalId: string, value: 'up'\|'down') => void` | — | — | Verilirse `aiGenerated` satırlarda geri bildirim düğmeleri görünür |
| ...rest | — | `HTMLAttributes<HTMLElement>` (`title` hariç) | — | — | `className` birleştirilir, kalanı `<section>`'a geçer |

`GlassTrustSignal` alanları: `id` (string, React key + JS obje anahtarı — DOM
`id`'ye yazılmaz), `label`, `status` (`'verified'|'warning'|'failed'|'info'`),
`detail?`, `aiGenerated?`, `confidence?` (0-100, yalnız `aiGenerated=true`
iken anlamlı).

Ref hedefi yok. Geri bildirim seçili durumu (`up`/`down`) component içinde
tutulur (satır başına); dışarıya controlled bir `value` sözleşmesi açılmaz —
yalnız `onFeedback` callback'i (GlassAiSummaryCard ile aynı karar).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=panel`, `title='Güven Kontrolleri'`,
`loading=false`.

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` (tema light/dark/auto) | N/A — durum rengi `signal.status`'tan otomatik türer, override prop'u yok |
| `size` | N/A — spec'te istenmedi, tek sabit ölçek |
| `thickness`/`prominent` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `detail` + `variant="compact"` | Render edilmez (sessizce yok sayılır, hata fırlatılmaz) |
| Tam AI rozeti (`✦ AI` + confidence) + `variant="compact"` | Render edilmez — `panel`'e özgü satır rozeti; `compact`'te bunun yerine köşe `✦` işareti + özet "✦ AI destekli" rozeti görünür (aiGenerated bilgisi compact'te de kaybolmaz, bkz. §2/§9) |
| `confidence` sonlu değil/aralık dışı | Sonlu değilse (`NaN`/`Infinity`) tamamen gizlenir; aralık dışıysa [0,100]'e clamp edilir |
| `loading=true` | `signals` içeriği yok sayılır, sabit 3 satırlık placeholder render edilir |
| `status` → renk | `verified`→`--lg-success`, `warning`→`--lg-warning` (yoksa `--lg-accent`), `failed`→`--lg-danger`, `info`→`--lg-label-secondary` — otomatik, override prop'u yok |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| durum/ton | `signal.status` | — | `data-status` (`li`/`icon` üzerinde) |
| geri bildirim seçimi | dahili `useState` (satır başına) | — | `aria-pressed` |
| yükleme | `loading` prop | gerçek liste + özet | `aria-busy` |
| disabled/hover/focus/active | — | — | Panel geneli etkileşimsiz; yalnız geri bildirim düğmeleri odaklanabilir (`:focus-visible`) |

Katman sırası: status (otomatik ton) → render; `loading` tüm gerçek içeriği
bastırır (üstte). Geri bildirim seçimi salt görsel/yerel state — dışarıya
`value` olarak açılmaz.

## 7. Davranış

- Keyboard/pointer: panel geneli etkileşimsiz; yalnız geri bildirim
  düğmeleri `Tab`/`Enter`/`Space` ile native `<button>` davranışı taşır.
- Geri bildirim tıklaması **her zaman** `onFeedback`'i çağırır (aynı yöne
  tekrar tıklamak da tekrar çağırır) — "gönderildi" sayaç/kısıtlama
  sorumluluğu çağırana aittir (GlassAiSummaryCard'daki "aynı yöne tekrar
  tıklama no-op" kararının aksine burada callback her tıklamada tetiklenir;
  yalnız görsel seçili durum `aria-pressed` ile senkron kalır).
- AI çıktısı (moderasyon durumu, güven yüzdesi) hiçbir otomatik eylem
  tetiklemez — yalnız bilgilendirme + kullanıcı onaylı geri bildirim.
- Responsive: `panel` satırları konteynerin %100 genişliğine uyar, uzun
  metin sarar; `compact` ikon dizisi `flex-wrap` ile sarar. Geri bildirim
  düğmeleri `pointer: coarse`'ta 44px hedefe büyür.
- Animasyon yalnız `loading` placeholder'ının opacity nabzı;
  `prefers-reduced-motion: reduce`'ta kapanır (statik %75 opaklıkta kalır
  değil, tamamen durur — GlassAiSummaryCard'ın skeleton'ıyla aynı karar).

## 8. İçerik kuralları

- `label` kısa sinyal adı olmalı ("EİDS tapu eşleşmesi", "AI içerik
  moderasyonu") — durumu içermemeli (durum zaten ikon + `STATUS_LABEL`'da).
- `detail` tek cümlelik somut kayıt/gerekçe ("12 Temmuz 2026, kayıt
  2841937465") — `compact`'te yer olmadığından hiç yazılmamalı ya da
  verilirse component sessizce göz ardı eder.
- `confidence` yalnız gerçekten ölçülmüş bir güven değeri varsa verilmeli —
  uydurulmuş/varsayılan bir yüzde asla gösterilmemeli (bu yüzden `undefined`
  varsayılanı yok, yalnız gizlenir).
- Uzun `label`/`detail` `panel`'de sarar (`overflow-wrap`); TR uzun bileşik
  kelimeler test edilmiştir (bkz. UzunIcerik story).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| root | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` | — |
| title/label | color | `--lg-label` | — |
| summary | color | `--lg-label-secondary` | — |
| alert (failed uyarısı) | color | `--lg-danger` | — |
| detail | color | `--lg-label-secondary` | — |
| icon (verified/warning/failed) | color/background/border | `--lg-success`/`--lg-warning` (yoksa `--lg-accent`)/`--lg-danger` `color-mix` türevi | `signal.status`'tan otomatik |
| icon (info) | color/background | `--lg-label-secondary` / `--lg-hairline` | — |
| icon/aiBadge/feedbackButton | radius | `--lg-radius-capsule` | — |
| **aiBadge** (AI-first, kopya CSS) | background/color | `color-mix(in srgb, var(--lg-accent) 12%, var(--lg-surface))` / `color-mix(in srgb, var(--lg-accent) 70%, var(--lg-label))` | Sabit — tüm AI component'lerinde AYNI (GlassAiSummaryCard ile birebir) |
| confidence metni | color | `--lg-label-secondary` | — |
| **aiCorner** (compact köşe işareti) | background/color | `aiBadge` ile aynı `color-mix` çifti, `border: 1px solid var(--lg-surface)` (zemin ayrımı için) | — |
| **aiSummaryBadge** (compact özet rozeti) | color | `color-mix(in srgb, var(--lg-accent) 70%, var(--lg-label))` | — |
| feedbackButton (seçili) | border/background/color | `color-mix(... var(--lg-accent) ...)` | `aria-pressed` |
| placeholderBar/placeholderIcon | background | `--lg-hairline` | `aria-busy` altında opacity animasyonu |

**Borç (raw):** durum ikonu 24×24 — GlassScoreMeter'ın ring stroke-width
borcuyla aynı gerekçe: gösterge çapı için token yok. AI rozeti `font-size:
10.5px` — kontratın kendisinde sabitlenmiş literal değer (token değil,
tasarım sistemi kararı). `aiCorner` 12×12/`font-size: 8px` — aynı gerekçeyle
köşe rozetine özgü küçültülmüş literal (aiBadge'in 24×24 ikona sığacak
ölçeği).

## 10. Storybook kapsamı

Var: Default, Playground, Variants (panel/compact yan yana), DurumÖrnekleri
(4 durumun tamamı), SorunluIlan (failed ağırlıklı + uyarı metni), AI
Geri Bildirimi (etkileşimli demo + log), Yükleniyor (`loading`), UzunIcerik,
Responsive (mobile1), Erişilebilirlik (docs description'lı).

`States`/`Sizes`/`Materials` story'si N/A — component etkileşimsiz (geri
bildirim düğmeleri hariç) ve tek sabit ölçek/malzeme (`DurumÖrnekleri` story'si
renk eksenini karşılar). `Temalar` ayrı story olarak yok — toolbar'la otomatik
doğrulanır.

## 11. Test kabul kriterleri

- [x] `role="list"` + sinyal sayısı kadar `listitem` (panel)
- [x] varsayılan title `'Güven Kontrolleri'` render edilir, section
      `aria-labelledby` ile eşleşir
- [x] özel `title` + otomatik özet metni (`"N/toplam doğrulama geçti"`)
- [x] `failed` varsa `--lg-danger` vurgulu uyarı metni özet satırında görünür
- [x] `failed` yoksa uyarı metni render edilmez
- [x] her durum ikonu `role="img"` + sabit `aria-label` taşır
- [x] `aiGenerated` sinyalde AI rozeti + güven yüzdesi görünür, diğerlerinde yok
- [x] `confidence` sonlu değilse gizlenir, aralık dışıysa clamp edilir
- [x] `onFeedback` verilirse `aiGenerated` satırında düğmeler görünür, tıklanınca `(id, value)` ile çağrılır, `aria-pressed` güncellenir
- [x] `onFeedback` verilmezse/sinyal `aiGenerated` değilse düğme render edilmez
- [x] `compact`: yalnız özet + ikon dizisi, `detail` render edilmez
- [x] `compact`: `aiGenerated` sinyalin ikonunda köşe `✦` işareti + özet satırında "✦ AI destekli" rozeti görünür (yalnız aiGenerated sinyal(ler) için); aiGenerated yoksa hiçbiri render edilmez
- [x] `loading=true`: `aria-busy="true"`, gerçek liste/özet gizli
- [x] loading duyurusu her zaman mount'lu `aria-live="polite"` bölgede taşınır (aynı DOM node, `loading=false→true` arası yalnız metin değişir)
- [x] boş `signals` dizisi hata fırlatmadan `"0/0 doğrulama geçti"` render eder
- [ ] iki temada (Kağıt/Grafit) renk kontrastı (visual)
- [ ] `loading` placeholder'ının reduced-motion'da animasyonsuz kalması (visual)

## 12. Do / Don't

- ✅ `confidence`'ı yalnız gerçekten ölçülmüş bir değer varken ver — uydurma
  yüzde asla gösterilmemeli.
- ✅ AI kaynaklı olmayan sinyallerde (`EİDS`, `tapu`) `aiGenerated` hiç
  verme — rozet yalnızca gerçekten AI üretimi olan satırlarda anlamlı.
- ✅ `compact`'i yalnızca zaten çerçeveli bir kart içinde kullan (kendi
  zemini var ama küçük alan için tasarlanmıştır).
- ❌ `status`'un rengini dışarıdan override etme — risk/güven verisinin keyfi
  renklendirilmesi yanıltıcı olur (GlassClimateRiskPanel'deki kararla aynı).
- ❌ AI rozetini/`confidence` metnini yalnız renkle ayırt edilebilir yapma —
  her ikisi de metin taşır, bu kasıtlı ve zorunlu (Dalga 1 "AI-first
  standardı").
- ❌ `onFeedback` içinde otomatik bir eylem tetikleme (ör. ilanı otomatik
  reddetme) — component yalnız kullanıcı onaylı geri bildirim iletir, eylem
  çağıranın sorumluluğundadır.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı (Dalga 1 §15).

**Açık kararlar:** `size` ekseni ihtiyacı (kart içi çok küçük `compact`) ·
geri bildirim "gönderildi" sayaç/tekrar kısıtlaması (şimdilik çağırana
bırakıldı, GlassAiSummaryCard'ın "tekrar tıklama no-op" kararından bilinçli
sapma — burada tekrar tıklama serbest) · `status` renginin override edilebilir
olup olmaması (şimdilik kapalı, ClimateRiskPanel kararıyla tutarlı).

## Changelog

- 2026-07-17: Code review düzeltmeleri — `compact` varyantı artık `aiGenerated`
  bilgisini hiç atmıyor: ikon köşesinde mini `✦` işareti (`aria-label="Yapay
  zekâ üretimi"`) ve listede en az bir AI kaynaklı sinyal varsa özet satırının
  sonunda "✦ AI destekli" metinli rozet görünür (AI sonucu artık compact'te de
  insan doğrulaması gibi sunulmuyor). Yükleme duyurusu artık header içinde her
  zaman mount'lu bir `aria-live="polite"` bölgede taşınıyor (önceden yalnız
  `loading=true` iken mount ediliyordu, bu da geçişi bazı ekran okuyucularda
  kaçırabiliyordu). İki regresyon testi eklendi.
- 2026-07-17: İlk sürüm — `panel`/`compact` varyantları, 4 sabit durum
  (`verified/warning/failed/info`) + otomatik semantik renk, `role="list"`/
  `listitem` + durum ikonlarında `role="img"` sözleşmesi, AI-first rozet/
  güven yüzdesi/geri bildirim/yükleme sözleşmesinin tam uygulanması (Dalga 1
  kontratı "AI-first standardı" — `GlassAiSummaryCard` ile aynı AI rozeti
  CSS'i, kopya kabul edilerek).
