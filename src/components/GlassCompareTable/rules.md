---
name: GlassCompareTable
category: içerik
status: hazır
lastReviewed: 2026-07-27
---

# GlassCompareTable Kuralları

## 1. Amaç

Çoklu ilan karşılaştırma tablosu: 2-4 ilanı yan yana, ortak özellik
satırlarıyla karşılaştırır (fiyat, alan, imar durumu vb.). İçerik katmanı
component'idir — cam yok, gerçek `<table>` semantiği.

- **Kullan:** kullanıcının birden çok ilanı yan yana, aynı alan setinde
  kıyasladığı akış (favoriler/karşılaştırma sepeti).
- **Kullanma:** tek ilanın anahtar–değer listesi (→ `GlassSpecTable`),
  sıralanabilir/seçilebilir genel kayıt listesi (→ `GlassTable`), kart
  tabanlı vitrin/galeri (→ `GlassVitrin`/`GlassGallery`).

| İlgili | Farkı |
|---|---|
| GlassSpecTable | Tek ilan, `dl` etiket/değer çifti; çoklu sütun yok |
| GlassTable | Satır=kayıt, sütun=alan (bu component'te tam tersi: satır=alan, sütun=ilan); sıralama/seçim var, "en iyi değer" yok |
| GlassVitrin | Kart ızgarası; hücre bazlı kıyaslama yok |

## 2. Semantik sözleşme

- Kök: yatay kaydırma için `<div>` sarmalayıcı (`overflow-x: auto`) içinde
  gerçek `<table>`. `aria-label` prop'u tabloyu adlandırır. Sarmalayıcı `div`
  ayrıca `role="region"` + `tabIndex={0}` + `aria-label` (aynı `aria-label`
  prop'undan türer, verilmezse `"İlan karşılaştırma tablosu"` varsayılanı)
  taşır — taşan sütunlara `Tab` ile de erişilebilsin diye kaydırma kabının
  kendisi klavye odağı alabilir (`:focus-visible` halkası görünür).
- `<thead>` > `<tr>` > ilk hücre `<th scope="col">` ("Özellik" köşe
  etiketi) + her ilan için `<th scope="col">` (görsel + başlık +
  opsiyonel kaldırma butonu).
- `<tbody>` > her `field` için bir `<tr>` > ilk hücre `<th scope="row">`
  (alan etiketi) + her ilan için bir `<td>`.
- İlk kolon (`th scope="col"` köşe hücresi + her satırın `th scope="row"`'u)
  `position: sticky; left: 0` ile yatay kaydırmada sabit kalır — kapsayıcı
  `div` kayar, sayfa gövdesi asla yatay kaymaz.
- DOM değişmezi: her `field` tam bir `<tr>`, her `listing` tam bir sütun
  (başlıkta bir `<th>`, her satırda bir `<td>`) üretir; `key`'ler sırasıyla
  `field.key` ve `listing.id` — ikisi de çağıran tarafından benzersiz
  tutulmalı.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| fields[].label | ✅ | `string` | `th scope="row"`; satır sırası = dizi sırası |
| fields[].higherIsBetter | — | `boolean` | verilirse + değerler sayısalsa en iyi hücre işaretlenir |
| listings[].title | ✅ | `string` | `th scope="col"` içinde görünür başlık, 2 satırda kırpılır |
| listings[].image | — | `string` (URL) | dekoratif, `alt=""`; bilgi başlık metninde |
| listings[].imageFallback | — | `string` (URL) | `image` hata verirse yalnız bir kez denenir; dekoratif `alt=""` değişmez |
| listings[].values | ✅ | `Record<string, string\|number>` | eksik anahtar → hücrede "—" |
| kaldırma butonu | `onRemove` verilirse | — | erişilebilir isim `Karşılaştırmadan çıkar: {title}` |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| fields | prop | `GlassCompareField[]` (`{key, label, higherIsBetter?}`) | — (zorunlu) | Satır sırası = dizi sırası |
| listings | prop | `GlassCompareListing[]` (`{id, title, image?, imageFallback?, values}`) | — (zorunlu) | Sütun sırası = dizi sırası; `imageFallback`, `image` hata verirse bir kez denenir; ilk 4'ü render edilir (bkz. §5) |
| highlightDifferences | prop | `boolean` | `true` | Bir satırda ilanlar arasında değer farkı varsa satırı hafif vurgular |
| onRemove | event | `(id: string) => void` | — | Verilirse her sütun başlığında kaldırma butonu görünür; tıklanınca `listing.id` ile çağrılır — component kendi `listings`'ini FİLTRELEMEZ, yeni diziyi vermek çağıranın işidir. Çağrı sonrası odak kalan ilk kaldırma butonuna, hiç kalmadıysa kaydırma kabına taşınır (bkz. §7) |
| aria-label | prop | `string` | — | Tabloyu VE yatay kaydırma kabını (`role="region"`) adlandırır; verilmezse kap `"İlan karşılaştırma tablosu"` varsayılanını kullanır, `<table>`'ın kendi `aria-label`'ı boş kalır |
| ...rest | — | `HTMLAttributes<HTMLTableElement>` (`onChange` hariç) | — | `<table>` elemanına geçer; `className` sarmalayıcı `div`'e uygulanır |

Ref hedefi: yok (v1, dışa açık `ref` prop'u yok). Event sözleşmesi:
`onRemove` yalnız kullanıcının butona tıklamasıyla tetiklenir; karşılaştırma
verisi tamamen `fields`/`listings` prop'larından türetilir, bu yüzden
`value`/`defaultValue`/`onXChange` üçlüsü N/A (controlled/uncontrolled eksen
yok). İki iç mekanizma public state değildir: odak kurtarma DOM'a yazılmayan
`ref`'lerle, görsel fallback seçimi ise her ilan görselinin yerel hata
state'iyle yürür (bkz. §6).

## 5. Seçenek eksenleri

Eksen yok (`material`/`tone`/`size`/`variant`/`thickness`/`tint`/`prominent`
N/A — flat içerik yüzeyi, tek görünüm). `highlightDifferences` ve `onRemove`
birer özellik anahtarı (prop), state değil.

| Kural | Davranış |
|---|---|
| `listings.length > 4` | Sessizce (console uyarısı YOK) ilk 4'e kırpılır — kalan ilanlar hiç render edilmez |
| `listings.length < 2` | Kırpma yok, verilen kadarı render edilir; ama component tek/sıfır ilanla "karşılaştırma" amacını taşımaz (§12 bilinen kısıt) |
| `field.higherIsBetter` undefined | O satırda hiçbir hücre "en iyi" işaretlenmez |
| `field.higherIsBetter` verilmiş ama değerlerden biri `string` | Sayısal karşılaştırma atlanır, o satırda işaretleme yapılmaz (tüm değerler `number` olmalı) |
| `onRemove` yok | Kaldırma butonu hiç render edilmez |

## 6. State modeli

Karşılaştırma açısından görünür/kontrollü state yoktur; alanlar, değerler,
"en iyi değer" kümesi ve "satır farklı mı" bayrağı tamamen `fields` +
`listings` + `highlightDifferences` prop'larından türetilir. `onRemove`
çağrısı sonrası `listings`'i güncellemek/filtrelemek tamamen çağıranın
sorumluluğundadır (bkz. `Kaldirilabilir` story).

Görsel hata state'i her `CompareListingImage` örneğinin içinde yereldir:
başarısız olan `{image, imageFallback}` çifti tutulur. Geçerli prop çifti bu
kayıtla eşleşiyorsa `imageFallback` gösterilir. Fallback de hata verirse
state yeniden yazılmaz ve `src` sabit kalır; böylece hata döngüsü oluşmaz.
Aynı `listing.id` korunurken `image` veya `imageFallback` değişirse kayıt
artık eşleşmez ve yeni `image` hemen yeniden denenir. State component
örnekleri arasında paylaşılmaz, global hata kaydı yoktur.

İstisna — odak kurtarma (yalnız yan etki, render'ı etkilemez): bir
`removeButtonRefs` haritası (`listing.id` → buton DOM node'u) ve bir
"kurtarma bekliyor" `ref` bayrağı iç olarak tutulur. Kaldırma butonuna
tıklanınca bayrak `true` olur; bir sonraki commit'te (`listings` prop'u
kısaldıktan sonra) `useEffect` bayrağı görüp odağı kalan ilk kaldırma
butonuna (yoksa kaydırma kabına) taşır ve bayrağı sıfırlar. Bu mekanizma
`useRef` ile yürütülür, `useState` DEĞİLDİR — bu yüzden ek bir render
tetiklemez ve yukarıdaki "render tamamen prop'lardan türetilir" ilkesini
bozmaz.

## 7. Davranış

- **Pointer:** kaldırma butonuna tıklama `onRemove(id)` çağırır; başka
  etkileşim yok (satır/hücre tıklaması anlamsız).
- **Görsel fallback:** `listing.image` yükleme hatasında geçerli
  `listing.imageFallback` yalnız bir kez kaynak olarak seçilir. Fallback'in
  kendi hatası ikinci bir kaynak değişimi tetiklemez. `image` veya
  `imageFallback` prop'u aynı id altında değişirse yeni çift bağımsız bir
  yükleme denemesi sayılır. `imageFallback` yoksa ya da `image` ile aynıysa
  kaynak değiştirilmez.
- **Klavye:** özel widget rolü YOK — bu gerçek bir `<table>`, hücre içi
  gezinme tarayıcının doğal `Tab` sırasıyla çalışır (yalnız kaldırma
  butonları odaklanabilir; `Enter`/`Space` native `<button>` davranışı).
  Roving tabindex/ok tuşu deseni yalnız `tablist`/`radiogroup` gibi ARIA
  widget rolü ÜSTLENEN component'lerde zorunludur (bkz.
  `GlassSegmentedControl`) — burada öyle bir rol üstlenilmediği için
  uygulanmaz. Ayrıca sarmalayıcı kaydırma kabının kendisi `tabIndex={0}` +
  `role="region"` ile klavye odağı alabilir — taşan (viewport dışına kayan)
  sütunlara `Tab` sırasında erişim, kaldırma butonu bulunmayan salt-okunur
  kullanımda bile garanti edilir; `:focus-visible` halkası kap üzerinde
  görünür (`outline-offset: -2px`, kırpılmasın diye içe doğru).
- **Odak kurtarma (`onRemove` sonrası):** bir kaldırma butonuna tıklanıp
  `onRemove` çağrıldıktan ve çağıran `listings`'i filtreleyip component'i
  yeniden render ettikten sonra, component odağı OTOMATİK olarak kalan ilk
  ilanın kaldırma butonuna taşır; hiç ilan kalmadıysa (son sütun da
  kaldırıldıysa) odak kaydırma kabına (`div[role="region"]`) taşınır. Bu
  sayede kaldırılan butonla birlikte odağın tarayıcı `<body>`'ye düşüp
  kaybolması engellenir. Mekanizma tamamen `ref` tabanlıdır, `listings`
  prop'u değişmezse (çağıran filtrelemezse) hiçbir görünür etkisi yoktur.
- **Sticky ilk kolon:** `position: sticky; left: 0`; en yakın kaydıran ata
  (sarmalayıcı `div`) üzerinde çalışır, ek prop gerekmez. Sticky hücrelerin
  arka planı opak (`--lg-surface` bazlı) tutulur ki altından kayan diğer
  hücreler görünmesin — `highlightDifferences` vurgusu da bu nedenle sticky
  hücrede transparan değil `--lg-surface` üzerine karışık renkle uygulanır.
  Üst satır (thead) sticky DEĞİLDİR — yalnız ilk kolon sabittir (spec'in
  net istediği kapsam; §12 açık karar).
- **En iyi değer işaretleme:** yalnız `field.higherIsBetter !== undefined`
  VE o satırdaki tüm `listing.values[field.key]` değerleri `number` iken
  çalışır; eşitlik durumunda (birden çok ilan aynı en iyi değere sahipse)
  hepsi işaretlenir. İşaretleme yalnız renkle değil (`--lg-success`), görsel
  olarak gizli "(en iyi değer)" metniyle de yapılır (renk körü/ekran
  okuyucu erişilebilirliği).
- **Sayı biçimlendirme:** `typeof value === 'number'` olan hücreler
  `toLocaleString('tr-TR')` ile binlik ayraçlı gösterilir (ör. `4250000` →
  `"4.250.000"`); para birimi/ölçü birimi eki YOKTUR — bunu `field.label`
  içine ekle (ör. "Fiyat (TL)"). String değerler olduğu gibi gösterilir.
- **Fark hesabında (`highlightDifferences`) sayısal normalizasyon:** bir
  satırdaki TÜM ilan değerleri sayıya parse edilebiliyorsa (binlik/ondalık
  ayraçları temizlenerek — `"1.000"` → `1000`, `"1.500,50"` → `1500.5`)
  karşılaştırma SAYISAL yapılır; ör. `1000` (number) ile `"1.000"` (string)
  aynı kabul edilir, `data-differs` YAZILMAZ. Herhangi bir değer sayıya
  çevrilemiyorsa (ör. "Konut İmarlı") satırın tamamı ham METİN olarak
  karşılaştırılır (önceki davranış). Bu normalizasyon yalnız "satır farklı
  mı" bayrağı içindir — `higherIsBetter` "en iyi değer" hesabı hâlâ katı
  `typeof value === 'number'` şartını arar (bkz. §5 tablosu), string
  değerleri normalize ETMEZ.
- **Responsive:** kapsayıcı `overflow-x: auto`; sayfa gövdesi hiçbir zaman
  yatay kaymaz. 700px altı için `GlassTable`'daki gibi ayrı bir "kart
  görünümü" modu YOKTUR — sticky ilk kolon zaten dar ekranda da çalışır
  (§12 açık karar: kart görünümü v2).

## 8. İçerik kuralları

- `listing.title` 2 satırda `-webkit-line-clamp` ile kırpılır; uzun
  başlıkları öngör, kritik bilgiyi ilk birkaç kelimeye koy.
- `field.label` `th scope="row"` içinde serbestçe kırılır (nowrap değil);
  uzun TR etiketler ("Sahile Uzaklık (km)") satır yüksekliğini artırabilir.
- Eksik `listing.values[field.key]`: hücrede "—" (em dash) gösterilir,
  boş string/undefined ile aynı muameleyi görür.
- `listing.image` dekoratifse `alt=""` sabit — görsel bilgi zaten başlık
  metninde; görselin kendisi karar verici bilgi taşımamalı.
- `listing.imageFallback` de aynı dekoratif sözleşmeyi sürdürür; fallback'e
  geçiş accessible name üretmez ve görünür başlığın yerine geçmez.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| wrapper | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-media` | — |
| th/td | ayraç | `--lg-hairline` | satır farklıysa: `color-mix(--lg-accent 6%, --lg-surface)` |
| sticky kolon | arka plan | `--lg-surface` (opak, kaymayı gizler) | satır farklıysa aynı karışık renk |
| en iyi hücre | renk | `--lg-success` | — |
| kaldırma butonu | arka plan/renk | `color-mix(--lg-label 8%)` / `--lg-label-secondary` | hover: `color-mix(--lg-danger 16%)` + `--lg-danger` (yalnız `hover: hover`) |
| kaldırma butonu focus | outline | `--lg-accent` | yalnız `:focus-visible` |
| kaydırma kabı (region) focus | outline | `--lg-accent` (`outline-offset: -2px`) | yalnız `:focus-visible` |
| görsel radius | `--lg-radius-chip` | — | — |
| td/th padding, font | `--lg-space-*` / `--lg-text-*` | — | — |

**Borç (mikro-geometri):** kökte (`.wrapper`) yerel değişkenlerde toplandı:
`--glass-comparetable-remove-size/font` (24px/16px kaldırma butonu — token
yok, `GlassChip`'in `.remove`'u ile aynı desen; coarse pointer büyümesi
`--lg-control-md`'ye bağlandı, coarse'ta birebir 44px — dokunmatikte büyüme
tasarımın istediği davranıştır), `--glass-comparetable-image-max` (160px, `aspect-ratio: 4/3`
raw), `--glass-comparetable-label-col`/`--glass-comparetable-listing-col`
(140px/160px sütun genişliği tahmini, container query yok) ·
`line-clamp: 2` raw satır sayısı. Görsel değerler değişmedi.

## 10. Storybook kapsamı

Var: Default, Playground, Kaldirilabilir (controlled `onRemove` akışı,
listeden filtreleme çağıranın işi), VurgusuzKarsilastirma
(`highlightDifferences=false`), GorselFallback (deterministik kırık temsili
görsel → ilan görseli fallback'i), DortIlan (üst sınır), BesIlanKirpilir
(sınır üstü sessiz kırpma), UzunIcerik (uzun başlık + uzun metin değerleri,
dar container), Responsive (mobile viewport + sticky ilk kolon),
Erisilebilirlik (docs açıklamalı, `onRemove` ile). States kapsamındaki
görsel yükleme hatası `GorselFallback` ile kapsanır; disabled ilan/alan
v1'de N/A'dır.
**Eksik:** Temalar (ayrı story yok — toolbar'la Kağıt/Grafit doğrulanır,
tüm token'lar üzerinden otomatik).

## 11. Test kabul kriterleri

- [x] `th scope="col"` sütun başlıkları + `th scope="row"` satır başlıkları
      render edilir (unit)
- [x] her ilanın değeri doğru satır/sütun kesişiminde, sayılar `tr-TR`
      gruplamasıyla render edilir (unit)
- [x] `higherIsBetter=false` alanda en düşük sayısal değer "(en iyi değer)"
      ile işaretlenir, diğerleri işaretlenmez (unit)
- [x] `higherIsBetter=true` alanda en yüksek sayısal değer işaretlenir (unit)
- [x] `higherIsBetter` verilmeyen (string) alanda hiçbir hücre işaretlenmez
      (unit)
- [x] `highlightDifferences=false` → hiçbir satır `data-differs` taşımaz
      (unit)
- [x] `highlightDifferences` (varsayılan) açıkken değeri farklı satır
      `data-differs` taşır, aynı değerli satır taşımaz (unit)
- [x] `onRemove` verildiğinde erişilebilir isimli buton render edilir ve
      tıklama `listing.id` ile çağırır (unit)
- [x] `onRemove` verilmediğinde hiçbir buton render edilmez (unit)
- [x] 4'ten fazla ilan sessizce ilk 4'e kırpılır (unit)
- [x] eksik değer "—" gösterir (unit)
- [x] temsili görsel hata verince `imageFallback` yalnız bir kez seçilir;
      fallback hatası kaynağı değiştirmez ve görsel `alt=""` ile dekoratif
      kalır (unit)
- [x] aynı `listing.id` için `image`/`imageFallback` çifti değişince yeni
      temsili görsel yeniden denenir (unit)
- [x] yatay kaydırma kabı `role="region"` + `aria-label` taşır ve
      `tabIndex={0}` ile klavyeyle odaklanabilir; `aria-label` verilmezse
      varsayılan "İlan karşılaştırma tablosu" adı kullanılır (unit)
- [x] `onRemove` ile kaldırılan, odaklı butonun silinmesinin ardından odak
      kalan ilk kaldırma butonuna geçer; hiç buton kalmadıysa kaydırma
      kabına geçer (unit)
- [x] bir satırda değerler farklı gösterimlerle (number `1000` / string
      `"1.000"`) aynı sayıyı temsil ediyorsa `data-differs` YAZILMAZ; gerçek
      sayısal fark varsa (locale biçiminden bağımsız) `data-differs` yazılır
      (unit)
- [ ] sticky ilk kolonun yatay kaydırmada gerçekten sabit kaldığı ve altta
      kayan hücrelerin görünmediği (visual, Chrome)
- [ ] Kağıt/Grafit tema kontrastı, özellikle en iyi değer `--lg-success`
      rengi (visual)

## 12. Do / Don't

- ✅ Sayısal karşılaştırma istenen alanlarda (`fiyat`, `m2` gibi) değeri
  `number` olarak ver — `higherIsBetter` yalnız o zaman çalışır.
- ✅ Birim/para birimini `field.label` içine yaz (ör. "Fiyat (TL)") —
  component hücreye birim eklemez.
- ✅ `onRemove` verdiğinde kaldırılan id'yi kendi `listings` state'inden
  filtrelemeyi unutma (`Kaldirilabilir` story'sindeki desene bak).
- ✅ Temsili bir `image` veriyorsan gerçek ilana ait mevcut görseli
  `imageFallback` olarak taşı ve bu temsili kullanımı sayfa bağlamında açıkla.
- ❌ `values` içine blok component (kart, ikinci tablo) koyma — hücre
  içeriği kısa metin/sayı içindir.
- ❌ 2'den az veya 4'ten çok ilanla "karşılaştırma" UX'i kurma — alt sınır
  zorlanmaz ama anlamsızdır, üst sınır sessizce kırpılır (kullanıcıyı
  şaşırtabilir; çağıran arayüzü 4 ile sınırlamalı, ör. "sepete ekle"
  butonunu 4'te devre dışı bırak).

**Bilinen kısıtlar:** 700px altı için `GlassTable`'daki gibi ayrı "kart
görünümü" yok — sticky ilk kolon dar ekranda da çalışır ama sütun sayısı
arttıkça yatay kaydırma mesafesi uzar · `listings.length < 2` durumu
component tarafından engellenmez/uyarılmaz · sayısal olmayan (string)
alanlarda "en iyi değer" hiçbir zaman hesaplanmaz (metin karşılaştırması
desteklenmez) · thead sticky top değildir, yalnız ilk kolon sticky left'tir.

**Açık kararlar:** dar ekranda `GlassTable` benzeri kart görünümüne geçiş
(v2) · thead'in de sticky top yapılıp yapılmayacağı (şu an yalnız ilk kolon
sabit; ikisi birlikte sticky olursa köşe hücresinin z-index/kesişim
yönetimi gerekir) · para birimi/ölçü birimi için ayrı bir `field.unit`
alanı eklenip eklenmeyeceği.

**Changelog:** 2026-07-17 ilk sözleşme · 2026-07-17 (review fix) kaydırma
kabına `role="region"` + `tabIndex={0}` + `aria-label` (varsayılan "İlan
karşılaştırma tablosu") ve `:focus-visible` halkası eklendi; `onRemove`
sonrası odak kurtarma (kalan ilk kaldırma butonuna, yoksa kaba) eklendi;
`highlightDifferences` fark hesabı locale-farkındalıklı sayısal
normalizasyonla düzeltildi (`1000` ile `"1.000"` artık aynı sayılır) ·
2026-07-27 `GlassCompareListing.imageFallback` eklendi; temsili görsel
hatasında ilan görseline yalnız bir kez geçiş, ikinci hatada sabit kaynak ve
aynı id altında görsel prop çifti değişince yeniden deneme sözleşmesi eklendi.
