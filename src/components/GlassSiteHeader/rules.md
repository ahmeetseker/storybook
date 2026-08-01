---
name: GlassSiteHeader
category: navigasyon
status: hazır
lastReviewed: 2026-07-31
---

# GlassSiteHeader Kuralları

## 1. Amaç

Tepede görünmez, scroll'da yüzen bir cam kapsüle morflanan site header'ı.
Kaynak: Tailark `hero-section-1`'in `HeroHeader`'ı; Liquid Glass uyarlaması.

- **Kullan:** pazaryerinin/kamuya açık sitenin üst navigasyonu.
- **Kullanma:** uygulama içi geri+başlık barı (→ `GlassNavbar`); dört anatomili
  editorial header (→ `GlassHeader`); Dynamic Island paneli (→ `GlassIslandHeader`).

## 2. Semantik sözleşme

- Kök `<header>` (banner); yatay link satırı `<nav aria-label="Site">`;
  mobil panel `<nav aria-label={menuLabel}>`. Aktif link `aria-current="page"`.
- Kayan cam gösterge `aria-hidden` + `data-nav-glass`; motion `layoutId`
  (`presets.springs.sidebar`), reduced-motion'da `duration: 0`.
- Hamburger `GlassIconButton` — accessible name `menuLabel`, `aria-expanded` +
  `aria-controls` panel `id`'sine bağlı.
  **Bilinen ödün:** `aria-controls` menü kapalıyken DOM'da karşılığı olmayan
  bir `id`'yi işaret eder — panel yalnız `menuOpen` iken mount edilir. Katı
  WAI-ARIA yazım pratiği referans verilen öğenin var olmasını tercih eder.
  Bilinçli tercih: panel şartlı mount edilir ki kapsülün `layout` (FLIP)
  animasyonu yükseklik değişimini sürebilsin; panel her zaman DOM'da olup
  `hidden`/`display:none` ile gizlense FLIP'in ölçtüğü kapsül yüksekliği
  paneli de kapsar ve morf yanlış hesaplanır.
- **Panel modal DEĞİLDİR.** Portal yok, focus trap yok, scroll kilidi yok.
  Escape kapatır ve focus hamburger'a döner; kapsül dışına `pointerdown`
  kapatır; link seçimi kapatır. Gerekçe: `GenelBakis.mdx`'in overlay sözleşmesi
  (portal + trap + kilit + focus dönüşü) sayfayı bloke eden Modal/Drawer/Toast
  katmanı için yazıldı. Bu panel sayfa akışının parçası — `Tab` panelden doğal
  olarak çıkmalıdır.
- Linkler sade sol tıkta `onClick`'e devreder (`preventDefault`); modifier'lı ve
  orta tıkta tarayıcıya bırakılır — yeni sekme davranışı korunur.

## 3. Anatomy

| Slot | Zorunlu | Kurallar |
|---|---|---|
| logo | ✅ | Wordmark/monogram — harf-kutusu kalıbı kullanılmaz |
| links | — | Boşsa nav, hamburger ve panel render edilmez |
| utility | — | Küçük yardımcı ikon buton (tema vb.) — aksiyonların solunda |
| secondaryAction | — | İkincil aksiyon ("Üye girişi") |
| action | — | TEK birincil CTA ("İlan ver") |
| condensedAction | — | Verilirse condensed'de utility+secondary+action üçlüsünün yerine geçer |

## 4. Public API

| Ad | Type | Default |
|---|---|---|
| logo | `ReactNode` | — |
| links | `GlassSiteHeaderLink[]` | `[]` |
| utility / secondaryAction / action / condensedAction | `ReactNode` | — |
| menuLabel | `string` | `'Menü'` |
| scrollThreshold | `number` | `24` |

`GlassSiteHeaderLink`: `{ label: string; href?: string; onClick?: () => void; active?: boolean }`

`...rest` yok. Controlled/Ref: N/A — iç state yalnız menü açıklığı + scroll bayrağı.

## 5. Seçenek eksenleri

| Kural | Davranış |
|---|---|
| `variant` / `size` / `material` | ❌ YOK — tek anatomi. Morf bir *durum*, eksen değil |
| `tone` | ❌ YOK — renkler tema token'larından döner |
| `condensedAction` verilmezse | Üçlü aksiyon condensed'de olduğu gibi kalır (opt-in davranış) |
| `links` boş | nav + hamburger + panel render edilmez, yerine esnek boşluk |

## 6. State modeli

İç state iki bayrak: `useScrolled(scrollThreshold)` → kökte `data-scrolled`;
`menuOpen` → kökte `data-menu-open`. Scroll listener passive; JS ölçüm yapmaz,
görsel geçişler CSS ve motion layout'ta.

## 7. Davranış

- **Rest:** kapsül `--lg-container-narrow` genişliğinde ve tamamen şeffaf.
  Cam yüzey maliyeti **0** (`.material` `visibility: hidden`). Yarıçap sabit
  duruyor ama hiçbir şey çizilmediği için görünmez.
- **Condensed:** kapsül `55rem`'e daralır, `.material` belirir. Cam yüzey **1**.
- Genişlik değişimi **motion layout (FLIP)** ile transform'a çevrilir.
  CSS `max-width` transition'ı bilinçli olarak YOK — layout tetiklerdi
  (`ErisilebilirlikMotionResponsive.mdx`).
- **Yarıçap animasyona SOKULMAZ.** `.capsule` her durumda `--lg-radius-card`
  taşır. Gerekçe: FLIP `scaleX` uygular ve motion yalnız *inline style*'dan
  gelen `borderRadius`'u ölçeğe karşı düzeltir; CSS sınıfından geleni
  düzeltmez. Yarıçap durum kuralında değiştirilirse morf boyunca köşeler
  ölçek kadar gerilip elipse döner (ölçüldü: t=217ms'de `scaleX` 1.114 iken
  `radius` çoktan 20px'ti). Rest'te malzeme görünmediği için sabit yarıçap
  görsel olarak bedelsizdir.
- **Malzeme solmaz, "kalınlaşarak" belirir** (Apple: *materialize, don't just
  fade*). `opacity` (0→1), `scale` (0.98→1) ve backdrop `blur` (0→11px) —
  üçü de kapsülün FLIP'iyle **aynı spring'te** sürülür, CSS transition'ıyla
  değil (`GlassSurface as={motion.div}` + `animate`). Yalnız opacity'nin CSS
  ease'iyle sürüldüğü sürümde şekil t=217ms'de %89 tamamlanmışken cam
  %11'deydi — kapsül yerine oturuyor, cam arkadan yetişiyordu.
  Ölçüm (şimdi): t=207ms kapsülX 1.061 / camScale 0.996 / op 0.77 /
  blur 8.8px · t=386ms 1.008 / 1.000 / 0.98 / 10.7px · t=569ms oturdu.
- Blur, `--hdr-blur` CSS değişkeni üzerinden sürülür; `backdrop-filter`
  bileşenin `style`'ında **sabit bir string** olarak yazılır
  (`blur(calc(var(--hdr-blur,0) * 1px)) saturate(180%)`). Gerekçe: `style`
  `GlassSurface`'in `surfaceStyle`'ına en son yayıldığı için kazanır, ve
  string sabit olduğundan React'in her yeniden render'ı (ör. `useElementSize`
  resize) motion'ın her karede yazdığı değeri ezmez.
- **`visibility` motion'ın `transitionEnd`'iyle kapanır**, sabit gecikmeli bir
  CSS transition'ıyla değil. Sabit gecikme kesilebilirliği bozardı (Apple §3):
  hızlı geri kaydırmada spring yeniden hedeflenirken yüzey, opacity daha
  sıfıra inmeden `--morph-dur` dolduğu için yarı görünürken kaybolurdu.
- Reduced-motion'da `morphTransition` `{ duration: 0 }` olduğu için dört kanal
  da anında yerine geçer (doğrulandı: transform hiç uygulanmıyor).
- **`prefers-reduced-transparency: reduce`** karşılanır: blur bileşen tarafında
  sıfırlanır (`prefersReducedTransparency()`), ton CSS'te `--material-tint`
  %100'e çıkar. Doğrulandı (CDP): `blur(0px)` + zemin `rgb(255 255 255 / 0.92)`.
- **Spring bilinçli olarak değiştirilmedi.** `presets.springs.sidebar`
  (`stiffness 260 / damping 32`) Apple parametrelerine çevrildiğinde sönüm
  oranı **0.992**, response **0.390s** — Apple'ın "Move/reposition" reçetesi
  (damping 1.0, response 0.4) ile pratikte aynı. Header bir jest taşımadığı
  için overshoot (`damping ~0.8`) İSTENMEZ; kritik sönüm doğru seçim.
- Panel tepede açılırsa da `.material` görünür olur; yoksa panel metni sayfa
  içeriğinin üstünde okunmaz kalırdı.
- Dar kapsülde (`@container (min-width: 48rem)` altı) `.actions` gizli,
  `.burger` görünür — satırda yalnız logo + hamburger kalır, aksiyonlar
  panele iner. Geniş kapsülde tersine döner: `.actions` görünür, `.burger`
  ve `.panel` gizlenir. `.burger`, `.actions`'ın içine değil `.row`'da yanına
  (kardeşi olarak) yerleşir. Bu ayrım aynı aksiyon setinin aynı anda hem
  satırda hem panelde, hem de hamburger'ın nav açıkken görünür kalıp çift
  erişilebilir kontrol oluşturmasını önler. **Container query kullanıldı** —
  `GlassHeader` §7'deki "containment sticky'i bozar" notunun tersine burada
  güvenli: kök `fixed`, containment `.capsule`'da ve kapsül konumlanmış bir
  öğe değil.
- `condensedAction` DOM'da tek örnek olarak yer değiştirir (display ile gizlenen
  ikinci kopya yok) — çift accessible name önlenir.
- Reduced-motion artık malzemenin görünürlüğü için **motion tarafından**
  karşılanır (`morphTransition` → `{ duration: 0 }`); opacity CSS'ten çıktığı
  için `@media (prefers-reduced-motion: reduce)` bloğu savunma amaçlı duruyor.
  **Blok korunuyor** çünkü kural hâlâ geçerli: `.material`'a bir gün yeniden
  CSS `transition` eklenirse, medya sorgusu tek başına özgüllük katmadığı için
  `transition`'ı bildiren HER seçici (`.material`,
  `.root[data-scrolled] .material`, `.root[data-menu-open] .material`) guard
  içinde de tekrarlanmalıdır; yoksa daha özgül durum kuralı kazanır ve geçiş
  sıfırlanmaz. Bu hata bu bileşende iki kez yakalandı.
- **Bilinçli sapma — malzeme fallback tier'a sabitlenir:** `GlassSurface`'in
  refraction dalı bir *mercek* etkisidir; SVG filtresinin blur'u yalnız
  `0.4 + thickness * 1.2` px olduğu için zemini bozar ama **bulanıklaştırmaz**
  ve altından geçen metin net okunur kalır. `thickness` yükseltmek de çözmez.
  Tier'ın alan eşiği (`REFRACTION_MAX_AREA`, 160.000px²) kapsülü kısa olduğu
  için "küçük yüzey" sayar (condensed'de 880×76 ≈ 67.000px²) — oysa görevi
  büyük yüzey görevidir: altından tüm sayfa akar. Bu yüzden `.material`
  `GlassTierProvider tier="fallback"` ile sarılır ve gerçek gaussian blur'a
  düşer (`2 + thickness * 10` px; `thickness={0.9}` → 11px). Blur tek başına
  yetmediğinden `--material-tint` (62%) ile `--lg-glass` tonu eklenir —
  `.root .material` ata seçicisi `GlassSurface`'in kendi %6'lık zeminini yener.
  Sonuç: yazılar net, arkadaki içerik yumuşak renk lekesi (WCAG 1.4.3 güvence
  altında). Doğrulandı: `blur(11px) saturate(1.8)` + `rgb(255 255 255 / 0.57)`.
- **Bilinçli sapma — panel kendi zeminini taşır:** mobil panel metin taşıyan
  büyük bir yüzeydir; `.panel` kendi `--lg-surface` zeminini + `--lg-radius-media`
  köşesini taşır, yani kapsülün camı içinde duran opak bir karttır. **Not:**
  bu karar malzeme henüz refraction'dayken (hiç blur yokken) alındı. Malzeme
  fallback'e geçtikten sonra panelin opak zemini kontrast için artık *zorunlu
  değil*; korunuyor çünkü kontrastı sayfa içeriğinden bağımsız olarak garanti
  ediyor. Daha "camsı" bir mobil görünüm istenirse bu zemin kaldırılabilir —
  bilinçli bir tasarım tercihi olur, düzeltme değil.
- **DOM'da aksiyon tekrarı:** panel açıkken (`data-menu-open`) `.actions`
  içindeki `utility`/`secondaryAction`/`action` React örnekleri satırdan
  kaldırılmaz — yalnız `display: none` ile gizlenir (dar kapsülde zaten
  gizli, bkz. yukarı). Panelin `.panelActions`'ı bu slotların **ikinci**
  bir örneğini render eder. Erişilebilirlik ağacı temizdir (gizli kopya
  `display: none` ile ağaçtan düşer) ama DOM'da iki örnek bulunur; tüketici
  bu slotlara sabit bir `id` verirse (örn. `apps/web`'de
  `id="shell-account-action"`), o `id` DOM'da tekilliğini kaybeder.
  Tüketiciler bu slotlara verdikleri öğelerin `id`'sine güvenmemeli.

## 8. İçerik

- Link etiketleri 1-3 kelime; 5-6 linkten fazlasında `UzunIcerik` story'sindeki
  gibi sıkışır — bilgi mimarisini sadeleştir.
- `utility` slotuna yalnız tek ikon buton ver; aksiyon yığını yapma.

## 9. Token eşlemesi

| Part | Token |
|---|---|
| kapsül genişliği | `--lg-container-narrow` (rest) |
| kenar boşluğu | `--lg-container-gutter` |
| köşe | `--lg-radius-card` (kapsül) · `--lg-radius-capsule` (link) · `--lg-radius-chip` (panel linki) |
| kontrol yükseklikleri | `--lg-control-sm` (link) · `--lg-control-md` (panel linki) · `--lg-control-lg` (satır) |
| gölge | `--lg-shadow-md`, `GlassSurface`'in `--lg-surface-shadow` kancasına verilir |
| metinler | `--lg-label` / `--lg-label-secondary`; `--lg-text-headline` / `--lg-text-body` |
| çizgiler | `--lg-hairline` |
| boşluklar | `--lg-space-1/2/3/4` |
| focus | `--lg-focus-ring-width` + `--lg-focus-ring-offset` (fallback `2px`) + `--lg-accent` |

**Borç (raw / mikro-geometri):** Token karşılığı olmayan ölçüler kökte yerel
değişkenlerde toplandı: `--capsule-max-scrolled: 55rem` (condensed genişlik —
container ölçeğinde karşılığı yok), `--zone-gap: 18px`, `--actions-gap: 12px`,
`--wordmark-gap: 9px`, `--nav-font: 14px`, `--link-gap: 2px`,
`--link-pad-x: 13px`, `--pill-inset: 3px 1px`,
`--morph-dur: 0.3s`, `--material-tint: 62%` (cam tonunun örtme gücü — token
ölçeğinde karşılığı yok, blur'u tamamlar; `prefers-reduced-transparency`'de
%100'e çıkar), `--hdr-blur` (motion'ın sürdüğü birimsiz blur değeri),
`MATERIAL_BLUR = 11` (TSX; `GlassSurface`'in `2 + thickness * 10` formülünün
`thickness={0.9}` karşılığı — blur animasyona girdiği için açıkça yazılı). Bilinçli bırakılanlar: cam pill reçetesi
`blur(8px) + saturate(150%)` ve `color-mix`'li ışıma (token gölge kalıplarıyla
birebir değil), geçiş easing'i (token yok), `z-index: 30` (z ölçeği yok —
`GlassHeader` ile aynı kademe), container query eşiği `48rem` (bp ölçeği dışı),
`GlassSurface`'in `shape={20}` sayısal API'si (`--lg-radius-card`'ın 20px
değeriyle elle eşlenir — prop CSS değil sayı alır).

Bilinen okunabilirlik borcu: `.actions` seçicisi stylesheet'te iki kez
tanımlı — temel kuralda `display: inline-flex`, hemen altındaki dar-kapsül
varsayılanında `display: none`. Kaskad doğru çalışır (ikinci bildirim
kazanır, `@container` bloğu genişte tekrar `inline-flex`'e döndürür) ama
art arda gelen iki çelişkili `display` bildirimi okurken kafa karıştırıcı;
tek seçicide birleştirilebilirdi, bilinçli olarak ertelendi.

## 10. Storybook kapsamı

Default, Playground, ScrollDurumlari (`Variants/Materials` yerine — varyant
ekseni yok), Durumlar, UzunIcerik, Responsive, Temalar, Erisilebilirlik.
`Sizes`: N/A — `size` ekseni yok. Story zeminleri 220vh olduğu için scroll
morfu canlı denenebilir.

## 11. Test kabul kriterleri

- [x] banner + "Site" navigation landmark
- [x] aktif link `aria-current` + `data-nav-glass` göstergesi
- [x] sade sol tıkta `onClick` + `preventDefault`; modifier'lı tıkta devretmez
- [x] logo/utility/secondaryAction/action slotları render
- [x] links boşken nav + hamburger yok
- [x] scroll eşiği → `data-scrolled` (ileri/geri) ve `scrollThreshold` etkisi
- [x] `condensedAction` üçlünün yerine geçer / verilmezse üçlü korunur
- [x] hamburger `aria-expanded` + `aria-controls`; panel `id`'si
- [x] `data-menu-open` işareti
- [x] Escape kapatır + focus hamburger'a döner
- [x] dış `pointerdown` kapatır, iç kapatmaz
- [x] panelden link seçimi `onClick` + kapatma
- [x] kapsülün daralma morfu (visual, Chromium — 1152px/radius 0 → 880px/radius 20px)
- [x] `.material`'ın opacity ile belirişi (visual, Chromium — rest'te
      `opacity: 0; visibility: hidden`, condensed'te `opacity: 1; visible`)
- [x] reduced-motion'da `.material` geçişi kapanıyor (`transition-property: none`)
- [x] panel tepede açıldığında da malzeme görünür (`data-menu-open`, radius 20px)
- [x] header yüksekliği 76px — `--lg-shell-header-offset` ile birebir

**Çözüldü:** refraction katmanında `.material`'ın zemini
`rgba(255,255,255,0.06)` ve `backdrop-filter` bir SVG kırılma filtresidir —
içeriği bozar ama bulanıklaştırmaz. Küçük kontrollerde doğru davranış; ancak
mobil panel metin taşıyan büyük bir yüzey olduğu için altından geçen sayfa
içeriği net okunup panel metniyle kontrast yarışına giriyordu. Çözüm: `.panel`
artık kendi `--lg-surface` zeminini taşıyor (bkz. §7 "Bilinçli sapma — panel
kendi zeminini taşır"), böylece panel metni her zaman bilinen bir yüzeyin
üstünde okunur.

## 12. Do / Don't

- ✅ `href`'i her zaman ver — orta tık ve SSR gezinmesi korunur.
- ✅ `condensedAction`'ı yalnız gerçekten tek CTA'ya çökmesi gereken sitelerde ver.
- ❌ `action`'a birden çok buton koyma — tek CTA sözleşmesi.
- ❌ Kapsül içine `GlassSurface` koyma — içerik `GlassTierProvider tier="fallback"`
  ile düz katmandadır, cam üstüne cam olur.
- ❌ Paneli modal gibi kullanma (arka planı kilitleme, trap ekleme) — sözleşme §2.

**Bilinen kısıtlar:** `container-type: inline-size` kapsülü `position: fixed`
torunlar için containing block yapar; panel/gösterge `absolute` olduğu için
sorun çıkmaz, ancak kapsül içine `fixed` bir şey konursa viewport'a değil
kapsüle göre konumlanır. `aria-controls`'ın kapalı durumda DOM'da karşılığı
olmayan bir `id`'ye işaret etmesi (§2) de bilinen, bilinçli bir kısıttır.
**Açık kararlar:** arama slotu (v2+) · bildirim
göstergesi (v2+) · megamenü (GlassMenu ile).
