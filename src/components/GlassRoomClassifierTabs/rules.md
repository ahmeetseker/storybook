---
name: GlassRoomClassifierTabs
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

<!-- 2026-07-17: Codex konsolide raporu (dalga4) sonrası düzeltme geçişi —
     bkz. dosya sonundaki Changelog girdisi: role="tablist"/"tab" →
     role="radiogroup"/"radio" (panelsiz), focusPendingRef sızıntısı,
     canlı bölge sürekli mount, countBadge kontrastı, children tip omit'i. -->

# GlassRoomClassifierTabs Kuralları

## 1. Amaç

AI oda sınıflandırması: bir ilanın galeri fotoğraflarını AI'nın hangi odaya
ait olduğunu tahmin ederek gruplandırdığı yatay kaydırılabilir sekme çipleri
(oda adı + fotoğraf adedi). AI-first component: içerik AI tarafından
üretildiği için "✦ AI" rozeti + zorunlu "AI sınıflandırması" başlığı koşulsuz
görünür. Bilinçli olarak yalnız bir SEÇİM kontrolüdür — galeri ızgarasını/
panelini render ETMEZ; seçili odaya göre hangi fotoğrafların gösterileceği
tamamen çağıranın kompozisyon sorumluluğundadır (bkz. §2).

- **Kullan:** ilan detay sayfasında galeri üstünde "odaya göre filtrele"
  şeridi — `GlassGallery`/`GlassMediaGallery` ile birlikte, seçili
  `activeRoomId`'ye göre çağıran hangi fotoğrafları göstereceğine karar verir.
- **Kullanma:** kategori bazlı ama AI kaynaklı OLMAYAN bir sekme/filtre
  ihtiyacı (→ `GlassNearbyPlaces` `variant="tabs"` iskeleti veya düz
  `GlassSegmentedControl`), kişisel uyum skoru (→ `GlassMatchScore`), tek
  paragraflık AI özeti (→ `GlassAiSummaryCard`).

| İlgili | Farkı |
|---|---|
| GlassNearbyPlaces (`variant="tabs"`) | Aynı roving-tabindex iskeletini paylaşır; NearbyPlaces gerçek `tablist`/`tab` + panel render eder ve `aria-controls` verir (panelli), AI rozeti taşımaz — RoomClassifierTabs panelsiz olduğundan bilinçli olarak `radiogroup`/`radio` kullanır + AI-first sözleşmeli |
| GlassMatchScore / GlassAiSummaryCard | Aynı "✦ AI" rozet + `confidence` + `loading` sözleşmesini paylaşır; onlar tekil bir sonucu (skor/özet) sunar, RoomClassifierTabs çok-yollu bir SEÇİM sunar |
| GlassSegmentedControl | Genel amaçlı, AI kaynaklı olmayan sekme/switch; oda sınıflandırması gibi alana özel bir sözleşme taşımaz |

## 2. Semantik sözleşme

- Kök element: `<section>` (`aria-label` opsiyonel prop'tan; sayfada birden
  çok örnek varsa verilmesi önerilir — `GlassNearbyPlaces` ile aynı karar).
- Başlık satırı: `<span>` "AI sınıflandırması" (heading DEĞİL — bu bir
  filtre şeridi, ayrık bir doküman bölümü değil) + "✦ AI" rozeti
  (`aria-label="Yapay zekâ üretimi"`) + varsa "%N güven" metni. Metin ve
  rozet **özelleştirilemez** — kontrat "ZORUNLU" ifadesini prop ile
  ezilebilir bir default değil, sabit bir görünürlük garantisi olarak okur.
- Sekme şeridi: `role="radiogroup"` (sabit `aria-label="Oda filtresi"`) +
  `role="radio"` düğümleri (`aria-checked`) — **`tablist`/`tab` DEĞİL**.
  Klavye/roving-tabindex mekaniği (ok tuşu gezinme) `GlassNearbyPlaces`'teki
  kat/kategori sekmesi deseniyle aynı iskelet, yalnız ARIA rol adları
  farklı (bkz. aşağıdaki karar gerekçesi).
- **Neden `radiogroup`/`radio`, `tablist`/`tab` değil:** WAI-ARIA APG Tabs
  deseni her `tab`'ın gerçek/var olan bir `tabpanel`'i `aria-controls` ile
  kontrol etmesini şart koşar. Bu component panel/galeri ızgarasını hiç
  render etmiyor ve hangi DOM id'sinin panel olacağını bilemiyor — var
  olmayan bir id'ye `aria-controls` ile işaret etmek gerçek bir ARIA IDREF
  ihlali (kırık referans) olurdu, ama `role="tab"` kullanıp hiç
  `aria-controls`/`tabpanel` vermemek de kendi başına APG'nin şart koştuğu
  tab↔panel ilişkisini kurmadan `tab` rolünü kullanmak anlamına gelirdi —
  bu da bir sözleşme ihlali (Codex dalga4 bulgusu). Davranış zaten tek
  seçimli bir FİLTRE olduğundan (§1) `radiogroup`/`radio` semantik olarak
  doğru eşleme: bu desen panel ilişkisi gerektirmez, roving-tabindex + ok
  tuşuyla seçimi taşıma mekaniği birebir aynı kalır. Panel eşlemesi tamamen
  çağıranın kompozisyon sorumluluğunda kalır (ör. çağıran `activeRoomId`'yi
  kendi galeri bileşenine `key`/filtre olarak geçirir); bu component
  `role="tabpanel"` render etmez ve `aria-controls` HİÇ vermez.
- "✦ AI" rozeti: `aria-label="Yapay zekâ üretimi"` — `GlassMatchScore`/
  `GlassAiSummaryCard` ile birebir aynı kontrat metni/CSS'i (kopya kabul,
  component bağımsızlığı için ortak component'e çıkarılmaz).
- `confidence` metni ("%N güven") görünür düz metin — ayrı ARIA gerekmez.
- Her sekmenin erişilebilir adı oda adı + fotoğraf adedini birlikte taşır
  (ör. "Mutfak 9 fotoğraf") — görünür fotoğraf sayısı rozeti (`countBadge`)
  `aria-hidden` DEĞİL, doğrudan buton metninin parçası; ayrı bir "fotoğraf"
  birim metni (`srOnly` DEĞİL, görünmez ama okunur ek span) sayının yalnız
  bir rakam olarak belirsiz kalmasını önler.
- `loading=true`: sekmeler hiç render edilmez (ne `role="radio"` ne iskelet
  buton), yerine `aria-hidden` dekoratif skeleton çipleri + tek duyuru
  noktası `role="status"`. Zorunlu "✦ AI" rozeti bu durumda da görünür kalır
  (AI-first standardı yükleme durumunu istisna tutmaz).
- **Canlı bölge (`role="status"`) her zaman mount kalır** (loading VE hazır
  durumunda, aynı DOM konumunda) — yalnız metni değişir: `loading=true` iken
  "Fotoğraflar odalara ayrılıyor", `loading=false` + `rooms` doluyken
  "Fotoğraflar odalara ayrıldı, N oda bulundu". Node'u duruma göre tamamen
  mount/unmount etmek (eski implementasyon — yalnız `loading` sırasında
  vardı) ekran okuyucuların "tamamlandı" geçişini güvenilir duyurmasını
  engelliyordu (Codex dalga4 bulgusu); sürekli mount + metin değişimi
  `aria-live` bölgelerinin beklenen kullanım şeklidir. (`rooms` boşken
  component `null` render ettiğinden bu durumda canlı bölge de yoktur —
  §8'deki "boş rooms" kararıyla tutarlı, ayrı bir istisna değil.)
- Portal yok, ref forwarding yok (statik/kontrollü sunum, diğer içerik
  katmanı component'leriyle tutarlı).
- **`children` public API'de YOK** — `Omit<HTMLAttributes<HTMLElement>,
  'onChange' | 'children'>` ile tip seviyesinde omit edilir (render etmeme
  yolu değil, tip yolu — bkz. §3/§4).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| başlık metni | ✅ (her zaman) | "AI sınıflandırması" (sabit) | Özelleştirilemez, heading DEĞİL |
| AI rozeti | ✅ (her zaman, `loading` dahil) | "✦ AI" | Kontrat sabit CSS'i — component'ler arası birebir aynı |
| güven metni | — | "%N güven" | Yalnız `confidence` sonluysa; rozetin yanında |
| radiogroup | ✅ (yalnız `loading=false` ve `rooms` doluyken) | oda sekmeleri | roving tabindex, `aria-controls` YOK |
| sekme (`radio`) | ✅ (satır başına) | oda adı + fotoğraf adedi rozeti | Erişilebilir ad ikisini birlikte taşır; `aria-checked` |
| yükleme placeholder'ı | — (yalnız `loading=true`) | dekoratif skeleton çipleri | `aria-hidden` |
| canlı bölge (`role="status"`) | ✅ (render edilen her durumda) | durum metni | Sürekli mount, aynı DOM konumu; `loading`'de "ayrılıyor", hazırda "N oda bulundu" (bkz. §2) |

Children kabul edilmez — tamamen `rooms` prop'undan türetilir; `children`
tip seviyesinde omit edilir (bkz. §2/§4), verilse dahi render edilmez.

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| rooms | prop | `{ id: string; label: string; count: number }[]` | — (zorunlu) | — | AI sınıflandırma sonucu oda grupları; boş dizi → `null` render |
| activeRoomId | prop | `string` | — | ✅ | Verilirse component kendi state'ini güncellemez, yalnız `onActiveRoomIdChange` çağırır |
| defaultActiveRoomId | prop | `string` | ilk oda | — | Uncontrolled başlangıç odası |
| onActiveRoomIdChange | prop | `(id: string) => void` | — | — | Sekme değişince çağrılır (tıklama + ok tuşu/Home/End) |
| confidence | prop | `number` | — | — | [0,100]'e clamp; sonlu değilse (`NaN`/`Infinity`) rozet metni hiç render edilmez (rozet yine görünür) |
| loading | prop | `boolean` | `false` | — | true → flat skeleton + `role="status"`; sekmeler render edilmez |
| aria-label | prop | `string` | — | — | Kök `<section>` adı |
| ...rest | — | `HTMLAttributes<HTMLElement>` (`onChange`/`children` hariç) | — | — | `className`/`style` birleştirilir; `children` tip seviyesinde reddedilir (TS derleme hatası) |

Ref hedefi yok. Controlled tespiti **yalnız** `activeRoomId !== undefined`
üzerinden yapılır (`GlassNearbyPlaces` ile aynı desen): verilirse component
kendi state'ini güncellemez, yalnız `onActiveRoomIdChange` çağırır; verilmezse
dahili state + aynı callback.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: controlled prop'lar verilmemiş (→ ilk oda aktif),
`confidence`/`loading` verilmemiş.

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` (light/dark/auto) | N/A — `GlassSurface` kullanmaz, tema `data-theme` kök token'larından otomatik |
| `size` | N/A — spec'te istenmedi, tek ölçek |
| `variant` | N/A — tek görsel biçim (sekme şeridi); `GlassNearbyPlaces`'in aksine `chips`/`tabs` ayrımı yok |
| `thickness`/`prominent` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `activeRoomId`/`defaultActiveRoomId` bir oda id'siyle eşleşmiyor | Sessizce ilk odaya düşülür (`rooms.find(...) ?? rooms[0]`), hata fırlatılmaz |
| `rooms` boş dizi | `null` render, hata fırlatılmaz (AI rozeti dahil hiçbir şey görünmez — gösterilecek sınıflandırma sonucu yok) |
| `count` negatif/`NaN`/`Infinity` | 0'a düşürülür (`resolveCount`), asla negatif/ondalık gösterilmez |
| `confidence` aralık dışı/`NaN`/`Infinity` | [0,100]'e clamp; sonlu değilse hiç render edilmez, rozet yine görünür |
| `loading=true` + `rooms` verilmiş | `rooms` tamamen yok sayılır, yalnız sabit sayıda skeleton çip gösterilir |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| aktif oda | `activeRoomId` (controlled) veya dahili state (uncontrolled) | — | `aria-checked`, roving `tabindex` |
| yükleme | `loading` prop | tüm sekmeleri (AI rozeti HARİÇ) | `role="status"` |
| disabled/hover/focus/active | — | — | Prop olarak YOK; yalnız `:focus-visible`/`@media(hover:hover)` CSS'te |

Katman sırası: `loading` (varsa her şeyi bastırır, AI rozeti hariç) → `rooms`
verisi → controlled/uncontrolled çözümleme (önce id eşleşmesi, sonra ilk
odaya düşüş) → render.

## 7. Davranış

- Pointer: sekmeye tıklama seçer.
- Klavye (radiogroup üzerinde): `→` sonraki, `←` önceki (sarmalı), `Home` ilk,
  `End` son oda — seçim odağı takip eder (roving tabindex). Yatay dizilim
  olduğundan `↑`/`↓` **işlenmez** — `preventDefault` çağrılmaz, sayfa
  kaydırması engellenmez. Yalnız seçili sekme `tabIndex=0`, diğerleri `-1`.
- Focus akışı: yeni seçili sekmeye programatik `focus()` çağrısı **yalnız**
  kullanıcının ok tuşu/`Home`/`End` ile tetiklediği geçişte, gerçekte
  render'a yansıyan (resolved) aktif index'i izleyen bir `useEffect`
  üzerinden yapılır (fare tıklamasında native focus zaten oradadır).
  Odak talebi çift ref ile taşınır: `focusPendingRef` (talep var mı) +
  `focusRequestIdRef` (hangi oda talep edildi). Efekt bayrağı her koşulda
  tüketip sıfırlar, `focus()` yalnız çözülen aktif oda gerçekten talep
  edilen id ile eşleşiyorsa çağrılır. Böylece değişiklik üretmeyen/reddedilen
  hiçbir seçim yolu bayrağı askıda bırakmaz (Codex dalga4 bulgusu):
  - Controlled modda ebeveyn seçimi reddederse (`activeRoomId` değişmezse)
    bayrak sonraki ilgisiz güncellemeye kadar askıda kalsa bile, o anki
    resolved oda talep edilen id ile eşleşmediğinden odak sıçramaz.
  - Zaten seçili sekmede `Home`/`End` (değişiklik üretmeyen yol) bayrağı
    hiç set etmez, mevcut askıdaki talebi de temizler.
- DOM id'leri (`{baseId}-tab-{i}`) oda `id` alanının ham değerinden DEĞİL,
  oda index'inden türetilir — `id` yalnız veri anahtarı/controlled state
  değeri olarak kalır, boşluk/özel karakter içerse bile DOM id'si geçerli
  kalır. Bu component `aria-controls` vermediğinden IDREF kırılma riski zaten
  yoktur, ama id yine öngörülebilir/stabil tutulur.
- Controlled/uncontrolled: bkz. §4/§5.
- `loading`: skeleton çipleri (`skeletonTab`) `aria-hidden`; `role="status"`
  canlı bölgesi "Fotoğraflar odalara ayrılıyor" der ve **yükleme bitince de
  mount kalıp** metnini "Fotoğraflar odalara ayrıldı, N oda bulundu" olarak
  değiştirir (bkz. §2 — sürekli mount, geçiş duyurusunun güvencesi).
  Skeleton animasyonu yalnız `opacity` (shimmer/gradient yok, kendi
  flat placeholder'ı — `GlassSkeleton`'a bağımlı değil). Zorunlu "✦ AI"
  rozeti skeleton'ın yanında normal (aria-hidden OLMAYAN) şekilde render
  edilir.
- Async yok, overlay yok. Bu component hiçbir zaman galeriyi/panelini
  render etmez veya ona referans tutmaz — tamamen kompozisyondan bağımsız.
- Responsive: sekme şeridi `overflow-x: auto` ile yatayda kayar (kaydırma
  çubuğu gizli); dokunmatikte sekme yüksekliği 44px'e yükselir.

## 8. İçerik kuralları

- `label` (oda adı) kısa olmalı ("Mutfak", "Yatak Odası 1") — heading
  render edilmediğinden sayfa başlık hiyerarşisini etkilemez; uzun
  bileşik kelimeler `overflow-wrap: anywhere` ile sarar (bkz. UzunIcerik
  story).
- `count` tam sayı fotoğraf adedi — component birim eklemez, yalnız rakamı
  gösterir; erişilebilir ada "fotoğraf" birimi ayrıca eklenir.
- Başlık metni ("AI sınıflandırması") ve AI rozeti metni ("✦ AI") sabit —
  çağıran tarafından özelleştirilemez (kontrat: tüm AI component'lerinde
  tutarlı görünmeli, ayrıca bu component'e özgü "ZORUNLU" ifadesi prop
  yüzeyinde bir açık kapı bırakmaz).
- Boş `rooms`: `null` render — sabit bir "sınıflandırma yok" metni
  gösterilmez (gösterilecek anlamlı bir sonuç yokken boş bir kart render
  etmek yerine hiçbir şey render edilmemesi tercih edildi, `GlassNearbyPlaces`
  ile aynı karar).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| başlık metni | color/font-size | `--lg-label-secondary` / `--lg-text-footnote` | — |
| AI rozeti zemin/metin | background/color | `color-mix(... var(--lg-accent) ... var(--lg-surface)/var(--lg-label))` | kontrat sabiti — `GlassAiSummaryCard.module.css`'teki `.badge` bloğuyla birebir aynı |
| güven metni | color/font-size | `--lg-label-secondary` / `--lg-text-caption` | — |
| sekme (tab) | border/radius/min-height | `--lg-hairline` / `--lg-radius-chip` / `--lg-control-sm` | seçili → `--lg-accent` zemin + `--lg-accent-contrast` metin |
| sekme focus | outline | `--lg-accent` | yalnız `:focus-visible` |
| fotoğraf adedi rozeti | background | `color-mix(in srgb, var(--lg-label) 10%, transparent)` | seçili → `color-mix(in srgb, var(--lg-accent-contrast) 4%, transparent)` — 24% karışım açık temada ~3,3:1'e düşüyordu, 4% her iki temada ≥4,5:1 (Codex dalga4 bulgusu) |
| fotoğraf adedi rozeti | color | `--lg-label` — `--lg-label-secondary` bu zeminde açık temada ~3,9:1 kalıp 4,5:1 eşiğini kaçırıyordu (Codex dalga4 bulgusu) | seçili → `--lg-accent-contrast` |
| skeleton çip | background | `color-mix(in srgb, var(--lg-label) 8%, var(--lg-surface))` | `loading` |
| boşluklar | gap/padding | `--lg-space-1..5` | — |

Raw değer kullanılmadı — tüm renk/radius/boşluk token'lardan; AI rozeti
font-size 10.5px/700 kontrat sabiti (tasarım sistemi ölçeğinde yok, tüm AI
component'lerinde aynı borç); `loading` skeleton çip genişlikleri sabit px
listesi (`72px`/`96px`/`60px`/`84px`) — gerçek etiket genişliklerini taklit
eden görsel bir borç, `GlassMatchScore`/`GlassAiSummaryCard` skeleton
satırlarındaki aynı gerekçe.

## 10. Storybook kapsamı

Var: Default, Playground, Controlled (dışarıdan yönetilen `activeRoomId`),
Durumlar (yüksek güven / güven verilmemiş / `loading`), UzunIcerik,
Responsive (mobile1 + 320px konteyner, dokunmatik hedef), Erişilebilirlik
(docs description'lı, `radiogroup`/`radio` seçimi + `aria-controls`
kararının gerekçesi dahil).

`Variants`/`Sizes`/`Temalar` ayrı story olarak yok: `variant`/`size` ekseni
tanımlı değil (tek görsel biçim), tema toolbar'la otomatik doğrulanır
(`GlassNearbyPlaces`/`GlassMatchScore` ile aynı karar).

## 11. Test kabul kriterleri

- [x] "AI sınıflandırması" başlığı + "✦ AI" rozeti her zaman render edilir
      (`aria-label="Yapay zekâ üretimi"`)
- [x] `confidence` geçerliyse "%N güven" metni eklenir, sonlu değilse hiç
      render edilmez
- [x] ilk oda varsayılan seçili, roving tabindex (`0`/`-1`)
- [x] sekmeye tıklama seçimi değiştirir + `onActiveRoomIdChange` doğru id
      ile çağrılır
- [x] controlled `activeRoomId`: tıklama görünümü değiştirmez, yalnız
      callback çağrılır
- [x] ok tuşları (`ArrowRight`/`ArrowLeft`) sarmalı gezinir ve seçimi taşır
- [x] `Home`/`End` ilk/son odaya gider
- [x] `ArrowUp`/`ArrowDown` tablist üzerinde işlenmez, `preventDefault`
      çağrılmaz (sayfa kaydırması engellenmez)
- [x] controlled modda ok tuşuyla geçiş isteği reddedilirse odak talep
      edilen sekmeye sapmaz, mevcut aktif sekmede kalır
- [x] reddedilen controlled seçim sonrası İLGİSİZ bir gerçek güncelleme
      geldiğinde askıda kalan bayrak odağı yanlış sekmeye sıçratmaz
- [x] zaten seçili sekmede `Home`/`End` sonrası ilgisiz bir controlled
      güncelleme odağı çalmaz (bayrak hiç set edilmez/temizlenir)
- [x] `radiogroup`/`radio` semantiği kullanılır (`aria-checked`);
      `aria-controls` hiç taşınmaz, `tablist`/`tab`/`tabpanel` render edilmez
- [x] `loading` tamamlanınca canlı bölge mount kalır ve hazır durumunu
      "Fotoğraflar odalara ayrıldı, N oda bulundu" metniyle duyurur
- [x] `loading` olmayan varsayılan durumda da `role="status"` mount edilir
- [x] `children` prop tipte kabul edilmez (derleme zamanı sözleşmesi,
      `@ts-expect-error` regresyonu) ve verilse dahi render edilmez
- [x] oda `id`'si boşluk içerdiğinde (`"çamaşır odası"` gibi) DOM id'leri
      index tabanlı kalır, geçerlidir
- [x] boş `rooms` dizisi hiçbir şey render etmez
- [x] `loading=true` iken "✦ AI" rozeti görünür kalır, sekmeler render
      edilmez, `role="status"` durum metni duyurulur
- [x] geçersiz/negatif `count` 0'a düşürülür ve erişilebilir adda
      "fotoğraf" birimiyle birlikte iletilir
- [ ] `pointer: coarse`'ta sekme 44px hedefi (visual/CSS, unit test kapsamı
      dışı — bkz. `GlassNearbyPlaces` aynı borç)

## 12. Do / Don't

- ✅ `activeRoomId`'yi galeri bileşeninin filtresine bağla — bu component
  yalnız SEÇER, galeri neyi göstereceğine kendi karar verir.
- ✅ Oda sayısı arttıkça yatay kaydırmaya güven — sekme şeridi taşarsa
  ayrı bir "daha fazla" menüsü açılmaz (`GlassNearbyPlaces` ile aynı karar).
- ✅ `confidence`'ı yalnız gerçek bir model çıktısıysa doldur — uydurulmuş
  bir değer asla gösterilmemeli.
- ❌ Bu component'e `aria-controls` eklemeye/panel render etmeye ÇALIŞMA —
  kasıtlı bir sınır, kompozisyon çağırana ait (bkz. §2 gerekçe).
- ❌ "AI sınıflandırması" başlığını veya "✦ AI" rozetini prop ile
  özelleştirilebilir hale getirme — kontrat sabiti, tüm AI component'lerinde
  tutarlı kalmalı.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.

**Açık kararlar:** boş `rooms` durumunda hiçbir şey render etmeme kararı
(`GlassNearbyPlaces` ile tutarlı; alternatif olarak "henüz sınıflandırma
yok" bilgilendirici bir satır da düşünülebilirdi, v2'de ihtiyaç doğarsa
eklenebilir) · sekme şeridi taşarsa ayrı bir "daha fazla" menüsü yok ·
oda sıralaması component sorumluluğunda değil, çağıran `rooms` dizisini
istediği sırada verir (component sıralamayı değiştirmez).

## Changelog

- 2026-07-17 (dalga4 düzeltme geçişi, Codex konsolide raporu): (1) ARIA
  rolleri `tablist`/`tab` → `radiogroup`/`radio` (`aria-selected` →
  `aria-checked`) — panelsiz `tab` kullanımı APG tab↔panel şartını ihlal
  ediyordu, gerekçe §2; (2) `focusPendingRef` sızıntısı kapatıldı —
  `focusRequestIdRef` ile talep edilen oda id'si eşleşmeden `focus()`
  çağrılmaz, değişiklik üretmeyen `Home`/`End` yolu bayrağı temizler (§7);
  (3) canlı bölge (`role="status"`) artık sürekli mount — yükleme bitişi
  "N oda bulundu" metniyle duyurulur (§2/§7); (4) `countBadge` kontrastı:
  metin `--lg-label`, seçili zemin karışımı %24 → %4 (küçük metin ≥4,5:1,
  §9); (5) `children` tip seviyesinde omit edildi (§2/§4). Tümü için
  regresyon testleri eklendi (§11).
- 2026-07-17: İlk sürüm — WAI-ARIA yatay tablist + roving tabindex deseni
  (`GlassNearbyPlaces` ile aynı iskelet, panelsiz), zorunlu "AI
  sınıflandırması" başlığı + "✦ AI" rozeti (`GlassAiSummaryCard`/
  `GlassMatchScore` ile aynı kontrat), opsiyonel `confidence` metni, flat
  `loading` placeholder, `count` için finite/negatif guard.
