---
name: GlassListingRowCard
category: içerik
status: hazır
lastReviewed: 2026-08-12
---

# GlassListingRowCard Kuralları

## 1. Amaç

Arama sonuçlarında ve kayıtlı listelerde tek ilanı yatay bir satır olarak sunar:
solda medya, sağda fiyat/puan/özellik künyesi ve danışman + iletişim ayağı.

Kullanılır: sonuç listesi, favoriler, karşılaştırma öncesi tarama — kullanıcının
tek bakışta fiyat, konum ve iletişim kanalını görmesi gereken her yer.
Kullanılmaz: ızgara/carousel yerleşimleri (dikey kart daha yoğun paketlenir),
ilan detay sayfası künyesi (`GlassListingDetailHeader`).

İlgili component'ler:

- `GlassListingCard` — aynı içeriğin dikey karşılığı. Kartın **tamamı bir
  `<button>`'dır**; bu yüzden içine favori/menü/iletişim gibi iç içe kontrol
  konamaz. Bu component o kısıtı kaldırmak için ayrı yazıldı, varyantı değildir.
- `GlassListingManagementCard` — satıcı yüzü (yaşam döngüsü durumu + "işlem
  gerekli"). Bu component alıcı yüzüdür.
- `GlassSellerCard` / `GlassAgencyCard` — danışman/kurum künyesinin tam hali;
  buradaki ayak yalnız ad + avatar + yayın zamanı taşır.

## 2. Semantik sözleşme

- Kök element `<article>`; varsayılan olarak `aria-labelledby` ile başlığa
  bağlanır. Çağıran `aria-label` verirse O kazanır ve `aria-labelledby`
  basılmaz — ikisi birlikte basılsaydı `aria-labelledby` sessizce üste çıkıp
  verilen adı yok sayardı.
- Başlık `headingAs` (varsayılan `h3`) ile gerçek heading'dir; `useId()`
  üretimi `id` korunmalıdır (kartın erişilebilir adı buradan gelir).
- Kart **button yapılmaz**. Tetikleyici yalnız başlıktır: `href` → `<a>`,
  `onOpen` → `<button>`, ikisi de yoksa statik metin.
- Portal kullanılmaz. `onMenuOpen` yalnız bir sinyaldir; menü yüzeyini
  (`GlassMenu`/`GlassContextMenu`) çağıran açar ve odak dönüşünden sorumludur.
- DOM değişmezleri: favori butonu medya içinde ve DOM'da başlıktan ÖNCE
  gelir — odak sırası favori → başlık → diğer işlemler → iletişim eylemleri.
- Görsel `alt` içeriğin sorumluluğudur; verilmezse `alt=""` (dekoratif) olur.
  Nokta göstergesi ve tüm ikonlar `aria-hidden`.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| `image` | ✅ | Kapak görseli | Solda; `--lg-listing-row-media-height` taban yüksekliğini verir, künye uzunsa esner |
| `badge` | — | `GlassBadge` | Medyanın sol üstü; `material="flat"` beklenir (cam üstüne cam yok) |
| favori | — | Kalp | Yalnız `favorite`/`defaultFavorite`/`onFavoriteChange`'ten biri verilince çizilir |
| nokta göstergesi | — | `mediaCount` | Yalnız `mediaCount > 1` iken; dekoratif, carousel sürmez |
| `mediaCaption` | — | Medya etiketi | Medyanın sağ altı (ör. "8 fotoğraf"); nokta göstergesinin alternatifi |
| `price` + `priceSuffix` | ✅ | Biçimli fiyat | Biçimlendirme çağıranındır; tek satır, taşarsa ellipsis |
| başlık | ✅ | `title` | Tek satır + ellipsis |
| `rating` | — | 0–5 puan | Rakam `aria-hidden`, etiket `GlassRating`'in `role="img"` adından gelir |
| `location` | — | Konum | Tek satır + ellipsis |
| `features` | — | `<ul>` rozetleri | Her rozet tek satır; sığmazsa alt satıra sarar |
| `note` | — | Doğrulama/bilgi notu | Tek tonlu bant; renk tek başına anlam taşımaz, metin zorunlu |
| ayak | — | `agent` · `listedAt` · `footerMeta` · `actions` | Biri varsa çizilir; üstünde hairline ayraç |
| `footerMeta` | — | İkincil metrik | Eylemlerden önce (ör. birim fiyat); tek satır |
| `actions` | — | Eylem kümesi | `icon` varsa ikon-tek (ad `aria-label`'da), yoksa `label` görünür metin; `href` → `<a>`, yoksa `<button>` |
| `onMenuOpen` | — | "Diğer işlemler" | Sağ üst, dairesel; `menuLabel` erişilebilir adı verir |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| `image` | içerik | `{ src, alt?, fallbackSrc? }` | — | — | Kapak görseli; `src` yüklenemezse `fallbackSrc`'ye düşer |
| `title` | içerik | `string` | — | — | Başlık + kartın erişilebilir adı |
| `price` | içerik | `string` | — | — | Biçimlenmiş fiyat |
| `priceSuffix` | içerik | `string` | — | — | Dönem eki (`/yıl`) |
| `badge` | slot | `ReactNode` | — | — | Medya rozeti |
| `rating` | içerik | `number` | — | — | 0–5; `GlassRating variant="display"` |
| `location` | içerik | `string` | — | — | Konum satırı |
| `features` | içerik | `readonly Feature[]` | — | — | `{ label, icon? }` |
| `note` | içerik | `{ text, icon? }` | — | — | Tek satırlık not |
| `agent` | içerik | `{ name, avatarSrc? }` | — | — | Danışman künyesi |
| `listedAt` | içerik | `string` | — | — | Biçimlenmiş yayın zamanı |
| `actions` | slot | `readonly Action[]` | — | — | `{ id, label, icon?, href?, onClick? }` |
| `mediaCount` | içerik | `number` | — | — | >1 ise nokta göstergesi |
| `mediaCaption` | slot | `ReactNode` | — | — | Medya sağ altı etiketi |
| `footerMeta` | slot | `ReactNode` | — | — | Ayaktaki ikincil metrik |
| `activeMediaIndex` | içerik | `number` | `0` | — | Dolu nokta sırası |
| `onOpen` | event | `() => void` | — | — | Başlığı `<button>` yapar |
| `href` | içerik | `string` | — | — | Başlığı `<a>` yapar; `onOpen` ile birlikte verilirse kazanır |
| `favorite` | state | `boolean` | — | ✅ | Controlled favori |
| `defaultFavorite` | state | `boolean` | `false` | uncontrolled | Başlangıç favori |
| `onFavoriteChange` | event | `(v: boolean) => void` | — | — | Favori değişince çalışır |
| `onMenuOpen` | event | `() => void` | — | — | Menü tetikleyicisini çizer |
| `menuLabel` | içerik | `string` | `'Diğer işlemler'` | — | Menü butonunun adı |
| `headingAs` | seçenek | `'h2' \| 'h3' \| 'h4'` | `'h3'` | — | Heading seviyesi |
| `size` | eksen | `'sm' \| 'md'` | `'md'` | — | Yoğunluk |

Ref hedefi: N/A — kök `<article>`'a `ref` iletilmez (kalan `HTMLAttributes`
yayılır). Event sözleşmesi: `onFavoriteChange` yalnız kullanıcı tıklamasında
çalışır, prop değişiminde çalışmaz. `onOpen` yalnız `href` verilmediğinde
bağlanır. `actions[].onClick` yalnız `href` yokken bağlanır.

## 5. Seçenek eksenleri

| Eksen | Değerler | Not |
|---|---|---|
| `size` | `sm` · `md` | Yalnız yoğunluk (padding + fiyat/etiket kademesi + medya tabanı) değişir |

Varsayılan kombinasyon: `size="md"`, düz yüzey, tetikleyicisiz başlık.

Yasak kombinasyonlar:

- `material`/`tone` ekseni **yoktur**: kart içerik katmanıdır, cam olamaz.
  Listede onlarca kez tekrarlandığı için "sayfa başına max 6 cam yüzey"
  kuralını tek başına tüketirdi (GenelBakis.mdx).
- `href` + `onOpen` birlikte: `href` kazanır, `onOpen` sessizce yok sayılır.
- `favorite` + `defaultFavorite` birlikte: `favorite` kazanır (controlled).

Türetilen seçenekler: favori kalbin görünürlüğü üç favori prop'undan
türetilir; ayak `agent`/`listedAt`/`actions`'tan; nokta göstergesi
`mediaCount > 1`'den.

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| favori | `favorite` ?? iç state | — | `aria-pressed` + adın değişmesi |
| hover | `:hover` (yalnız `hover: hover`) | — | — |
| focus | `:focus-visible` | — | — |

Katman sırası: availability (slot var mı) → value (favori) → interaction
(hover/focus). Kartın `disabled` durumu yoktur: bir ilan "devre dışı" değildir;
yayından kalkmış ilan `GlassListingManagementCard`'ın işidir.

## 7. Davranış

- Pointer/touch: tıklama hedefi yalnız kontrollerdir, kartın gövdesi değil.
  Tüm ikon-tek kontroller `--lg-control-hit` (44px) hedefini karşılar.
- Keyboard:

  | Tuş | Etki |
  |---|---|
  | `Tab` | favori → başlık → diğer işlemler → iletişim eylemleri |
  | `Enter` | Odaklı bağlantı/butonu çalıştırır |
  | `Space` | Odaklı butonu çalıştırır (bağlantıda etkisiz) |

- Focus akışı: kart odak tuzağı kurmaz; odak DOM sırasını izler.
- Controlled/uncontrolled: yalnız favori state taşır (`favorite` +
  `defaultFavorite` + `onFavoriteChange`, EksenlerVeDurumlar.mdx deseni).
- Async: N/A. Overlay: N/A — menü yüzeyini çağıran açar.

## 8. İçerik kuralları

- Fiyat, başlık ve konum tek satırdır; taşan metin ellipsis'e düşer. Özellik
  rozetleri ve not sarar, kesilmez.
- Fiyat/tarih biçimi çağıranındır; component yalnız puanı `tr-TR` ondalık
  ayracıyla yazar.
- Boş içerik: verilmeyen her slot hiç render edilmez — boş bant bırakmaz.
  Yalnız `image`, `title`, `price` zorunludur.
- İkon-etiket ilişkisi: `features`/`note` ikonları dekoratiftir, anlam
  etikettedir. `actions` ikonları tek başına durur, bu yüzden `label` zorunlu.
- Lokalizasyon: sabit metinler (`'Favorilere ekle'`, `'Favorilerden çıkar'`,
  `'Diğer işlemler'`) Türkçedir; `menuLabel` dışındakiler henüz prop değildir
  (bkz. §12 açık kararlar).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kart | background | `--lg-surface` | — |
| kart | border | `--lg-stroke-hairline` + `--lg-hairline` | — |
| kart | border-radius | `--lg-radius-card` | — |
| kart | box-shadow | `--lg-shadow-xs` | hover → `--lg-shadow-sm` |
| kart | width | `--lg-listing-row-card-width` | — |
| medya | flex-basis / min-width | `--lg-listing-row-media-width` · `--lg-listing-row-media-min` | — |
| medya | min-height | `--lg-listing-row-media-height` | `size=sm` → `--lg-listing-row-media-height-sm` |
| rozet | (zemin çağıranın) | — | Fotoğraf üstünde OPAK zemin şart |
| medya etiketi | background / color | `--lg-scrim` · `--lg-on-scrim` | — |
| ayak metriği | color | `--lg-label-secondary` | — |
| gövde | flex-basis | `--lg-listing-row-body-min` | — |
| gövde | padding | `--lg-space-5` | `size=sm` → `--lg-space-4` |
| fiyat | font-size | `--lg-text-title` | `size=sm` → `--lg-text-headline` |
| fiyat eki | font-size / color | `--lg-text-headline` · `--lg-label-secondary` | `size=sm` → `--lg-text-body` |
| başlık | font-size | `--lg-text-body` | `size=sm` → `--lg-text-caption` |
| konum | color | `--lg-success` | — |
| rozet | border-radius / min-height | `--lg-radius-chip` · `--lg-control-sm` | — |
| not | background | `color-mix(--lg-label 4%, --lg-surface)` | — |
| ayak ayracı | border-top | `--lg-stroke-hairline` + `--lg-hairline` | — |
| iletişim kümesi | background / color | `--lg-action-prominent` · `--lg-action-prominent-label` | hover → `color-mix(--lg-label 12%, transparent)` |
| iletişim eylemi | min-width / min-height | `--lg-control-hit` · `--lg-control-lg` | — |
| metin eylemi | padding-inline / font-weight | `--lg-space-5` · `--lg-action-weight` | — |
| menü | width/height | `--lg-control-md` | — |
| favori | color | `--lg-on-scrim` | — |
| favori gölgesi | drop-shadow | `--lg-stroke-hairline` · `--lg-space-1` · `--lg-scrim` | — |
| focus | outline | `--lg-focus-ring-width` + `--lg-accent` | — |
| favori animasyonu | transition | `--lg-motion-duration-normal` + `--lg-motion-ease-standard` | reduced-motion → yok |

Token borcu: yok. Raw değer olarak yalnız `0`, `50%`, `100%`, `1.08` ölçek ve
`-0.025em` letter-spacing kullanılır (ölçek dışı geometri değil, tipografi
düzeltmesi ve konumlandırma). Yeni eklenen token'lar `src/index.css` içinde
`--lg-listing-row-*` bloğundadır.

## 10. Storybook kapsamı

| Story | Durum |
|---|---|
| Default / Overview | ✅ `Default` — referans düzenin birebir karşılığı |
| Playground (Controls) | ✅ `Playground` |
| Variants / Materials | ✅ `Variants` — slot varyasyonları (`material` ekseni yok, §5) |
| Sizes | ✅ `Sizes` |
| States | ✅ `States` — favori basılı + tetikleyicisiz kart |
| Uzun içerik | ✅ `UzunIcerik` |
| Responsive | ✅ `Responsive` — dar kapsayıcıda dikey düzene dönüş |
| Erişilebilirlik | ✅ `Erisilebilirlik` |

Controls yalnız public API'yi gösterir; hover/focus/active control değildir.

## 11. Test kabul kriterleri

Unit · interaction (`GlassListingRowCard.test.tsx`, 12 test):

- Kök `<article>` + `aria-labelledby` → gerçek heading.
- Başlık: `onOpen` → button, `href` → link (`href` kazanır), ikisi yoksa statik.
- Favori: uncontrolled çevirme, controlled'da prop'suz değişmeme, `aria-pressed`,
  üç prop da yoksa render edilmeme.
- Menü: yalnız `onMenuOpen` ile çizilir, `menuLabel` ada yansır.
- İletişim eylemleri: `href` → link, `onClick` → button, hepsi etiketli.
- Puan tek kez seslendirilir (rakam `aria-hidden`).
- Özellik rozetleri `listitem` semantiği.
- Nokta göstergesi yalnız `mediaCount > 1` iken, tek aktif nokta.
- Görsel hatası: `fallbackSrc` varsa ona düşer; `src` değişince yeniden dener
  (bayrak değil başarısız kaynak tutulur — liste geri dönüşümünde şart).

Visual: `Sizes`, `UzunIcerik`, `Responsive` story'leri snapshot hedefi.
A11y: axe ile `Default` ve `States` üzerinde ihlal beklenmez; odak sırası §2'deki
DOM değişmezine bağlıdır.

## 12. Do / Don't + Bilinen kısıtlar + Açık kararlar + Changelog

**Do**

- Listede yalnız gerçekten gereken slotları verin; boş slot render edilmez.
- İletişim eylemlerine mümkün olduğunca `href` (`tel:`/`mailto:`) verin —
  bağlantı, JS beklemeden çalışır.
- `headingAs`'i sayfanın heading hiyerarşisine göre ayarlayın.

**Don't**

- Kartı `<a>`/`<button>` ile sarmalamayın: iç kontroller iç içe interaktif
  eleman olur ve klavye/sesli okuyucu sözleşmesi bozulur.
- Not bandını yalnız renkle anlam taşıyan bir uyarıya çevirmeyin; metin şart.
- Kart üstüne cam yüzey (GlassIconButton vb.) koymayın — içerik katmanı.
- `badge`'e saydam tonlu zemin (`color-mix(… 12%, transparent)`) vermeyin:
  rozet fotoğrafın üstünde durur ve kontrast fotoğrafa kalır. Zemin opak olmalı.

**Bilinen kısıtlar**

- Nokta göstergesi dekoratiftir: gerçek bir galeriyi sürmez, yalnız görsel
  sayısını ima eder. Gezinilebilir galeri gerekiyorsa `GlassMediaGallery`.
  Görsel sayısı çoksa nokta yerine `mediaCaption` ("8 fotoğraf") tercih edilir.
- Medyanın en-boy oranı sabit DEĞİLDİR: yüksekliği künye belirler, medya ona
  uyar. Sabit oran denendi ve geniş kolonda kartı künyeden uzun yapıp altında
  ölü boşluk bıraktı (bkz. `--lg-listing-row-media-height` gerekçesi).
- Sabit Türkçe metinler (favori adları) prop'lanmadı.

**Açık kararlar**

- İletişim kümesindeki eylem sayısı sınırlanmadı; 3'ten fazlası dar kartta
  ayağı sardırır. Sınır gerekirse `actions.slice(0, 3)` yerine API'de
  belgelenmeli.
- Referans tasarımdaki yeşil aksiyon kapsülü, tema tek kaynağı olan eylem
  diline (`--lg-action-prominent`, amber) çevrildi. Marka yeşili istenirse
  `--lg-action-tint` kancasıyla verilmeli, raw hex ile değil.

**Changelog**

- 2026-08-05 — İlk sürüm.
- 2026-08-05 — `mediaCaption`, `footerMeta` ve ikonsuz (metin) eylem desteği
  eklendi; `aria-label` ezme kuralı tanımlandı. Üçü de `EmlakSearchView` liste
  görünümünün gerçek ihtiyacından doğdu. Medya yüksekliği sabit orandan
  tabana çevrildi.
- 2026-08-05 — `image.fallbackSrc` eklendi: uzak (stok) fotoğraf
  yüklenemediğinde yerel yer tutucuya düşer. `REPRESENTATIVE_IMAGE_NOTE`
  bunu kullanıcıya zaten söz veriyordu, karşılığı yoktu.

- 2026-08-08 — «Liste yatay» ekseni: `media="thumb"` kart her genişlikte
  yatay tutar (görsel `--row-thumb-w` sol sütunu; çağıran kademelendirir),
  özellik satırı tek sıra kayar, satıcı satırı tek katlı. `images[]` 2+
  kare ile medya scroll-snap galeri şeridine döner (nokta göstergesi scroll
  konumunun aynası, klavyede sol/sağ ok). İlk kare = `image` kapak sözleşmesi.
- 2026-08-12 — `thumb` simetri cilası (mobil ekran görüntüsü şikâyetleri):
  özellik çipleri tek sıra kaydırmadan **sarmaya** döndü — kenarda yarım
  kırpılmış çip («Müstak…») ve görünmez kaydırma yerine ikinci satır; §8'in
  "rozetler sarar, kesilmez" kuralı artık `thumb`'da da geçerli. Gövde dikey
  ritmi space-1'den space-2'ye oturdu. Nokta göstergesi `thumb`'da sola
  yaslanır (ortalanmış hali sağ alttaki `mediaCaption` kapsülüne biniyordu);
  ikisi aynı alt ofseti (space-2) paylaşır. Medya taban yüksekliği sütun
  genişliğinden ayrıştı: çağıran `--row-thumb-w`'yi yüzdeyle verebilir
  (EmlakSearchView dar kapta ~%38 kullanır), px tabanı `--row-thumb-min-h`
  taşır; değişken verilmezse eski kare taban korunur.
- 2026-08-13: Hesap alanı kartları pazar yeriyle aynı `media="thumb"`
  görünümüne geçti; bunun ortaya çıkardığı iki avatarsız-kullanım hatası
  düzeltildi: (1) sm+thumb künye küçültme kuralı `> :first-child` ile ilk
  çocuğu avatar sanıyordu — `agent` verilmeyince metin kolonu 24px'e
  sıkışıp "Bugün güncellendi" harf harf kırılıyordu; seçici
  `:not(.agentText)` ile yalnız avatarı hedefler. (2) sm+thumb'da
  `footerMeta` gizleme kuralı `:has(.agentName)` koşuluna bağlandı —
  satıcı kimliği yoksa (hesap kartı) meta ile yarışan isim de yoktur,
  "İlan no" görünür kalır.
