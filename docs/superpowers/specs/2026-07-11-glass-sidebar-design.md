# Glass Sidebar Ailesi — Tasarım Dokümanı

**Tarih:** 2026-07-11
**Referanslar:** Apple HIG — Sidebars (https://developer.apple.com/design/human-interface-guidelines/sidebars), visionOS Music ekran görüntüsü (`visionos-sidebar-music@2x.png`)

## Amaç

visionOS Music uygulamasındaki kompozisyonun web karşılığını liquid-glass-ui kütüphanesine eklemek: solda dikey tab bar ornament'ı, cam sidebar paneli ve yanında açılan içerik alanı. Üç bağımsız, tek başına kullanılabilir bileşen + bunları birleştiren bir demo sahnesi.

## Kapsam

- `GlassTabBar` — dikey, kapsül biçimli tab bar ornament'ı
- `GlassSidebar` — composable sidebar paneli (Header / Item / Group)
- `GlassSplitView` — sidebar + içerik yerleşimini, gizle/gösteri ve içerik geçişini yöneten kabuk
- ComponentCatalog'a "Music" demo sahnesi
- Kapsam dışı: sağ/alt kenar yerleşimi, sürükleyerek yeniden boyutlandırma, sidebar içeriğinin kullanıcı tarafından özelleştirilmesi (HIG önerir ama v1'e girmez)

## API

### GlassTabBar

```tsx
<GlassTabBar selected={tab} onSelect={setTab} tone="auto">
  <GlassTabBar.Item id="play" icon={<PlayIcon />} label="Şimdi Çal" />
  <GlassTabBar.Item id="library" icon={<MusicIcon />} label="Kitaplık" />
</GlassTabBar>
```

- Kapsül `GlassSurface`, ikonlar dikey dizilir; ikonlar 44×44 dokunma hedefi.
- Hover genişlemesi: bara `pointerenter` olunca kapsül genişler, etiketler ikonların yanında fade+slide ile belirir. `prefers-reduced-motion`'da anında geçiş.
- Seçili ikonun arkasında dairesel highlight; seçim değişince highlight motion `layoutId` ile yeni ikona süzülür.
- Erişilebilirlik: `role="tablist"` / `role="tab"` + `aria-selected`; yukarı/aşağı ok tuşlarıyla gezinme.

### GlassSidebar

```tsx
<GlassSidebar selected={sel} onSelect={setSel} tone="auto">
  <GlassSidebar.Header title="Library" subtitle="All Music" action={<GlassButton … />} />
  <GlassSidebar.Item id="recent" icon={<ClockIcon />}>Recently Added</GlassSidebar.Item>
  <GlassSidebar.Group label="Playlists" defaultOpen>
    <GlassSidebar.Item id="all" icon={<GridIcon />}>All Playlists</GlassSidebar.Item>
  </GlassSidebar.Group>
</GlassSidebar>
```

- `selected`/`onSelect` bir SidebarContext ile alt öğelere iner; `Item` tıklanınca `onSelect(id)` çağrılır.
- Seçim highlight'ı: seçili satırın arkasındaki yuvarlatılmış kapsül, seçim değişince `layoutId` ile satırlar arasında kayar.
- `Group`: başlık + dönen chevron; içerik yüksekliği spring ile açılır/kapanır; `defaultOpen` desteklenir; `aria-expanded` güncellenir.
- HIG gereği en fazla iki seviye: `Group` içinde `Group` desteklenmez, dev modda `console.warn`.
- Satır yüksekliği 44px, ikon + etiket düzeni; `Header` büyük kalın başlık + soluk alt başlık + opsiyonel sağ aksiyon.

### GlassSplitView

```tsx
<GlassSplitView
  sidebar={<GlassSidebar … />}
  sidebarOpen={open}
  onSidebarOpenChange={setOpen}
  contentKey={sel}
>
  {içerik}
</GlassSplitView>
```

- Sidebar solda, içerik kalan alanı doldurur.
- Gizle/göster: `sidebarOpen` false olunca sidebar genişliği spring ile 0'a iner ve içerik genişler. Kontrollü (`sidebarOpen`/`onSidebarOpenChange`) ve kontrolsüz (`defaultOpen`) mod.
- İçerik geçişi: `contentKey` değişince içerik kısa crossfade + hafif yukarı kayma ile güncellenir.
- Background extension hissi: içerik alanı kabuğun tam genişliğinde render edilir (full-bleed); sidebar `position: absolute` ile içeriğin üstünde yüzer. Ana içerik gizlenmesin diye içerik alanına `sidebar genişliği + boşluk` kadar sol padding verilir; böylece arka plan ve yatay kaydırılan içerik sidebar'ın altından görünür (HIG background extension).

## Görsel dil

- Sidebar: `variant="regular"`, `thickness≈0.5`, köşe yarıçapı ~24px.
- Tab bar: kapsül; seçili ikon arka planı daha açık ton.
- Highlight kapsülü: yarı saydam beyaz, `tone`'a göre; satır içeriğinin arkasında ayrı katman.
- Renk/ton: mevcut `tone: light/dark/auto` üçlüsü aynen kullanılır.

## Motion

- Tümü `motion/react` ile. `src/motion/presets.ts`'e yeni `sidebar` spring'i eklenir (yumuşak, yüksek damping — panel genişliği ve disclosure için); seçim highlight'ı mevcut `press` spring'ini kullanır.
- `prefers-reduced-motion`: genişlik/yükseklik animasyonları kapanır, yalnızca opacity geçişleri kalır.

## Tier davranışı

Sidebar ve tab bar `GlassSurface` üzerinden render edilir; `refraction`/`blur` tier ayrımı otomatik gelir, yeni tier kodu yazılmaz. Sidebar büyük bir yüzey olduğu için displacement map maliyeti demo'da FPS ile doğrulanır.

## Dosya düzeni

```
src/components/GlassTabBar/    → GlassTabBar.tsx, .module.css, .stories.tsx, .test.tsx, index.ts
src/components/GlassSidebar/   → GlassSidebar.tsx (Header/Item/Group dahil), SidebarContext.tsx, .module.css, .stories.tsx, .test.tsx, index.ts
src/components/GlassSplitView/ → GlassSplitView.tsx, .module.css, .stories.tsx, .test.tsx, index.ts
src/index.ts                   → üç bileşen + tip export'ları
```

## Demo

`ComponentCatalog`'a "Music" sahnesi: arka planda sıcak tonlu CSS gradyanı (yeni görsel asset eklenmez), solda `GlassTabBar`, `Library` sidebar'ı (Recently Added / Artists / Albums / Songs / Made For You + Playlists grubu: All Playlists, Good Vibes Only, Indie Anthems, Family Dance Party), içerikte "Playlists" başlığı, arama kapsülü ve placeholder grid kartları. Storybook story'leri her bileşen için izole durumlar içerir: hover genişlemesi, disclosure, gizle/göster, seçim geçişi.

## Test planı

Mevcut vitest + @testing-library kalıbı:

- `GlassSidebar`: tıklama `onSelect` çağırır; highlight seçili öğede; Group aç/kapa `aria-expanded` günceller; iç içe Group dev uyarısı; `selected` hiçbir Item'a uymuyorsa highlight gizlenir (crash yok).
- `GlassTabBar`: ok tuşu navigasyonu; `aria-selected`; hover'da etiketler görünür.
- `GlassSplitView`: kontrollü `sidebarOpen`; `contentKey` değişiminde içerik yenilenir; kontrolsüz mod `defaultOpen` ile çalışır.

## Hata durumları

- `GlassSidebar.Item` / `Group`, `GlassSidebar` dışında kullanılırsa anlamlı hata fırlatılır.
- `selected` bilinmeyen bir id ise highlight çizilmez, bileşen normal render olur.
