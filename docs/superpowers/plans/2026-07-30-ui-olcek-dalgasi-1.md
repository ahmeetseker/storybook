# Plan — UI Ölçek Dalgası 1

**Kaynak denetim:** `docs/ui-ux-denetim-2026-07-30.md` (§2.1 P0 ölçek/yoğunluk + §3 ilk maddesi)
**Dal:** `feature/glass-sidebar`
**Amaç:** Kullanıcının "gereğinden fazla büyük padding/boşluk/buton/yazı" şikâyetinin dört yapısal kaynağını kapatmak. Yalnız ölçek; davranış, bilgi mimarisi ve bozuk butonlar bu dalganın dışında.

---

## Global Constraints

Bunlar her task için bağlayıcıdır ve review'ın odak merceğidir.

1. **Token tek kaynak:** `src/index.css`. Tipografi ölçeği `--lg-text-badge` 11 / `-caption` 12 / `-footnote` 13 / `-body` 15 / `-headline` 17 / `-title` 22 / `-display` 28. Spacing `--lg-space-1..10` = 4/8/12/16/20/24/32/40/48/64. Kontrol yükseklikleri `--lg-control-sm/md` 44, `-lg` 48, `-xl` 56. Radius chip 10 / media 14 / card 20 / capsule 999.
2. **Yeni raw px eklenmez.** Mevcut yerel mikro-geometri değişkenleri (`--pad-y` gibi) korunabilir ama **değerleri token'a bağlanır**. Bir değeri token'a bağlarken birebir eşleşme yoksa en yakın ölçek adımına yuvarla ve `rules.md`'ye borç notu yaz.
3. **`--lg-control-*` yalnız etkileşimli kontrol yüksekliğidir.** Etkileşimsiz `<span>`/rozet/dekoratif daireye uygulanmaz; layout ölçüsü olarak kullanılmaz.
4. **Dokunma hedefi 44px yalnız `@media (pointer: coarse)` altında zorunludur.** Fare ortamında görsel ölçü daha kompakt olabilir. Breakpoint yerine yetenek sorgusu (`pointer: coarse` / `hover: hover`) kullanılır.
5. **Davranış değişmez.** Bu dalga yalnız ölçü/tipografi/hizalama düzeltir. Prop imzası, state, event handler, DOM yapısı — dokunulmaz. Tek istisna: Task 3'te `size` prop değeri değişimi (açıkça belirtilmiş).
6. **Doğrulama baseline'ı:** `npm test` şu an **1733 testin 18'i kırık** (hepsi `apps/web/src/features/listing-detail/` altında — `ProjectedListingDetail` 8, `ListingDetailWorkspace` 8, `ListingDetailAccessibility` 2). Bu 18 **önceden kırık**; task'ınız bunları düzeltmez ama **sayıyı artırmamalıdır**. `npx tsc -b` ve `npm run lint` sıfır hata vermelidir.
7. **rules.md güncellenir:** Dokunulan her component'in `rules.md` dosyasındaki ölçü/borç paragrafları değişiklikle tutarlı hale getirilir. Eskiyen borç notu silinir.
8. **Görsel doğrulama zorunlu:** Dev sunucu `http://127.0.0.1:3000` üzerinde çalışıyor (zaten ayakta, yeniden başlatmayın). Playwright ile ilgili rotanın 1440×900 ve 390×844 ekran görüntüsünü alıp önce/sonra karşılaştırın. Playwright'ı proje kökünden `node_modules/@playwright/test/index.js` mutlak yolu ile CommonJS default import olarak çağırın (`import pw from '…'; const { chromium } = pw`).
9. **Commit:** Her task kendi commit'ini atar (Türkçe conventional commit; `feat(...)`/`fix(...)`/`refactor(...)`). Commit mesajı sonuna `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>` eklenir. Push YOK.

---

## Task 1 — GlassHero: ölçek üstü tipografi ve sabit dikey dolgu

**Dosyalar:** `src/components/GlassHero/GlassHero.module.css`, `src/components/GlassHero/rules.md`
**Not:** Bu iki dosya working tree'de zaten değiştirilmiş durumda (commit'lenmemiş). Mevcut değişiklikleri **bozmayın**, üzerine ekleyin.

**Sorun:** Hero başlığı ölçek tavanının %64 üstünde ve 6 sayfada etkin (`/`, 5 konsept sayfası). Dikey dolgu sabit, mobilde küçülmüyor.

**Mevcut değerler (doğrulandı):**
- `GlassHero.module.css:6` → `--pad-y: 56px;`
- `GlassHero.module.css:7` → `--showcase-pad-top: 150px;`
- `GlassHero.module.css:72` → `font-size: clamp(30px, 4.5vw, 46px);` (`.title`, yorumu: "akışkan tip — token ölçeğinde karşılığı yok (borç notu)")
- `:60` `.inner` ve `:115` `.showcaseContent` bu değişkenleri tüketiyor.

**Yapılacak:**
1. `.root`'a yeni bir yerel değişken ekle: `--title-size: clamp(var(--lg-text-title), 3vw, var(--lg-text-display));` — yani 22px→28px arası akışkan.
2. `.title`'ın `font-size`'ını `var(--title-size)` yap. Ölçek dışı `clamp(30px, 4.5vw, 46px)` kaldırılır; satırdaki "token ölçeğinde karşılığı yok" borç yorumu da kaldırılır (artık borç değil).
3. `--pad-y`'yi token'a bağla ve akışkan yap: `clamp(var(--lg-space-5), 2.4vw, var(--lg-space-7))` (20px→32px). Bu kalıp `MapFirstHome.module.css:15`'te zaten var — oradaki yazımla tutarlı olun.
4. `--showcase-pad-top`'u token'a bağla: `var(--lg-space-10)` (64px). 150px ölçekte yok ve showcase varyantının üst boşluğu bu dalganın hedefi.
5. `--title-size` çağıran tarafından ezilebilir olmalı (yerel değişken zaten `.root` üzerinde, ek iş gerekmez) — `rules.md`'ye bu ezme noktasını yaz.
6. `rules.md`'deki §9 borç notunda `--pad-y`, `--showcase-pad-top` ve başlık `clamp`'i ile ilgili satırları güncelle: artık token'a bağlılar, borç listesinden çıkarılırlar.

**Kabul kriterleri:**
- `.title` hesaplanmış `font-size` değeri 1440px'de **28px**, 390px'de **22px** olmalı (Playwright `getComputedStyle` ile doğrulayın).
- `/` ve `/konseptler/guven-merkezi` rotalarında hero yüksekliği belirgin azalmalı; ekran görüntüsü önce/sonra raporda.
- `GlassHero.stories.tsx`'teki 4 varyant (search/split/showcase/centered) Storybook'ta bozulmamalı — story dosyasını okuyup varyantların hâlâ tutarlı olduğunu değerlendirin.
- `npx tsc -b`, `npm run lint`, `npm test` (≤18 kırık).

---

## Task 2 — Kontrol yüksekliği token'ının doğru kullanımı: Chip, Tabs, Button

**Dosyalar:** `src/components/GlassChip/GlassChip.module.css` (+ `rules.md`), `src/components/GlassTabs/GlassTabs.module.css` (+ `rules.md`), `src/components/GlassButton/GlassButton.module.css` (+ `rules.md`)

**Sorun:** Aynı hata iki yönde yapılmış — Chip 12px yazıyla 44px yüksekliğinde (fare ortamında gereksiz şişkin), Tabs ise `min-height` taşımıyor ve ~37px (dokunmatikte hedefin altında). Button'ın `lg`/`xl` ölçüleri ölçek dışı, `xl` font-size'ı bir focus-halkası token'ından türetiliyor.

**Mevcut değerler (doğrulandı):**
- `GlassChip.module.css:29-30` → `.sm { min-height: var(--lg-control-sm); … }` / `.md { min-height: var(--lg-control-md); … }` (ikisi de 44px)
- `GlassTabs.module.css:6` → `--tab-font-size: 14px;`, `:3` → `--root-gap: 14px;`, `:5` → `--tab-pad-inline: 18px;`; `.tab`'da `min-height` yok
- `GlassButton.module.css:58` → `.lg { … padding: 0 calc(var(--lg-space-6) + var(--lg-space-1)); … }` (28px)
- `GlassButton.module.css:59` → `.xl { … padding: 0 calc(var(--lg-space-7) + var(--lg-space-1)); font-size: calc(var(--lg-text-headline) + var(--lg-focus-ring-width)); … }` (36px / 19px)

**Yapılacak:**

**2a — GlassChip:** Görsel yüksekliği ölçeğe indir, 44px'i dokunmatiğe taşı.
- `.sm` / `.md` `min-height` → `var(--lg-space-7)` (32px).
- Dosyada zaten bir `@media (pointer: coarse)` bloğu varsa oraya, yoksa yeni blok açarak: `.sm, .md { min-height: var(--lg-control-md); }`.
- `:2-4` ve `:24-28` aralığındaki uzun yorum, 44px'in neden gerçekten büyütüldüğünü (`::after` denemesinin `overflow: hidden` yüzünden çalışmadığını) anlatıyor. Bu gerekçe **hâlâ geçerli** ama artık yalnız dokunmatik için: yorumu buna göre güncelleyin, silmeyin.
- `--chip-pad-x-sm: 10px` → `var(--lg-space-3)` (12px), `--chip-pad-x-md: 14px` → `var(--lg-space-4)` (16px).

**2b — GlassTabs:** Dokunma hedefini ver, ölçek dışı değerleri bağla.
- `.tab`'a `min-height: var(--lg-control-md);` ekle.
- `--tab-font-size: 14px` → `var(--lg-text-footnote)` (13px).
- `--root-gap: 14px` → `var(--lg-space-3)` (12px).
- `--tab-pad-inline: 18px` → `var(--lg-space-4)` (16px).

**2c — GlassButton:** `lg`/`xl` ölçülerini ölçeğe çek.
- `.lg` padding → `0 var(--lg-space-6)` (24px).
- `.xl` padding → `0 var(--lg-space-7)` (32px).
- `.xl` font-size → `var(--lg-text-headline)` (17px). `--lg-focus-ring-width`'in tipografi hesabında kullanımı token sözleşmesinin doğrudan ihlali; kaldırılır.
- `.sm` padding'indeki `calc(var(--lg-space-3) + var(--lg-stroke-hairline) + var(--lg-stroke-hairline))` (14px) → `0 var(--lg-space-3)` (12px). Çizgi kalınlığı token'ı boşluk olarak kullanılmaz.

**Kabul kriterleri:**
- Chip masaüstünde 32px, `pointer: coarse` emülasyonunda 44px (Playwright `hasTouch: true` context ile doğrulayın).
- Tab her iki ortamda ≥44px.
- Button `xl` font-size **17px**, `lg` yatay padding **24px**, `xl` yatay padding **32px**.
- Bu üç component'i tüketen sayfalar bozulmamalı — en az `/emlak` (chip yoğun) ve `/hesabim` ekran görüntüsü alın.
- `npx tsc -b`, `npm run lint`, `npm test` (≤18 kırık).

---

## Task 3 — İlan ver akışı: giriş kartları, "İlan amacı" seçimi, dekoratif rozetler

**Dosyalar:** `apps/web/src/features/listing-create/ListingCreateWorkspace.module.css`, `apps/web/src/features/listing-create/ListingEntryChoice.tsx`

**Sorun:** Kullanıcının şikâyetini gösterdiği iki ekran görüntüsü tam olarak buradan. Giriş kartı içeriğinin ~1.8 katı yükseklikte; "İlan amacı" seçim kartları ortalanmış, tam sütun genişliğinde ve 56px yüksekliğinde — üstelik **aynı ekrandaki** "Yayınlama yetkisi" kartları sola hizalı ve kompakt, yani sayfa kendi içinde çelişiyor.

**Mevcut değerler (doğrulandı, tümü `ListingCreateWorkspace.module.css`):**
- `:160-166` `.entry` → `min-height: calc(100dvh - var(--lg-space-7)*4)` + `padding-block: calc(var(--lg-space-7)*2)` (64px) + `gap: calc(var(--lg-space-7)*2)` (64px)
- `:195-206` giriş kartı → `min-height: 22rem` (352px), `padding: calc(var(--lg-space-7) + var(--lg-space-2))` (40px)
- `:213-225` ikon rozeti → `width/height: var(--lg-control-xl)` (56px), `margin-bottom: calc(var(--lg-space-7) + var(--lg-space-2))` (40px)
- `:227-239` kart içi → `h2 { margin: var(--lg-space-3) 0; font-size: var(--lg-text-title) }`, `p { margin: 0 0 var(--lg-space-6) }`
- `:748-753` `.segmentChoice` → `align-items: center; justify-content: center; text-align: center;` + `min-height: var(--lg-control-xl)` (56px)
- `:727-731` `.segmentChoices` → `grid-template-columns: repeat(2, minmax(0,1fr))`
- `:286-301` `.demoTag, .requiredNote, .privacyNote` → `min-height: var(--lg-control-sm)` (44px) — etkileşimsiz `<span>`'lar
- `:1049-1062` `.mediaOrder, .coverBadge` → `min-height: var(--lg-control-sm)` (44px) — fotoğraf kartı rozetleri
- `ListingEntryChoice.tsx:126` → `<GlassButton prominent size="lg">`

**Yapılacak:**

**3a — Giriş ekranı dikey şişkinliği:**
- `.entry`'den `min-height` kuralını kaldır.
- `.entry` `padding-block` → `var(--lg-space-7)` (32px).
- `.entry` `gap` → `var(--lg-space-7)` (32px).

**3b — Giriş kartları:**
- Kart `min-height: 22rem` kuralını kaldır (içerik yüksekliği belirlesin).
- Kart `padding` → `var(--lg-space-6)` (24px).
- İkon rozeti `width/height` → `var(--lg-space-8)` (40px); `font-size` → `var(--lg-text-headline)`. **`--lg-control-xl` bir dokunma hedefi token'ıdır, dekoratif rozette kullanılmaz** (Global Constraint 3).
- İkon rozeti `margin-bottom` → `var(--lg-space-4)` (16px).
- Kart `h2` → `margin: 0 0 var(--lg-space-2)`, `font-size: var(--lg-text-headline)`.
- Kart `p` → `margin: 0 0 var(--lg-space-4)`.
- `ListingEntryChoice.tsx:126` → `size="lg"` yerine `size="md"`.

**3c — "İlan amacı" seçim kartları (`.segmentChoice` / `.segmentChoices`):**
- `justify-content: center` ve `text-align: center` kurallarını **kaldır** — içerik sola hizalanır. Referans: aynı dosyadaki `.roleChoice` (yayınlama yetkisi kartları) doğru davranışı gösteriyor; ona hizalayın.
- `align-items: center` → `flex-start` (yine `.roleChoice` deseni).
- `min-height` → `var(--lg-control-md)` (44px).
- `.segmentChoices` `grid-template-columns` → `repeat(auto-fit, minmax(11rem, max-content))` — kartlar içeriğe göre daralır, tüm sütunu kaplamaz.
- `.segmentChoice input`'un `margin-block-start`'ı ortalama kaldırılınca radio'yu metnin optik merkezinden kaydırıyorsa düzeltin (`.roleChoice input` ile aynı davranış).

**3d — Dekoratif rozetlerden kontrol token'ını sök:**
- `.demoTag, .requiredNote, .privacyNote` → `min-height: 0`; `padding: var(--lg-space-1) var(--lg-space-3)`; `font-size: var(--lg-text-badge)`.
- `.mediaOrder, .coverBadge` → `min-height: 0`; `padding: var(--lg-space-1) var(--lg-space-2)`; `font-size: var(--lg-text-badge)`.
- Bu beş seçicinin hiçbiri etkileşimli değil — doğrulayın (`ListingCreateWorkspace.tsx`, `MediaStudioStep.tsx`, `PropertyStep.tsx` içinde `<span>`/`<p>` olarak render ediliyorlar). Etkileşimli olan çıkarsa **dokunmayın** ve raporda belirtin.

**Kabul kriterleri:**
- Giriş kartı yüksekliği 352px'ten belirgin şekilde inmeli (hedef ~230px); Playwright ile `/ilan-ver` üzerinde ölçün.
- `/ilan-ver` adım 1'de ("Bilgileri kendim gireceğim" → Mülk bilgileri) "İlan amacı" kartları **sola hizalı** ve "Yayınlama yetkisi" kartlarıyla aynı hizalama dilinde olmalı. Ekran görüntüsü zorunlu (koyu tema tercih edilir — kullanıcının şikâyet ettiği görünüm bu).
- `apps/web/src/features/listing-create/` altındaki mevcut testler geçmeli (`ListingEntryChoice.test.tsx`, `PropertyLocationSteps.test.tsx`, `ListingCreateWorkspace.test.tsx` dahil).
- `npx tsc -b`, `npm run lint`, `npm test` (≤18 kırık).

---

## Task 4 — `--lg-text-display` enflasyonunu geri al

**Dosyalar:** `apps/web/src/features/` altında **yalnız** şu CSS dosyaları:
`account/AccountWorkspace.module.css`, `advisor/AdvisorWorkspace.module.css`, `advisor/components/AdvisorPanels.module.css`, `listings/EmlakSearchView.module.css`, `messages/MessagesWorkspace.module.css`, `offices/OfficeDirectoryView.module.css`, `regions/RegionDirectoryView.module.css`, `comparison/ComparisonWorkbench.module.css`, `favorites/FavoritesWorkspace.module.css`

**Kapsam dışı (dokunmayın):** `home-concepts/**` (hero ölçeği Task 1'in konusu), `listing-create/**` (Task 3), `listing-detail/**` (18 kırık test orada, ayrı karar bekliyor), `src/components/**`.

**Sorun:** `--lg-text-display` (28px) ölçeğin tepesi ve marka/hero ölçüsü. Şu an 8 ayrı sayfanın `h1`'inde ve metrik rakamlarında kullanılıyor. Her sayfa kendini hero gibi sunuyor; bilgi yoğunluğu düşüyor.

**Yapılacak — kural tabanlı, mekanik:**
1. Yukarıdaki dosyalarda `font-size: var(--lg-text-display)` kullanan **her** kuralı bul (`grep -n` ile listeleyin, raporda tam listeyi verin).
2. Her biri için:
   - Sayfa `h1`'i ise → `var(--lg-text-title)` (22px).
   - Bölüm `h2`'si ise → `var(--lg-text-headline)` (17px).
   - Metrik/skor rakamı ise (ör. `.metrics strong`, `.scoreRow strong`, `.signalCard .score`) → `var(--lg-text-title)` (22px) **ve** `font-variant-numeric: tabular-nums` ekleyin (rakamlar hizalansın).
3. `AccountWorkspace.module.css`'te ek olarak: bölüm başlıkları (`h2`) şu an 22px — `var(--lg-text-headline)` (17px) yapın. Altı bölüm başlığının aynı anda 22px olması sayfayı ağırlaştırıyor.
4. `min-inline-size`/`max-inline-size` gibi ölçü kuralları başlık küçüldüğü için orantısız kalıyorsa (ör. `max-inline-size: 38rem` bir 22px başlıkta çok geniş), `var(--lg-measure)` kullanın.

**Yapmayın:** başlık metnini, DOM etiketini (`h1`→`h2` gibi), sınıf adını veya başka hiçbir CSS özelliğini değiştirmeyin. Yalnız `font-size` (+ gerekiyorsa `font-variant-numeric` / `max-inline-size`).

**Kabul kriterleri:**
- Etkilenen dokuz dosyada `--lg-text-display` kullanımı **sıfır** olmalı (grep ile kanıtlayın).
- `/hesabim`, `/karsilastir`, `/favoriler`, `/emlak` rotalarında 1440 ve 390 ekran görüntüsü; her sayfada ilk ekranda daha fazla içerik görünmeli.
- Başlık hiyerarşisi hâlâ okunur olmalı: sayfa başlığı > bölüm başlığı > gövde ayrımı korunmalı.
- `npx tsc -b`, `npm run lint`, `npm test` (≤18 kırık).

---

## Dalga dışı — bilinçli olarak ertelendi

Bu plan **yalnız ölçek** düzeltir. Denetim raporundaki şu kalemler sonraki dalgalara bırakıldı ve bu dalgada **çözülmeyecek**:

- Yerleşim çakışmaları (çift gutter, iç içe `.section`, dock offset, yapışan raylar) → Dalga 2
- Bozuk davranış (18 kırık test, ölü butonlar, yanlış etiketli buton, `/blog` placeholder, mobil klavye) → Dalga 3
- Sistemik borç (`prefers-reduced-transparency`, focus token turu, bayat fallback'ler, 14px kararı) → Dalga 4
