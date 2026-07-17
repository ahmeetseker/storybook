---
name: GlassAiSearchBar
category: kontroller
status: hazır
lastReviewed: 2026-07-17
---

# GlassAiSearchBar Kuralları

## 1. Amaç

Konuşmalı/doğal dil arama çubuğu (2030 AI-first arama). Kullanıcı serbest
metinle ("Urla'da deniz manzaralı 3+1 daire") arama yapar; AI sorguyu
yapılandırılmış filtrelere ayrıştırır ve bunlar input altında kaldırılabilir
chip'ler olarak geri gösterilir.

- **Kullan:** vitrin/liste sayfası üst arama alanı, AI destekli filtre
  akışının giriş noktası.
- **Kullanma:** klasik alan-bazlı filtreleme (→ ayrı filtre paneli),
  otomatik tamamlamalı yapılandırılmış arama (→ `GlassSearchField`/`GlassSelect`
  kombinasyonu — bu component listbox/combobox deseni kullanmaz).

## 2. Semantik sözleşme

- Kök element `<form role="search">`; gönderim native `submit` event'i
  üzerinden yürür (`preventDefault` + `onSubmit(query)`).
- Girdi `<input type="search">` → örtük `role="searchbox"`; accessible name
  sabit `aria-label="Doğal dilde arama"` (placeholder içerikten bağımsız).
- Öneri listesi **listbox/combobox değildir** — her öneri düz `<button
  type="button">`, doğal Tab sırasında, özel klavye deseni yok (yalnız Escape
  listeyi kapatır, değeri temizlemez).
- Gönder butonu `GlassButton` (`type="submit"`, ikon-tek, `aria-label="Ara"`).
- Filtre kaldır butonları `aria-label="Filtreyi kaldır: <Etiket>"` — jenerik
  "Kaldır" değil, filtreye özel (birden fazla filtre AT'de ayırt edilebilir).
- Portal yok.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| ray | ✅ | ✦ ikon + input + gönder butonu | Kapsül, düz yüzey + hairline |
| öneri listesi | — | `suggestions` doluyken, input odaklı | Buton dizisi, odak dışında gizli |
| "düşünüyor" göstergesi | — | `loading` iken | `aria-live="polite"`, input'a `aria-describedby` ile bağlı |
| AI filtre bloğu | — | `parsedFilters` doluyken | rozet başlık + kaldırılabilir chip listesi |
| AI rozeti | filtre bloğu varsa ✅ | "✦ AI" | Kontrattaki sabit AI rozeti CSS'i |
| güven etiketi | — | `confidence` verilirse | "%N güven" metni, rozetin yanında |
| geri bildirim | — | `onFeedback` verilirse | 👍/👎, `aria-pressed` |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| value | prop | `string` | — | ✅ | Controlled sorgu metni |
| defaultValue | prop | `string` | `''` | — | Kontrolsüz başlangıç |
| onValueChange | event | `(value: string) => void` | — | ✅ eşleniği | Her değişimde |
| onSubmit | event | `(query: string) => void` | — zorunlu | — | Form submit / öneri seçimi |
| placeholder | prop | `string` | örnek emlak cümlesi | — | — |
| suggestions | prop | `string[]` | — | — | Odaklıyken altında buton listesi |
| parsedFilters | prop | `{id,label,value}[]` | — | — | AI çıktısı, kaldırılabilir |
| onRemoveFilter | event | `(id: string) => void` | — | — | Verilmezse kaldır butonu yok |
| loading | prop | `boolean` | `false` | — | Input disabled + "Düşünüyor…" |
| confidence | prop | `number (0-100)` | — | — | Sonlu değilse/aralık dışıysa clamp; yoksa gizli |
| onFeedback | event | `(v: 'up'\|'down') => void` | — | — | Verilmezse 👍/👎 render edilmez |

Ref hedefi: yok (kök `<form>`'a `ref` iletilmez, `...rest` yalnız
`FormHTMLAttributes` — `onSubmit` native imzasıyla çakıştığı için override
edilir).

## 5. Seçenek eksenleri

`variant` yok — tek görsel desen (kapsül ray). `material`/`tone`/`size`
ekseni yok; iç `GlassButton` kendi `size="sm"` ile sabittir. Yasak kombinasyon
yok.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| controlled/uncontrolled değer | `value` varlığı | iç state | — |
| öneri listesi açık | input focus + blur (relatedTarget dışı) | — | — |
| loading | prop | öneri listesi (kapanır), input etkileşimi | input `disabled`, `aria-describedby` |
| feedback seçimi | iç state (tıklama) | — | `aria-pressed` |

Katman sırası: availability (loading → input/suggestions devre dışı) →
value (controlled > uncontrolled) → interaction (focus/blur → open).

## 7. Davranış

- **Pointer:** input'a tıklamak/odaklanmak önerileri açar; öneri butonuna
  tıklamak değeri o öneriye eşitler, `onSubmit`'i doğrudan çağırır (kullanıcı
  onaylı eylem — kontrat gereği AI çıktısı otomatik tetiklenmez, burada da
  tetikleyen her zaman bir tıklama).
- **Klavye:** Tab doğal sırada (input → öneriler varsa sırayla → gönder
  butonu → filtre kaldır butonları). Escape yalnız açık öneri listesini
  kapatır, değeri temizlemez (listbox olmadığı için ok tuşu/roving yok).
- **Focus akışı:** hiçbir durumda programatik `.focus()` çağrılmaz — odak
  yalnız kullanıcı etkileşimiyle (tıklama/Tab) değişir; controlled `value`
  dışarıdan değişse de odak taşınmaz.
- **Async:** `loading=true` → input `disabled`, gönder butonu `disabled` +
  `loading` (spinner, native submit de engellenir), açık öneri listesi kapanır.
- **Overlay:** yok — öneri listesi absolute konumlu düz panel, portal değil.

## 8. İçerik kuralları

- Uzun sorgu/öneri metinleri sarılır, kırpılmaz (bkz. UzunIcerik story).
- `parsedFilters` boşsa/`undefined` ise filtre bloğu ve AI rozeti hiç
  render edilmez.
- Filtre etiketleri kısa isim ("Konum", "Oda Sayısı"); değer serbest metin.
- Lokalizasyon: tüm sabit metinler Türkçe; `placeholder` dışarıdan override
  edilebilir.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| ray | background/border | `--lg-surface` / `--lg-hairline` | focus-within: accent karışımlı border |
| ray | radius | `--lg-radius-capsule` | — |
| ray | yükseklik | `--lg-control-xl` | — |
| input metin | color | `--lg-label` / `--lg-label-secondary` (placeholder) | disabled: opacity |
| öneri paneli | radius/border | `--lg-radius-card` / `--lg-hairline` | — |
| öneri satırı | radius | `--lg-radius-chip` | hover: `color-mix(label 6%)` |
| AI rozeti | background/color | `color-mix(accent 12%, surface)` / `color-mix(accent 70%, label)` | — (kontrat sabiti) |
| güven metni | color | `--lg-label-secondary` | `tabular-nums` |
| filtre chip | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-capsule` | — |
| focus halkası | outline | `--lg-accent` (yalnız `:focus-visible`) | — |

**Borç (raw):** AI rozeti font-size `10.5px`/`font-weight 700` (kontrat
sabiti — tüm AI component'lerinde birebir kopya, token'a bağlanmaz);
öneri/feedback/filtre-kaldır dokunma hedefleri `pointer: coarse`'ta 36-44px
raw (GlassChip'in kabul edilmiş "kompakt chip" ödünüyle aynı gerekçe);
`.thinkingDot` 6px nabız noktası raw.

## 10. Storybook kapsamı

Default, Playground, Öneri Listesi, AI Çıkarılan Filtreler, Güven / Geri
Bildirim Yok, Controlled, Durumlar (States — boş/dolu/loading/düşük güven),
Uzun İçerik, Responsive, Erişilebilirlik (docs). Variants/Sizes: N/A — tek
desen, eksen yok.

## 11. Test kabul kriterleri

- [x] `role="search"` + `searchbox` sabit `aria-label`
- [x] Kontrolsüz yazma + form submit → `onSubmit(currentValue)`
- [x] Controlled: dışarıdaki `value` geçerli, `onValueChange` çağrılır, iç
      state yazmaz
- [x] Öneriler yalnız odaklıyken görünür, düz buton (listbox yok)
- [x] Öneri tıklaması değeri eşitler + `onSubmit` çağırır
- [x] `loading`: input disabled, öneriler gizli, "Düşünüyor…" `aria-live`
- [x] Filtre chip + filtreye özel kaldır `aria-label` + `onRemoveFilter(id)`
- [x] AI rozeti + `confidence` clamp/gizleme (NaN/aralık dışı)
- [x] `onFeedback`: 👍/👎 `aria-pressed` + callback
- [x] `onFeedback` yoksa geri bildirim butonları render edilmez
- [ ] Görsel: ray focus-within border rengi (visual, Chrome)
- [ ] Görsel: öneri paneli gölgesi/konumu geniş/dar viewport (visual)

## 12. Do / Don't

- ✅ `onSubmit`'i her zaman ver — zorunlu prop, yalnız o kullanıcı niyetini
  taşır (Enter, gönder tıklaması, öneri seçimi hepsi buradan geçer).
- ✅ `parsedFilters` her zaman AI çıktısıdır — rozet/güven/geri bildirim
  bunun için var; sabit/kullanıcı girdisi filtreleri bu component'e koyma.
- ❌ Öneri listesine `role="listbox"`/`aria-activedescendant` ekleme — spec
  bilinçli olarak düz buton listesi seçti; ARIA rolü eklersen roving
  tabindex + ok tuşu deseni de eklemek zorunda kalırsın (kontrat: rol
  üstlenip klavye deseni eksik bırakma hatası).
- ❌ Controlled `value` değiştiğinde input'a otomatik focus verme.

**Açık kararlar:** öneri listesinin sıra/skor gösterimi (ör. "%92 eşleşme"
her öneride) — v2'de değerlendirilecek · sesli girdi (mikrofon ikonu) — bu
component'in kapsamı dışında, ayrı bir composition noktası.

**Changelog:** 2026-07-17 — İlk sürüm (Dalga 3, AI-first standardı: AI
rozeti + `confidence` + `onFeedback` + flat `loading` göstergesi).
