# Harita Odaklı Yoğun Ana Sayfa Uygulama Planı

> Bu plan, kullanıcının onayladığı Harita Keşfi yönünü gerçek ana sayfaya
> taşır ve mevcut Storybook Glass bileşenleriyle ilan yoğunluğunu artırır.

**Amaç:** `/` rotasında konum odaklı, simetrik ve yoğun bir arsa pazaryeri ana
sayfası sunmak.

**Mimari:** Mevcut `MapFirstHome`, hem konsept önizlemesini hem gerçek ana
sayfayı besleyen ortak sayfa bileşeni olarak kalır. Bir prop konsept
navigasyonunu kontrol eder. İlan verisi ortak fixture içinde genişletilir.

**Teknoloji:** React 19, TanStack Start/Router, Vite, CSS Modules, `@repo/ui`,
Playwright, Vitest.

---

## Görev 1: Ana sayfa davranışını testle tanımla

**Dosya:**

- Değiştir: `apps/web/e2e/home-concepts.spec.ts`

**Adımlar:**

1. `/` rotasında Harita Keşfi `h1` başlığını bekleyen test ekle.
2. Ana sayfada konsept navigasyonunun olmadığını doğrula.
3. Öne çıkan vitrinde 30, yeni ilan bölümünde 18 buton olduğunu doğrula.
4. İlk dört bölge hücresinin eşit genişlik ve yükseklikte olduğunu ölç.
5. AI arama gönder butonunun hover öncesi ve sonrası dış kutusunu karşılaştır.
6. 390 pikselde yatay taşma olmadığını doğrula.
7. Testi çalıştır ve mevcut placeholder nedeniyle kırmızı sonucu kaydet.

**Komut:**

`npx playwright test apps/web/e2e/home-concepts.spec.ts --grep "yoğun ana sayfa"`

## Görev 2: Örnek ilan fixture verisini genişlet

**Dosya:**

- Değiştir: `apps/web/src/features/home-concepts/fixtures.ts`

**Adımlar:**

1. Benzersiz il, ilçe, fiyat, alan ve başlık kombinasyonları tanımla.
2. Toplam 48 ilan üret.
3. İlk 5 ilanı öne çıkan olarak işaretle.
4. EİDS durumunu deterministik üret.
5. Kart ve vitrin fixture çıktılarını mevcut prop sözleşmeleriyle koru.

## Görev 3: Harita sayfasını yoğun pazaryeri kompozisyonuna dönüştür

**Dosyalar:**

- Değiştir: `apps/web/src/features/home-concepts/map-first/MapFirstHome.tsx`
- Değiştir: `apps/web/src/features/home-concepts/map-first/MapFirstHome.module.css`
- Değiştir: `apps/web/src/features/home-concepts/shared/HomeConceptFrame.module.css`

**Adımlar:**

1. `showConceptNavigation` propunu sayfa bileşenine ekle.
2. Hero haritasını ve dikey boşlukları kompaktlaştır.
3. `GlassVitrin banded` ile hero'nun hemen altında 30 ilan göster.
4. Bölge sayısını 8'e çıkar ve 4/2/2 responsive grid uygula.
5. `GlassMetricStrip` ile örnek pazar özeti ekle.
6. `GlassVitrin list` ile kalan 18 ilanı göster.
7. Karşılaştırma bandı ve 3 doğrulanmış ofisi koru.
8. Footer'ı `slim` varyantına geçir.
9. Sayfa kapsamındaki butonlarda hover dış geometrisini sabitle.

## Görev 4: Ana sayfa rotasını ve indeksleme durumunu güncelle

**Dosyalar:**

- Değiştir: `apps/web/src/routes/index.tsx`
- Değiştir: `apps/web/src/config/routes.ts`
- Değiştir: `apps/web/src/routes/__root.tsx`

**Adımlar:**

1. Placeholder yerine `MapFirstHome showConceptNavigation={false}` render et.
2. `home.indexable` değerini `true` yap.
3. Genel root seviyesindeki robots meta etiketini kaldır.
4. Konsept ve placeholder rotalarının kendi noindex meta etiketlerini koru.

## Görev 5: Görsel ve teknik doğrulama

**Dosya:**

- Gerekirse değiştir: `apps/web/src/features/home-concepts/map-first/MapFirstHome.module.css`

**Adımlar:**

1. 1440x1000, 784x539 ve 390x844 ekranları görsel olarak incele.
2. Açık ve koyu temayı kontrol et.
3. Hover geometrisi ve yatay taşmayı tekrar ölç.
4. Axe taramasını çalıştır.
5. Görünür metinleri dil ve karakter kontrolünden geçir.
6. Tüm doğrulama komutlarını çalıştır.

**Komutlar:**

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`

## Görev 6: Tarayıcı teslimi

1. `http://localhost:3000/` adresini uygulama içi tarayıcıda aç.
2. Kullanıcıya tamamlanan sayfayı ve doğrulama sonuçlarını kısa biçimde bildir.
