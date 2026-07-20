# Codex varyant sistemi kuralları

## Amaç ve sınır

`src/variants/codex` mevcut `Glass*` componentlerini değiştirmeden enterprise tasarım sistemi ve
ürün varyantlarını yan yana incelemek için ayrılmış namespace'tir. Codex dosyaları mevcut component
adlarını, story başlıklarını veya global `--lg-*` tokenlarını yeniden tanımlamaz.
Seçilen yön üretime taşınana kadar tüm stiller `CodexTheme` kapsamı içinde kalır.

## Tema sözleşmesi

- Kök her zaman `data-design-system="codex"` ve
  `data-codex-theme="paper|mineral|graphite"` taşır.
- `paper` önerilen açık ürün zemini, `mineral` daha seçkisel açık yön,
  `graphite` yoğun profesyonel çalışma yönüdür.
- `canvas="inline|padded|full"` yalnız yerleşim alanını değiştirir; semantik veya
  renk anlamını değiştirmez.
- Tema attribute'u `body`/`html` üzerine yazılmaz. Birden fazla tema aynı story'de
  birbirini etkilemeden render edilebilmelidir.

## Geometri ve görsel hiyerarşi

- Kart ve panel radius'u 12–16px aralığındadır; 32px ve üzeri yüzey radius'u yoktur.
- Pill yalnız gerçek filtre olan chip'te kullanılır. Badge soft-square; button,
  input, select ve içerik kartları kontrollü radius ile kalır.
- Aynı yüzey dekorasyon amacıyla hem 1px border hem geniş yumuşak gölge kullanmaz.
  `outlined`, `tonal`, `elevated` ve `glass` treatment'ları bu nedenle ayrıdır.
- Glass geçici chrome veya medya üstü işlev katmanına ayrılır; ana içerik kartı ve
  form zemini okunabilir, düz yüzey olarak kalır.

## Kontrol state sözlüğü

- Her etkileşimli kontrol native HTML tabanını korur: `button`, `input`, `select`.
- Ana hedef yüksekliği en az 44px'tir; `sm` yalnız yoğun toolbar bağlamında ve
  coarse pointer altında büyüyerek kullanılabilir.
- Button `loading` iken `disabled`, `aria-busy="true"` ve `data-loading` taşır;
  görünen etiket kaybolmaz ve ikinci kez aktive edilemez.
- Icon button zorunlu bir `label` alır. İkon dekoratiftir (`aria-hidden`); toggle
  kullanımında `pressed` hem `aria-pressed` hem `data-pressed` üretir.
- Chip seçimi ve kaldırma iki ayrı, iç içe olmayan button'dır. Seçim
  `aria-pressed`, disabled state native `disabled` ile duyurulur.
- Field label/control, açıklama ve hata kimliklerini bağlar. Hata varsa kontrol
  `aria-invalid="true"`, hata metni `role="alert"` ve tüm açıklamalar birleşik
  `aria-describedby` taşır.
- Checkbox mixed state'i hem DOM `indeterminate` property’si hem
  `aria-checked="mixed"` ile ifade eder. Anında uygulanan boolean ayarlar
  `role="switch"`, form gönderiminde uygulanan seçimler checkbox kullanır.
- Tabs `tablist/tab/tabpanel` ilişkisini, roving `tabIndex` modelini ve
  ArrowLeft/ArrowRight/Home/End klavye davranışını korur; disabled tab atlanır.

## İçerik componentleri

- `CodexSurface as` ile istenen `section/article/aside/div` semantiğini korur.
- Listing card bir `article`dır; callback verilen açma ve favori toggle aksiyonları
  ayrı erişilebilir adlara sahiptir. Callback yoksa false affordance üretmeden
  statik başlık ve favorisiz medya gösterir. Görsel yoksa temsili medya
  `role="img"` ve açık bir label taşır.
- Header bir skip link, adlandırılmış ana navigasyon ve aktif linkte
  `aria-current="page"` sunar.
- Notice bilgi durumlarında `status`, acil/hata durumunda `alert` kullanır.
- Filter panel adlandırılmış `aside`/complementary landmark'tır. Empty state yalnız
  “boş” demez; sonraki adımı açıklayan bir aksiyon sunar.
- Durum yalnız renkle iletilmez: görünür ikon/metin ve yardımcı teknolojiye açık
  yön ifadesi ikinci kanal olarak bulunur; `data-*` tek başına erişilebilirlik
  kanalı sayılmaz.

## Storybook ve test kabulü

- Codex story'leri `Codex Enterprise/*` altında kalır; mevcut story'ler silinmez.
- Mobil story'lerde Storybook 10 sözleşmesi kullanılır:
  `globals: { viewport: 'mobile1' }`; kaldırılmış
  `parameters.viewport.defaultViewport` eklenmez.
- Otomatik testler semantik HTML, accessible name, loading/invalid,
  pressed/selected, keyboard focus ve tema data attribute'larını doğrular.
- jsdom CSS görünümünü doğrulamaz. Radius, kontrast, responsive kırılım ve görsel
  hiyerarşi statik Storybook build + sabit Chromium viewport screenshot'ıyla ayrıca
  incelenir.

## Güvenli doğrulama

```bash
npm test
npx tsc -p tsconfig.app.json --noEmit --pretty false
npx oxlint src/variants/codex src/components/GlassSidebar/GlassSidebar.stories.tsx
npm run build-storybook
```
