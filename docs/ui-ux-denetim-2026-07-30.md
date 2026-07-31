# UI/UX Denetim Raporu — Arsam (apps/web) + liquid-glass-ui

**Tarih:** 30 Temmuz 2026 · **Dal:** `feature/glass-sidebar`
**Yöntem:** 7 paralel kod denetimi + Chrome'da 18 rota × 2 viewport (1440×900 / 390×844) canlı ölçüm (hesaplanmış stiller, taşma, dokunma hedefi, font/boşluk dağılımı) + koyu tema kontrolü + `vitest run`.

---

## 1. Tanı — şikayetin gerçek kaynağı

Kullanıcı şikayeti: *"gereğinden fazla büyük padding, boşluk, buton, yazı, font-size."*

Canlı ölçüm bu şikayeti **doğruluyor ama kaynağını yanlış yere baktırıyor.** Nicel sonuç:

| Ölçüm | Sonuç | Yorum |
|---|---|---|
| 48px+ padding/gap bildirimi (134 CSS dosyası) | **yalnız 5 tane** | Aşırı boşluk **sistemik değil** |
| `--lg-space-9` (48px) kullanımı | **0** | Ölçeğin üst basamakları zaten kullanılmıyor |
| Ölçek dışı boşluk bildirimi | **357** | Asıl borç burada: 6/10/14/18px "yarım basamaklar" |
| Ölçek üstü font (>28px) | **3 tanım, 6 sayfada etkin** | Hero 46px — en görünür sorun |
| Ölçek dışı font-size (çözümlenmiş) | **49** | 14px fiili ikinci gövde boyutu olmuş |
| Yatay taşma (18 rota × 2 viewport) | **0** | Responsive iskelet sağlam |
| `pointer:coarse`/`hover:hover` disiplini | ihlal **0** | Dokunmatikte yapışkan hover riski yok |

**Karar:** Sayfa şişkinliği "her yere 64px padding verilmiş" olmasından gelmiyor. Dört yapısal sebepten geliyor:

1. **Ölçek üstü tipografi** — `GlassHero` başlığı `clamp(30px, 4.5vw, 46px)`, ölçek tavanı 28px. 6 sayfada etkin. Ayrıca `--lg-text-display` (28px) 8 ayrı sayfanın h1'inde ve metrik rakamlarında kullanılıyor.
2. **Kontrol yüksekliği token'ının dekoratif öğelerde kullanımı** — `--lg-control-sm` (44px, bir *dokunma hedefi* ölçüsü) etkileşimsiz `<span>` rozetlerine uygulanmış ("* Zorunlu alan", "Kapak fotoğrafı", fotoğraf sıra numarası). Chip'ler de 12-13px yazıyla 44px yüksekliğinde.
3. **Sabit `min-height`'lı kartlar** — giriş kartı 352px, yayın onayı 544px, bölge kartı 84px, adım şeridi 76px. İçerik yarısı kadar.
4. **Boşluk yığılması** — aynı dikey payın iki-üç katmanda tekrar ödenmesi (iç içe `.section`, `PageContainer` + `HomeConceptFrame` çift gutter, hero padding + kabuk payı + çerçeve gap).

**Ek olarak** — istenen kapsamın dışında ama sessiz kalınamayacak durum: **18 test kırık** (`listing-detail`), **12+ ölü buton** (tıklanınca hiçbir şey yapmıyor), bir buton yanlış sayfaya gidiyor, bir filtre grubu başka filtrenin state'ini sessizce değiştiriyor, `/blog` son kullanıcıya iç geliştirme notu gösteriyor.

---

## 2. P0 — Önce bunlar (bozuk davranış / ölçeğin görünür ihlali)

### 2.1 Ölçek ve yoğunluk

| # | Yer | Sorun | Düzeltme |
|---|---|---|---|
| A1 | `src/components/GlassHero/GlassHero.module.css:72` | `font-size: clamp(30px, 4.5vw, 46px)` — ölçek tavanının %64 üstü, 6 sayfada etkin | `clamp(var(--lg-text-title), 3vw, var(--lg-text-display))` + `--title-size` değişkeni aç |
| A2 | `GlassHero.module.css:6,60,115` | `--pad-y: 56px`, showcase üst dolgu **150px**, mobilde küçülmüyor | `--pad-y: clamp(var(--lg-space-5), 2.4vw, var(--lg-space-7))` (map-first'te bu kalıp zaten var) |
| A3 | `apps/web/.../listing-create/ListingCreateWorkspace.module.css:160-166,195-206,213-225` | Giriş ekranı: `min-height: calc(100dvh - 128px)` + 64px gap + kart `min-height: 22rem` (352px) + 40px dolgu + 56px rozet + 40px rozet margin'i | `min-height` kaldır, gap→`--lg-space-7`, kart dolgusu→`--lg-space-6`, rozet→`--lg-space-8` (40px), rozet margin→`--lg-space-4`. Kart 360px→~230px |
| A4 | aynı dosya `:748-753`, `:727-731` | **"İlan amacı" Satılık/Kiralık** kartları ortalanmış (`justify-content:center; text-align:center`), tam sütun genişliğinde, 56px yüksek. Aynı ekrandaki "yetki" kartları sola hizalı — sayfa kendi içinde çelişiyor | `justify-content`/`text-align` kurallarını sil, `min-height: var(--lg-control-md)`, `grid-template-columns: repeat(auto-fit, minmax(11rem, max-content))` |
| A5 | aynı dosya `:286-301`, `:1049-1062`, `:475-487` | `--lg-control-sm` (44px dokunma hedefi) etkileşimsiz rozetlerde: "* Zorunlu alan", "Kapak fotoğrafı", fotoğraf sıra no, adım numarası | `min-height: 0; padding-block: var(--lg-space-1)`; font `--lg-text-badge` |
| A6 | `src/components/GlassChip/GlassChip.module.css:28-29` | Chip 12-13px yazıyla 44px yüksekliğinde — filtre satırları buton kadar yer kaplıyor | Görsel yükseklik `var(--lg-space-7)` (32px); 44px yalnız `@media (pointer: coarse)` altında |
| A7 | `src/components/GlassTabs/GlassTabs.module.css:31` | Tab ~37px, `min-height` yok — dokunma hedefinin altında (A6'nın tersi hata) | `min-height: var(--lg-control-md)` |
| A8 | `src/components/GlassButton/GlassButton.module.css:58-59` | `xl` font `calc(--lg-text-headline + --lg-focus-ring-width)` = **19px** (focus halkası token'ı tipografi hesabında!), `lg`/`xl` padding 28/36px — üçü de ölçek dışı | font→`--lg-text-headline`, padding→`--lg-space-6` / `--lg-space-7` |
| A9 | `apps/web/.../home-concepts/shared/HomeConceptFrame.module.css:76-80` | Dokunmatikte çift gutter: `PageContainer` zaten `--lg-container-gutter` veriyor, üstüne 16px daha. 390px'de kenar başına 32px = ekranın %16'sı | `@media (pointer: coarse)` bloğunu sil |
| A10 | `apps/web/.../listings/EmlakSearchView.module.css:573-575, 606-608` | `.page{padding:…}` PageContainer'ın hem gutter'ını hem kabuk payını eziyor; kazanan kural import sırasına bağlı → mobilde ya çift boşluk ya içeriğin header altında kalması | Her iki kuralı sil |
| A11 | `apps/web/.../listing-detail/ListingDetailWorkspace.tsx:141-143, 149-151` | İç içe `.section`: dikey dolgu ve hairline iki kez → bölüm arası **112px** | Sarmalayıcı `div`'leri kaldır |
| A12 | `apps/web/.../home-concepts/ai-advisor/AiAdvisorHome.module.css:130-132` | `variant="micro"` vitrini (106×80px hücreler için) 3 sütuna zorlanmış → 48 ilan × 436px hücre ≈ **5800px** kaydırma, tipografi 10.5px'te kalıyor | Override'ı sil, `columns={7}` prop'u çalışsın |
| A13 | `apps/web/.../regions/RegionDirectoryView.module.css:1` | Mobilde 352px sabit harita, kart listesinden önce → ilk ekranda **tek bir bölge kartı görünmüyor** | `<48rem`'de `min-height: 14rem` veya liste/harita sekmesi |

### 2.2 Bozuk davranış

| # | Yer | Sorun | Düzeltme |
|---|---|---|---|
| B1 | `apps/web/src/features/listing-detail/` | **18 test kırık.** Sayfa kompozisyonu soru omurgasına geçirilirken `ListingIntro`, `ListingSectionIndex`, 6 kanıt bölümü ve `ListingMediaStage` mount'tan düşmüş; `rules.md` ve testler güncellenmemiş | Önce karar: bölüm mimarisi geri mi gelecek, yoksa sözleşme mi uyarlanacak. Sonra kod ya da test |
| B2 | `ListingDecisionRail.tsx:137`, `ListingEvidenceBrief.tsx:79` | AI özetindeki 6 "Dayanak" bağlantısından **5'i hiçbir yere gitmiyor** (`#parsel`, `#imar`, `#altyapi`, `#arazi`, `#piyasa`); `#dogrulama` da öyle | Hedef `id`'leri render et veya bağlantıyı soruya çapala |
| B3 | `listing-detail/components/ListingDock.module.css:4-7` | Sayfa dock'u `inset-block-end: 0` ile kabuğun `GlassDock`'unun (z-index 60) altında kalıyor → **mobilde "Mesaj gönder" erişilemez** | `inset-block-end: var(--dock-clearance)` (değişken zaten tanımlı) |
| B4 | `apps/web/src/components/MarketplaceShell.tsx:168-175` | `aria-label="Geçmiş"` + saat ikonu olan buton **Favoriler**'e gidiyor | Etiket/ikon `Favoriler` yapılsın |
| B5 | `MarketplaceShell.tsx:147-159` | TR/EN dil butonları `onClick={() => undefined}` — `aria-pressed` ile toggle duyuruluyor ama ölü. Header'daki 6 kontrolün 2'si işlevsiz | i18n bağlanana kadar kaldır |
| B6 | `MarketplaceShell.tsx:270-274` | `viewport === null` iken **3 dock birden** DOM'a giriyor → aynı isimde 3 `<nav>` landmark, 23 yinelenen link, hidrasyonda dock atlaması | Tek dock bas |
| B7 | `apps/web/.../regions/RegionDirectoryView.tsx:15` | "Sinyaller" başlığı altındaki checkbox'lar aslında **Amaç** ve **Mülk tipi** filtrelerinin state'ini değiştiriyor — "Gelişim eğilimi güçlü" işaretlenince amaç sessizce *Yatırım*'a dönüyor | Gerçek sinyal alanı gelene kadar grubu kaldır |
| B8 | `regions/…tsx:17`, `listings/EmlakSearchView.tsx:507-513`, `comparison/ComparisonWorkbench.tsx:195-196, 231-243`, `favorites/FavoritesWorkspace.tsx:19` | **Ölü butonlar:** "İlanları gör", "Ofisleri bul", kart başına "Karşılaştır"+"Kaydet", "Paylaş", "PDF raporu oluştur", kriter "Uygula", CompareBar "Karşılaştır" | `disabled` + görünür gerekçe (`listing-detail/rules.md §4` deseni) ya da bağla |
| B9 | `apps/web/src/routes/blog.tsx:7` | `/blog` son kullanıcıya "Sayfa içeriği … sonraki tasarım turunda bu alana yerleşecek" + `SSR · Gerçek URL · Storybook HMR` iç notunu gösteriyor; navigasyonda kalıcı bağlantısı var | Navigasyondan kaldır ya da "Yakında" durum sayfası |
| B10 | `apps/web/.../messages/MessagesWorkspace.module.css:57-59,180-183` + `routes/__root.tsx:24-25` | Sohbet çerçevesi `72dvh` kabuk payını saymıyor → "composer daima görünür" sözleşmesi bozuk; ayrıca `interactive-widget=resizes-content` yok → **mobil klavye composer'ı örtüyor** | `calc(100dvh - header-offset - dock-offset - space-9)` + viewport meta |
| B11 | `apps/web/.../home-concepts/ai-advisor/AiAdvisorHome.module.css:2` | `container:` shorthand'i `PageContainer`'ın `page` adını eziyor → bu konseptin **tüm** responsive kuralları kaynak sırasına göre sessizce ölebilir | `container-type: inline-size` longhand'ine geçir |
| B12 | `apps/web/src/styles/app.css:58` | `--lg-shell-dock-offset: 88px`, gerçek dock geometrisi **62px** — her sayfa 26px fazla alt boşluk ödüyor. Ayrıca `--lg-control-xl` layout ölçüsü olarak kullanılmış | Dock kendi yüksekliğini yayınlasın veya `calc(space-3 + space-6 + space-5)` |

---

## 3. P1 — Ölçek/yoğunluk dalgası

**Tek hamlede en çok kazandıran:** `--lg-text-display` (28px) şu an 8 yüzeyde h1 ve metrik rakamı olarak kullanılıyor (`account:31`, `advisor:62`, `listings:24`, `messages:35`, `offices:17,59`, `regions`, `comparison`, `favorites`). **`display`'i yalnız ana sayfa hero'suna bırakıp sayfa h1'lerini `--lg-text-title`'a, bölüm h2'lerini `--lg-text-headline`'a indirmek** her ekranda 1-2 kart daha görünür kılar.

Diğerleri:

- **Hero hizası (5 konsept):** `GlassHero --content-max: 1120px` ortalaması, `PageContainer` 88rem — hero metni bölüm başlıklarından ~124px içeride başlıyor. `--content-max: 100%` veya `size="narrow"`.
- **Konseptler arası ikilik:** `MapFirstHome` elden geçirilmiş (hero dolgusu ezilmiş, footnote tipografi), diğer 4 konsept varsayılanlarda. Aynı öğe konseptten konsepte farklı ölçekte (`sectionHeader p` 13px vs 15px; `.section` gap 16 vs 20).
- **Yapışan raylar kabuk payını okumuyor** — 4 dosyada aynı hata (`advisor:122-132`, `listings:152,517`, `offices:88,95`, `regions`): `top: var(--lg-space-4|5)` → `calc(var(--lg-shell-header-offset) + var(--lg-space-4))`.
- **Buton enflasyonu (advisor):** kriter satırı başına 2 buton — 8 "Düzenle"nin tamamı aynı fonksiyonu çağırıyor; ilan kartı başına 5 buton (dar kolonda 3 satıra sarıyor); karar rayında 5 buton daha.
- **Emlak arama:** ilk ilana kadar 7 ayrı dikey bant; liste satırında 160px görsel → ekranda 3-4 ilan (`aspect-ratio: 4/3` + `minmax(8rem,10rem)` ile 6 ilan).
- **Favoriler:** hero + 4×28px metrik + 2 AI kartı, ilk favori kartını ~550px aşağı itiyor; her kartta açık `GlassPersonalNote` textarea'sı (+120px/kart).
- **Karşılaştırma:** tablonun altındaki `signalGrid` tablodaki bilgiyi 3 kartta tekrarlıyor + 6 ölü buton + 28px'lik yüzde rozeti. Ekranda görüldü: sağdaki "Kriterinizi yazın" kartı sol karta yükseklik eşitlendiği için ~200px boş.
- **Hesabım (ekranda doğrulandı):** "Kural" / "AI açıklaması" kaynak etiketi kendi grid satırını işgal edip butonun altında sırıtıyor; ters hiyerarşi — jenerik "Hesabım" 28px, kullanıcının kendi adı 17px.
- **`listing-create` diğer:** karakter sayacı input'un üzerine biniyor (`:1338-1344`) · adım şeridi 76px · her zaman render edilen boş hata paragrafları (`fieldError` başına ~22px ölü boşluk, PropertyStep'te 2 tane) · "Ada" alanı "Parsel"in hata mesajını gösteriyor.
- **Sabit genişlikli overlay'ler (320px'de taşar):** `GlassToast` 380px, `GlassChatDock` 360px, `GlassPopover` 320px, `GlassSidebar` 300px, `GlassTooltip` 240px, `GlassMenu`/`GlassContextMenu` 200px → `min(94vw, Npx)` desenine geçir (`GlassIslandHeader` zaten kullanıyor).
- **Hiç daralmayan gridler:** `GlassValuationDrivers:104` (6 sütun), `GlassSpecTable:27` (`1fr 1fr`), `GlassFeatureGroup:34`, `GlassIslandHeader:85`, `ListingLedger:31`, `AdvisorListingCard:110`, `AdvisorWorkspace:75` (`repeat(12,…)`).
- **`GlassListingCard`:** `width: 240px` sabit, `max-width` yok — responsive grid'de esnemiyor.
- **Tema kıran sabit renkler:** `GlassIconButton:22-35` (hover'da beyaz zemin + siyah ikon → Grafit'te beyaz leke), `GlassTabs:54` (aktif tab `rgba(255,255,255,.28)` → Kağıt'ta görünmez), `GlassNavbar:51`, `GlassListingCard:30`.
- **`prefers-reduced-transparency` fiilen %14 kapsamda:** koruma yalnız `GlassSurface.tsx`'te JS ile; `backdrop-filter` kullanan 36 dosyanın **31'i** bypass ediyor (Modal, Drawer, Sheet, Header, IslandHeader, Navbar, CommandPalette dahil). `src/index.css`'e tek bir `@media (prefers-reduced-transparency: reduce)` bloğu 31 dosyayı kapsar.
- **Rota değişiminde odak yönetimi yok** — `components/` + `routes/` altında tek `.focus()` çağrısı yok; SPA gezinmesi ekran okuyucuya duyurulmuyor.
- **Footer landmark'ı yok** — `HomeFooter` yalnız ana sayfa çerçevesinde; 7 rotada altbilgi/yasal bağlantı yok.

---

## 4. P2 — Borç ve tutarlılık

- **Token borcunun kaçış yolu:** 1200 raw px ihlalinin **565'i local custom-property tanımında** (`--nav-font: 14px` gibi). Lint kuralı teknik olarak sağlanıyor, ölçek fiilen deliniyor. En kirli: `GlassHeader` (62), `GlassIslandHeader` (45), `GlassVitrin` (42), `GlassMap` (38), `GlassHero` (25+8 hex).
- **14px kararı:** ölçek dışı fontların %35'i (17/49). 12+ component aynı boyutu bağımsız yeniden icat etmiş. Ya ölçeğe resmî basamak olarak ekleyin ya 13/15'e taşıyın — tek karar 12 dosyayı temizler.
- **Bayat fallback'ler:** 18 dosyada `var(--lg-control-sm, 32px)` ×19 ve `var(--lg-control-md, 40px)` ×13 — token 44px. İzole Storybook/test bağlamında dokunma hedeflerini 32px'e düşürür.
- **Focus token'ı kullanılmıyor:** `outline: 2px` 107 yerde raw, `--lg-focus-ring-width` yalnız 2 yerde. Tek `sed` turuyla kapanır.
- **`--lg-accent` fallback'i tutarsız:** `#b45309` (Chip/Checkbox/RadioGroup/Alert) vs `#0a84ff` (Input/Tabs/ListingCard) — token düşerse iki farklı marka rengi.
- **`sm` boyutu ölü eksen:** `--lg-control-sm === --lg-control-md === 44px`; `sm` hiçbir component'te küçültmüyor. Aynı rolü oynayan `GlassTabs` (~37) / `GlassButton md` (44) / `GlassSegmentedControl` (50) üç farklı yükseklikte.
- **Minified kaynak dosyalar:** `ComparisonWorkbench.module.css` (2 satır), `FavoritesWorkspace.module.css` (2), `LeafletRegionMap.module.css` (1), `RegionDirectoryView.tsx` (bileşenler tek satırda) — denetlenemez, diff'lenemez durumda.
- **Leaflet CDN'den runtime yükleniyor** (`LeafletRegionMap.tsx:15-18`) — SRI yok, çevrimdışı/CSP'de harita hep hata durumunda. Paket zaten `package.json`'da.
- **`var()` SVG sunum niteliğinde çözülmez** — `LeafletRegionMap.tsx:21` ve `LeafletPropertyPicker.tsx:141-205` işaretçilere `color: 'var(--lg-accent)'` geçiyor, renk uygulanmıyor.
- **`!important` yığınları:** `GlassSelect` (4), `GlassButton` (2), `regions` (5), `offices` (2) — tasarım sistemi sözleşmesini deliyor.
- **Prototip rotalar üretimde:** `/konseptler` altında 5 sayfa router'a bağlı; ayrıca üretim ana sayfası (`/`) `features/home-concepts/map-first/` **konsept** bileşenini kullanıyor.
- **Ölü kod:** `ListingMediaStage` (233 satır CSS + 180 satır TSX), 6 kanıt bölümü component'i (yalnız testlerde), `.metrics` kuralı, `data-new-account` attribute'u.
- **Sidebar yok:** dal adı `feature/glass-sidebar` ama `MarketplaceShell`'de sidebar yok — gezinme, kapalıyken 260px'lik açılır ada + alttaki yüzen dock üzerinden yürüyor.

---

## 5. Uygulama sırası

**Dalga 1 — Ölçek (kullanıcının şikayeti, düşük risk, yüksek görünürlük)**
A1, A2 (hero) → §3'ün ilk maddesi (`display` → `title`/`headline`) → A5, A6, A7 (kontrol yüksekliği token'ı) → A8 (buton lg/xl) → A3, A4 (ilan-ver giriş + İlan amacı)

**Dalga 2 — Yerleşim çakışmaları (tek satırlık silmeler)**
A9, A10 (çift gutter/dolgu) → A11 (iç içe section) → B12 (dock offset) → §3 yapışan raylar → B11 (container adı)

**Dalga 3 — Bozuk davranış**
B1 (18 test — önce sözleşme kararı) → B2, B3 (kırık çapa + dock çakışması) → B7 (yanlış state yazan filtre) → B4, B5, B8 (yanlış/ölü butonlar) → B9 (`/blog`) → B10 (mobil klavye)

**Dalga 4 — Sistemik borç**
`prefers-reduced-transparency` global bloğu → focus token `sed` turu → bayat `--lg-control-*` fallback'leri → 14px kararı → sabit genişlikli overlay'ler + daralmayan gridler → minified dosyaları aç

> **Not:** Dalga 4'ün ilk üç maddesi yapılmadan Dalga 1'in kazanımı zamanla geri gelir — çözümleme tabanlı bir CSS lint (local custom-property'leri de çözen) CI'a eklenmezse `--nav-font: 14px` deseni tekrar üretilir.

---

## 6. Doğru çalışan yapılar (bozmamak için)

- Yatay taşma 18 rota × 2 viewport'ta **sıfır**.
- `pointer: coarse` / `hover: hover` disiplini: 80 dosya yetenek sorgusu kullanıyor, `:hover` var ama koruması yok olan **0** dosya.
- 127 çok sütunlu gridin 121'i bir sorguyla daraltılıyor.
- `font-size` bildirimlerinin %93.3'ü doğrudan `--lg-text-*` tüketiyor.
- `PageContainer`'ın 108/120px dikey dolgusu **aşırı boşluk değil** — yüzen header/dock payı (yalnız dock tarafı 26px fazla, bkz. B12).
- `listing-create` CSS'inde raw px/hex **yok** — token disiplini bu dosyada temiz.
- `/emlak` arama sayfası, kalabalık filtre+sonuç+harita düzenini taşımasına rağmen ölçek açısından en dengeli ekran.
