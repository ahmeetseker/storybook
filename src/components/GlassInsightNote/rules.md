---
name: GlassInsightNote
category: içerik
status: hazır
lastReviewed: 2026-07-17
---

# GlassInsightNote Kuralları

## 1. Amaç

Bir emlak danışmanının/uzmanın ilanı yerinde inceledikten sonra bıraktığı
kısa, insan yazımı değerlendirme notu (Redfin "Tour Insights" karşılığı).
Ad/rol/tarih + serbest metin + opsiyonel "Yerinde inceledi" doğrulama
rozetini sunar. AI-first component DEĞİLDİR — içerik daima adı geçen gerçek
kişiye (danışman/ajan) aittir, "✦ AI" rozeti/`confidence`/`onFeedback`/
`loading` sözleşmesi (bkz. Dalga kontratı §"AI-first standardı") burada
uygulanmaz çünkü kaynağı yapay zekâ değildir (bkz. §12 Do/Don't).

- **Kullan:** ilan detay sayfasında bağımsız "Uzman İçgörüsü" kartı
  (`quote`), tur/ziyaret geçmişi akışında art arda sıralanan kompakt notlar
  (`inline`).
- **Kullanma:** kullanıcı yorumu/puanlama (→ `GlassReviewCard`, yıldız +
  "Faydalı" aksiyonu taşır, bu component taşımaz), yapay zekâ çıktısı özet
  (→ `GlassMatchScore`/AI-first component'ler, "✦ AI" rozeti zorunlu),
  sohbet mesajı akışı (→ `GlassChatDock`).

| İlgili | Farkı |
|---|---|
| GlassReviewCard | Yıldız puanı + "Faydalı" geri bildirim taşır; InsightNote puansız, tek doğrulama rozeti (Yerinde inceledi) taşır |
| GlassMatchScore | AI-first component (zorunlu "✦ AI" rozeti); InsightNote insan yazımı, AI rozeti YOK |
| GlassAvatar | InsightNote'un avatar sarmalayıcısı `aria-hidden` — kendi accessible name'ini üstlenmez, bkz. §2 |

## 2. Semantik sözleşme

- Kök: `<article>` — bağımsız, adı geçen bir kişiye atfedilen kendi başına
  anlamlı bir içerik birimi (`GlassReviewCard` ile aynı karar; `inline`
  varyantında da `<article>` korunur, çağıran onu bir `<ul><li>`/akış içine
  yerleştirebilir).
- Avatar: `<span aria-hidden="true">` sarmalayıcı içinde `GlassAvatar`.
  `GlassAvatar`'a `name={author}` geçilir (baş harf fallback'i buna bağlı)
  ama `src` verilmediğinde `GlassAvatar` kendi baş harf düğümünü
  `role="img"` + `aria-label={author}` olarak render eder — sarmalayıcı
  `aria-hidden` OLMASAYDI, başlıktaki görünür "Elif Kaya" metniyle birlikte
  erişilebilirlik ağacında ikinci bir "Elif Kaya" duyurusu üretirdi
  (`GlassReviewCard` dersi, birebir aynı desen).
- `authorRole` yalnız görünür metin — ayrı bir ARIA gerekmez, zaten
  okunabilir düz içerik (isimden sonra doğal okuma sırasında gelir). Prop
  adı bilinçli olarak native `role` HTML özniteliğinden farklıdır: `role`
  öznitelik olarak `HTMLAttributes<HTMLElement>`'ten `...rest` ile gelir ve
  kök `<article>`e doğrudan geçer (ör. çağıran `role="note"` verebilir) —
  görünür uzman etiketiyle (`authorRole`) hiçbir zaman çakışmaz/yutulmaz
  (bkz. Codex denetimi §Önemli, dalga4).
- "Yerinde inceledi" rozeti: gerçek görünür metin (yalnız ikon/renk değil)
  — durum bilgisi ekranokuyucuya normal metin akışıyla ulaşır, ek
  `aria-label` gerekmez (`GlassMatchScore`'un rozetindeki `aria-label`
  ihtiyacından farklı: oradaki "✦ AI" sembolü tek başına açıklayıcı değil,
  buradaki "Yerinde inceledi" zaten tam cümle).
- `date` biçimlendirilmiş düz metin olarak geçilir — component tarih
  ayrıştırmaz/formatlamaz (`GlassReviewCard` ile aynı karar).
- Özel bir ARIA rolü (meter/tablist/radiogroup/status) ÜSTLENİLMEZ —
  component tamamen statik/prop güdümlü düz içerik, klavye deseni/roving
  tabindex gerektiren bir widget değildir.
- Portal yok, ref forwarding yok, dahili state yok (statik sunum kararı).

## 3. Anatomy ve slotlar

| Slot | Zorunlu | İçerik | Kurallar |
|---|---|---|---|
| avatar | ✅ | `GlassAvatar` (`quote`: `md`, `inline`: `xs`) | Sarmalayıcı `aria-hidden` |
| ad | ✅ | `author` | Accessible içerik kaynağı |
| rol | — | `authorRole` | Verilmezse hiç render edilmez; native `role` özniteliğiyle karıştırılmaz |
| tarih | ✅ | `date` | Düz metin, `tabular-nums` |
| doğrulama rozeti | — | "Yerinde inceledi" | Yalnız `verified=true` |
| metin | ✅ | `text` | `quote`: tam metin sarar; `inline`: 2 satır clamp |

Children kabul edilmez — tamamen prop güdümlü.

## 4. Public API

| Ad | Tür | Type | Default | Controlled | Açıklama |
|---|---|---|---|---|---|
| author | prop | `string` | — (zorunlu) | — | Başlık + avatar baş harfi kaynağı |
| authorRole | prop | `string` | — | — | Ör. "Bölge Danışmanı"; verilmezse render edilmez. Native `role` özniteliğinden AYRI — ARIA rolü değildir, yalnız görünür etiket |
| avatarSrc | prop | `string` | — | — | `GlassAvatar`'a geçilir; yüklenemezse baş harfe düşer |
| date | prop | `string` | — (zorunlu) | — | Hazır biçimlendirilmiş metin, ayrıştırılmaz |
| text | prop | `string` | — (zorunlu) | — | İçgörü metni |
| verified | prop | `boolean` | `false` | — | "Yerinde inceledi" rozetini açar |
| variant | prop | `'quote' \| 'inline'` | `'quote'` | — | `inline` kendi kart zemini taşımaz |
| ...rest | — | `HTMLAttributes<HTMLElement>` (`children` hariç) | — | — | `className`/`style`/`data-*`/native `role` birleştirilir/iletilir — `role` kök `<article>`e doğrudan geçer |

Ref hedefi yok. Callback/event yok — component tamamen sunum amaçlı, kendi
state'ini tutmaz (`GlassMatchScore`/`GlassReviewCard`'ın aksine geri
bildirim/aksiyon API'si taşımaz — spec'te istenmedi, bkz. §12).

## 5. Seçenek eksenleri

Varsayılan kombinasyon: `variant='quote'`, `verified=false`.

| Eksen | Durum |
|---|---|
| `material` | N/A — flat içerik yüzeyi, cam eksen yok |
| `tone` | N/A — bu component'te ayrı bir `tone` prop'u yok, tek görünür renk `--lg-accent` (sol çizgi) + `--lg-success` (rozet) sabit |
| `size` | N/A — spec'te istenmedi; avatar boyutu yalnız `variant`'a bağlı türetilir (md/xs) |
| `thickness`/`prominent` | N/A — cam olmayan component |

| Yasak / türetilen | Davranış |
|---|---|
| `inline` + uzun `authorRole`/`author` | Ellipsis ile kısaltılır (dar tek satır korunur), tam metin `title` YOK (spec'te istenmedi — açık karar, bkz. §12) |
| `verified` olmayan varsayılan | Rozet hiç render edilmez (koşullu render, boş/gizli element bırakılmaz) |
| `authorRole` verilmemesi | Başlık satırında yalnız `author` kalır, boşluk/ayraç artığı bırakılmaz |

## 6. State modeli

Component'in dahili state'i yoktur — tamamen prop'lardan türeyen saf
render. Katman sırası: `variant` (avatar boyutu + metin clamp + kart
zemini) → `authorRole`/`verified` (koşullu slotlar) → render.

| State | Kaynak | Bastırdığı | ARIA |
|---|---|---|---|
| avatar boyutu | `variant` (`quote`→`md`, `inline`→`xs`) | — | — |
| rol satırı | `authorRole` prop varlığı | — | — |
| doğrulama rozeti | `verified` prop | — | görünür metin |
| disabled/hover/focus/active | — | — | N/A — hiç etkileşimli element yok, hover/focus/active PROP DEĞİL zaten uygulanamaz |

## 7. Davranış

- Statik sunum — pointer/touch/klavye etkileşimi, odak yönetimi, async
  durum yok. Tab sırasına giren hiçbir element yok (buton/link/kontrol
  render edilmez).
- Sayı girdisi/normalize edilecek koordinat yok (`author`/`authorRole`/`date`/
  `text` serbest metin, `verified` boolean) — clamp/guard gerektiren bir
  prop bulunmuyor.
- `escape`/IME/document-scoped dinleyici N/A — component hiçbir olay
  dinleyicisi kaydetmez.
- Responsive: `quote` konteynerin genişliğine uyar (`nameRow`/`metaRow`
  `flex-wrap`), `text` `overflow-wrap: anywhere` ile sarar. `inline` satır
  içi (`flex` row) — `author`/`authorRole` dar alanda `text-overflow: ellipsis`
  ile kısalır, `text` her koşulda 2 satırda `-webkit-line-clamp` ile
  kırpılır. Dokunmatik hedef yok (etkileşimli element bulunmadığından
  `pointer: coarse` 44px kuralı uygulanmaz — bkz. §12 açık karar).

## 8. İçerik kuralları

- `author` kısa/gerçekçi tam ad; çok uzun adlarda `quote`'ta
  `overflow-wrap: anywhere` ile sarar, `inline`'da `text-overflow:
  ellipsis` ile kısalır (bkz. UzunIcerik story).
- `authorRole` kısa tutulmalı ("Bölge Danışmanı", "Kıdemli Danışman") — `inline`
  dar satırda `white-space: nowrap` + `ellipsis`.
- `text` serbest uzunlukta; `quote` tamamını gösterir (`white-space:
  pre-line` ile satır sonlarını korur), `inline` her zaman 2 satıra
  kırpılır (tam metin başka bir yerde — ör. tıklanabilir bir bağlantı
  hedefinde — gösterilmelidir; component kendi "devamını gör" aksiyonu
  taşımaz, spec'te istenmedi).
- "Yerinde inceledi" metni sabit — çağıran tarafından özelleştirilemez
  (component'in tek doğrulama anlatımı budur).

## 9. Token eşlemesi

| Part | Property | Token | State override |
|---|---|---|---|
| kart zemini (`quote`) | background/border/radius | `--lg-surface`/`--lg-hairline`/`--lg-radius-card` | yalnız `quote` |
| sol accent çizgi (`quote`) | border-left-color | `--lg-accent` | yalnız `quote` |
| ad | color | `--lg-label` | — |
| rol/tarih/inline başlık | color | `--lg-label-secondary` | — |
| rozet zemin | background | `color-mix(in srgb, var(--lg-success) 14%, transparent)` | `verified` |
| rozet metin | color | `--lg-label` (success DEĞİL — kontrast dersi, bkz. §2) | `verified` |
| rozet ikon | color | `--lg-success` | `verified` |
| metin gövdesi | color | `--lg-label` (`quote`) / `--lg-label-secondary` yok, `--lg-label` (`inline` de aynı) | — |

**Borç (raw):** sol accent çizgi kalınlığı 3px, rozet ikon boyutu 13x13px +
`strokeWidth 1.8`, rozet ikon-metin arası `gap: 4px` — `GlassReviewCard`
"Doğrulanmış görüşme" rozetiyle aynı gerekçe/aynı raw değerler (tasarım
sistemi ölçeğinde tanımlı değil, component ailesi içinde tutarlı).

## 10. Storybook kapsamı

Var: Default, Playground, Variants (`quote`/`inline`), Durumlar
(`verified` var/yok, `authorRole` var/yok), UzunIcerik, Responsive,
Erişilebilirlik (docs description'lı).

`Sizes` ayrı story olarak yok: `size` ekseni tanımlı değil (avatar boyutu
yalnız `variant`'a bağlı iki sabit değer). `Temalar` ayrı story olarak yok:
tema toolbar'la otomatik doğrulanır (`GlassMatchScore`/`GlassReviewCard`
ile aynı karar).

## 11. Test kabul kriterleri

- [x] `author`/`date`/`text` görünür metin olarak render edilir
- [x] `authorRole` verilirse görünür, verilmezse hiç render edilmez
- [x] `verified=true` iken "Yerinde inceledi" rozeti görünür; `false`/
      varsayılanda görünmez
- [x] varsayılan `variant='quote'`, `data-variant="quote"` taşır
- [x] `variant="inline"` iken `data-variant="inline"` taşır
- [x] kök element `<article>`dir
- [x] `avatarSrc` verildiğinde `GlassAvatar` görseli doğru `src` ile render edilir
- [x] avatar sarmalayıcısı `aria-hidden` olduğundan `author` erişilebilirlik ağacında yalnız bir kez duyurulur (çift ad yok)
- [x] `className` birleştirilir
- [x] `...rest` (ör. `data-testid`) kök elemente iletilir
- [x] native `role` özniteliği `...rest` üzerinden kök `<article>`e ulaşır ve
      `authorRole` ile çakışmaz — ikisi bağımsız çalışır (regresyon testi,
      Codex denetimi §Önemli, dalga4)
- [ ] reduced-motion — N/A, component hiçbir animasyon/transition içermiyor (statik içerik)

## 12. Do / Don't

- ✅ `text`'i yalnız adı geçen gerçek kişinin (danışman/uzman) kendi
  yazdığı/onayladığı içerikle doldur — insan yazımı olduğu için `author`/
  `authorRole` daima gerçek bir kişiye atfedilmelidir.
- ✅ `verified`'ı yalnız uzman ilanı GERÇEKTEN yerinde incelediyse `true`
  yap — rozet bir doğrulama iddiasıdır.
- ✅ `inline`'ı yalnız zaten çerçeveli bir liste/akış içinde kullan (kendi
  zemini yok, `GlassMatchScore.compact`/`GlassScoreMeter.badge` ile aynı
  karar).
- ❌ "✦ AI" rozeti/`confidence`/`onFeedback`/`loading` ekleme — bu
  component AI-first sözleşmesi taşımaz, içerik daima insan yazımıdır
  (Dalga kontratının AI-first standardı yalnız `aiGenerated` içerikte
  zorunludur; burada kaynak insan olduğundan uygulanmaz).
- ❌ Cam yüzey/backdrop-filter ekleme — içerik katmanı kuralı.
- ❌ Rozet METNİNİ `--lg-success` rengiyle boyama — küçük punto + soluk
  zemin üstünde WCAG AA kontrastını düşürür (bkz. §9, `GlassReviewCard`
  dersi); yalnız ikon success renginde kalır.

**Açık kararlar:** `inline`'da kırpılan `text`'in tam halini gösterecek bir
"devamını gör" aksiyonu/`title` tooltip'i eklenip eklenmeyeceği (spec'te
istenmedi, şu an tamamen çağırana bırakıldı) · birden çok içgörü notunun
zaman çizelgesi/akış halinde gruplanması (ayrı bir kapsayıcı component
ihtiyacı, bu component tek bir notu temsil eder) · `date`'in `Intl`
ile otomatik biçimlendirilmesi (şu an component ayrıştırmaz, `GlassReviewCard`
ile aynı karar — çağıran hazır metin geçer).

## Changelog

- 2026-07-17: `role` prop'u `authorRole` olarak yeniden adlandırıldı — eski
  `role: string` prop'u native `role` HTML özniteliğiyle aynı isme sahip
  olduğundan `HTMLAttributes<HTMLElement>`'ten gelen `role`'ü destructure
  sırasında yutuyor, çağıranın `role="note"` gibi bir ARIA rolü kök
  elemente hiç ulaşmadan görünür bir "note" etiketine dönüşme riski
  taşıyordu (Codex denetimi, dalga4 §Önemli). `authorRole` artık yalnız
  görünür uzman etiketi, native `role` `...rest` üzerinden serbestçe geçer.
  Regresyon testi eklendi (native `role` + `authorRole` birlikte, çakışmaz).
- 2026-07-17: İlk sürüm — `quote` (sol accent çizgili bağımsız kart) ve
  `inline` (kendi zemini olmayan kompakt tek satır + 2 satır metin clamp)
  varyantları, `GlassAvatar` entegrasyonu (aria-hidden sarmalayıcı), "Yerinde
  inceledi" doğrulama rozeti (success zemin + ikon, kontrast için `--lg-label`
  metin).
