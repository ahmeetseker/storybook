---
name: GlassClimateRiskPanel
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassClimateRiskPanel Kuralları

## 1. Amaç

Bir arsa/konut ilanının iklim ve afet risklerini (deprem, sel, yangın, zemin
vb.) tehlike başına seviye + metinsel karşılığıyla listeleyen içerik paneli.
İçerik katmanı component'idir — bilinçli olarak cam DEĞİL: risk verisi
devamlı okunan bir değerlendirme, cam malzemenin anlamı yok (Dalga 1 kontratı
§15).

- **Kullan:** ilan detay sayfasında risk özeti kartı (`badges`), tam risk
  raporu bölümü (`detailed`).
- **Kullanma:** tek metrik/skor gösterimi (→ `GlassScoreMeter`), sıralanabilir
  çok kolonlu karşılaştırma (→ `GlassTable`), ayrık tekil durum rozeti (→
  `GlassBadge`), seçilebilir sekme/filtre grubu (→ `GlassSegmentedControl`).

| İlgili | Farkı |
|---|---|
| GlassScoreMeter | Tekil 0-100 skor + `role="meter"`; RiskPanel çoklu tehlikeyi 1-5 ölçekte listeler |
| GlassSpecTable | Genel etiket/değer `dl` listesi; RiskPanel semantik olarak `list`/`listitem` ve seviye rengi taşır |
| GlassSegmentedControl | Seçilebilir/etkileşimli radiogroup; RiskPanel tamamen statik, seçim yok |
| GlassBadge | Tekil ayrık rozet; RiskPanel çoklu tehlikeyi aynı sözleşimle bir arada sunar |

## 2. Semantik sözleşme

- Kök: `<section>`, `title` verilirse `<h3>` render edilir ve section
  `aria-labelledby` ile adlandırılır; verilmezse isim yok (çağıran gerekirse
  `...rest` üzerinden `aria-label` ekleyebilir — GlassVitrin ile aynı karar).
- Tehlike listesi: `<ul role="list">` > `<li>` (native `listitem`).
  `list-style: none` Safari'de liste semantiğini düşürdüğünden `role="list"`
  açıkça verilir (GlassList ile birebir aynı desen).
- `detailed` varyantında seviye ölçeği `role="img"` + `aria-label`
  ("Deprem: 5 üzerinden 4, Yüksek") taşır — sayısal *ve* metinsel bilgiyi tek
  bir eşdeğer AT düğümünde birleştirir; birim çubukları kendisi `aria-hidden`.
- Portal yok, ref forwarding yok, etkileşim yok — tamamen statik sunum
  (GlassScoreMeter/GlassSpecTable ile aynı karar: veri dışarıdan hesaplanır,
  component yalnız çizer). Bu nedenle klavye deseni/roving tabindex N/A —
  component ne `tablist` ne `radiogroup` üstlenir, salt bilgilendirme listesi.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | — | `string` | `h3`, section'ı adlandırır |
| hazard.icon | — | `ReactNode` | Dekoratif, `aria-hidden` |
| hazard.label | ✅ | `string` | Tehlike adı, her iki varyantta görünür |
| hazard.level | ✅ | `1\|2\|3\|4\|5` | Rengi otomatik türetir, kendi başına render edilmez |
| hazard.levelLabel | ✅ | `string` | Seviyenin metinsel karşılığı — her iki varyantta görünür render edilir (renk TEK BAŞINA yeterli değil) |
| hazard.description | — | `string` | Yalnız `detailed`; `badges`'te yok sayılır |
| hazard.source | — | `string` | Yalnız `detailed`; `badges`'te yok sayılır |
| seviye ölçeği (5 birim) | yalnız `detailed` | — | Dolu birim sayısı `level`; `role="img"` grup etiketiyle |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| hazards | prop | `GlassClimateRiskHazard[]` | — (zorunlu) | — | Sıra dizinin sırasıdır; boş dizi boş liste render eder |
| variant | prop | `'badges'\|'detailed'` | `'badges'` | — | Görsel yoğunluk |
| title | prop | `string` | — | — | Verilirse `h3` + `aria-labelledby` |
| ...rest | — | `HTMLAttributes<HTMLElement>` (`title` hariç) | — | — | `className` birleştirilir, kalanı `<section>`'a geçer |

Ref hedefi yok. Event sözleşmesi yok — component'te `onChange`/`onClick`
yok; seçim veya etkileşim kavramı yok, dolayısıyla controlled/uncontrolled
ayrımı da yok (spec'in "controlled sözleşme muğlaklığı" riskine karşı bilinçli
karar: bu component'te state yönetilecek bir seçim yüzeyi bulunmuyor).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=badges`, `title` verilmemiş.

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` (tema light/dark/auto) | N/A — component prop düzeyinde tema tonu almaz, seviye rengi `hazard.level`'dan otomatik türer |
| `size` | N/A — spec'te istenmedi, tek sabit ölçek |
| `thickness`/`prominent` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `description`/`source` + `variant="badges"` | Render edilmez (sessizce yok sayılır, hata fırlatılmaz) |
| `level` → renk | 1-2 `--lg-success`, 3 `--lg-warning` (yoksa `--lg-accent`), 4-5 `--lg-danger` — otomatik, override prop'u yok (ScoreMeter'ın aksine: risk seviyesi keyfi override edilemeyecek kadar anlam taşır) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| seviye/ton | `hazard.level` | — | `data-tone` (`li` üzerinde) |
| disabled/hover/focus/active/selected | — | — | YOK — etkileşimsiz, klavye/touch hedefi değil |

Katman sırası: level → tone (otomatik türetim) → render. Etkileşim katmanı
yok; roving tabindex/ok tuşu deseni bu yüzden geçerli değil (component
`tablist`/`radiogroup` DEĞİL, salt `list`).

## 7. Davranış

- Keyboard/pointer: etkileşimsiz; `tabIndex` verilmez, odaklanabilir öğe
  içermez.
- Responsive: `badges` satırı `flex-wrap` ile sarar; `detailed` satırları
  konteynerin %100 genişliğine uyar (container query/breakpoint yok, dar
  alanda `badges` tercih edilmeli).
- `pointer: coarse`/44px dokunma hedefi: N/A — component'te dokunulabilir/
  tıklanabilir hiçbir alt öğe yok (salt bilgilendirme listesi).
- Animasyon yok; `prefers-reduced-motion` etkisi olan bir geçiş yok (statik
  render, ScoreMeter'daki dolum animasyonunun aksine risk verisi anlık
  render edilir, zamanla dolmaz).

## 8. İçerik kuralları

- `label` kısa tehlike adı olmalı ("Deprem", "Sel", "Yangın", "Zemin").
- `levelLabel` her zaman doldurulmalı ve kısa olmalı ("Orta-Yüksek") — sayı
  zaten `level`'da var, `levelLabel` yalnız *metinsel* karşılığı taşır, sayı
  içermemeli.
- `description` tek cümlelik somut gerekçe ("Fay hattına 6 km"); `badges`'te
  yer olmadığından hiç yazılmamalı ya da verilirse component sessizce göz
  ardı eder.
- `source` kısa atıf formatı ("AFAD 2025") — cümle değil.
- Uzun `description`/`label` `detailed`'de sarar (`overflow-wrap`); `badges`
  etiketi `ellipsis` ile kısaltılır (dar kart içinde çip taşmasın diye) — TR
  uzun bileşik kelimeler test edilmiştir (bkz. UzunIcerik story).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| root | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` | — |
| title/hazardLabel | color | `--lg-label` | — |
| description/source | color | `--lg-label-secondary` | — |
| levelChip/levelText metni | color | `--lg-label` / `--lg-label-secondary` | Ton rengi metne uygulanmaz — WCAG 1.4.3 (bkz. §12 Do/Don't) |
| levelChip arka plan/kenarlık, unitFilled | color/background | `--glass-climate-tone` ← `--lg-success`/`--lg-warning` (yoksa `--lg-accent`)/`--lg-danger` | `hazard.level`'dan otomatik |
| unitEmpty/detailedItem ayracı | background/border | `--lg-hairline` | — |
| badgeItem/levelChip | radius | `--lg-radius-capsule` | — |
| root/list boşluğu | gap/padding | `--lg-space-2..5` | — |
| hazardLabel/levelText | font-size | `--lg-text-body` / `--lg-text-footnote` | — |

**Borç (mikro-geometri):** kökte yerel değişkenlerde toplandı:
`--glass-climate-unit-width/height/radius` (22×6px + 3px seviye ölçeği
birim çubuğu — GlassScoreMeter'ın ring stroke-width borcuyla aynı gerekçe:
gösterge kalınlığı/genişliği için token yok) ve
`--glass-climate-chip-pad-block/inline` (2px/10px seviye çipi iç boşluğu —
kapsül çip metriği, space ölçeğine oturmuyor). Görsel değerler değişmedi.

## 10. Storybook kapsamı

Var: Default, Playground, Variants (badges/detailed yan yana), SeviyeÖlçeği
(1-5 tüm eşik renkleri), KonutÖzeti (az tehlike, başlıksız kart içi kullanım),
UzunIcerik, Responsive (mobile1), Erişilebilirlik (docs description'lı).

`States`/`Sizes`/`Materials` story'si N/A — component etkileşimsiz ve tek
sabit ölçek/malzeme (`SeviyeÖlçeği` story'si renk eksenini karşılar,
ScoreMeter'ın `ToneEsigi`'siyle aynı rol). `Temalar` ayrı story olarak yok —
toolbar'la otomatik doğrulanır.

## 11. Test kabul kriterleri

- [x] `role="list"` + tehlike sayısı kadar `listitem`
- [x] `title` verilince `h3` + section `aria-labelledby` eşleşir
- [x] `title` verilmezse başlık yok, `aria-labelledby` yok
- [x] `title` verilmezse çağıranın `...rest` ile geçtiği `aria-labelledby` korunur (koşulsuz `undefined` ile silinmez)
- [x] `badges`: ikon `aria-hidden`, `label`/`levelLabel` metni görünür
- [x] `badges`: `description`/`source` render edilmez
- [x] `detailed`: `description`/`source` render edilir
- [x] `detailed`: 5 birim sabit, dolu birim sayısı `level` ile eşleşir
- [x] seviye ölçeği `role="img"` + sayısal/metinsel `aria-label` birlikte
- [x] `data-tone` seviyeye göre doğru eşik (1-2 success, 3 warning, 4-5 danger)
- [x] boş `hazards` dizisi hata fırlatmadan boş liste render eder
- [ ] `badges` satırının dar container'da sarması (visual)
- [ ] iki temada (Kağıt/Grafit) renk kontrastı (visual)

## 12. Do / Don't

- ✅ Her tehlike için `levelLabel`'ı mutlaka doldur — renk tek başına anlam
  taşımaz (WCAG 1.4.1), test bunu doğrular ama içerik disiplini çağıranın
  sorumluluğu.
- ✅ `detailed` varyantını tam risk raporu bölümünde, `badges`'i kart içi özet
  rozetinde kullan.
- ✅ `source` kısa tut ("AFAD 2025") — cümle/link için `description`'ı kullan.
- ❌ `level`'ın rengini dışarıdan override etme — ScoreMeter'ın aksine bu
  component'te `tone` prop'u yok, risk seviyesi anlamı sabit kalmalı.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı (Dalga 1 §15).
- ❌ `levelChip`/`levelText` metin rengine ham semantik tonu (`--glass-climate-tone`)
  verme — açık temada küçük metin için WCAG 1.4.3'ün istediği 4.5:1 kontrastın
  altına düşer; ton yalnız arka plan/kenarlık/ölçek birimi gibi grafik
  öğelerde kalmalı, metin `--lg-label`/`--lg-label-secondary` kullanmalı.
- ❌ Tıklanabilir/genişletilebilir satır davranışı ekleme — statik sunum
  sözleşmesini bozar; interaktif ihtiyaçta ayrı bir component düşünülmeli.

**Açık kararlar:** `size` ekseni ihtiyacı (kart içi çok küçük `badges`) ·
1-5 dışı ölçek desteği · seviye renginin override edilebilir olup olmaması
(şimdilik kasıtlı olarak kapalı — risk verisinin keyfi renklendirilmesi
yanıltıcı olur) · `source` için link/tıklanabilir atıf desteği.

## Changelog

- 2026-07-17: İlk sürüm — `badges`/`detailed` varyantları, 1-5 otomatik
  semantik renk eşiği, `role="list"`/`listitem` + `detailed`'de `role="img"`
  seviye ölçeği sözleşmesi.
- 2026-07-17: Code review fix — `levelChip`/`levelText` metin rengi
  `--glass-climate-tone`'dan `--lg-label`/`--lg-label-secondary`'ye taşındı
  (açık temada 4.5:1 kontrast ihlali); `aria-labelledby` yalnız `title`
  varken koşullu spread ile yazılır, artık `...rest`'ten gelen değeri
  `undefined` ile silmiyor.
