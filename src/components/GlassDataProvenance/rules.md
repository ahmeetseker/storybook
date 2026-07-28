---
name: GlassDataProvenance
category: içerik
status: hazır
lastReviewed: 2026-07-28
---

# GlassDataProvenance Kuralları

## 1. Amaç

Bir değerin kanıt künyesi: kaynağı, sorgu/geçerlilik tarihleri, kapsamı,
yöntemi, bilinen sınırlamaları ve varsa çelişkisini açan rozet + çekmece.
Sayfadaki her kanıt satırının (ilan detayında imar durumu, yüzölçümü, aidat
gibi tekil değerlerin) arkasında bu component durur.

- **Kullan:** tekil bir değerin kaynağını/güvenilirliğini açıklamak; kaynaklar
  arası çelişkiyi veya bayat veriyi kullanıcıya açık şekilde bildirmek.
- **Kullanma:** çok satırlı özellik listesi (→ `GlassSpecTable`), AI tahmin
  gerekçelerinin dökümü (→ `GlassValuationDrivers`/`GlassMatchBreakdown`),
  tek başına danışman görüşü (→ `GlassInsightNote`).

| İlgili | Farkı |
|---|---|
| GlassSpecTable | Etiket/değer listesi; kaynak/güvenilirlik kavramı yok |
| GlassInsightNote | İnsan danışman görüşü; kaynak sınıfı/çelişki modeli yok |
| GlassTimeline | Olay dizisi; tekil değerin künyesi değil |

## 2. Semantik sözleşme

- Kök element düz `<div>` — **cam yüzey üretmez** (`GlassSurface` kullanılmaz);
  içerik katmanı component'idir, sayfa başına cam bütçesini tüketmez.
- Tetikleyici gerçek bir `<button type="button">`; `aria-expanded` state ile
  senkron, `aria-controls` panel `id`'sine (`useId`) bağlıdır.
- Panel `isOpen === false` iken **DOM'da hiç yoktur** (conditional render,
  `display:none` değil) — kapalı çekmecenin içeriği erişilebilirlik
  ağacında da, testte de bulunmaz.
- Kök `<div>` yalnız bir sarmalayıcıdır: çağıran `className` ile
  `display: contents` verip tetikleyici ile paneli **kendi ızgarasının
  öğeleri** hâline getirebilir (ilan detayının kanıt satırı bunu yapar; rozet
  dar kaynak sütununda kalır, çekmece satırın altına tam genişlikte iner).
  Kök bu yüzden kendi geometrisini dayatmaz.
- Tetikleyicinin erişilebilir adı görsel-gizli (`srOnly`) `"{fieldLabel}
  kaynağı: "` öneki + görünür rozet metninden oluşur; ekran okuyucu hangi
  alanın künyesi olduğunu rozet metninden önce duyurur.
- Panel içeriği `<dl>` (sağlayıcı/tarih/kapsam/yöntem çiftleri) + koşullu
  çelişki bloğu + koşullu sınırlama listesi (`<ul>`).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| trigger | ✅ | durum noktası + rozet metni (üretilen) | `button`; nokta `::before`, `data-tone` ile renklenir |
| panel.sağlayıcı | ✅ | `sourceLabel` (+ `sourceHref` varsa link) | `dt`/`dd` |
| panel.sorgu | ✅ | `retrievedAt` | `dt`/`dd` |
| panel.geçerlilik/kapsam/yöntem | — | `effectiveAt`/`validUntil`/`scopeLabel`/`geographicResolution`/`method`/`methodVersion` | verilmeyen alan render edilmez |
| panel.çelişki | — | `currentValueLabel` + `conflicts[]` | yalnız `conflicts.length > 0` iken |
| panel.sınırlamalar | — | `limitations[]` | yalnız dizi doluysa `<ul>` |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| fieldLabel | prop | `string` | — (zorunlu) | — | Erişilebilir adın parçası |
| sourceLabel | prop | `string` | — (zorunlu) | — | Sağlayıcının görünür adı |
| sourceClass | prop | `GlassProvenanceSourceClass` | — (zorunlu) | — | Rozet metnini belirler (öncelik sırasına tabi, bkz. §6) |
| retrievedAt | prop | `string` | — (zorunlu) | — | Biçimlenmiş sorgu anı |
| effectiveAt | prop | `string` | — | — | Verinin geçerli olduğu tarih |
| validUntil | prop | `string` | — | — | Geçerliliğin son bulduğu tarih |
| freshness | prop | `GlassProvenanceFreshness` | `'current'` | — | `'stale'` rozeti "Güncel değil" yapar |
| scopeLabel | prop | `string` | — | — | "parsel", "bölgesel" gibi kapsam |
| geographicResolution | prop | `string` | — | — | Coğrafi çözünürlük açıklaması |
| method | prop | `string` | — | — | Değerin nasıl elde edildiği |
| methodVersion | prop | `string` | — | — | Yöntemin sürümü |
| limitations | prop | `string[]` | — | — | Olduğu gibi listelenir |
| conflicts | prop | `GlassProvenanceConflict[]` | — | — | Doluysa rozet "Kaynaklar çelişiyor" |
| currentValueLabel | prop | `string` | — | — | Çelişki panelinde geçerli kabul edilen değer |
| sourceHref | prop | `string` | — | — | Sağlayıcı adı bağlantıya döner |
| open | prop | `boolean` | — | ✅ | Verilirse controlled |
| defaultOpen | prop | `boolean` | `false` | — | Yalnız uncontrolled ilk durum |
| onOpenChange | prop | `(open: boolean) => void` | — | ✅ | Her tetiklemede çağrılır (controlled/uncontrolled fark etmez) |
| ...rest | — | `HTMLAttributes<HTMLDivElement>` (`onChange` hariç) | — | — | `className` birleştirilir |

Ref hedefi yok (forwardRef uygulanmamış). Event sözleşmesi: yalnız
`onOpenChange` — tıklama dışında klavye/pointer ayrımı gözetmez (native
`button` davranışı yeterli).

## 5. Seçenek eksenleri

Bu component'te klasik `material/tone/size/variant` ekseni yoktur — tek
eksen, rozet metnini belirleyen **öncelik zinciri** (bkz. §6) ve durum
(`open`). Varsayılan kombinasyon: `freshness='current'`, `conflicts`
verilmemiş, `defaultOpen=false`.

| Kural | Davranış |
|---|---|
| `conflicts` doluyken `freshness='stale'` de verilse | Rozet yine "Kaynaklar çelişiyor" — çelişki her zaman kazanır |
| `sourceHref` verilmemiş | Sağlayıcı adı düz metin, link render edilmez |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| open/closed | `open` prop (controlled) veya iç state (uncontrolled) | panel'in DOM'da var olup olmadığı | `aria-expanded` |
| rozet metni | `conflicts` → `freshness` → `sourceClass` öncelik zinciri | daha düşük öncelikli etiketleri | rozetin erişilebilir metninin kendisi |

Katman sırası (availability → value → interaction): önce çelişki var mı
(`conflicts.length > 0`) kontrol edilir; yoksa bayatlık (`freshness ===
'stale'`) kontrol edilir; o da yoksa `sourceClass` etiketine düşülür.
"Cevapsızlık" (`sourceClass === 'unknown'` → "Doğrulanamadı") bu zincirin en
altında, ama hâlâ diğer beş kaynak sınıfı etiketiyle eşdeğer bir sourceClass
değeri olarak durur — ayrı bir öncelik basamağı değil, `SOURCE_CLASS_LABELS`
tablosunun bir girdisidir.

## 7. Davranış

- **Pointer/touch:** tetikleyici tıklamasıyla aç/kapa; dokunmatik hedef
  `pointer: coarse` altında `--lg-control-md` (44px) yüksekliğe çıkar.
- **Klavye:** native `button` — Tab ile odaklanır, Enter/Space ile
  tetiklenir; ayrıca bir şey uygulanmamıştır (gerek yok).
- **Focus akışı:** panel açıldığında focus tetikleyicide kalır (odak panelin
  içine taşınmaz); panel içindeki `sourceHref` linki DOM sırasında panelin
  ilk odaklanabilir öğesidir.
- **Controlled/uncontrolled:** `open` verilmişse component kendi state'ini
  hiç güncellemez — yalnız `onOpenChange(next)` çağırır ve görünüm dışarıdan
  gelen `open` değerine sadık kalır (bkz. test: controlled kullanımda tıklama
  sonrası `aria-expanded` hâlâ `'false'`). `open` verilmemişse iç `useState`
  ile `defaultOpen`'dan başlar.
- **Async:** yok — tüm veri prop olarak senkron gelir.
- **Overlay:** yok — portal kullanılmaz, panel kendi akışında (`in-flow`)
  render edilir.

## 8. İçerik kuralları

- Rozet metni önceliği **düzeltilemez bir doğruluk kuralıdır, stil meselesi
  değildir**: çelişki → bayatlık → cevapsızlık/kaynak sınıfı. `"Kaynaklar
  çelişiyor"` ve `"Güncel değil"` her zaman kaynak sınıfı etiketinin önüne
  geçer.
- Altı kaynak sınıfı etiketi sabittir ve başka bir string üretilmez: `Resmî
  kayıttan` · `Doğrulanmış belgeden` · `İlan sahibi beyanı` · `ArsaPazar
  hesabı` · `Model tahmini` · `Doğrulanamadı`. **`"Doğrulandı"` hiçbir
  koşulda üretilmez** — kaynak "resmî" olsa da component onay/doğrulama
  değil, yalnız kaynak sınıfını iddia eder.
- Çelişki **asla sessizce çözülmez**: `conflicts` doluyken panel hem
  `currentValueLabel` (geçerli kabul edilen değer + `sourceLabel` +
  `retrievedAt`) hem her bir çelişen değeri kendi kaynağı ve tarihiyle
  birlikte listeler. Tek bir "doğru" değere indirgeme yapılmaz.
- `limitations` metinleri olduğu gibi (biçimlendirilmeden) gösterilir —
  cümle sonu noktalama çağıranın sorumluluğudur.
- Türkçe kullanıcı metni, İngilizce kod tanımlayıcıları; tüm görünür
  string'ler component içinde sabittir (i18n katmanı bu görev kapsamında
  yok).

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| trigger | font-size | `--lg-text-caption` |
| trigger | renk (official/declared/derived) | `--lg-label-secondary` |
| trigger | renk (`data-tone='stale'`) | `--lg-warning` |
| trigger | renk (`data-tone='unknown'`) | `--lg-warning` |
| trigger | renk (`data-tone='conflict'`) | `--lg-danger` |
| trigger | durum noktası çapı | `--provenance-dot-size` (mikro-geometri) |
| trigger | nokta/metin arası | `--lg-space-2` |
| trigger | radius | `--lg-radius-chip` |
| trigger | padding | `--lg-space-1` / 0 |
| trigger | min-height | `--lg-control-sm` (coarse: `--lg-control-md`) |
| trigger:focus-visible | outline | `--lg-focus-ring-width` solid `--lg-accent`, offset `--lg-focus-ring-offset` |
| panel | radius / border | `--lg-radius-chip` / `--lg-hairline` |
| panel | padding | `--lg-space-3` `--lg-space-4` |
| grid | gap | `--lg-space-2` `--lg-space-5` |
| grid dt | font-size | `--lg-text-badge` |
| grid dd | font-size | `--lg-text-footnote` |
| link | renk | `--lg-accent` |
| conflictTitle | renk | `--lg-danger` |
| conflictList span | font-size / renk | `--lg-text-caption` / `--lg-label-secondary` |
| limitations | font-size / renk | `--lg-text-caption` / `--lg-label-secondary` |

**Borç:** `--provenance-dot-size` (8px) tek mikro-geometri değeridir; token
ölçeğinde durum noktası çapı yoktur ve değer sayfadaki diğer durum
noktalarıyla aynıdır. Bunun dışında tüm CSS değerleri `--lg-*` token'ları
(fallback'leriyle birlikte) üzerinden gelir; raw hex/px/shadow yok. `.srOnly` clip tekniği
(`position:absolute; width:1px; height:1px; overflow:hidden;
clip-path:inset(50%)`) tasarım token'ı değil, standart erişilebilirlik
idiomudur — token borcu sayılmaz.

## 10. Storybook kapsamı

Var: Default, Playground (tam public API), KaynakSiniflari (altı
`sourceClass` yan yana), Cakisma (`conflicts` + `currentValueLabel`,
`defaultOpen`), BayatKaynak (`freshness='stale'`), UzunIcerik (uzun
sağlayıcı adı + üç sınırlama, dar container), Responsive (240px + mobile
viewport), Temalar (toolbar'dan Kağıt/Grafit), Erişilebilirlik (açık panel +
`sourceHref` linki ile focus sırası). Eksik yok — matris tam.

## 11. Test kabul kriterleri

- [x] tetikleyici kaynak sınıfının görünür etiketini taşır (unit)
- [x] kapalıyken panel içeriği DOM'da yok (unit)
- [x] tıklayınca açar, `aria-expanded` günceller (interaction)
- [x] controlled kullanımda kendi state'ini değiştirmez (interaction)
- [x] bayat kaynakta "Güncel değil" kaynak sınıfının yerine geçer (unit)
- [x] çelişkide iki kaynak + iki tarih birlikte görünür (interaction)
- [x] sınırlamalar liste olarak görünür (interaction)
- [x] `[data-material="glass"]` üretmez — cam bütçesini tüketmez (unit)
- [x] erişilebilir ad `fieldLabel` içerir (unit)
- [ ] focus-visible halkasının yalnız klavye odağında göründüğü (visual)
- [ ] Kağıt/Grafit temalarında rozet tonlarının kontrastı (visual)

## 12. Do / Don't

- ✅ Her kanıt gerektiren tekil değerin (imar durumu, yüzölçümü, aidat)
  yanına bir `GlassDataProvenance` koy.
- ✅ Çelişki tespit edildiğinde `conflicts` + `currentValueLabel` birlikte
  ver — yalnız birini vermek çelişkiyi yarım anlatır.
- ❌ `sourceClass` etiketlerini component dışında yeniden üretme/çevirme —
  tek kaynak `SOURCE_CLASS_LABELS`'tır, "Doğrulandı" gibi bir metin asla
  üretilmemelidir.
- ❌ Bu component'i `GlassSurface`/cam bir kapsayıcıya sarıp "cam üstüne
  cam" oluşturma — kendisi zaten düz yüzeydir ve içerik katmanında kalmalıdır.

**Bilinen kısıtlar:** rozet renk taşımayan üç sınıfta (`official` ·
`declared` · `derived`) tamamen nötr okunur — bu bilinçlidir: künye annote
ettiği değerle yarışmamalıdır ve durum zaten kelimeyle yazılıdır. Renk yalnız
dikkat gerektiren üç durumda (çelişki · bayatlık · cevapsızlık) ikincil kanal
olarak eklenir. · `freshness='aging'`/`'unknown'` değerleri şu an rozet
metnini değiştirmez (yalnız `'stale'` özel davranış tetikler) — ileride
ayrı bir görsel ipucu gerekebilir. **Açık kararlar:** `aging` durumunun
kendi rozet metni alıp almayacağı · çoklu çelişki (3+ kaynak) düzeninde
sıralama kuralı (şu an prop sırası korunur). **Changelog:** 2026-07-28 — rozet
sessiz işarete dönüştü (büyük harf/çerçeveli hap yerine durum noktası + normal
yazım); çekmece kendi zeminini taşır ve kök `display: contents` ile açılabilir.
· 2026-07-27 — ilk sürüm.
