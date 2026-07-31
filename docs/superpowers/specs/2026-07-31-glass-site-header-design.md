# Tasarım — GlassSiteHeader (Tailark hero-section-1 header'ının Liquid Glass uyarlaması)

**Tarih:** 31 Temmuz 2026 · **Dal:** `feature/glass-sidebar`
**Girdi:** Tailark `hero-section-1.tsx` içindeki `HeroHeader` bileşeni (Next.js + Tailwind + shadcn/ui + framer-motion)
**Kapsam:** Yeni kütüphane bileşeni `src/components/GlassSiteHeader/` + `apps/web`'in `MarketplaceShell`'inin bu bileşene geçirilmesi.
**Kapsam dışı:** Tailark'ın hero bölümü, müşteri logo şeridi, `AnimatedGroup`, arka plan görseli. Yalnız header alınıyor. Storybook vitrin katmanı (`src/pages/PublicShell` → `GlassNavbar`) bu işte değişmiyor.

---

## 1. Neden

`apps/web`'in üst navigasyonu bugün `GlassIslandHeader` — Apple Dynamic Island'dan uyarlanmış, hover'da genişleyip tıklayınca tam gezinme paneline morph eden bir hap. Bileşen kendi başına iyi çalışıyor ama pazaryerinin üst şeridi olarak fazla iş yükleniyor: sayfa kartları, alt navigasyon, AI composer araması, saat, `statusTrail`, bildirim sayacı, dil seçici, tema döngüsü ve iki hesap aksiyonu aynı hapta. Ana gezinme zaten `GlassDock`'ta ikinci kez duruyor.

Tailark header'ı tersini yapıyor: tepede görünmez bir ray, scroll'da kendini toplayıp yüzen bir kapsüle dönüşen tek jest. Az şey taşıyor ve taşıdığını net taşıyor. Liquid Glass'ın "cam yalnız navigasyon katmanında, hareket halinde malzeme kazanır" fikrine `GlassIslandHeader`'dan daha yakın.

Bu iş, o anatomiyi sisteme uygun biçimde kurup gerçek uygulamanın header'ı yapıyor.

## 2. Kararlar ve gerekçeleri

| Karar | Seçim | Gerekçe |
|---|---|---|
| Yerleşim | **Yeni bileşen `GlassSiteHeader`** | `GlassHeader` ve `GlassNavbar` yerinde kalır; mevcut tüketiciler kırılmaz |
| Hedef katman | **`apps/web`** | Ürün orada; `GlassIslandHeader` yalnız `MarketplaceShell`'de bağlı |
| `GlassIslandHeader`'ın akıbeti | **Kütüphanede kalır, çözülür** | Story/test/`rules.md`'siyle çalışan bir bileşen; silmek bu işin kapsamı değil |
| Mobil menü | **Kapsül içinde açılan panel** | Tailark sadakati; tek cam yüzey — cam üstüne cam yok |
| Scroll morfu | **`motion` layout (FLIP)** | `max-width` transition'ı yasak; FLIP sistemde onaylı mekanizma (bkz. §3) |
| Yetenek kapsamı | **Sadeleşme** | Header'a ait olmayan yükler düşer (§6) |
| Tema butonu | **Header'da kalır** | Sadeleşmeden bilinçli sapma: tek erişim noktası (§6) |
| Eksenler | **Varyant yok** | Tek anatomi; `variant`/`size` ekseni açmak için gerekçe yok |

---

## 3. Anatomi ve scroll morfu

Sabit üst şerit: `position: fixed; top: 0; z-index: 30` (`GlassHeader.module.css`'teki header kademesiyle aynı). İçinde tek bir kapsül, iki durumu:

| | Rest (tepe) | Condensed (`scrollY > threshold`) |
|---|---|---|
| Genişlik | `--lg-container-narrow` (72rem) | `min(100%, 55rem)` |
| Zemin | şeffaf — malzeme yok | `GlassSurface material="glass" thickness={0.4}` |
| Köşe | `0` | `--lg-radius-card` |
| Kenar / gölge | yok | `--lg-hairline` + `--lg-shadow-md` |

Gölge, `GlassSurface`'in yükselti kancası üzerinden verilir: kapsül `--lg-surface-shadow: var(--lg-shadow-md)` yazar. `--lg-surface-shadow` global bir token değil, `GlassSurface.module.css`'in `var(--lg-surface-shadow, none)` ile okuduğu yerel değişkendir — yüzen katmanların (dock/popover/menu/toast) kullandığı desen.
| Aksiyonlar | `secondaryAction` + `action` | `condensedAction` (verilmişse) |

Durum tek bir `data-scrolled` attribute'uyla CSS'e devredilir; JS ölçüm yapmaz — `GlassHeader`'ın `useScrolled` deseni birebir tekrar edilir.

### 3.1 Neden FLIP

Tailark daralmayı `max-width` transition'ıyla yapıyor. `ErisilebilirlikMotionResponsive.mdx` bunu yasaklıyor: *"animasyon yalnız `transform` / `opacity` / `filter` üzerinde (layout tetiklemez)"*. Aynı doküman "Sekme/sidebar seçim geçişi → **motion layout (FLIP)**" satırıyla FLIP'i onaylıyor.

Dolayısıyla: genişlik ve radius CSS'te `data-scrolled` ile sınıf değiştirir; `<motion.div layout>` iki ölçüm arasındaki farkı transform'a çevirip animasyonu öyle sürer. Layout okuması tek karede olur, transition layout tetiklemez.

- Spring: `presets.springs.sidebar` (`{ stiffness: 260, damping: 32 }`) — salınımsız duruş.
- `prefersReducedMotion()` → `{ duration: 0 }`.

### 3.2 Cam bütçesi

`GenelBakis.mdx`: sayfa başına en fazla 6 cam yüzey, cam üstüne cam yok.

- Rest'te header **0** cam yüzey harcar (şeffaf).
- Condensed'te **1** harcar.
- Kapsülün içindeki `GlassButton`'lar cam üstüne cam olur → kapsül içeriği `GlassTierProvider` ile düz katmana indirilir (`GlassIslandHeader`'ın `extras`/`search` için kullandığı desen).
- Mobil panel kapsülün *kendisi* büyüyerek açılır — ayrı bir yüzey değil, ek cam maliyeti yok.

---

## 4. API

```ts
export interface GlassSiteHeaderLink {
  label: string
  href?: string
  onClick?: () => void
  /** Aktif sayfa — aria-current="page" + kayan cam gösterge */
  active?: boolean
}

export interface GlassSiteHeaderProps {
  /** Wordmark/monogram slotu */
  logo: ReactNode
  links?: GlassSiteHeaderLink[]
  /** İkincil sade aksiyon (örn. "Üye girişi") */
  secondaryAction?: ReactNode
  /** Birincil CTA (örn. "İlan ver") */
  action?: ReactNode
  /** Verilirse: condensed durumda ikili aksiyonun yerine geçen tek CTA */
  condensedAction?: ReactNode
  /** Aksiyonların solunda kalan küçük yardımcı slot (örn. tema butonu) */
  utility?: ReactNode
  /** Hamburger'ın accessible name'i ve panel başlığı */
  menuLabel?: string
  /** Scroll eşiği, px. Vars. 24 */
  scrollThreshold?: number
}
```

**Eksen disiplini** (`EksenlerVeDurumlar.mdx`): `variant`/`size`/`material` ekseni yok — tek anatomi. `hover`/`focus`/`active` prop değil. `active` link seviyesinde bir *veri*, etkileşim state'i değil. `condensedAction` verilmezse ikili aksiyon scroll'da olduğu gibi kalır — davranış opt-in.

Aktif link göstergesi: `motion` `layoutId` ile kayan cam pill (`GlassHeader`'ın `NavLinks` deseni).

---

## 5. Mobil panel ve erişilebilirlik

Hamburger, kapsülün kendisini aşağı doğru büyütür; linkler + aksiyonlar aynı cam yüzeyin içinde açılır. Modal değil, **inline disclosure**.

- Hamburger: `GlassIconButton` + zorunlu `label` (ikon-tek buton kuralı), `aria-expanded`, `aria-controls`.
- Panel `id`'li; `<nav aria-label="Site">` içinde.
- Escape kapatır ve focus hamburger'a döner.
- Dış tıklama kapatır (`pointerdown`, capture).
- Link seçimi paneli kapatır.
- **Focus trap yok, scroll kilidi yok, portal yok** — bilinçli sapma. `GenelBakis.mdx`'in overlay sözleşmesi (portal + focus trap + scroll kilidi + focus dönüşü) Modal/Drawer/Toast için, yani sayfayı bloke eden katman için yazıldı. Bu panel sayfa akışının parçası; `Tab` panelden doğal olarak çıkmalı. Gerekçe `rules.md`'ye yazılır.
- Focus halkası yalnız `:focus-visible`, `outline: var(--lg-focus-ring-width) solid var(--lg-accent)`.
- Kontrol yükseklikleri `--lg-control-*`; dokunmatik hedef ≥ 44px.
- Açılış/kapanış `height` değil, `motion` layout + `opacity` ile.
- Breakpoint yerine yetenek sorgusu: link hover'ı `@media (hover: hover)`. Masaüstü link satırının açılması **container query** ile (kapsül genişliğine göre), `min-width` ile değil: kapsül `container-type: inline-size`, yatay link satırı `@container (min-width: 48rem)` altında gizlenip hamburger'a düşer.
- `prefers-reduced-transparency` → `GlassSurface` zaten frosted'a düşer.

---

## 6. `apps/web` entegrasyonu

```
MarketplaceShell
├── skip-link
├── GlassSiteHeader        ← GlassIslandHeader'ın yerine
├── children
└── GlassDock              ← dokunulmuyor
```

`isFocusedListingFlow` (create-listing rotasında header'ı gizleme) aynen korunur.

### 6.1 Veri eşlemesi

| `GlassIslandHeader` | `GlassSiteHeader` |
|---|---|
| `brandIcon` + `brandLabel="arsam.net"` + `brandHref` | `logo` slotu |
| `pages` (`headerRouteKeys`, ikonlu kartlar) | `links` — Arama · Ofisler · Bölgeler · Blog, düz ve ikonsuz |
| `activeKey={currentRoute.key}` | `links[].active` |
| `extras` → "Üye girişi" / "Hesabım" | `secondaryAction` |
| `extras` → "İlan ver" | `action` ve `condensedAction` |
| `extras` → tema butonu | `utility` |
| `onRoute` | `links[].onClick` → `routeTo` |

`headerRouteKeys` (`config/routes.ts`) değişmiyor; `route.key === 'offices'` için "Ofisler" etiket düzeltmesi korunur.

### 6.2 Düşenler

Bu iş yalnız kaldırır; düşenlerin yeni yerleri ikinci iterasyonun konusu.

| Düşen | Beraberinde temizlenen |
|---|---|
| `search` — `GlassAiComposer` | `brief` / `briefContext` state'i, `COMPOSER_TOOLS`, `composerTools`, submit→`/emlak?q=` akışı, `GlassAiComposer` importları |
| `showClock` + `initialTime` + `timeZone` | `MarketplaceShell` `initialTime` prop'u ölür → props, `__root.tsx` loader'ı ve `MarketplaceShell.test.tsx`'in 3 render'ı temizlenir |
| `statusTrail` | `currentRoute.statusTrail` okunmaz. `config/routes.ts`'teki alan **durur** (veri kalsın, tüketici kalmasın) |
| `notificationCount` + `onNotificationsClick` | Dock'ta "Mesajlar" zaten var |
| TR/EN dil seçici | `.shell-language` CSS'i `app.css`'ten çıkar. EN zaten bağlı değildi |
| `extras` sarmalayıcısı | `.shell-extras` CSS'i `app.css`'ten çıkar |

### 6.3 Sadeleşmeden bilinçli sapma: tema butonu

Tema döngüsü (`cycleTheme` → `localStorage` + `data-theme`) **kalır**, `utility` slotunda ikon buton olarak. Gerekçe: uygulamada tema değiştirmenin başka erişim noktası yok; düşürmek kullanıcıdan bir yeteneği geri dönüşsüz alır. `theme` state'i, `applyTheme` ve `localStorage` okuması `MarketplaceShell`'de olduğu gibi kalır.

---

## 7. Dosyalar

```
src/components/GlassSiteHeader/
├── GlassSiteHeader.tsx           — named export + props (Türkçe JSDoc)
├── GlassSiteHeader.module.css    — yalnız --lg-* token; raw px/hex yok
├── GlassSiteHeader.stories.tsx   — 'Bileşenler/Navigasyon/GlassSiteHeader', autodocs
├── GlassSiteHeader.test.tsx      — vitest + testing-library
├── rules.md                      — ComponentSablonu.mdx şablonu
└── index.ts                      — re-export
```

Ayrıca: `src/index.ts` export'u, `src/demo/ComponentCatalog.tsx` kaydı.

### 7.1 Story matrisi

`ComponentSablonu.mdx`'in zorunlu setine göre:

| Story | Bu componentte karşılığı |
|---|---|
| Default / Overview | Logo + 4 link + Üye girişi + İlan ver, tepe durumu |
| Playground (Controls) | Yalnız public API; `hover`/`focus`/`active` control değil |
| Variants / Materials | **Yok** — tek anatomi, `material`/`variant` ekseni açılmadı. Yerine **Scroll durumları**: rest ve condensed yan yana (kaydırılabilir kaplı decorator) |
| Sizes | **Uygun değil** — `size` ekseni yok |
| States | Aktif link · linksiz (sade) · `condensedAction`'lı ve'siz · mobil panel açık |
| Uzun içerik | Uzun TR link etiketleri ("Kurumsal Doğrulama" vb.) ve uzun wordmark ile taşma/truncation |
| Responsive | Dar container (container query eşiğinin altı → hamburger) + dokunmatik hedef boyutları |
| Temalar | Kağıt + Grafit (toolbar'la) |
| Erişilebilirlik | Focus sırası, `aria-expanded`/`aria-controls`/`aria-current`, `prefers-reduced-motion` |

Controls default'ları implementasyon default'larıyla birebir aynı olur (`menuLabel: 'Menü'`, `scrollThreshold: 24`).

### 7.2 Testler

| Test | Doğrulanan |
|---|---|
| Hamburger `aria-expanded` false→true→false | Disclosure sözleşmesi |
| Escape paneli kapatır, focus hamburger'a döner | Klavye çıkışı |
| Panel dışına `pointerdown` kapatır | Dış tık |
| Panelden link seçimi `onClick` çağırır + paneli kapatır | Gezinme |
| `active` link `aria-current="page"` taşır | Bulunulan sayfa |
| Scroll eşiği aşılınca kök `data-scrolled` yazar | Morf tetiği |
| `condensedAction` verilince scroll'da ikili aksiyonun yerini alır | Aksiyon çökmesi |
| `logo` ve `menuLabel` slot/etiketleri render edilir | Slot sözleşmesi |

`MarketplaceShell.test.tsx`'in mevcut üç testi (odaklı ilan akışı ×2, hesap eylemi ×1) yeni header'a göre güncellenir — `initialTime` prop'u kalkar, `#shell-account-action` id'si `secondaryAction`'a taşınır.

---

## 8. Doğrulama

`npx tsc -b` · `npm test` · `npm run lint` · `apps/web` kendi testleri. Storybook'ta yeni story'ler ve `apps/web` dev sunucusunda scroll morfu ile mobil panel gözle doğrulanır.
