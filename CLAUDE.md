# liquid-glass-ui

Apple Liquid Glass tasarım dilinin React karşılığı — Storybook üzerinde geliştirilen component kütüphanesi. Dil: Türkçe (kod tanımlayıcıları İngilizce).

## Tasarım sistemi = bağlayıcı kural

Tasarım sistemi `src/design/*.mdx` dokümanlarında tanımlıdır ve **her component işinde uyulması zorunludur**:

- `src/design/GenelBakis.mdx` — token/seçenek/state ayrımı, katman modeli (cam yalnız navigasyon/kontrol katmanı, sayfa başına max 6 cam yüzey, cam üstüne cam yok), tema (Kağıt — tek tema, koyu tema yok), dosya yapısı.
- `src/design/Tokenlar.mdx` — tek kaynak `src/index.css` (`--lg-*`). Component CSS'inde raw px/hex **yasak** (token fallback'i hariç). Radius yalnız chip/media/card/capsule ölçeğinden; kontrol yükseklikleri `--lg-control-*`; dokunmatikte min 44px hedef.
- `src/design/EksenlerVeDurumlar.mdx` — birleşik variant yasak; eksenler: `material · tone · size · variant · thickness · tint · prominent`. hover/focus/active asla prop olmaz. Controlled deseni: `value` + `defaultValue` + `onXChange`.
- `src/design/ErisilebilirlikMotionResponsive.mdx` — focus halkası `outline: 2px solid var(--lg-accent)` yalnız `:focus-visible`; ikon-tek butonlarda `label` zorunlu; `prefers-reduced-motion`/`-transparency` desteği; animasyon yalnız transform/opacity/filter; breakpoint yerine `pointer: coarse` / `hover: hover` yetenek sorguları.
- `src/design/ComponentSablonu.mdx` — `rules.md` şablonu ve zorunlu Storybook story matrisi.

## Tek kaynak kuralı (guard'lı)

Kütüphanede karşılığı olan bir kontrol feature kodunda **yeniden çizilmez**;
token'da tanımlı bir renk **ham değerle tekrar yazılmaz**. İki sapma tekrar
tekrar geri geldiği için artık test koruyor — `src/design/tasarim-guardlari.test.ts`
kod tabanını tarar ve `npm test` ile kırılır:

- Native `<input type="checkbox">` yalnız `GlassCheckbox` içinde olabilir.
  Onay kutusu her yerde `GlassCheckbox`tır (filtre paneli, formlar, onaylar).
- Dolu eylem zemini `--lg-action-prominent` (+ `-label`, `-hover`) token'ından
  gelir; buton/CTA seçicisine `background: var(--lg-accent)` yazılmaz — kabuktaki
  "İlan ver" ile sayfa içi eylemler aynı kahveyi paylaşır.

Bilinçli istisna gerekiyorsa testteki `IZINLI_*` listesine **gerekçesiyle**
eklenir; sessiz sapma yok. Aynı desende yeni bir tekrar fark edilirse guard
oraya da bir kural olarak yazılır.

## Component konvansiyonu

Her component klasörü şu seti içerir (eksiksiz):

```
src/components/GlassX/
├── GlassX.tsx          — named export + XProps interface'i (Türkçe JSDoc)
├── GlassX.module.css   — yalnız token tüketir
├── GlassX.stories.tsx  — title: 'Bileşenler/<Grup>/GlassX', autodocs, şablondaki story matrisi
│                         (gruplar: Eylemler · Form · Navigasyon · Katmanlar · Veri Gösterimi ·
│                          Medya ve Harita · Vitrin ve Yerleşim · AI · Pazar Yeri;
│                          sıra .storybook/preview.tsx storySort'ta)
├── GlassX.test.tsx     — vitest + testing-library
├── rules.md            — component sözleşmesi (şablon: ComponentSablonu.mdx)
└── index.ts            — re-export
```

Yeni component `src/index.ts`'e export edilir ve `src/demo/ComponentCatalog.tsx` kataloğuna eklenir.

## Komutlar

- `npm test` — vitest run
- `npx tsc -b` — typecheck (build'in parçası; tek başına hızlı doğrulama için)
- `npm run lint` — oxlint
- `npm run build` — tsc -b + storybook build
- `npm run dev` — Storybook (port 6006)

## Teknik notlar

- React 19, motion (`motion/react`), CSS Modules. Tier algılama `src/core/tier.ts` (büyük yüzeylerde refraction otomatik kapanır).
- Motion preset'leri `src/motion/presets.ts`; basınç etkileşimi `useGlassPress`.
- Overlay component'ler (Modal/Drawer/Toast) portal + focus trap + scroll kilidi + kapanışta tetikleyiciye focus dönüşü sözleşmesini paylaşır.
