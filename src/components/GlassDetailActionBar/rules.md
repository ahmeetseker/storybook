---
name: GlassDetailActionBar
category: kontroller
status: hazır
lastReviewed: 2026-07-28
---

# GlassDetailActionBar Kuralları

## 1. Amaç

İlan detay sayfasının karar/iletişim eylem grubunu — tek prominent CTA, en
fazla bir ikincil eylem ve sessiz utility'ler (kaydet/paylaş) — **tek cam
yüzeyde** toplar. "Cam üstüne cam yok" kuralı gereği yüzeyi yalnız bu
component açar; içindeki kontroller kendi yüzeylerini üretmez.

- **Kullan:** ilan detay sayfasının karar/iletişim bloğu — masaüstünde dikey
  ray (`layout="rail"`), mobilde alt çubuk (`layout="bar"`); sayfa başına tek
  örnek.
- **Kullanma:** genel form gönderim çubuğu (→ sayfaya özgü form aksiyonları),
  bağımsız tekil aksiyon (→ `GlassButton`), ikon-tek utility grid'i (→
  `GlassIconButton` grubu, kendi yüzeyi gerekmeyen bir bağlamda).

| İlgili | Farkı |
|---|---|
| GlassButton | Kendi cam yüzeyini açan tekil buton; bu component'in içinde **kullanılmaz** — iç içe yüzey üretir |
| GlassIconButton | Kendi cam yüzeyini açan ikon buton; aynı nedenle burada kullanılmaz |
| GlassListingDetailHeader | Sayfanın başlık/fiyat bloğu; eylem taşımaz |

## 2. Semantik sözleşme

- Element: `<section>` (`GlassSurface as="section"`, `shape={20}`,
  `thickness={0.5}`), `role="group"` + zorunlu `aria-label={label}` — grup her
  zaman adlandırılmıştır (`label` prop'u opsiyonel değildir).
- İçindeki tüm eylemler native `<button type="button">` — `GlassButton`/
  `GlassIconButton` **değil**; bu component'in tek `GlassSurface`'i dışında
  başka bir yüzey component'i render edilmez.
- Portal yok. DOM değişmezi: primary → secondary (varsa) → utilities (varsa)
  → note (varsa) sırası; sıralama aynı zamanda görsel önceliği ve klavye
  sekme sırasını belirler.

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| primary | ✅ | `GlassDetailAction` | Sayfadaki tek prominent CTA; accent dolgu, `--lg-control-lg` |
| secondary | — | `GlassDetailAction` | En fazla bir tane; hairline çerçeve, `--lg-control-md` |
| utilities | — | `GlassDetailUtilityAction[]` | Eşit genişlikli (`flex:1`) sessiz butonlar satırı; boşsa render edilmez |
| note | — | string | Eylemlerin altında küçük bağlam notu (ör. yanıt süresi); `bar` düzeninde gizlenir |

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| label | prop | `string` | — (zorunlu) | — | Grubun erişilebilir adı (`aria-label`) |
| primary | prop | `GlassDetailAction` | — (zorunlu) | — | Tek prominent CTA |
| secondary | prop | `GlassDetailAction` | — | — | En fazla bir ikincil eylem |
| utilities | prop | `GlassDetailUtilityAction[]` | — | — | Sessiz, eşit genişlikli eylemler |
| note | prop | `string` | — | — | Eylemlerin altında bağlam notu |
| layout | prop | `'rail' \| 'bar'` | `'rail'` | — | `rail`: dikey ray · `bar`: mobil alt çubuk (safe-area) |
| material | prop | `'glass' \| 'flat'` | `'glass'` | — | Navigasyon/kontrol katmanı için varsayılan cam |
| ...rest | — | `Omit<HTMLAttributes<HTMLElement>, 'children' \| 'role' \| 'aria-label'>` | — | — | `className` birleştirilir; `children` kabul edilmez (kapalı slot modeli) |

`role` ve `aria-label` dışarıdan **geçirilemez** — `Omit` ile tip düzeyinde
props yüzeyinden çıkarılmıştır; bir TS çağrısı bu iki attribute'u geçirmeye
çalışırsa derleme zamanında hata alır. Buna ek olarak JSX'te `{...rest}`
render sırasında sabit `role="group"` + `aria-label={label}`'dan **önce**
spread edilir, bu ikisi ondan **sonra** yazılır — tip kontrolünü atlayan bir
`as`/JS çağrısı `rest` içine bir `aria-label`/`role` sızdırsa bile, sonradan
yazılan sabit değerler onu ezer. Grubun accessible name'i her zaman `label`
prop'undandır.

`GlassDetailAction`: `{ id: string; label: string; onSelect: () => void;
disabled?: boolean }` — `id` yalnız React `key` için, DOM'a yansımaz.
`GlassDetailUtilityAction extends GlassDetailAction`: `{ pressed?: boolean }`
— yalnız utility'lerde anlamlıdır.

Ref hedefi yok. Event sözleşmesi: her eylemin `onSelect`'i yalnız `disabled`
`false`/`undefined` iken tıklama/aktivasyonda çağrılır; `disabled: true`
native `disabled` attribute'una gider, `onClick` hiç tetiklenmez.

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `layout='rail'`, `material='glass'`, `secondary`/
`utilities`/`note` verilmemiş — yalnız `primary`.

| Kural | Davranış |
|---|---|
| `primary` | Zorunlu, tek — sayfadaki tek prominent CTA burada temsil edilir |
| `secondary` | En fazla bir tane (prop tekil obje, dizi değil — API seviyesinde ikinci bir secondary geçirilemez) |
| `utilities` | Sayısı sınırsız ama tasarım gereği 2-3 ile sınırlı tutulmalı; hepsi eşit ağırlıklı (`flex:1`) |
| `layout` | `rail`/`bar` — **yasak kombinasyon:** aynı sayfada aynı anda hem `rail` hem `bar` görünür olamaz (masaüstü/mobil arası tek aktif düzen; ikisi birlikte gösterilirse cam yüzey bütçesi ve karar hiyerarşisi çift sayılır) |
| `material` | `glass` varsayılan (bu component navigasyon/kontrol katmanıdır); `flat` yalnız camın bütçe dışına ittiği yoğun sayfalarda opt-out |

## 6. State modeli

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| disabled | `primary.disabled` / `secondary.disabled` / `utility.disabled` | tıklama/aktivasyon | native `disabled` |
| pressed | `utility.pressed` | — | `aria-pressed` — **yalnız utility'lerde**; primary/secondary'de hiçbir zaman `aria-pressed` yoktur (tek seferlik aksiyonlardır, toggle değildir) |

Katman sırası: availability (`disabled`) → pressed → interaction. `pressed`
component içinde bir state değil, çağırandan gelen bir prop-türetilmiş
görünümdür (kontrollü).

## 7. Davranış

- Keyboard/pointer: tüm butonlar native `<button>` — Enter/Space aktivasyon,
  Tab sırası DOM sırasıyla eşleşir (primary → secondary → utilities).
- Responsive: `layout` prop'u ile açıkça seçilir; component kendi genişliğine
  bakarak otomatik geçiş yapmaz — çağıran sayfa hangi breakpoint'te hangi
  `layout`'u render edeceğine karar verir (`pointer: coarse`/viewport ile).
- Async: yok — tüm `onSelect` çağrıları senkron; loading/pending state
  component'in kapsamı dışındadır (çağıran `disabled` ile kilitler).
- Overlay: yok — portal kullanılmaz, yüzey her zaman doküman akışındadır.

## 8. İçerik kuralları

- `primary.label`/`secondary.label`/`utility.label` kısa eylem fiilleri
  olmalı ("Mesaj gönder", "Randevu iste", "Kaydet"); component metni kırpmaz,
  buton içeriği doğal olarak sarmalanabilir.
- `note` tek satırlık bağlam metni; `layout="bar"` düzeninde CSS ile
  gizlenir (mobil alt çubukta yer kısıtlı, not masaüstü ray'e özgüdür).
- `utilities` boş dizi/undefined ise sarmalayıcı `div` hiç render edilmez.
- Türkçe metinlerde satır kırılması engellenmez; buton `min-height` sabit
  kalır, genişlik büyür.

## 9. Token eşlemesi

| Part | Property | Token |
|---|---|---|
| root | gap | `--lg-space-2` |
| root | padding | `--lg-space-3` |
| primary | background/color | `--lg-accent` / `--lg-accent-contrast` |
| primary | border-radius | `--lg-radius-chip` |
| primary | min-height | `--lg-control-lg` (imleçli 44px / dokunmatik 48px) |
| secondary | border | `--lg-stroke-hairline` `--lg-hairline` |
| secondary | min-height | `--lg-control-md` |
| secondary | border-radius | `--lg-radius-chip` |
| utility | border | `--lg-stroke-hairline` `--lg-hairline` |
| utility | min-height | `--lg-control-md` (imleçli 40px / dokunmatik 44px) |
| utility | font-size | `--lg-text-footnote` |
| note | font-size / color | `--lg-text-footnote` / `--lg-label-secondary` |
| focus ring | outline | `2px solid var(--lg-accent)`, yalnız `:focus-visible` |
| bar padding-bottom | safe-area | `calc(var(--lg-space-3) + env(safe-area-inset-bottom))` |

**Dokunma hedefi (2026-08-03):** Üç kontrol de tam genişlikte (veya `flex: 1`)
olduğu için hedef genişliği zaten yeterli; yükseklik doğrudan kontrol
token'larından gelir ve dokunmatikte 44/48px'e çıkar. Aynı token'ı ikinci kez
yazan `@media (pointer: coarse) { .utility { … } }` bloğu KALDIRILDI. `primary`
fallback'i eski ölçekten kalma `48px`'ten `44px`'e güncellendi
(`--lg-control-lg`'nin imleçli değeri).

**Borç:** yok. Tüm ölçüler `--lg-control-*`/`--lg-space-*`/`--lg-radius-chip`
token'larından (fallback'leriyle birlikte) gelir; raw hex/rgba/px/shadow yok.
Radius yalnız chip ölçeğinden (`--lg-radius-chip`); yüzeyin kendi köşesi
`GlassSurface`'in `shape={20}` (`--lg-radius-card` ile aynı sayısal değer)
prop'undan gelir.

## 10. Storybook kapsamı

Var: Default, Playground (tam public API), Layouts (rail/bar yan yana),
Materials (glass/flat), States (disabled primary, pressed utility),
UzunIcerik (uzun TR eylem metinleri), Responsive (360px + `bar` düzeni,
dokunmatik hedefler), Temalar (toolbar'dan Kağıt/Grafit), Erişilebilirlik
(grup adı + DOM sekme sırası). Eksik yok — matris tam.

## 11. Test kabul kriterleri

- [x] `role="group"` + `label` ile erişilebilir adı taşır (unit)
- [x] her prop kombinasyonunda tam olarak tek `[data-material="glass"]` üretir — çocuk kontroller yüzey açmaz (unit)
- [x] primary tıklandığında `onSelect` bir kez çağrılır (unit/interaction)
- [x] utility `pressed` durumu `aria-pressed` olarak yansır (unit)
- [x] `disabled` eylem tıklansa da `onSelect` çağrılmaz (unit/interaction)
- [x] `note` eylemlerin altında görünür metin olarak render edilir (unit)
- [x] `layout="bar"` kök elementte `data-layout="bar"` üretir (unit)
- [ ] `bar` düzeninde `env(safe-area-inset-bottom)` alt boşluğunun cihazda doğru uygulandığı (visual)
- [ ] Kağıt/Grafit temalarında accent dolgu ve hairline kontrastı (visual)
- [ ] dokunmatik viewport'ta tüm hedeflerin ≥44px olduğu (visual)

## 12. Do / Don't

- ✅ Sayfada tek `GlassDetailActionBar`; masaüstünde `layout="rail"`,
  mobilde `layout="bar"` — ikisini aynı render ağacında aynı anda gösterme.
- ✅ `pressed`'i yalnız gerçek toggle davranışlı utility'lerde kullan (ör.
  "Kaydet" favori durumunu yansıtır); primary/secondary'ye asla geçirme.
- ✅ İçeride yalnız native `<button>`; `GlassButton`/`GlassIconButton`
  import etme — component'in tek cam yüzey garantisini bozar.
- ❌ `secondary`'yi bir dizi olarak modelleme veya iki ayrı prominent eylem
  koyma — API tekil obje kabul eder, "en fazla bir secondary" kuralı tip
  seviyesinde de zorlanır.
- ❌ `layout="rail"` ve `layout="bar"`'ı aynı sayfada aynı anda render etme
  — yasak kombinasyon (bkz. §5).

**Bilinen kısıtlar:** `layout` geçişi component'in kendi genişliğine değil
tamamen çağırana bağlıdır — otomatik container-query tabanlı geçiş yoktur
(bilinçli tercih: rail↔bar geçişi genellikle sayfa şablonu değişimiyle
birlikte gelir, salt genişlik sinyali yeterli değildir). **Açık kararlar:**
`utilities` sayısına üst sınırın component seviyesinde mi (prop tipi) yoksa
yalnızca rules.md kuralı olarak mı (§5) kalacağı.

**Changelog:** 2026-07-28 — ilk sürüm.

## Changelog

- 2026-08-03: Yeni kontrol ölçeğine uyarlandı — gereksizleşen
  `pointer: coarse` utility yüksekliği kaldırıldı, `primary` token
  fallback'i 48px → 44px güncellendi. Birincil CTA imleçli cihazda 48px →
  44px, bar toplam 72px → 68px.
