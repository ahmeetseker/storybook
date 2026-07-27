---
name: GlassInfiniteList
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassInfiniteList Kuralları

## 1. Amaç

Sonsuz kaydırma sarmalayıcısı: `children` olarak verilen mevcut bir listenin
(ör. ilan sonuçları) dibine bir gözlem noktası + her zaman görünür "Daha
fazla yükle" butonu + `aria-live` durum satırı ekler. Component listeyi
**kendisi render etmez** — yalnız "daha fazla getir" akışını yönetir; veriyi
tutmak, `loading`/`hasMore` state'ini güncellemek ve `children`'ı yeni
sayfayla yeniden vermek çağıranın sorumluluğundadır.

- **Kullan:** ilan arama sonuçları, favoriler, mesaj/aktivite geçmişi gibi
  sayfalanabilir herhangi bir listenin altına — liste kendi öğelerini
  (`<ul>`, grid, kart dizisi…) `children` olarak verir.
- **Kullanma:** sabit/kısa listeler (sayfalama gereksiz) · tek seferde tüm
  veri elde mevcutsa (`GlassTable` client-side sıralama yeterli) ·
  klasik sayfa numaralı pagination isteniyorsa (ayrı bir component,
  burada yok).

| İlgili | Farkı |
|---|---|
| GlassTable | Sabit satır kümesini render eder + sıralar; InfiniteList veri render ETMEZ, yalnız akış kontrolü ekler |
| GlassSkeleton | Yükleme placeholder'ı; InfiniteList `loading` sırasında kendi skeleton'ını ÇİZMEZ, yalnız durum metni + buton disabled |

## 2. Semantik sözleşme

- Kök element: `<div>` (`children`'ın kendi listesi — `<ul>`, grid vb. —
  zaten kendi semantiğini taşır; kök'e ekstra rol eklenmez).
- "Daha fazla yükle": `GlassButton` compose eder (default görünüm, `md`) —
  altta gerçek `<button type="button">` üretir, accessible name görünür
  metinden ("Daha fazla yükle"). `loading` iken `disabled` + `aria-busy`
  (GlassButton `loading` ekseni) birlikte verilir.
- Gözlem noktası (sentinel): dekoratif `<div aria-hidden="true">` —
  erişilebilir ağaçta hiç görünmez, yalnız `IntersectionObserver` hedefi.
- Durum satırı: `<p role="status" aria-live="polite">` — **HER ZAMAN**
  mount'lu (koşullu render edilmez), içeriği state'e göre değişir (bkz. §6).
- Portal yok, ref forwarding yok.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| children (liste) | ✅ | `ReactNode` | Component'in kendisi render etmez, olduğu gibi üstte basılır |
| sentinel | otomatik (yalnız `hasMore`) | — | `aria-hidden`, `IntersectionObserver` hedefi, boyut 1×1px |
| "Daha fazla yükle" butonu | otomatik (yalnız `hasMore`) | sabit metin | `GlassButton` (default, `md`) compose eder; klavye/AT erişimi için HER ZAMAN render edilir — observer yalnız otomatikleştirir, yerini almaz |
| durum satırı | ✅ | `loadingText` / `endText` / boş | `role="status" aria-live="polite"`, koşulsuz mount |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| children | prop | `ReactNode` | — (zorunlu) | — | Mevcut liste içeriği |
| onLoadMore | prop | `() => void` | — (zorunlu) | — | Sentinel görünür olunca (observer varsa) veya butona tıklanınca çağrılır; guard'lı (bkz. §6) |
| hasMore | prop | `boolean` | — (zorunlu) | — | `false` → sentinel/buton kaldırılır, `endText` görünür |
| loading | prop | `boolean` | `false` | — | `true` iken `onLoadMore` tekrar tetiklenmez, buton `disabled` |
| loadingText | prop | `string` | `'Yükleniyor…'` | — | Durum satırı metni (`loading` iken) |
| endText | prop | `string` | `'Hepsi bu kadar'` | — | Durum satırı metni (`!hasMore` iken) |
| threshold | prop | `number` | `400` | — | Sentinel'in dipten kaç px önce tetikleneceği (`rootMargin` alt kenarı); sonlu değilse varsayılana düşer, negatifse `0`'a kırpılır |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`children` hariç) | — | — | `className`/`style` birleştirilir |

Ref hedefi yok. Controlled/uncontrolled ayrımı yok — component kendi state'i
taşımaz (`gosterilen öğe sayısı`, sayfa vb. tamamen çağıranda), yalnız
`onLoadMore` callback'ini tetikleme mantığını (observer + buton + guard)
kapsüller.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `hasMore=true`, `loading=false`, `threshold=400`.

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` (light/dark/auto) | N/A — `GlassSurface` kullanmaz, tema `data-theme` kök token'larından otomatik gelir |
| `size` | N/A — spec'te istenmedi |
| `variant`/`thickness`/`tint`/`prominent` | N/A — cam olmayan, tek görünümlü akış sarmalayıcısı |

| Yasak / türetilen | Davranış |
|---|---|
| `threshold` sonlu değil (`NaN`/`Infinity`) | Varsayılan `400`'e düşülür |
| `threshold` negatif | `0`'a kırpılır (negatif `rootMargin` alt kenarı anlamsız) |
| `hasMore=false` | Sentinel VE buton birlikte kaldırılır — hiçbiri ayrı ayrı gizlenmez |
| `loading=true` + `hasMore=false` | `hasMore=false` önceliklidir: buton zaten yok, durum satırı `endText` gösterir (spec: `!hasMore → endText` kontrolü `loading` kontrolünden SONRA değerlendirilmiyor — bkz. §6 katman sırası, `loading` önce kontrol edilir) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| yükleniyor mu | `loading` prop (dışarıdan) | sentinel/buton tetikleyicisi guard'ı, buton `disabled` | durum satırı `loadingText` + buton `aria-busy` (GlassButton `loading` ekseni) |
| daha fazla var mı | `hasMore` prop (dışarıdan) | sentinel + buton render'ı | durum satırı `endText` (yalnız `loading=false` iken) |
| disabled/hover/focus/active | — | — | Prop olarak YOK; hover/focus/press görünümleri GlassButton'a devredilir |

Katman sırası (durum satırı metni): `loading` ÖNCE kontrol edilir → `true`
ise `loadingText`; değilse `!hasMore` kontrol edilir → `true` ise `endText`;
ikisi de değilse boş string (mount'lu, boş içerikli). Bu sıra bilinçli:
çağıran teorik olarak `loading=true` VE `hasMore=false`'u aynı anda
verirse (ör. son sayfa isteği hâlâ tamamlanmıyor) kullanıcı "yükleniyor"
mesajını görür, "bitti" mesajı isteğin sonucunu beklemeden erken görünmez.

## 7. Davranış

- Pointer: "Daha fazla yükle" butonuna tıklama `onLoadMore`'u tetikler
  (guard'lı: `loading || !hasMore` iken hiçbir şey yapmaz).
- Klavye: buton native `<button>` — Tab ile odaklanır, Enter/Space
  tetikler; ekstra bir klavye deseni yok (rol tablist/radiogroup vb.
  DEĞİL, tekil aktivasyon hedefi).
- Otomasyon (varsa): tarayıcı `IntersectionObserver` destekliyorsa VE
  `hasMore=true` ise, sentinel `rootMargin: "0px 0px {threshold}px 0px"`
  ile gözlemlenir — sentinel viewport'un altına `threshold` px kalana
  kadar yaklaşınca (henüz görünür olmadan) `onLoadMore` tetiklenir, aynı
  guard (`loading || !hasMore` iken yok sayılır) burada da uygulanır.
  `IntersectionObserver` tanımsızsa (ör. jsdom/eski tarayıcı) **hiçbir
  scroll dinleyicisi fallback olarak eklenmez** — tek erişim yolu her
  zaman render edilen buton kalır (spec gereği bilinçli tercih:
  observer yalnız otomatikleştirir, yerine geçecek ikinci bir mekanizma
  kurulmaz).
- Observer cleanup ZORUNLU: `hasMore`/`threshold` her değiştiğinde veya
  component unmount olduğunda önceki `IntersectionObserver.disconnect()`
  çağrılır (useEffect cleanup) — birikimli gözlemci sızıntısı oluşmaz.
- Guard, hem observer callback'inde hem buton `onClick`'inde AYRI AYRI
  uygulanır: observer callback'i `useRef`'lerde tutulan en güncel
  `loading`/`hasMore`/`onLoadMore`'u okur (effect yalnız `hasMore`/
  `threshold` değişince yeniden kurulduğundan, ref'ler olmadan bayat
  closure kullanılırdı); buton `onClick`'i `disabled` özniteliğine ek
  olarak savunmacı bir kontrol taşır.
- Controlled/uncontrolled ayrımı yok (bkz. §4). Async akış tamamen
  çağıranın: `onLoadMore` çağrıldığında `loading=true` yapıp veriyi
  ekleyip `hasMore`'u güncellemek çağırana aittir, component kendi
  başına bir istek atmaz.
- Overlay yok.

## 8. İçerik kuralları

- `loadingText`/`endText` kısa, tek satırlık durum ifadeleri olmalı —
  component bunları saramaz/kısaltmaz, olduğu gibi basar.
- `children` içeriğinin biçimi tamamen çağıranın kontrolünde (liste,
  grid, kart dizisi…) — component yalnız altına sentinel/buton/durum
  satırı ekler, `children`'ın DOM yapısına müdahale etmez.
- Buton metni ("Daha fazla yükle") sabit ve lokalize edilecekse
  component'in kendisi güncellenir (prop ile özelleştirilmez — açık
  karar, bkz. §12).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| buton | tümü | GlassButton'a devredildi (default, `md`) — bu component buton görünümüne stil YAZMAZ | hover/focus/disabled/loading GlassButton sözleşmesinde |
| durum satırı | color/font-size | `--lg-label-secondary` / `--lg-text-footnote` | — |
| boşluklar | gap/padding | `--lg-space-3,5` | — |

Raw değer kullanılmadı — tüm renk/radius/boşluk token'lardan.

**Borç (raw):** sentinel `1px` sabit ölçek — IntersectionObserver hedefi
için token yok (0 yükseklikli elemanlarda intersection hesaplaması bazı
tarayıcılarda kararsız olduğundan bilinçli minimum boyut).

## 10. Storybook kapsamı

Var: Default, Playground, Canlı Akış (gerçek sahte-fetch simülasyonu,
setTimeout ile 700ms), Durumlar (hasMore/loading/bitti yan yana),
UzunIcerik, Responsive (mobile1 + 320px konteyner), Erişilebilirlik (docs
description'lı).

`Variants`/`Sizes`/`Temalar` ayrı story olarak yok: component'te
material/variant/size ekseni tanımlı değil (§5), tema toolbar'la otomatik
doğrulanır (`GlassNearbyPlaces`/`GlassScoreMeter` ile aynı karar).

## 11. Test kabul kriterleri

- [x] `children` olduğu gibi render edilir
- [x] `hasMore=true`: "Daha fazla yükle" butonu render edilir, tıklama
      `onLoadMore`'u tetikler
- [x] `loading=true`: buton `disabled` olur, tıklama guard'ı
      `onLoadMore`'u tetiklemez
- [x] `hasMore=false`: buton hiç render edilmez
- [x] `loading=true`: durum satırı varsayılan `loadingText`'i gösterir
- [x] `hasMore=false`: durum satırı varsayılan `endText`'i gösterir
- [x] `hasMore=true` + `loading=false`: durum satırı boştur ama HER ZAMAN
      mount'ludur (`role="status"`, `aria-live="polite"`)
- [x] `loadingText`/`endText` özelleştirilebilir
- [x] `loading` `false`'a dönüp `hasMore` `true` kalınca buton yeniden
      etkinleşir ve tekrar tıklanabilir
- [x] sonlu olmayan/negatif `threshold` değerleriyle hatasız render edilir
- [ ] `IntersectionObserver` gözlem/otomatik tetikleme akışı (gerçek
      tarayıcı davranışı — unit test kapsamı dışı, spec gereği bilinçli:
      testler yalnız buton yolunu ve guard'ları, observer mock'lamadan
      doğrular; bkz. GlassInfiniteList.test.tsx üst yorum)
- [ ] `pointer: coarse`'ta buton 44px hedefi (visual/CSS, unit test
      kapsamı dışı — bkz. GlassNearbyPlaces aynı borç)

## 12. Do / Don't

- ✅ `onLoadMore` içinde `loading=true` yapmayı unutma — guard bu prop'a
  dayanır, aksi halde hem observer hem buton aynı sayfayı tekrar tekrar
  isteyebilir.
- ✅ Son sayfa yüklendiğinde `hasMore=false` yapmayı unutma — aksi halde
  kullanıcı boş bir sonraki sayfa için sonsuza kadar buton görür.
- ✅ `threshold`'u kaydırma hızına göre ayarla (uzun/hızlı listelerde
  yüksek değer daha erken tetikler, kullanıcı hiç boş alan görmez).
- ❌ Component'e sayfalama/veri state'i taşıtma — `children` ve
  `hasMore`/`loading` tamamen dışarıdan yönetilir.
- ❌ Sentinel'i/butonu manuel gizleme çabası — `hasMore=false` zaten
  ikisini birden kaldırır.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.

**Açık kararlar:** buton metni ("Daha fazla yükle") sabit ve lokalize
edilemez (prop yüzeyi sadeliği tercih edildi) · `IntersectionObserver`
desteklenmiyorsa scroll dinleyicisi fallback'i BİLİNÇLİ olarak
eklenmedi — spec'in "scroll listener YOK" gereksinimi, ekstra bir
performans/temizlik yükü almadan tek erişilebilir yol olan butona
güvenmeyi tercih ediyor · `loading`+`!hasMore` aynı anda verildiğinde
öncelik `loading`'de (bkz. §6).

## Changelog

- 2026-07-24: "Daha fazla yükle" butonu `GlassButton` (default, `md`)
  kompozisyonuna geçirildi — davranış birebir (`disabled={loading}` +
  guard korunur), GlassButton `loading` ekseni spinner + `aria-busy`
  ekler; `.loadMoreButton` sınıfı ve disabled-opacity `0.55` borcu
  kaldırıldı.
- 2026-07-17: İlk sürüm — `IntersectionObserver` destekliyse otomatik
  tetikleme + her zaman render edilen "Daha fazla yükle" butonu (klavye/AT
  erişimi), `aria-live="polite"` durum satırı (her zaman mount'lu),
  observer cleanup, `loading`/`hasMore` çift guard'ı.
