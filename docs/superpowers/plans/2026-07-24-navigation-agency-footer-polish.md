# Navigasyon, Ofis Satırı ve Footer Uygulama Planı

> Bu plan, kullanıcının işaretlediği geometri ve içerik sorunlarını ortak
> Storybook bileşenlerinde çözer; değişiklikler ana sayfaya aynı kaynaktan
> yansır.

**Amaç:** Arama aksiyonunu optik olarak merkezlemek, Dock geometrisini sabit
tutmak, doğrulanmış ofis satırlarını simetrik yapmak ve ana sayfaya kapsamlı
bir footer kazandırmak.

**Mimari:** `@repo/ui` bileşenleri görsel ve erişilebilir davranışın tek
kaynağıdır. Uygulama katmanı yalnız ürün fixture'larını, gerçek route
bağlantılarını ve sayfa kompozisyonunu sağlar. Her değişiklik önce başarısız
testle tanımlanır.

**Teknoloji:** React 19, TanStack Start/Router, Vite, CSS Modules, Storybook,
Vitest, Testing Library ve Playwright.

---

## Görev 1: Arama düğmesi geometrisini testle tanımla

**Dosyalar:**

- Değiştir: `apps/web/e2e/home-concepts.spec.ts`
- Değiştir: `src/components/GlassAiSearchBar/GlassAiSearchBar.test.tsx`

**Adımlar:**

1. Gönder aksiyonunun `type="submit"` ve “Ara” adına sahip olduğunu koru.
2. Playwright'ta butonun kare olduğunu ve SVG/buton/arama kapsülü dikey
   merkezlerinin en fazla 0,5 piksel saptığını ölç.
3. Loading durumunda aynı geometriyi bekle.
4. Odak testini çalıştır ve mevcut oval/baseline yerleşimi nedeniyle kırmızı
   sonucu doğrula.

## Görev 2: Arama düğmesini kaynağında düzelt

**Dosyalar:**

- Değiştir: `src/components/GlassButton/GlassButton.module.css`
- Değiştir: `src/components/GlassAiSearchBar/GlassAiSearchBar.module.css`

**Adımlar:**

1. `GlassButton` etiket sarmalayıcısını block flex yap.
2. Search submit düğmesini kontrol tokenıyla karele ve yatay padding'i kaldır.
3. İç içerik sarmalayıcısını `line-height: 0` ile iki eksende merkezle.
4. Unit ve odak E2E testini yeşile getir.

## Görev 3: Sürekli açık Dock davranışını önce testle tanımla

**Dosyalar:**

- Değiştir: `src/components/GlassDock/GlassDock.test.tsx`
- Değiştir: `apps/web/e2e/shell.spec.ts`

**Adımlar:**

1. Varsayılan Dock'un doğrudan nav render etmesini bekle.
2. Legacy `group` verisine rağmen grup etiketlerinin görünmediğini doğrula.
3. public-site referansına göre hover hedefinin 1.5×, komşuların kademeli
   büyüdüğünü ve mouse leave sonrası taban ölçülere döndüğünü ölç.
4. Mouse dışarı çıktığında nav'ın görünür kaldığını doğrula.
5. Eski aç/kapa testlerini açıkça `behavior="morph"` ile sınırla.
6. Odak testlerini çalıştır ve eski grup etiketi/aç-kapa varsayımları
   nedeniyle kırmızı sonucu doğrula.

## Görev 4: Dock'u sürekli açık LiquidDock davranışına geçir

**Dosyalar:**

- Değiştir: `src/components/GlassDock/GlassDock.tsx`
- Değiştir: `src/components/GlassDock/GlassDock.module.css`
- Değiştir: `src/components/GlassDock/GlassDock.stories.tsx`
- Değiştir: `src/components/GlassDock/rules.md`
- Değiştir: `src/demo/ComponentCatalog.tsx`
- Değiştir: `apps/web/src/components/MarketplaceShell.tsx`

**Adımlar:**

1. `behavior?: 'fixed' | 'morph'` API'sini ekle; varsayılanı `fixed` yap.
2. Grup etiketi DOM'unu kaldır; public-site referansındaki cursor takipli
   büyütme/rAF hattını koru.
3. Aktif edge lens'i 38px taban ölçü, dinamik scale/merkez ve 6px blur ile
   koru.
4. Marketplace kabuğunu `fixed` davranışa geçir.
5. Default/Playground/Responsive story'lerini LiquidDock rayını gösterecek
   şekilde güncelle; legacy morph'u ayrı story'de koru.
6. Rules ve katalog açıklamasını yeni sözleşmeyle eşleştir.

## Görev 4A: Referans Dock hover geri bildirimi ve Header malzeme eşliği

**Dosyalar:**

- Değiştir: `src/components/GlassDock/GlassDock.tsx`
- Değiştir: `src/components/GlassDock/GlassDock.module.css`
- Değiştir: `src/components/GlassDock/GlassDock.test.tsx`
- Değiştir: `src/components/GlassDock/GlassDock.stories.tsx`
- Değiştir: `src/components/GlassDock/rules.md`
- Değiştir: `apps/web/e2e/shell.spec.ts`

**Adımlar:**

1. Unit testte Dock cam yüzeyinin Header ile aynı
   `blur(14px) saturate(180%)` filtresini bekle ve eski malzemede kırmızıyı
   doğrula.
2. E2E testte Header/Dock backdrop eşliğini, 1.5× hover büyütmesini, komşu
   etkisini ve mouse leave sonrası 1× dönüşü birlikte ölç.
3. Dock yüzeyini fallback tier, `thickness={0.55}` ve Header filtresine geçir.
4. public-site LiquidDock kaynağındaki 180px kosinüs etki alanını, dinamik
   scale/item merkezlerini ve hareketli edge lens'i taşı.
5. Reduced-motion bağlamında scale ve dinamik merkezleri 1× tabanda tut.
6. Storybook'a hover durumunu hazır açan bir etkileşim story'si ekle ve
   kuralları güncelle.

## Görev 5: Ofis doğrulama ve grid davranışını önce testle tanımla

**Dosyalar:**

- Değiştir: `src/components/GlassAgencyCard/GlassAgencyCard.test.tsx`
- Değiştir: `apps/web/e2e/home-concepts.spec.ts`

**Adımlar:**

1. `verifiedBy` kaynağıyla küçük doğrulama işareti ve bilgi düğmesi bekle.
2. Bilgi düğmesi hover/focus olduğunda kaynak tooltip'ini doğrula.
3. `verified=false` iken doğrulama kontrollerinin olmadığını test et.
4. Üç satırın `identity`, `stats`, `actions` kolon başlangıçlarını ölç.
5. 390 pikselde yatay taşma olmadığını koru.
6. Testleri çalıştır ve mevcut büyük badge/flex yerleşimi nedeniyle kırmızı
   sonucu doğrula.

## Görev 6: Simetrik ofis satırını uygula

**Dosyalar:**

- Değiştir: `src/components/GlassAgencyCard/GlassAgencyCard.tsx`
- Değiştir: `src/components/GlassAgencyCard/GlassAgencyCard.module.css`
- Değiştir: `src/components/GlassAgencyCard/GlassAgencyCard.stories.tsx`
- Değiştir: `src/components/GlassAgencyCard/rules.md`
- Değiştir: `apps/web/src/features/home-concepts/fixtures.ts`
- Değiştir: `apps/web/src/features/home-concepts/map-first/MapFirstHome.module.css`

**Adımlar:**

1. `verifiedBy` API'sini ve `GlassTooltip` tabanlı bilgi kontrolünü ekle.
2. Büyük `GlassBadge` kullanımını kaldır.
3. Inline kartı kimlik/metrik/aksiyon grid'ine dönüştür.
4. Container query ile masaüstü, tablet ve mobil akışlarını tanımla.
5. Sayfanın DOM sırasına bağlı mobil override'larını kaldır.
6. Fixture'lara `verifiedBy: 'arsam.net'` ekle.
7. Story/rules belgelerini kaynak ve erişilebilirlik davranışıyla güncelle.

## Görev 7: Kapsamlı footer'ı önce testle tanımla

**Dosyalar:**

- Oluştur: `apps/web/src/features/home-concepts/shared/HomeFooter.test.tsx`
- Değiştir: `src/components/GlassFooter/GlassFooter.test.tsx`
- Değiştir: `apps/web/e2e/home-concepts.spec.ts`

**Adımlar:**

1. Marka açıklaması ile dört footer başlığını bekle.
2. Tüm uygulama linklerinin gerçek `href`lerini doğrula.
3. `showConceptLink=false` iken konsept bağlantısının olmadığını test et.
4. Ana sayfada `main` sonrasında tek `contentinfo` landmark bekle.
5. 390 pikselde yatay taşma olmadığını doğrula.
6. Testleri çalıştır ve mevcut slim/nested footer nedeniyle kırmızı sonucu
   doğrula.

## Görev 8: Footer kompozisyonunu ve semantiğini uygula

**Dosyalar:**

- Değiştir: `apps/web/src/features/home-concepts/shared/HomeFooter.tsx`
- Oluştur: `apps/web/src/features/home-concepts/shared/HomeFooter.module.css`
- Değiştir: `apps/web/src/features/home-concepts/shared/HomeConceptFrame.tsx`
- Değiştir: `apps/web/src/features/home-concepts/**/*.tsx`
- Değiştir: `src/components/GlassFooter/GlassFooter.module.css`
- Değiştir: `src/components/GlassFooter/GlassFooter.stories.tsx`
- Değiştir: `src/components/GlassFooter/rules.md`

**Adımlar:**

1. Ürün linklerini gerçek route'larla dört grupta düzenle.
2. Marka anlatısı ve güven satırını ekle.
3. Slim için ayrı kısa link setini koru.
4. Frame'e footer slotu ekleyip footer'ı `main` sonrasına taşı.
5. Ana sayfayı `columns` varyantına geçir.
6. Footer'ı container query ile 4/2/1 kolon akışına getir.
7. Storybook'a arsam.net kapsamlı, responsive ve focus story'leri ekle.

## Görev 9: Görsel ve teknik doğrulama

**Adımlar:**

1. 1440×1000, 784×900 ve 390×844 boyutlarında ana sayfayı incele.
2. Açık/koyu temada arama, Dock, tooltip, ofis grid'i ve footer'ı kontrol et.
3. Hover öncesi/sonrası tüm geometri ölçümlerini tekrar çalıştır.
4. Axe ve yatay taşma kontrollerini çalıştır.
5. Tam doğrulama komutlarını çalıştır.

**Komutlar:**

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`

## Görev 10: Tarayıcı teslimi

1. `http://localhost:3000/` adresini uygulama içi tarayıcıda aç.
2. Tamamlanan bileşenleri ve doğrulama sonuçlarını kısa biçimde bildir.
