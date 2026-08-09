---
name: GlassPricingTable
category: içerik
status: hazır
lastReviewed: 2026-08-05
---

# GlassPricingTable Kuralları

## 1. Amaç

Abonelik planlarının karşılaştırılıp seçildiği fiyat tablosu — dönem (aylık /
yıllık) ve kullanıcı adedi eksenleriyle birlikte.

- **Kullan:** fiyatlandırma sayfası, yükseltme akışı, hesap → plan değiştirme.
- **Kullanma:** tek bir planın künyesi (→ `GlassPriceHeader`), ilan fiyatı
  (→ `GlassListingCard`), özellik karşılaştırma matrisi (→ `GlassCompareTable`).

| İlgili | Farkı |
|---|---|
| GlassCompareTable | Satır=özellik, kolon=öğe matrisi; fiyat ekseni ve seçim yok |
| GlassFeatureGroup | Yalnız özellik künyesi; fiyat, dönem ve eylem taşımaz |
| GlassSegmentedControl | Bu component'in dönem anahtarı olarak İÇİNDE kullanılır |
| GlassPriceHeader | Tek ilan/tek ürün fiyat başlığı; çoklu plan karşılaştırması yok |

## 2. Semantik sözleşme

- Kök: `<div data-layout="grid|compact">` — flat konteyner, kendi zemini yok.
- **Izgara:** her plan `<article>`, plan adı `<h3>`. Kart bir kontrol DEĞİLDİR;
  eylem yalnız butonlardadır.
- **Kompakt:** plan listesi `role="radiogroup" aria-label="Plan seçimi"`, her
  satır gerçek `<button role="radio" aria-checked aria-controls>`. Gövde
  kapalıyken DOM'da KALIR (`grid-template-rows` geçişi için gerekir) ama
  `inert` taşır — klavye/AT gezinmesinden çıkar (`GlassFeatureGroup`,
  `GlassAccordion` ile aynı desen).
- Dönem anahtarı `GlassSegmentedControl` (`radiogroup` + roving tabindex).
- Fiyat rulosu `aria-hidden`; tutar değişimi görünmez bir `aria-live="polite"`
  bölgesinde tam cümleyle duyurulur. Rulodaki 0–9 rakamları AT'ye sızmaz.
- Adet kontrolü `<output aria-live="polite">`; butonlar plan adı içeren
  `aria-label` taşır (aynı sayfada iki plan için ikişer buton olabilir).
- DOM değişmezi: her plan tam olarak bir fiyat düğümü ve bir özellik listesi
  üretir; yerleşim değişince plan sırası DEĞİŞMEZ (görsel sıra = DOM sırası).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| plans[].name | ✅ | `string` | Izgarada `h3`, kompaktta satır adı |
| plans[].kind | — | `string` | Yalnız kompaktta, adın altında ("danışman") |
| plans[].description | ✅ | `string` | Yalnız ızgarada; kompaktta yer yok |
| plans[].price | ✅ | `{monthly, yearly}` | Kuruşsuz tam sayı; biçim `locale`'den |
| plans[].seats | — | `GlassPricingSeats` | Yoksa plan tek kullanıcılık sayılır |
| plans[].action | ✅ | `{label, onSelect}` | Izgarada kart başına, kompaktta tek |
| plans[].secondaryAction | — | `{label, onSelect}` | Yalnız ızgarada çizilir |
| plans[].featuresTitle | ✅ | `string` | "Bireysel'deki her şey, ayrıca" |
| plans[].features | ✅ | `string[]` | Tik ikonlu liste |
| plans[].badge | — | `string` | Kısa tutulur; kompaktta alt satıra iner |
| footnote | — | `ReactNode` | Tablonun altında, iki uca yaslanır |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| plans | prop | `GlassPricingPlan[]` | — (zorunlu) | — | Sıra verilen dizinin sırasıdır |
| period | prop | `'monthly'\|'yearly'` | — | ✅ | Verilirse `defaultPeriod` yok sayılır |
| defaultPeriod | prop | `'monthly'\|'yearly'` | `'monthly'` | — | Uncontrolled başlangıç |
| onPeriodChange | event | `(p) => void` | — | — | Her seçimde; controlled'da tek kaynak |
| selectedPlanId | prop | `string` | — | ✅ | Görünür etkisi yalnız kompaktta |
| defaultSelectedPlanId | prop | `string` | ilk `prominent`, yoksa ilk plan | — | — |
| onSelectedPlanChange | event | `(id) => void` | — | — | — |
| seats | prop | `Record<string, number>` | — | ✅ | plan id → adet |
| defaultSeats | prop | `Record<string, number>` | `{}` | — | Verilmeyen plan `seats.included` sayılır |
| onSeatsChange | event | `(planId, count) => void` | — | — | Sınırlara kırpılmış değerle çağrılır |
| layout | prop | `'auto'\|'grid'\|'compact'` | `'auto'` | — | `auto` konteyneri ölçer |
| currency | prop | `string` | `'₺'` | — | Rakamın soluna yazılır |
| locale | prop | `string` | `'tr-TR'` | — | `Intl.NumberFormat` yereli |
| yearlyDiscountLabel | prop | `string` | ilk plandan hesaplanır | — | `''` verilirse rozet çizilmez |
| animatePrice | prop | `boolean` | `true` | — | `false` → rulo anında oturur |
| compactActionLabel | prop | `string` | `'{plan} ile devam et'` | — | `{plan}` seçili plan adıyla değişir |
| footnote | prop | `ReactNode` | — | — | — |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` | — | — | `className` birleşir; kök `div`'e geçer |

**Ref hedefi:** yok (kök `div` forward edilmez; ihtiyaç doğarsa açılır).
**Event sözleşmesi:** `onSelect` yalnız kullanıcı tıklamasında ve plan id ile
çalışır; dönem/adet değişiminde çalışmaz.

## 5. Seçenek eksenleri

| Eksen | Değerler | Varsayılan |
|---|---|---|
| layout | `auto` · `grid` · `compact` | `auto` |
| period | `monthly` · `yearly` | `monthly` |
| plan.prominent | `true` · `false` | `false` |

- **Varsayılan kombinasyon:** `layout="auto"`, `period="monthly"`, tek plan
  `prominent`.
- **Yasak:** birden fazla `prominent` plan — hiyerarşi düzleşir, hiçbiri öne
  çıkmaz. Kod bunu engellemez; gözden geçirmede yakalanır.
- **Yasak:** geniş alanda `layout="compact"` zorlamak — satırlar gereksiz
  uzar, karşılaştırma kaybolur.
- **Türetilen:** `seats.extraMonthly`/`extraYearly` yoksa veya `max ===
  included` ise adet kontrolü hiç çizilmez, satır "Tek kullanıcı" der.
- **Türetilen:** `plans.length` tek sayıysa tablet kademesinde son plan tam
  genişlik banda döner (`:last-child:nth-child(odd)`); çift sayıysa ızgara
  kalır.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| seçili dönem | `period` / iç durum | — | `aria-checked` (segment) |
| seçili plan | `selectedPlanId` / iç durum | — | `aria-checked` (satır) |
| açık gövde | seçili plan (türetilir) | — | `data-open` + `inert` |
| adet tabanda | `count <= included` | azaltma butonu | `disabled` |
| adet tavanda | `count >= max` | artırma butonu | `disabled` |
| hover / focus-visible / active | CSS | — | — |

Katman sırası: **availability** (disabled) → **value** (dönem/plan/adet) →
**interaction** (hover, focus, press).

## 7. Davranış

- **Pointer:** kompaktta satırın TAMAMI hedeftir (`min-height:
  --lg-control-hit`); küçük radyo noktasına nişan almak gerekmez.
- **Klavye:**

| Tuş | Etki |
|---|---|
| `Tab` | Her radiogroup'a bir kez girer (roving tabindex) |
| `↑` `↓` `←` `→` | Seçimi taşır ve focus'u birlikte götürür |
| `Home` / `End` | İlk / son plan |
| `Space` `Enter` | Satırı seçer (native button) |

- **Focus akışı:** ok tuşuyla seçim değişince focus yeni satıra taşınır; gövde
  açılırken focus çalınmaz.
- **Controlled/uncontrolled:** üç eksen de ayrı ayrı kontrol edilebilir. Bir
  eksen controlled'a alındığında iç durum GÜNCELLENMEZ; ekranda görünen değer
  yalnız prop'tan gelir.
- **Liste değişimi:** `plans` içinden seçili plan kalkarsa seçim ilk plana
  düşer ve `onSelectedPlanChange` çalışır.
- **Yerleşim geçişi:** `auto` modda konteyner 620px eşiğini geçince mod
  değişir; dönem, seçili plan ve adet KORUNUR.
- **Async / overlay:** N/A — component ne veri çeker ne portal açar.

## 8. İçerik kuralları

- `description` yalnız ızgarada görünür ve üç satır yer ayrılır (`min-height`)
  — kolonlar arasında fiyatlar aynı hizada başlasın diye. Daha uzun metin
  taşar, kırpılmaz.
- `badge` kısa tutulur; kompaktta ad satırına sığmadığı için plan türünün
  yanına, alt satıra iner.
- Uzun tutarlar: rulo basamak sayısına göre genişler, `motion` layout ile
  yumuşatılır; `/ay` eki zıplamaz.
- Lokalizasyon: rakam biçimi `locale`, sembol `currency` prop'undan gelir.
  Dönem etiketleri (`Aylık`/`Yıllık`, `/ay`, `/yıl`), "Kullanıcı sayısı" ve
  duyuru cümlesi şu an TÜRKÇE SABİTTİR — bkz. §12 açık kararlar.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kart | background | `--lg-surface` | prominent → `color-mix(accent %6, surface)` |
| kart | border | `--lg-hairline` | prominent → `color-mix(accent %32)` |
| kart | box-shadow | `--lg-shadow-xs` | hover / prominent → `--lg-shadow-sm` |
| kart | border-radius | `--lg-radius-card` | — |
| fiyat | font-size | `--lg-pricing-price-size` | kompakt → `--lg-text-title` |
| tasarruf | color | `--lg-success` | gizli → `opacity: 0` (yer korunur) |
| rozet | color / bg | `--lg-accent` / `color-mix(accent %10, surface)` | — |
| tik ikonu | color | `--lg-accent` | — |
| satır (kompakt) | background | `--lg-surface` | seçili → `color-mix(accent %5, surface)` |
| radyo noktası | border / fill | `color-mix(label %18)` / `--lg-accent` | seçili → accent |
| adet kontrolü | height | 32px görünür, `--lg-control-hit` hedef | disabled → `opacity: .35` |
| focus halkası | outline | `--lg-focus-ring-width` + `--lg-accent` | yalnız `:focus-visible` |
| boşluk | gap / padding | `--lg-space-1..8` | — |
| geçişler | duration / easing | `--lg-motion-duration-normal`, `--lg-motion-ease-standard` | reduced-motion → 1ms |

**Borç (raw değer):**

- Odometre şeridi `translateY(-N em)` ve `760ms cubic-bezier(0.22,1,0.36,1)`,
  gövde açılışı `420ms cubic-bezier(0.32,0.72,0,1)`, nokta `280ms`. Bunlar
  `--lg-motion-duration-normal`'dan (240ms) uzun; ölçekte karşılığı yok.
  Uzun-yumuşak bir motion kademesi (`--lg-motion-duration-slow`) açılırsa
  buraya bağlanır.
- Radyo noktası (22/11px), adet düğmesi (32px) ve tik ikonu (18px) mikro
  geometridir; kontrol ölçeğinde karşılığı yok. Dokunma hedefi token'a
  (`--lg-control-hit`) bağlıdır — görünür kutu değil.
- Konteyner eşikleri (620/880px) CSS değişkeni media/container query'de
  çalışmadığı için raw px'tir; `COMPACT_MAX_WIDTH` sabitiyle elle eşlenir.
  **Bu ikisi birlikte değişir.**

## 10. Storybook kapsamı

| Story | Durum |
|---|---|
| Default / Overview | ✅ `Default` |
| Playground (Controls) | ✅ `Playground` |
| Variants / Materials | ✅ `Yerleşimler` (grid · compact) |
| Sizes | N/A — `size` ekseni yok; ölçek konteynerden türetilir |
| States | ✅ `Durumlar` (adet tavanda, ikincil eylemsiz, rozetsiz) |
| Uzun içerik | ✅ `Uzun içerik` (uzun TR metin + 7 basamaklı tutar) |
| Responsive | ✅ `Responsive` (1180 / 760 / 390 px konteyner) |
| Erişilebilirlik | ✅ `Erişilebilirlik` |
| Ek | `Dört plan`, `Controlled`, `Animasyonsuz fiyat` |

## 11. Test kabul kriterleri

- **Unit:** dönem değişimi tutarı günceller; controlled dönemde iç durum
  tutulmaz; indirim rozeti ilk plandan hesaplanır; `currency`/`locale`
  biçimi uygular; `className`/rest köke geçer.
- **Interaction:** satır seçimi tek eylem etiketini günceller; ok tuşu seçimi
  taşır; adet kontrolü fiyatı büyütür ve sınırlarda pasifleşir; ek kullanıcı
  ücretlendirilmeyen planda kontrol çizilmez; controlled adet dışarıdan
  yönetilir.
- **Visual:** üç konteyner kademesi (390 / 760 / 1180) ve tek kalan planın
  bant yerleşimi; `animatePrice={false}` ile deterministik snapshot.
- **A11y:** iki `radiogroup`, roving tabindex, kapalı gövdede `inert`, fiyat
  rulosunda `aria-hidden`, adet butonlarında plan adlı `aria-label`, focus
  halkası yalnız `:focus-visible`.

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

**Do**

- Sayfada tek `prominent` plan bırak.
- `plans` sırasını ucuzdan pahalıya kur — kompakt liste bu sırayı okur.
- Başlık/açıklama metnini component'in ÜSTÜNE, sayfa katmanına yaz.

**Don't**

- Kartın içine cam yüzey koyma; component'in tek camı dönem anahtarıdır.
- `layout="compact"` değerini geniş alanda zorlama.
- Fiyat rulosunu metin olarak okutmaya çalışma — `aria-hidden`'dır.

**Bilinen kısıtlar**

- `grid-template-rows: 0fr → 1fr` geçişi eski tarayıcılarda animasyonsuz
  çalışır (açılma anında görünür); işlev bozulmaz.
- `auto` yerleşimde ilk ölçüm gelene kadar `grid` çizilir; dar konteynerde
  ilk boyamada tek kare ızgara görünebilir (`useElementSize` 150ms debounce).
  Bilinen genişlikte `layout` prop'unu vererek atlanabilir.
- Adet kontrolü yalnız kompakt yerleşimdedir; ızgarada adet fiyatın yanında
  yazıyla ("· 7 kullanıcı") gösterilir ama değiştirilemez.

**Açık kararlar**

- Arayüz metinleri (dönem etiketleri, "Kullanıcı sayısı", duyuru cümlesi)
  Türkçe sabittir. Ürün tek dilli olduğu sürece prop'a çıkarmak erken
  soyutlama olur; ikinci dil geldiğinde `labels` nesnesi eklenir.
- Birincil eylem (`prominent`) cam materyalde çizilir — GlassButton dolu
  eylemde `material` eksenini dinlemez, kabuktaki "İlan ver" ile aynı
  görünüm buradan gelir (2026-08-07 kararı, bkz. GlassButton/rules.md).
  İkincil eylem (`Satışla görüş`) içerik katmanında kaldığı için
  `material="flat"` kullanır. Şekil kapsüldür; ilk tasarım mock'unda
  `--lg-radius-chip` (10px) idi; eylem dilinin tek kaynaktan gelmesi
  (bkz. `--lg-action-*`) mock'a birebir sadakatin önüne geçti. Ürün kapsül
  dışında bir buton şekli isterse karar GlassButton'da alınır, burada değil.
- Yıllık indirim rozeti anahtarın YANINDA durur, segmentin içinde değil:
  `GlassSegmentedControl` etiketi düz metindir ve ikinci bir rozet dili
  açmamak için kontrol olduğu gibi yeniden kullanıldı.

**Changelog**

- 2026-08-05 — İlk sürüm. İki yerleşim (grid/compact), dönem ekseni, koltuk
  tabanlı fiyatlama, odometre rulosu. `--lg-pricing-price-size` token'ı
  eklendi.
- 2026-08-07 — Birincil eylemlerden `material="flat"` kaldırıldı: dolu eylem
  artık GlassButton kararıyla her yerde cam (kabuktaki "İlan ver" ile aynı
  görünüm). İkincil eylem flat kaldı.
