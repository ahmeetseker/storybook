---
name: GlassAgencyCard
category: içerik
status: hazır
lastReviewed: 2026-07-24
---

# GlassAgencyCard Kuralları

## 1. Amaç

Kurumsal emlak ofisi kimlik kartı — `GlassSellerCard`'ın kurumsal karşılığı.
Logo/baş harf + kurum adı + kompakt doğrulama işareti ve isteğe bağlı kaynak
tooltip'i + tagline + tabular istatistik satırı (Aktif İlan/Danışman vb.) +
telefon/ilan sade metin-link aksiyonları + tek birincil "Mesaj Gönder"
aksiyonu. İçerik katmanı component'idir — cam DEĞİL, düz yüzey
(`--lg-surface` + `--lg-hairline`).

- **Kullan:** ilan detay sayfasında kurumsal satıcı yan kolonu (`panel`),
  ofis dizini/liste sayfasında satır kartı (`inline`).
- **Kullanma:** bireysel satıcı kimliği (→ `GlassSellerCard` — kişisel
  telefon reveal deseni, avatar+isim odaklı, kurumsal istatistik taşımaz).

| İlgili | Farkı |
|---|---|
| GlassSellerCard | Bireysel satıcı; maskeli telefon reveal deseni + tek avatar; istatistik satırı yok |
| GlassSpecTable | Genel etiket/değer listesi (`<dl>`, dikey); AgencyCard'ın stats satırı yatay/tabular ve kartın yalnız bir bölümü |
| GlassScoreMeter `badge` | Tekil sayısal skor + renk eşiği; AgencyCard'ın stats'ı çoklu, nötr, karşılaştırma amaçlı değil |

## 2. Semantik sözleşme

- Element: düz `<section>` — GlassSurface/backdrop-filter YOK (içerik katmanı
  kuralı, bkz. `EksenlerVeDurumlar.mdx`).
- Logo: `GlassAvatar` (`shape="rounded"`, `alt=""`) — dekoratif, kurum adı
  zaten yanında görünür metin olarak var, tekrar okutulmaz. `logoSrc` yoksa
  `GlassAvatar` kendi baş harf fallback'ine düşer (`name`'den türetilir).
- Doğrulama işareti: ikon-tek `<span role="img"
  aria-label="Doğrulanmış kurumsal ofis">`; büyük görünür metin rozeti yoktur.
- Doğrulama kaynağı: `verified && verifiedBy` iken `GlassTooltip` içinde
  odaklanabilir `<button type="button">`. Accessible adı
  `"Doğrulama ayrıntısı: Kurumsal kimlik {source} tarafından doğrulandı."`,
  `title` ve tooltip içeriği aynı açıklamayı taşır. Tooltip açıkken
  `GlassTooltip` düğmeye `aria-describedby` yazar.
- İstatistikler: `<dl>` + her çift `<dt>`/`<dd>` (GlassSpecTable ile aynı
  desen) — etiket/değer ilişkisi AT'ye native aktarılır.
- Telefon: gerçek `<a href="tel:...">` (`GlassLink`, `variant="inline"`) —
  Enter native aktive eder, orta tık/kopyala çalışır.
- "N ilanı görüntüle": gerçek `<button type="button">` — callback tabanlı
  (`onViewListings`), `href` yok, bu yüzden `GlassLink` değil yerel buton.
- Stabil DOM kancaları: `data-part="identity|verification|stats|actions"`;
  `verification` ve `stats` yalnız ilgili içerik render edildiğinde vardır.
- Portal yok, ref forwarding yok.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| logo | otomatik | `GlassAvatar` (img veya baş harf) | `logoSrc` yoksa `name`'den fallback; `panel`'de `lg` (56px), `inline`'da `md` (40px) |
| name | ✅ | string | Kart genelinin de accessible bağlamı; truncation yok, sarar |
| tagline | — | string | İsmin altında ikincil satır |
| verification | — | küçük check + opsiyonel info button | Check yalnız `verified`; info button ayrıca `verifiedBy` ister |
| stats | — | `{label,value}[]` | `<dl>`, yatay, hairline ayraçlı; boşsa hiç render edilmez |
| phone | — | `tel:` linki | Yalnız `phone` verilince |
| viewListings | — | metin-link buton | Yalnız `onViewListings` verilince; metni stats'tan türer (bkz. §7) |
| message | — | prominent `GlassButton` | Yalnız `onMessage` verilince; kart başına tek `prominent` aksiyon |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| name | prop | `string` | — (zorunlu) | — | GlassAvatar baş harf fallback'i de buradan türer |
| logoSrc | prop | `string` | — | — | Verilmezse `GlassAvatar` baş harf fallback'i |
| tagline | prop | `string` | — | — | Serbest metin |
| stats | prop | `{ label: string; value: string }[]` | — | — | Sayı formatı çağıranındır (`value` string) |
| verified | prop | `boolean` | `false` | — | Kompakt, erişilebilir doğrulama işareti |
| verifiedBy | prop | `string` | — | — | `verified=true` iken doğrulayan kurum tooltip'ini üretir; tek başına doğrulama açmaz |
| phone | prop | `string` | — | — | Biçimli numara; `tel:` href rakam-dışı karakterlerden arındırılır |
| onMessage | prop | `() => void` | — | — | Verilmezse "Mesaj Gönder" hiç render edilmez |
| onViewListings | prop | `() => void` | — | — | Verilmezse ilan linki hiç render edilmez |
| variant | prop | `'panel'\|'inline'` | `'panel'` | — | Yerleşim ekseni — hover/focus/active gibi bir "durum" değil |
| ...rest | — | `HTMLAttributes<HTMLElement>` | — | — | Köke geçer, `className` birleştirilir |

Ref hedefi yok. Event sözleşmesi: `onMessage`/`onViewListings` yalnız kendi
butonlarının tıklamasında çalışır; ikisi birbirinden bağımsızdır.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant=panel`, `verified=false`, aksiyonsuz.

| Kural | Davranış |
|---|---|
| `stats` boş/yok | İstatistik satırı hiç render edilmez (`<dl>` DOM'da yok) |
| `phone` yok | Telefon linki render edilmez |
| `onViewListings` yok | İlan linki render edilmez |
| `onMessage` yok | "Mesaj Gönder" render edilmez |
| `verified=false` + `verifiedBy` | Doğrulama işareti ve bilgi düğmesi render edilmez; `verified` tek doğruluk kaynağıdır |
| `verified=true` + `verifiedBy` yok | Yalnız erişilebilir check işareti render edilir |
| `logoSrc` + fallback | img kazanır; ikisi aynı anda çıkmaz (GlassAvatar sözleşmesi) |
| Kart başına tek `prominent` | Yalnız "Mesaj Gönder"; telefon/ilan linki sade tipografi, buton chrome'u yok |

`material`/`tone`/`thickness`/`prominent` ekseni: N/A — kök cam değil, içerik
katmanı sabit flat yüzey (bkz. §1). İç kontroller (`GlassButton`) kendi
malzeme eksenini korur.

## 6. State modeli

Component tamamen prop güdümlüdür; kendi internal state'i yoktur.
`GlassTooltip` hover/focus/açık state'ini kendi sözleşmesiyle yönetir.
`panel/inline` bir görünüm ekseni, hover/focus/active gibi bir durum değildir;
her ikisi de sürekli, controlled olmayan bir prop.

## 7. Davranış

- Pointer/keyboard: doğrulama bilgi düğmesi focus'ta tooltip'i anında açar;
  hover varsayılan gecikmeyle açar, Escape/blur kapatır. Telefon linki native
  `<a>` Tab sırasına girer; "N ilanı görüntüle" ve "Mesaj Gönder" native
  `<button>` — Enter/Space aktive eder.
- Focus akışı DOM sırası: logo/check (focus almaz) → varsa doğrulama bilgisi →
  telefon linki → ilan linki → Mesaj Gönder.
- "N ilanı görüntüle" metni `stats` içinde etiketinde (Türkçe büyük/küçük
  harf duyarsız) "ilan" geçen ilk kaydın `value`'sunu kullanarak türer (ör.
  `{ label: 'Aktif İlan', value: '48' }` → "48 ilanı görüntüle"); eşleşme
  yoksa jenerik "İlanları görüntüle" metnine düşer. Türkçe `İ/I` çevrimi
  hatalı sonuç vermesin diye `toLocaleLowerCase('tr')` kullanılır (`.toLowerCase()`
  DEĞİL — `'İlan'.toLowerCase()` iki karakterli `'i̇lan'` üretir ve eşleşmeyi
  bozar).
- `prefers-reduced-motion: reduce`: ilan linkinin chevron kayma geçişi kapanır.
- Responsive: `inline` varyant kökte `container-type: inline-size` kullanır.
  Genişte her kart aynı `2fr / 1fr / 1fr` identity/stats/actions kolonlarını
  taşır. Kart 768px ve altında identity tam satıra, stats/actions ikinci
  satıra; 640px ve altında tüm bölümler tek kolona düşer. En dar düzende
  avatar iki satırı kaplar, doğrulama grubu isim/tagline'ın altında kalır.
  `panel` dikey flex akışını korur.

## 8. İçerik kuralları

- `name` uzun kurumsal unvanlarda sarar, truncation yok (bkz. UzunIcerik
  story).
- `stats` etiketleri kısa tutulmalı (`white-space: nowrap`); uzun etiket
  satırı büyütür, kesilmez.
- Doğrulama metinleri `"Doğrulanmış kurumsal ofis"` ve `"Doğrulama
  ayrıntısı: Kurumsal kimlik {source} tarafından doğrulandı."`; buton
  metinleri "Mesaj Gönder"/"İlanları görüntüle" hardcoded Türkçedir — i18n
  borcu.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | background / border / radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` |
| name | font-size | `--lg-text-headline` |
| tagline / statLabel | color | `--lg-label-secondary` |
| statValue | font-size / font-variant-numeric | `--lg-text-title` / `tabular-nums` |
| verificationMark | color | `color-mix(--lg-success 55%, --lg-label)` |
| verificationInfo | size / color / radius / focus | `--lg-control-sm` (`coarse`: `--lg-control-md`) / `--lg-label-secondary` / `--lg-radius-chip` / `--lg-accent` |
| viewListings | color / focus outline | `--lg-accent` |
| viewListings (dokunmatik) | min-height | `--lg-control-md` (`@media (pointer: coarse)` — coarse'ta 44px) |
| messageButton | — | `GlassButton` kendi token'larını taşır (`prominent`) |

Borç (mikro-geometri): token karşılığı olmayan değerler component kökünde
yerel değişken olarak toplandı — `.card { --gap-tight: 2px; --icon-check: 13px;
--icon-info: 14px; --icon-chevron: 10px; --chevron-shift: 2px;
--textlink-height: 24px; }`.
`--gap-tight` statLabel/statValue ve `who` satır aralığı; ikon ölçeği için
token yok (GlassSellerCard'daki `VerifiedIcon` borcuyla aynı gerekçe);
`--chevron-shift` hover'da chevron kayma mesafesi (salt efekt geometrisi);
`--textlink-height` GlassFooter `.link` deseniyle tutarlı. Chevron geçiş
süresi (`0.15s ease`) raw kalır — süre/easing token'ı yok.

Doğrulama check'i `currentColor` kullanır; eski opak success rozetinin
düşük-kontrastlı beyaz metni ve `!important` override'ı kaldırılmıştır.
Info button görünür glyph'i küçük kalırken odak hedefi masaüstünde
`--lg-control-sm`, coarse pointer'da `--lg-control-md` olur.

## 10. Storybook kapsamı

Var: Default, Playground, Varyantlar (panel/inline yan yana), Logolu,
Durumlar (minimal · yalnız telefon+ilan · kaynaksız doğrulama · kaynak
tooltip'i), Uzun İçerik, Responsive (mobile1, container-güdümlü tek kolon),
Erişilebilirlik (docs description'lı). **Eksik:** Sizes (N/A — `size` ekseni tanımlı değil).

## 11. Test kabul kriterleri

- [x] kurum adı + baş harf fallback'i render edilir (unit)
- [x] `logoSrc` verilince img render, fallback yok (unit)
- [x] `verified` true/false kompakt işaret render/yok kontrolü (unit)
- [x] `verifiedBy` bilgi düğmesinin accessible name/title/tooltip içeriği (interaction)
- [x] `data-part` identity/verification/stats/actions kancaları (unit)
- [x] `stats` etiket/değer çiftleri render edilir (unit)
- [x] `phone` → `tel:` href doğru üretilir (unit)
- [x] `onViewListings` + "Aktif İlan" stat'ından dinamik metin türer, tıklamada çağrılır (interaction)
- [x] `onViewListings` uygun stat yoksa jenerik metne düşer (unit)
- [x] `onMessage` tıklamada çağrılır; verilmezse render edilmez (interaction)
- [x] `variant` → `data-variant` attribute'üne yansır (unit)
- [x] `tagline` var/yok render kontrolü (unit)
- [ ] dokunmatikte "N ilanı görüntüle" 44px hedefine büyümesi (visual)
- [ ] `inline` varyantın 768px/640px container geçişleri ve ortak kolon hizası (visual)

## 12. Do / Don't

- ✅ `stats`'ta "ilan" geçen bir etiket verirsen (ör. "Aktif İlan") ilan linki
  metni otomatik sayıyla zenginleşir — ayrıca bir sayı prop'u geçirme.
- ✅ İçerik sayfasında kurumsal karşılaştırma listelerinde `inline`, ilan
  detay yan kolonunda `panel` kullan.
- ✅ Doğrulayan kurum biliniyorsa `verifiedBy` ile kısa kurum adını ver;
  doğrulama kapsamını abartılı onay/garanti diliyle genişletme.
- ❌ Karta ikinci bir `prominent` aksiyon ekleme — telefon/ilan linki sade
  tipografi kalmalı, buton chrome'u almamalı.
- ❌ `GlassSellerCard`'a dokunma/birleştirme — bireysel ve kurumsal kimlik
  kartları kasıtlı olarak ayrı component'ler (farklı istatistik/telefon
  sözleşmeleri).

**Bilinen kısıtlar:** `GlassTooltip` coarse pointer'da açılmaz; doğrulayan
kurum dokunmatik kullanıcı için kritik bilgi olacaksa görünür metin veya
tap-popover gerekir · `stats` sayı formatı doğrulanmaz (çağıran sorumluluğu)
· ilan linki metni yalnız etiket eşleşmesiyle türer, açık bir `listingCount`
prop'u yok · metinler i18n'siz. **Açık kararlar:** ayrı bir
`listingCount` prop'unun eklenip eklenmeyeceği (şu an `stats` eşleşmesine
bağlı) · `stats` öğe sayısı üst sınırı (şu an sınırsız, `flex-wrap` ile sarar)
· telefon linkine `GlassSellerCard`'daki gibi maskeleme/reveal deseni
eklenip eklenmeyeceği (kurumsal hatlarda gizlilik ihtiyacı genelde yok
varsayıldı).

## Changelog

- 2026-07-17: İlk sürüm — panel/inline varyantları, GlassAvatar logo
  fallback'i, tabular stats satırı, telefon `tel:` linki, dinamik "N ilanı
  görüntüle" metni, tek prominent "Mesaj Gönder" CTA.
- 2026-07-17: Eski metin rozetinin kontrastı açık temada ~2.2:1'den ~5.2:1'e
  çıkarıldı; bu rozet 2026-07-24 kompakt işaret değişikliğinde kaldırıldı.
- 2026-07-24: Büyük doğrulama rozeti kompakt check + isteğe bağlı kaynak
  tooltip'ine dönüştürüldü; `verifiedBy` ve stabil `data-part` kancaları
  eklendi. Inline flex, ortak kolonlu ve container-responsive grid oldu.
