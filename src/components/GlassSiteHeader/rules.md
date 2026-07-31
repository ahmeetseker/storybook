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

- **Rest:** kapsül `--lg-container-narrow` genişliğinde, şeffaf, köşesiz. Cam
  yüzey maliyeti **0** (`.material` `visibility: hidden`).
- **Condensed:** kapsül `55rem`'e daralır, `--lg-radius-card` köşelenir,
  `.material` opacity ile belirir. Cam yüzey **1**.
- Genişlik/radius değişimi **motion layout (FLIP)** ile transform'a çevrilir.
  CSS `max-width` transition'ı bilinçli olarak YOK — layout tetiklerdi
  (`ErisilebilirlikMotionResponsive.mdx`).
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
- Reduced-motion korumasında geçiş (`transition`) üç seçicide ayrı ayrı
  sıfırlanır: `.material`, `.root[data-scrolled] .material`,
  `.root[data-menu-open] .material`. Medya sorgusu tek başına özgüllük
  (specificity) katmaz; `transition`'ı yeniden bildiren her seçici, guard
  içinde de aynı özgüllükte tekrarlanmazsa scrolled/menu-open durumundaki
  daha özgül kural kazanır ve geçiş sıfırlanmaz — bu yüzden üçü de listede.

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
`--morph-dur: 0.3s`. Bilinçli bırakılanlar: cam pill reçetesi
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

**Bilinen görsel kısıt (açık):** refraction katmanında `.material`'ın zemini
`rgba(255,255,255,0.06)` ve `backdrop-filter` bir SVG kırılma filtresidir —
içeriği bozar ama bulanıklaştırmaz. Küçük kontrollerde doğru davranış; ancak
mobil panel metin taşıyan büyük bir yüzey olduğu için altından geçen sayfa
içeriği net okunur ve panel metniyle kontrast yarışına girer. Boş/sakin zeminde
sorun görünmez. Çözüm bir tasarım kararıdır (scrim eklemek, `thickness`
yükseltmek ya da paneli `GlassTierProvider tier="fallback"` ile düz blur'a
indirmek) ve bu planın kapsamı dışında bırakıldı.

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
