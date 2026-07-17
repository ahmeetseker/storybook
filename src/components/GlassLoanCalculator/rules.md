---
name: GlassLoanCalculator
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassLoanCalculator Kuralları

## 1. Amaç

Konut kredisi hesaplayıcı — gerçek anüite matematiğiyle (taksit = P·r·(1+r)^n /
((1+r)^n − 1)) aylık taksit, kredi tutarı, toplam ödeme ve toplam faizi anlık
hesaplar.

- **Kullan:** ilan detay sayfasında "kredi hesapla" bloğu, fiyat karşılaştırma
  aracı, `variant="compact"` ile GlassSheet/GlassModal içine gömülü özet.
- **Kullanma:** genel amaçlı form (→ `GlassInput`/`GlassSlider` doğrudan
  kompoze et), taksitli alışveriş / tüketici kredisi (farklı formül ve vade
  aralığı gerektirir — ayrı component).

| İlgili | Farkı |
|---|---|
| GlassSpecTable | Statik etiket/değer listesi; hesaplama yapmaz |
| GlassPriceHeader | Tek fiyat gösterimi; giriş kontrolü yok |
| GlassSlider / GlassInput | Bu component'in iç kontrolleri — doğrudan kompoze edilebilir |

## 2. Semantik sözleşme

- Kök element: `<section>`; `variant="full"` iken `aria-labelledby` ile
  başlığa (`<h3>`) bağlanır. `variant="compact"` başlık render etmez, kök
  `aria-labelledby` almaz (ad kaynağı yok — parent bağlamdan adlandırmalı).
- Fiyat/faiz girişleri gerçek `<label htmlFor>` ile adlandırılır; peşinat/vade
  slider'ları `GlassSlider`'ın kendi `label` (aria-label) prop'uyla.
- Anapara/faiz oranı çubuğu `role="img"` + özet `aria-label`; yanındaki legend
  `aria-hidden` (bilgi zaten çubuğun aria-label'ında var, legend yalnız
  görsel tekrar).
- CTA gerçek `<button type="button">` (`GlassButton`).
- DOM değişmezi: hesap state'i tamamen iç (uncontrolled) — `onChange` yalnız
  bildirim amaçlı, geri besleme almaz.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| title | `variant="full"`'da ✅ | `<h3>` | compact'ta render edilmez |
| Konut Fiyatı | `variant="full"`'da ✅ | GlassInput | tr-TR binlik ayraçlı, suffix "TL" |
| Peşinat | `variant="full"`'da ✅ | GlassSlider (0-90) | değer + tutar başlıkta yan yana |
| Vade | `variant="full"`'da ✅ | GlassSlider (1-10 yıl) | yıl + ay birlikte gösterilir |
| Aylık Faiz Oranı | `variant="full"`'da ✅ | GlassInput | virgüllü ondalık, suffix "%" |
| Döküm (`<dl>`) | `variant="full"`'da ✅ | Kredi Tutarı / Toplam Ödeme / Toplam Faiz | 3 satır |
| Anapara/Faiz çubuğu | `variant="full"`'da ✅ | iki renkli yatay bar + legend | role="img" |
| Aylık Taksit | ✅ (her iki variant) | büyük tabular rakam | display ölçek |
| CTA | ✅ (her iki variant) | GlassButton (prominent, lg) | tam genişlik |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| variant | prop | `'full'\|'compact'` | `'full'` | — | Görünüm modu |
| title | prop | `string` | `'Konut Kredisi Hesaplama'` | — | Yalnız full'da görünür |
| defaultPrice | prop | `number` | `4250000` | uncontrolled seed | Başlangıç konut fiyatı |
| defaultDownPaymentPercent | prop | `number` | `20` | uncontrolled seed | Başlangıç peşinat % |
| defaultTermYears | prop | `number` | `10` | uncontrolled seed | Başlangıç vade (yıl) |
| defaultMonthlyRatePercent | prop | `number` | `2.79` | uncontrolled seed | Başlangıç aylık faiz % |
| ctaLabel | prop | `string` | `'Kredi Başvurusu Yap'` | — | CTA buton metni |
| onCtaClick | event | `() => void` | — | — | CTA tıklanınca |
| onChange | event | `(result: GlassLoanCalculatorResult) => void` | — | — | Her hesap değişiminde (mount dahil) |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`onChange`/`title` hariç) | — | — | Köke akar |

`GlassLoanCalculatorResult`: `price, downPaymentPercent, downPaymentAmount,
loanAmount, termYears, termMonths, monthlyRatePercent, monthlyPayment,
totalPayment, totalInterest`.

Ref hedefi: yok (ref forward edilmiyor — ihtiyaç varsa v2, Açık Kararlar).
Bilinçli tasarım kararı: tüm hesap girdileri **iç state**'tir (`value`/
`onXChange` controlled deseni yok) — component kendi kendine yeten bir
hesaplama aracıdır, form kütüphanesine bağlanmaz; dışarıya yalnız `onChange`
ile sonuç bildirir.

## 5. Seçenek eksenleri

`variant` tek eksendir (`material`/`tone`/`size`/`thickness`/`tint`/`prominent`
N/A — flat içerik kartı, tek görsel stil).

| Yasak / türetilen | Davranış |
|---|---|
| `variant="compact"` + giriş kontrolleri | Girişler hiç render edilmez (yalnız `defaultX` prop'larıyla besleme) |
| peşinat > 90 / < 0 | GlassSlider `min=0 max=90` ile kıskaçlanır |
| vade > 10 / < 1 yıl | GlassSlider `min=1 max=10` ile kıskaçlanır |
| kredi tutarı ≤ 0 (peşinat %100'e yakın + yuvarlama) | taksit 0 döner, hata fırlatmaz |
| faiz oranı 0 | anüite formülü yerine `P/n` (bölme sıfıra gitmez) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| price | iç `useState` (seed: `defaultPrice`) | — | input value |
| downPaymentPercent | iç `useState` | — | slider value + `aria-valuetext` |
| termYears | iç `useState` | — | slider value + `aria-valuetext` |
| monthlyRatePercent / rateText | iç `useState` (ikili: ham metin + sayı) | — | input value |
| result | `useMemo([price, downPaymentPercent, termYears, monthlyRatePercent])` | — | — |

Katman sırası: girdi state'leri → `calculateLoan` (saf fonksiyon, yan etkisiz)
→ `result` → render + `onChange` (useEffect, yalnız `result` değişince).

## 7. Davranış

- Pointer/touch: slider'lar `GlassSlider`'ın kendi sürükleme/klavye
  davranışını miras alır (ok tuşları step, Home/End uçlara, PageUp/Down 10×).
- Fiyat girişi: kullanıcı rakam yazdıkça yalnız rakamlar ayıklanır
  (`parseDigits`), görünen değer tr-TR binlik ayraçlı yeniden biçimlenir
  (`toLocaleString('tr-TR')`) — **borç:** hızlı yazımda imleç konumu her
  tuşta başa/sona kayabilir (bkz. §12 Bilinen kısıtlar).
- Faiz girişi: ham metin (`rateText`) virgülü korur; sayısal state'e
  çevrilirken virgül noktaya çevrilir. Boş/geçersiz girişte oran `0` kabul
  edilir (hata fırlatmaz).
- Controlled/uncontrolled: tamamen uncontrolled — `value`/`onXChange` API'si
  yok, yalnız `defaultX` seed + `onChange` bildirim.
- Async: yok.
- Overlay: yok — `variant="compact"` GlassSheet/GlassModal'a **içerik olarak**
  gömülür, kendisi overlay açmaz.

## 8. İçerik kuralları

- Sayılar `font-variant-numeric: tabular-nums`; TL değerleri
  `"4.250.000 TL"` formatında (`Math.round` + `toLocaleString('tr-TR')`).
- Uzun/yüksek rakamlar (`UzunIcerik` story) kartın sabit `max-width`'i içinde
  satır kırmadan taşar mı diye test edilir; `paymentValue` `display` ölçeğinde
  büyük ama `overflow-wrap` gerektirmeyecek genişliktedir (₺100M'a kadar
  güvenli — daha büyük rakamlarda görsel taşma borcu, Açık Kararlar).
- Boş içerik: fiyat `0` iken input placeholder `"0"` gösterir, taksit
  `"0 TL"` render eder (hata durumu yok).
- Lokalizasyon: tüm etiketler Türkçe sabit metin; i18n prop'u yok.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kart | background / border | `--lg-surface` / `--lg-hairline` | — |
| kart | radius | `--lg-radius-card` | — |
| başlık | font-size | `--lg-text-title` | — |
| fieldLabel | font-size / color | `--lg-text-footnote` / `--lg-label-secondary` | — |
| breakdown satırı | border-bottom | `--lg-hairline` | — |
| ratioPrincipal | background | `color-mix(var(--lg-label) 30%, transparent)` | — |
| ratioInterest | background | `--lg-accent` | — |
| paymentValue | font-size / color | `--lg-text-display` / `--lg-accent` | — |
| tüm boşluklar | gap/padding | `--lg-space-1..6` | — |
| CTA | — | `GlassButton` kendi token'ları (`--lg-control-lg` vb.) | — |

Borç (raw): yok — tüm ölçüler token'lardan; yalnız `.card`/`.compact`
`max-width` (420px/360px) ve `@media (max-width: 420px)` kırılımı raw px
(kart-özel yerleşim kararı, token karşılığı yok).

## 10. Storybook kapsamı

Var: Default, Playground, Compact (variant), SifirFaiz, YuksekPesinat,
UzunIcerik, Erisilebilirlik (docs), Responsive (mobile1 viewport), Variants
(full+compact yan yana). Temalar: toolbar'daki Arka plan/Tier global'leriyle
kapsanır (component kendi tema prop'u almaz — token tüketir).

Eksik: forced-focus görsel story (Chrome görsel QA borcu, genel proje notu).

## 11. Test kabul kriterleri

- [x] varsayılan değerlerle anüite formülü doğru taksit üretir
- [x] faiz 0 iken P/n dalı doğru çalışır
- [x] `variant="full"` başlık + tüm giriş kontrolleri render edilir
- [x] `variant="compact"` başlık/girişler render edilmez, yalnız taksit + CTA
- [x] peşinat slider değişince kredi tutarı/taksit yeniden hesaplanır
- [x] `onChange` mount dahil her hesap değişiminde güncel sonuç döner
- [x] CTA tıklaması `onCtaClick` tetikler
- [x] anapara/faiz çubuğu `role="img"` + metinsel özet taşır
- [x] fiyat girişi tr-TR biçimlendirir ve kredi tutarını günceller
- [ ] görsel: dar container'da (320px) taşma yok (Chrome görsel QA)

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

- ✅ `variant="compact"`'ı yalnız fiyat zaten bağlamdan biliniyorsa kullan
  (`defaultPrice` ile besle) — girişler yok, kullanıcı değer değiştiremez.
- ✅ Sonucu dışarı taşımak için `onChange`'i kullan; state'i dışarıdan
  kontrol etmeye çalışma (controlled API yok, bilinçli tasarım).
- ❌ Kartın içine ikinci bir cam yüzey ekleme (`--lg-surface` flat kalmalı) —
  yalnız `GlassInput`/`GlassSlider`/`GlassButton` kendi kontrol camını taşır.
- ❌ `defaultPrice` gibi seed prop'larını render sonrası değiştirip
  component'in senkronize olmasını bekleme — yalnız ilk mount'ta okunur
  (React `useState` başlangıç değeri deseni).

**Bilinen kısıtlar:** fiyat girişinde hızlı yazımda imleç konumu tuş
başına sıfırlanabilir (controlled+reformat deseni — kabul edilen borç,
GlassInput'un kendi maskeleme çözümü yok, bkz. GlassInput Açık Kararlar).

**Açık kararlar:** fiyat girişi için özel maskeleme/imleç-korumalı input
(GlassInput'a taşınabilir, "Açık Kararlar: maskeli giriş" — GlassInput
rules.md'de zaten not edilmiş genel ihtiyaç) · ref forward · ₺100M üzeri
rakamlarda `paymentValue` görsel taşma testi · vade üst sınırının 15 yıla
çıkarılması ihtiyacı (spec kararı: 1-10 yıl, 120 ay tipik konut kredisi).

**Changelog:** 2026-07-17 — İlk sürüm: anüite formülü, full/compact variant,
tr-TR sayı biçimi, anapara/faiz oranı çubuğu.
