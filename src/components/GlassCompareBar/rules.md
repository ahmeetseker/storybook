---
name: GlassCompareBar
category: navigasyon
status: hazır
lastReviewed: 2026-07-17
---

# GlassCompareBar Kuralları

## 1. Amaç

Sayfa altında sabit karşılaştırma tepsisi: kullanıcının favorilere/karşılaştırma
sepetine eklediği ilanların mini önizlemelerini gösterir, tekil kaldırma ve
toplu "Karşılaştır"/"Temizle" eylemleri sunar. İçerik katmanı FLAT — cam yok;
"Karşılaştır" eylemi için gerçek kontrol katmanı olan `GlassButton` kullanılır.

- **Kullan:** kullanıcı birden çok ilanı işaretleyip aynı anda karşılaştırmak
  istediğinde — tepsi sayfanın her yerinden erişilebilir kalıcı bir kısayol.
- **Kullanma:** karşılaştırmanın kendi görünümü (→ `GlassCompareTable`, hücre
  bazlı asıl kıyaslama burada yapılır); tek bir bildirim/onay (→ `GlassToast`);
  modal bir seçim akışı (→ `GlassModal`/`GlassSheet`).

| İlgili | Farkı |
|---|---|
| GlassCompareTable | Asıl karşılaştırma tablosu (hücre bazlı); bu component yalnız SEÇİMİ toplar/taşır, hiçbir alan değeri göstermez |
| GlassChatDock | Aynı "sayfa altında sabit, kalıcı bölge" deseni ama `role="dialog"` açıp kapanan bir sohbet paneli; CompareBar hiçbir zaman dialog açmaz, tek durumu var/yok |
| GlassToast | Geçici, `aria-live` ile duyurulan bildirim; CompareBar kalıcı bir `role="region"`, aria-live YOK |

## 2. Semantik sözleşme

- Kök: `motion.div` üzerinde `role="region"` + sabit `aria-label="Karşılaştırma
  tepsisi"`. Ayrı bir `aria-label` prop'u YOK (v1) — tek örnek sayfada
  beklenir (bkz. §12 açık karar).
- Görünürlük `items.length > 0`'dan türetilir — `open`/`defaultOpen` prop'u
  YOK; component `AnimatePresence` ile tamamen mount/unmount olur.
  `görünürlük değişimi aria-live DEĞİLDİR` — bu bilinçli bir karar: tepsi
  kalıcı bir sayfa bölgesidir (Toast gibi tek seferlik bir bildirim değil),
  bu yüzden görünüp kaybolması ekran okuyucuya ayrıca duyurulmaz.
  DOM değişmezi: her `item` bir `<li>` üretir, `key`'ler `item.id`'den gelir —
  çağıran tarafından benzersiz tutulmalı; `item.id` HİÇBİR DOM `id`
  özniteliğine yazılmaz (yalnız veri/callback anahtarı — `onRemove(id)`,
  React `key`, kaldırma butonu ref haritası).
- Portal YOK, focus trap YOK, scroll kilidi YOK — Modal/Drawer/Toast'ın
  paylaştığı overlay sözleşmesine DAHİL DEĞİL (bkz. §1 GlassChatDock farkı).
  Sayfa her zaman etkileşimli kalır.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| items[].image | — | `string` (URL) | dekoratif, `alt=""`; verilmezse basit SVG ev simgesi (`aria-hidden`) |
| items[].title | ✅ | `string` | kart içinde tek satırda CSS ile kırpılır; tam metin `title` özniteliğinde + kaldırma butonu adında korunur |
| kaldırma butonu | her zaman | `×` | erişilebilir isim `Karşılaştırmadan çıkar: {title}` (GlassCompareTable ile aynı desen) |
| "Karşılaştır (N)" | ✅ | `GlassButton prominent` | `N = items.length` (gerçek sayı, `maxItems`'a göre KIRPILMAZ) |
| ipucu metni | `N<2` veya `N>maxItems` iken | `string` | her zaman görünür metin, yalnız renkle değil; butona `aria-describedby` ile bağlı |
| "Temizle" | `onClear` verilirse | metin buton | verilmezse hiç render edilmez |

## 4. Public API

| Ad | Tür | Type | Default | Açıklama |
|---|---|---|---|---|
| items | prop | `GlassCompareBarItem[]` (`{id, title, image?}`) | — (zorunlu) | Görünürlük ve sıralama tamamen bu diziden türer |
| onRemove | event | `(id: string) => void` | — (zorunlu) | Kaldırma butonuna tıklanınca çağrılır; component `items`'ı FİLTRELEMEZ |
| onCompare | event | `() => void` | — (zorunlu) | "Karşılaştır"a tıklanınca çağrılır; `N<2` veya `N>maxItems` iken buton disabled olduğundan tetiklenmez |
| onClear | event | `() => void` | — | Verilirse "Temizle" görünür; tıklanınca çağrılır — component `items`'ı temizlemez |
| maxItems | prop | `number` | `4` | Yalnız "Karşılaştır"ı geçici disable edip ipucu göstermek için kullanılır; `items` ASLA kırpılmaz. Sonlu/pozitif olmayan (`NaN`/`Infinity`/`≤0`) değerler sessizce `4`'e döner |
| className | prop | `string` | — | Kök `motion.div`'e eklenir |

Ref hedefi: yok (v1, dışa açık `ref` prop'u yok). Event sözleşmesi:
`onRemove`/`onCompare`/`onClear` yalnız gerçek kullanıcı tıklamasıyla
tetiklenir; component kendi `items` state'ini tutmaz, render tamamen prop'tan
türetilir (GlassCompareTable ile aynı ilke). İstisna: kaldırma sonrası odak
kurtarma yalnızca DOM'a yazılmayan iç `ref`'lerle yürütülen bir yan etkidir
(bkz. §6).

## 5. Seçenek eksenleri

Eksen yok (`material`/`tone`/`size`/`variant`/`thickness`/`tint`/`prominent`
N/A — flat içerik yüzeyi, tek görünüm; `prominent` yalnız iç `GlassButton`
kullanımında sabit `true`, dışarı prop olarak açılmaz). `maxItems`/`onClear`
birer API parametresi, state değil.

| Kural | Davranış |
|---|---|
| `items.length === 0` | Tepsi hiç render edilmez (unmount) |
| `items.length === 1` | Render edilir, "Karşılaştır" disabled + "En az 2 ilan seç" |
| `2 ≤ items.length ≤ maxItems` | "Karşılaştır" etkin, ipucu yok |
| `items.length > maxItems` | Render edilir (kırpma YOK), "Karşılaştır" disabled + "En fazla N ilan karşılaştırılabilir" |
| `onClear` yok | "Temizle" hiç render edilmez |

**Açık karar — `maxItems` aşımında disable:** spec yalnız `N<2` durumu için
disable+ipucu tanımlıyor; `N>maxItems` için component KIRPMA yapmaz ("aşımı
çağıranın işi") ama simetri ve tutarlı UX için AYNI disable+ipucu deseni
`N>maxItems`'a da uygulanmıştır. Bu, "kırpma yok" kuralını BOZMAZ — hiçbir
`item` gizlenmez/silinmez, yalnız `onCompare` eylemi geçici olarak
engellenir. Aşımı fiilen önlemek (ör. "karşılaştırmaya ekle" butonunu 4'te
kilitlemek) yine de çağıranın sorumluluğundadır.

## 6. State modeli

Görünürlük ve içerik açısından N/A — render tamamen `items` + `maxItems` +
`onClear` varlığından türetilir; component görünür bir seçim/aç-kapa state'i
tutmaz.

İstisna — odak kurtarma (yalnız yan etki, render'ı etkilemez, GlassCompareTable
ile birebir aynı desen): bir `removeButtonRefs` haritası (`item.id` → buton DOM
node'u) ve bir "kurtarma bekliyor" `ref` bayrağı iç olarak tutulur. Kaldırma
butonuna tıklanınca bayrak `true` olur; bir sonraki commit'te (`items` prop'u
kısaldıktan sonra) `useEffect` bayrağı görüp odağı kalan ilk kartın kaldırma
butonuna taşır ve bayrağı sıfırlar. `useRef` ile yürütülür (`useState` DEĞİL) —
ek render tetiklemez.

## 7. Davranış

- **Pointer:** kaldırma butonuna tıklama `onRemove(id)` çağırır; "Karşılaştır"a
  tıklama (disabled değilse) `onCompare()` çağırır; "Temizle"ye tıklama
  (varsa) `onClear()` çağırır. Başka etkileşim yok — kart/görsel tıklaması
  anlamsız (ilan detayına gitme davranışı bu component'in kapsamında değil).
- **Klavye:** özel widget rolü YOK (tablist/radiogroup değil) — gerçek
  `<button>` elemanları arasında tarayıcının doğal `Tab` sırası kullanılır.
  Roving tabindex/ok tuşu deseni yalnız ARIA widget rolü ÜSTLENEN
  component'lerde zorunludur (bkz. `GlassSegmentedControl`); burada öyle bir
  rol üstlenilmediği için uygulanmaz (GlassCompareTable §7 ile aynı gerekçe).
- **Odak kurtarma (kaldırma sonrası):** bir kaldırma butonuna tıklanıp
  `onRemove` çağrıldıktan ve çağıran `items`'ı filtreleyip yeniden render
  ettikten sonra, odak OTOMATİK olarak kalan ilk kartın kaldırma butonuna
  taşınır. Son kart da kaldırılırsa (`items.length` 0'a düşerse) tepsinin
  tamamı unmount olur — bu durumda taşınacak bir hedef kalmaz, odak tarayıcı
  `<body>`'ye düşer. Bu, CompareBar'ın (ChatDock'tan farklı olarak) belirli
  bir "tetikleyici" elemente sahip olmamasından kaynaklanır — bilinen kısıt,
  bkz. §12.
- **Görünürlük geçişi:** `items.length > 0` iken `AnimatePresence` ile mount
  olur, `translateY` (96px → 0) spring animasyonuyla altdan süzülerek girer;
  `items.length === 0`'a düşünce aynı yolla süzülerek çıkar ve unmount olur.
  `prefers-reduced-motion: reduce` iken geçiş TAMAMEN anlıktır (`duration: 0`,
  `y` sabit `0`) — ne süzülme ne opacity fade'i vardır.
- **Responsive:** breakpoint yok — kart listesi kendi `overflow-x: auto`
  kabında kayar (sayfa gövdesi asla yatay kaymaz); dar viewport'ta liste
  yatay kaydırma şeridine dönüşür, eylem grubu `flex: none` ile sağda sabit
  kalır (içsel akış).

## 8. İçerik kuralları

- `item.title` kart içinde tek satırda `text-overflow: ellipsis` ile
  kırpılır; tam metin `title` HTML özniteliğinde (native tooltip) ve
  kaldırma butonunun erişilebilir isminde korunur — JS ile ayrıca
  kısaltılmaz (gerçek kırpma CSS'e bırakılır).
  Görünür genişlik ~108px — çok uzun tek kelimeler (URL, boşluksuz metin)
  taşabilir; TR başlıklarda genelde birden çok kelime olduğundan pratikte
  sorun yaşanmaz.
- `item.image` dekoratifse `alt=""` sabit — görsel bilgi zaten başlık
  metninde; verilmezse dekoratif (`aria-hidden`) bir SVG ev simgesi
  gösterilir, hiçbir metin kaybı olmaz.
- İpucu metinleri sabit iki cümleden biri: `"En az 2 ilan seç"` veya
  `"En fazla {maxItems} ilan karşılaştırılabilir"` — lokalizasyon/özelleştirme
  v1'de YOK (bkz. §12 açık karar).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| root | background/border/radius | `--lg-surface` / `--lg-hairline` / `--lg-radius-card` | — |
| root | gölge | `--lg-shadow-md` | — |
| kart (item) | zemin/border/radius | `color-mix(--lg-label 4%, --lg-surface)` / `--lg-hairline` / `--lg-radius-capsule` | — |
| thumb/thumbFallback | radius | `--lg-radius-chip` | — |
| itemTitle | renk/boyut | `--lg-label` / `--lg-text-footnote` | — |
| kaldırma butonu | zemin/renk | `color-mix(--lg-label 8%)` / `--lg-label-secondary` | hover: `color-mix(--lg-danger 16%)` + `--lg-danger` (yalnız `hover: hover`) |
| kaldırma/Temizle/Karşılaştır focus | outline | `--lg-accent` | yalnız `:focus-visible` |
| Temizle | renk | `--lg-label-secondary` | hover: `--lg-label` (yalnız `hover: hover`) |
| ipucu (normal + `maxItems` aşımı) | renk | `--lg-label-secondary` | metin rengi her iki durumda da aynı (≥4.5:1 AA) — semantik renk metne KARIŞMAZ |
| ipucu `.hintDot` (`maxItems` aşımı) | zemin | `--lg-warning` | dekoratif 6px nokta, `aria-hidden`; durum metinle zaten iletilir |
| padding/gap/font | `--lg-space-*` / `--lg-text-*` | — | — |

**Borç (raw):** `z-index: 40` (z token'ı yok, overlay katmanlarından
[Toast/Drawer 1000, ChatDock 60] daha düşük tutuldu — CompareBar sayfa
içeriğiyle aynı düzlemde, hiçbir overlay'in üstüne çıkmaz) · mikro-geometri
kökte yerel değişkenlerde toplandı: `--glass-comparebar-thumb` (32px),
`--glass-comparebar-item-max` (200px), `--glass-comparebar-title-max`
(108px), `--glass-comparebar-remove-size/font` (22px/15px),
`--glass-comparebar-dot` (6px), `--glass-comparebar-max-w` (720px, bar maks.
genişliği), `--glass-comparebar-underline-offset` (2px, Temizle alt çizgisi)
— token karşılığı yok (container query yok) · `pointer: coarse` kaldırma
hedefi `--lg-control-md`'ye bağlandı (coarse'ta 44px — birebir) · `96px`
giriş/çıkış `translateY` mesafesi raw.

## 10. Storybook kapsamı

Var: Default, Playground (yerel state ile kaldır/temizle/karşılaştır akışı),
`Durum — Tek İlan` (N<2 disable+ipucu), `Durum — maxItems Aşımı` (N>4
disable+ipucu, kırpma YOK), UzunIcerik, Responsive (mobile viewport),
Erişilebilirlik (docs açıklamalı).
**Eksik:** Variants/Materials/Sizes (N/A — eksen yok, §5) · Temalar (ayrı
story yok — toolbar'la Kağıt/Grafit doğrulanır, tüm token'lar üzerinden
otomatik, GlassCompareTable ile aynı emsal).

## 11. Test kabul kriterleri

- [x] `items` boşken hiçbir şey render edilmez (`role="region"` yok) (unit)
- [x] `items` doluyken `role="region"` + `aria-label="Karşılaştırma tepsisi"`
      render edilir, her ilanın başlığı görünür (unit)
- [x] `image` verilen kart gerçek `<img alt="">` üretir; verilmeyen kart
      dekoratif SVG yer tutucu gösterir (unit)
- [x] kaldırma butonu `Karşılaştırmadan çıkar: {title}` erişilebilir ismini
      taşır, tıklama `onRemove` ile doğru `id`'yi çağırır (unit)
- [x] bir ilan kaldırılıp liste güncellenince odak kalan ilk kartın kaldırma
      butonuna taşınır (unit)
- [x] `items.length < 2` iken "Karşılaştır" disabled + "En az 2 ilan seç"
      ipucu görünür (unit)
- [x] `items.length ≥ 2` iken buton etkin, ipucu yok, tıklama `onCompare`
      çağırır (unit)
- [x] `items.length > maxItems` (varsayılan 4) iken buton disabled + "En
      fazla N ilan karşılaştırılabilir" ipucu görünür AMA hiçbir ilan
      gizlenmez (unit)
- [x] geçersiz `maxItems` (ör. `0`) sessizce varsayılan `4`'e döner (unit)
- [x] `onClear` verilmezse "Temizle" render edilmez; verilirse render edilir
      ve tıklama `onClear`'ı çağırır (unit)
- [ ] `translateY` giriş/çıkış animasyonunun gerçekten süzülerek çalıştığı ve
      `prefers-reduced-motion: reduce`'ta anlık olduğu (visual, Chrome)
- [x] Kağıt/Grafit tema kontrastı, özellikle `maxItems` aşımı ipucu rengi
      (visual) — düzeltme: ipucu metni her zaman salt `--lg-label-secondary`
      (Kağıt'ta ~4.74:1, Grafit'te ~6.84:1, ikisi de AA'yı geçer); semantik
      `--lg-warning` artık metne karışmıyor, yalnız dekoratif `.hintDot`
      noktasında kullanılıyor (kod review bulgusu)

## 12. Do / Don't

- ✅ `onRemove`/`onClear` verdiğinde `items` state'ini kendi tarafında
  güncellemeyi unutma (`Playground` story'sindeki desene bak) — component
  hiçbir zaman kendi listesini filtrelemez.
- ✅ `maxItems`'ı aşan bir ekleme yapmadan ÖNCE caller tarafında engelle (ör.
  "karşılaştırmaya ekle" butonunu ilgili sayfada 4'te devre dışı bırak) —
  CompareBar aşımı yalnız "Karşılaştır"ı geçici disable ederek gösterir,
  eklemeyi engellemez.
- ❌ Sayfada birden fazla `GlassCompareBar` örneği aynı anda gösterme — sabit
  `aria-label` ve `bottom` konumu tek bir tepsi varsayar (bkz. bilinen kısıt).
- ❌ `items` içine karşılaştırma dışı öğeler (ör. favori olmayan bir ilan)
  koyma — tepsi yalnız "karşılaştırmaya seçilen" anlamına gelir, ayrı bir
  "seçili/seçili değil" state'i yok.

**Bilinen kısıtlar:** sayfada tek örnek varsayılır — `aria-label` prop'u
yok, birden çok örnek aynı adı taşır (v1 kapsamı, spec'te tek tepsi
öngörülmüş) · son ilan kaldırıldığında (unmount) odak geri dönecek belirli
bir "tetikleyici" element yok (GlassChatDock'un launcher'ının aksine) — odak
tarayıcı `<body>`'ye düşer · `maxItems` aşımında disable davranışı spec'in
yalnız `N<2` için tanımladığı deseni simetrik olarak genişletir (§5 açık
karar) · ipucu metinleri sabit TR string'ler, özelleştirilemez.

**Açık kararlar:** `aria-label` prop'u eklenip eklenmeyeceği (çoklu örnek
senaryosu, v2) · `maxItems` aşımında butonu disable etmek yerine yalnızca
uyarı gösterip `onCompare`'ı yine de tetiklemeye izin vermek (şu an disable
ediliyor — spec'in "aşımı çağıranın işi" notuyla en tutarlı okuma bu şekilde
seçildi, ama tartışmaya açık) · kart sürükle-bırak ile yeniden sıralama (v1'de
yok, `items` dizi sırası aynen korunur).

**Changelog:** 2026-07-17 ilk sözleşme.
