---
name: GlassCommandPalette
category: overlay
status: hazır
lastReviewed: 2026-07-17
---

# GlassCommandPalette Kuralları

## 1. Amaç

Sayfa geneli komut paleti (⌘K) — kullanıcı yazarak ilan/sayfa/hesap
komutlarını arar, klavyeyle gezinir ve seçer. Spotlight/⌘K kalıbının
hafif bir yorumu: `GlassModal`'ın portal + focus trap + scroll kilidi
sözleşmesini TAŞIMAZ, kendi minimal overlay'ini kurar.

- **Kullan:** sayfa geneli hızlı gezinme/eylem araması (ilanlara atla,
  sayfa değiştir, hesap eylemi tetikle) — tek bir arama kutusu + filtrelenmiş
  liste yeterliyse.
- **Kullanma:** çok adımlı form/onay akışı (→ `GlassModal`), kalıcı yan
  panel navigasyonu (→ `GlassDrawer`/`GlassSidebar`), tek alanlı basit
  filtre (→ `GlassSelect`/`GlassSearchField`).

| İlgili | Farkı |
|---|---|
| `GlassModal`/`GlassDrawer` | Portal, focus trap, scroll kilidi, kapanışta tetikleyiciye focus dönüşü TAŞIRLAR. Palet bunların HİÇBİRİNİ taşımaz (bkz. §2, §7) — bilinçli olarak "hafif". |
| `GlassSelect` | Tek değerli seçim, `role="listbox"`/`"option"` + `aria-activedescendant` deseni kullanır. Palet bu deseni BİLİNÇLİ OLARAK kullanmaz (bkz. §7 gerekçesi) — gerçek buton listesi + basit aktif index. |
| `GlassSearchField` | Salt filtre input'u, kendi sonuç listesi/overlay'i yok. Palet tam bir overlay + gruplu sonuç listesi taşır. |
| `GlassChatDock`/`GlassPopover` | Aynı "non-modal, focus trap yok, portal yok" ailesini paylaşır ama onlarda backdrop YOK (arka plan her zaman etkileşimli). Palette backdrop VAR ve tıklaması kapatır — spec kararı. |

## 2. Semantik sözleşme

- Kök: `open=false` iken **hiçbir DOM üretmez** (`AnimatePresence` içinde
  `null`) — uncontrolled/gizli bir "kapalı" görünümü yok, çağıran `open`'ı
  kendi state'inde tutar. Bu, panel + arama + sonuç listesi + `role="status"`
  düğümünü KAPSAR: hepsi TEK bir birim olarak `open` ile birlikte
  mount/unmount olur — `status` panelden bağımsız, önceden veya sonradan
  mount edilen ayrı bir düğüm DEĞİLDİR (bkz. aşağıdaki madde, tutarlı tek
  lifecycle sözleşmesi).
- `open=true`: `position: fixed` backdrop (`inset: 0`, `--lg-scrim` zemin) +
  içinde ortalanmış panel. **Portal YOK** — doğrudan çağrıldığı yerde React
  ağacına render edilir (spec kararı, `z-index: 80` ile öne çıkar).
- Panel: `role="dialog"` + sabit `aria-label="Komut paleti"`. **`aria-modal`
  YOK ve focus trap YOK** — `GlassChatDock`/`GlassPopover`'daki "non-modal
  dialog sözleşmesi" ile aynı bilinçli karar (bkz. o component'lerin
  yorumları). Backdrop tıklaması ve Escape kapatır ama Tab, panel dışına
  serbestçe çıkabilir.
- Arama kutusu: gerçek `<input type="text">`, accessible name **sabit**
  `aria-label="Komut ara"` (placeholder yalnız görsel — `GlassChatDock`'un
  "Mesajınız" kararıyla aynı desen).
- Sonuç listesi **`role="listbox"`/`"option"` DEĞİL** — bkz. §7 "Neden
  listbox deseni kullanılmadı" gerekçesi. Her komut gerçek bir `<button
  type="button">`.
- Grup başlığı **heading DEĞİL** — `role="group"` + `aria-labelledby` ile
  bağlı `<p>` (`GlassNearbyPlaces` `.categoryLabel` ile aynı karar).
- Sonuç sayısı `role="status"` (örtük `aria-live="polite"`) bölgesiyle
  duyurulur; bu düğüm panelin GERİ KALANIYLA AYNI ANDA mount olur — panel
  render edildiğinde `status` da zaten oradadır, `open=true` sonrası ayrı
  bir adımda sonradan eklenmez (kontratın "aria-live bölgeleri sonradan
  DOM'a eklenmemeli" ilkesi, panel + status TEK birim olarak açılıp
  kapandığı için burada bu şekilde karşılanır — panel kapalıyken `status`
  da DOM'da yoktur, bkz. §2 ilk madde).
- Komutların ham `id` alanı hiçbir DOM `id`'sine yazılmaz — yalnız React
  `key`. DOM id'ler (`{uid}-cmd-{index}`, `{uid}-group-{index}`) `useId` +
  flat/bucket index'inden türetilir.
- Kapanışta tetikleyiciye odak dönüşü **ÇAĞIRANIN işidir** — component
  `onClose` içinde/sonrasında hiçbir odak yönetimi YAPMAZ (spec kararı,
  bkz. §7).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| backdrop | ✅ (yalnız açıkken) | — | `--lg-scrim` zemin, tıklaması `onClose` tetikler |
| panel | ✅ (yalnız açıkken) | search + results | `role="dialog"`, sabit `aria-label` |
| search | ✅ | mercek ikonu + input | accessible name sabit "Komut ara" |
| durum (aria-live) | ✅ | "N sonuç bulundu" | daima mount, görsel-gizli |
| results | ✅ | grup(lar) + komut butonları veya `emptyText` | boşsa yalnız `emptyText` render edilir |
| group başlığı | Koşullu | `command.group` metni | yalnız gruplu komutlar için; grupsuzlar başlıksız bucket'ta |
| command butonu | ✅ | `label` + opsiyonel `hint` | gerçek `<button>`, `data-active` görsel vurgu taşır |

Children kabul edilmez — tamamen prop güdümlü (`GlassChatDock`/
`GlassMatchScore` ile aynı karar).

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| open | prop | `boolean` | — (zorunlu) | ✅ — ZORUNLU, uncontrolled yok | `defaultOpen` YOK; çağıran kendi ⌘K dinleyicisiyle yönetir |
| onClose | prop | `() => void` | — (zorunlu) | — | Backdrop tıklama, Escape, komut seçimi sonrası çağrılır |
| commands | prop | `GlassCommandPaletteCommand[]` | — (zorunlu) | — | `{ id, label, hint?, group?, onSelect }` |
| placeholder | prop | `string` | `'Komut ara…'` | — | Yalnız görsel — accessible name sabit "Komut ara" |
| emptyText | prop | `string` | `'Sonuç bulunamadı.'` | — | Filtre sonucu boşken görünür metin |
| className | prop | `string` | — | — | Backdrop köküne birleştirilir |

Ref hedefi yok. `commands[].onSelect` yalnız o komut seçildiğinde çağrılır;
hemen ardından `onClose` çağrılır (seçim her zaman paleti kapatır, spec'te
"kapatma"yı bastıran bir seçenek istenmedi).

## 5. Seçenek eksenleri

`material`/`tone`/`size`/`variant`/`thickness`/`tint`/`prominent`
eksenlerinin TAMAMI **N/A** — bu component'te hiçbiri yok, içerik katmanı
tamamen flat, tek bir görsel biçim (kontrat: "cam yalnız navigasyon/kontrol
katmanı" — palet zaten flat içerik katmanında).

| Yasak / türetilen | Davranış |
|---|---|
| `open` olmadan `defaultOpen` | Yok — `open` her zaman zorunlu controlled prop, uncontrolled kullanım YOK |
| `command.group` yok | Komut, boş `""` bucket'ında grup başlığı OLMADAN render edilir |
| aynı `group` adına sahip komutlar `commands` içinde ARALIKLI (interleaved) sırada | Görsel gruplama yine de birleşir — grup sırası `commands`'taki İLK GÖRÜLME sırasına göre sabitlenir (bkz. §7) |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| açık/kapalı | `open` prop (tamamen controlled, iç state YOK) | tüm DOM'un varlığı/yokluğu | panel varlığı/yokluğu |
| arama metni (`query`) | tamamen iç state, dışarı sızmaz | filtrelenmiş `buckets`/`flatItems` | — |
| aktif işaretçi (`activeIndex`) | iç state; her `query` değişiminde 0'a döner, her açılışta 0'a sıfırlanır | `data-active` görsel vurgusu, `Enter` ile seçilecek komut | — (aria-activedescendant KULLANILMAZ, bkz. §7) |
| odak hedefi (açılış) | `prevOpenRef` — her `open` **false→true** geçişinde (ilk mount'ta `true` başlaması dahil) KOŞULSUZ input'a taşınır | önceki arama/aktif index sıfırlanır | — |
| odak hedefi (kapanış) | YOK — component hiçbir odak taşımaz, ÇAĞIRANIN işi | — | — |
| disabled/hover/focus/active | — | — | hover/focus/active PROP DEĞİL; yalnız `:focus-visible`/`@media(hover:hover)` |

Katman sırası: `open` (kapalıyken hiçbir şey render edilmez) → `query`
(filtre) → `activeIndex` (görsel vurgu + Enter hedefi).

## 7. Davranış

- **Neden `GlassModal` değil:** spec kararı — palet portal, focus trap ve
  scroll kilidi TAŞIMAZ; yalnız backdrop (tıklaması kapatır) + Escape +
  açılışta input'a odak. Bu, `GlassChatDock`/`GlassPopover`'ın "non-modal
  dialog" ailesine YAKIN ama TAM AYNI değil: onlarda backdrop yok (arka
  plan her zaman etkileşimli), palette backdrop VAR ve dışına tıklama
  kapatır (Spotlight/⌘K kullanıcı beklentisi).
- **Neden `role="listbox"`/`"option"` + `aria-activedescendant` KULLANILMADI
  (spec kararı, en kritik tasarım gerekçesi):** Bu desen `GlassSelect`'te
  kullanılıyor ve orada iyi çalışıyor çünkü trigger/panel çifti klasik bir
  "combobox" — ama komut paleti çok daha büyük, sık değişen bir listeye
  sahip ve her satırda ek bir "hint" (kısayol) metni taşıyor. Basit desen
  (gerçek `<button>` listesi + roving-OLMAYAN aktif index + `Enter` seçer)
  şu avantajları sağlıyor: (1) ekran okuyucu kullanıcıları `Tab` ile her
  komutu TEK TEK gezip `Enter`/`Space` ile etkinleştirebilir — bu,
  `aria-activedescendant`'ın tarayıcı/AT kombinasyonlarına göre değişken
  duyuru güvenilirliğine bağımlı DEĞİL, standart buton etkileşimi kadar
  sağlam; (2) `activeIndex` yalnız SIGHTED klavye kullanıcıları için bir
  "hızlı gezinme" katmanı — odak input'ta kalırken `ArrowUp`/`ArrowDown` ile
  görsel imleci taşır, `Enter` o an vurgulanan komutu seçer; (3) roving
  tabindex YOK çünkü DOM odağı hiç panel içine taşınmıyor (input'ta kalıyor)
  — `GlassNearbyPlaces`'in tablist'indeki gibi bir "her ok tuşunda DOM
  odağını taşı" karmaşıklığına gerek yok.
- **Odak yönetimi:** her `open` **false→true** geçişinde (ilk render'da
  `open=true` başlaması DAHİL, `prevOpenRef` başlangıcı bilinçli olarak
  `false`) arama/aktif index sıfırlanır ve input'a KOŞULSUZ odaklanılır.
  Bu, `GlassChatDock`'un "yalnız kullanıcı tetiklediyse odak taşı"
  davranışından BİLİNÇLİ OLARAK farklıdır: kontratın "controlled modda
  koşulsuz odak taşıma yok" notu, `open`'ın kullanıcı niyetinden BAĞIMSIZ
  sık sık değişebildiği kalıcı widget'lar (dock, sidebar) için geçerlidir.
  Komut paleti ise `GlassModal` ailesiyle aynı sınıfta bir diyalog — `open`
  yalnız "bu diyaloğu göster" niyetiyle `true` yapılır, bu niyetin TEK
  amacı kullanıcının hemen yazmaya başlamasıdır; bu yüzden her açılış
  koşulsuz odaklanır (spec: "açılınca input'a odak", istisnasız).
  **Kapanışta component HİÇBİR odak taşımaz** — spec: "tetikleyiciye odak
  dönüşü ÇAĞIRANIN işi". Bu da `GlassChatDock`'tan farklıdır (o, kapanışta
  launcher'a odaklanır); palette'in kalıcı bir "launcher"ı YOK (⌘K
  kısayolu çağıranın kendi sayfasında yaşar), bu yüzden dönecek hedefi
  component bilemez.
- **Filtre:** `query` `label` üzerinde `toLocaleLowerCase('tr')` ile
  büyük/küçük harf ve Türkçe'ye duyarlı (İ/i, I/ı) "içerir" araması yapar.
  `hint`/`group`/`id` filtreye DAHİL DEĞİL — yalnız `label`.
- **Grup sırası:** `buckets` HER ZAMAN orijinal `commands` dizisindeki
  İLK GÖRÜLME sırasına göre hesaplanır (filtrelenmiş alt kümeye göre
  DEĞİL) — kullanıcı yazarken gruplar yer değiştirmez, yalnız içi tamamen
  boşalan bir grup kaybolur (regresyon riski: filtrelenmiş diziden grup
  sırası türetilseydi, yazarken gruplar rastgele yeniden sıralanabilirdi).
- **Klavye (panel kapsayıcısının `onKeyDown`'unda, `document` genelinde
  DEĞİL):**

  | Tuş | Davranış |
  |---|---|
  | `ArrowDown`/`ArrowUp` | `activeIndex`'i filtrelenmiş düz listede döngüsel taşır (`preventDefault`) |
  | `Enter` | `activeIndex`'teki komutun `onSelect`'ini çağırır + `onClose` (`preventDefault`) |
  | `Escape` | `e.stopPropagation()` + `onClose` — yalnız panel içi bir hedef odaktayken tetiklenir |

  IME kompozisyonu sürerken (`isComposing`/`key==='Process'`) HİÇBİR tuş
  işlenmez — kompozisyon adayını onaylayan/iptal eden `Enter`/`Escape`
  paleti yanlışlıkla kapatmaz/seçmez (bkz. test dosyası).
- Fare: bir komut üzerine `onMouseEnter` geldiğinde `activeIndex` o komuta
  taşınır (klavye ve fare imleci arasında tutarlı vurgu); tıklama doğrudan
  seçer.
- Dokunmatik: komut butonları tek token'dan ölçülenir — `--lg-control-md`
  imleçlide 40px, dokunmatikte 44px.
- Responsive: breakpoint yok — panel `min(560px, 100%)` genişlikte; üst
  boşluk `min(12vh, max(space-4, 100vw - 464px))` ile, dikey pay
  `min(70vh, 60vh + max(0px, 480px - 100vw), …)` ile viewport daraldıkça
  içsel olarak akar (uçlarda eski kırılım değerleriyle birebir aynı).

## 8. İçerik kuralları

- `label` uzun olabilir — buton içinde `text-overflow: ellipsis` ile tek
  satıra sıkışır (bkz. UzunIcerik story).
- `hint` kısa tutulmalı (kısayol/fiyat gibi tek parça bilgi) — sabit
  genişlikte değil ama `white-space: nowrap` ile sarmaz.
- `group` boşluk/özel karakter içerebilir — DOM id'sine YAZILMAZ, yalnız
  görünür metin + index tabanlı `aria-labelledby` bağlantısı.
- `emptyText` çağıran tarafından özelleştirilebilir; sonuç sayısı
  duyurusu (`role="status"`) sabit Türkçe format ("N sonuç bulundu") taşır,
  özelleştirilemez.

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| backdrop zemin | background | `--lg-scrim` | — |
| panel zemini/çerçevesi | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` | — |
| başlık/metin | color | `--lg-label` | — |
| ikincil metin (placeholder, hint, grup başlığı, boş durum) | color | `--lg-label-secondary` | — |
| aktif komut zemini | background | `color-mix(in srgb, var(--lg-accent) 12%, var(--lg-surface))` | `:hover` (hover:hover) → 16% |
| hover (aktif olmayan) | background | `color-mix(in srgb, var(--lg-label) 6%, var(--lg-surface))` | yalnız `@media (hover: hover)` |
| hint chip çerçevesi | border | `--lg-hairline` | — |
| focus halkası | outline | `--lg-accent` | yalnız `:focus-visible` |
| kontrol yüksekliği (komut satırı) | min-height | `--lg-control-md` (imleçli 40px / dokunmatik 44px) | — |

**Borç (raw):** `z-index: 80` (z token'ı yok, `GlassChatDock`/`GlassToast`
ile aynı gerekçe, palet en üstte olmalı → onlardan daha yüksek), backdrop
üst boşluğu `12vh` + `60vh/70vh` payları raw (viewport oranı, token yok) ·
mikro-geometri ve içsel-akış sabitleri kökte (`.backdrop`) yerel
değişkenlerde: `--glass-palette-hint-pad-block/inline` (2px/7px kısayol
ipucu çipi iç boşluğu), `--glass-palette-w: 560px` (panel maks. genişliği),
`--glass-palette-pad-flow: 464px` (üst boşluk akış eşiği),
`--glass-palette-narrow-vw: 480px` (dar viewport eşiği),
`--glass-palette-max-h-wide/narrow: 480px/560px` (yükseklik payları) — spec
sabitleri, tasarım sistemi ölçeğinde yok. Panel gölgesi `--lg-shadow-lg`.

**Dokunma hedefi (2026-08-03):** Komut satırı yüksekliği tek kaynaktan —
`--lg-control-md` imleçli cihazda 40px, dokunmatikte 44px verdiği için aynı
token'ı tekrar yazan `@media (pointer: coarse)` bloğu KALDIRILDI. Görünmez
`::after` taşması gerekmez: komut satırı panel genişliğini kaplayan bir metin
hedefidir ve `--lg-space-2` dolgulu listede dikey taşma komşu satırlarla
çakışırdı.

## 10. Storybook kapsamı

Var: Default, Playground (interaktif ⌘K demo — yerel `open` state + gerçek
kısayol dinleyicisi), Boş Sonuç, UzunIcerik, Responsive, Erişilebilirlik
(docs description'lı).

`Sizes`/`Variants` ayrı story olarak yok: `size`/`variant`
ekseni tanımlı değil (tek sabit görsel biçim) (`GlassChatDock` ile aynı gerekçe).

## 11. Test kabul kriterleri

- [x] `open=false` iken hiçbir dialog DOM'a render edilmez
- [x] `open=true` olunca `role="dialog"` sabit `aria-label` ile render edilir, arama input'u odak alır
- [x] grup başlıkları heading DEĞİL — `role="group"` + `aria-labelledby` ile bağlı `<p>`
- [x] yazınca `label` üzerinde Türkçe locale-insensitive filtre uygulanır (İ/i eşleşir)
- [x] `ArrowDown`/`ArrowUp` aktif öğeyi `data-active` ile taşır, `Enter` aktif komutu seçer + `onClose` çağırır
- [x] bir komuta tıklamak `onSelect` + `onClose` çağırır
- [x] backdrop tıklaması `onClose` çağırır; panel içine tıklama kapatmaz
- [x] Escape panel içinde kapatır; `document` genelinde (kapsam dışı) Escape kapatmaz
- [x] IME kompozisyonu sürerken `Enter`/`Escape` yok sayılır
- [x] sonuç yokken `emptyText` render edilir, `role="status"` "0 sonuç bulundu" bildirir
- [x] her açılışta arama sıfırlanır ve input yeniden odak alır
- [ ] görsel/Chrome: reduced-motion'da backdrop/panel geçişleri opacity-only

## 12. Do / Don't

- ✅ `open`'ı her zaman çağıranın kendi state'inde (ör. ⌘K dinleyicisiyle)
  yönet — component uncontrolled bir "kendi kendine aç" yolu sunmaz.
- ✅ Komut seçiminde asıl navigasyon/eylemi `onSelect` içinde yap — component
  yalnız `onSelect` + `onClose`'u sırayla çağırır, kendi routing/network
  mantığı yok.
- ✅ Kapanış sonrası tetikleyiciye odak döndürmeyi ÇAĞIRAN üstlenir (ör.
  `onClose` içinde `triggerRef.current?.focus()`).
- ❌ `role="listbox"`/`"option"` veya `aria-activedescendant` ekleme — spec
  kararı, gerekçe için bkz. §7.
- ❌ Odak dönüşünü component içine taşıma (`onClose` çağrıldıktan sonra
  component'in kendi kendine bir yere odaklanması) — bu, çağıranın kendi
  tetikleyici elementini bilmeden yanlış bir hedefe (ör. `document.body`)
  odaklanma riski taşır; spec bilinçli olarak bu sorumluluğu çağırana
  bırakır.
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı (backdrop'un
  kendisi `--lg-scrim` düz rengidir, bulanıklaştırma efekti YOK).

**Açık kararlar:** AI-first kontratı (✦ AI rozeti/`confidence`/`onFeedback`/
`loading`) bu component'e uygulanmaz — palet AI tarafından üretilen bir
içerik SUNMAZ, `commands` tamamen çağıranın statik/deterministik veri
kaynağıdır (N/A, kontratın "AI component'leri" kapsamına girmiyor).
`defaultOpen`/uncontrolled kullanım BİLİNÇLİ OLARAK eklenmedi — spec: "open:
boolean (controlled zorunlu)".

## Changelog

- 2026-07-17: İlk sürüm — controlled `open`/`onClose`, backdrop+Escape
  kapanışı, gruplu filtre (Türkçe locale-insensitive), basit aktif-index
  klavye deseni (`listbox`/`option` KULLANILMADI), koşulsuz açılış odağı,
  kapanışta odak yönetimi yok (çağıranın işi), IME/`document`-kapsam dışı
  Escape korumaları.
- 2026-07-17 (Codex QA fix): `.input::placeholder` opaklığı `1`'e
  sabitlendi (tarayıcı varsayılanı efektif kontrastı ~2,1-2,8:1'e
  düşürüyordu; renk token'ı `--lg-label-secondary` zaten ~4,74:1
  sağlıyordu). §2'deki `status`/panel lifecycle anlatımı tek, tutarlı bir
  sözleşmeye indirildi (panel kapalıyken `status` de DOM'da yok — ikisi
  TEK birim olarak açılıp kapanıyor, önceki metindeki "her zaman mount"
  ifadesi "kapalıyken DOM yok" cümlesiyle çelişiyormuş gibi okunuyordu).
- 2026-08-03: Yeni kontrol ölçeğine uyarlandı — gereksizleşen
  `pointer: coarse` komut satırı yüksekliği kaldırıldı (`--lg-control-md`
  zaten imleçlide 40px, dokunmatikte 44px veriyor).
