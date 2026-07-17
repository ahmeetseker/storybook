---
name: GlassCompareTable
category: içerik
status: hazır
lastReviewed: 2026-07-17
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
  gerçek `<table>`. `aria-label` prop'u tabloyu adlandırır.
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
| listings[].values | ✅ | `Record<string, string\|number>` | eksik anahtar → hücrede "—" |
| kaldırma butonu | `onRemove` verilirse | — | erişilebilir isim `Karşılaştırmadan çıkar: {title}` |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| fields | prop | `GlassCompareField[]` (`{key, label, higherIsBetter?}`) | — (zorunlu) | Satır sırası = dizi sırası |
| listings | prop | `GlassCompareListing[]` (`{id, title, image?, values}`) | — (zorunlu) | Sütun sırası = dizi sırası; ilk 4'ü render edilir (bkz. §5) |
| highlightDifferences | prop | `boolean` | `true` | Bir satırda ilanlar arasında değer farkı varsa satırı hafif vurgular |
| onRemove | event | `(id: string) => void` | — | Verilirse her sütun başlığında kaldırma butonu görünür; tıklanınca `listing.id` ile çağrılır — component kendi `listings`'ini FİLTRELEMEZ, yeni diziyi vermek çağıranın işidir |
| aria-label | prop | `string` | — | Tabloyu adlandırır |
| ...rest | — | `HTMLAttributes<HTMLTableElement>` (`onChange` hariç) | — | `<table>` elemanına geçer; `className` sarmalayıcı `div`'e uygulanır |

Ref hedefi: yok (v1). Event sözleşmesi: `onRemove` yalnız kullanıcının
butona tıklamasıyla tetiklenir; component state tutmaz, tamamen
`fields`/`listings` prop'larından türetilmiş salt-okunur render'dır — bu
yüzden `value`/`defaultValue`/`onXChange` üçlüsü N/A (controlled/uncontrolled
eksen yok, çünkü içsel state yok).

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

N/A — component'in kendi state'i yoktur; her render tamamen `fields` +
`listings` + `highlightDifferences` prop'larından türetilir ("en iyi değer"
kümesi ve "satır farklı mı" bayrağı saf fonksiyonlarla hesaplanır, state'e
yazılmaz). `onRemove` çağrısı sonrası `listings`'i güncellemek/filtrelemek
tamamen çağıranın sorumluluğundadır (bkz. `Kaldirilabilir` story).

## 7. Davranış

- **Pointer:** kaldırma butonuna tıklama `onRemove(id)` çağırır; başka
  etkileşim yok (satır/hücre tıklaması anlamsız).
- **Klavye:** özel widget rolü YOK — bu gerçek bir `<table>`, klavye
  gezinmesi tarayıcının doğal `Tab` sırasıyla çalışır (yalnız kaldırma
  butonları odaklanabilir; `Enter`/`Space` native `<button>` davranışı).
  Roving tabindex/ok tuşu deseni yalnız `tablist`/`radiogroup` gibi ARIA
  widget rolü ÜSTLENEN component'lerde zorunludur (bkz.
  `GlassSegmentedControl`) — burada öyle bir rol üstlenilmediği için
  uygulanmaz.
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

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| wrapper | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-media` | — |
| th/td | ayraç | `--lg-hairline` | satır farklıysa: `color-mix(--lg-accent 6%, --lg-surface)` |
| sticky kolon | arka plan | `--lg-surface` (opak, kaymayı gizler) | satır farklıysa aynı karışık renk |
| en iyi hücre | renk | `--lg-success` | — |
| kaldırma butonu | arka plan/renk | `color-mix(--lg-label 8%)` / `--lg-label-secondary` | hover: `color-mix(--lg-danger 16%)` + `--lg-danger` (yalnız `hover: hover`) |
| kaldırma butonu focus | outline | `--lg-accent` | yalnız `:focus-visible` |
| görsel radius | `--lg-radius-chip` | — | — |
| td/th padding, font | `--lg-space-*` / `--lg-text-*` | — | — |

**Borç (raw):** kaldırma butonu ölçüsü 24px (coarse pointer'da 44px'e
yükseliyor) — token yok, `GlassChip`'in `.remove`'u ile aynı raw desen ·
`.image` `max-width: 160px` / `aspect-ratio: 4/3` raw · `.corner`/
`.rowHeader`/`.listingHead` `min-width: 140-160px` raw (sütun genişliği
tahmini, container query yok) · `line-clamp: 2` raw satır sayısı.

## 10. Storybook kapsamı

Var: Default, Playground, Kaldirilabilir (controlled `onRemove` akışı,
listeden filtreleme çağıranın işi), VurgusuzKarsilastirma
(`highlightDifferences=false`), DortIlan (üst sınır), BesIlanKirpilir (sınır
üstü sessiz kırpma), UzunIcerik (uzun başlık + uzun metin değerleri, dar
container), Responsive (mobile viewport + sticky ilk kolon), Erisilebilirlik
(docs açıklamalı, `onRemove` ile).
**Eksik:** Temalar (ayrı story yok — toolbar'la Kağıt/Grafit doğrulanır,
tüm token'lar üzerinden otomatik) · States (disabled ilan/alan N/A — v1'de
yok).

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

**Changelog:** 2026-07-17 ilk sözleşme.
