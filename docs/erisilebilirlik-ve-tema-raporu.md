# Erişilebilirlik ve Tema Raporu

**Tarih:** 2026-08-04 · **Kapsam:** `src/` (liquid-glass-ui) + `apps/web` (pazar yeri)
**Gereksinim:** (1) frontpage'lerde dark mode yok — opsiyonel bile değil, (2) WCAG 2.2 AAA + a11y ayarları profil altında etkin.

Bu rapor bir uygulama planı değil, **karar raporudur**. Her bölümün sonunda kararı bekleyen noktalar işaretlidir.

---

## 0. Özet

| Alan | Durum |
|---|---|
| Dark mode | Frontpage'de **aktif olarak sunuluyor** — hem OS otomatiği hem header'da tema butonu |
| WCAG 2.2 AAA | Düz zeminlerde geçiyor; **scrim'li medya katmanında ve kontrol sınırlarında bloklayıcı ihlaller var** |
| A11y kullanıcı ayarı | **Hiç yok.** Tüm a11y sinyalleri yalnız OS medya sorgusundan geliyor |
| A11y otomatik denetim | Kurulu ama **AAA kural seti hiç koşmuyor** ve orta/düşük ihlaller sessizce düşüyor |

Sistemin AAA niyeti gerçek: `src/index.css` yorumları doğrudan 1.4.6/2.5.5/1.4.8'e atıf yapıyor ve `--lg-glass` opaklığı 0.92'de matematiksel olarak savunulmuş. Açık, niyetin uygulanmadığı üç yerde: **scrim, hairline, imleçli cihaz hedef boyutu**.

---

## 1. Dark mode — mevcut durum

Frontpage'de dark mode'a iki ayrı yoldan giriliyor:

| Yol | Konum | Etki |
|---|---|---|
| **OS otomatiği** | `src/index.css:158-183` — `@media (prefers-color-scheme: dark)` altında 18 token override'ı | Cihazı koyu olan her ziyaretçi frontpage'i koyu görüyor, hiçbir şeye tıklamadan |
| **Kullanıcı butonu** | `apps/web/src/components/MarketplaceShell.tsx:13-22, 41-68, 90-98` | Header'da `system → light → dark` döngüsü, `localStorage['arsam-theme']` |

Destek noktaları:

- `src/index.css:7` — `color-scheme: light dark` (native `<select>`, scrollbar, `input` render'ı)
- `apps/web/src/styles/app.css:26-40` — `html[data-theme='dark']` token seti
- `src/components/GlassMap/GlassMap.module.css:314-323` — koyu temada harita tile filtresi
- `apps/web/src/features/listing-create/ListingCreateWorkspace.module.css:1197-1209` — Leaflet tile filtresi
- `apps/web/src/features/account/AccountAppShell.tsx:34-77` — tema mantığının **ikinci, birebir kopyası**
- `.storybook/preview.tsx:22-32` + `.storybook/DemoBackground.tsx:7-42` — toolbar tema seçici

Bağlayıcı doküman kuralları da dark mode'u şart koşuyor — kod değişirse bunlar da değişmeli:

- `src/design/GenelBakis.mdx:32-36` — "Açık tema **Kağıt**, koyu tema **Grafit**. Tema `prefers-color-scheme` ve Storybook toolbar'ından gelir."
- `src/design/Tokenlar.mdx:10-26` — Kağıt/Grafit hex tablosu · `:114-116` — "koyu temada token'lar otomatik koyulaşır"
- `AGENTS.md:9`, `CLAUDE.md:9` — "tema (Kağıt/Grafit)"
- `src/components/GlassSiteHeader/rules.md:257`, `apps/web/src/features/account/rules.md:54-56` — zorunlu tema story'si / tema anahtarının yeri

### Yan bulgu: Storybook'taki koyu tema üründekiyle aynı değil

`.storybook/DemoBackground.tsx` dark değerleri `src/index.css:158-183` ile uyuşmuyor:

| Token | Storybook | Ürün |
|---|---|---|
| `--lg-accent` | `#e09143` | `#e9b179` |
| `--lg-danger` | `#ff6961` | `#ffa49e` |
| `--lg-label-secondary` | `#9d9da4` | `#bcbcc1` |

Yani Storybook'ta koyu temada doğrulanan kontrast, üründekini hiç temsil etmiyordu. Dark mode'un kaldırılması bu sessiz tutarsızlığı da yok eder.

### KARAR 1 — kaldırma kapsamı

> **UYGULANDI (2026-08-04): Seçenek A — tam kaldırma.** Aşağıdaki iki seçenek
> karar anındaki durumu belgeler; A seçildi ve uygulandı. Bu bölümün geri kalanı
> ve §1'deki "mevcut durum" tabloları artık **tarihsel kayıttır**, kodun bugünkü
> hali değil. Tek tema (Kağıt) kuralının bağlayıcı kaynağı
> `src/design/GenelBakis.mdx` §Tema'dır.

`src/index.css` paylaşılan kütüphane paketidir; hem Storybook hem `apps/web` aynı dosyayı yükler (`.storybook/preview.tsx:6`, `apps/web/src/routes/__root.tsx:12`). Dolayısıyla "sadece frontpage'de kaldır" teknik olarak ücretsiz değil:

**A) Tam kaldırma (önerilen).** `prefers-color-scheme: dark` bloğu, `html[data-theme='dark']` seti, `color-scheme` → `light`, iki tema switcher'ı, harita filtreleri ve Storybook `dark` arka planı tamamen gider. Tasarım dokümanları tek temalı (Kağıt) olarak güncellenir.
*Gerekçe:* "opsiyonel bile olmayacak" ifadesi ile tutarlı; token seti tekilleşir, AAA doğrulaması tek renk uzayında yapılır (iş yükü yarıya iner); Storybook/ürün drift'i ortadan kalkar.

**B) Sadece public rotalarda kilitleme.** Public kabuk `<html data-theme="light">` yazar, hesap alanı koyu kalabilir. *Maliyet:* `prefers-color-scheme` bloğu kalır, `data-theme` katmanı kalır, AAA doğrulaması iki renk uzayında yapılır, tema kopyası iki dosyada sürer. Ayrıca kullanıcı hesaptan koyuya alıp public sayfaya geçtiğinde tema zıplar.

> **Not:** B seçilse bile `src/index.css:158-183` bloğunun *kendisi* kalırsa, `data-theme` yazımı hidrasyon sonrasında olduğu için OS'i koyu olan kullanıcı frontpage'in ilk karesini koyu görür. B, ancak public kabukta `<head>` içinde blocking script ile birlikte gerçekten çalışır.

### Kırılacaklar (her iki seçenekte de)

| Ne | Konum |
|---|---|
| Birim testi | `apps/web/src/components/MarketplaceShell.test.tsx:52-58` (localStorage mock), `:127` (`'Tema: system'` butonu) |
| Story matrisi | `AccountWorkspace.stories.tsx:171-181`, `AdvisorWorkspace.stories.tsx:178-193`, `MessagesWorkspace.stories.tsx:681-692`, `ListingCreateWorkspace.stories.tsx:282-290`, `GlassSiteHeader.stories.tsx:114-115` — ve bunları zorunlu kılan 4 `rules.md` |
| E2E | `apps/web/e2e/home-concepts.spec.ts:373-376, 452-454` — `localStorage.setItem('arsam-theme','dark')` ile koyu temada axe kontrast doğrulaması |
| Ölü kontrol riski | `AccountAppShell.tsx:140` `<ThemeToggle />` — A seçilirse silinmeli; bırakılırsa "butonu var, etkisi yok" durumu oluşur ki bu başlı başına bir a11y hatası |

---

## 2. WCAG 2.2 AAA — boşluk analizi

### 2.1 Geçenler (düz zemin)

| Çift | Ölçüm |
|---|---|
| `--lg-label #24211b` / `--lg-surface #ffffff` | **16.05:1** |
| `--lg-label-secondary #4f4b45` / `--lg-bg #faf8f4` | **8.16:1** |
| `--lg-accent #7c3806` / `--lg-surface` | **8.66:1** |
| `--lg-danger/warning/success` / kendi %12 tint'i | **7.07 / 7.19 / 7.11:1** |
| `--lg-glass` (0.92) + secondary, altında düz siyah foto | **7.24:1** |

`--lg-glass` opaklığının 0.92 seçilmesi doğru bir karar: en kötü zeminde bile AAA'yı tutuyor.

### 2.2 Bloklayıcı ihlaller

| # | Kriter | Sorun | Ölçüm | Konum |
|---|---|---|---|---|
| 1 | **1.4.6** | Hero başlığı gradyan scrim üstünde; gradyan tepede `transparent`'a gidiyor | tam scrim 4.34:1 → gradyan ortası **2.03:1** → tepe **1.24:1** | `GlassHero.module.css:112,125` |
| 2 | **1.4.6** | Hero alt başlığında `opacity: .85` kontrastı ayrıca düşürüyor | **3.64:1** → gradyanda **1.84:1** | `GlassHero.module.css:126` |
| 3 | **1.4.6** | Medya üstü header linkleri `color-mix(… on-scrim 78%, transparent)` | **3.33:1** / **3.42:1** | `GlassHeader.module.css:301,304` |
| 4 | **1.4.11** | `--lg-hairline rgba(36,33,27,.09)` kart ve **input sınırlarında** kullanılıyor | **1.19:1** — AA'yı bile geçmiyor | `src/index.css:21` |
| 5 | **1.4.11** | `--lg-glass-line rgba(36,33,27,.12)` | **1.27:1** | `src/index.css:56` |
| 6 | **2.5.5** | Dokunma hedefi genişletmesi `GlassButton`/`GlassIconButton`'da uygulanamıyor → imleçli cihazda gerçek hedef 36/40px | 36/40px < 44px | `GlassIconButton.module.css:47-56`, `GlassSurface.module.css:4` |

**#4 en yüksek kaldıraçlı madde:** tek token, hem AAA hem AA seviyesinde açık, ve tüm kütüphaneye yayılıyor. Kök neden, *dekoratif ayraç* ile *kontrol sınırının* aynı token'ı paylaşması. Ayrı bir `--lg-border-control` (≥3:1) gerekiyor.

**#6 hakkında — sorun ölçü değil, kapsam.** Sistem bu işi doğru kurgulamış: `--lg-control-hit: 44px` (`src/index.css:132-133`) *görünür ölçüden bağımsız* dokunma hedefi tabanıdır ve kontrol görünmez bir `::after` taşmasıyla bu ölçüye çıkar. WCAG 2.5.5 "target"ı işaretçi eylemini kabul eden bölge olarak tanımladığı için bu tamamen geçerli bir tekniktir — görsel yoğunluk değişmeden AAA sağlanır.

**Yazı boyutu bu işten etkilenmez:** `--lg-text-*` (11–28px) ve `--lg-control-*` (36–52px) ayrı token ailelerdir. `GlassButton.module.css:62-65` her boyut sınıfında ikisini bağımsız okur; kontrol yüksekliğine dokunmak `font-size`'ı değiştirmez.

Gerçek açık iki yerde:

1. **Kapsam:** `--lg-control-*` kullanan 96 CSS dosyasından yalnız **19'u** `--lg-control-hit` genişletmesini uyguluyor.
2. **Mimari engel:** `GlassButton` ve `GlassIconButton` bu desenden *yararlanamıyor*. Kök `GlassSurface` köşe kırpması için `overflow: hidden` taşıyor (`GlassSurface.module.css:4`), taşan pseudo-eleman ne boyanıyor ne tıklanıyor. `GlassIconButton.module.css:51-56` bu kısıtı açıkça belgeliyor. Kütüphanenin en çok kullanılan iki kontrolü bu yüzden 36/40px'te sabit.

Not: 2.5.5 AAA'da **aralık istisnası yoktur** (o 2.5.8 AA'ya özgüdür), yani 44×44 gerçekten şart — ama boyanan kutu için değil, tıklanabilir bölge için.

### 2.3 Orta öncelikli

| Kriter | Sorun | Konum |
|---|---|---|
| 1.4.6 | Birincil buton dolgusu (`--lg-action-prominent`) + beyaz metin **5.93:1** | `src/index.css:40-42` |
| 1.4.6 | Bento künyesi ve kat planı etiketi scrim üstünde | `GlassBento.module.css:81-82`, `GlassFloorPlanViewer.module.css:159-160` |
| 2.4.7 | `outline: none` — **form kontrollerinde**: `GlassInput.module.css:51`, `GlassTextarea.module.css:43` (+ `GlassCommandPalette`, `GlassGallery`, `MessagesWorkspace`, `EmlakSearchView`) | `box-shadow` telafisinin AAA focus appearance'ı karşıladığı doğrulanmalı |
| 1.4.8 | `line-height` 1.5 altında: 1.4–1.45 | `GlassPopover:45`, `GlassTooltip:19`, `GlassChatDock:210,338`, `GlassList:25`, `GlassInsightNote:139` |
| 1.4.8 | `--lg-measure: 54ch` doğru tanımlı ama yalnız 18 dosyada uygulanmış; kalan gövde metinleri 1408–1664px kaba yayılıyor | `src/index.css:107` |
| 3.3.5 | `GlassField` hata oluşunca yardım metnini **gizliyor** — yardıma en çok ihtiyaç duyulan anda | `GlassField.tsx:67-70` |
| 3.3.6 | Geri alma/onay için sistem düzeyi kalıp yok; onay ad-hoc | paylaşılan `GlassConfirm` bileşeni eksik |
| 2.4.11 | `--lg-focus-ring-width: 2px` + `offset: 2px` — AAA alan ölçütünde sınırda | `src/index.css:82-83` |

### 2.4 Sorun bulunmayanlar

Zaman aşımı/kesinti yok (2.2.1/2.2.4), otomatik carousel yok (2.2.2), yanıp sönme yok — tüm `infinite` animasyonlar ≈0.7 Hz (2.3.1/2.3.2), `text-align: justify` hiç kullanılmamış. `prefers-reduced-motion` 138 dosyada, `infinite` animasyonu olan **her** CSS dosyasında karşılığı var. ARIA güçlü: 524 `aria-label`, 203 `aria-labelledby`, 114 `aria-describedby`, 91 `aria-live`; skip link mevcut (`MarketplaceShell.tsx:120`); `GlassIconButton`'da `label` TypeScript'te zorunlu prop.

### 2.5 Cam yüzey paradoksu — gerçek açık "cam" değil, "scrim"

AAA 1.4.6 metnin arkasındaki zeminin **bilinebilir** olmasını ister; yarı saydam malzeme ise zemini kasten bilinemez kılar. Bu repo paradoksu cam için çözmüş (`--lg-glass` 0.92 → en kötü fotoğrafta 7.24:1) ama **aynı disiplini scrim'e uygulamamış**: `--lg-scrim` 0.55'te ve gradyan olarak kullanıldığında efektif alfa yer yer 0.10'a düşüyor, oran 1.24:1'e iniyor.

Çözüm seçenekleri:

1. **Scrim'i cam gibi ele al** — beyaz foto + beyaz metinde 7:1 için alfa ≈ **0.78** gerekiyor. Gradyan kullanılacaksa gradyan durağı metin kutusunun **dışına** taşınmalı.
2. **Metin plakası** — hero/bento künyesini şeffaf gradyan yerine zaten AAA-doğrulanmış `--lg-glass` üzerine koy. Estetiği korur, matematiği bilinir kılar. *(En iyi maliyet/fayda.)*
3. **Çalışma zamanı luminans örneklemesi** — en doğru, en pahalı.
4. `opacity` ile metin soldurmayı bırak (`GlassHero.module.css:126`) — ölçülemez kontrast kaybı üretiyor; önceden hesaplanmış opak token kullan.
5. Metin gölgesi/kontur — **WCAG hesabına girmez**, AAA iddiası için kullanılamaz.

---

## 3. A11y tooling — bugün ne koşuyor

**Kurulu:** `@axe-core/playwright` 4.12.1, 5 e2e spec'te aktif tarama, `playwright.config.ts:13-14` `reducedMotion: 'reduce'` + `colorScheme: 'light'`.

**Kurulu değil / çalışmıyor:**

| Eksik | Kanıt | Sonuç |
|---|---|---|
| AAA kural seti | `withTags` hiçbir e2e dosyasında geçmiyor | axe varsayılanı wcag2a+wcag2aa; **`color-contrast-enhanced` (1.4.6 AAA) hiç koşmadı** |
| İhlal filtresi | 5 yerde `impact === 'critical' \|\| 'serious'` | `moderate`/`minor` ihlaller sessizce düşüyor — kontrast ihlallerinin çoğu bu sınıfta |
| `@storybook/addon-a11y` | `.storybook/main.ts:9` yalnız `addon-docs` | 103 component'in hiçbiri Storybook'ta denetlenmiyor |
| `eslint-plugin-jsx-a11y` | `.oxlintrc.json` → `["react","typescript","oxc"]` | Statik a11y kuralı sıfır |

Yani **"AAA'yı geçiyoruz" iddiasını bugün doğrulayan hiçbir otomatik kontrol yok.** İlk yapılacak iş budur: ölçüm olmadan düzeltme doğrulanamaz.

---

## 4. A11y ayarları profil altında — mimari

### 4.1 Mevcut altyapı

- **TanStack Start, SSR** (`apps/web/vite.config.ts:31-63`) — ama ikinci bir mod var: `WEB_STATIC=1` ile prerender + SPA shell (GitHub Pages). **Statik modda sunucuda kullanıcıya özel hiçbir şey enjekte edilemez.**
- **Tek context** `AuthSessionProvider` (`__root.tsx:49`). Cookie / server function / DB tercih: **sıfır** (grep ile doğrulandı).
- **Kalıcılık deseni** yalnız `localStorage`; tema mantığı iki dosyada birebir kopya (`MarketplaceShell.tsx:13-22,41-68` ve `AccountAppShell.tsx:34-77`).
- **Uygulama kancası hazır:** `document.documentElement.dataset` → `app.css`'te `html[data-theme='…']`. Özgüllük `html[data-x]` (0,1,1) > `:root` (0,1,0), üstelik `app.css` sonra yükleniyor (`__root.tsx:12-13`).

### 4.2 Tercih nereye bağlanır

Yeni token setleri `apps/web/src/styles/app.css` içine, `data-theme` bloklarından **sonra** (eşit özgüllük → kaynak sırası kazanır):

| Tercih | Kanca | Maliyet |
|---|---|---|
| Yüksek kontrast | `html[data-contrast='high']` → `--lg-label`, `--lg-accent`, `--lg-hairline` override'ı | **Ucuz.** Tüm component CSS'i yalnız `--lg-*` tükettiği için tek noktadan yayılır |
| Büyük hedefler | `html[data-target-size='large']` → `--lg-control-*` + `--lg-control-hit` | **Ucuz.** `@media (pointer: coarse)` bloğu (`src/index.css:149-156`) bunun çalıştığının kanıtı |
| Azaltılmış saydamlık | `--lg-glass` / `--lg-glass-line` opaklığını 1'e çek | **Orta.** Bugün 15 CSS bloğu `@media (prefers-reduced-transparency)` ile çalışıyor; token'a indirgemek bunları by-pass eder |
| Azaltılmış hareket | — | **Pahalı.** ~40 dosyada yalnız `@media (prefers-reduced-motion)` var; kullanıcı OS ayarı olmadan tetikleyemez. Her blok `html[data-motion='reduced'] &` ikizi ile çoğaltılmalı |

Ayrıca `src/core/tier.ts:26-27` (`prefersReducedMotion` / `prefersReducedTransparency`) **override kabul etmiyor** — JS tarafındaki `matchMedia` doğrudan çağrıları da var (`GlassTooltip.tsx:29`, `GlassModal.tsx:102`). Kullanıcı tercihinin JS tarafını da etkilemesi için bu imzalar genişletilmeli.

### 4.3 SSR / flash riski

Bugün de mevcut: tercih `useEffect` içinde okunuyor, SSR HTML'i `data-theme` olmadan gidiyor. Tema için ucuz; **yüksek kontrast/büyük hedef için kabul edilemez** — okunmaz bir ilk kare ve layout kayması üretir.

Statik prerender modu cookie yolunu kapattığı için **tek geçerli çözüm:** `__root.tsx:84-86` `<head>` içinde blocking inline script ile `localStorage` okunup `documentElement.dataset` set edilmesi.

### 4.4 Profil sayfası — mevcut desen

`hesabim.guvenlik.tsx` şablonu birebir izlenir: `account-navigation.ts:41-63`'e entry (ray + konum izi + komut paleti tek kaynaktan beslenir) → `AccountNav.tsx:171-181` ray öğesi → `AccountAppShell.tsx:234-248` komut paleti → `pages/AccountAccessibilityPage.tsx` → barrel export'lar → `routes/hesabim.erisilebilirlik.tsx` (`noindex`) → test (`account-page-test-utils.tsx:25-62`) → `rules.md` güncellemesi.

**Uyarı:** `features/account/rules.md` §7/§12 — *"Route'u olmayan kontrol çizilmez"*, *"Gerçek route olmadan button, switch veya sahte kontrol ekleme"*. A11y sayfası gerçek davranışı olan ilk toggle setini içereceği için sözleşmeye açık bir istisna yazılmalı.

**Çakışma:** `AccountWorkspace.stories.tsx:184`'te `Erisilebilirlik` adlı bir story zaten var (a11y *denetim* story'si, ayar sayfası değil) — adlandırma çakışmasına dikkat.

### KARAR 2 — "AAA profil altında etkin" ne demek?

İki okuma var ve sonuçları çok farklı:

**(a) AAA taban + profilde ek kontroller (önerilen).** AAA tüm uygulamada varsayılan; profil paneli AAA'nın *üstüne* opsiyonel güçlendirmeler sunar (kontrast+, saydamlık kapalı, büyük hedefler, hareket kapalı).

**(b) AAA'nın kendisi profilde açılan bir mod.** Bu durumda uygulama varsayılan halde AAA değildir — **AAA uygunluk iddiası yapılamaz**, çünkü WCAG uygunluğu varsayılan deneyim üzerinden değerlendirilir. Erişilebilirlik beyanı (accessibility statement) ve kamu ihalesi/EAA gereklilikleri açısından da zayıf konumda kalınır.

Aşağıdaki yol haritası **(a)** varsayımıyla yazılmıştır.

---

## 5. Önerilen yol haritası

### Faz 0 — Ölçümü aç (önce bu; 1 gün)

Düzeltmelerden önce yapılmalı, yoksa hiçbir düzeltme doğrulanamaz.

1. Tüm `AxeBuilder` çağrılarına `.withTags(['wcag2a','wcag2aa','wcag2aaa','wcag21aa','wcag22aa','wcag22aaa'])` ekle.
2. `impact === 'critical' || 'serious'` filtresini kaldır (5 dosya) — geçiş dönemi için bilinen ihlalleri `.disableRules([...])` ile *açıkça* listele, sessizce düşürme.
3. `@storybook/addon-a11y` kur, `.storybook/main.ts:9`.
4. `.oxlintrc.json`'a a11y kural seti ekle (oxlint jsx-a11y kuralları).

**Çıktı:** gerçek ihlal sayısı. Faz 2'nin kapsamı bu sayıyla netleşir.

### Faz 1 — Dark mode kaldırma (KARAR 1'e bağlı; 1–2 gün)

`src/index.css:158-183` sil → `:7` `color-scheme: light` → `app.css:26-40` sil → iki tema switcher'ı ve `arsam-theme` kaldır → harita/Leaflet filtreleri → Storybook `dark` arka planı → 5 story + 4 `rules.md` + `GenelBakis.mdx`/`Tokenlar.mdx`/`AGENTS.md`/`CLAUDE.md` → `MarketplaceShell.test.tsx` ve `home-concepts.spec.ts` düzelt.

*Bu faz Faz 2'yi ucuzlatır:* AAA doğrulaması tek renk uzayında yapılır.

### Faz 2 — AAA bloklayıcıları (3–5 gün)

Etki sırasına göre:

1. **`--lg-border-control` token'ı ayır** (≥3:1) — `--lg-hairline`/`--lg-glass-line` yalnız dekoratif kalsın. Tek değişiklik, hem AA hem AAA açığı kapanır.
2. **Scrim disiplini** — `--lg-scrim` alfası 0.78'e, gradyan durakları metin kutusunun dışına; ya da hero/bento künyelerinde metin plakası desenine geç (§2.5 seçenek 2).
3. **`GlassHero.module.css:126` `opacity: .85` kaldır** → opak token.
4. **`GlassHeader.module.css:301,304`** medya üstü link renklerini opaklaştır.
5. **Form kontrollerinde `outline: none`** — `GlassInput`, `GlassTextarea`; `box-shadow` telafisinin AAA focus appearance'ı karşıladığını doğrula, karşılamıyorsa gerçek outline'a dön.
6. **Hedef boyutu (KARAR 3) — görsel değişiklik gerektirmez.** İki adım:
   a. `GlassButton.tsx` / `GlassIconButton.tsx`'e sarmalayıcı eleman ekle; `::after` hedef genişletmesi `GlassSurface`'in *dışında* dursun, böylece `overflow: hidden` engeli aşılır. Görünür kutu ve yazı boyutu aynı kalır.
   b. Mevcut `--lg-control-hit` desenini kalan ~77 CSS dosyasına yaygınlaştır (mekanik iş).

   Dikkat: 36→44px genişleme her kenarda 4px taşma demektir; yan yana kontroller arasında **≥8px boşluk** gerekir, yoksa hedefler çakışır. Sıkışık toolbar/header yerleşimleri Faz 0'daki `target-size` axe kuralıyla ölçülmeli.

### Faz 3 — Tercih altyapısı (2–3 gün)

1. `apps/web/src/features/preferences/` — `PreferencesProvider` (`AuthSessionProvider.tsx:24-63` deseni) + `preferences-storage.ts` (`listing-draft-storage.ts:19-103` guard deseni: try/catch, `normalize()`, SSR-safe).
2. `__root.tsx:49`'a provider, `:84-86` `<head>`'e blocking inline script (flash önleme — statik modda tek yol).
3. İki kopya tema mantığını (`MarketplaceShell` + `AccountAppShell`) bu provider'a topla. *Faz 1 zaten bunları siliyorsa bu adım küçülür.*
4. `app.css`'e `html[data-contrast='high']` ve `html[data-target-size='large']` token blokları.

### Faz 4 — Profil sayfası (2 gün)

§4.4 reçetesi. Toggle seti: yüksek kontrast · azaltılmış saydamlık · büyük dokunma hedefleri · azaltılmış hareket · (opsiyonel) altı çizili linkler.
Her toggle **OS tercihini geçersiz kılabilmeli**, üç durumlu olmalı: `sistem / açık / kapalı`.

### Faz 5 — Orta öncelikliler (3-4 gün)

`line-height` ≥1.5 (5 dosya) · `--lg-measure` yaygınlaştır · `GlassField` hata anında yardımı gizlemesin · paylaşılan `GlassConfirm` (3.3.6) · `--lg-action-prominent` 7:1'e · `prefers-reduced-transparency` kapsamını 15 blok → cam kullanan tüm component'lere.

### Faz 6 — Kapsam ve regresyon (2 gün)

E2E'de kapsanmayan sayfalara AAA taraması ekle: `/ofisler`, `/blog`, `/karsilastir`, `/favoriler`, `/ilan-ver`, `/ilan/$listingId`, tüm auth akışı ve `/hesabim` alt sayfaları. Ayrıca a11y tercihleri açıkken de ayrı bir e2e koşusu (`playwright.config.ts:13-14` global ayarları override ederek).

---

## 6. Kararı bekleyen noktalar

| # | Karar | Öneri |
|---|---|---|
| 1 | Dark mode tamamen mi kaldırılsın, yoksa yalnız public rotalarda mı kilitlensin? | **Tamamen kaldır** — "opsiyonel bile olmayacak" ile tutarlı, token seti tekilleşir, AAA işi yarıya iner |
| 2 | AAA taban mı, profilde açılan mod mu? | **Taban.** Aksi halde AAA uygunluk iddiası yapılamaz; profil paneli AAA'nın üstüne ek güçlendirme sunar |
| 3 | 2.5.5 AAA hedef boyutu nasıl sağlansın? | **Sarmalayıcı ile hedef genişletme (Faz 2.6a).** Görünür ölçü ve yazı boyutu değişmez; sistemin kendi `--lg-control-hit` deseni zaten bunu öngörüyor. Görünür yüksekliği 44px'e çıkarmak gereksiz ve görsel olarak maliyetli |
| 4 | `/favoriler` scope='account' ama pazar yeri header'ıyla açılıyor, AccountAppShell dışında — düzeltilsin mi? | Bu işin kapsamı dışında ama frontpage sınırını bulanıklaştırıyor; ayrı bir iş olarak kaydedilmeli |

---

## Ek: doğrulanmış kanıtlar

Aşağıdakiler bu rapor yazılırken doğrudan teyit edildi:

- `.oxlintrc.json` → `"plugins": ["react","typescript","oxc"]` — a11y kuralı yok
- `.storybook/main.ts:9` → `addons: ['@storybook/addon-docs']` — addon-a11y yok
- `apps/web/e2e/*.ts` → `withTags` sıfır eşleşme; `impact === 'critical' || 'serious'` 5 dosyada
- `src/index.css:7` → `color-scheme: light dark` · `:21` → `--lg-hairline: rgba(36,33,27,0.09)` · `:46` → `--lg-scrim: rgba(10,12,16,0.55)` · `:127-128` → `--lg-control-sm: 36px` / `md: 40px` · `:151-152` → `pointer: coarse` altında ikisi de 44px · `:158` → `@media (prefers-color-scheme: dark)`
